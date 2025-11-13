// src/App.js - Main Application Component
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/invoicesDashboard'; // Your main dashboard
import TankerManagement from './components/tankerManagement';
// Import other components as needed
import { signOut, getCurrentSession, hasModuleAccess } from './lib/supabaseClient';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on app load
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const session = await getCurrentSession();
      const savedUserInfo = localStorage.getItem('userRole');

      if (session && savedUserInfo) {
        const userConfig = JSON.parse(savedUserInfo);
        console.log('Restoring session for:', userConfig.email);
        setUserInfo(userConfig);
        setIsAuthenticated(true);
      } else {
        console.log('No valid session found');
        setIsAuthenticated(false);
        setUserInfo(null);
      }
    } catch (error) {
      console.error('Session check error:', error);
      setIsAuthenticated(false);
      setUserInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userConfig) => {
    console.log('User logged in:', userConfig);
    setUserInfo(userConfig);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    console.log('Logging out...');
    await signOut();
    setIsAuthenticated(false);
    setUserInfo(null);
  };

  // Protected Route Component
  const ProtectedRoute = ({ children, requiredModule }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    // If module access is required, check it
    if (requiredModule && !hasModuleAccess(userInfo, requiredModule)) {
      return (
        <div className="access-denied">
          <h1>🚫 Access Denied</h1>
          <p>You don't have permission to access this module.</p>
          <button onClick={() => window.history.back()}>Go Back</button>
        </div>
      );
    }

    return children;
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner"></div>
        <p>Loading VPCS...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        {isAuthenticated && (
          <header className="app-header">
            <div className="header-content">
              <div className="header-left">
                <h1>VPCS</h1>
                <span className="header-subtitle">Vendor Payment & Control System</span>
              </div>
              <div className="header-right">
                <div className="user-info">
                  {userInfo?.photo && (
                    <img 
                      src={userInfo.photo} 
                      alt={userInfo.name} 
                      className="user-avatar"
                    />
                  )}
                  <div className="user-details">
                    <span className="user-name">{userInfo?.name}</span>
                    <span className="user-role" style={{ color: userInfo?.color }}>
                      {userInfo?.icon} {userInfo?.displayName}
                    </span>
                  </div>
                </div>
                <button onClick={handleLogout} className="logout-button">
                  Sign Out
                </button>
              </div>
            </div>
          </header>
        )}

        <main className="app-main">
          <Routes>
            {/* Public Route */}
            <Route 
              path="/login" 
              element={
                isAuthenticated ? 
                  <Navigate to="/" replace /> : 
                  <Login onLogin={handleLogin} />
              } 
            />

            {/* Protected Routes */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Dashboard userInfo={userInfo} />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/tanker-management" 
              element={
                <ProtectedRoute requiredModule="tanker-management">
                  <TankerManagement userInfo={userInfo} />
                </ProtectedRoute>
              } 
            />

            {/* Add more protected routes for other modules */}
            {/* 
            <Route 
              path="/calculator" 
              element={
                <ProtectedRoute requiredModule="calculator">
                  <Calculator userInfo={userInfo} />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/cashflow" 
              element={
                <ProtectedRoute requiredModule="cashflow">
                  <Cashflow userInfo={userInfo} />
                </ProtectedRoute>
              } 
            />
            */}

            {/* Fallback Route */}
            <Route 
              path="*" 
              element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;