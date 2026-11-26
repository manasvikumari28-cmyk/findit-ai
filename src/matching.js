const AI_API = `http://${window.location.hostname}:8000`;

export async function calculateAIMatches(lostItem, foundItems) {
  if (!foundItems || foundItems.length === 0) {
    return [];
  }

  try {
    const response = await fetch(`${AI_API}/match`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        lost_item: {
          id: String(lostItem.id),
          name: lostItem.name || "",
          category: lostItem.category || "",
          location: lostItem.location || "",
          description: lostItem.description || "",
        },
        found_items: foundItems.map((item) => ({
          id: String(item.id),
          name: item.name || "",
          category: item.category || "",
          location: item.location || "",
          description: item.description || "",
        })),
      }),
    });

    if (!response.ok) {
      throw new Error(`AI backend error: ${response.status}`);
    }

    const data = await response.json();
    return data.matches || [];
  } catch (error) {
    console.error("AI matching connection error:", error);
    throw error;
  }
}