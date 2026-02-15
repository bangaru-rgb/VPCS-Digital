import React, { useState } from 'react';

const UserList = ({ users, loading, onUpdateStatus }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  if (loading) {
    return (
      <div className="user-list-loading">
        <div className="spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="user-list-empty">
        <div className="empty-icon">👥</div>
        <h3>No Users Found</h3>
        <p>Add your first user to get started.</p>
      </div>
    );
  }

  const handleStatusChange = (userId, newStatus) => {
    if (window.confirm(`Are you sure you want to change this user's status to ${newStatus}?`)) {
      if (onUpdateStatus) {
        onUpdateStatus(userId, newStatus);
      }
    }
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'All' || user.role === filterRole;
    const matchesStatus = filterStatus === 'All' || user.status === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Get role badge color
  const getRoleBadgeClass = (role) => {
    switch(role) {
      case 'Administrator': return 'role-admin';
      case 'Supervisor': return 'role-supervisor';
      case 'Management': return 'role-management';
      default: return 'role-default';
    }
  };

  return (
    <div className="user-list">
      {/* Filters */}
      <div className="list-filters">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <select 
            value={filterRole} 
            onChange={(e) => setFilterRole(e.target.value)}
            className="filter-select"
          >
            <option value="All">All Roles</option>
            <option value="Administrator">Administrator</option>
            <option value="Supervisor">Supervisor</option>
            <option value="Management">Management</option>
          </select>

          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Suspended">Suspended</option>
            <option value="Decommissioned">Decommissioned</option>
          </select>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="table-container">
        <table className="user-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="user-row">
                <td className="user-cell">
                  <div className="user-info">
                    {user.profile_photo_url ? (
                      <img 
                        src={user.profile_photo_url} 
                        alt={user.full_name} 
                        className="user-avatar"
                      />
                    ) : (
                      <div className="user-avatar-placeholder">
                        {user.full_name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                    )}
                    <span className="user-name">{user.full_name || 'N/A'}</span>
                  </div>
                </td>
                <td className="email-cell">{user.email}</td>
                <td>
                  <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <span className={`status-badge status-${user.status?.toLowerCase()}`}>
                    {user.status}
                  </span>
                </td>
                <td className="actions-cell">
                  <select
                    className="status-select"
                    value={user.status}
                    onChange={(e) => handleStatusChange(user.id, e.target.value)}
                    title="Change user status"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Decommissioned">Decommissioned</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="user-cards">
        {filteredUsers.map((user) => (
          <div key={user.id} className="user-card">
            <div className="user-card-header">
              {user.profile_photo_url ? (
                <img 
                  src={user.profile_photo_url} 
                  alt={user.full_name} 
                  className="user-card-avatar"
                />
              ) : (
                <div className="user-card-avatar-placeholder">
                  {user.full_name?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}
              <div className="user-card-info">
                <h3 className="user-card-name">{user.full_name || 'N/A'}</h3>
                <p className="user-card-email">{user.email}</p>
              </div>
            </div>

            <div className="user-card-body">
              <div className="user-card-row">
                <span className="user-card-label">Role</span>
                <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
                  {user.role}
                </span>
              </div>

              <div className="user-card-row">
                <span className="user-card-label">Status</span>
                <span className={`status-badge status-${user.status?.toLowerCase()}`}>
                  {user.status}
                </span>
              </div>
            </div>

            <div className="user-card-actions">
              <select
                className="status-select"
                value={user.status}
                onChange={(e) => handleStatusChange(user.id, e.target.value)}
                title="Change user status"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
                <option value="Decommissioned">Decommissioned</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="no-results">
          <p>😕 No users match your search criteria</p>
        </div>
      )}
    </div>
  );
};

export default UserList;
