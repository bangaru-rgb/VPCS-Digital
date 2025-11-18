// src/components/UserManagement/UserManagement.js
import React, { useState, useEffect } from 'react';
import AddUserForm from './AddUserForm';
import UserList from './UserList';
import { getAllApprovedUsers, updateUserStatus } from '../../lib/supabaseClient';
import './UserManagement.css';

const UserManagement = ({ userInfo }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const result = await getAllApprovedUsers();
      
      if (result.success) {
        setUsers(result.data || []);
      } else {
        setError(result.error || 'Failed to load users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('An unexpected error occurred while loading users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateStatus = async (userId, newStatus) => {
    try {
      // Optimistically update UI
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, status: newStatus } : user
        )
      );

      const result = await updateUserStatus(userId, newStatus);
      
      if (!result.success) {
        // Revert on error
        fetchUsers();
        alert(`Failed to update status: ${result.error}`);
      } else {
        // Show success feedback (optional)
        console.log('✅ User status updated successfully');
      }
    } catch (err) {
      console.error('Error updating user status:', err);
      // Revert on error
      fetchUsers();
      alert('An error occurred while updating user status');
    }
  };

  return (
    <div className="user-management-container">
      {/* Page Header */}
      <div className="header-info">
        <h1>🔐 User Management</h1>
        <p className="header-subtitle">
          Manage system access and user permissions
        </p>
      </div>

      {/* Main Content Layout */}
      <div className="user-management-layout">
        {/* --- Left Column: Add User Form --- */}
        <div className="layout-left-column">
          <AddUserForm 
            userInfo={userInfo} 
            onUserAdded={fetchUsers} 
          />
        </div>

        {/* --- Right Column: User List and Stats --- */}
        <div className="layout-right-column">
          {/* Header Stats */}
          <div className="management-header">
            <div className="header-stats">
              <div className="stat-card">
                <div className="stat-value">{users.length}</div>
                <div className="stat-label">Total Users</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">
                  {users.filter(u => u.status === 'Active').length}
                </div>
                <div className="stat-label">Active</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">
                  {users.filter(u => u.role === 'Administrator').length}
                </div>
                <div className="stat-label">Admins</div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-banner">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
              <button onClick={fetchUsers} className="retry-button">
                Retry
              </button>
            </div>
          )}

          {/* User List */}
          <UserList 
            users={users} 
            loading={loading} 
            onUpdateStatus={handleUpdateStatus} 
          />
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
