import React, { useState, useEffect } from 'react';
import './App.css';
import MaterialCalculator from './components/MaterialCalculator';
import CashFlow from './components/cashFlow';
//import InvoicesDashboard from './components/invoicesDashboard';
import InstallPWA from './InstallPWA';
import { APP_VERSION } from './utils/version';

function App() {
  const [activeModule, setActiveModule] = useState('calculator');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Check for updates every minute
    const checkForUpdates = async () => {
      try {
        const response = await fetch('/version.json?t=' + new Date().getTime());
        if (response.ok) {
          const serverVersion = await response.json();
          if (serverVersion.timestamp > APP_VERSION.timestamp) {
            setUpdateAvailable(true);
          }
        }
      } catch (error) {
        console.log('Version check failed:', error);
      }
    };

    const interval = setInterval(checkForUpdates, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const handleUpdate = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.update().then(() => {
          window.location.reload();
        });
      });
    }
  };

  return (
    <div className="app-container">
      <InstallPWA />
      {updateAvailable && (
        <div className="update-banner">
          <span>A new version is available!</span>
          <button onClick={handleUpdate}>Update Now</button>
        </div>
      )}
      {/* Hamburger Menu Button */}
      <button 
        className="hamburger-btn" 
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        ☰
      </button>

      {/* Sidebar Menu */}
      <nav className={`sidebar ${isMenuOpen ? 'open' : ''}`}>
        <ul>
          <li 
            className={activeModule === 'calculator' ? 'active' : ''}
            onClick={() => {
              setActiveModule('calculator');
              setIsMenuOpen(false);
            }}
          >
            Material Price Calculator
          </li>
          <li 
            className={activeModule === 'cashflow' ? 'active' : ''}
            onClick={() => {
              setActiveModule('cashflow');
              setIsMenuOpen(false);
            }}
          >
            Cash Flow
          </li>
          <li 
            className={activeModule === 'transactions' ? 'active' : ''}
            onClick={() => {
              setActiveModule('transactions');
              setIsMenuOpen(false);
            }}
          >
            Transactions Dashboard
          </li>
        </ul>
      </nav>

      {/* Main Content Area */}
      <main className="main-content">
        {activeModule === 'calculator' && <MaterialCalculator />}
        {activeModule === 'cashflow' && <CashFlow />}
        {/* {activeModule === 'transactions' && <InvoicesDashboard />} */}
      </main>
    </div>
  );
}

export default App;