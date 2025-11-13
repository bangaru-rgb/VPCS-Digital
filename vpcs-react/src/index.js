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

// TEMPORARILY UNREGISTER SERVICE WORKER FOR DEBUGGING
serviceWorkerRegistration.unregister();

console.log('Service Worker: DISABLED for debugging OAuth');

// Once OAuth works, you can re-enable it with:
// serviceWorkerRegistration.register({
//   onSuccess: () => {
//     console.log('PWA: App is ready for offline use!');
//   },
//   onUpdate: (registration) => {
//     console.log('PWA: New version available! Updating...');
//     if (registration && registration.waiting) {
//       registration.waiting.postMessage({ type: 'SKIP_WAITING' });
//     }
//     window.location.reload();
//   }
// });