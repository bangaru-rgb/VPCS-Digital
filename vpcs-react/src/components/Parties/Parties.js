// src/components/Parties/Parties.js
import React, { useState, useEffect } from 'react';
import AddPartyForm from './AddPartyForm';
import PartyList from './PartyList';
import { getAllParties, updateParty } from '../../lib/supabaseClient';
import './Parties.css';

const Parties = ({ userInfo }) => {
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchParties = async () => {
    try {
      setLoading(true);
      setError('');
      
      const result = await getAllParties();
      
      if (result.success) {
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

  const handleUpdateParty = async (partyId, updatedData) => {
    try {
      // Optimistically update UI
      setParties(prevParties => 
        prevParties.map(party => 
          party.party_id === partyId ? { ...party, ...updatedData } : party
        )
      );

      const result = await updateParty(partyId, updatedData);
      
      if (!result.success) {
        // Revert on error
        fetchParties();
        alert(`Failed to update party: ${result.error}`);
      } else {
        // Show success feedback (optional)
        console.log('✅ Party updated successfully');
      }
    } catch (err) {
      console.error('Error updating party:', err);
      // Revert on error
      fetchParties();
      alert('An error occurred while updating party');
    }
  };

  return (
    <div className="parties-container">
      {/* Page Header */}
      <div className="header-info">
        <h1>👥 Parties Management</h1>
        <p className="header-subtitle">
          Manage suppliers, customers, and other business parties
        </p>
      </div>

      {/* Main Content Layout */}
      <div className="parties-layout">
        {/* --- Left Column: Add Party Form --- */}
        <div className="layout-left-column">
          <AddPartyForm 
            userInfo={userInfo} 
            onPartyAdded={fetchParties} 
          />
        </div>

        {/* --- Right Column: Party List and Stats --- */}
        <div className="layout-right-column">
          {/* Header Stats */}
          <div className="management-header">
            <div className="header-stats">
              <div className="stat-card">
                <div className="stat-value">{parties.length}</div>
                <div className="stat-label">Total Parties</div>
              </div>
            </div>
          </div>

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
            onUpdateParty={handleUpdateParty} 
          />
        </div>
      </div>
    </div>
  );
};

export default Parties;
