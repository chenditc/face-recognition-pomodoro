import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // Remove restrict mode since meterial component dialog conflict with
  //<React.StrictMode>
    <App />
  //  </React.StrictMode>
);
