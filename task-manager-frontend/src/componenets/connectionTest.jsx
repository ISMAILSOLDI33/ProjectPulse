import { useEffect, useState } from 'react';

export default function ConnectionTest() {
  const [status, setStatus] = useState('Testing...');

  useEffect(() => {
    fetch('http://localhost:5000/api/ping')
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(data => setStatus(`✓ Backend says: ${data.status}`))
      .catch(error => setStatus(`✗ Error: ${error.message}`));
  }, []);

  return (
    <div style={{
      padding: '10px',
      margin: '20px',
      border: '1px solid #ccc',
      borderRadius: '4px',
      backgroundColor: '#f8f8f8'
    }}>
      <p style={{ fontFamily: 'monospace' }}>{status}</p>
    </div>
  );
}