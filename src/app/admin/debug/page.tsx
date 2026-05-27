'use client';

import { useState, useEffect } from 'react';

export default function DebugPage() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [apiTest, setApiTest] = useState<any>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('adminToken');
    const storedUser = localStorage.getItem('adminUser');
    
    setToken(storedToken);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user:', e);
      }
    }

    // Test the API
    if (storedToken) {
      testAPI(storedToken);
    }
  }, []);

  const testAPI = async (token: string) => {
    try {
      const response = await fetch('http://localhost:8000/api/admin/knowledge-base/laws', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = await response.json();
      setApiTest({
        status: response.status,
        ok: response.ok,
        data: data
      });
    } catch (e: any) {
      setApiTest({
        error: e.message
      });
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h1>Admin Debug Page</h1>
      
      <div style={{ marginTop: '2rem' }}>
        <h2>Token Status</h2>
        <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px' }}>
          {token ? `Token exists: ${token.substring(0, 50)}...` : 'No token found'}
        </pre>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2>User Data</h2>
        <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px' }}>
          {user ? JSON.stringify(user, null, 2) : 'No user data found'}
        </pre>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2>API Test Result</h2>
        <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px' }}>
          {apiTest ? JSON.stringify(apiTest, null, 2) : 'Testing...'}
        </pre>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <button 
          onClick={() => {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            window.location.reload();
          }}
          style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}
        >
          Clear Storage
        </button>
      </div>
    </div>
  );
}
