'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Upload, Search, Gavel, Trash2, AlertCircle, CheckCircle, Clock, FileText,
  Globe, RefreshCw, Layers, ExternalLink, X, Loader2, Plus
} from 'lucide-react';
import Link from 'next/link';
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

interface Country { _id: string; name: string; code: string; is_active: boolean; }

interface SearchResult {
  cl_id: string;
  case_name: string;
  citation: string;
  court: string;
  date_filed: string;
  snippet: string;
  absolute_url: string;
  docket_number: string;
  already_ingested: boolean;
  download_url?: string;
  judge?: string;
  court_citation_string?: string;
  cite_count?: number;
}

const API = 'http://localhost:8000/api/admin/knowledge-base';
const SETUP_API = 'http://localhost:8000/api/admin/system-setup';

export default function CasesManagementPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPrecedent, setFilterPrecedent] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Country
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [countriesLoading, setCountriesLoading] = useState(true);

  // Search modal
  const [showSearch, setShowSearch] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchCount, setSearchCount] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [ingesting, setIngesting] = useState(false);
  const [searchPage, setSearchPage] = useState(1);
  const [searchNext, setSearchNext] = useState<string | null>(null);
  const [searchPrev, setSearchPrev] = useState<string | null>(null);
  const [dateAfter, setDateAfter] = useState('');
  const [dateBefore, setDateBefore] = useState('');
  const [courtFilter, setCourtFilter] = useState('');
  const [sortBy, setSortBy] = useState('score desc');

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

  const fetchCases = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCountry) params.append('country_code', selectedCountry);
      if (filterPrecedent) params.append('precedent_level', filterPrecedent);
      const response = await fetch(`${API}/cases?${params}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (response.ok) setCases(await response.json());
    } catch (error) { console.error('Error fetching cases:', error); }
    finally { setLoading(false); }
  }, [selectedCountry, filterPrecedent]);

  useEffect(() => { fetchCountries(); }, [fetchCountries]);
  useEffect(() => { if (selectedCountry) { setLoading(true); fetchCases(); } }, [selectedCountry, filterPrecedent, fetchCases]);

  const handleDeleteCase = async (id: string) => {
    if (!confirm('Are you sure you want to delete this case?')) return;
    try {
      const res = await fetch(`${API}/cases/${id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) fetchCases();
      else alert('Failed to delete case');
    } catch { alert('Network error'); }
  };

  const handleRetryPending = async () => {
    setRetrying(true);
    try {
      const res = await fetch(`${API}/cases/retry-pending`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        const data = await res.json();
        alert(data.message);
        setTimeout(() => fetchCases(), 3000);
      } else {
        const err = await res.json();
        alert(err.detail || 'Retry failed');
      }
    } catch { alert('Network error'); }
    finally { setRetrying(false); }
  };

  // ---- Search & Ingest ----
  const handleSearch = async (page = 1) => {
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    setSearchResults([]);
    setSearchPage(page);
    try {
      const params = new URLSearchParams({ q: searchQuery, page: String(page) });
      if (dateAfter) params.append('date_after', dateAfter);
      if (dateBefore) params.append('date_before', dateBefore);
      if (courtFilter) params.append('court', courtFilter);
      if (sortBy && sortBy !== 'score desc') params.append('order_by', sortBy);
      const res = await fetch(`${API}/cases/search-external?${params}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.results || []);
        setSearchCount(data.count || 0);
        setSearchNext(data.next);
        setSearchPrev(data.previous);
      } else {
        const err = await res.json();
        alert(err.detail || 'Search failed');
      }
    } catch { alert('Network error'); }
    finally { setSearchLoading(false); }
  };

  const toggleSelect = (clId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(clId)) next.delete(clId); else next.add(clId);
      return next;
    });
  };

  const handleIngestSelected = async () => {
    const items = searchResults
      .filter(r => selectedIds.has(r.cl_id) && !r.already_ingested)
      .map(r => ({
        cl_id: r.cl_id,
        case_name: r.case_name,
        citation: r.citation,
        court: r.court,
        date_filed: r.date_filed,
        docket_number: r.docket_number,
        snippet: r.snippet,
        absolute_url: r.absolute_url,
        download_url: r.download_url || '',
        judge: r.judge || '',
      }));
    if (!items.length) return;

    setIngesting(true);
    try {
      const res = await fetch(`${API}/cases/ingest-from-search`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      if (res.ok) {
        const data = await res.json();
        alert(data.message);
        setSelectedIds(new Set());
        // Re-search to update already_ingested flags
        handleSearch();
        fetchCases();
      } else {
        const err = await res.json();
        alert(err.detail || 'Ingestion failed');
      }
    } catch { alert('Network error'); }
    finally { setIngesting(false); }
  };

  const getPrecedentBadge = (level: number) => {
    const map: Record<number, { label: string; cls: string }> = {
      1: { label: 'Trial', cls: 'prec-trial' },
      2: { label: 'Appeals', cls: 'prec-appeals' },
      3: { label: 'High Court', cls: 'prec-high' },
      4: { label: 'Supreme', cls: 'prec-supreme' },
    };
    const b = map[level] || map[1];
    return <span className={`precedent-badge ${b.cls}`}>{b.label}</span>;
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { icon: typeof Clock; cls: string; label: string }> = {
      pending: { icon: Clock, cls: 'badge-warning', label: 'Pending' },
      processing: { icon: RefreshCw, cls: 'badge-info', label: 'Processing' },
      completed: { icon: CheckCircle, cls: 'badge-success', label: 'Completed' },
      failed: { icon: AlertCircle, cls: 'badge-danger', label: 'Failed' },
      queued: { icon: Clock, cls: 'badge-warning', label: 'Queued' },
      running: { icon: RefreshCw, cls: 'badge-info', label: 'Running' },
    };
    const b = map[status] || map.pending;
    const Icon = b.icon;
    return <span className={`status-badge ${b.cls}`}><Icon size={14} /> {b.label}</span>;
  };

  const filteredCases = cases.filter(c =>
    c.case_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.citation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const casesEmbedded = cases.filter(c => c.embedding_status === 'completed').length;
  const casesPending = cases.filter(c => c.embedding_status === 'pending' || c.embedding_status === 'failed').length;
  const totalChunks = cases.reduce((sum, c) => sum + c.chunk_count, 0);
  const selectedCountryName = countries.find(c => c.code === selectedCountry)?.name || selectedCountry;
  const selectableCount = searchResults.filter(r => selectedIds.has(r.cl_id) && !r.already_ingested).length;

  return (
    <div className="cases-page">
      {/* Page Header */}
      <div className="cases-header">
        <div>
          <h1>Legal Cases &amp; Precedents</h1>
          <p>Manage judicial rulings and case law for the knowledge base</p>
        </div>
        <div className="header-actions">
          {(casesPending > 0 || cases.some(c => c.embedding_status === 'failed')) && (
            <button className="btn-retry" onClick={handleRetryPending} disabled={retrying}>
              {retrying ? <Loader2 size={18} className="spin" /> : <RefreshCw size={18} />}
              {retrying ? 'Retrying...' : 'Retry Pending'}
            </button>
          )}
          <button className="btn-search-cases" onClick={() => setShowSearch(true)}>
            <Search size={18} /> Search &amp; Add Cases
          </button>
          <button className="btn-primary" onClick={() => setShowUploadModal(true)}>
            <Upload size={18} /> Upload Case
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
            <div className="stat-card-icon purple"><Gavel size={22} /></div>
            <div><span className="stat-card-num">{cases.length}</span><span className="stat-card-label">Total Cases</span></div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon green"><CheckCircle size={22} /></div>
            <div><span className="stat-card-num">{casesEmbedded}</span><span className="stat-card-label">Embedded</span></div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon amber"><Clock size={22} /></div>
            <div><span className="stat-card-num">{casesPending}</span><span className="stat-card-label">Pending</span></div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon blue"><Layers size={22} /></div>
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
              placeholder={`Search cases in ${selectedCountryName}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select value={filterPrecedent} onChange={(e) => setFilterPrecedent(e.target.value)} className="toolbar-select">
            <option value="">All Precedents</option>
            <option value="4">Supreme Court</option>
            <option value="3">High Court</option>
            <option value="2">Appeals Court</option>
            <option value="1">Trial Court</option>
          </select>
        </div>
      )}

      {/* Table */}
      {selectedCountry && (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Case Title</th>
                <th>Citation</th>
                <th>Court</th>
                <th>Precedent</th>
                <th>Status</th>
                <th>Chunks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="table-empty">Loading...</td></tr>
              ) : filteredCases.length === 0 ? (
                <tr><td colSpan={7} className="table-empty">
                  No cases found for {selectedCountryName}. Search CourtListener or upload to get started.
                </td></tr>
              ) : (
                filteredCases.map((c) => (
                  <tr key={c.id}>
                    <td><span className="cell-title">{c.case_title}</span></td>
                    <td><span className="citation-text">{c.citation}</span></td>
                    <td>{c.court_name}</td>
                    <td>{getPrecedentBadge(c.precedent_level)}</td>
                    <td>{getStatusBadge(c.embedding_status)}</td>
                    <td>{c.chunk_count}</td>
                    <td>
                      <div className="cell-actions">
                        <a href={c.file_url} target="_blank" rel="noopener noreferrer" className="action-btn view" title="View document">
                          <FileText size={15} />
                        </a>
                        <button className="action-btn delete" onClick={() => handleDeleteCase(c.id)} title="Delete">
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

      {/* Search Modal — Google Scholar style */}
      {showSearch && (
        <div className="search-overlay" onClick={() => setShowSearch(false)}>
          <div className="search-modal scholar" onClick={(e) => e.stopPropagation()}>
            <div className="search-modal-header">
              <div>
                <h2>Search CourtListener</h2>
                <p>Find and add real case law to your knowledge base</p>
              </div>
              <button className="search-close" onClick={() => setShowSearch(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="search-bar-row">
              <div className="search-input-wrap">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="e.g. breach of contract, employment discrimination..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(1)}
                />
              </div>
              <button className="btn-do-search" onClick={() => handleSearch(1)} disabled={searchLoading}>
                {searchLoading ? <Loader2 size={16} className="spin" /> : <Search size={16} />}
                Search
              </button>
            </div>

            <div className="search-body">
              {/* Left Sidebar — Filters */}
              <aside className="search-sidebar">
                <div className="filter-section">
                  <h4>Date Range</h4>
                  <div className="filter-presets">
                    {[
                      { label: 'Any time', after: '', before: '' },
                      { label: 'Since 2020', after: '2020-01-01', before: '' },
                      { label: 'Since 2015', after: '2015-01-01', before: '' },
                      { label: 'Since 2010', after: '2010-01-01', before: '' },
                      { label: 'Since 2000', after: '2000-01-01', before: '' },
                    ].map((p) => (
                      <button
                        key={p.label}
                        className={`filter-preset-btn ${dateAfter === p.after && dateBefore === p.before ? 'active' : ''}`}
                        onClick={() => { setDateAfter(p.after); setDateBefore(p.before); }}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                  <div className="filter-custom-dates">
                    <label>From</label>
                    <input type="date" value={dateAfter} onChange={(e) => setDateAfter(e.target.value)} />
                    <label>To</label>
                    <input type="date" value={dateBefore} onChange={(e) => setDateBefore(e.target.value)} />
                  </div>
                </div>

                <div className="filter-section">
                  <h4>Court</h4>
                  <select value={courtFilter} onChange={(e) => setCourtFilter(e.target.value)} className="filter-select">
                    <option value="">All Courts</option>
                    <option value="scotus">Supreme Court (SCOTUS)</option>
                    <option value="ca1,ca2,ca3,ca4,ca5,ca6,ca7,ca8,ca9,ca10,ca11,cadc,cafc">All Circuit Courts</option>
                    <option value="ca1">1st Circuit</option>
                    <option value="ca2">2nd Circuit</option>
                    <option value="ca3">3rd Circuit</option>
                    <option value="ca4">4th Circuit</option>
                    <option value="ca5">5th Circuit</option>
                    <option value="ca6">6th Circuit</option>
                    <option value="ca7">7th Circuit</option>
                    <option value="ca8">8th Circuit</option>
                    <option value="ca9">9th Circuit</option>
                    <option value="ca10">10th Circuit</option>
                    <option value="ca11">11th Circuit</option>
                    <option value="cadc">D.C. Circuit</option>
                  </select>
                </div>

                <div className="filter-section">
                  <h4>Sort By</h4>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="filter-select">
                    <option value="score desc">Relevance</option>
                    <option value="dateFiled desc">Newest First</option>
                    <option value="dateFiled asc">Oldest First</option>
                    <option value="citeCount desc">Most Cited</option>
                  </select>
                </div>

                {(dateAfter || dateBefore || courtFilter || sortBy !== 'score desc') && (
                  <button
                    className="filter-apply-btn"
                    onClick={() => handleSearch(1)}
                    disabled={searchLoading || !searchQuery.trim()}
                  >
                    Apply Filters
                  </button>
                )}
              </aside>

              {/* Right — Results */}
              <div className="search-results-area">
                {searchLoading ? (
                  <div className="search-empty"><Loader2 size={24} className="spin" /> Searching CourtListener...</div>
                ) : searchResults.length === 0 ? (
                  <div className="search-empty">
                    {searchQuery ? 'No results found. Try different keywords or adjust filters.' : 'Enter a search query to find cases.'}
                  </div>
                ) : (
                  <>
                    <div className="search-results-header">
                      <span>About {searchCount.toLocaleString()} results &middot; Page {searchPage}</span>
                      {selectableCount > 0 && (
                        <button className="btn-ingest-selected" onClick={handleIngestSelected} disabled={ingesting}>
                          {ingesting ? <><Loader2 size={14} className="spin" /> Ingesting...</> : <><Plus size={14} /> Ingest Selected ({selectableCount})</>}
                        </button>
                      )}
                    </div>
                    <div className="search-results-list">
                      {searchResults.map((r) => (
                        <label
                          key={r.cl_id}
                          className={`search-result-card ${r.already_ingested ? 'ingested' : ''} ${selectedIds.has(r.cl_id) ? 'selected' : ''}`}
                        >
                          <div className="sr-top">
                            {!r.already_ingested ? (
                              <input
                                type="checkbox"
                                checked={selectedIds.has(r.cl_id)}
                                onChange={() => toggleSelect(r.cl_id)}
                              />
                            ) : (
                              <span className="sr-checkbox-placeholder" />
                            )}
                            <div className="sr-info">
                              <span className="sr-name">{r.case_name}</span>
                              <span className="sr-meta">
                                {r.court && <span>{r.court}</span>}
                                {r.date_filed && <span>{r.date_filed}</span>}
                                {r.citation && <span>{r.citation}</span>}
                              </span>
                            </div>
                            {r.already_ingested ? (
                              <span className="sr-badge ingested"><CheckCircle size={13} /> In KB</span>
                            ) : (
                              <a
                                href={`https://www.courtlistener.com${r.absolute_url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="sr-link"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink size={13} />
                              </a>
                            )}
                          </div>
                          {r.snippet && <p className="sr-snippet">{r.snippet}</p>}
                        </label>
                      ))}
                    </div>

                    {/* Pagination */}
                    <div className="search-pagination">
                      <button
                        className="pagination-btn"
                        disabled={searchPage <= 1 || searchLoading}
                        onClick={() => handleSearch(searchPage - 1)}
                      >
                        ← Previous
                      </button>
                      <span className="pagination-info">Page {searchPage}</span>
                      <button
                        className="pagination-btn"
                        disabled={!searchNext || searchLoading}
                        onClick={() => handleSearch(searchPage + 1)}
                      >
                        Next →
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <UploadCaseModal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} onSuccess={fetchCases} />
    </div>
  );
}
