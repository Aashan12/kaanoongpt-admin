'use client';

import { useState, useEffect } from 'react';
import { Gavel, X, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import './add-court.css';

interface Country {
  id: string;
  name: string;
  code: string;
}

export default function AddCourtPage() {
  const router = useRouter();
  const [countries, setCountries] = useState<Country[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    country_id: '',
    country_name: '',
    category: '',
    court_type: '',
    description: '',
    hierarchy_level: 1,
    is_active: true,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/admin';

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      const response = await fetch(`${API_URL}/system-setup/countries/`);
      if (response.ok) {
        const data = await response.json();
        setCountries(data);
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
  };

  const handleCountryChange = (countryId: string) => {
    const selected = countries.find(c => c.id === countryId);
    setFormData({
      ...formData,
      country_id: countryId,
      country_name: selected?.name || '',
    });
  };

  const handleAddCourt = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name || !formData.country_id || !formData.category) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const payload = {
        name: formData.name,
        country_id: formData.country_id,
        country_name: formData.country_name,
        category: formData.category,
        court_type: formData.court_type || null,
        description: formData.description,
        hierarchy_level: formData.hierarchy_level,
        is_active: formData.is_active,
      };

      console.log('Sending payload:', payload);

      const response = await fetch(`${API_URL}/system-setup/court-types/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSuccess('Court type added successfully!');
        setTimeout(() => {
          router.push('/admin/setup/court-types');
        }, 1500);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Error saving court type');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error saving court type');
    }
  };

  return (
    <div className="add-court-container">
      <div className="add-court-header">
        <button className="btn-back" onClick={() => router.back()}>
          <ChevronLeft size={24} />
          <span>Back</span>
        </button>
        <div className="header-title">
          <Gavel size={32} color="#000000" />
          <div>
            <h1>Add New Court Type</h1>
            <p>Create a new court type for a jurisdiction</p>
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
        </div>
      )}

      <div className="add-court-content">
        <div className="form-panel">
          <form onSubmit={handleAddCourt}>
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
              <label>Court Name * <span className="required-badge">Required</span></label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Supreme Court, District Court"
                required
              />
            </div>

            <div className="form-group">
              <label>Category * <span className="required-badge">Required</span></label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Supreme, High, District, Appellate"
                required
              />
              <small>Examples: Supreme, High, District, Appellate, Crown, Magistrate, Subordinate</small>
            </div>

            <div className="form-group">
              <label>Court Type Level</label>
              <select
                value={formData.court_type}
                onChange={(e) => setFormData({ ...formData, court_type: e.target.value })}
              >
                <option value="">None (Single-tier system)</option>
                <option value="Federal">Federal</option>
                <option value="State">State</option>
              </select>
              <small>Use "Federal" or "State" for multi-tier systems like USA, Brazil, India. Leave empty for single-tier systems like Nepal, UK.</small>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Hierarchy Level * <span className="required-badge">Required</span></label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.hierarchy_level}
                  onChange={(e) => setFormData({ ...formData, hierarchy_level: parseInt(e.target.value) })}
                  required
                />
                <small>1 = Highest (Supreme), higher numbers = lower courts</small>
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add notes about this court type..."
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
                Create Court Type
              </button>
              <button type="button" className="btn-cancel" onClick={() => router.back()}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
