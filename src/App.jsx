import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  NavLink,
  useNavigate
} from "react-router-dom";

import { useState, useEffect } from "react";

import "./App.css";
import "./style.css";

import { supabase } from "./supabase";

import SupabaseTest from "./SupabaseTest";
import ImageuploadTest from "./ImageUploadTest";

import { AuthProvider, useAuth } from "./AuthContext";

import ProtectedRoute from "./ProtectedRoute";
import Login from "./Login";
import Register from "./Register";
import Home from "./Home";

import { calculateAIMatches } from "./matching";
import Toast from "./Toast";

// NAVBAR
function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const success = await logout();

      if (success) {
        setMenuOpen(false);
        navigate("/login");
      }
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        FindIt <span>AI.</span>
      </Link>

      <button
        type="button"
        className="menu-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? "✕" : "☰"}
      </button>

      <div className={`nav-links ${menuOpen ? "active" : ""}`}>
        <NavLink
          to="/"
          end
          onClick={() => setMenuOpen(false)}
        >
          Home
        </NavLink>

        <Link
          to="/#about"
          onClick={() => setMenuOpen(false)}
        >
          About
        </Link>

        <NavLink
          to="/lost"
          onClick={() => setMenuOpen(false)}
        >
          Lost Items
        </NavLink>

        <NavLink
          to="/found"
          onClick={() => setMenuOpen(false)}
        >
          Found Items
        </NavLink>

        {user && (
          <NavLink
            to="/report"
            onClick={() => setMenuOpen(false)}
          >
            Report Item
          </NavLink>
        )}
      </div>

      {user ? (
        <button
          type="button"
          className="login-btn"
          onClick={handleLogout}
        >
          Logout
        </button>
      ) : (
        <Link to="/login" className="login-btn">
          Login
        </Link>
      )}
    </nav>
  );
}

// ITEM CARD
function ItemCard({ item }) {
  return (
    <article className="item-card">
      {item.image_url ? (
        <img
          src={item.image_url}
          alt={item.name}
          className="item-image"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <div className="item-icon">
          {item.icon || "📦"}
        </div>
      )}

      <div className="item-info">
        <span
          className={
            item.status === "Lost"
              ? "status lost"
              : "status found"
          }
        >
          {item.status}
        </span>

        <h3>{item.name}</h3>
        <p>Category: {item.category}</p>
        <p>Location: {item.location}</p>
        <p>Date: {item.date}</p>
      </div>
    </article>
  );
}

// LOST AND FOUND LISTING PAGE
function ListingPage({ status, showToast }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [dbItems, setDbItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [matches, setMatches] = useState([]);
  const [matching, setMatching] = useState(false);
  const [matchError, setMatchError] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      setError("");

      const table =
        status === "Found" ? "found_items" : "lost_items";

      const { data, error } = await supabase
        .from(table)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setDbItems(data || []);
      }

      setLoading(false);
    };

    fetchItems();
  }, [status]);

  // AI MATCHING
  const handleFindMatches = async (lostItem) => {
    setMatching(true);
    setMatchError("");
    setMatches([]);
    setSelectedItem(lostItem.id);

    try {
      const { data: foundItems, error } = await supabase
        .from("found_items")
        .select("*");

      if (error) throw error;

      if (!foundItems || foundItems.length === 0) {
        setMatchError("No found items available yet.");
        return;
      }

      const results = await calculateAIMatches(
        lostItem,
        foundItems
      );

      setMatches(results || []);

      if (!results || results.length === 0) {
        setMatchError("No similar items found.");
      } else {
        showToast("AI matches found! ✨");
      }

    } catch (error) {
      console.error("AI Matching Error:", error);
      setMatchError(error.message);
      showToast("AI matching failed!", "error");

    } finally {
      setMatching(false);
    }
  };

  const filteredItems = dbItems.filter((item) => {
    const matchesSearch =
      (item.name || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (item.location || "")
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesCategory =
      category === "All" || item.category === category;

    return matchesSearch && matchesCategory;
  });

  return (
    <main className="listing-page">
      <h1>{status} Items</h1>
      <p>Search and find items reported on campus.</p>

      <div className="filters">
        <input
          type="text"
          placeholder="Search by item name or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="All">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Books">Books</option>
          <option value="Accessories">Accessories</option>
          <option value="Others">Others</option>
        </select>
      </div>

      {loading && <p>Loading items...</p>}

      {error && (
        <p>Could not load items: {error}</p>
      )}

      {!loading && !error && filteredItems.length === 0 && (
        <p>No matching item found.</p>
      )}

      <div className="items-grid">
        {!loading &&
          !error &&
          filteredItems.map((item) => (
            <div key={item.id}>
              <ItemCard item={item} />

              {status === "Lost" && (
                <button
                  className="primary-btn"
                  onClick={() => handleFindMatches(item)}
                  disabled={matching}
                >
                  {matching && selectedItem === item.id
                    ? "Finding Matches..."
                    : "🤖 Find AI Matches"}
                </button>
              )}
            </div>
          ))}
      </div>

      {matchError && (
        <p className="match-message">{matchError}</p>
      )}

      {matches.length > 0 && (
        <section className="ai-matches">
          <h2>🤖 AI Suggested Matches</h2>

          {matches.map((match, index) => (
            <div className="item-card" key={match.id || index}>
              <h3>{match.name}</h3>
              <p>Category: {match.category}</p>
              <p>Location: {match.location}</p>
              <p>Date: {match.date}</p>

              <p>
                AI Match Score:{" "}
                {match.score ?? match.similarity ?? "N/A"}
              </p>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}

// REPORT PAGE
function ReportPage({ showToast }) {
  const [image, setImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    const report = {
      name: formData.get("name"),
      category: formData.get("category"),
      location: formData.get("location"),
      date: formData.get("date"),
      description: formData.get("description"),
      status: formData.get("status")
    };

    try {
      let imageUrl = null;

      // UPLOAD IMAGE
      if (selectedFile) {
        const safeName = selectedFile.name.replace(
          /[^a-zA-Z0-9._-]/g,
          "_"
        );

        const filePath = `${Date.now()}-${safeName}`;

        const { error: uploadError } = await supabase
          .storage
          .from("item-images")
          .upload(filePath, selectedFile, {
            contentType: selectedFile.type,
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase
          .storage
          .from("item-images")
          .getPublicUrl(filePath);

        imageUrl = urlData.publicUrl;
      }

      // SELECT TABLE
      const table =
        report.status === "Found"
          ? "found_items"
          : "lost_items";

      // SAVE TO SUPABASE
      const { error } = await supabase
        .from(table)
        .insert([
          {
            ...report,
            image_url: imageUrl
          }
        ]);

      if (error) throw error;

      // SUCCESS TOAST
      const successMessage =
        report.status === "Lost"
          ? "Lost item reported successfully! 🎉"
          : "Found item reported successfully! 🎉";

      showToast(successMessage);

      setMessage("");
      form.reset();
      setImage(null);
      setSelectedFile(null);

    } catch (error) {
      console.error("Registration error:", error);

      setMessage("Registration failed: " + error.message);
      showToast("Report failed: " + error.message, "error");

    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="report-page">
      <h1>Report a lost or found item</h1>
      <p>Tell us about the item you lost or found on campus.</p>

      <form className="report-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Item name"
          required
        />

        <select name="status" required defaultValue="Lost">
          <option value="Lost">I lost an item</option>
          <option value="Found">I found an item</option>
        </select>

        <select name="category" required defaultValue="">
          <option value="" disabled>Select category</option>
          <option>Electronics</option>
          <option>Books</option>
          <option>Accessories</option>
          <option>Others</option>
        </select>

        <input
          type="text"
          name="location"
          placeholder="Last seen location"
          required
        />

        <input
          type="date"
          name="date"
          required
        />

        <textarea
          name="description"
          placeholder="Describe your item..."
          required
        />

        <div className="form-group">
          <label>Upload Item Image</label>

          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            onChange={(e) => {
              const file = e.target.files[0];

              if (file) {
                if (file.size > 5 * 1024 * 1024) {
                  setMessage("Image must be smaller than 5 MB.");
                  e.target.value = "";
                  return;
                }

                setSelectedFile(file);
                setImage(URL.createObjectURL(file));
                setMessage("");
              }
            }}
          />

          {image && (
            <img
              src={image}
              alt="Item Preview"
              width="200"
              style={{
                display: "block",
                marginTop: "12px",
                borderRadius: "12px",
                objectFit: "cover"
              }}
            />
          )}
        </div>

        <button
          className="primary-btn"
          type="submit"
          disabled={loading}
        >
          {loading ? "Uploading..." : "Submit Report"}
        </button>

        {message && (
          <p role="status">{message}</p>
        )}
      </form>
    </main>
  );
}

// APP ROUTES
function AppRoutes({ showToast }) {
  return (
    <>
      {/* ONE NAVBAR FOR THE ENTIRE WEBSITE */}
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/register" element={<Register />} />

        <Route path="/login" element={<Login />} />

        <Route
          path="/report"
          element={
            <ProtectedRoute>
              <ReportPage showToast={showToast} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/lost"
          element={
            <ListingPage
              status="Lost"
              showToast={showToast}
            />
          }
        />

        <Route
          path="/found"
          element={
            <ListingPage
              status="Found"
              showToast={showToast}
            />
          }
        />

        <Route
          path="/supabase-test"
          element={<SupabaseTest />}
        />

        <Route
          path="/image-upload-test"
          element={<ImageuploadTest />}
        />
      </Routes>

      <footer className="footer">
        <h2>FindIt AI.</h2>
        <p>Lost less. Found more. Together.</p>
        <p>
          © 2026 FindIt AI | Campus Lost & Found
        </p>
      </footer>
    </>
  );
}

// MAIN APP
function App() {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({
      message,
      type,
      id: Date.now()
    });
  };

  const closeToast = () => {
    setToast(null);
  };

  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes showToast={showToast} />

        {toast && (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={closeToast}
          />
        )}
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;