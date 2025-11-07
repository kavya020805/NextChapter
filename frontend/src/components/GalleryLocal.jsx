import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const GalleryLocal = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    setLoading(true);
    try {
      const response = await fetch('/books-data.json');
      if (!response.ok) {
        throw new Error('books-data.json not found');
      }
      
      const booksData = await response.json();
      setBooks(booksData);
    } catch (e) {
      console.error('Error loading books:', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = books.filter(book => 
    !searchTerm || 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <header>
        <h1>My Library (Local)</h1>
      </header>
      <div className="container">
        <div className="search">
          <input 
            type="search" 
            placeholder="Search your books..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button onClick={() => {}}>Search</button>
        </div>
        {loading ? (
          <div className="empty">Loading books...</div>
        ) : books.length === 0 ? (
          <div className="empty">
            No books found. Make sure books-data.json exists in the public folder.
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="empty">No books match your search.</div>
        ) : (
          <div className="grid" aria-live="polite">
            {filteredBooks.map((book) => (
              <Link 
                key={book.id} 
                to={`/reader-local?id=${encodeURIComponent(book.id)}`}
                className="card"
                title={book.title}
              >
                {book.coverUrl ? (
                  <img 
                    className="thumb"
                    src={book.coverUrl}
                    alt={book.title}
                    loading="lazy"
                  />
                ) : (
                  <div className="thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>
                    📚
                  </div>
                )}
                <div className="title">{book.title}</div>
                <div className="author">
                  {book.author || 'Unknown author'}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default GalleryLocal;

