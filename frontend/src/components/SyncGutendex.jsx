import React from 'react';
import { Link } from 'react-router-dom';

const SyncGutendex = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Sync Books from Gutendex</h1>
      <p>This component will sync books from Gutendex to Supabase.</p>
      <Link to="/gallery-firebase">View Library</Link>
    </div>
  );
};

export default SyncGutendex;

