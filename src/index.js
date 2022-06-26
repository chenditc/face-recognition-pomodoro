import React from 'react';
import ReactDOM from 'react-dom/client';
import FaceRecognitionPomo from "./FaceRecognitionPomo";
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // Remove restrict mode since meterial component dialog conflict with
  //<React.StrictMode>
    <FaceRecognitionPomo />
  //  </React.StrictMode>
);

reportWebVitals(console.log);

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').then(function(registration) {
    console.log('SW registration succeeded with scope:', registration.scope);
  }).catch(function(e) {
    console.log('SW registration failed with error:', e);
  });
}
