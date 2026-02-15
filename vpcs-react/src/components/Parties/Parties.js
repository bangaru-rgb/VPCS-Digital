// src/components/Parties/Parties.js
import React, { useState, useEffect } from 'react';
import AddPartyForm from './AddPartyForm';
import PartyList from './PartyList';
import { getAllParties, updatePartyStatus } from '../../lib/supabaseClient';
import './Parties.css';

const Parties = ({ userInfo }) => {
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchParties = async () => {
    try {
      setLoading(true);
      setError('');

      const result = await getAllParties();

      if (result.success) {
        console.log('📦 Parties data:', result.data); // Debug log to check address field
        setParties(result.data || []);
      } else {
        setError(result.error || 'Failed to load parties');
      }
    } catch (err) {
      console.error('Error fetching parties:', err);
      setError('An unexpected error occurred while loading parties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParties();
  }, []);

  const handlePartyUpdated = (updatedParty) => {
    // Update the party in place without refetching to maintain position
    if (updatedParty) {
      setParties(prevParties =>
        prevParties.map(party =>
          party.party_id === updatedParty.party_id ? updatedParty : party
        )
      );
    } else {
      // Fallback: refresh the entire list
      fetchParties();
    }
  };


  const handlePartyAdded = () => {
    fetchParties();
    setShowAddModal(false);
  };

  const handleToggleStatus = async (party) => {
    const currentStatus = party.status;
    const newStatus = currentStatus === 'Active' || currentStatus === 'active' ? 'Inactive' : 'Active';
    const actionText = (newStatus === 'Active' || newStatus === 'active') ? 'activate' : 'deactivate';

    if (!window.confirm(`Are you sure you want to ${actionText} "${party.party_name}"?`)) {
      return;
    }

    try {
      const result = await updatePartyStatus(party.party_id, newStatus);

      if (!result.success) {
        throw new Error(result.error);
      }

      // Update the party in place to maintain position
      if (result.data) {
        setParties(prevParties =>
          prevParties.map(p =>
            p.party_id === party.party_id ? result.data : p
          )
        );
      } else {
        // Fallback: refresh the entire list
        fetchParties();
      }
    } catch (err) {
      console.error('Error updating party status:', err);
      setError(`Failed to ${actionText} party: ${err.message}`);
    }
  };

  return (
    <div className="parties-container">
      {/* Error Message */}
      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
          <button onClick={fetchParties} className="retry-button">
            Retry
          </button>
        </div>
      )}

      {/* Party List */}
      <PartyList
        parties={parties}
        loading={loading}
        onUpdateParty={handlePartyUpdated}
        onAddParty={() => setShowAddModal(true)}
        onToggleStatus={handleToggleStatus}
      />

      {/* Add Party Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Party</h2>
              <button className="close-button" onClick={() => setShowAddModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <AddPartyForm
                userInfo={userInfo}
                onPartyAdded={handlePartyAdded}
                onCancel={() => setShowAddModal(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Parties;
