import { X, Upload, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import './UploadLawModal.css';

interface UploadLawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UploadLawModal({ isOpen, onClose, onSuccess }: UploadLawModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    law_number: '',
    category: '',
    country: '',
    country_code: '',
    state: '',
    enacted_date: '',
    keywords: '',
    summary: ''
  });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // System Setup Data
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [filteredStates, setFilteredStates] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchSystemSetupData();
    }
  }, [isOpen]);

  useEffect(() => {
    // Filter states based on selected country
    if (formData.country) {
      const filtered = states.filter(state => state.country_id === formData.country);
      setFilteredStates(filtered);
    } else {
      setFilteredStates([]);
    }
  }, [formData.country, states]);

  const fetchSystemSetupData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch countries
      const countriesRes = await fetch('http://localhost:8000/api/admin/system-setup/countries', { headers });
      if (countriesRes.ok) {
        const countriesData = await countriesRes.json();
        setCountries(countriesData);
      }

      // Fetch states
      const statesRes = await fetch('http://localhost:8000/api/admin/system-setup/states', { headers });
      if (statesRes.ok) {
        const statesData = await statesRes.json();
        setStates(statesData);
      }

      // Fetch law categories
      const categoriesRes = await fetch('http://localhost:8000/api/admin/system-setup/law-categories', { headers });
      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);
      }
    } catch (err) {
      console.error('Error fetching system setup data:', err);
    }
  };

  const handleCountryChange = (countryId: string) => {
    const selectedCountry = countries.find(c => c.id === countryId);
    setFormData({
      ...formData,
      country: countryId,
      country_code: selectedCountry?.code || '',
      state: '' // Reset state when country changes
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError('Please select a PDF file');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const token = localStorage.getItem('adminToken');
      const uploadFormData = new FormData();

      uploadFormData.append('file', file);
      uploadFormData.append('title', formData.title);
      uploadFormData.append('category', formData.category);
      uploadFormData.append('country', formData.country);
      uploadFormData.append('country_code', formData.country_code);

      if (formData.law_number) uploadFormData.append('law_number', formData.law_number);
      if (formData.state) uploadFormData.append('state', formData.state);

      const response = await fetch('http://localhost:8000/api/admin/knowledge-base/laws/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: uploadFormData
      });

      if (response.ok) {
        onSuccess();
        onClose();
        resetForm();
      } else {
        const data = await response.json();
        setError(data.detail || 'Upload failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      law_number: '',
      category: '',
      country: '',
      country_code: '',
      state: '',
      enacted_date: '',
      keywords: '',
      summary: ''
    });
    setFile(null);
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-law" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Upload Law Document</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-grid">
            <div className="form-group full-width">
              <label>Document Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Civil Code Act 2074"
              />
            </div>

            <div className="form-group">
              <label>Law Number</label>
              <input
                type="text"
                value={formData.law_number}
                onChange={(e) => setFormData({ ...formData, law_number: e.target.value })}
                placeholder="e.g., Act No. 2074"
              />
            </div>

            <div className="form-group">
              <label>Category *</label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Country *</label>
              <select
                required
                value={formData.country}
                onChange={(e) => handleCountryChange(e.target.value)}
              >
                <option value="">Select Country</option>
                {countries.map((country) => (
                  <option key={country.id} value={country.id}>{country.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Country Code *</label>
              <input
                type="text"
                required
                readOnly
                value={formData.country_code}
                placeholder="Auto-filled"
                style={{ background: '#f8fafc', cursor: 'not-allowed' }}
              />
            </div>

            <div className="form-group">
              <label>State/Province</label>
              <select
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                disabled={!formData.country}
              >
                <option value="">Select State (Optional)</option>
                {filteredStates.map((state) => (
                  <option key={state.id} value={state.id}>{state.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group full-width">
              <label>PDF Document *</label>
              <div className="file-upload-area">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  id="law-file-input"
                  required
                />
                <label htmlFor="law-file-input" className="file-upload-label">
                  <Upload size={24} />
                  <span>{file ? file.name : 'Choose PDF file'}</span>
                </label>
              </div>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={uploading}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload Law'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
