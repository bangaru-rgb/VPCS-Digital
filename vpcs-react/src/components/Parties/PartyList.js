// src/components/Parties/PartyList.js
import React, { useState } from 'react';

const PartyList = ({ parties, loading, onUpdateParty }) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (loading) {
    return (
      <div className="user-list-loading"> {/* Reusing CSS */}
        <div className="spinner"></div>
        <p>Loading parties...</p>
      </div>
    );
  }

  if (!parties || parties.length === 0) {
    return (
      <div className="user-list-empty"> {/* Reusing CSS */}
        <div className="empty-icon">👥</div>
        <h3>No Parties Found</h3>
        <p>Add your first party to get started.</p>
      </div>
    );
  }

  const filteredParties = parties.filter(party => {
    const term = searchTerm.toLowerCase();
    return (
      party.party_name?.toLowerCase().includes(term) ||
      party.nickname?.toLowerCase().includes(term) ||
      party.city?.toLowerCase().includes(term) ||
      party.contact_person?.toLowerCase().includes(term)
    );
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  return (
    <div className="user-list"> {/* Reusing CSS */}
      <div className="list-header">
        <div className="header-content">
          <h2>👥 Parties Directory</h2>
          <p className="list-subtitle">
            Showing {filteredParties.length} of {parties.length} parties
          </p>
        </div>
      </div>

      <div className="list-filters">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by name, nickname, city, or contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="table-container">
        <table className="user-table"> {/* Reusing CSS */}
          <thead>
            <tr>
              <th>Party Name</th>
              <th>Contact Person</th>
              <th>City</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Added On</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredParties.map((party) => (
              <tr key={party.party_id} className="user-row">
                <td className="user-cell">
                  <div className="user-info">
                    <div className="user-avatar-placeholder">
                      {party.party_name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <span className="user-name">{party.party_name}</span>
                      {party.nickname && <div className="email-cell" style={{fontSize: '12px'}}>({party.nickname})</div>}
                    </div>
                  </div>
                </td>
                <td>{party.contact_person || 'N/A'}</td>
                <td>{party.city || 'N/A'}</td>
                <td>{party.phone || 'N/A'}</td>
                <td className="email-cell">{party.email || 'N/A'}</td>
                <td className="date-cell">{formatDate(party.created_at)}</td>
                <td className="actions-cell">
                  <button onClick={() => onUpdateParty(party.party_id, {})} className="status-select">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredParties.length === 0 && (
        <div className="no-results">
          <p>😕 No parties match your search criteria</p>
        </div>
      )}
    </div>
  );
};

export default PartyList;
