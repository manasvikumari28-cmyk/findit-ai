from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from difflib import SequenceMatcher

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://.*:5173",
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Item(BaseModel):
    id: str
    name: str = ""
    category: str = ""
    location: str = ""
    description: str = ""

class MatchRequest(BaseModel):
    lost_item: Item
    found_items: List[Item]

def similarity(a, b):
    return SequenceMatcher(
        None,
        a.lower(),
        b.lower()
    ).ratio()

@app.post("/match")
def match_items(request: MatchRequest):

    lost = request.lost_item
    results = []

    for found in request.found_items:

        name_score = similarity(
            lost.name,
            found.name
        )

        category_score = (
            1.0 if lost.category.lower() == found.category.lower()
            else 0.0
        )

        description_score = similarity(
            lost.description,
            found.description
        )

        location_score = (
            1.0 if lost.location.lower() == found.location.lower()
            else 0.0
        )

        score = (
            name_score * 0.50 +
            category_score * 0.20 +
            description_score * 0.20 +
            location_score * 0.10
        )

        if score > 0:
            results.append({
                "id": found.id,
                "name": found.name,
                "category": found.category,
                "location": found.location,
                "date": "",
                "score": round(score * 100, 2)
            })

    results.sort(
        key=lambda x: x["score"],
        reverse=True
    )

    return {"matches": results}