// src/components/Parties/AddPartyForm.js
import React, { useState } from 'react';
import { addParty } from '../../lib/supabaseClient';

const AddPartyForm = ({ userInfo, onPartyAdded }) => {
  const [partyName, setPartyName] = useState('');
  const [nickname, setNickname] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddParty = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!partyName) {
      setError('Party Name is required.');
      setLoading(false);
      return;
    }

    try {
      const newParty = {
        party_name: partyName.trim(),
        nickname: nickname.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        contact_person: contactPerson.trim(),
        phone: phone.trim(),
        email: email.trim(),
        created_by: userInfo.email,
        created_by_user_id: userInfo.authUserId
      };

      const result = await addParty(newParty);

      if (!result.success) {
        throw new Error(result.error);
      }

      setSuccess(`✅ Party "${partyName}" added successfully.`);
      setPartyName('');
      setNickname('');
      setAddress('');
      setCity('');
      setState('');
      setContactPerson('');
      setPhone('');
      setEmail('');
      
      if (onPartyAdded) {
        onPartyAdded();
      }

      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(`❌ Error adding party: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-user-form"> {/* Reusing CSS class for now */}
      <div className="form-header">
        <h2>➕ Add New Party</h2>
        <p className="form-subtitle">Add a new supplier, customer, or business party</p>
      </div>
      
      <form onSubmit={handleAddParty}>
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
        
        {success && (
          <div className="success-message">
            <span className="icon">✓</span>
            <span>{success}</span>
          </div>
        )}

        <button type="submit" disabled={loading} className="submit-button">
          {loading ? (
            <>
              <span className="spinner-small"></span>
              <span>Adding Party...</span>
            </>
          ) : (
            <>
              <span>➕</span>
              <span>Add Party</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default AddPartyForm;
