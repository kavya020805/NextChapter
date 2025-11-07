import React from 'react';
import { Link } from 'react-router-dom';

const ReaderFirebase = () => {
  return (
    <div style={{ padding: '20px' }}>
      <Link to="/gallery-firebase">← Back to Library</Link>
      <h1>Reader Firebase</h1>
      <p>This component will be implemented with Firebase integration.</p>
    </div>
  );
};

export default ReaderFirebase;

