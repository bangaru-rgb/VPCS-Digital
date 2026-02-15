// src/components/Materials/MaterialList.js
import React, { useState } from 'react';
import EditMaterialModal from './EditMaterialModal';

const MaterialList = ({ materials, loading, onUpdateMaterial, onAddMaterial, onToggleStatus }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingMaterial, setEditingMaterial] = useState(null);

  if (loading) {
    return (
      <div className="user-list-loading">
        <div className="spinner"></div>
        <p>Loading materials...</p>
      </div>
    );
  }

  if (!materials || materials.length === 0) {
    return (
      <div className="user-list">
        <div className="list-header">
          <div className="filter-row">
            <div className="filter-tabs">
              <button className="filter-tab active">
                All (0)
              </button>
            </div>
            <button
              onClick={onAddMaterial}
              className="btn btn-sm btn-primary add-material-btn"
            >
              <span className="btn-icon">+</span>
              Add Material
            </button>
          </div>
        </div>
        <div className="user-list-empty">
          <div className="empty-icon">📦</div>
          <h3>No Materials Found</h3>
          <p>Add your first material to get started.</p>
        </div>
      </div>
    );
  }

  const filteredMaterials = materials.filter(material => {
    const term = searchTerm.toLowerCase();
    return (
      material.material_name?.toLowerCase().includes(term) ||
      material.description?.toLowerCase().includes(term) ||
      material.unit?.toLowerCase().includes(term) ||
      material.category?.toLowerCase().includes(term)
    );
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleMaterialUpdated = (updatedMaterial) => {
    if (onUpdateMaterial) {
      onUpdateMaterial(updatedMaterial);
    }
  };


  return (
    <div className="user-list">
      <div className="list-header">
        <div className="filter-row">
          <div className="filter-tabs">
            <button className="filter-tab active">
              All ({materials.length})
            </button>
          </div>
          <button
            onClick={onAddMaterial}
            className="btn btn-sm btn-primary add-material-btn"
          >
            <span className="btn-icon">+</span>
            Add Material
          </button>
        </div>

        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by name, description, category, or unit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="table-container">
        <table className="user-table">
          <thead>
            <tr>
              <th>Material Name</th>
              <th>Description</th>
              <th>Category</th>
              <th>Unit</th>
              <th>Rate</th>
              <th>Added/Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMaterials.map((material) => (
              <tr key={material.material_id} className="user-row">
                <td className="user-cell">
                  <div>
                    <span className="user-name">{material.material_name}</span>
                  </div>
                </td>
                <td>{material.description || 'N/A'}</td>
                <td>{material.category || 'N/A'}</td>
                <td>{material.unit || 'N/A'}</td>
                <td>{material.rate ? `₹${material.rate}` : 'N/A'}</td>
                <td className="date-cell">{formatDate(material.updated_at || material.created_at)}</td>
                <td className="actions-cell">
                  <button
                    onClick={() => setEditingMaterial(material)}
                    className="btn-icon"
                    title="Edit material"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => onToggleStatus(material)}
                    className={`btn-toggle ${material.status?.toLowerCase() === 'active' ? 'btn-deactivate' : 'btn-activate'}`}
                    title={material.status?.toLowerCase() === 'active' ? 'Deactivate material' : 'Activate material'}
                  >
                    {material.status?.toLowerCase() === 'active' ? '⊗' : '▶️'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredMaterials.length === 0 && (
        <div className="no-results">
          <p>😕 No materials match your search criteria</p>
        </div>
      )}

      {editingMaterial && (
        <EditMaterialModal
          material={editingMaterial}
          onClose={() => setEditingMaterial(null)}
          onMaterialUpdated={handleMaterialUpdated}
        />
      )}
    </div>
  );
};

export default MaterialList;
