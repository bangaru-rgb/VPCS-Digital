// src/App.js - Fixed Main Application Component
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/invoicesDashboard';
import TankerManagement from './components/tankerManagement';
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
      console.log('App: Checking session...');
      console.log('App: Current URL:', window.location.href);
      console.log('App: URL hash:', window.location.hash);
      console.log('App: URL search:', window.location.search);
      
      const session = await getCurrentSession();
      const savedUserInfo = localStorage.getItem('userRole');

      if (session && savedUserInfo) {
        const userConfig = JSON.parse(savedUserInfo);
        console.log('App: Restoring session for:', userConfig.email);
        
        // Verify the session user matches saved user
        if (session.user.email === userConfig.email) {
          setUserInfo(userConfig);
          setIsAuthenticated(true);
        } else {
          console.log('App: Session mismatch, clearing...');
          localStorage.removeItem('userRole');
          setIsAuthenticated(false);
          setUserInfo(null);
        }
      } else {
        console.log('App: No valid session found');
        setIsAuthenticated(false);
        setUserInfo(null);
      }
    } catch (error) {
      console.error('App: Session check error:', error);
      setIsAuthenticated(false);
      setUserInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userConfig) => {
    console.log('=== APP HANDLE LOGIN CALLED ===');
    console.log('User config:', userConfig);
    console.log('Setting authenticated to true...');
    setUserInfo(userConfig);
    setIsAuthenticated(true);
    console.log('Authentication state updated!');
  };

  const handleLogout = async () => {
    console.log('App: Logging out...');
    try {
      await signOut();
      setIsAuthenticated(false);
      setUserInfo(null);
      localStorage.removeItem('userRole');
      localStorage.removeItem('lastLoginTime');
    } catch (error) {
      console.error('App: Logout error:', error);
    }
  };

  // Protected Route Component
  const ProtectedRoute = ({ children, requiredModule }) => {
    if (!isAuthenticated) {
      console.log('ProtectedRoute: Not authenticated, redirecting to login');
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
            {/* Public Route - Handle OAuth callback at root */}
            <Route 
              path="/login" 
              element={
                isAuthenticated ? 
                  <Navigate to="/" replace /> : 
                  <Login onLogin={handleLogin} />
              } 
            />

            {/* Root path - will handle OAuth redirect */}
            <Route 
              path="/" 
              element={
                isAuthenticated ? 
                  <Dashboard userInfo={userInfo} /> :
                  <Login onLogin={handleLogin} />
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