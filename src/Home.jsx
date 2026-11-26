import React, { useState, useEffect } from "react";
import "./style.css";
import { supabase } from "./supabase";

function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  // FETCH ITEMS FROM SUPABASE
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("lost_items")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching items:", error.message);
        setError(error.message);
      } else {
        setItems(data || []);
      }

      setLoading(false);
    };

    fetchItems();
  }, []);

  // SEARCH AND FILTER ITEMS
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      (item.name || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (item.location || "")
        .toLowerCase()
        .includes(search.toLowerCase());

    const status = item.status || "Lost";

    const matchesTab =
      activeTab === "All" ||
      status.toLowerCase() === activeTab.toLowerCase();

    return matchesSearch && matchesTab;
  });

  return (
    <div className="findit-app">

      {/* HERO SECTION */}
      <section className="hero" id="home">
        <div className="hero-content">

          <div className="hero-label">
            <span className="live-dot"></span>
            SMART CAMPUS LOST & FOUND PLATFORM
          </div>

          <h1>
            Lost something?
            <br />
            <span>Find it with AI.</span>
          </h1>

          <p className="hero-description">
            Your lost belongings deserve a second chance.
            FindIt AI intelligently connects lost and found
            items, helping you reunite with what matters.
          </p>

          <div className="hero-buttons">
            <a href="/report" className="primary-btn">
              Report Lost Item →
            </a>

            <a href="/report" className="secondary-btn">
              Report Found Item
            </a>
          </div>

          <div className="hero-stats">
            <div>
              <h3>AI</h3>
              <p>Smart Matching</p>
            </div>

            <div>
              <h3>24/7</h3>
              <p>Always Available</p>
            </div>

            <div>
              <h3>1 Place</h3>
              <p>Every Lost Item</p>
            </div>
          </div>

        </div>

        <div className="hero-visual">

          <div className="hero-image-main">
            <img
              src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900"
              alt="Backpack"
            />
          </div>

          <div className="floating-card floating-top">
            <span className="floating-icon">✦</span>
            <div>
              <strong>AI Match Found!</strong>
              <small>Potential item match detected</small>
            </div>
          </div>

          <div className="floating-card floating-bottom">
            <div className="success-icon">✓</div>
            <div>
              <strong>Smart Discovery</strong>
              <small>Connecting lost belongings</small>
            </div>
          </div>

          <div className="visual-decoration"></div>

        </div>
      </section>

      {/* SEARCH SECTION */}
      <section className="search-section">

        <div className="search-heading">
          <div>
            <span className="section-tag">DISCOVER</span>
            <h2>Looking for something?</h2>
            <p>Search through recently reported items.</p>
          </div>
        </div>

        <div className="search-box">

          <span className="search-icon">⌕</span>

          <input
            type="text"
            placeholder="Search wallet, phone, backpack..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button
            onClick={() =>
              document.getElementById("items")?.scrollIntoView({
                behavior: "smooth"
              })
            }
          >
            Search Items
          </button>

        </div>
      </section>

      {/* ITEMS SECTION */}
      <section className="items-section" id="items">

        <div className="section-heading">

          <div>
            <span className="section-tag">RECENT UPDATES</span>
            <h2>Explore Items</h2>
            <p>Discover recently lost and found belongings.</p>
          </div>

          <div className="item-tabs">

            {["All", "Lost", "Found"].map((tab) => (
              <button
                key={tab}
                className={
                  activeTab === tab
                    ? "tab active-tab"
                    : "tab"
                }
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}

          </div>

        </div>

        {/* LOADING */}
        {loading && (
          <p className="no-results">
            Loading items...
          </p>
        )}

        {/* ERROR */}
        {!loading && error && (
          <p className="no-results">
            Could not load items: {error}
          </p>
        )}

        {/* ITEM CARDS */}
        {!loading && !error && (
          <div className="items-grid">

            {filteredItems.length > 0 ? (

              filteredItems.map((item) => (

                <div className="item-card" key={item.id}>

                  <div className="item-image">

                    <img
                      src={
                        item.image_url ||
                        item.image ||
                        "https://placehold.co/600x400?text=No+Image"
                      }
                      alt={item.name || "Reported item"}
                    />

                    <span
                      className={
                        item.status === "Lost"
                          ? "lost-badge"
                          : "found-badge"
                      }
                    >
                      {item.status || "Lost"}
                    </span>

                  </div>

                  <div className="item-details">

                    <span className="item-category">
                      {item.category || "Other"}
                    </span>

                    <h3>{item.name}</h3>

                    <p>⌖ {item.location || "Location unavailable"}</p>

                    <div className="item-footer">

                      <span>
                        {item.created_at
                          ? new Date(
                              item.created_at
                            ).toLocaleDateString()
                          : "Date unavailable"}
                      </span>

                      <a href="/lost">
                        View Details →
                      </a>

                    </div>

                  </div>

                </div>

              ))

            ) : (

              <p className="no-results">
                No matching items found.
              </p>

            )}

          </div>
        )}

        <div className="center-button">
          <a href="/lost" className="outline-btn">
            Explore All Items →
          </a>
        </div>

      </section>

      {/* AI MATCH SECTION */}
      <section className="match-section" id="matches">

        <div className="match-content">

          <span className="match-label">
            ✦ POWERED BY ARTIFICIAL INTELLIGENCE
          </span>

          <h2>
            Lost meets found.
            <br />
            <span>Magic happens.</span>
          </h2>

          <p>
            Our intelligent matching system compares item
            descriptions, categories and locations to discover
            potential connections.
          </p>

          <a href="/lost" className="match-button">
            Explore AI Matches →
          </a>

        </div>

        <div className="match-demo">

          <div className="match-card">

            <div className="match-card-header">
              <span>AI MATCH ANALYSIS</span>
              <span className="match-live">● DEMO</span>
            </div>

            <div className="comparison">

              <div className="comparison-item">

                <img
                  src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400"
                  alt="Lost wallet"
                />

                <span>LOST ITEM</span>
                <strong>Brown Wallet</strong>

              </div>

              <div className="match-symbol">⇄</div>

              <div className="comparison-item">

                <img
                  src="https://images.unsplash.com/photo-1627123424574-724758594e93?w=400"
                  alt="Found wallet"
                />

                <span>FOUND ITEM</span>
                <strong>Brown Wallet</strong>

              </div>

            </div>

            <div className="match-result">

              <div className="match-result-top">
                <span>Potential Match Score</span>
                <strong>96%</strong>
              </div>

              <div className="progress-track">
                <div className="progress-fill"></div>
              </div>

              <p>✓ Similar category</p>
              <p>✓ Similar colour and description</p>
              <p>✓ Matching reported location</p>

            </div>

            <div className="match-footer">
              <span>✦ FindIt AI Match Engine</span>
              <span>Illustrative preview</span>
            </div>

          </div>

        </div>

      </section>

      {/* HOW IT WORKS */}
      <section className="how-section" id="how">

        <div className="center-heading">

          <span className="section-tag">SIMPLE PROCESS</span>

          <h2>How FindIt AI works</h2>

          <p>
            Three simple steps to reconnect with your belongings.
          </p>

        </div>

        <div className="steps-grid">

          <div className="step-card">
            <div className="step-icon">↗</div>
            <span>01</span>
            <h3>Report an Item</h3>
            <p>
              Upload a picture and provide details about your
              lost or found item.
            </p>
          </div>

          <div className="step-card">
            <div className="step-icon">✦</div>
            <span>02</span>
            <h3>AI Finds Matches</h3>
            <p>
              Our matching engine checks descriptions,
              categories and locations.
            </p>
          </div>

          <div className="step-card">
            <div className="step-icon">♡</div>
            <span>03</span>
            <h3>Get Reunited</h3>
            <p>
              Review potential matches and connect to
              recover your belongings.
            </p>
          </div>

        </div>

      </section>

      {/* CALL TO ACTION */}
      <section className="cta-section">

        <div>
          <span>EVERY ITEM HAS A STORY</span>

          <h2>Let's bring lost things home.</h2>

          <p>
            Be part of a smarter and more connected campus community.
          </p>
        </div>

        <a href="/register" className="cta-button">
          Join FindIt AI →
        </a>

      </section>

    </div>
  );
}

export default Home;