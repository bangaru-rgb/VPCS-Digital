// src/components/TankerManagement.js - Updated without duplicate header
import React, { useState, useEffect } from 'react';
import './tankerManagement.css';
import { supabase } from '../lib/supabaseClient';
import formatDate from '../lib/DD-MMM-YY-DateFromat';

function TankerManagement({ userInfo }) {
  // Format datetime with time (using your standard date format + time)
  const formatDateTime = (isoDate) => {
    if (!isoDate) return 'N/A';
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    const datePart = formatDate(isoDate); // DD-MMM-YY
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    
    return `${datePart} ${displayHours}:${minutes} ${ampm}`;
  };

  const [formData, setFormData] = useState({
    transporterName: '',
    tankerNumber: '',
    tankerCapacity: ''
  });

  const [mode, setMode] = useState('create'); // 'create' or 'edit'
  const [editingItem, setEditingItem] = useState(null);
  const [transporters, setTransporters] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [existingTankers, setExistingTankers] = useState([]);
  const [showExistingTankers, setShowExistingTankers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [lastEntry, setLastEntry] = useState(null);
  const [searchQuery, setSearchQuery] = useState(''); // New: for search filter

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

      const uniqueTransporters = [...new Set(data.map(item => item.Transporter_name))];
      setTransporters(uniqueTransporters);
    } catch (error) {
      console.error('Error fetching transporters:', error);
    }
  };

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
        setSearchQuery(''); // Reset search when loading new transporter
      } else {
        setExistingTankers([]);
        setShowExistingTankers(false);
      }
    } catch (error) {
      console.error('Error fetching existing tankers:', error);
    }
  };

  // Filter tankers based on search query (transporter name OR tanker number)
  const getFilteredTankers = () => {
    if (!searchQuery.trim()) {
      return existingTankers;
    }

    const query = searchQuery.toLowerCase();
    return existingTankers.filter(tanker => 
      tanker.Transporter_name.toLowerCase().includes(query) ||
      tanker.Tanker_number.toLowerCase().includes(query)
    );
  };

  const handleTransporterChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, transporterName: value });

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
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (mode === 'edit') {
      await handleUpdate();
    } else {
      await handleCreate();
    }
  };

  const handleCreate = async () => {
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
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

      if (!userInfo || !userInfo.name || !userInfo.EmpLogin_ID) {
        setMessage({ 
          type: 'error', 
          text: 'User information is incomplete. Please log in again.' 
        });
        setIsSubmitting(false);
        return;
      }

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

      const dataToInsert = {
        Transporter_name: formData.transporterName.trim(),
        Tanker_number: formData.tankerNumber.trim().toUpperCase(),
        Tanker_capacity: formData.tankerCapacity.trim() || null,
        status: 'Active',
        Updated_by: userInfo.name
        // created_at, updated_at, created_by_user_id, updated_by_user_id
        // are all set automatically by database trigger
      };

      const { error } = await supabase
        .from('Tankers_Info')
        .insert([dataToInsert])
        .select();

      if (error) throw error;

      setLastEntry(dataToInsert);
      setMessage({ 
        type: 'success', 
        text: `Tanker ${dataToInsert.Tanker_number} added successfully!` 
      });

      // Reset form but keep transporter name for quick multiple entries
      setFormData({
        transporterName: formData.transporterName,
        tankerNumber: '',
        tankerCapacity: ''
      });

      // Refresh existing tankers list
      fetchExistingTankers(formData.transporterName);
      fetchTransporters(); // Update transporters list

      // Clear success message after 5 seconds
      setTimeout(() => {
        setMessage({ type: '', text: '' });
        setLastEntry(null);
      }, 5000);

    } catch (error) {
      console.error('Error adding tanker:', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to add tanker. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      if (!editingItem) {
        setMessage({ type: 'error', text: 'No tanker selected for editing' });
        setIsSubmitting(false);
        return;
      }

      const { error } = await supabase
        .from('Tankers_Info')
        .update({
          Tanker_capacity: formData.tankerCapacity.trim() || null,
          Updated_by: userInfo.name
          // updated_at and updated_by_user_id are set automatically by trigger
        })
        .eq('transporter_id', editingItem.transporter_id);

      if (error) throw error;

      setMessage({ 
        type: 'success', 
        text: `Tanker ${editingItem.Tanker_number} updated successfully!` 
      });

      // Reset to create mode
      setMode('create');
      setEditingItem(null);
      setFormData({
        transporterName: formData.transporterName,
        tankerNumber: '',
        tankerCapacity: ''
      });

      // Refresh existing tankers list
      fetchExistingTankers(formData.transporterName);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);

    } catch (error) {
      console.error('Error updating tanker:', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to update tanker. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (tanker) => {
    setMode('edit');
    setEditingItem(tanker);
    setFormData({
      transporterName: tanker.Transporter_name,
      tankerNumber: tanker.Tanker_number,
      tankerCapacity: tanker.Tanker_capacity || ''
    });
    setMessage({ type: '', text: '' });
    setLastEntry(null);

    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setMode('create');
    setEditingItem(null);
    setFormData({
      transporterName: formData.transporterName,
      tankerNumber: '',
      tankerCapacity: ''
    });
    setMessage({ type: '', text: '' });
  };

  const handleToggleStatus = async (tanker) => {
    try {
      const newStatus = tanker.status === 'Active' ? 'Inactive' : 'Active';

      const { error } = await supabase
        .from('Tankers_Info')
        .update({
          status: newStatus,
          Updated_by: userInfo.name
          // updated_at and updated_by_user_id are set automatically by trigger
        })
        .eq('transporter_id', tanker.transporter_id);

      if (error) throw error;

      setMessage({ 
        type: 'success', 
        text: `Tanker ${tanker.Tanker_number} marked as ${newStatus}` 
      });

      // Refresh existing tankers list
      fetchExistingTankers(formData.transporterName);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);

    } catch (error) {
      console.error('Error toggling tanker status:', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to update tanker status. Please try again.' 
      });
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
    setExistingTankers([]);
    setShowExistingTankers(false);
    setShowSuggestions(false);
  };

  return (
    <div className="tanker-container">
      {/* REMOVED: Page header - now handled by PageHeader component */}

      <div className="tanker-content">
        {/* === FORM SECTION === */}
        <div className="tanker-card">
          <h2>
            {mode === 'create' ? '➕ Add New Tanker' : `✏️ Edit: ${editingItem?.Tanker_number}`}
          </h2>
          
          <form onSubmit={handleSubmit} className="tanker-form">
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
                  placeholder="Start typing transporter name..."
                  required
                  className="form-input"
                  autoComplete="off"
                  disabled={mode === 'edit'}
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
                placeholder="e.g., AP39T1234"
                required
                className="form-input tanker-number-input"
                disabled={mode === 'edit'}
              />
            </div>

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
                placeholder="e.g., 20000 liters"
                className="form-input"
              />
            </div>

            {message.text && (
              <div className={`message ${message.type}`}>
                {message.text}
              </div>
            )}

            {lastEntry && message.type === 'success' && (
              <div className="last-entry-display">
                <div className="last-entry-header">
                  ✓ Tanker Added Successfully
                </div>
                <div className="entry-detail">
                  <span className="detail-label">Transporter:</span>
                  <span className="detail-value">{lastEntry.Transporter_name}</span>
                </div>
                <div className="entry-detail">
                  <span className="detail-label">Tanker Number:</span>
                  <span className="detail-value tanker-badge">{lastEntry.Tanker_number}</span>
                </div>
                {lastEntry.Tanker_capacity && (
                  <div className="entry-detail">
                    <span className="detail-label">Capacity:</span>
                    <span className="detail-value">{lastEntry.Tanker_capacity}</span>
                  </div>
                )}
              </div>
            )}

            <div className="form-actions">
              {mode === 'edit' ? (
                <>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="btn btn-secondary"
                    disabled={isSubmitting}
                  >
                    ✕ Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? '⏳ Saving...' : '✓ Save Changes'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="btn btn-secondary"
                    disabled={isSubmitting}
                  >
                    ↻ Reset
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? '⏳ Adding...' : '➕ Add Tanker'}
                  </button>
                </>
              )}
            </div>
          </form>
        </div>

        {/* === EXISTING TANKERS SECTION === */}
        {showExistingTankers && existingTankers.length > 0 && (
          <div className="tanker-card">
            <h2>📋 Tankers: {formData.transporterName}</h2>
            
            {/* Search Box */}
            <div className="tanker-search-box">
              <input
                type="text"
                placeholder="🔍 Search by transporter name or vehicle number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="clear-search-btn"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="tankers-list">
              {getFilteredTankers().length > 0 ? (
                getFilteredTankers().map((tanker) => (
                  <div 
                    key={tanker.transporter_id} 
                    className={`tanker-item ${editingItem?.transporter_id === tanker.transporter_id ? 'editing' : ''} ${tanker.status === 'Inactive' ? 'inactive' : ''}`}
                  >
                  <div className="tanker-item-header">
                    <div className="tanker-header-left">
                      <span className="tanker-number">{tanker.Tanker_number}</span>
                      <span className={`status-badge ${tanker.status.toLowerCase()}`}>
                        {tanker.status}
                      </span>
                    </div>
                    <span className="tanker-capacity">
                      {tanker.Tanker_capacity || 'Capacity N/A'}
                    </span>
                  </div>
                  
                  <div className="tanker-item-body">
                    <span className="tanker-info">
                      {tanker.updated_at && tanker.updated_at !== tanker.created_at
                        ? `Updated by ${tanker.Updated_by || 'Unknown'} on ${formatDateTime(tanker.updated_at)}`
                        : `Created by ${tanker.Updated_by || 'Unknown'} on ${formatDateTime(tanker.created_at)}`
                      }
                    </span>
                  </div>
                  
                  <div className="tanker-item-actions">
                    <button
                      onClick={() => handleEdit(tanker)}
                      className="btn btn-sm btn-edit"
                      disabled={mode === 'edit' && editingItem?.transporter_id !== tanker.transporter_id}
                      title="Edit tanker capacity"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleToggleStatus(tanker)}
                      className={`btn btn-sm ${tanker.status === 'Active' ? 'btn-warning' : 'btn-success'}`}
                      disabled={mode === 'edit'}
                      title={tanker.status === 'Active' ? 'Mark as Inactive' : 'Mark as Active'}
                    >
                      {tanker.status === 'Active' ? '⊗ Deactivate' : '✓ Activate'}
                    </button>
                  </div>
                </div>
              ))
              ) : (
                <div className="no-search-results">
                  <p>🔍 No tankers found matching "{searchQuery}"</p>
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="btn btn-secondary btn-sm"
                  >
                    Clear Search
                  </button>
                </div>
              )}
            </div>
            
            <div className="tankers-count">
              {searchQuery ? (
                <>
                  Showing: <strong>{getFilteredTankers().length}</strong> of <strong>{existingTankers.length}</strong> tankers
                </>
              ) : (
                <>
                  Total: <strong>{existingTankers.length}</strong> tankers
                  <span className="count-breakdown">
                    (Active: <strong className="active-count">{existingTankers.filter(t => t.status === 'Active').length}</strong>, 
                    Inactive: <strong className="inactive-count">{existingTankers.filter(t => t.status === 'Inactive').length}</strong>)
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {/* === INSTRUCTIONS SECTION === */}
        <div className="tanker-card info-box">
          <div className="info-icon">💡</div>
          <div className="info-content">
            <h3>Quick Guide</h3>
            <ul>
              <li><strong>Autocomplete:</strong> Type transporter name to see suggestions from existing entries</li>
              <li><strong>View Tankers:</strong> Select a transporter to view all registered tankers</li>
              <li><strong>Edit Capacity:</strong> Click "Edit" to modify tanker capacity only</li>
              <li><strong>Manage Status:</strong> Deactivate unused tankers (data preserved) or reactivate when needed</li>
              <li><strong>Quick Entry:</strong> After adding a tanker, the transporter name stays for faster multiple entries</li>
              <li><strong>Duplicate Check:</strong> System prevents duplicate tanker numbers per transporter</li>
              <li><strong>Auto-tracking:</strong> Your name and timestamp are recorded automatically</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TankerManagement;