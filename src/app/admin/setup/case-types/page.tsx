'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Edit2, Search, Briefcase, X, AlertTriangle, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import '../setup.css';
import './case-types.css';

interface CaseType {
  id: string;
  name: string;
  country_id: string;
  country_name: string;
  category: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

interface Country {
  id: string;
  name: string;
  code: string;
}

export default function CaseTypesPage() {
  const router = useRouter();
  const [caseTypes, setCaseTypes] = useState<CaseType[]>([]);
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
      fetchCaseTypes();
    }, 500);
    return () => clearTimeout(timer);
  }, [currentPage, searchTerm, selectedCountry]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCountry]);

  const fetchCountries = async () => {
    try {
      const response = await fetch(`${API_URL}/system-setup/countries/?limit=100`);
      if (response.ok) {
        const data = await response.json();
        const list = Array.isArray(data) ? data : (data.data || []);
        setCountries(list);
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
  };

  const fetchCaseTypes = useCallback(async () => {
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

      const response = await fetch(`${API_URL}/system-setup/case-types/?${queryParams.toString()}`);
      if (response.ok) {
        const data = await response.json();
        if (data.data && Array.isArray(data.data)) {
          setCaseTypes(data.data);
          setTotalItems(data.total);
        } else if (Array.isArray(data)) {
          setCaseTypes(data);
          setTotalItems(data.length);
        }
      }
    } catch (error) {
      console.error('Error fetching case types:', error);
      setError('Failed to load case types');
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
        `${API_URL}/system-setup/case-types/templates/apply/${selectedCountry}?country_name=${encodeURIComponent(country.name)}`,
        { method: 'POST' }
      );

      if (response.ok) {
        const data = await response.json();
        setSuccess(`Applied ${data.case_types.length} case types from template`);
        setTimeout(() => setSuccess(''), 3000);
        fetchCaseTypes();
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
      setError('Case type name does not match. Please type the exact name.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/system-setup/case-types/${deleteModal.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess('Case type deleted successfully');
        setDeleteModal(null);
        setDeleteConfirmText('');
        setTimeout(() => setSuccess(''), 3000);
        fetchCaseTypes();
      } else {
        setError('Error deleting case type');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error deleting case type');
    }
  };

  const handleEditCaseType = (caseType: CaseType) => {
    router.push(`/admin/setup/case-types/add-case?id=${caseType.id}`);
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
      'Civil': '#3b82f6',
      'Criminal': '#dc2626',
      'Family': '#ec4899',
      'Commercial': '#f59e0b',
      'Constitutional': '#8b5cf6',
      'Administrative': '#06b6d4',
      'Labour': '#10b981',
      'Environmental': '#059669',
      'Intellectual Property': '#6366f1',
      'Tax': '#f97316',
      'Bankruptcy': '#64748b',
      'Immigration': '#14b8a6',
      'Employment': '#84cc16',
      'Securities': '#a855f7',
      'Probate': '#f43f5e',
      'Social Law': '#0ea5e9',
    };
    return colors[category] || '#64748b';
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="setup-container">
      <div className="setup-header premium-header">
        <div className="header-content">
          <div className="header-icon-wrapper">
            <Briefcase size={40} strokeWidth={1.5} color="#000000" />
          </div>
          <div className="header-text">
            <h1>Case Types Management</h1>
            <p>Configure case types for each country jurisdiction</p>
          </div>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-label">Total Case Types</span>
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
        <div className="case-types-wrapper">
          <div className="case-types-toolbar premium-toolbar">
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
                  placeholder="Search by case name or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="toolbar-right">
              {selectedCountry && (
                <>
                  {['Nepal', 'United States', 'United Kingdom', 'India', 'Brazil', 'Canada', 'Australia', 'Germany', 'France', 'Japan', 'China', 'Mexico', 'South Africa'].includes(
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
              <button className="btn-add premium-btn-add" onClick={() => router.push('/admin/setup/case-types/add-case')}>
                <Plus size={18} />
                <span>Add Case Type</span>
              </button>
            </div>
          </div>

          {deleteModal && (
            <div className="form-overlay">
              <div className="form-container premium-form delete-modal">
                <div className="delete-header">
                  <AlertTriangle size={32} color="#dc2626" />
                  <h2>Delete Case Type</h2>
                  <p>This action cannot be undone</p>
                </div>

                <div className="delete-warning">
                  <p>To confirm deletion of <strong>{deleteModal.name}</strong>, please type the case type name below:</p>
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
                    Delete Case Type
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
                <p>Loading case types...</p>
              </div>
            ) : caseTypes.length === 0 ? (
              <div className="empty-state premium-empty">
                <div className="empty-icon">
                  <Briefcase size={56} strokeWidth={1} color="#000000" />
                </div>
                <h3>No Case Types Found</h3>
                <p>{selectedCountry ? 'Use the "Add Case Type" button above to create your first case type, or apply a template' : 'Select a country to view or create case types'}</p>
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
                <table className="case-types-table premium-table">
                  <thead>
                    <tr>
                      <th>Case Name</th>
                      <th>Category</th>
                      <th>Country</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {caseTypes.map((caseType) => (
                      <tr key={caseType.id} className="table-row">
                        <td className="cell-name">
                          <div className="case-badge">
                            <Briefcase size={16} color="#000000" />
                            <span>{caseType.name}</span>
                          </div>
                        </td>
                        <td className="cell-category">
                          <span
                            className="category-badge"
                            style={{ backgroundColor: getCategoryColor(caseType.category) }}
                          >
                            {caseType.category}
                          </span>
                        </td>
                        <td className="cell-country">{caseType.country_name}</td>
                        <td className="cell-status">
                          <span className={`status-badge ${caseType.is_active ? 'active' : 'inactive'}`}>
                            {caseType.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="cell-actions">
                          <button
                            className="btn-action edit"
                            onClick={() => handleEditCaseType(caseType)}
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            className="btn-action delete"
                            onClick={() => handleOpenDeleteModal(caseType.id, caseType.name)}
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
