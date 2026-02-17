import { X, Upload, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import './UploadCaseModal.css';

interface UploadCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UploadCaseModal({ isOpen, onClose, onSuccess }: UploadCaseModalProps) {
  const [formData, setFormData] = useState({
    case_title: '',
    citation: '',
    court_name: '',
    precedent_level: '1',
    country: '',
    country_code: '',
    state: '',
    ruling_date: '',
    case_types: '',
    fact_summary: '',
    legal_holding: ''
  });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // System Setup Data
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [caseTypes, setCaseTypes] = useState<any[]>([]);
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

      // Fetch case types
      const caseTypesRes = await fetch('http://localhost:8000/api/admin/system-setup/case-types', { headers });
      if (caseTypesRes.ok) {
        const caseTypesData = await caseTypesRes.json();
        setCaseTypes(caseTypesData);
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
      uploadFormData.append('case_title', formData.case_title);
      uploadFormData.append('citation', formData.citation);
      uploadFormData.append('court_name', formData.court_name);
      uploadFormData.append('precedent_level', formData.precedent_level);
      uploadFormData.append('country', formData.country);
      uploadFormData.append('country_code', formData.country_code);
      uploadFormData.append('ruling_date', formData.ruling_date);
      uploadFormData.append('case_types', formData.case_types);

      if (formData.state) uploadFormData.append('state', formData.state);
      if (formData.fact_summary) uploadFormData.append('fact_summary', formData.fact_summary);
      if (formData.legal_holding) uploadFormData.append('legal_holding', formData.legal_holding);

      const response = await fetch('http://localhost:8000/api/admin/knowledge-base/cases/upload', {
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
      case_title: '',
      citation: '',
      court_name: '',
      precedent_level: '1',
      country: '',
      country_code: '',
      state: '',
      ruling_date: '',
      case_types: '',
      fact_summary: '',
      legal_holding: ''
    });
    setFile(null);
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-case" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Upload Legal Case</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-grid">
            <div className="form-group full-width">
              <label>Case Title *</label>
              <input
                type="text"
                required
                value={formData.case_title}
                onChange={(e) => setFormData({ ...formData, case_title: e.target.value })}
                placeholder="e.g., Smith v. Jones"
              />
            </div>

            <div className="form-group">
              <label>Citation *</label>
              <input
                type="text"
                required
                value={formData.citation}
                onChange={(e) => setFormData({ ...formData, citation: e.target.value })}
                placeholder="e.g., 123 U.S. 456"
              />
            </div>

            <div className="form-group">
              <label>Court Name *</label>
              <input
                type="text"
                required
                value={formData.court_name}
                onChange={(e) => setFormData({ ...formData, court_name: e.target.value })}
                placeholder="e.g., Supreme Court"
              />
            </div>

            <div className="form-group">
              <label>Precedent Level *</label>
              <select
                required
                value={formData.precedent_level}
                onChange={(e) => setFormData({ ...formData, precedent_level: e.target.value })}
              >
                <option value="1">Trial Court</option>
                <option value="2">Appeals Court</option>
                <option value="3">High Court</option>
                <option value="4">Supreme Court</option>
              </select>
            </div>

            <div className="form-group">
              <label>Ruling Date *</label>
              <input
                type="date"
                required
                value={formData.ruling_date}
                onChange={(e) => setFormData({ ...formData, ruling_date: e.target.value })}
              />
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

            <div className="form-group full-width">
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
              <label>Case Types *</label>
              <select
                required
                value={formData.case_types}
                onChange={(e) => setFormData({ ...formData, case_types: e.target.value })}
              >
                <option value="">Select Case Type</option>
                {caseTypes.map((type) => (
                  <option key={type.id} value={type.name}>{type.name}</option>
                ))}
              </select>
              <small style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.25rem' }}>Select primary case type</small>
            </div>

            <div className="form-group full-width">
              <label>Fact Summary</label>
              <textarea
                value={formData.fact_summary}
                onChange={(e) => setFormData({ ...formData, fact_summary: e.target.value })}
                placeholder="Brief summary of the case facts..."
                rows={3}
              />
            </div>

            <div className="form-group full-width">
              <label>Legal Holding</label>
              <textarea
                value={formData.legal_holding}
                onChange={(e) => setFormData({ ...formData, legal_holding: e.target.value })}
                placeholder="Core legal principle established..."
                rows={3}
              />
            </div>

            <div className="form-group full-width">
              <label>PDF Document *</label>
              <div className="file-upload-area">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  id="case-file-input"
                  required
                />
                <label htmlFor="case-file-input" className="file-upload-label">
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
              {uploading ? 'Uploading...' : 'Upload Case'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
