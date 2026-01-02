// src/components/Materials/EditMaterialModal.js
import React, { useState, useEffect } from 'react';
import { updateMaterial } from '../../lib/supabaseClient';

const EditMaterialModal = ({ material, onClose, onMaterialUpdated }) => {
  const [materialName, setMaterialName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [unit, setUnit] = useState('');
  const [rate, setRate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Populate form with existing material data
  useEffect(() => {
    if (material) {
      setMaterialName(material.material_name || '');
      setDescription(material.description || '');
      setCategory(material.category || '');
      setUnit(material.unit || '');
      setRate(material.rate || '');
    }
  }, [material]);

  const handleUpdateMaterial = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!materialName.trim()) {
      setError('Material Name is required.');
      setLoading(false);
      return;
    }

    try {
      const updatedData = {
        material_name: materialName.trim(),
        description: description.trim(),
        category: category.trim(),
        unit: unit.trim(),
        rate: rate ? parseFloat(rate) : null
      };

      const result = await updateMaterial(material.material_id, updatedData);

      if (!result.success) {
        throw new Error(result.error);
      }

      if (onMaterialUpdated && result.data) {
        onMaterialUpdated(result.data);
      }

      onClose();
    } catch (err) {
      setError(`Error updating material: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!material) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Material</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleUpdateMaterial}>
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
                  <span>Update Material</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMaterialModal;
