// src/components/Materials/AddMaterialForm.js
import React, { useState } from 'react';
import { addMaterial } from '../../lib/supabaseClient';

const AddMaterialForm = ({ userInfo, onMaterialAdded, onCancel }) => {
  const [materialName, setMaterialName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [unit, setUnit] = useState('');
  const [rate, setRate] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!materialName) {
      setError('Material Name is required.');
      setLoading(false);
      return;
    }

    try {
      const newMaterial = {
        material_name: materialName.trim(),
        description: description.trim(),
        category: category.trim(),
        unit: unit.trim(),
        rate: rate ? parseFloat(rate) : null,
        created_by: userInfo.email,
        created_by_user_id: userInfo.authUserId
      };

      const result = await addMaterial(newMaterial);

      if (!result.success) {
        throw new Error(result.error);
      }

      setSuccess(`✅ Material "${materialName}" added successfully.`);
      setMaterialName('');
      setDescription('');
      setCategory('');
      setUnit('');
      setRate('');

      if (onMaterialAdded) {
        onMaterialAdded();
      }

      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(`❌ Error adding material: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-user-form">
      {!onCancel && (
        <div className="form-header">
          <h2>➕ Add New Material</h2>
          <p className="form-subtitle">Add a new material to your inventory</p>
        </div>
      )}

      <form onSubmit={handleAddMaterial}>
        <div className="form-group">
          <label htmlFor="materialName">
            Material Name <span className="required">*</span>
          </label>
          <input
            type="text"
            id="materialName"
            value={materialName}
            onChange={(e) => setMaterialName(e.target.value)}
            placeholder="e.g., Steel Rebar"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">
            Description <span className="optional">(Optional)</span>
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Material description"
            rows="2"
            disabled={loading}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <input
              type="text"
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Construction"
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="unit">Unit</label>
            <input
              type="text"
              id="unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="e.g., kg, liters, pieces"
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="rate">Rate (₹)</label>
          <input
            type="number"
            id="rate"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0"
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

        {onCancel ? (
          <div className="modal-actions">
            <button
              type="button"
              onClick={onCancel}
              className="cancel-button"
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" disabled={loading} className="submit-button">
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <span>➕</span>
                  <span>Add Material</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <button type="submit" disabled={loading} className="submit-button">
            {loading ? (
              <>
                <span className="spinner-small"></span>
                <span>Adding Material...</span>
              </>
            ) : (
              <>
                <span>➕</span>
                <span>Add Material</span>
              </>
            )}
          </button>
        )}
      </form>
    </div>
  );
};

export default AddMaterialForm;
