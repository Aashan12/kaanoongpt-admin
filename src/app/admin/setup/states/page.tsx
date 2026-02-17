'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Edit2, Search, MapPin, X, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import '../setup.css';
import './states.css';

interface State {
  id: string;
  _id?: string;
  name: string;
  country_id: string;
  country_name: string;
  description?: string;
  is_active: boolean;
  latitude?: number;
  longitude?: number;
  created_at: string;
}

interface Country {
  id: string;
  _id?: string;
  name: string;
  code: string;
}

interface StateOption {
  id: string;
  name: string;
}

export default function StatesPage() {
  const router = useRouter();
  const [states, setStates] = useState<State[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [stateOptions, setStateOptions] = useState<StateOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountryFilter, setSelectedCountryFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    country_id: '',
    country_name: '',
    description: '',
    is_active: true,
    latitude: 0,
    longitude: 0,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ id: string; name: string } | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [selectedState, setSelectedState] = useState<State | null>(null);
  const mapRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/admin';

  useEffect(() => {
    fetchCountries();
  }, []);

  // Fetch states when page, search, or filter changes
  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchStates();
    }, 500);
    return () => clearTimeout(timer);
  }, [currentPage, searchTerm, selectedCountryFilter]);

  // Reset page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCountryFilter]);

  useEffect(() => {
    if (showMapPicker && mapRef.current && !mapInstanceRef.current) {
      initializeMap();
    }
  }, [showMapPicker]);

  const initializeMap = () => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY}`;
    script.async = true;
    script.onload = () => {
      const map = new (window as any).google.maps.Map(mapRef.current, {
        zoom: 4,
        center: { lat: formData.latitude || 20, lng: formData.longitude || 0 },
      });

      if (formData.latitude && formData.longitude) {
        new (window as any).google.maps.Marker({
          position: { lat: formData.latitude, lng: formData.longitude },
          map: map,
          title: 'Selected Location',
        });
      }

      map.addListener('click', (e: any) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setFormData({ ...formData, latitude: lat, longitude: lng });

        // Clear previous markers
        mapInstanceRef.current?.markers?.forEach((m: any) => m.setMap(null));

        // Add new marker
        new (window as any).google.maps.Marker({
          position: { lat, lng },
          map: map,
          title: 'Selected Location',
        });
      });

      mapInstanceRef.current = map;
    };
    document.head.appendChild(script);
  };

  const fetchCountries = async () => {
    try {
      const response = await fetch(`${API_URL}/system-setup/countries/?limit=100`);
      if (response.ok) {
        const data = await response.json();
        const countryList = data.data || (Array.isArray(data) ? data : []);
        const normalizedData = countryList.map((c: any) => ({
          ...c,
          id: c.id || c._id
        }));
        setCountries(normalizedData);
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
  };

  const fetchStates = async () => {
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

      if (selectedCountryFilter) {
        queryParams.append('country_id', selectedCountryFilter);
      }

      const response = await fetch(`${API_URL}/system-setup/states/?${queryParams.toString()}`);
      if (response.ok) {
        const data = await response.json();
        let statesList = [];

        if (data.data && Array.isArray(data.data)) {
          statesList = data.data;
          setTotalItems(data.total);
        } else if (Array.isArray(data)) {
          // Fallback
          statesList = data;
          setTotalItems(data.length);
        }

        // Normalize states with extreme prejudice: ensure they have an 'id'
        const normalizedData = statesList.map((s: any) => {
          const id = s.id || s._id || (s.id_ ? s.id_ : undefined);
          return {
            ...s,
            id: id,
            _id: s._id || id
          };
        });
        setStates(normalizedData);
      }
    } catch (error) {
      console.error('Error fetching states:', error);
      setError('Failed to load states');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatesByCountry = async (countryId: string) => {
    try {
      const response = await fetch(`${API_URL}/system-setup/states/by-country/${countryId}`);
      if (response.ok) {
        const data = await response.json();
        const list = Array.isArray(data) ? data : (data.data || []);
        setStateOptions(list.map((s: any) => {
          const id = s.id || s._id;
          return { id, name: s.name };
        }));
      }
    } catch (error) {
      console.error('Error fetching states:', error);
      setStateOptions([]);
    }
  };

  const handleAddState = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name || !formData.country_id) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId
        ? `${API_URL}/system-setup/states/${editingId}`
        : `${API_URL}/system-setup/states/`;

      const payload = {
        name: formData.name,
        country_id: formData.country_id,
        country_name: formData.country_name,
        description: formData.description,
        is_active: formData.is_active,
        latitude: formData.latitude || null,
        longitude: formData.longitude || null,
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSuccess(editingId ? 'State updated successfully' : 'State added successfully');
        setFormData({
          name: '',
          country_id: '',
          country_name: '',
          description: '',
          is_active: true,
          latitude: 0,
          longitude: 0,
        });
        setEditingId(null);
        setShowForm(false);
        setStateOptions([]);
        setTimeout(() => setSuccess(''), 3000);
        fetchStates();
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Error saving state');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error saving state');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal || !deleteModal.id || deleteModal.id === 'undefined') {
      setError('Invalid state ID. Please refresh and try again.');
      return;
    }

    if (deleteConfirmText !== deleteModal.name) {
      setError('State name does not match. Please type the exact state name.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/system-setup/states/${deleteModal.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('State deleted successfully');
        setDeleteModal(null);
        setDeleteConfirmText('');
        setTimeout(() => setSuccess(''), 3000);
        fetchStates();
      } else {
        setError(data.detail || 'Error deleting state');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error connecting to server');
    }
  };

  const handleEditState = (state: State) => {
    setFormData({
      name: state.name,
      country_id: state.country_id,
      country_name: state.country_name,
      description: state.description || '',
      is_active: state.is_active,
      latitude: state.latitude || 0,
      longitude: state.longitude || 0,
    });
    setEditingId(state.id);
    setShowForm(true);
    fetchStatesByCountry(state.country_id);
    setError('');
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: '',
      country_id: '',
      country_name: '',
      description: '',
      is_active: true,
      latitude: 0,
      longitude: 0,
    });
    setStateOptions([]);
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

  const handleCountryChange = (countryId: string) => {
    const selected = countries.find(c => c.id === countryId);
    setFormData({
      ...formData,
      country_id: countryId,
      country_name: selected?.name || '',
      name: '',
    });
    if (countryId) {
      fetchStatesByCountry(countryId);
    } else {
      setStateOptions([]);
    }
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="setup-container">
      <div className="setup-header premium-header">
        <div className="header-content">
          <div className="header-icon-wrapper">
            <MapPin size={40} strokeWidth={1.5} color="#000000" />
          </div>
          <div className="header-text">
            <h1>States & Regions Management</h1>
            <p>Configure and manage states/regions for your jurisdictions</p>
          </div>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-label">Total States</span>
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
        <div className="states-wrapper">
          <div className="states-toolbar premium-toolbar">
            <div className="search-box premium-search">
              <Search size={18} color="#000000" />
              <input
                type="text"
                placeholder="Search by state name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filter-box" style={{ marginLeft: '1rem', position: 'relative' }}>
              <select
                value={selectedCountryFilter}
                onChange={(e) => setSelectedCountryFilter(e.target.value)}
                className="premium-select"
                style={{
                  padding: '0.625rem 2.5rem 0.625rem 1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #e2e8f0',
                  backgroundColor: 'white',
                  appearance: 'none',
                  cursor: 'pointer',
                  minWidth: '200px'
                }}
              >
                <option value="">All Countries</option>
                {countries.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1.5L6 6.5L11 1.5" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            <button className="btn-add premium-btn-add" onClick={() => router.push('/admin/setup/states/add-state')} style={{ marginLeft: 'auto' }}>
              <Plus size={18} />
              <span>Add State</span>
            </button>
          </div>

          {showForm && (
            <div className="form-overlay">
              <div className="form-container premium-form">
                <div className="form-header">
                  <div>
                    <h2>{editingId ? 'Edit State' : 'Add New State'}</h2>
                    <p>{editingId ? 'Update state information' : 'Create a new state/region'}</p>
                  </div>
                  <button className="btn-close" onClick={handleCloseForm}>
                    <X size={20} />
                  </button>
                </div>

                {error && <div className="form-error">{error}</div>}

                <form onSubmit={handleAddState}>
                  <div className="form-group">
                    <label>Country * <span className="required-badge">Required</span></label>
                    <select
                      value={formData.country_id}
                      onChange={(e) => handleCountryChange(e.target.value)}
                      required
                    >
                      <option value="">Select a country</option>
                      {countries.map((country) => (
                        <option key={country.id} value={country.id}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>State Name * <span className="required-badge">Required</span></label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter state name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Add notes about this state..."
                      rows={3}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Latitude: {formData.latitude.toFixed(6)}</label>
                      <input
                        type="number"
                        step="0.000001"
                        value={formData.latitude}
                        onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                        placeholder="Click map to set"
                      />
                    </div>
                    <div className="form-group">
                      <label>Longitude: {formData.longitude.toFixed(6)}</label>
                      <input
                        type="number"
                        step="0.000001"
                        value={formData.longitude}
                        onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                        placeholder="Click map to set"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn-map-picker"
                    onClick={() => setShowMapPicker(true)}
                  >
                    <MapPin size={16} />
                    Click on Map to Set Location
                  </button>

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
                      {editingId ? 'Save' : 'Create State'}
                    </button>
                    <button type="button" className="btn-cancel" onClick={handleCloseForm}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {showMapPicker && (
            <div className="form-overlay">
              <div className="form-container map-picker-modal">
                <div className="form-header">
                  <div>
                    <h2>Select Location on Map</h2>
                    <p>Click on the map to set latitude and longitude</p>
                  </div>
                  <button className="btn-close" onClick={() => setShowMapPicker(false)}>
                    <X size={20} />
                  </button>
                </div>
                <div ref={mapRef} className="map-picker-container"></div>
                <div className="map-info">
                  <p>Latitude: <strong>{formData.latitude.toFixed(6)}</strong></p>
                  <p>Longitude: <strong>{formData.longitude.toFixed(6)}</strong></p>
                </div>
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-submit"
                    onClick={() => setShowMapPicker(false)}
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}

          {deleteModal && (
            <div className="form-overlay">
              <div className="form-container premium-form delete-modal">
                <div className="delete-header">
                  <AlertTriangle size={32} color="#dc2626" />
                  <h2>Delete State</h2>
                  <p>This action cannot be undone</p>
                </div>

                <div className="delete-warning">
                  <p>To confirm deletion of <strong>{deleteModal.name}</strong>, please type the state name below:</p>
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
                    Delete State
                  </button>
                  <button className="btn-cancel" onClick={handleCloseDeleteModal}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {selectedState && selectedState.latitude && selectedState.longitude && (
            <div className="form-overlay">
              <div className="form-container map-modal">
                <div className="form-header">
                  <div>
                    <h2>{selectedState.name}</h2>
                    <p>{selectedState.country_name}</p>
                  </div>
                  <button className="btn-close" onClick={() => setSelectedState(null)}>
                    <X size={20} />
                  </button>
                </div>
                <div className="map-container">
                  <iframe
                    width="100%"
                    height="400"
                    style={{ border: 0, borderRadius: '8px' }}
                    loading="lazy"
                    allowFullScreen
                    src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d${selectedState.longitude}!3d${selectedState.latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z${selectedState.latitude}%2C${selectedState.longitude}!5e0!3m2!1sen!2s!4v1234567890`}
                  ></iframe>
                </div>
              </div>
            </div>
          )}

          <div className="table-section">
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading states...</p>
              </div>
            ) : states.length === 0 ? (
              <div className="empty-state premium-empty">
                <div className="empty-icon">
                  <MapPin size={56} strokeWidth={1} color="#000000" />
                </div>
                <h3>No States Found</h3>
                <p>Use the "Add State" button above to create your first state/region</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="states-table premium-table">
                  <thead>
                    <tr>
                      <th>State</th>
                      <th>Country</th>
                      <th>Description</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {states.map((state) => (
                      <tr key={state.id} className="table-row">
                        <td className="cell-state">
                          <div className="state-badge">
                            <MapPin size={16} color="#000000" />
                            <span>{state.name}</span>
                          </div>
                        </td>
                        <td className="cell-country">{state.country_name}</td>
                        <td className="cell-description">
                          {state.description || <span className="text-muted">—</span>}
                        </td>
                        <td className="cell-status">
                          <span className={`status-badge ${state.is_active ? 'active' : 'inactive'}`}>
                            {state.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="cell-actions">
                          {state.latitude && state.longitude && (
                            <button
                              className="btn-action map"
                              onClick={() => setSelectedState(state)}
                              title="View Map"
                            >
                              <MapPin size={16} />
                            </button>
                          )}
                          <button
                            className="btn-action edit"
                            onClick={() => handleEditState(state)}
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            className="btn-action delete"
                            onClick={() => handleOpenDeleteModal(state.id || (state as any)._id, state.name)}
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
