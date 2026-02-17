'use client';

import { useState, useEffect } from 'react';
import { Upload, Search, Gavel, Trash2, AlertCircle, CheckCircle, Clock, FileText } from 'lucide-react';
import UploadCaseModal from './components/UploadCaseModal';
import './cases.css';

interface Case {
  id: string;
  case_title: string;
  citation: string;
  court_name: string;
  precedent_level: number;
  country: string;
  country_code: string;
  state?: string;
  case_types: string[];
  ruling_date: string;
  file_url: string;
  embedding_status: 'pending' | 'processing' | 'completed' | 'failed';
  chunk_count: number;
  created_at: string;
}

export default function CasesManagementPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCountry, setFilterCountry] = useState('');
  const [filterPrecedent, setFilterPrecedent] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    fetchCases();
  }, [filterCountry, filterPrecedent]);

  const fetchCases = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams();
      if (filterCountry) params.append('country_code', filterCountry);
      if (filterPrecedent) params.append('precedent_level', filterPrecedent);

      const response = await fetch(
        `http://localhost:8000/api/admin/knowledge-base/cases?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCases(data);
      }
    } catch (error) {
      console.error('Error fetching cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAutonomousSync = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      // Re-using the harvest endpoint which wipes and re-seeds with real-world high quality data
      const response = await fetch('http://localhost:8000/api/admin/knowledge-base/laws/harvest', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        alert('Autonomous Case Harvesting started in the background!');
        fetchCases();
      } else {
        alert('Case Harvesting failed. Check server logs.');
      }
    } catch (error) {
      alert('Network error while starting harvest.');
    } finally {
      setLoading(false);
    }
  };

  const getPrecedentBadge = (level: number) => {
    const badges = {
      1: { label: 'Trial', color: '#64748b', bg: '#f1f5f9' },
      2: { label: 'Appeals', color: '#3b82f6', bg: '#dbeafe' },
      3: { label: 'High Court', color: '#8b5cf6', bg: '#ede9fe' },
      4: { label: 'Supreme', color: '#dc2626', bg: '#fee2e2' }
    };

    const badge = badges[level as keyof typeof badges] || badges[1];

    return (
      <span className="precedent-badge" style={{ background: badge.bg, color: badge.color }}>
        {badge.label}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { icon: Clock, color: '#f59e0b', bg: '#fef3c7', label: 'Pending' },
      processing: { icon: Clock, color: '#3b82f6', bg: '#dbeafe', label: 'Processing' },
      completed: { icon: CheckCircle, color: '#10b981', bg: '#d1fae5', label: 'Completed' },
      failed: { icon: AlertCircle, color: '#ef4444', bg: '#fee2e2', label: 'Failed' }
    };

    const badge = badges[status as keyof typeof badges] || badges.pending;
    const Icon = badge.icon;

    return (
      <span className="status-badge" style={{ background: badge.bg, color: badge.color }}>
        <Icon size={14} />
        {badge.label}
      </span>
    );
  };

  const filteredCases = cases.filter(c =>
    c.case_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.citation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="cases-container">
      <div className="cases-header">
        <div className="cases-title-section">
          <h1>Legal Cases & Precedents</h1>
          <p>Manage judicial rulings and case law for the knowledge base</p>
        </div>
        <div className="cases-header-actions">
          <button className="btn-sync" onClick={() => handleAutonomousSync()} disabled={loading}>
            <Clock size={20} />
            Autonomous Sync
          </button>
          <button className="btn-upload" onClick={() => setShowUploadModal(true)}>
            <Upload size={20} />
            Upload Case
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="cases-stats-grid">
        <div className="cases-stat-card">
          <div className="stat-icon" style={{ background: '#ede9fe', color: '#8b5cf6' }}>
            <Gavel size={24} />
          </div>
          <div className="stat-info">
            <h3>Total Cases</h3>
            <p className="stat-value">{cases.length}</p>
          </div>
        </div>
        <div className="cases-stat-card">
          <div className="stat-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>
            <Gavel size={24} />
          </div>
          <div className="stat-info">
            <h3>Supreme Court</h3>
            <p className="stat-value">{cases.filter(c => c.precedent_level === 4).length}</p>
          </div>
        </div>
        <div className="cases-stat-card">
          <div className="stat-icon" style={{ background: '#d1fae5', color: '#059669' }}>
            <CheckCircle size={24} />
          </div>
          <div className="stat-info">
            <h3>Indexed</h3>
            <p className="stat-value">{cases.filter(c => c.embedding_status === 'completed').length}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="cases-controls">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search cases..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="cases-search-input"
          />
        </div>
        <div className="filter-group">
          <select
            value={filterCountry}
            onChange={(e) => setFilterCountry(e.target.value)}
            className="filter-select"
          >
            <option value="">All Countries</option>
            <option value="NP">Nepal</option>
            <option value="US">United States</option>
            <option value="IN">India</option>
          </select>
          <select
            value={filterPrecedent}
            onChange={(e) => setFilterPrecedent(e.target.value)}
            className="filter-select"
          >
            <option value="">All Precedents</option>
            <option value="4">Supreme Court</option>
            <option value="3">High Court</option>
            <option value="2">Appeals Court</option>
            <option value="1">Trial Court</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="cases-table-card">
        <table className="cases-table">
          <thead>
            <tr>
              <th>Case Title</th>
              <th>Citation</th>
              <th>Court</th>
              <th>Precedent</th>
              <th>Country</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCases.map((c) => (
              <tr key={c.id}>
                <td>
                  <div className="case-title">{c.case_title}</div>
                </td>
                <td>
                  <span className="citation-text">{c.citation}</span>
                </td>
                <td>{c.court_name}</td>
                <td>{getPrecedentBadge(c.precedent_level)}</td>
                <td>{c.country_code}</td>
                <td>{getStatusBadge(c.embedding_status)}</td>
                <td>
                  <div className="case-actions">
                    <a href={c.file_url} target="_blank" rel="noopener noreferrer" className="btn-icon-view">
                      <FileText size={16} />
                    </a>
                    <button className="btn-icon-delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <UploadCaseModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={fetchCases}
      />
    </div>
  );
}
