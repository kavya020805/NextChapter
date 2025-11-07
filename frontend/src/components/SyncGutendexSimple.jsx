import React from 'react';
import { Link } from 'react-router-dom';

const SyncGutendexSimple = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Sync Books from Gutendex (Simple)</h1>
      <p>This component will sync books metadata to Supabase.</p>
      <Link to="/gallery-firebase">View Library</Link>
    </div>
  );
};

export default SyncGutendexSimple;

