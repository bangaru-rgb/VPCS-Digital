// src/components/navigation.js - Modern Professional Navigation with Dynamic Page Title
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './navigation.css';

const Navigation = ({ userInfo, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
    },
    'base-company-management': {
      name: 'Base Company',
      icon: '🏢',
      path: '/base-company-management'
    },
    'user-management': {
      name: 'User Management',
      icon: '🔐',
      path: '/user-management'
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
      {/* Mobile Menu Toggle Button */}
      <button 
        className="mobile-menu-toggle" 
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        ☰
      </button>

      {/* Navigation Sidebar */}
      <nav className={`nav-menu ${isMenuOpen ? 'open' : ''}`}>
        {/* Mobile Close Button */}
        <button 
          className="mobile-menu-close" 
          onClick={closeMenu}
          aria-label="Close menu"
        >
          ✕
        </button>

        {/* User Info Section - Top of Sidebar */}
        <div className="nav-user-section">
          <div className="user-avatar">
            {userInfo?.photo ? (
              <img src={userInfo.photo} alt={userInfo.name} />
            ) : (
              <span>{userInfo?.name?.charAt(0) || 'U'}</span>
            )}
          </div>
          <div className="user-details">
            <div className="user-name">
              {userInfo?.name || 'User'}
            </div>
            <div 
              className="user-role" 
              style={{ 
                backgroundColor: userInfo?.color || '#007bff'
              }}
            >
              {userInfo?.displayName || 'User'}
            </div>
          </div>
        </div>

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

        <div className="nav-divider"></div>

        {/* Logout Button */}
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

      {/* Overlay for Mobile Menu */}
      {isMenuOpen && (
        <div 
          className="nav-overlay active" 
          onClick={closeMenu}
        />
      )}
    </>
  );
};

// Page Header Component with Dynamic Page Title
export const PageHeader = () => {
  const location = useLocation();

  // Map routes to page titles and icons
  const pageInfo = {
    '/calculator': {
      title: 'Material Calculator',
      icon: '🧮',
      description: 'Calculate material quantities and costs'
    },
    '/cashflow': {
      title: 'Cash Flow',
      icon: '💰',
      description: 'View cash flow transactions'
    },
    '/cashflowentry': {
      title: 'Cash Flow Entry',
      icon: '📝',
      description: 'Add new cash flow entries'
    },
    '/transactions': {
      title: 'Transactions',
      icon: '📊',
      description: 'View all transactions and invoices'
    },
    '/tanker-management': {
      title: 'Tanker Management',
      icon: '🚚',
      description: 'Add and manage tanker information'
    },
    '/base-company-management': {
      title: 'Base Company Management',
      icon: '🏢',
      description: 'Manage company information and details'
    },
    '/user-management': {
      title: 'User Management',
      icon: '🔐',
      description: 'Manage system users and permissions'
    }
  };

  const currentPage = pageInfo[location.pathname] || {
    title: 'Dashboard',
    icon: '📱',
    description: 'Welcome to VPCS'
  };

  return (
    <div className="page-header">
      <div className="page-header-left">
        {/* Company Branding */}
        <div className="page-brand">
          <div className="page-brand-icon">
            <div className="icon-top">VP</div>
            <div className="icon-bottom">CS</div>
          </div>
          <div className="page-brand-text">
            <div className="page-brand-name">VPCS</div>
            <div className="page-brand-subtitle">chemicals & solvents</div>
          </div>
        </div>

        {/* Separator */}
        <div className="header-separator"></div>

        {/* Current Page Title */}
        <div className="page-title-section">
          <div className="page-title-wrapper">
            <span className="page-icon">{currentPage.icon}</span>
            <h1 className="page-title">{currentPage.title}</h1>
          </div>
          <p className="page-description">{currentPage.description}</p>
        </div>
      </div>
    </div>
  );
};

export default Navigation;