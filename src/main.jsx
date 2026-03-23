import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

if (import.meta.env.MODE === 'production') {
  console.log = function() {}; // Override console.log in production
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
