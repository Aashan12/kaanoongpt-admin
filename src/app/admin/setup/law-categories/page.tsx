'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Globe, Flag } from 'lucide-react';
import '../setup.css';

interface LawCategory {
  id: string;
  name: string;
  description?: string;
  hierarchy_level: number;
  country_id?: string;
  is_active: boolean;
}

interface Country {
  id: string;
  name: string;
}

export default function LawCategoriesPage() {
  const [categories, setCategories] = useState<LawCategory[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<LawCategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    hierarchy_level: 1,
    country_id: '',
    is_active: true
  });

  useEffect(() => {
    fetchCategories();
    fetchCountries();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:8000/api/admin/system-setup/law-categories', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(Array.isArray(data) ? data : (data.data || []));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCountries = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:8000/api/admin/system-setup/countries?limit=100', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
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
      country_id: formData.country_id || null
    };

    try {
      const url = editingCategory
        ? `http://localhost:8000/api/admin/system-setup/law-categories/${editingCategory.id}`
        : 'http://localhost:8000/api/admin/system-setup/law-categories';

      const response = await fetch(url, {
        method: editingCategory ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        fetchCategories();
        closeModal();
      }
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this law category?')) return;

    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`http://localhost:8000/api/admin/system-setup/law-categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        fetchCategories();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const openModal = (category?: LawCategory) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
        hierarchy_level: category.hierarchy_level,
        country_id: category.country_id || '',
        is_active: category.is_active
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        hierarchy_level: 1,
        country_id: '',
        is_active: true
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
  };

  const getHierarchyLabel = (level: number) => {
    const labels: { [key: number]: string } = {
      1: 'Constitution',
      2: 'Federal/National Law',
      3: 'State/Provincial Law',
      4: 'Municipal/Local Law',
      5: 'Regulations',
      6: 'Ordinances',
      7: 'Treaties',
      8: 'Administrative Rules',
      9: 'Bylaws',
      10: 'Other'
    };
    return labels[level] || `Level ${level}`;
  };

  return (
    <div className="setup-container">
      <div className="setup-header">
        <div>
          <h1>Law Categories</h1>
          <p>Manage legal document hierarchies and classifications</p>
        </div>
        <button className="btn-primary" onClick={() => openModal()}>
          <Plus size={20} />
          Add Category
        </button>
      </div>

      <div className="setup-table-card">
        <table className="setup-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Hierarchy Level</th>
              <th>Scope</th>
              <th>Description</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <td>
                  <div className="table-cell-main">{category.name}</div>
                </td>
                <td>
                  <span className="hierarchy-badge" style={{ background: `hsl(${(11 - category.hierarchy_level) * 30}, 70%, 95%)`, color: `hsl(${(11 - category.hierarchy_level) * 30}, 70%, 40%)` }}>
                    {category.hierarchy_level} - {getHierarchyLabel(category.hierarchy_level)}
                  </span>
                </td>
                <td>
                  {category.country_id ? (
                    <span className="scope-badge country">
                      <Flag size={14} />
                      {countries.find(c => c.id === category.country_id)?.name || 'Country'}
                    </span>
                  ) : (
                    <span className="scope-badge universal">
                      <Globe size={14} />
                      Universal
                    </span>
                  )}
                </td>
                <td>
                  <div className="table-cell-secondary">{category.description || '—'}</div>
                </td>
                <td>
                  <span className={`status-badge ${category.is_active ? 'active' : 'inactive'}`}>
                    {category.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div className="table-actions">
                    <button className="btn-icon" onClick={() => openModal(category)}>
                      <Edit2 size={16} />
                    </button>
                    <button className="btn-icon btn-icon-danger" onClick={() => handleDelete(category.id)}>
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
              <h2>{editingCategory ? 'Edit Law Category' : 'Add Law Category'}</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Category Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Constitution, Federal Law"
                />
              </div>

              <div className="form-group">
                <label>Hierarchy Level *</label>
                <select
                  required
                  value={formData.hierarchy_level}
                  onChange={(e) => setFormData({ ...formData, hierarchy_level: parseInt(e.target.value) })}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
                    <option key={level} value={level}>
                      {level} - {getHierarchyLabel(level)}
                    </option>
                  ))}
                </select>
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
                  placeholder="Brief description of this category"
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
                  {editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
