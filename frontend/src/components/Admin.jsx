import React from 'react';
import { Link } from 'react-router-dom';

const Admin = () => {
  return (
    <div style={{ padding: '20px' }}>
      <Link to="/gallery">← Back to Gallery</Link>
      <h1>Admin - Upload Books</h1>
      <p>This component will be implemented for book uploads.</p>
    </div>
  );
};

export default Admin;

