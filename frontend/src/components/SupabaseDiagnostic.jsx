import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

// Diagnostic component to test Supabase connection
// Add this to any page temporarily to test connection

export default function SupabaseDiagnostic() {
  const [results, setResults] = useState(null);
  const [testing, setTesting] = useState(false);

  const runDiagnostics = async () => {
    setTesting(true);
    const diagnostics = {
      timestamp: new Date().toISOString(),
      tests: []
    };

    // Test 1: Check environment variables
    diagnostics.tests.push({
      name: 'Environment Variables',
      status: import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY ? 'PASS' : 'FAIL',
      details: {
        hasUrl: !!import.meta.env.VITE_SUPABASE_URL,
        hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
        url: import.meta.env.VITE_SUPABASE_URL ? `${import.meta.env.VITE_SUPABASE_URL.substring(0, 30)}...` : 'MISSING'
      }
    });

    // Test 2: Check Supabase client
    diagnostics.tests.push({
      name: 'Supabase Client',
      status: supabase ? 'PASS' : 'FAIL',
      details: { initialized: !!supabase }
    });

    // Test 3: Test connection with simple query
    try {
      const startTime = Date.now();
      const { data, error, count } = await supabase
        .from('books')
        .select('id', { count: 'exact', head: true });
      
      const duration = Date.now() - startTime;

      diagnostics.tests.push({
        name: 'Database Connection',
        status: error ? 'FAIL' : 'PASS',
        details: {
          duration: `${duration}ms`,
          bookCount: count,
          error: error ? error.message : null
        }
      });
    } catch (err) {
      diagnostics.tests.push({
        name: 'Database Connection',
        status: 'FAIL',
        details: { error: err.message }
      });
    }

    // Test 4: Try to fetch one book
    try {
      const startTime = Date.now();
      const { data, error } = await supabase
        .from('books')
        .select('id, title, cover_image')
        .limit(1)
        .single();
      
      const duration = Date.now() - startTime;

      diagnostics.tests.push({
        name: 'Fetch Single Book',
        status: error ? 'FAIL' : 'PASS',
        details: {
          duration: `${duration}ms`,
          book: data ? { id: data.id, title: data.title } : null,
          error: error ? error.message : null
        }
      });
    } catch (err) {
      diagnostics.tests.push({
        name: 'Fetch Single Book',
        status: 'FAIL',
        details: { error: err.message }
      });
    }

    // Test 5: Check storage access
    try {
      const { data } = supabase.storage.from('Book-storage').getPublicUrl('test.pdf');
      diagnostics.tests.push({
        name: 'Storage Access',
        status: data?.publicUrl ? 'PASS' : 'FAIL',
        details: {
          canGenerateUrl: !!data?.publicUrl,
          sampleUrl: data?.publicUrl ? `${data.publicUrl.substring(0, 50)}...` : null
        }
      });
    } catch (err) {
      diagnostics.tests.push({
        name: 'Storage Access',
        status: 'FAIL',
        details: { error: err.message }
      });
    }

    setResults(diagnostics);
    setTesting(false);
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'white',
      border: '2px solid #333',
      padding: '20px',
      maxWidth: '500px',
      maxHeight: '80vh',
      overflow: 'auto',
      zIndex: 9999,
      fontFamily: 'monospace',
      fontSize: '12px'
    }}>
      <h3 style={{ margin: '0 0 15px 0', fontSize: '14px', fontWeight: 'bold' }}>
        🔍 Supabase Diagnostics
      </h3>
      
      <button
        onClick={runDiagnostics}
        disabled={testing}
        style={{
          background: '#333',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          cursor: testing ? 'not-allowed' : 'pointer',
          marginBottom: '15px'
        }}
      >
        {testing ? 'Testing...' : 'Run Tests'}
      </button>

      {results && (
        <div>
          <div style={{ marginBottom: '10px', fontSize: '10px', color: '#666' }}>
            {results.timestamp}
          </div>
          
          {results.tests.map((test, i) => (
            <div key={i} style={{
              marginBottom: '15px',
              padding: '10px',
              background: test.status === 'PASS' ? '#d4edda' : '#f8d7da',
              border: `1px solid ${test.status === 'PASS' ? '#c3e6cb' : '#f5c6cb'}`
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                {test.status === 'PASS' ? '✅' : '❌'} {test.name}
              </div>
              <pre style={{
                margin: 0,
                fontSize: '10px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {JSON.stringify(test.details, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
