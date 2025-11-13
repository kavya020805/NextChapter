import { useState } from "react";

const API_BASE_URL = import.meta?.env?.VITE_AI_SUGGESTION_URL ?? "http://127.0.0.1:8000";

export default function RecommendedBooks({ userId }) {
  const [books, setBooks] = useState([]);
  const [justification, setJustification] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  async function fetchRecommendations() {
    if (!userId) {
      setError("Missing user id");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setError(null);
    setJustification("");

    try {
      const response = await fetch(`${API_BASE_URL}/recommendations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: userId }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Unable to load recommendations");
      }

      const data = await response.json();
      setBooks(data?.books ?? []);
      setJustification(data?.justification ?? "");
      setStatus("loaded");
    } catch (err) {
      setStatus("error");
      setError(err.message);
    }
  }

  return (
    <section style={{ marginTop: "2rem" }}>
      <header style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <h2 style={{ margin: 0 }}>Recommended For You</h2>
        <button
          type="button"
          onClick={fetchRecommendations}
          disabled={status === "loading"}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "999px",
            border: "none",
            background: "#4f46e5",
            color: "#fff",
            cursor: status === "loading" ? "not-allowed" : "pointer",
          }}
        >
          {status === "loading" ? "Fetching..." : "Show Picks"}
        </button>
      </header>

      {error && (
        <p style={{ color: "#ef4444", marginTop: "0.75rem" }}>
          {error || "Something went wrong. Please try again."}
        </p>
      )}

      {status === "idle" && (
        <p style={{ marginTop: "0.75rem", color: "#4b5563" }}>
          Tap the button to fetch personalized picks powered by your reading history.
        </p>
      )}

      {status === "loaded" && books.length === 0 && (
        <p style={{ marginTop: "0.75rem" }}>No recommendations available right now.</p>
      )}

      {justification && books.length > 0 && (
        <p
          style={{
            marginTop: "1rem",
            fontStyle: "italic",
            color: "#1f2937",
            maxWidth: "60ch",
          }}
        >
          {justification}
        </p>
      )}

      {books.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
            gap: "1.5rem",
            marginTop: "1.5rem",
          }}
        >
          {books.map((book) => (
            <article
              key={book.book_id}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                borderRadius: "0.75rem",
                border: "1px solid rgba(79, 70, 229, 0.15)",
                padding: "1rem",
                background: "linear-gradient(135deg, rgba(79,70,229,0.08), rgba(14,165,233,0.08))",
              }}
            >
              {book.cover_url ? (
                <img
                  src={book.cover_url}
                  alt={book.title ?? "Book cover"}
                  style={{
                    width: "100%",
                    aspectRatio: "3 / 4",
                    objectFit: "cover",
                    borderRadius: "0.5rem",
                    boxShadow: "0 10px 25px rgba(79, 70, 229, 0.2)",
                  }}
                  loading="lazy"
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "3 / 4",
                    borderRadius: "0.5rem",
                    background: "rgba(79,70,229,0.15)",
                    display: "grid",
                    placeItems: "center",
                    color: "#312e81",
                    fontWeight: 600,
                  }}
                >
                  No Cover
                </div>
              )}
              <div>
                <h3 style={{ margin: 0, fontSize: "1rem", color: "#1f2937" }}>
                  {book.title ?? "Untitled"}
                </h3>
                {book.author && (
                  <p style={{ margin: "0.5rem 0 0", color: "#4b5563" }}>{book.author}</p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

