import { useState, useEffect } from "react"

const API_BASE_URL = import.meta?.env?.VITE_AI_SUGGESTION_URL ?? "http://127.0.0.1:8000"

export default function ExploreBooks({ userId }) {
  const [books, setBooks] = useState([])
  const [status, setStatus] = useState("idle")
  const [error, setError] = useState(null)

  useEffect(() => {
    let isActive = true

    const fetchExploreBooks = async () => {
      if (!userId) {
        setError("Missing user id")
        setStatus("error")
        return
      }

      setStatus("loading")
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
          setBooks(data?.books ?? [])
          setStatus("loaded")
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
    <section className="mt-6 space-y-4">
      <header className="flex flex-col gap-3">
        <div>
          <h2 className="text-lg md:text-xl font-semibold text-white dark:text-dark-gray">
            Explore Something New
          </h2>
          
        </div>
      </header>

      {error && (
        <p className="text-sm text-red-400 dark:text-red-500">
          {error || "Something went wrong. Please try again."}
        </p>
      )}

      {status === "idle" && !error && (
        <p className="text-sm text-white/60 dark:text-dark-gray/60">
          Gathering fresh titles for you...
        </p>
      )}

      {status === "loaded" && books.length === 0 && !error && (
        <p className="text-sm text-white/70 dark:text-dark-gray/70">
          Nothing to explore right now. Check back after you complete a few more books.
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
  )
}
