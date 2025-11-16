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

  const hasBooks = books.length > 0;

  return (
    <section className="mt-6 space-y-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg md:text-xl font-semibold text-white dark:text-dark-gray">
            Recommended For You
          </h2>
          <p className="mt-1 text-xs md:text-sm text-white/60 dark:text-dark-gray/60">
            Tap the button to fetch fresh picks based on your recent reading activity.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchRecommendations}
          disabled={status === "loading"}
          className={`inline-flex items-center justify-center px-5 py-2 text-xs md:text-sm font-medium uppercase tracking-widest border transition-opacity duration-200
            ${
              status === "loading"
                ? "bg-white/5 dark:bg-dark-gray/5 text-white/50 dark:text-dark-gray/50 border-white/20 dark:border-dark-gray/30 cursor-not-allowed opacity-70"
                : "bg-white dark:bg-dark-gray text-dark-gray dark:text-white border-white dark:border-dark-gray hover:opacity-80"
            }`}
        >
          {status === "loading" ? "Fetching..." : hasBooks ? "Refresh Picks" : "Show Picks"}
        </button>
      </header>

      {error && (
        <p className="text-sm text-red-400 dark:text-red-500">
          {error || "Something went wrong. Please try again."}
        </p>
      )}

      {status === "idle" && !error && (
        <p className="text-sm text-white/60 dark:text-dark-gray/60">
          You haven't loaded any recommendations yet. Hit "Show Picks" to see what our system suggests for you.
        </p>
      )}

      {status === "loaded" && books.length === 0 && !error && (
        <p className="text-sm text-white/70 dark:text-dark-gray/70">
          No recommendations available right now. Try again after you explore a few more books.
        </p>
      )}

      {justification && hasBooks && (
        <p className="mt-2 text-sm italic text-white/80 dark:text-dark-gray/80 max-w-2xl">
          {justification}
        </p>
      )}

      {hasBooks && (
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <article
              key={book.book_id}
              className="flex flex-col gap-3 rounded-xl border border-white/10 dark:border-dark-gray/15 bg-white/5 dark:bg-dark-gray/5 backdrop-blur-sm p-4 md:p-5 shadow-sm shadow-black/20 dark:shadow-black/10 hover:border-white/25 dark:hover:border-dark-gray/25 transition-colors"
            >
              {book.cover_url ? (
                <div className="overflow-hidden rounded-lg border border-white/10 dark:border-dark-gray/20 shadow-md shadow-black/30">
                  <img
                    src={book.cover_url}
                    alt={book.title ?? "Book cover"}
                    className="w-full aspect-3/4 object-cover"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="w-full aspect-3/4 rounded-lg border border-white/10 dark:border-dark-gray/20 bg-white/5 dark:bg-dark-gray/20 flex items-center justify-center text-xs font-semibold uppercase tracking-[0.25em] text-white/70 dark:text-dark-gray/70">
                  No Cover
                </div>
              )}
              <div>
                <h3 className="text-sm md:text-base font-semibold text-white dark:text-dark-gray line-clamp-2">
                  {book.title ?? "Untitled"}
                </h3>
                {book.author && (
                  <p className="mt-1 text-xs md:text-sm text-white/70 dark:text-dark-gray/70 line-clamp-1">
                    {book.author}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

