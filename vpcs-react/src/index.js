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
    console.log('PWA: New version available! Updating...');
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    window.location.reload();
  }
});

// Listen for reload messages from the service worker
navigator.serviceWorker.addEventListener('message', (event) => {
  if (event.data.type === 'RELOAD') {
    window.location.reload();
  }
});
    // You can show a notification to user here