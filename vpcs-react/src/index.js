import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register the service worker
serviceWorkerRegistration.register({
  onSuccess: () => {
    console.log('PWA: App is ready for offline use!');
  },
  onUpdate: (registration) => {
    console.log('PWA: New version available! Please refresh the page.');
    // You can show a notification to user here
  }
});