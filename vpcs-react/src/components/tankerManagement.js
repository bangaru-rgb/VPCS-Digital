// src/components/TankerManagement.js - Modern Master-Detail Pattern
import React, { useState, useEffect } from 'react';
import './tankerManagement.css';
import { supabase } from '../lib/supabaseClient';
import formatDate from '../lib/DD-MMM-YY-DateFromat';

function TankerManagement({ userInfo }) {
  // Format datetime with time
  const formatDateTime = (isoDate) => {
    if (!isoDate) return 'N/A';
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    const datePart = formatDate(isoDate);
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    
    return `${datePart} ${displayHours}:${minutes} ${ampm}`;
  };

  // State Management
  const [allTransporters, setAllTransporters] = useState([]);
  const [selectedTransporter, setSelectedTransporter] = useState(null);
  const [selectedTankers, setSelectedTankers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, inactive
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTanker, setEditingTanker] = useState(null);
  const [modalError, setModalError] = useState(''); // For showing errors in modal
  const [showSuggestions, setShowSuggestions] = useState(false); // NEW: For autocomplete
  const [filteredSuggestions, setFilteredSuggestions] = useState([]); // NEW: Filtered transporter names

  // Form state for Add/Edit
  const [formData, setFormData] = useState({
    transporterName: '',
    tankerNumber: '',
    tankerCapacity: ''
  });

  // Load all data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  // Auto-refresh detail panel when allTransporters changes and we have a selection
  useEffect(() => {
    if (selectedTransporter && allTransporters.length > 0) {
      const updatedTransporter = allTransporters.find(t => 
        t.name === selectedTransporter.name
      );
      
      if (updatedTransporter) {
        setSelectedTankers(updatedTransporter.tankers);
      }
    }
  }, [allTransporters]);

  // Load all transporters with their tanker counts
  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('Tankers_Info')
        .select('*')
        .order('Transporter_name', { ascending: true });

      if (error) throw error;

      // Group tankers by transporter
      const transporterMap = {};
      data.forEach(tanker => {
        const name = tanker.Transporter_name;
        if (!transporterMap[name]) {
          transporterMap[name] = {
            name: name,
            tankers: [],
            totalCount: 0,
            activeCount: 0,
            inactiveCount: 0
          };
        }
        transporterMap[name].tankers.push(tanker);
        transporterMap[name].totalCount++;
        if (tanker.record_status === 'Active') {
          transporterMap[name].activeCount++;
        } else {
          transporterMap[name].inactiveCount++;
        }
      });

      const transporterList = Object.values(transporterMap);
      setAllTransporters(transporterList);

    } catch (error) {
      console.error('Error loading data:', error);
      setMessage({ type: 'error', text: 'Failed to load data. Please refresh.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle transporter selection
  const handleSelectTransporter = (transporter) => {
    setSelectedTransporter(transporter);
    setSelectedTankers(transporter.tankers);
    setSearchQuery(''); // Clear search when selecting
  };

  // Get filtered transporters based on search
  const getFilteredTransporters = () => {
    if (!searchQuery.trim()) {
      return allTransporters;
    }

    const query = searchQuery.toLowerCase();
    
    // Search in both transporter name and vehicle numbers
    return allTransporters.filter(transporter => {
      // Match transporter name
      if (transporter.name.toLowerCase().includes(query)) {
        return true;
      }
      // Match any vehicle number
      return transporter.tankers.some(tanker => 
        tanker.Tanker_number.toLowerCase().includes(query)
      );
    });
  };

  // Get filtered tankers based on status filter
  const getFilteredTankers = () => {
    if (filterStatus === 'all') {
      return selectedTankers;
    }
    return selectedTankers.filter(tanker => 
      tanker.record_status.toLowerCase() === filterStatus
    );
  };

  // Handle search - auto-select if vehicle number match
  const handleSearch = (value) => {
    setSearchQuery(value);
    
    if (!value.trim()) return;

    const query = value.toLowerCase();
    
    // Check if searching for a specific vehicle number
    for (const transporter of allTransporters) {
      const matchingTanker = transporter.tankers.find(tanker =>
        tanker.Tanker_number.toLowerCase().includes(query)
      );
      
      if (matchingTanker) {
        // Auto-select this transporter
        handleSelectTransporter(transporter);
        break;
      }
    }
  };

  // NEW: Handle transporter name input change with autocomplete
  const handleTransporterNameChange = (value) => {
    setFormData({...formData, transporterName: value});
    
    // Show suggestions only if at least 3 characters are typed
    if (value.length >= 3) {
      const matches = allTransporters
        .map(t => t.name)
        .filter(name => name.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 5); // Limit to 5 suggestions
      
      setFilteredSuggestions(matches);
      setShowSuggestions(matches.length > 0);
    } else {
      setShowSuggestions(false);
      setFilteredSuggestions([]);
    }
  };

  // NEW: Handle suggestion selection
  const handleSelectSuggestion = (suggestion) => {
    setFormData({...formData, transporterName: suggestion});
    setShowSuggestions(false);
    setFilteredSuggestions([]);
  };

  // Add new tanker
  const handleAddTanker = () => {
    setEditingTanker(null);
    setModalError(''); // Clear any previous errors
    setShowSuggestions(false); // Clear suggestions
    setFilteredSuggestions([]);
    setFormData({
      transporterName: selectedTransporter?.name || '',
      tankerNumber: '',
      tankerCapacity: ''
    });
    setShowAddModal(true);
  };

  // Edit tanker
  const handleEditTanker = (tanker) => {
    setEditingTanker(tanker);
    setModalError(''); // Clear any previous errors
    setShowSuggestions(false);
    setFilteredSuggestions([]);
    setFormData({
      transporterName: tanker.Transporter_name,
      tankerNumber: tanker.Tanker_number,
      tankerCapacity: tanker.Tanker_capacity || ''
    });
    setShowAddModal(true);
  };

  // Save tanker (add or update)
  const handleSaveTanker = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setModalError(''); // Clear modal error

    try {
      if (editingTanker) {
        // Update existing tanker
        const { error } = await supabase
          .from('Tankers_Info')
          .update({
            Tanker_capacity: formData.tankerCapacity.trim() || null,
            Updated_by: userInfo.name
          })
          .eq('transporter_id', editingTanker.transporter_id);

        if (error) throw error;
        setMessage({ type: 'success', text: 'Tanker updated successfully!' });
        setShowAddModal(false);
      } else {
        // Add new tanker
        const { error } = await supabase
          .from('Tankers_Info')
          .insert([{
            Transporter_name: formData.transporterName.trim(),
            Tanker_number: formData.tankerNumber.trim().toUpperCase(),
            Tanker_capacity: formData.tankerCapacity.trim() || null,
            record_status: 'Active',
            Updated_by: userInfo.name
          }]);

        if (error) {
          // Check if it's a duplicate error
          if (error.code === '23505') {
            setModalError('This tanker number already exists. Please use a different number.');
          } else {
            setModalError('Failed to save tanker. Please try again.');
          }
          return; // Don't close modal, keep it open to show error
        }
        
        setMessage({ type: 'success', text: 'Tanker added successfully!' });
        setShowAddModal(false);
      }

      // Reload data to reflect changes
      await loadAllData();

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);

    } catch (error) {
      console.error('Error saving tanker:', error);
      setModalError('Failed to save tanker. Please try again.');
    }
  };

  // Toggle tanker status
  const handleToggleStatus = async (tanker) => {
    const newStatus = tanker.record_status === 'Active' ? 'Inactive' : 'Active';
    const action = newStatus === 'Active' ? 'activated' : 'deactivated';

    try {
      const { error } = await supabase
        .from('Tankers_Info')
        .update({
          record_status: newStatus,
          Updated_by: userInfo.name
        })
        .eq('transporter_id', tanker.transporter_id);

      if (error) throw error;

      setMessage({ 
        type: 'success', 
        text: `Tanker ${tanker.Tanker_number} ${action} successfully!` 
      });

      // Reload data
      await loadAllData();

      // Auto-hide message
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);

    } catch (error) {
      console.error('Error toggling status:', error);
      setMessage({ type: 'error', text: 'Failed to update status. Please try again.' });
    }
  };

  return (
    <div className="tanker-container">
      {/* TOP BAR - Search and Filters */}
      <div className="tanker-top-bar">
        <div className="search-section">
          <div className="search-box-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="unified-search-input"
              placeholder="Search by transporter name or tanker number..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {searchQuery && (
              <button 
                className="clear-search"
                onClick={() => {
                  setSearchQuery('');
                }}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="action-bar">
          <select 
            className="filter-dropdown"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* MESSAGE BANNER */}
      {message.text && (
        <div className={`message-banner ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* MASTER-DETAIL CONTAINER */}
      <div className="master-detail-container">
        {/* LEFT: Master Panel - Transporters */}
        <div className="master-panel">
          <div className="panel-header">
            <h3>Transporters</h3>
            <span className="count-badge">{getFilteredTransporters().length}</span>
          </div>

          <div className="transporter-list">
            {isLoading ? (
              <div className="loading-state">Loading transporters...</div>
            ) : getFilteredTransporters().length === 0 ? (
              <div className="empty-state">
                <p>No transporters found</p>
              </div>
            ) : (
              getFilteredTransporters().map((transporter, index) => (
                <div
                  key={index}
                  className={`transporter-card ${selectedTransporter?.name === transporter.name ? 'selected' : ''}`}
                  onClick={() => handleSelectTransporter(transporter)}
                >
                  <div className="transporter-card-header">
                    <span className="transporter-icon">🚛</span>
                    <span className="transporter-name">{transporter.name}</span>
                    <span className="vehicle-badge">📦 {transporter.totalCount}</span>
                  </div>
                  <div className="transporter-card-stats">
                    <span className="stat-item active">
                      ✓ {transporter.activeCount} active
                    </span>
                    {transporter.inactiveCount > 0 && (
                      <span className="stat-item inactive">
                        ✗ {transporter.inactiveCount} inactive
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT: Detail Panel - Tankers */}
        <div className="detail-panel">
          {/* Header with Add Tanker button - always visible */}
          <div className="panel-header">
            <div className="header-left">
              {selectedTransporter ? (
                <>
                  <h3>{selectedTransporter.name}</h3>
                  <div className="header-stats">
                    <span>{selectedTransporter.totalCount} tankers</span>
                    <span className="separator">•</span>
                    <span className="active-text">{selectedTransporter.activeCount} active</span>
                    {selectedTransporter.inactiveCount > 0 && (
                      <>
                        <span className="separator">•</span>
                        <span className="inactive-text">{selectedTransporter.inactiveCount} inactive</span>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <h3>Tankers</h3>
              )}
            </div>
            <button 
              onClick={handleAddTanker}
              className="btn btn-sm btn-primary"
            >
              ➕ Add Tanker
            </button>
          </div>

          {/* Content area */}
          {selectedTransporter ? (
            <div className="tanker-details-list">
              {getFilteredTankers().length === 0 ? (
                <div className="empty-state">
                  <p>No tankers match the current filter</p>
                </div>
              ) : (
                getFilteredTankers().map((tanker) => (
                  <div 
                    key={tanker.transporter_id}
                    className={`tanker-detail-card ${tanker.record_status.toLowerCase()}`}
                  >
                    <div className="tanker-detail-header">
                      <div className="tanker-number-section">
                        <span className="tanker-number">{tanker.Tanker_number}</span>
                        <span className={`status-indicator ${tanker.record_status.toLowerCase()}`}>
                          {tanker.record_status === 'Active' ? '● Active' : '○ Inactive'}
                        </span>
                      </div>
                      <div className="tanker-actions">
                        <button
                          onClick={() => handleEditTanker(tanker)}
                          className="btn-icon"
                          title="Edit capacity"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleToggleStatus(tanker)}
                          className={`btn-icon btn-toggle ${tanker.record_status.toLowerCase()}`}
                          title={tanker.record_status === 'Active' ? 'Deactivate' : 'Activate'}
                        >
                          {tanker.record_status === 'Active' ? '⊗' : '✓'}
                        </button>
                      </div>
                    </div>

                    <div className="tanker-detail-body">
                      <div className="detail-row">
                        <span className="detail-label">Capacity:</span>
                        <span className="detail-value">
                          {tanker.Tanker_capacity || 'Not specified'}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Info:</span>
                        <span className="detail-value audit-info">
                          {tanker.updated_at && tanker.updated_at !== tanker.created_at
                            ? `Updated by ${tanker.Updated_by || 'Unknown'} on ${formatDateTime(tanker.updated_at)}`
                            : `Created by ${tanker.Updated_by || 'Unknown'} on ${formatDateTime(tanker.created_at)}`
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="empty-detail-state">
              <div className="empty-icon">🚚</div>
              <h3>Select a Transporter</h3>
              <p>Choose a transporter from the list to view and manage their tankers</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingTanker ? 'Edit Tanker' : 'Add New Tanker'}</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="modal-close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTanker} className="modal-form">
              {/* Show error in modal if present */}
              {modalError && (
                <div className="modal-error-banner">
                  ⚠️ {modalError}
                </div>
              )}

              <div className="form-group">
                <label>
                  Transporter Name <span className="required">*</span>
                </label>
                <div className="autocomplete-wrapper">
                  <input
                    type="text"
                    value={formData.transporterName}
                    onChange={(e) => handleTransporterNameChange(e.target.value)}
                    onBlur={() => {
                      // Delay hiding to allow click on suggestion
                      setTimeout(() => setShowSuggestions(false), 200);
                    }}
                    onFocus={() => {
                      if (formData.transporterName.length >= 3 && filteredSuggestions.length > 0) {
                        setShowSuggestions(true);
                      }
                    }}
                    placeholder="Enter transporter name (min 3 chars for suggestions)"
                    required
                    disabled={editingTanker}
                    className="form-input"
                  />
                  {showSuggestions && filteredSuggestions.length > 0 && (
                    <div className="suggestions-dropdown">
                      {filteredSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="suggestion-item"
                          onMouseDown={(e) => {
                            e.preventDefault(); // Prevent blur
                            handleSelectSuggestion(suggestion);
                          }}
                        >
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>
                  Tanker Number <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={formData.tankerNumber}
                  onChange={(e) => setFormData({...formData, tankerNumber: e.target.value})}
                  placeholder="e.g., AP39T1234"
                  required
                  disabled={editingTanker}
                  className="form-input tanker-number-input"
                />
              </div>

              <div className="form-group">
                <label>
                  Tanker Capacity <span className="optional">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.tankerCapacity}
                  onChange={(e) => setFormData({...formData, tankerCapacity: e.target.value})}
                  placeholder="e.g., 20000 liters"
                  className="form-input"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {editingTanker ? 'Save Changes' : 'Add Tanker'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TankerManagement;