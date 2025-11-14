// src/components/navigation.js
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './navigation.css';

const Navigation = ({ userInfo, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Collapsed by default
  const location = useLocation();

  // Module configuration with routes and display info
  const moduleConfig = {
    'calculator': {
      name: 'Material Calculator',
      icon: '🧮',
      path: '/calculator'
    },
    'cashflow': {
      name: 'Cash Flow',
      icon: '💰',
      path: '/cashflow'
    },
    'cashflowentry': {
      name: 'Cash Flow Entry',
      icon: '📝',
      path: '/cashflowentry'
    },
    'transactions': {
      name: 'Transactions',
      icon: '📊',
      path: '/transactions'
    },
    'tanker-management': {
      name: 'Tanker Management',
      icon: '🚚',
      path: '/tanker-management'
    }
  };

  // Get available menu items based on user's modules
  const getMenuItems = () => {
    if (!userInfo || !userInfo.modules) return [];
    
    return userInfo.modules
      .map(moduleKey => moduleConfig[moduleKey])
      .filter(item => item !== undefined);
  };

  const menuItems = getMenuItems();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    closeMenu();
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        className="mobile-menu-toggle" 
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        <span className="hamburger-icon">☰</span>
      </button>

      {/* Navigation Menu */}
      <nav className={`nav-menu ${isMenuOpen ? 'open' : ''}`}>
        {/* Close button */}
        <button 
          className="mobile-menu-close" 
          onClick={closeMenu}
          aria-label="Close menu"
        >
          ✕
        </button>

        {/* Clean Header with Company and User */}
        <div className="nav-header-section">
          {/* Company branding - compact */}
          <div className="nav-brand">
            <div className="brand-icon">VP</div>
            <div className="brand-text">
              <div className="brand-name">VPCS</div>
              <div className="brand-subtitle">Chemicals & Solvents</div>
            </div>
          </div>
          
          {/* User info - minimal */}
          <div className="nav-user-compact">
            <div className="user-avatar-circle">
              {userInfo?.photo ? (
                <img src={userInfo.photo} alt={userInfo.name} />
              ) : (
                <span>{userInfo?.name?.charAt(0) || 'U'}</span>
              )}
            </div>
            <div className="user-info-text">
              <div className="user-name-compact">{userInfo?.name?.split(' ')[0]}</div>
              <div className="user-role-badge" style={{ backgroundColor: userInfo?.color }}>
                {userInfo?.displayName}
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="nav-divider"></div>

        {/* Menu Items */}
        <ul className="nav-items">
          {menuItems.map((item, index) => (
            <li key={index} className={isActive(item.path) ? 'active' : ''}>
              <Link 
                to={item.path} 
                onClick={closeMenu}
                className="nav-link"
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-text">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Divider before footer */}
        <div className="nav-divider"></div>

        {/* Footer with Logout */}
        <div className="nav-footer">
          <button 
            onClick={handleLogout}
            className="nav-logout-btn"
          >
            <span className="nav-icon">🚪</span>
            <span className="nav-text">Sign Out</span>
          </button>
        </div>
      </nav>

      {/* Overlay for menu */}
      {isMenuOpen && (
        <div 
          className="nav-overlay active" 
          onClick={closeMenu}
        />
      )}
    </>
  );
};

export default Navigation;