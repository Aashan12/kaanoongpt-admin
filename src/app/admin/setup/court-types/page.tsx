'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Edit2, Search, Gavel, X, AlertTriangle, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import '../setup.css';
import './court-types.css';

interface CourtType {
  id: string;
  name: string;
  country_id: string;
  country_name: string;
  category: string;
  court_type?: string | null;
  description?: string;
  hierarchy_level: number;
  is_active: boolean;
  created_at: string;
}

interface Country {
  id: string;
  name: string;
  code: string;
}

export default function CourtTypesPage() {
  const router = useRouter();
  const [courtTypes, setCourtTypes] = useState<CourtType[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ id: string; name: string } | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [applyingTemplate, setApplyingTemplate] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/admin';

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCourtTypes();
    }, 500);
    return () => clearTimeout(timer);
  }, [currentPage, searchTerm, selectedCountry]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCountry]);

  const fetchCountries = async () => {
    try {
      // Use limit 100 to get list for dropdown
      const response = await fetch(`${API_URL}/system-setup/countries/?limit=100`);
      if (response.ok) {
        const data = await response.json();
        const countryList = data.data || (Array.isArray(data) ? data : []);
        setCountries(countryList);
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
  };

  const fetchCourtTypes = useCallback(async () => {
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

      if (selectedCountry) {
        queryParams.append('country_id', selectedCountry);
      }

      const response = await fetch(`${API_URL}/system-setup/court-types/?${queryParams.toString()}`);
      if (response.ok) {
        const data = await response.json();
        if (data.data && Array.isArray(data.data)) {
          setCourtTypes(data.data);
          setTotalItems(data.total);
        } else if (Array.isArray(data)) {
          // Fallback
          setCourtTypes(data);
          setTotalItems(data.length);
        }
      }
    } catch (error) {
      console.error('Error fetching court types:', error);
      setError('Failed to load court types');
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, selectedCountry, API_URL]);

  const handleApplyTemplate = async () => {
    if (!selectedCountry) {
      setError('Please select a country first');
      return;
    }

    const country = countries.find(c => c.id === selectedCountry);
    if (!country) return;

    setApplyingTemplate(true);
    try {
      const response = await fetch(
        `${API_URL}/system-setup/court-types/templates/apply/${selectedCountry}?country_name=${encodeURIComponent(country.name)}`,
        { method: 'POST' }
      );

      if (response.ok) {
        const data = await response.json();
        setSuccess(`Applied ${data.court_types.length} court types from template`);
        setTimeout(() => setSuccess(''), 3000);
        fetchCourtTypes();
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Error applying template');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error applying template');
    } finally {
      setApplyingTemplate(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal) return;

    if (deleteConfirmText !== deleteModal.name) {
      setError('Court type name does not match. Please type the exact name.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/system-setup/court-types/${deleteModal.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess('Court type deleted successfully');
        setDeleteModal(null);
        setDeleteConfirmText('');
        setTimeout(() => setSuccess(''), 3000);
        fetchCourtTypes();
      } else {
        setError('Error deleting court type');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error deleting court type');
    }
  };

  const handleEditCourtType = (courtType: CourtType) => {
    router.push(`/admin/setup/court-types/add-court?id=${courtType.id}`);
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

  const handleCountryChange = (countryId: string) => {
    setSelectedCountry(countryId);
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Supreme': '#dc2626',
      'Federal': '#2563eb',
      'State': '#7c3aed',
      'High': '#059669',
      'Appellate': '#f59e0b',
      'Crown': '#8b5cf6',
      'Magistrate': '#06b6d4',
      'District': '#10b981',
      'Subordinate': '#6366f1',
    };
    return colors[category] || '#64748b';
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="setup-container">
      <div className="setup-header premium-header">
        <div className="header-content">
          <div className="header-icon-wrapper">
            <Gavel size={40} strokeWidth={1.5} color="#000000" />
          </div>
          <div className="header-text">
            <h1>Court Types Management</h1>
            <p>Configure court types for each country jurisdiction</p>
          </div>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-label">Total Court Types</span>
            <span className="stat-value">{totalItems}</span>
          </div>
        </div>
      </div>

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
        <div className="court-types-wrapper">
          <div className="court-types-toolbar premium-toolbar">
            <div className="toolbar-left">
              <div className="country-selector">
                <label>Select Country:</label>
                <select
                  value={selectedCountry}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="premium-select"
                >
                  <option value="">All Countries</option>
                  {countries.map((country) => (
                    <option key={country.id} value={country.id}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="search-box premium-search">
                <Search size={18} color="#000000" />
                <input
                  type="text"
                  placeholder="Search by court name or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="toolbar-right">
              {selectedCountry && (
                <>
                  {['Nepal', 'United States', 'United Kingdom', 'India'].includes(
                    countries.find(c => c.id === selectedCountry)?.name || ''
                  ) ? (
                    <button
                      className="btn-template"
                      onClick={handleApplyTemplate}
                      disabled={applyingTemplate}
                    >
                      <Zap size={16} />
                      <span>{applyingTemplate ? 'Applying...' : 'Apply Template'}</span>
                    </button>
                  ) : (
                    <div className="template-unavailable">
                      <span>No template available for this country</span>
                    </div>
                  )}
                </>
              )}
              <button className="btn-add premium-btn-add" onClick={() => router.push('/admin/setup/court-types/add-court')}>
                <Plus size={18} />
                <span>Add Court Type</span>
              </button>
            </div>
          </div>

          {deleteModal && (
            <div className="form-overlay">
              <div className="form-container premium-form delete-modal">
                <div className="delete-header">
                  <AlertTriangle size={32} color="#dc2626" />
                  <h2>Delete Court Type</h2>
                  <p>This action cannot be undone</p>
                </div>

                <div className="delete-warning">
                  <p>To confirm deletion of <strong>{deleteModal.name}</strong>, please type the court type name below:</p>
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
                    Delete Court Type
                  </button>
                  <button className="btn-cancel" onClick={handleCloseDeleteModal}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="table-section">
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading court types...</p>
              </div>
            ) : courtTypes.length === 0 ? (
              <div className="empty-state premium-empty">
                <div className="empty-icon">
                  <Gavel size={56} strokeWidth={1} color="#000000" />
                </div>
                <h3>No Court Types Found</h3>
                <p>{selectedCountry ? 'Use the "Add Court Type" button above to create your first court type, or apply a template' : 'Select a country to view or create court types'}</p>
                {selectedCountry && (
                  <button
                    className="btn-empty-action"
                    onClick={handleApplyTemplate}
                    disabled={applyingTemplate}
                  >
                    <Zap size={16} />
                    <span>{applyingTemplate ? 'Applying...' : 'Apply Template'}</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="court-types-table premium-table">
                  <thead>
                    <tr>
                      <th>Court Name</th>
                      <th>Category</th>
                      <th>Court Type</th>
                      <th>Hierarchy Level</th>
                      <th>Country</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courtTypes
                      .sort((a, b) => a.hierarchy_level - b.hierarchy_level)
                      .map((courtType) => (
                        <tr key={courtType.id} className="table-row">
                          <td className="cell-name">
                            <div className="court-badge">
                              <Gavel size={16} color="#000000" />
                              <span>{courtType.name}</span>
                            </div>
                          </td>
                          <td className="cell-category">
                            <span
                              className="category-badge"
                              style={{ backgroundColor: getCategoryColor(courtType.category) }}
                            >
                              {courtType.category}
                            </span>
                          </td>
                          <td className="cell-court-type">
                            {courtType.court_type ? (
                              <span className={`court-type-badge ${courtType.court_type.toLowerCase()}`}>
                                {courtType.court_type}
                              </span>
                            ) : (
                              <span className="court-type-badge none">—</span>
                            )}
                          </td>
                          <td className="cell-level">
                            <span className="level-badge">{courtType.hierarchy_level}</span>
                          </td>
                          <td className="cell-country">{courtType.country_name}</td>
                          <td className="cell-status">
                            <span className={`status-badge ${courtType.is_active ? 'active' : 'inactive'}`}>
                              {courtType.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="cell-actions">
                            <button
                              className="btn-action edit"
                              onClick={() => handleEditCourtType(courtType)}
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              className="btn-action delete"
                              onClick={() => handleOpenDeleteModal(courtType.id, courtType.name)}
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
