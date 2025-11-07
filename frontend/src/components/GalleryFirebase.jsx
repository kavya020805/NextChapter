import React from 'react';
import { Link } from 'react-router-dom';

const GalleryFirebase = () => {
  return (
    <>
      <header>
        <h1>My Library</h1>
        <Link to="/admin" style={{ textDecoration: 'none', color: 'white', padding: '10px 14px', borderRadius: '10px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', fontWeight: 600 }}>
          + Upload Book
        </Link>
      </header>
      <div className="container">
        <div className="empty">Firebase Gallery - To be implemented</div>
      </div>
    </>
  );
};

export default GalleryFirebase;

