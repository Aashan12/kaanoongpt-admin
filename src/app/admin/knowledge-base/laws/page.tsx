'use client';

import { useState, useEffect } from 'react';
import { Upload, Search, Filter, FileText, Trash2, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import UploadLawModal from './components/UploadLawModal';
import './laws.css';

interface Law {
  id: string;
  title: string;
  law_number?: string;
  category: string;
  country: string;
  country_code: string;
  state?: string;
  file_url: string;
  embedding_status: 'pending' | 'processing' | 'completed' | 'failed';
  chunk_count: number;
  created_at: string;
}

export default function LawsManagementPage() {
  const [laws, setLaws] = useState<Law[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCountry, setFilterCountry] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    fetchLaws();
  }, [filterCountry, filterCategory]);

  const fetchLaws = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams();
      if (filterCountry) params.append('country_code', filterCountry);
      if (filterCategory) params.append('category', filterCategory);

      const response = await fetch(
        `http://localhost:8000/api/admin/knowledge-base/laws?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setLaws(data);
      }
    } catch (error) {
      console.error('Error fetching laws:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAutonomousSync = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:8000/api/admin/knowledge-base/laws/harvest', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        alert('Autonomous harvesting started in the background!');
        fetchLaws();
      } else {
        alert('Harvesting failed. Check server logs.');
      }
    } catch (error) {
      alert('Network error while starting harvest.');
    } finally {
      setLoading(false);
    }
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

  const filteredLaws = laws.filter(law =>
    law.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    law.law_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="laws-container">
      <div className="laws-header">
        <div className="laws-title-section">
          <h1>Laws & Regulations</h1>
          <p>Manage legal documents and legislation for the knowledge base</p>
        </div>
        <div className="laws-header-actions">
          <button className="btn-sync" onClick={() => handleAutonomousSync()} disabled={loading}>
            <Clock size={20} />
            Autonomous Sync
          </button>
          <button className="btn-upload" onClick={() => setShowUploadModal(true)}>
            <Upload size={20} />
            Upload Law
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="laws-stats-grid">
        <div className="laws-stat-card">
          <div className="stat-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>
            <FileText size={24} />
          </div>
          <div className="stat-info">
            <h3>Total Laws</h3>
            <p className="stat-value">{laws.length}</p>
          </div>
        </div>
        <div className="laws-stat-card">
          <div className="stat-icon" style={{ background: '#d1fae5', color: '#059669' }}>
            <CheckCircle size={24} />
          </div>
          <div className="stat-info">
            <h3>Indexed</h3>
            <p className="stat-value">{laws.filter(l => l.embedding_status === 'completed').length}</p>
          </div>
        </div>
        <div className="laws-stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#f59e0b' }}>
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <h3>Pending</h3>
            <p className="stat-value">{laws.filter(l => l.embedding_status === 'pending').length}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="laws-controls">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search laws..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="laws-search-input"
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
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
          >
            <option value="">All Categories</option>
            <option value="Constitution">Constitution</option>
            <option value="Civil Code">Civil Code</option>
            <option value="Penal Code">Penal Code</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="laws-table-card">
        <table className="laws-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Law Number</th>
              <th>Category</th>
              <th>Country</th>
              <th>Status</th>
              <th>Chunks</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLaws.map((law) => (
              <tr key={law.id}>
                <td>
                  <div className="law-title">{law.title}</div>
                </td>
                <td>{law.law_number || '—'}</td>
                <td>
                  <span className="category-badge">{law.category}</span>
                </td>
                <td>{law.country_code}</td>
                <td>{getStatusBadge(law.embedding_status)}</td>
                <td>{law.chunk_count}</td>
                <td>
                  <div className="law-actions">
                    <a href={law.file_url} target="_blank" rel="noopener noreferrer" className="btn-icon-view">
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

      <UploadLawModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={fetchLaws}
      />
    </div>
  );
}
