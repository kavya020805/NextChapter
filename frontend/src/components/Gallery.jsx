import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Gallery = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    loadBooks();
  }, [page, searchTerm]);

  const buildUrl = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    params.set('page', page);
    return `https://gutendex.com/books/?${params.toString()}`;
  };

  const loadBooks = async () => {
    setLoading(true);
    try {
      const res = await fetch(buildUrl());
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();
      
      setBooks(data.results || []);
      setHasNext(!!data.next);
      setHasPrev(!!data.previous);
      setCount(data.count || 0);
    } catch (e) {
      console.error('Failed to load books:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadBooks();
  };

  return (
    <>
      <header>
        <h1>Gutendex Books</h1>
        <div className="pager">
          <button 
            className="pill" 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={!hasPrev}
          >
            Prev
          </button>
          <span className="pill">Page {page}</span>
          <button 
            className="pill" 
            onClick={() => setPage(p => p + 1)}
            disabled={!hasNext}
          >
            Next
          </button>
        </div>
      </header>
      <div className="container">
        <div className="search">
          <input 
            type="search" 
            placeholder="Search books, authors, subjects…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch}>Search</button>
        </div>
        {loading ? (
          <div className="empty">Loading…</div>
        ) : books.length === 0 ? (
          <div className="empty">No results</div>
        ) : (
          <div className="grid" aria-live="polite">
            {books.map((book) => (
              <Link 
                key={book.id} 
                to={`/reader?id=${encodeURIComponent(book.id)}`}
                className="card"
                title={book.title}
              >
                <img 
                  className="thumb"
                  src={book.formats['image/jpeg'] || book.formats['image/png'] || ''}
                  alt={book.title}
                  loading="lazy"
                />
                <div className="title">{book.title}</div>
                <div className="author">
                  {book.authors?.[0]?.name || 'Unknown author'}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Gallery;

