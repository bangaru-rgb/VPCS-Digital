// src/components/Login.js
import React, { useState } from 'react';
import './Login.css';
import { verifyRoleCode } from '../lib/supabaseClient';

function Login({ onLogin }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Verify code with Supabase
      //const accessConfig = await verifyRoleCode(parseInt(code));
      const accessConfig = await verifyRoleCode(parseInt(code));

      if (accessConfig && accessConfig.modules.length > 0) {
        // Successful login
        onLogin(accessConfig);
      } else {
        // Invalid code
        setError('Invalid code. Access denied.');
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
        setCode('');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Connection error. Please try again.');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length <= 6) {
      setCode(value);
      setError('');
    }
  };

  return (
    <div className="login-container">
      <div className={`login-card ${isShaking ? 'shake' : ''}`}>
        <div className="login-header">
          <div className="lock-icon">🔒</div>
          <h1>Welcome Back</h1>
          <p>Enter your access code to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="pin-input-container">
            <input
              type="password"
              value={code}
              onChange={handleCodeChange}
              placeholder="Enter 6-digit code"
              maxLength="6"
              className={`pin-input ${error ? 'error' : ''}`}
              autoFocus
              inputMode="numeric"
              disabled={isLoading}
            />
            <div className="pin-dots">
              {[...Array(6)].map((_, i) => (
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

          <button 
            type="submit" 
            className="login-button"
            disabled={code.length !== 6 || isLoading}
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