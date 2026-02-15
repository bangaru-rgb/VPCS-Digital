// src/components/Parties/EditPartyModal.js
import React, { useState, useEffect } from 'react';
import { updateParty } from '../../lib/supabaseClient';

const EditPartyModal = ({ party, onClose, onPartyUpdated }) => {
  const [partyName, setPartyName] = useState('');
  const [nickname, setNickname] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Populate form with existing party data
  useEffect(() => {
    if (party) {
      setPartyName(party.party_name || '');
      setNickname(party.nickname || '');
      setAddress(party.address || '');
      setCity(party.city || '');
      setState(party.state || '');
      setContactPerson(party.contact_person || '');
      setPhone(party.phone || '');
      setEmail(party.email || '');
    }
  }, [party]);

  const handleUpdateParty = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!partyName.trim()) {
      setError('Party Name is required.');
      setLoading(false);
      return;
    }

    try {
      const updatedData = {
        party_name: partyName.trim(),
        nickname: nickname.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        contact_person: contactPerson.trim(),
        phone: phone.trim(),
        email: email.trim()
      };

      const result = await updateParty(party.party_id, updatedData);

      if (!result.success) {
        throw new Error(result.error);
      }

      if (onPartyUpdated && result.data) {
        onPartyUpdated(result.data);
      }

      onClose();
    } catch (err) {
      setError(`Error updating party: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!party) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Party</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleUpdateParty}>
          <div className="form-group">
            <label htmlFor="partyName">
              Party Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="partyName"
              value={partyName}
              onChange={(e) => setPartyName(e.target.value)}
              placeholder="e.g., Acme Corp"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="nickname">
              Nickname <span className="optional">(Optional)</span>
            </label>
            <input
              type="text"
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g., Acme"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Address</label>
            <textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Main St"
              rows="2"
              disabled={loading}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city">City</label>
              <input
                type="text"
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Anytown"
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="state">State</label>
              <input
                type="text"
                id="state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="CA"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="contactPerson">Contact Person</label>
              <input
                type="text"
                id="contactPerson"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="John Doe"
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="text"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="555-123-4567"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contact@example.com"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="error-message">
              <span className="icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-button" disabled={loading}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className="submit-button">
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <span>💾</span>
                  <span>Update Party</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPartyModal;
