// src/components/Login.js - Complete Fixed Google OAuth Login
import React, { useState, useEffect, useCallback } from 'react';
import './Login.css';
import { 
  supabase,
  signInWithGoogle, 
  checkApprovedUser,
  getCurrentSession 
} from '../lib/supabaseClient';

function Login({ onLogin }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);

  // Handle authentication success - wrapped in useCallback to prevent recreating on every render
  const handleAuthSuccess = useCallback(async (session) => {
    try {
      setLoading(true);
      setError('');
      
      if (!session?.user) {
        console.error('No user in session');
        setCheckingSession(false);
        return;
      }

      const userEmail = session.user.email;
      console.log('=== AUTH SUCCESS DEBUG ===');
      console.log('User email:', userEmail);
      console.log('User ID:', session.user.id);
      console.log('Session expires:', new Date(session.expires_at * 1000).toISOString());

      // Check if user is approved
      const accessConfig = await checkApprovedUser(session);
      console.log('Access config returned:', accessConfig);

      if (accessConfig) {
        console.log('✅ User approved with role:', accessConfig.role);
        console.log('Available modules:', accessConfig.modules);
        
        // Save to localStorage
        localStorage.setItem('userRole', JSON.stringify(accessConfig));
        localStorage.setItem('lastLoginTime', new Date().toISOString());
        
        console.log('Saved to localStorage, calling onLogin...');
        
        // Small delay to ensure state is saved
        setTimeout(() => {
          onLogin(accessConfig);
        }, 100);
      } else {
        console.log('❌ User not approved:', userEmail);
        setError('Access Denied: Your email is not authorized. Please contact your administrator.');
        
        // Sign out unauthorized user
        await supabase.auth.signOut();
        localStorage.removeItem('userRole');
      }
    } catch (error) {
      console.error('❌ Auth handler error:', error);
      setError('Login failed. Please try again.');
      await supabase.auth.signOut();
    } finally {
      setLoading(false);
      setCheckingSession(false);
    }
  }, [onLogin]);

  // Initialize authentication and set up listeners
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        console.log('Initializing auth...');
        // First, check if there's an existing valid session
        const session = await getCurrentSession();
        
        if (session?.user && mounted) {
          console.log('Found existing session, processing...');
          await handleAuthSuccess(session);
        } else {
          console.log('No existing session found');
        }
      } catch (error) {
        console.error('Init auth error:', error);
      } finally {
        if (mounted) {
          setCheckingSession(false);
        }
      }
    };

    // Initialize auth check
    initAuth();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (!mounted) return;

        // Ignore INITIAL_SESSION event
        if (event === 'INITIAL_SESSION') {
          console.log('Initial session event, skipping...');
          return;
        }

        if (event === 'SIGNED_IN' && session) {
          console.log('Processing sign in...');
          await handleAuthSuccess(session);
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          localStorage.removeItem('userRole');
          setCheckingSession(false);
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed');
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [handleAuthSuccess]);

  // Handle Google login button click
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('Initiating Google login...');
      const result = await signInWithGoogle();

      if (!result.success) {
        setError(result.error || 'Failed to initiate Google sign-in');
        setLoading(false);
      }
      // Keep loading state - it will be cleared after redirect
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  // Show loading screen while checking session
  if (checkingSession) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="lock-icon">🔒</div>
            <h1>Welcome to VPCS</h1>
            <p className="subtitle">Checking authentication...</p>
          </div>
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  // Main login screen
  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="lock-icon">🔒</div>
          <h1>Welcome to VPCS</h1>
          <p className="subtitle">Vendor Payment and Control System</p>
        </div>

        <div className="login-content">
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="google-login-button"
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <svg className="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          <div className="login-divider">
            <span>Authorized Access Only</span>
          </div>

          <div className="login-info">
            <div className="info-item">
              <span className="info-icon">🔐</span>
              <span>Secure authentication via Google</span>
            </div>
            <div className="info-item">
              <span className="info-icon">✅</span>
              <span>Pre-approved users only</span>
            </div>
            <div className="info-item">
              <span className="info-icon">📱</span>
              <span>Works on all devices</span>
            </div>
          </div>

          <div className="login-footer">
            <p className="help-text">
              <span className="info-icon">ℹ️</span>
              Need access? Contact your system administrator
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;