// src/components/baseCompanyManagement.js
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import './baseCompanyManagement.css';

/**
 * Formats an ISO date string to DD-MMM-YY format
 * @param {string} isoDate - ISO date string to format
 * @returns {string} Formatted date string (e.g., "05-Dec-23")
 */
const formatDate = (isoDate) => {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  const day = date.getDate().toString().padStart(2, '0');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear().toString().slice(-2);
  return `${day}-${month}-${year}`;
};

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

const BaseCompanyManagement = ({ userInfo }) => {
  const [companies, setCompanies] = useState([]);
  const [userNames, setUserNames] = useState({}); // State for user names
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, inactive

  // Form state
  const [formData, setFormData] = useState({
    base_company_name: '',
    nickname: '',
    gst_number: '',
    address: '',
    contact_person: '',
    phones: [''],
    emails: ['']
  });
  
  // Nickname validation state
  const [nicknameStatus, setNicknameStatus] = useState('idle'); // 'idle', 'checking', 'available', 'taken', 'invalid'
  const [nicknameMessage, setNicknameMessage] = useState('');
  const [nicknameCheckTimer, setNicknameCheckTimer] = useState(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch companies
      const { data: companiesData, error: companiesError } = await supabase
        .from('Base_Company')
        .select('*')
        .order('created_at', { ascending: false });

      if (companiesError) {
        console.error('Supabase error:', companiesError);
        throw companiesError;
      }
      
      setCompanies(companiesData || []);

      // 2. Fetch user names from 'Approved_Users' table
      if (companiesData && companiesData.length > 0) {
        const userIds = new Set();
        companiesData.forEach(company => {
          if (company.created_by_user_id) userIds.add(company.created_by_user_id);
          if (company.updated_by_user_id) userIds.add(company.updated_by_user_id);
        });

        if (userIds.size > 0) {
            // Convert UUIDs to strings for matching with the 'text' column
            const userIdStrings = Array.from(userIds).map(id => String(id));

            const { data: usersData, error: usersError } = await supabase
              .from('Approved_Users')
              .select('google_user_id, full_name')
              .in('google_user_id', userIdStrings);

            if (usersError) {
              console.error('Error fetching user names:', usersError);
            } else if (usersData) {
              const namesMap = usersData.reduce((acc, user) => {
                acc[user.google_user_id] = user.full_name;
                return acc;
              }, {});
              setUserNames(namesMap);
            }
        }
      }

    } catch (error) {
      console.error('Error fetching companies:', error);
      setError(`Failed to load companies: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Handle nickname validation with debouncing
    if (name === 'nickname') {
      handleNicknameChange(value);
    }
  };
  
  const handleNicknameChange = (value) => {
    // Clear previous timer
    if (nicknameCheckTimer) {
      clearTimeout(nicknameCheckTimer);
    }
    
    // Reset status
    setNicknameStatus('idle');
    setNicknameMessage('');
    
    // Validate format
    const trimmedValue = value.trim();
    if (trimmedValue === '') {
      return;
    }
    
    // Check length
    if (trimmedValue.length < 2) {
      setNicknameStatus('invalid');
      setNicknameMessage('Nickname must be at least 2 characters');
      return;
    }
    
    if (trimmedValue.length > 20) {
      setNicknameStatus('invalid');
      setNicknameMessage('Nickname must be 20 characters or less');
      return;
    }
    
    // Check for valid characters (alphanumeric, hyphens, underscores)
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmedValue)) {
      setNicknameStatus('invalid');
      setNicknameMessage('Only letters, numbers, hyphens, and underscores allowed');
      return;
    }
    
    // Set checking status
    setNicknameStatus('checking');
    setNicknameMessage('Checking availability...');
    
    // Debounce the API call
    const timer = setTimeout(() => {
      checkNicknameAvailability(trimmedValue);
    }, 500); // 500ms delay
    
    setNicknameCheckTimer(timer);
  };
  
  const checkNicknameAvailability = async (nickname) => {
    try {
      let query = supabase
        .from('Base_Company')
        .select('base_company_id, nickname')
        .eq('nickname', nickname);
      
      // If editing, exclude current company from check
      if (editingCompany) {
        query = query.neq('base_company_id', editingCompany.base_company_id);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error checking nickname:', error);
        setNicknameStatus('invalid');
        setNicknameMessage('Error checking availability');
        return;
      }
      
      if (data && data.length > 0) {
        setNicknameStatus('taken');
        setNicknameMessage('This nickname is already taken');
      } else {
        setNicknameStatus('available');
        setNicknameMessage('Nickname is available!');
      }
    } catch (error) {
      console.error('Error checking nickname:', error);
      setNicknameStatus('invalid');
      setNicknameMessage('Error checking availability');
    }
  };

  const handleArrayInputChange = (e, index, field) => {
    const { value } = e.target;
    setFormData(prev => {
      const newArray = [...prev[field]];
      newArray[index] = value;
      return {
        ...prev,
        [field]: newArray
      };
    });
  };

  const handleAddField = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const handleRemoveField = (index, field) => {
    setFormData(prev => {
      const newArray = prev[field].filter((_, i) => i !== index);
      return {
        ...prev,
        [field]: newArray.length > 0 ? newArray : ['']
      };
    });
  };

  const resetForm = () => {
    setFormData({
      base_company_name: '',
      nickname: '',
      gst_number: '',
      address: '',
      contact_person: '',
      phones: [''],
      emails: ['']
    });
    setEditingCompany(null);
    setShowForm(false);
    setError('');
    setNicknameStatus('idle');
    setNicknameMessage('');
    if (nicknameCheckTimer) {
      clearTimeout(nicknameCheckTimer);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.base_company_name.trim()) {
      setError('Company name is required');
      return;
    }
    
    if (!formData.nickname.trim()) {
      setError('Nickname is required');
      return;
    }
    
    if (nicknameStatus === 'taken') {
      setError('Please choose a different nickname - this one is already taken');
      return;
    }
    
    if (nicknameStatus === 'invalid') {
      setError('Please fix the nickname: ' + nicknameMessage);
      return;
    }
    
    if (nicknameStatus === 'checking') {
      setError('Please wait while we check nickname availability');
      return;
    }

    try {
      const dataToSubmit = {
        ...formData,
        nickname: formData.nickname.trim(),
        phones: formData.phones.filter(phone => phone.trim() !== ''),
        emails: formData.emails.filter(email => email.trim() !== ''),
      };

      if (editingCompany) {
        // Update existing company
        const { error } = await supabase
          .from('Base_Company')
          .update({
            ...dataToSubmit,
            updated_by_user_id: userInfo.authUserId, // Save user's UUID
            update_at: new Date().toISOString(),
          })
          .eq('base_company_id', editingCompany.base_company_id);

        if (error) throw error;
        setSuccess('Company updated successfully!');
      } else {
        // Create new company
        const { error } = await supabase
          .from('Base_Company')
          .insert([{
            ...dataToSubmit,
            status: 'Active',
            created_by_user_id: userInfo.authUserId, // Save user's UUID
            updated_by_user_id: userInfo.authUserId, // Also set on create
            created_at: new Date().toISOString(),
            update_at: new Date().toISOString(),
          }]);

        if (error) throw error;
        setSuccess('Company added successfully!');
      }

      await fetchCompanies();
      resetForm();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving company:', error);
      if (error.code === '23505') {
        // Unique constraint violation
        setError('This nickname is already taken. Please choose a different one.');
      } else {
        setError(error.message || 'Failed to save company');
      }
    }
  };

  const handleEdit = (company) => {
    setEditingCompany(company);
    setFormData({
      base_company_name: company.base_company_name || '',
      nickname: company.nickname || '',
      gst_number: company.gst_number || '',
      address: company.address || '',
      contact_person: company.contact_person || '',
      phones: company.phones && company.phones.length > 0 ? company.phones : [''],
      emails: company.emails && company.emails.length > 0 ? company.emails : ['']
    });
    setShowForm(true);
    setError('');
    setNicknameStatus('idle');
    setNicknameMessage('');
  };

  const toggleStatus = async (company) => {
    const currentStatus = company.status;
    const newStatus = currentStatus === 'Active' || currentStatus === 'active' ? 'Inactive' : 'Active';
    const actionText = (newStatus === 'Active' || newStatus === 'active') ? 'activate' : 'deactivate';
    
    if (!window.confirm(`Are you sure you want to ${actionText} this company?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('Base_Company')
        .update({ 
          status: newStatus,
          updated_by_user_id: userInfo.authUserId, // Save user's UUID
          update_at: new Date().toISOString()
        })
        .eq('base_company_id', company.base_company_id);

      if (error) {
        console.error('Status update error:', error);
        throw error;
      }
      
      setSuccess(`Company ${actionText}d successfully!`);
      await fetchCompanies();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating status:', error);
      setError(error.message || 'Failed to update company status');
    }
  };

  const filteredCompanies = companies.filter(company => {
    const companyStatus = company.status?.toLowerCase() || 'inactive';
    if (filterStatus === 'active' && companyStatus !== 'active') return false;
    if (filterStatus === 'inactive' && companyStatus !== 'inactive') return false;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      company.base_company_name?.toLowerCase().includes(searchLower) ||
      company.nickname?.toLowerCase().includes(searchLower) ||
      company.gst_number?.toLowerCase().includes(searchLower) ||
      company.contact_person?.toLowerCase().includes(searchLower)
    );
  });

  const activeCount = companies.filter(c => c.status?.toLowerCase() === 'active').length;
  const inactiveCount = companies.filter(c => !c.status || c.status?.toLowerCase() === 'inactive').length;

  if (loading) {
    return (
      <div className="bcm-container">
        <div className="bcm-loading">
          <div className="bcm-spinner"></div>
          <p>Loading companies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bcm-container">
      {/* Messages */}
      {error && (
        <div className="bcm-alert bcm-alert-error">
          <span className="bcm-alert-icon">⚠️</span>
          <span>{error}</span>
          <button className="bcm-alert-close" onClick={() => setError('')}>✕</button>
        </div>
      )}

      {success && (
        <div className="bcm-alert bcm-alert-success">
          <span className="bcm-alert-icon">✅</span>
          <span>{success}</span>
          <button className="bcm-alert-close" onClick={() => setSuccess('')}>✕</button>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="bcm-modal-overlay" onClick={resetForm}>
          <div className="bcm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="bcm-modal-header">
              <h2>{editingCompany ? 'Edit Base Company' : 'Add New Base Company'}</h2>
              <button className="bcm-modal-close" onClick={resetForm}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="bcm-form">
              <div className="bcm-form-grid">
                <div className="bcm-form-group bcm-full-width">
                  <label className="bcm-label">
                    Company Name <span className="bcm-required">*</span>
                  </label>
                  <input
                    type="text"
                    name="base_company_name"
                    value={formData.base_company_name}
                    onChange={handleInputChange}
                    className="bcm-input"
                    placeholder="Enter company name"
                    required
                  />
                </div>

                <div className="bcm-form-group bcm-full-width">
                  <label className="bcm-label">
                    Short Name / Nickname <span className="bcm-required">*</span>
                  </label>
                  <input
                    type="text"
                    name="nickname"
                    value={formData.nickname}
                    onChange={handleInputChange}
                    className={`bcm-input ${nicknameStatus === 'taken' || nicknameStatus === 'invalid' ? 'bcm-input-error' : ''} ${nicknameStatus === 'available' ? 'bcm-input-success' : ''}`}
                    placeholder="e.g., ABC or MyCompany"
                    maxLength="20"
                    required
                  />
                  {nicknameStatus !== 'idle' && (
                    <div className={`bcm-nickname-feedback bcm-nickname-${nicknameStatus}`}>
                      {nicknameStatus === 'checking' && '⏳ '}
                      {nicknameStatus === 'available' && '✓ '}
                      {(nicknameStatus === 'taken' || nicknameStatus === 'invalid') && '✕ '}
                      {nicknameMessage}
                    </div>
                  )}
                  <small className="bcm-input-help">
                    2-20 characters. Letters, numbers, hyphens, and underscores only.
                  </small>
                </div>

                <div className="bcm-form-group">
                  <label className="bcm-label">GST Number</label>
                  <input
                    type="text"
                    name="gst_number"
                    value={formData.gst_number}
                    onChange={handleInputChange}
                    className="bcm-input"
                    placeholder="e.g., 29ABCDE1234F1Z5"
                    maxLength="15"
                  />
                </div>

                <div className="bcm-form-group">
                  <label className="bcm-label">Contact Person</label>
                  <input
                    type="text"
                    name="contact_person"
                    value={formData.contact_person}
                    onChange={handleInputChange}
                    className="bcm-input"
                    placeholder="Enter contact person name"
                  />
                </div>

                <div className="bcm-form-group bcm-full-width">
                  <label className="bcm-label">Phones</label>
                  {formData.phones.map((phone, index) => (
                    <div key={index} className="bcm-array-input-group">
                      <input
                        type="tel"
                        name={`phone-${index}`}
                        value={phone}
                        onChange={(e) => handleArrayInputChange(e, index, 'phones')}
                        className="bcm-input"
                        placeholder="e.g., +91 98765 43210"
                      />
                      {formData.phones.length > 1 && (
                        <button
                          type="button"
                          className="bcm-btn bcm-btn-icon-only bcm-btn-remove"
                          onClick={() => handleRemoveField(index, 'phones')}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    className="bcm-btn bcm-btn-secondary bcm-add-field-btn"
                    onClick={() => handleAddField('phones')}
                  >
                    + Add Phone
                  </button>
                </div>

                <div className="bcm-form-group bcm-full-width">
                  <label className="bcm-label">Emails</label>
                  {formData.emails.map((email, index) => (
                    <div key={index} className="bcm-array-input-group">
                      <input
                        type="email"
                        name={`email-${index}`}
                        value={email}
                        onChange={(e) => handleArrayInputChange(e, index, 'emails')}
                        className="bcm-input"
                        placeholder="company@example.com"
                      />
                      {formData.emails.length > 1 && (
                        <button
                          type="button"
                          className="bcm-btn bcm-btn-icon-only bcm-btn-remove"
                          onClick={() => handleRemoveField(index, 'emails')}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    className="bcm-btn bcm-btn-secondary bcm-add-field-btn"
                    onClick={() => handleAddField('emails')}
                  >
                    + Add Email
                  </button>
                </div>

                <div className="bcm-form-group bcm-full-width">
                  <label className="bcm-label">Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="bcm-textarea"
                    placeholder="Enter complete address"
                    rows="3"
                  />
                </div>
              </div>

              <div className="bcm-form-actions">
                <button type="button" className="bcm-btn bcm-btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="bcm-btn bcm-btn-primary">
                  <span className="bcm-btn-icon">💾</span>
                  {editingCompany ? 'Update Base Company' : 'Add Base Company'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter and Search Section */}
      <div className="bcm-filter-section">
        <div className="bcm-filter-row">
          <div className="bcm-filter-tabs">
            <button 
              className={`bcm-filter-tab ${filterStatus === 'all' ? 'active' : ''}`}
              onClick={() => setFilterStatus('all')}
            >
              All ({companies.length})
            </button>
            <button 
              className={`bcm-filter-tab ${filterStatus === 'active' ? 'active' : ''}`}
              onClick={() => setFilterStatus('active')}
            >
              Active ({activeCount})
            </button>
            <button 
              className={`bcm-filter-tab ${filterStatus === 'inactive' ? 'active' : ''}`}
              onClick={() => setFilterStatus('inactive')}
            >
              Inactive ({inactiveCount})
            </button>
          </div>
          
          <button 
            className="bcm-btn bcm-btn-primary"
            onClick={() => setShowForm(true)}
          >
            <span className="bcm-btn-icon">+</span>
            Add Base Company
          </button>
        </div>

        <div className="bcm-search-wrapper">
          <span className="bcm-search-icon">🔍</span>
          <input
            type="text"
            className="bcm-search-input"
            placeholder="Search companies by name, nickname, GST, or contact person..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              className="bcm-search-clear"
              onClick={() => setSearchTerm('')}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Companies List */}
      <div className="bcm-content">
        {filteredCompanies.length === 0 ? (
          <div className="bcm-empty-state">
            <div className="bcm-empty-icon">📁</div>
            <h3>No Companies Found</h3>
            <p>
              {searchTerm 
                ? 'Try adjusting your search criteria'
                : filterStatus !== 'all'
                ? `No ${filterStatus} companies found`
                : 'Get started by adding your first company'}
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <button 
                className="bcm-btn bcm-btn-primary"
                onClick={() => setShowForm(true)}
              >
                <span className="bcm-btn-icon">+</span>
                Add First Base Company
              </button>
            )}
          </div>
        ) : (
          <div className="bcm-grid">
            {filteredCompanies.map((company) => (
              <div key={company.base_company_id} className={`bcm-card ${company.status?.toLowerCase() === 'inactive' ? 'bcm-card-inactive' : ''}`}>
                <div className="bcm-card-header">
                  <div className="bcm-card-icon">🏢</div>
                  <h3 className="bcm-card-title">{company.base_company_name}</h3>
                  <span className={`bcm-status-badge bcm-status-${company.status?.toLowerCase() || 'active'}`}>
                    {company.status?.toLowerCase() === 'active' ? '✓ Active' : '⏸ Inactive'}
                  </span>
                </div>

                <div className="bcm-card-body">
                  {company.nickname && (
                    <div className="bcm-card-row">
                      <span className="bcm-card-label">Short Name:</span>
                      <span className="bcm-card-value" style={{fontWeight: 600, color: '#007bff'}}>{company.nickname}</span>
                    </div>
                  )}
                  
                  {company.gst_number && (
                    <div className="bcm-card-row">
                      <span className="bcm-card-label">GST:</span>
                      <span className="bcm-card-value">{company.gst_number}</span>
                    </div>
                  )}

                  {company.contact_person && (
                    <div className="bcm-card-row">
                      <span className="bcm-card-label">Contact:</span>
                      <span className="bcm-card-value">{company.contact_person}</span>
                    </div>
                  )}

                  {company.phones && company.phones.length > 0 && (
                    <div className="bcm-card-row">
                      <span className="bcm-card-label">Phone(s):</span>
                      <span className="bcm-card-value">
                        {company.phones.map((phone, index) => (
                          <a key={index} href={`tel:${phone}`} className="bcm-link bcm-block-link">
                            {phone}
                          </a>
                        ))}
                      </span>
                    </div>
                  )}

                  {company.emails && company.emails.length > 0 && (
                    <div className="bcm-card-row">
                      <span className="bcm-card-label">Email(s):</span>
                      <span className="bcm-card-value">
                        {company.emails.map((email, index) => (
                          <a key={index} href={`mailto:${email}`} className="bcm-link bcm-block-link">
                            {email}
                          </a>
                        ))}
                      </span>
                    </div>
                  )}

                  {company.address && (
                    <div className="bcm-card-row bcm-card-row-full">
                      <span className="bcm-card-label">Address:</span>
                      <span className="bcm-card-value bcm-card-address">
                        {company.address}
                      </span>
                    </div>
                  )}
                </div>

                <div className="bcm-card-metadata">
                  {company.created_at && (
                    <span>
                      Created by {userNames[company.created_by_user_id] || 'Unknown'} on {formatDateTime(company.created_at)}
                    </span>
                  )}
                  {company.update_at && company.update_at !== company.created_at && (
                    <span>
                      Updated by {userNames[company.updated_by_user_id] || 'Unknown'} on {formatDateTime(company.update_at)}
                    </span>
                  )}
                </div>

                <div className="bcm-card-footer">
                  <button 
                    className="bcm-btn bcm-btn-small bcm-btn-edit"
                    onClick={() => handleEdit(company)}
                  >
                    <span className="bcm-btn-icon">✏️</span>
                    Edit
                  </button>
                  <button 
                    className={`bcm-btn bcm-btn-small ${company.status?.toLowerCase() === 'active' ? 'bcm-btn-deactivate' : 'bcm-btn-activate'}`}
                    onClick={() => toggleStatus(company)}
                  >
                    <span className="bcm-btn-icon">
                      {company.status?.toLowerCase() === 'active' ? '⏸️' : '▶️'}
                    </span>
                    {company.status?.toLowerCase() === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BaseCompanyManagement;