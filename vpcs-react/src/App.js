import React, { useState, useEffect } from 'react';
import './App.css';
import MaterialCalculator from './components/MaterialCalculator';
import CashFlow from './components/cashFlow';
import CashFlowEntry from './components/CashFlowEntry';
import tankerManagement from './components/tankerManagement';
//import InvoicesDashboard from './components/invoicesDashboard';
import InstallPWA from './InstallPWA';
import Login from './components/Login';
import { APP_VERSION } from './utils/version';

function App() {
  const [activeModule, setActiveModule] = useState('calculator');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userAccess, setUserAccess] = useState(null);

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

  const handleLogin = (accessConfig) => {
    setIsAuthenticated(true);
    setUserAccess(accessConfig);
    // Set first available module as active
    setActiveModule(accessConfig.modules[0]);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserAccess(null);
    setActiveModule('calculator');
    setIsMenuOpen(false);
  };

  // Check if user has access to a specific module
  const hasAccess = (module) => {
    return userAccess && userAccess.modules.includes(module);
  };

  // If not authenticated, show login screen
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

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
        <div className="sidebar-header">
          <div className="user-info">
            <div className="user-icon">{userAccess.icon}</div>
            <span className="access-badge" style={{ color: userAccess.color }}>
              {userAccess.name}
            </span>
          </div>
        </div>
        <ul>
          {hasAccess('calculator') && (
            <li 
              className={activeModule === 'calculator' ? 'active' : ''}
              onClick={() => {
                setActiveModule('calculator');
                setIsMenuOpen(false);
              }}
            >
              📊 Material Price Calculator
            </li>
          )}
          {hasAccess('cashflow') && (
            <li 
              className={activeModule === 'cashflow' ? 'active' : ''}
              onClick={() => {
                setActiveModule('cashflow');
                setIsMenuOpen(false);
              }}
            >
              💰 Cash Flow
            </li>
          )}
          {hasAccess('cashflowentry') && (
            <li 
              className={activeModule === 'cashflowentry' ? 'active' : ''}
              onClick={() => {
                setActiveModule('cashflowentry');
                setIsMenuOpen(false);
              }}
            >
              ✍️ Cash Flow Entry
            </li>
          )}
          {hasAccess('transactions') && (
            <li 
              className={activeModule === 'transactions' ? 'active' : ''}
              onClick={() => {
                setActiveModule('transactions');
                setIsMenuOpen(false);
              }}
            >
              📈 Transactions Dashboard
            </li>
          )}
        </ul>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="main-content">
        {activeModule === 'calculator' && hasAccess('calculator') && <MaterialCalculator />}
        {activeModule === 'cashflow' && hasAccess('cashflow') && <CashFlow />}
        {activeModule === 'cashflowentry' && hasAccess('cashflowentry') && <CashFlowEntry />}
        {/* {activeModule === 'transactions' && hasAccess('transactions') && <InvoicesDashboard />} */}
      </main>
    </div>
  );
}

export default App;