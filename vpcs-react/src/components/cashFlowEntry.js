// src/components/CashFlowEntry.js
import React, { useState } from 'react';
import './cashFlowEntry.css';
import { supabase } from '../lib/supabaseClient';
import formatDate from '../lib/DD-MMM-YY-DateFromat';
import formatCurrency from '../lib/INDcurrencyFormat';

function CashFlowEntry() {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0], // Today's date
    type: 'Inflow',
    party: '',
    inflow: '',
    outflow: '',
    comments: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [lastEntry, setLastEntry] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // If type changes, clear the amounts
    if (name === 'type') {
      setFormData({
        ...formData,
        [name]: value,
        inflow: '',
        outflow: ''
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      // Validate required fields
      if (!formData.party.trim()) {
        setMessage({ type: 'error', text: 'Party name is required' });
        setIsSubmitting(false);
        return;
      }

      // Prepare data for insertion
      const dataToInsert = {
        date: formData.date,
        type: formData.type,
        party: formData.party.trim(),
        inflow: formData.type === 'Inflow' ? parseFloat(formData.inflow) || 0 : 0,
        outflow: formData.type === 'Outflow' ? parseFloat(formData.outflow) || 0 : 0,
        comments: formData.comments.trim() || null
      };

      // Validate amount
      if (dataToInsert.inflow === 0 && dataToInsert.outflow === 0) {
        setMessage({ type: 'error', text: 'Please enter an amount' });
        setIsSubmitting(false);
        return;
      }

      // Insert into Supabase
      const { data, error } = await supabase
        .from('cashflow')
        .insert([dataToInsert])
        .select();

      if (error) {
        throw error;
      }

      // Success - store last entry for display
      setLastEntry({
        ...dataToInsert,
        formattedDate: formatDate(dataToInsert.date),
        formattedAmount: formatCurrency(dataToInsert.inflow || dataToInsert.outflow)
      });

      setMessage({ type: 'success', text: 'Entry added successfully!' });
      
      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        type: 'Inflow',
        party: '',
        inflow: '',
        outflow: '',
        comments: ''
      });

      // Clear success message after 5 seconds
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000);

    } catch (error) {
      console.error('Error adding entry:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to add entry. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      type: 'Inflow',
      party: '',
      inflow: '',
      outflow: '',
      comments: ''
    });
    setMessage({ type: '', text: '' });
    setLastEntry(null);
  };

  return (
    <div className="cashflow-entry-container">
      <div className="entry-header">
        <h1>💰 Cash Flow Entry</h1>
        <p>Add new cash flow transactions</p>
      </div>

      <div className="entry-card">
        <form onSubmit={handleSubmit} className="entry-form">
          {/* Date Field */}
          <div className="form-group">
            <label htmlFor="date">
              Date <span className="required">*</span>
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          {/* Type Field */}
          <div className="form-group">
            <label htmlFor="type">
              Type <span className="required">*</span>
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="form-select"
            >
              <option value="Inflow">Inflow (Money In)</option>
              <option value="Outflow">Outflow (Money Out)</option>
            </select>
          </div>

          {/* Party Field */}
          <div className="form-group">
            <label htmlFor="party">
              Party Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="party"
              name="party"
              value={formData.party}
              onChange={handleChange}
              placeholder="Enter party name"
              required
              className="form-input"
            />
          </div>

          {/* Amount Field - Dynamic based on Type */}
          <div className="form-group">
            <label htmlFor="amount">
              Amount <span className="required">*</span>
            </label>
            {formData.type === 'Inflow' ? (
              <input
                type="number"
                id="inflow"
                name="inflow"
                value={formData.inflow}
                onChange={handleChange}
                placeholder="Enter inflow amount"
                step="0.01"
                min="0"
                required
                className="form-input amount-input inflow-input"
              />
            ) : (
              <input
                type="number"
                id="outflow"
                name="outflow"
                value={formData.outflow}
                onChange={handleChange}
                placeholder="Enter outflow amount"
                step="0.01"
                min="0"
                required
                className="form-input amount-input outflow-input"
              />
            )}
          </div>

          {/* Comments Field */}
          <div className="form-group">
            <label htmlFor="comments">
              Comments <span className="optional">(Optional)</span>
            </label>
            <textarea
              id="comments"
              name="comments"
              value={formData.comments}
              onChange={handleChange}
              placeholder="Add any additional notes..."
              rows="3"
              className="form-textarea"
            />
          </div>

          {/* Message Display */}
          {message.text && (
            <div className={`message ${message.type}`}>
              <span className="message-icon">
                {message.type === 'success' ? '✓' : '⚠'}
              </span>
              {message.text}
            </div>
          )}

          {/* Last Entry Display */}
          {lastEntry && message.type === 'success' && (
            <div className="last-entry-display">
              <div className="last-entry-header">
                <span className="entry-icon">📝</span>
                <strong>Last Entry Added:</strong>
              </div>
              <div className="last-entry-details">
                <div className="entry-detail">
                  <span className="detail-label">Date:</span>
                  <span className="detail-value">{lastEntry.formattedDate}</span>
                </div>
                <div className="entry-detail">
                  <span className="detail-label">Type:</span>
                  <span className={`detail-value type-badge ${lastEntry.type.toLowerCase()}`}>
                    {lastEntry.type}
                  </span>
                </div>
                <div className="entry-detail">
                  <span className="detail-label">Party:</span>
                  <span className="detail-value">{lastEntry.party}</span>
                </div>
                <div className="entry-detail">
                  <span className="detail-label">Amount:</span>
                  <span className={`detail-value amount-badge ${lastEntry.type.toLowerCase()}`}>
                    {lastEntry.formattedAmount}
                  </span>
                </div>
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
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Saving...
                </>
              ) : (
                <>
                  <span className="btn-icon">💾</span>
                  Save Entry
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Info Box */}
      <div className="info-box">
        <div className="info-icon">ℹ️</div>
        <div className="info-content">
          <h3>Quick Tips:</h3>
          <ul>
            <li><strong>Inflow:</strong> Money received (sales, receipts, etc.)</li>
            <li><strong>Outflow:</strong> Money paid out (expenses, purchases, etc.)</li>
            <li><strong>Date Format:</strong> Will be displayed as DD-MMM-YY (e.g., 05-Dec-24)</li>
            <li><strong>Currency:</strong> Amounts displayed in Indian Rupees (₹)</li>
            <li><strong>Running Balance:</strong> Automatically calculated in the Cash Flow view</li>
            <li>All fields marked with <span className="required">*</span> are required</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default CashFlowEntry;