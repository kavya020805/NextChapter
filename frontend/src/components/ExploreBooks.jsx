import { useState, useEffect } from "react"
import { Link } from "react-router-dom"

const API_BASE_URL = import.meta.env.VITE_AI_SUGGESTION_URL

export default function ExploreBooks({ userId }) {
  // Initialize state from localStorage to prevent loading flash
  const [books, setBooks] = useState(() => {
    if (!userId) return [];
    try {
      const saved = localStorage.getItem(`explore_${userId}`);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to parse saved explore books:", e);
      return [];
    }
  });
  
  const [status, setStatus] = useState(() => {
    if (!userId) return "idle";
    const saved = localStorage.getItem(`explore_${userId}`);
    return saved ? "loaded" : "loading";
  });
  
  const [error, setError] = useState(null);

  useEffect(() => {
    let isActive = true

    const fetchExploreBooks = async () => {
      if (!userId) {
        setError("Missing user id")
        setStatus("error")
        return
      }

      // Only show loading if we don't have cached data
      const cached = localStorage.getItem(`explore_${userId}`);
      if (!cached) {
        setStatus("loading")
      }
      setError(null)

      const requestQueue = [
        {
          url: `${API_BASE_URL}/explore/${encodeURIComponent(userId)}`,
          options: { method: "GET" }
        },
        {
          url: `${API_BASE_URL}/explore`,
          options: {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: userId })
          }
        }
      ]

      let lastError = null

      for (const request of requestQueue) {
        try {
          const response = await fetch(request.url, request.options)

          if (response.status === 404) {
            if (!isActive) return
            setBooks([])
            setStatus("loaded")
            setError(null)
            return
          }

          if (!response.ok) {
            const message = await response.text()
            throw new Error(message || "Unable to load explore picks")
          }

          const data = await response.json()
          if (!isActive) return
          const newBooks = data?.books ?? [];
          setBooks(newBooks)
          setStatus("loaded")
          // Save to localStorage
          if (newBooks.length > 0) {
            localStorage.setItem(`explore_${userId}`, JSON.stringify(newBooks));
          }
          return
        } catch (err) {
          lastError = err
        }
      }

      if (!isActive) return
      setStatus("error")
      setError(lastError?.message || "Unable to load explore picks")
    }

    fetchExploreBooks()

    return () => {
      isActive = false
    }
  }, [userId])

  const hasBooks = books.length > 0

  return (
    <section>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <p className="text-white/60 dark:text-dark-gray/60 text-xs uppercase tracking-widest">
          {hasBooks ? `Showing ${books.length} books to explore` : 'Discover New Books'}
        </p>
      </div>

      {error && (
        <div className="text-center py-20">
          <p className="text-xl text-red-400 dark:text-red-500">
            {error || "Something went wrong. Please try again."}
          </p>
        </div>
      )}

      {status === "loading" && !hasBooks && (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-coral"></div>
          <p className="mt-4 text-white/60 dark:text-dark-gray/60">Loading books...</p>
        </div>
      )}

      {status === "loaded" && books.length === 0 && !error && (
        <div className="text-center py-20">
          <p className="text-xl text-white/70 dark:text-dark-gray/70">
            Nothing to explore right now. Check back after you complete a few more books.
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
  )
}
