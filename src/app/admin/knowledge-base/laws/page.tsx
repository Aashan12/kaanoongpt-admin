'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Upload, Search, FileText, Trash2, AlertCircle, CheckCircle, Clock,
  Globe, RefreshCw, Layers, ExternalLink, BookOpen, Plus, X, Loader2
} from 'lucide-react';
import Link from 'next/link';
import UploadLawModal from './components/UploadLawModal';
import './laws.css';

interface Law {
  id: string;
  title: string;
  law_number?: string;
  category: string;
  country: string;
  country_code: string;
  file_url: string;
  embedding_status: 'pending' | 'processing' | 'completed' | 'failed';
  chunk_count: number;
  created_at: string;
}

interface Country { _id: string; name: string; code: string; is_active: boolean; }

interface CatalogItem {
  id: string;
  title: string;
  description: string;
  source_url: string;
  source_type: string;
  category: string;
  country_code: string;
  status: 'available' | 'ingesting' | 'ingested' | 'failed';
  section_count: number;
  chunk_count: number;
  ingested_at: string | null;
}

const API = 'http://localhost:8000/api/admin/knowledge-base';
const SETUP_API = 'http://localhost:8000/api/admin/system-setup';

export default function LawsManagementPage() {
  const [laws, setLaws] = useState<Law[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Country
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [countriesLoading, setCountriesLoading] = useState(true);

  // Catalog
  const [showCatalog, setShowCatalog] = useState(false);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [ingestingIds, setIngestingIds] = useState<Set<string>>(new Set());

  const getToken = () => localStorage.getItem('adminToken');

  const fetchCountries = useCallback(async () => {
    setCountriesLoading(true);
    try {
      const res = await fetch(`${SETUP_API}/countries?limit=100`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        const json = await res.json();
        const list: Country[] = json.data || json;
        const active = list.filter((c) => c.is_active);
        setCountries(active);
        if (active.length > 0 && !selectedCountry) setSelectedCountry(active[0].code);
      }
    } catch (e) { console.error('Failed to fetch countries:', e); }
    finally { setCountriesLoading(false); }
  }, []);

  const fetchLaws = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCountry) params.append('country_code', selectedCountry);
      if (filterCategory) params.append('category', filterCategory);
      const res = await fetch(`${API}/laws?${params}`, { headers: { Authorization: `Bearer ${getToken()}` } });
      if (res.ok) setLaws(await res.json());
    } catch (e) { console.error('Error fetching laws:', e); }
    finally { setLoading(false); }
  }, [selectedCountry, filterCategory]);

  const fetchCatalog = useCallback(async () => {
    setCatalogLoading(true);
    try {
      const params = new URLSearchParams({ country_code: selectedCountry });
      if (catalogSearch) params.append('search', catalogSearch);
      const res = await fetch(`${API}/law-catalog?${params}`, { headers: { Authorization: `Bearer ${getToken()}` } });
      if (res.ok) setCatalog(await res.json());
    } catch (e) { console.error('Failed to fetch catalog:', e); }
    finally { setCatalogLoading(false); }
  }, [selectedCountry, catalogSearch]);

  useEffect(() => { fetchCountries(); }, [fetchCountries]);
  useEffect(() => { if (selectedCountry) { setLoading(true); fetchLaws(); } }, [selectedCountry, filterCategory, fetchLaws]);
  useEffect(() => { if (showCatalog && selectedCountry) fetchCatalog(); }, [showCatalog, selectedCountry, catalogSearch, fetchCatalog]);

  // Poll catalog for ingesting items
  useEffect(() => {
    if (!showCatalog) return;
    const hasIngesting = catalog.some(c => c.status === 'ingesting');
    if (!hasIngesting) return;
    const interval = setInterval(() => { fetchCatalog(); fetchLaws(); }, 4000);
    return () => clearInterval(interval);
  }, [catalog, showCatalog, fetchCatalog, fetchLaws]);

  const handleIngest = async (itemId: string) => {
    setIngestingIds(prev => new Set(prev).add(itemId));
    try {
      const res = await fetch(`${API}/law-catalog/${itemId}/ingest`, {
        method: 'POST', headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) { fetchCatalog(); }
      else { const err = await res.json(); alert(err.detail || 'Failed to start ingestion'); }
    } catch { alert('Network error'); }
    finally { setIngestingIds(prev => { const s = new Set(prev); s.delete(itemId); return s; }); }
  };

  const handleRemoveCatalog = async (itemId: string, title: string) => {
    if (!confirm(`Remove all ingested data for "${title}"?`)) return;
    try {
      const res = await fetch(`${API}/law-catalog/${itemId}/remove`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) { fetchCatalog(); fetchLaws(); }
      else { const err = await res.json(); alert(err.detail || 'Failed to remove'); }
    } catch { alert('Network error'); }
  };

  const handleDeleteLaw = async (id: string) => {
    if (!confirm('Delete this law?')) return;
    try {
      const res = await fetch(`${API}/laws/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` } });
      if (res.ok) fetchLaws();
      else alert('Failed to delete');
    } catch { alert('Network error'); }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { icon: typeof Clock; cls: string; label: string }> = {
      pending: { icon: Clock, cls: 'badge-warning', label: 'Pending' },
      processing: { icon: RefreshCw, cls: 'badge-info', label: 'Processing' },
      completed: { icon: CheckCircle, cls: 'badge-success', label: 'Completed' },
      failed: { icon: AlertCircle, cls: 'badge-danger', label: 'Failed' },
    };
    const b = map[status] || map.pending;
    const Icon = b.icon;
    return <span className={`status-badge ${b.cls}`}><Icon size={14} /> {b.label}</span>;
  };

  const filteredLaws = laws.filter(law =>
    law.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    law.law_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lawsEmbedded = laws.filter(l => l.embedding_status === 'completed').length;
  const lawsPending = laws.filter(l => l.embedding_status === 'pending' || l.embedding_status === 'processing').length;
  const totalChunks = laws.reduce((sum, l) => sum + l.chunk_count, 0);
  const selectedCountryName = countries.find(c => c.code === selectedCountry)?.name || selectedCountry;

  const getCatalogStatusBtn = (item: CatalogItem) => {
    if (item.status === 'ingesting' || ingestingIds.has(item.id)) {
      return <button className="catalog-btn ingesting" disabled><Loader2 size={14} className="spin" /> Ingesting...</button>;
    }
    if (item.status === 'ingested') {
      return (
        <div className="catalog-btn-group">
          <span className="catalog-btn ingested"><CheckCircle size={14} /> Added</span>
          <button className="catalog-btn remove" onClick={() => handleRemoveCatalog(item.id, item.title)}>
            <Trash2 size={14} /> Remove
          </button>
        </div>
      );
    }
    if (item.status === 'failed') {
      return <button className="catalog-btn failed" onClick={() => handleIngest(item.id)}><AlertCircle size={14} /> Retry</button>;
    }
    return <button className="catalog-btn add" onClick={() => handleIngest(item.id)}><Plus size={14} /> Add to KB</button>;
  };

  const filteredCatalog = catalog.filter(c =>
    c.title.toLowerCase().includes(catalogSearch.toLowerCase()) ||
    c.category.toLowerCase().includes(catalogSearch.toLowerCase())
  );

  return (
    <div className="laws-page">
      {/* Header */}
      <div className="laws-header">
        <div>
          <h1>Laws &amp; Statutes</h1>
          <p>Manage legal documents and statutes for the knowledge base</p>
        </div>
        <div className="header-actions">
          <button className="btn-catalog" onClick={() => setShowCatalog(true)}>
            <BookOpen size={18} /> Browse Catalog
          </button>
          <button className="btn-primary" onClick={() => setShowUploadModal(true)}>
            <Upload size={18} /> Upload Law
          </button>
        </div>
      </div>

      {/* Jurisdiction Selector */}
      <div className="jurisdiction-bar">
        <div className="jurisdiction-label">
          <Globe size={16} />
          <span>Jurisdiction</span>
        </div>
        {countriesLoading ? (
          <span className="jurisdiction-loading">Loading countries...</span>
        ) : countries.length > 0 ? (
          <div className="jurisdiction-pills">
            {countries.map(c => (
              <button
                key={c.code}
                className={`jurisdiction-pill ${selectedCountry === c.code ? 'active' : ''}`}
                onClick={() => setSelectedCountry(c.code)}
              >
                {c.name}
              </button>
            ))}
          </div>
        ) : (
          <div className="jurisdiction-empty">
            <AlertCircle size={16} />
            <span>No countries configured.</span>
            <Link href="/admin/setup/countries" className="jurisdiction-link">
              Add Countries <ExternalLink size={14} />
            </Link>
          </div>
        )}
      </div>

      {/* Stats Row */}
      {selectedCountry && (
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-card-icon blue"><FileText size={22} /></div>
            <div><span className="stat-card-num">{laws.length}</span><span className="stat-card-label">Total Laws</span></div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon green"><CheckCircle size={22} /></div>
            <div><span className="stat-card-num">{lawsEmbedded}</span><span className="stat-card-label">Embedded</span></div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon amber"><Clock size={22} /></div>
            <div><span className="stat-card-num">{lawsPending}</span><span className="stat-card-label">Pending</span></div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon purple"><Layers size={22} /></div>
            <div><span className="stat-card-num">{totalChunks}</span><span className="stat-card-label">Chunks</span></div>
          </div>
        </div>
      )}

      {/* Search & Filter */}
      {selectedCountry && (
        <div className="toolbar">
          <div className="toolbar-search">
            <Search size={16} />
            <input
              type="text"
              placeholder={`Search laws in ${selectedCountryName}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="toolbar-select">
            <option value="">All Categories</option>
            <option value="Procedural Rules">Procedural Rules</option>
            <option value="Contract Law">Contract Law</option>
            <option value="Civil Rights">Civil Rights</option>
            <option value="Employment / Civil Rights">Employment</option>
            <option value="Constitutional Law">Constitutional</option>
            <option value="Tort Law">Tort Law</option>
            <option value="Jurisdiction">Jurisdiction</option>
          </select>
        </div>
      )}

      {/* Table */}
      {selectedCountry && (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Chunks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="table-empty">Loading...</td></tr>
              ) : filteredLaws.length === 0 ? (
                <tr><td colSpan={5} className="table-empty">
                  No laws found for {selectedCountryName}. Browse the catalog or upload to get started.
                </td></tr>
              ) : (
                filteredLaws.map((law) => (
                  <tr key={law.id}>
                    <td><span className="cell-title">{law.title}</span></td>
                    <td><span className="category-badge">{law.category}</span></td>
                    <td>{getStatusBadge(law.embedding_status)}</td>
                    <td>{law.chunk_count}</td>
                    <td>
                      <div className="cell-actions">
                        <a href={law.file_url} target="_blank" rel="noopener noreferrer" className="action-btn view" title="View source">
                          <FileText size={15} />
                        </a>
                        <button className="action-btn delete" onClick={() => handleDeleteLaw(law.id)} title="Delete">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Catalog Modal */}
      {showCatalog && (
        <div className="catalog-overlay" onClick={() => setShowCatalog(false)}>
          <div className="catalog-modal" onClick={(e) => e.stopPropagation()}>
            <div className="catalog-modal-header">
              <div>
                <h2>Law Catalog</h2>
                <p>Browse and add legal documents to your knowledge base</p>
              </div>
              <button className="catalog-close" onClick={() => setShowCatalog(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="catalog-search">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search catalog..."
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
              />
            </div>

            <div className="catalog-grid">
              {catalogLoading ? (
                <div className="catalog-empty"><Loader2 size={24} className="spin" /> Loading catalog...</div>
              ) : filteredCatalog.length === 0 ? (
                <div className="catalog-empty">No catalog items found for {selectedCountryName}.</div>
              ) : (
                filteredCatalog.map((item) => (
                  <div key={item.id} className={`catalog-card ${item.status}`}>
                    <div className="catalog-card-top">
                      <span className="catalog-category">{item.category}</span>
                      {item.status === 'ingested' && <span className="catalog-chunks">{item.chunk_count} chunks</span>}
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                    <div className="catalog-card-footer">
                      {getCatalogStatusBtn(item)}
                      <a href={item.source_url} target="_blank" rel="noopener noreferrer" className="catalog-source-link">
                        <ExternalLink size={13} /> Source
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <UploadLawModal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} onSuccess={fetchLaws} />
    </div>
  );
}
