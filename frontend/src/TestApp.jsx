import React from 'react';

function TestApp() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: 'blue' }}>Test Page</h1>
      <p>This is a test page to see if React is rendering correctly.</p>
      <button 
        style={{ 
          padding: '10px 20px', 
          backgroundColor: 'blue', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px',
          cursor: 'pointer'
        }}
        onClick={() => alert('Button clicked!')}
      >
        Click Me
      </button>
    </div>
  );
}

export default TestApp;
