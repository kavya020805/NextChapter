import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_AI_SUGGESTION_URL;

export default function RecommendedBooks({ userId }) {
  // Initialize state with a ref to track if we've loaded from localStorage
  const [books, setBooks] = useState(() => {
    if (!userId) return [];
    try {
      const saved = localStorage.getItem(`recommendations_${userId}`);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to parse saved recommendations:", e);
      return [];
    }
  });
  
  const [justification, setJustification] = useState(() => {
    if (!userId) return "";
    return localStorage.getItem(`recommendations_justification_${userId}`) || "";
  });
  
  const [status, setStatus] = useState(() => {
    if (!userId) return "idle";
    const saved = localStorage.getItem(`recommendations_${userId}`);
    return saved ? "loaded" : "idle";
  });
  
  const [error, setError] = useState(null);

  // Update state when userId changes (for user switching)
  useEffect(() => {
    if (userId) {
      const saved = localStorage.getItem(`recommendations_${userId}`);
      const savedJustification = localStorage.getItem(`recommendations_justification_${userId}`);
      
      if (saved) {
        try {
          const parsedBooks = JSON.parse(saved);
          setBooks(parsedBooks);
          setStatus("loaded");
          setJustification(savedJustification || "");
        } catch (e) {
          console.error("Failed to parse saved recommendations:", e);
        }
      } else {
        setBooks([]);
        setStatus("idle");
        setJustification("");
      }
    }
  }, [userId]);

  // Save to localStorage whenever books change
  useEffect(() => {
    if (userId && books.length > 0) {
      localStorage.setItem(`recommendations_${userId}`, JSON.stringify(books));
    }
  }, [books, userId]);

  useEffect(() => {
    if (userId && justification) {
      localStorage.setItem(`recommendations_justification_${userId}`, justification);
    }
  }, [justification, userId]);

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

  const hasBooks = books.length > 0;

  return (
    <section>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-white/60 dark:text-dark-gray/60 text-xs uppercase tracking-widest mb-2">
            {hasBooks ? `Showing ${books.length} personalized recommendations` : 'Smart Suggestions'}
          </p>
          {justification && hasBooks && (
            <p className="text-sm italic text-white/70 dark:text-dark-gray/70 max-w-2xl">
              {justification}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={fetchRecommendations}
          disabled={status === "loading"}
          className={`border-2 px-6 py-3 text-xs uppercase tracking-widest transition-opacity
            ${
              status === "loading"
                ? "bg-white/5 dark:bg-dark-gray/5 text-white/50 dark:text-dark-gray/50 border-white/20 dark:border-dark-gray/30 cursor-not-allowed opacity-70"
                : "bg-transparent text-white dark:text-dark-gray border-white dark:border-dark-gray hover:bg-white hover:text-dark-gray dark:hover:bg-dark-gray dark:hover:text-white"
            }`}
        >
          {status === "loading" ? "Fetching..." : hasBooks ? "Refresh Picks" : "Show Picks"}
        </button>
      </div>

      {error && (
        <div className="text-center py-20">
          <p className="text-xl text-red-400 dark:text-red-500">
            {error || "Something went wrong. Please try again."}
          </p>
        </div>
      )}

      {status === "idle" && !error && !hasBooks && (
        <div className="text-center py-20">
          <p className="text-xl text-white/60 dark:text-dark-gray/60">
            You haven't loaded any recommendations yet. Hit "Show Picks" to see what our system suggests for you.
          </p>
        </div>
      )}

      {status === "loading" && !hasBooks && (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-coral"></div>
          <p className="mt-4 text-white/60 dark:text-dark-gray/60">Loading recommendations...</p>
        </div>
      )}

      {status === "loaded" && books.length === 0 && !error && (
        <div className="text-center py-20">
          <p className="text-xl text-white/70 dark:text-dark-gray/70">
            No recommendations available right now. Try again after you explore a few more books.
          </p>
        </div>
      )}

      {hasBooks && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {books.map((book) => (
            <Link
              key={book.book_id}
              to={`/book/${encodeURIComponent(book.book_id)}`}
              className="group"
            >
              <div className="relative overflow-hidden border-2 border-white dark:border-dark-gray group hover:bg-white dark:hover:bg-dark-gray transition-colors">
                {book.cover_url ? (
                  <img
                    src={book.cover_url}
                    alt={book.title ?? "Book cover"}
                    className="w-full aspect-2/3 object-cover group-hover:opacity-20 transition-opacity duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full aspect-2/3 bg-white dark:bg-dark-gray flex items-center justify-center text-dark-gray dark:text-white text-6xl">
                    📚
                  </div>
                )}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <h3 className="text-dark-gray dark:text-white font-medium text-sm line-clamp-2 mb-2 uppercase tracking-widest">
                    {book.title ?? "Untitled"}
                  </h3>
                  <p className="text-dark-gray/70 dark:text-white/70 text-xs line-clamp-1 font-light uppercase tracking-widest">
                    {book.author || "Unknown Author"}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-white dark:text-dark-gray font-medium text-xs line-clamp-2 mb-2 uppercase tracking-widest">
                  {book.title ?? "Untitled"}
                </h3>
                <p className="text-white/60 dark:text-dark-gray/60 text-xs font-light uppercase tracking-widest">
                  {book.author || "Unknown Author"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
