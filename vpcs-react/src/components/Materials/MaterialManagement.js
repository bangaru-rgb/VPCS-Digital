// src/components/Materials/MaterialManagement.js
import React, { useState, useEffect } from 'react';
import AddMaterialForm from './AddMaterialForm';
import MaterialList from './MaterialList';
import { getAllMaterials, updateMaterialStatus } from '../../lib/supabaseClient';
import './MaterialManagement.css';

const MaterialManagement = ({ userInfo }) => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      setError('');

      const result = await getAllMaterials();

      if (result.success) {
        console.log('📦 Materials data:', result.data);
        setMaterials(result.data || []);
      } else {
        setError(result.error || 'Failed to load materials');
      }
    } catch (err) {
      console.error('Error fetching materials:', err);
      setError('An unexpected error occurred while loading materials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleMaterialUpdated = (updatedMaterial) => {
    // Update the material in place without refetching to maintain position
    if (updatedMaterial) {
      setMaterials(prevMaterials =>
        prevMaterials.map(material =>
          material.material_id === updatedMaterial.material_id ? updatedMaterial : material
        )
      );
    } else {
      // Fallback: refresh the entire list
      fetchMaterials();
    }
  };


  const handleMaterialAdded = () => {
    fetchMaterials();
    setShowAddModal(false);
  };

  const handleToggleStatus = async (material) => {
    const currentStatus = material.status;
    const newStatus = currentStatus === 'Active' || currentStatus === 'active' ? 'Inactive' : 'Active';
    const actionText = (newStatus === 'Active' || newStatus === 'active') ? 'activate' : 'deactivate';

    if (!window.confirm(`Are you sure you want to ${actionText} "${material.material_name}"?`)) {
      return;
    }

    try {
      const result = await updateMaterialStatus(material.material_id, newStatus);

      if (!result.success) {
        throw new Error(result.error);
      }

      // Update the material in place to maintain position
      if (result.data) {
        setMaterials(prevMaterials =>
          prevMaterials.map(m =>
            m.material_id === material.material_id ? result.data : m
          )
        );
      } else {
        // Fallback: refresh the entire list
        fetchMaterials();
      }
    } catch (err) {
      console.error('Error updating material status:', err);
      setError(`Failed to ${actionText} material: ${err.message}`);
    }
  };

  return (
    <div className="materials-container">
      {/* Error Message */}
      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
          <button onClick={fetchMaterials} className="retry-button">
            Retry
          </button>
        </div>
      )}

      {/* Material List */}
      <MaterialList
        materials={materials}
        loading={loading}
        onUpdateMaterial={handleMaterialUpdated}
        onAddMaterial={() => setShowAddModal(true)}
        onToggleStatus={handleToggleStatus}
      />

      {/* Add Material Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Material</h2>
              <button className="close-button" onClick={() => setShowAddModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <AddMaterialForm
                userInfo={userInfo}
                onMaterialAdded={handleMaterialAdded}
                onCancel={() => setShowAddModal(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialManagement;
