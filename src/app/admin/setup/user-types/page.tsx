'use client';

import { useState, useEffect } from 'react';
import { Plus, Users, Search, Edit2, Trash2, X, AlertTriangle } from 'lucide-react';
import '../setup.css';
import './user-types.css';

interface UserType {
  _id: string;
  name: string;
  code: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export default function UserTypesPage() {
  const [userTypes, setUserTypes] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<UserType | null>(null);
  const [deletingType, setDeletingType] = useState<UserType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    is_active: true
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/admin';

  useEffect(() => {
    fetchUserTypes();
  }, []);

  const fetchUserTypes = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/system-setup/user-types/`);
      if (response.ok) {
        const data = await response.json();
        setUserTypes(data);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load user types');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (type: UserType | null = null) => {
    if (type) {
      setEditingType(type);
      setFormData({
        name: type.name,
        code: type.code,
        description: type.description || '',
        is_active: type.is_active
      });
    } else {
      setEditingType(null);
      setFormData({
        name: '',
        code: '',
        description: '',
        is_active: true
      });
    }
    setIsModalOpen(true);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const url = editingType
        ? `${API_URL}/system-setup/user-types/${editingType._id}`
        : `${API_URL}/system-setup/user-types/`;

      const method = editingType ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSuccess(editingType ? 'User type updated' : 'User type created');
        setIsModalOpen(false);
        fetchUserTypes();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(data.detail || 'Error saving user type');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!deletingType) return;
    try {
      const response = await fetch(`${API_URL}/system-setup/user-types/${deletingType._id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setSuccess('User type deleted');
        setIsDeleteModalOpen(false);
        fetchUserTypes();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('Error deleting user type');
    }
  };

  const filteredTypes = userTypes.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="setup-container">
      <div className="setup-header premium-header">
        <div className="header-content">
          <div className="header-icon-wrapper">
            <Users size={40} strokeWidth={1.5} color="#000000" />
          </div>
          <div className="header-text">
            <h1>User Types Setup</h1>
            <p>Define and manage user categories like Law Firms, Students, and Researchers</p>
          </div>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-label">Total Categories</span>
            <span className="stat-value">{userTypes.length}</span>
          </div>
        </div>
      </div>

      <div className="setup-content premium-content">
        <div className="user-types-wrapper">
          <div className="user-types-toolbar premium-toolbar">
            <div className="toolbar-left">
              <div className="search-box premium-search">
                <Search size={18} color="#000000" />
                <input
                  type="text"
                  placeholder="Search user types..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="toolbar-right">
              <button className="btn-add premium-btn-add" onClick={() => handleOpenModal()}>
                <Plus size={18} />
                <span>Add User Type</span>
              </button>
            </div>
          </div>

          <div className="table-section">
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading user types...</p>
              </div>
            ) : filteredTypes.length === 0 ? (
              <div className="empty-state premium-empty">
                <div className="empty-icon">
                  <Users size={48} strokeWidth={1} />
                </div>
                <h3>No User Types Defined</h3>
                <p>Start by adding categories like Law Firm, Student, or Researcher.</p>
                <button className="btn-empty-action" onClick={() => handleOpenModal()}>
                  <Plus size={18} />
                  <span>Create First User Type</span>
                </button>
              </div>
            ) : (
              <table className="user-types-table premium-table">
                <thead>
                  <tr>
                    <th>Category Name</th>
                    <th>Code / Slug</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTypes.map((type) => (
                    <tr key={type._id} className="table-row">
                      <td className="cell-name">
                        <div className="user-badge">
                          <div className="user-badge-icon">
                            <Users size={16} />
                          </div>
                          <span>{type.name}</span>
                        </div>
                      </td>
                      <td><span className="cell-code">{type.code}</span></td>
                      <td className="cell-description">{type.description || 'No description'}</td>
                      <td>
                        <span className={`status-badge ${type.is_active ? 'active' : 'inactive'}`}>
                          {type.is_active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="cell-actions">
                        <button className="btn-action edit" onClick={() => handleOpenModal(type)}>
                          <Edit2 size={16} />
                        </button>
                        <button className="btn-action delete" onClick={() => { setDeletingType(type); setIsDeleteModalOpen(true); }}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="form-overlay">
          <div className="premium-form">
            <div className="form-header">
              <h2>{editingType ? 'Edit User Type' : 'Add New User Type'}</h2>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-body">
                {error && <div className="alert alert-error" style={{ marginBottom: '16px' }}>{error}</div>}
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label>Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        name: val,
                        code: editingType ? prev.code : val.toLowerCase().replace(/\s+/g, '-')
                      }));
                    }}
                    placeholder="e.g. Law Firm"
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label>Code (Unique Slug) *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toLowerCase() }))}
                    placeholder="e.g. law-firm"
                    required
                    disabled={!!editingType}
                  />
                  <small>Used for internal logic and database references</small>
                </div>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe this user category..."
                    rows={3}
                  />
                </div>
                <div className="form-group">
                  <label className="toggle-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    />
                    <span>Active and enabled for selection</span>
                  </label>
                </div>
              </div>
              <div className="form-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-save">{editingType ? 'Update Type' : 'Create Type'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {isDeleteModalOpen && (
        <div className="form-overlay">
          <div className="premium-form delete-modal" style={{ maxWidth: '400px' }}>
            <div className="form-body" style={{ textAlign: 'center', padding: '32px' }}>
              <div className="alert-icon" style={{ color: '#dc2626', marginBottom: '16px' }}>
                <AlertTriangle size={48} style={{ margin: '0 auto' }} />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>Delete User Type?</h2>
              <p style={{ color: '#64748b', marginBottom: '24px' }}>
                Are you sure you want to delete <strong>{deletingType?.name}</strong>? This may affect users in this category.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
                <button className="btn-delete-confirm" style={{ flex: 1, background: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }} onClick={handleDelete}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="alert alert-success" style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1001, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
          {success}
        </div>
      )}
    </div>
  );
}
