'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Edit2, Search, Globe, X, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import '../setup.css';
import './countries.css';

interface Country {
  id: string;
  name: string;
  code: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export default function CountriesPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', code: '', description: '', is_active: true });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ id: string; name: string } | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/admin';

  const fetchCountries = useCallback(async () => {
    setLoading(true);
    try {
      const skip = (currentPage - 1) * itemsPerPage;
      const queryParams = new URLSearchParams({
        skip: skip.toString(),
        limit: itemsPerPage.toString(),
      });

      if (searchTerm) {
        queryParams.append('search', searchTerm);
      }

      const response = await fetch(`${API_URL}/system-setup/countries/?${queryParams.toString()}`);
      if (response.ok) {
        const data = await response.json();
        // Handle paginated response structure
        if (data.data && Array.isArray(data.data)) {
          setCountries(data.data);
          setTotalItems(data.total);
        } else {
          // Fallback for non-paginated API (if rollback happens)
          setCountries(Array.isArray(data) ? data : []);
          setTotalItems(Array.isArray(data) ? data.length : 0);
        }
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
      setError('Failed to load countries');
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCountries();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchCountries]);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleAddCountry = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name || !formData.code) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId
        ? `${API_URL}/system-setup/countries/${editingId}`
        : `${API_URL}/system-setup/countries/`;

      const payload = {
        name: formData.name,
        code: formData.code,
        description: formData.description,
        is_active: formData.is_active !== undefined ? formData.is_active : true,
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSuccess(editingId ? 'Country updated successfully' : 'Country added successfully');
        setFormData({ name: '', code: '', description: '', is_active: true });
        setEditingId(null);
        setShowForm(false);
        setTimeout(() => setSuccess(''), 3000);
        fetchCountries();
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Error saving country');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error saving country');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal) return;

    if (deleteConfirmText !== deleteModal.name) {
      setError('Country name does not match. Please type the exact country name.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/system-setup/countries/${deleteModal.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess('Country deleted successfully');
        setDeleteModal(null);
        setDeleteConfirmText('');
        setTimeout(() => setSuccess(''), 3000);
        fetchCountries();
      } else {
        setError('Error deleting country');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error deleting country');
    }
  };

  const handleEditCountry = (country: Country) => {
    setFormData({
      name: country.name,
      code: country.code,
      description: country.description || '',
      is_active: country.is_active,
    });
    setEditingId(country.id);
    setShowForm(true);
    setError('');
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', code: '', description: '', is_active: true });
    setError('');
  };

  const handleOpenDeleteModal = (id: string, name: string) => {
    setDeleteModal({ id, name });
    setDeleteConfirmText('');
    setError('');
  };

  const handleCloseDeleteModal = () => {
    setDeleteModal(null);
    setDeleteConfirmText('');
    setError('');
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="setup-container">
      {/* Premium Header */}
      <div className="setup-header premium-header">
        <div className="header-content">
          <div className="header-icon-wrapper">
            <Globe size={40} strokeWidth={1.5} color="#000000" />
          </div>
          <div className="header-text">
            <h1>Jurisdiction Management</h1>
            <p>Configure and manage countries for your legal system</p>
          </div>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-label">Total Countries</span>
            <span className="stat-value">{totalItems}</span>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert alert-error">
          <div className="alert-content">{error}</div>
          <button className="alert-close" onClick={() => setError('')}>
            <X size={18} />
          </button>
        </div>
      )}
      {success && (
        <div className="alert alert-success">
          <div className="alert-content">{success}</div>
          <button className="alert-close" onClick={() => setSuccess('')}>
            <X size={18} />
          </button>
        </div>
      )}

      <div className="setup-content premium-content">
        <div className="countries-wrapper">
          {/* Toolbar */}
          <div className="countries-toolbar premium-toolbar">
            <div className="search-box premium-search">
              <Search size={18} color="#000000" />
              <input
                type="text"
                placeholder="Search by country name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="btn-add premium-btn-add" onClick={() => setShowForm(true)}>
              <Plus size={18} />
              <span>Add Country</span>
            </button>
          </div>

          {/* Form Modal */}
          {showForm && (
            <div className="form-overlay">
              <div className="form-container premium-form">
                <div className="form-header">
                  <div>
                    <h2>{editingId ? 'Edit Country' : 'Add New Country'}</h2>
                    <p>{editingId ? 'Update country information' : 'Create a new country jurisdiction'}</p>
                  </div>
                  <button className="btn-close" onClick={handleCloseForm}>
                    <X size={20} />
                  </button>
                </div>

                {error && <div className="form-error">{error}</div>}

                <form onSubmit={handleAddCountry}>
                  <div className="form-group">
                    <label>Country Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., United States of America"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Country Code *</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="e.g., US (ISO 3166-1)"
                      maxLength={3}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Add notes about this jurisdiction..."
                      rows={4}
                    />
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <div className="status-toggle">
                      <label className="toggle-label">
                        <input
                          type="checkbox"
                          checked={formData.is_active}
                          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        />
                        <span className="toggle-text">
                          {formData.is_active ? 'Active' : 'Disabled'}
                        </span>
                      </label>
                    </div>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn-submit">
                      {editingId ? 'Save' : 'Create Country'}
                    </button>
                    <button type="button" className="btn-cancel" onClick={handleCloseForm}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {deleteModal && (
            <div className="form-overlay">
              <div className="form-container premium-form delete-modal">
                <div className="delete-header">
                  <AlertTriangle size={32} color="#dc2626" />
                  <h2>Delete Country</h2>
                  <p>This action cannot be undone</p>
                </div>

                <div className="delete-warning">
                  <p>To confirm deletion of <strong>{deleteModal.name}</strong>, please type the country name below:</p>
                </div>

                {error && <div className="form-error">{error}</div>}

                <div className="form-group">
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder={`Type "${deleteModal.name}" to confirm`}
                    autoFocus
                  />
                </div>

                <div className="form-actions delete-actions">
                  <button
                    className="btn-delete-confirm"
                    onClick={handleConfirmDelete}
                    disabled={deleteConfirmText !== deleteModal.name}
                  >
                    Delete Country
                  </button>
                  <button className="btn-cancel" onClick={handleCloseDeleteModal}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Table Section */}
          <div className="table-section">
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading countries...</p>
              </div>
            ) : countries.length === 0 ? (
              <div className="empty-state premium-empty">
                <div className="empty-icon">
                  <Globe size={56} strokeWidth={1} color="#000000" />
                </div>
                <h3>No Countries Found</h3>
                <p>Use the "Add Country" button above to create your first jurisdiction</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="countries-table premium-table">
                  <thead>
                    <tr>
                      <th>Country</th>
                      <th>Code</th>
                      <th>Description</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {countries.map((country) => (
                      <tr key={country.id} className="table-row">
                        <td className="cell-country">
                          <div className="country-badge">
                            <Globe size={16} color="#000000" />
                            <span>{country.name}</span>
                          </div>
                        </td>
                        <td className="cell-code">
                          <code>{country.code}</code>
                        </td>
                        <td className="cell-description">
                          {country.description || <span className="text-muted">—</span>}
                        </td>
                        <td className="cell-status">
                          <span className={`status-badge ${country.is_active ? 'active' : 'inactive'}`}>
                            {country.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="cell-actions">
                          <button
                            className="btn-action edit"
                            onClick={() => handleEditCountry(country)}
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            className="btn-action delete"
                            onClick={() => handleOpenDeleteModal(country.id, country.name)}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pagination-controls" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '1rem',
                marginTop: '1.5rem',
                paddingTop: '1rem',
                borderTop: '1px solid #e2e8f0'
              }}>
                <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                  Page {currentPage} of {totalPages}
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '0.5rem',
                      border: '1px solid #e2e8f0',
                      backgroundColor: currentPage === 1 ? '#f1f5f9' : 'white',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      color: currentPage === 1 ? '#94a3b8' : '#0f172a'
                    }}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '0.5rem',
                      border: '1px solid #e2e8f0',
                      backgroundColor: currentPage === totalPages ? '#f1f5f9' : 'white',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      color: currentPage === totalPages ? '#94a3b8' : '#0f172a'
                    }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
