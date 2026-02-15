// src/components/Parties/PartyList.js
import React, { useState } from 'react';
import EditPartyModal from './EditPartyModal';

const PartyList = ({ parties, loading, onUpdateParty, onAddParty, onToggleStatus }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingParty, setEditingParty] = useState(null);

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

  const handlePartyUpdated = (updatedParty) => {
    if (onUpdateParty) {
      onUpdateParty(updatedParty);
    }
  };


  return (
    <div className="user-list"> {/* Reusing CSS */}
      <div className="list-header">
        <div className="filter-row">
          <div className="filter-tabs">
            <button className="filter-tab active">
              All ({parties.length})
            </button>
          </div>
          <button
            onClick={onAddParty}
            className="btn btn-sm btn-primary add-party-btn"
          >
            <span className="btn-icon">+</span>
            Add Party
          </button>
        </div>

        <div className="search-wrapper">
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
              <th>Address</th>
              <th>City</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Added/Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredParties.map((party) => (
              <tr key={party.party_id} className="user-row">
                <td className="user-cell">
                  <div>
                    <span className="user-name">{party.party_name}</span>
                    {party.nickname && <div className="email-cell" style={{fontSize: '12px'}}>({party.nickname})</div>}
                  </div>
                </td>
                <td>{party.contact_person || 'N/A'}</td>
                <td>{party.address || 'N/A'}</td>
                <td>{party.city || 'N/A'}</td>
                <td>{party.phone || 'N/A'}</td>
                <td className="email-cell">{party.email || 'N/A'}</td>
                <td className="date-cell">{formatDate(party.updated_at || party.created_at)}</td>
                <td className="actions-cell">
                  <button
                    onClick={() => setEditingParty(party)}
                    className="btn-icon"
                    title="Edit party"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => onToggleStatus(party)}
                    className={`btn-toggle ${party.status?.toLowerCase() === 'active' ? 'btn-deactivate' : 'btn-activate'}`}
                    title={party.status?.toLowerCase() === 'active' ? 'Deactivate party' : 'Activate party'}
                  >
                    {party.status?.toLowerCase() === 'active' ? '⊗' : '▶️'}
                  </button>
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

      {editingParty && (
        <EditPartyModal
          party={editingParty}
          onClose={() => setEditingParty(null)}
          onPartyUpdated={handlePartyUpdated}
        />
      )}
    </div>
  );
};

export default PartyList;
