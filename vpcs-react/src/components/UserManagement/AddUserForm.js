import React, { useState } from 'react';
import { addApprovedUser } from '../../lib/supabaseClient';

const AddUserForm = ({ userInfo, onUserAdded, onCancel }) => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  

  const handleAddUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!email || !fullName) {
      setError('Email and Full Name are required.');
      setLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    try {
      const result = await addApprovedUser(
        email.toLowerCase().trim(), 
        role, 
        fullName.trim(), 
        userInfo.email,
        notes.trim()
      );

      if (!result.success) {
        throw new Error(result.error);
      }

      setSuccess(`✅ User ${fullName} added successfully with ${role} role.`);
      setEmail('');
      setFullName('');
      setRole('');
      setNotes('');
      
      if (onUserAdded) {
        onUserAdded();
      }

      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(`❌ Error adding user: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleAddUser} className="add-user-form-inline">
      <div className="form-group">
        <label htmlFor="fullName">
          Full Name <span className="required">*</span>
        </label>
        <input
          type="text"
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Bangaru naidu"
          required
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">
          Email Address <span className="required">*</span>
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="user@example.com"
          required
          disabled={loading}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="role">
            Role <span className="required">*</span>
          </label>
          <select 
            id="role" 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
            disabled={loading}
          >
              <option value="">Select role</option>
            <option value="Administrator">Administrator - Full system access</option>
            <option value="Supervisor">Supervisor - Operations management</option>
            <option value="Management">Management - Financial oversight</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="notes">
          Notes <span className="optional">(Optional)</span>
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any additional notes about this user..."
          rows="3"
          disabled={loading}
        />
      </div>

      {error && (
        <div className="error-message">
          <span className="icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}
      
      {success && (
        <div className="success-message">
          <span className="icon">✓</span>
          <span>{success}</span>
        </div>
      )}

      <div className="form-button-group">
        <button type="submit" disabled={loading} className="submit-button">
          {loading ? (
            <>
              <span className="spinner-small"></span>
              <span>Adding User...</span>
            </>
          ) : (
            <>
              <span>➕</span>
              <span>Add User</span>
            </>
          )}
        </button>
        {onCancel && (
          <button 
            type="button" 
            onClick={onCancel} 
            disabled={loading}
            className="cancel-button"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default AddUserForm;