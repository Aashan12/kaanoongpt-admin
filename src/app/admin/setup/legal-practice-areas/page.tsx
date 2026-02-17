'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Globe, Flag, ChevronRight } from 'lucide-react';
import '../setup.css';

interface LegalPracticeArea {
  id: string;
  name: string;
  description?: string;
  parent_id?: string;
  country_id?: string;
  is_active: boolean;
}

interface Country {
  id: string;
  name: string;
}

export default function LegalPracticeAreasPage() {
  const [areas, setAreas] = useState<LegalPracticeArea[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingArea, setEditingArea] = useState<LegalPracticeArea | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent_id: '',
    country_id: '',
    is_active: true
  });

  useEffect(() => {
    fetchAreas();
    fetchCountries();
  }, []);

  const fetchAreas = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:8000/api/admin/system-setup/legal-practice-areas', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        // Check if data is paginated or direct array
        setAreas(Array.isArray(data) ? data : (data.data || []));
      }
    } catch (error) {
      console.error('Error fetching practice areas:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCountries = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      // Fetch all countries without limit for the dropdown if needed, or handle paginated data
      const response = await fetch('http://localhost:8000/api/admin/system-setup/countries?limit=100', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        // Handle paginated response structure { total, data, ... }
        setCountries(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');

    const payload = {
      ...formData,
      parent_id: formData.parent_id || null,
      country_id: formData.country_id || null
    };

    try {
      const url = editingArea
        ? `http://localhost:8000/api/admin/system-setup/legal-practice-areas/${editingArea.id}`
        : 'http://localhost:8000/api/admin/system-setup/legal-practice-areas';

      const response = await fetch(url, {
        method: editingArea ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        fetchAreas();
        closeModal();
      } else {
        const error = await response.json();
        alert(error.detail || 'Error saving practice area');
      }
    } catch (error) {
      console.error('Error saving practice area:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this practice area?')) return;

    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`http://localhost:8000/api/admin/system-setup/legal-practice-areas/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        fetchAreas();
      } else {
        const error = await response.json();
        alert(error.detail || 'Error deleting practice area');
      }
    } catch (error) {
      console.error('Error deleting practice area:', error);
    }
  };

  const openModal = (area?: LegalPracticeArea) => {
    if (area) {
      setEditingArea(area);
      setFormData({
        name: area.name,
        description: area.description || '',
        parent_id: area.parent_id || '',
        country_id: area.country_id || '',
        is_active: area.is_active
      });
    } else {
      setEditingArea(null);
      setFormData({
        name: '',
        description: '',
        parent_id: '',
        country_id: '',
        is_active: true
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingArea(null);
  };

  const getParentName = (parentId?: string) => {
    if (!parentId) return null;
    const parent = areas.find(a => a.id === parentId);
    return parent?.name;
  };

  return (
    <div className="setup-container">
      <div className="setup-header">
        <div>
          <h1>Legal Practice Areas</h1>
          <p>Manage legal specializations and sub-specializations</p>
        </div>
        <button className="btn-primary" onClick={() => openModal()}>
          <Plus size={20} />
          Add Practice Area
        </button>
      </div>

      <div className="setup-table-card">
        <table className="setup-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Parent Area</th>
              <th>Scope</th>
              <th>Description</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {areas.map((area) => (
              <tr key={area.id}>
                <td>
                  <div className="table-cell-main">
                    {area.parent_id && <ChevronRight size={16} style={{ marginRight: '0.25rem', color: '#94a3b8' }} />}
                    {area.name}
                  </div>
                </td>
                <td>
                  <div className="table-cell-secondary">
                    {getParentName(area.parent_id) || '—'}
                  </div>
                </td>
                <td>
                  {area.country_id ? (
                    <span className="scope-badge country">
                      <Flag size={14} />
                      {countries.find(c => c.id === area.country_id)?.name || 'Country'}
                    </span>
                  ) : (
                    <span className="scope-badge universal">
                      <Globe size={14} />
                      Universal
                    </span>
                  )}
                </td>
                <td>
                  <div className="table-cell-secondary">{area.description || '—'}</div>
                </td>
                <td>
                  <span className={`status-badge ${area.is_active ? 'active' : 'inactive'}`}>
                    {area.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div className="table-actions">
                    <button className="btn-icon" onClick={() => openModal(area)}>
                      <Edit2 size={16} />
                    </button>
                    <button className="btn-icon btn-icon-danger" onClick={() => handleDelete(area.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingArea ? 'Edit Practice Area' : 'Add Practice Area'}</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Practice Area Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Criminal Law, Corporate Law"
                />
              </div>

              <div className="form-group">
                <label>Parent Practice Area</label>
                <select
                  value={formData.parent_id}
                  onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                >
                  <option value="">None (Top-level)</option>
                  {areas
                    .filter(a => !editingArea || a.id !== editingArea.id)
                    .filter(a => !a.parent_id) // Only show top-level as parents
                    .map(area => (
                      <option key={area.id} value={area.id}>{area.name}</option>
                    ))}
                </select>
                <small style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                  For sub-specializations (e.g., M&A under Corporate Law)
                </small>
              </div>

              <div className="form-group">
                <label>Scope</label>
                <select
                  value={formData.country_id}
                  onChange={(e) => setFormData({ ...formData, country_id: e.target.value })}
                >
                  <option value="">Universal (All Countries)</option>
                  {countries.map(country => (
                    <option key={country.id} value={country.id}>{country.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this practice area"
                  rows={3}
                />
              </div>

              <div className="form-group-checkbox">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                <label htmlFor="is_active">Active</label>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingArea ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
