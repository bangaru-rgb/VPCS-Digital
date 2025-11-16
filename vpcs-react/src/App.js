// src/App.js - Main Application Component with Modern Navigation
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Navigation, { PageHeader } from './components/navigation';
import MaterialCalculator from './components/MaterialCalculator';
import CashFlow from './components/cashFlow';
import CashFlowEntry from './components/cashFlowEntry';
import InvoicesDashboard from './components/invoicesDashboard';
import TankerManagement from './components/tankerManagement';
import BaseCompanyManagement from './components/baseCompanyManagement';
import { signOut, getCurrentSession, hasModuleAccess } from './lib/supabaseClient';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const session = await getCurrentSession();
      const savedUserInfo = localStorage.getItem('userRole');

      if (session && savedUserInfo) {
        const userConfig = JSON.parse(savedUserInfo);
        
        // Verify the session user matches saved user
        if (session.user.email === userConfig.email) {
          setUserInfo(userConfig);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('userRole');
          setIsAuthenticated(false);
          setUserInfo(null);
        }
      } else {
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
    setUserInfo(userConfig);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setIsAuthenticated(false);
      setUserInfo(null);
      localStorage.removeItem('userRole');
      localStorage.removeItem('lastLoginTime');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Get the first available module route for the user
  const getDefaultRoute = (userInfo) => {
    if (!userInfo || !userInfo.modules || userInfo.modules.length === 0) {
      return '/';
    }

    const firstModule = userInfo.modules[0];
    
    // Map module names to routes
    const moduleRouteMap = {
      'calculator': '/calculator',
      'cashflow': '/cashflow',
      'cashflowentry': '/cashflowentry',
      'transactions': '/transactions',
      'tanker-management': '/tanker-management',
      'base-company-management': '/base-company-management'
    };

    return moduleRouteMap[firstModule] || '/calculator';
  };

  // Protected Route Component
  const ProtectedRoute = ({ children, requiredModule }) => {
    if (!isAuthenticated) {
      return <Navigate to="/" replace />;
    }

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
        {/* Navigation Sidebar - Only show when authenticated */}
        {isAuthenticated && <Navigation userInfo={userInfo} onLogout={handleLogout} />}

        {/* Main Content Area */}
        <main className="app-main">
          {/* Page Header with VPCS Branding - Only show when authenticated */}
          {isAuthenticated && <PageHeader />}
          
          {/* Page Content */}
          <div className="page-content">
            <Routes>
              {/* Login Route - also handles OAuth callback */}
              <Route 
                path="/login" 
                element={
                  isAuthenticated ? 
                    <Navigate to={getDefaultRoute(userInfo)} replace /> : 
                    <Login onLogin={handleLogin} />
                } 
              />

              {/* Root path - Login or redirect to first module */}
              <Route 
                path="/" 
                element={
                  isAuthenticated ? 
                    <Navigate to={getDefaultRoute(userInfo)} replace /> :
                    <Login onLogin={handleLogin} />
                } 
              />

              {/* Protected Routes - All Available Modules */}
              
              {/* Material Calculator */}
              <Route 
                path="/calculator" 
                element={
                  <ProtectedRoute requiredModule="calculator">
                    <MaterialCalculator userInfo={userInfo} />
                  </ProtectedRoute>
                } 
              />

              {/* Cash Flow View */}
              <Route 
                path="/cashflow" 
                element={
                  <ProtectedRoute requiredModule="cashflow">
                    <CashFlow userInfo={userInfo} />
                  </ProtectedRoute>
                } 
              />

              {/* Cash Flow Entry */}
              <Route 
                path="/cashflowentry" 
                element={
                  <ProtectedRoute requiredModule="cashflowentry">
                    <CashFlowEntry userInfo={userInfo} />
                  </ProtectedRoute>
                } 
              />

              {/* Transactions Dashboard */}
              <Route 
                path="/transactions" 
                element={
                  <ProtectedRoute requiredModule="transactions">
                    <InvoicesDashboard userInfo={userInfo} />
                  </ProtectedRoute>
                } 
              />

              {/* Tanker Management */}
              <Route 
                path="/tanker-management" 
                element={
                  <ProtectedRoute requiredModule="tanker-management">
                    <TankerManagement userInfo={userInfo} />
                  </ProtectedRoute>
                } 
              />

              {/* Base Company Management */}
              <Route 
                path="/base-company-management" 
                element={
                  <ProtectedRoute requiredModule="base-company-management">
                    <BaseCompanyManagement userInfo={userInfo} />
                  </ProtectedRoute>
                } 
              />

              {/* Fallback Route */}
              <Route 
                path="*" 
                element={<Navigate to="/" replace />} 
              />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;