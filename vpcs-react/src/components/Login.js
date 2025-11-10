// src/components/Login.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha'; // Make sure to install this package
import './Login.css';
import { supabase, verifyEmpLogin_ID } from '../lib/supabaseClient';

function Login({ onLogin }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [captchaToken, setCaptchaToken] = useState(null);
  const captchaRef = useRef(null);

  const checkExistingSession = useCallback(async () => {
    try {
      console.log('Checking for existing session...');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        console.log('Existing session found:', session.user.id);
        
        const savedRole = localStorage.getItem('userRole');
        
        if (savedRole) {
          const roleConfig = JSON.parse(savedRole);
          console.log('Auto-logging in with role:', roleConfig.role);
          onLogin(roleConfig);
          return;
        } else {
          console.log('Session exists but no role config, cleaning up...');
          await supabase.auth.signOut();
        }
      } else {
        console.log('No existing session found');
      }
    } catch (error) {
      console.error('Error checking existing session:', error);
      await supabase.auth.signOut();
      localStorage.removeItem('userRole');
    } finally {
      setCheckingSession(false);
    }
  }, [onLogin]);

  useEffect(() => {
    const savedCode = localStorage.getItem('rememberedCode');
    if (savedCode) {
      setCode(savedCode);
      setRememberMe(true);
    }

    checkExistingSession();
  }, [checkExistingSession]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!captchaToken) {
      setError('Please complete the CAPTCHA.');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('=== LOGIN ATTEMPT ===');
      console.log('Entered code:', code);

      console.log('Signing out any existing sessions...');
      await supabase.auth.signOut();
      
      console.log('Verifying employee login ID...');
      const accessConfig = await verifyEmpLogin_ID(parseInt(code));

      if (accessConfig) {
        console.log('Access config verified:', accessConfig.name);
        
        console.log('Creating new authentication session...');
        const { data, error } = await supabase.auth.signInWithPassword({
          email: 'anonymous1@example.com',
          password: 'anonymous-password',
          options: {
            captchaToken,
          },
        });

        if (error) {
          console.error('Error creating session:', error.message);
          setError(`Login failed: ${error.message}`); // Display the actual error
          if (captchaRef.current) {
            captchaRef.current.resetCaptcha();
          }
          setCaptchaToken(null);
          setIsLoading(false);
          return;
        }

        if (data) {
            if (rememberMe) {
              localStorage.setItem('rememberedCode', code);
            } else {
              localStorage.removeItem('rememberedCode');
            }

            localStorage.setItem('userRole', JSON.stringify(accessConfig));
            
            console.log('=== LOGIN SUCCESS ===');
            
            onLogin(accessConfig);
        }
      } else {
        console.log('Invalid login code');
        setError('Invalid code. Access denied.');
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
        setCode('');
        if (captchaRef.current) {
          captchaRef.current.resetCaptcha();
        }
        setCaptchaToken(null);
      }
    } catch (error) {
      console.error('=== LOGIN ERROR ===');
      console.error('Error:', error);
      
      if (error.message.includes('secure session')) {
        setError(error.message);
      } else if (error.message.includes('network')) {
        setError('Network error. Please check your connection.');
      } else {
        setError('Connection error. Please try again.');
      }
      
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      
      await supabase.auth.signOut();
      localStorage.removeItem('userRole');
      if (captchaRef.current) {
        captchaRef.current.resetCaptcha();
      }
      setCaptchaToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      setCode(value);
      setError('');
    }
  };

  if (checkingSession) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="lock-icon">🔒</div>
            <h1>Welcome to VPCS</h1>
            <p>Checking session...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className={`login-card ${isShaking ? 'shake' : ''}`}>
        <div className="login-header">
          <div className="lock-icon">🔒</div>
          <h1>Welcome to VPCS</h1>
          <p>Enter your access code to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="pin-input-container">
            <input
              type="password"
              value={code}
              onChange={handleCodeChange}
              placeholder="Enter 4-digit code"
              maxLength="4"
              className={`pin-input ${error ? 'error' : ''}`}
              autoFocus
              inputMode="numeric"
              disabled={isLoading}
            />
            <div className="pin-dots">
              {[...Array(4)].map((_, i) => (
                <div 
                  key={i} 
                  className={`dot ${i < code.length ? 'filled' : ''}`}
                />
              ))}
            </div>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <div className="remember-me-container">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="rememberMe">Remember Me</label>
          </div>

          <div className="captcha-container">
            <HCaptcha
              sitekey="0cdef1ca-f994-411e-a4c8-23f604e6cd32" // Replace with your hCaptcha Sitekey
              onVerify={setCaptchaToken}
              ref={captchaRef}
            />
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={code.length !== 4 || isLoading || !captchaToken}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Verifying...
              </>
            ) : (
              'Access System'
            )}
          </button>
        </form>

        <div className="login-footer">
          <p className="info-text">
            <span className="info-icon">ℹ️</span>
            Contact your administrator for access code
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
