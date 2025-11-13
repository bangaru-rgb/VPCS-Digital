// src/components/TankerManagement.js
import React, { useState, useEffect } from 'react';
import './tankerManagement.css';
import { supabase } from '../lib/supabaseClient';
import formatDate from '../lib/DD-MMM-YY-DateFromat';

function TankerManagement({ userInfo }) {
  const [formData, setFormData] = useState({
    transporterName: '',
    tankerNumber: '',
    tankerCapacity: ''
  });

  const [transporters, setTransporters] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [existingTankers, setExistingTankers] = useState([]);
  const [showExistingTankers, setShowExistingTankers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [lastEntry, setLastEntry] = useState(null);

  // Fetch all unique transporter names on component mount
  useEffect(() => {
    fetchTransporters();
  }, []);

  const fetchTransporters = async () => {
    try {
      const { data, error } = await supabase
        .from('Tankers_Info')
        .select('Transporter_name')
        .order('Transporter_name', { ascending: true });

      if (error) throw error;

      // Get unique transporter names
      const uniqueTransporters = [...new Set(data.map(item => item.Transporter_name))];
      setTransporters(uniqueTransporters);
    } catch (error) {
      console.error('Error fetching transporters:', error);
    }
  };

  // Check for existing tankers when transporter is selected
  const fetchExistingTankers = async (transporterName) => {
    if (!transporterName.trim()) {
      setExistingTankers([]);
      setShowExistingTankers(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('Tankers_Info')
        .select('*')
        .eq('Transporter_name', transporterName)
        .order('Tanker_number', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setExistingTankers(data);
        setShowExistingTankers(true);
      } else {
        setExistingTankers([]);
        setShowExistingTankers(false);
      }
    } catch (error) {
      console.error('Error fetching existing tankers:', error);
    }
  };

  const handleTransporterChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, transporterName: value });

    // Filter suggestions
    if (value.trim()) {
      const filtered = transporters.filter(name =>
        name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    // Fetch existing tankers if exact match
    if (transporters.includes(value)) {
      fetchExistingTankers(value);
    } else {
      setExistingTankers([]);
      setShowExistingTankers(false);
    }
  };

  const handleSuggestionClick = (transporter) => {
    setFormData({ ...formData, transporterName: transporter });
    setShowSuggestions(false);
    fetchExistingTankers(transporter);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Check for duplicate tanker number
  const checkDuplicate = async (tankerNumber, transporterName) => {
    try {
      const { data } = await supabase
        .from('Tankers_Info')
        .select('*')
        .eq('Tanker_number', tankerNumber)
        .eq('Transporter_name', transporterName)
        .single();

      return data !== null;
    } catch (error) {
      // If error is "PGRST116" it means no rows found, which is good
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      // Validate required fields
      if (!formData.transporterName.trim()) {
        setMessage({ type: 'error', text: 'Transporter name is required' });
        setIsSubmitting(false);
        return;
      }

      if (!formData.tankerNumber.trim()) {
        setMessage({ type: 'error', text: 'Tanker number is required' });
        setIsSubmitting(false);
        return;
      }

      // Validate userInfo exists and has required fields
      if (!userInfo || !userInfo.name || !userInfo.EmpLogin_ID) {
        setMessage({ 
          type: 'error', 
          text: 'User information is incomplete. Please log in again.' 
        });
        setIsSubmitting(false);
        return;
      }

      // Get the currently authenticated user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setMessage({ type: 'error', text: 'Authentication error. Please log in again.' });
        setIsSubmitting(false);
        return;
      }

      // Check for duplicate
      const isDuplicate = await checkDuplicate(
        formData.tankerNumber.trim().toUpperCase(),
        formData.transporterName.trim()
      );

      if (isDuplicate) {
        setMessage({ 
          type: 'error', 
          text: `Tanker ${formData.tankerNumber.toUpperCase()} already exists for ${formData.transporterName}` 
        });
        setIsSubmitting(false);
        return;
      }

      // Get current date and time
      const currentDateTime = new Date().toISOString();

      // Prepare data for insertion
      const dataToInsert = {
        Transporter_name: formData.transporterName.trim(),
        Tanker_number: formData.tankerNumber.trim().toUpperCase(),
        Tanker_capacity: formData.tankerCapacity.trim() || null,
        // created_by_user_id: user.id, // New column for tracking creator
        // updated_by_user_id: user.id, // New column for tracking last updater (same on creation)
        status: 'Active' // New column with default status
      };

      // Insert into Supabase
      const { error } = await supabase
        .from('Tankers_Info')
        .insert([dataToInsert])
        .select();

      if (error) throw error;

      // Success
      setLastEntry(dataToInsert);
      setMessage({ type: 'success', text: 'Tanker added successfully!' });

      // Refresh transporters list and existing tankers
      await fetchTransporters();
      await fetchExistingTankers(dataToInsert.Transporter_name);

      // Reset form
      setFormData({
        transporterName: dataToInsert.Transporter_name, // Keep transporter name for easy multiple entries
        tankerNumber: '',
        tankerCapacity: ''
      });

      // Clear success message after 5 seconds
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000);

    } catch (error) {
      console.error('Error adding tanker:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to add tanker. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      transporterName: '',
      tankerNumber: '',
      tankerCapacity: ''
    });
    setMessage({ type: '', text: '' });
    setLastEntry(null);
    setSuggestions([]);
    setShowSuggestions(false);
    setExistingTankers([]);
    setShowExistingTankers(false);
  };

  return (
    <div className="tanker-management-container">
      <div className="tanker-header">
        <h1>🚚 Tanker Management</h1>
        <p>Add and manage tanker information</p>
      </div>

      <div className="tanker-content">
        {/* Form Section */}
        <div className="tanker-card">
          <h2>Add New Tanker</h2>
          <form onSubmit={handleSubmit} className="tanker-form">
            {/* Transporter Name with Autocomplete */}
            <div className="form-group">
              <label htmlFor="transporterName">
                Transporter Name <span className="required">*</span>
              </label>
              <div className="autocomplete-wrapper">
                <input
                  type="text"
                  id="transporterName"
                  name="transporterName"
                  value={formData.transporterName}
                  onChange={handleTransporterChange}
                  placeholder="Enter transporter name"
                  required
                  className="form-input"
                  autoComplete="off"
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div className="suggestions-dropdown">
                    {suggestions.map((transporter, index) => (
                      <div
                        key={index}
                        className="suggestion-item"
                        onClick={() => handleSuggestionClick(transporter)}
                      >
                        {transporter}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Tanker Number */}
            <div className="form-group">
              <label htmlFor="tankerNumber">
                Tanker Number <span className="required">*</span>
              </label>
              <input
                type="text"
                id="tankerNumber"
                name="tankerNumber"
                value={formData.tankerNumber}
                onChange={handleChange}
                placeholder="Enter tanker number (e.g., AP39T1234)"
                required
                className="form-input tanker-number-input"
              />
            </div>

            {/* Tanker Capacity */}
            <div className="form-group">
              <label htmlFor="tankerCapacity">
                Tanker Capacity <span className="optional">(Optional)</span>
              </label>
              <input
                type="text"
                id="tankerCapacity"
                name="tankerCapacity"
                value={formData.tankerCapacity}
                onChange={handleChange}
                placeholder="Enter capacity (e.g., 20000 liters)"
                className="form-input"
              />
            </div>

            {/* Message Display */}
            {message.text && (
              <div className={`message ${message.type}`}>
                {message.text}
              </div>
            )}

            {/* Last Entry Display */}
            {lastEntry && message.type === 'success' && (
              <div className="last-entry-display">
                <div className="last-entry-header">
                  <strong>Tanker Added:</strong>
                </div>
                <div className="entry-detail">
                    <span className="detail-label">Transporter:</span>
                    <span className="detail-value">{lastEntry.Transporter_name}</span>
                  </div>
                  <div className="entry-detail">
                    <span className="detail-label">Tanker Number:</span>
                    <span className="detail-value tanker-badge">{lastEntry.Tanker_number}</span>
                  </div>
                </div>
            )}

            {/* Form Actions */}
            <div className="form-actions">
              <button
                type="button"
                onClick={handleReset}
                className="btn btn-secondary"
                disabled={isSubmitting}
              >
                Reset
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Tanker'}
              </button>
            </div>
          </form>
        </div>

        {/* Existing Tankers Display */}
        {showExistingTankers && existingTankers.length > 0 && (
          <div className="tanker-card">
            <h2>📋 Existing Tankers for {formData.transporterName}</h2>
            <div className="tankers-list">
              {existingTankers.map((tanker) => (
                <div key={tanker.transporter_id} className="tanker-item">
                  <div className="tanker-item-header">
                    <span className="tanker-number">{tanker.Tanker_number}</span>
                    <span className="tanker-capacity">{tanker.Tanker_capacity || 'N/A'}</span>
                  </div>
                  <div className="tanker-item-footer">
                    <span className="updated-info">
                      {tanker.updated_by ? `Updated: ${tanker.updated_by}` : `Created: ${tanker.created_by || 'No info'}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="tankers-count">
              Total Tankers: <strong>{existingTankers.length}</strong>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="tanker-card info-box">
            <div className="info-icon">💡</div>
            <div className="info-content">
            <h3>Instructions</h3>
            <ul>
                <li><strong>Autocomplete:</strong> Start typing transporter name to see suggestions.</li>
                <li><strong>Existing Tankers:</strong> Select a transporter to view their registered tankers.</li>
                <li><strong>Duplicate Prevention:</strong> The system prevents duplicate tanker numbers for the same transporter.</li>
                <li><strong>Auto-tracking:</strong> Your name and timestamp are automatically recorded.</li>
                <li><strong>Quick Entry:</strong> After adding a tanker, the transporter name stays for easy multiple entries.</li>
            </ul>
            </div>
        </div>
      </div>
    </div>
  );
}

export default TankerManagement;