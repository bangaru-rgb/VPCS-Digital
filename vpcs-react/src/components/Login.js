// src/components/Login.js - Clean Production Version
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

  // Handle authentication success
  const handleAuthSuccess = useCallback(async (session) => {
    try {
      setLoading(true);
      setError('');
      
      if (!session?.user) {
        setCheckingSession(false);
        return;
      }

      const accessConfig = await checkApprovedUser(session);

      if (accessConfig) {
        localStorage.setItem('userRole', JSON.stringify(accessConfig));
        localStorage.setItem('lastLoginTime', new Date().toISOString());
        
        setTimeout(() => {
          onLogin(accessConfig);
        }, 100);
      } else {
        setError('Access Denied: Your email is not authorized. Please contact your administrator.');
        await supabase.auth.signOut();
        localStorage.removeItem('userRole');
      }
    } catch (error) {
      console.error('Authentication error:', error);
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
      // Clean up OAuth hash from URL after processing
      if (window.location.hash) {
        const cleanUrl = window.location.pathname + window.location.search;
        window.history.replaceState({}, document.title, cleanUrl);
      }
      
      const hasOAuthCallback = window.location.hash.includes('access_token') || 
                                window.location.search.includes('code=');
      
      if (hasOAuthCallback) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      const session = await getCurrentSession();
      
      if (session?.user && mounted) {
        await handleAuthSuccess(session);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      if (mounted) {
        setCheckingSession(false);
      }
    }
  };

  initAuth();

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (!mounted) return;
      if (event === 'INITIAL_SESSION') return;

      if (event === 'SIGNED_IN' && session) {
        await handleAuthSuccess(session);
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('userRole');
        setCheckingSession(false);
      }
    }
  );

  return () => {
    mounted = false;
    subscription.unsubscribe();
  };
}, [handleAuthSuccess]);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      
      const result = await signInWithGoogle();

      if (!result.success) {
        setError(result.error || 'Failed to initiate Google sign-in');
        setLoading(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

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