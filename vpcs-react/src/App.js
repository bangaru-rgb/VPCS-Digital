import React, { useState } from 'react';
import './App.css';
import MaterialCalculator from './components/MaterialCalculator'; // Add .js extension
import CashFlow from './components/cashFlow'; // Add .js extension
import InvoicesDashboard from './components/invoicesDashboard'; // Add .js extension

function App() {
  const [activeModule, setActiveModule] = useState('calculator');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="app-container">
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
        {activeModule === 'transactions' && <InvoicesDashboard />}
      </main>
    </div>
  );
}

export default App;