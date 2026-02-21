'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Database, BookOpen, Gavel, CheckCircle, Clock, AlertCircle,
  RefreshCw, Layers, FileText
} from 'lucide-react';
import Link from 'next/link';
import './data-sources.css';

interface KBStats {
  laws: { total: number; embedded: number; pending: number; failed: number; chroma_chunks: number };
  cases: { total: number; embedded: number; pending: number; failed: number; chroma_chunks: number };
  active_jobs: number;
}

interface IngestionJob {
  id: string;
  type: 'cases' | 'statutes';
  status: 'queued' | 'running' | 'completed' | 'failed';
  courts?: string[];
  limit_per_court?: number;
  days_back?: number;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  stats?: Record<string, number>;
  error?: string;
}

const API = 'http://localhost:8000/api/admin/knowledge-base';

export default function DataSourcesPage() {
  const [stats, setStats] = useState<KBStats | null>(null);
  const [jobs, setJobs] = useState<IngestionJob[]>([]);
  const [loading, setLoading] = useState(true);

  const getToken = () => localStorage.getItem('adminToken');

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API}/stats`, { headers: { Authorization: `Bearer ${getToken()}` } });
      if (res.ok) setStats(await res.json());
    } catch (e) { console.error('Failed to fetch KB stats:', e); }
  }, []);

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch(`${API}/ingest/status`, { headers: { Authorization: `Bearer ${getToken()}` } });
      if (res.ok) { const data = await res.json(); setJobs(data.jobs || []); }
    } catch (e) { console.error('Failed to fetch jobs:', e); }
  }, []);

  useEffect(() => {
    Promise.all([fetchStats(), fetchJobs()]).finally(() => setLoading(false));
  }, [fetchStats, fetchJobs]);

  useEffect(() => {
    const hasActive = jobs.some(j => j.status === 'running' || j.status === 'queued');
    if (!hasActive) return;
    const interval = setInterval(() => { fetchJobs(); fetchStats(); }, 5000);
    return () => clearInterval(interval);
  }, [jobs, fetchJobs, fetchStats]);

  const getJobStatusBadge = (status: string) => {
    const map: Record<string, { icon: typeof Clock; color: string; bg: string; label: string }> = {
      queued: { icon: Clock, color: '#f59e0b', bg: '#fef3c7', label: 'Queued' },
      running: { icon: RefreshCw, color: '#3b82f6', bg: '#dbeafe', label: 'Running' },
      completed: { icon: CheckCircle, color: '#10b981', bg: '#d1fae5', label: 'Completed' },
      failed: { icon: AlertCircle, color: '#ef4444', bg: '#fee2e2', label: 'Failed' },
    };
    const b = map[status] || map.queued;
    const Icon = b.icon;
    return (
      <span className="ds-job-status" style={{ background: b.bg, color: b.color }}>
        <Icon size={14} /> {b.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="ds-container" style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', color: '#8b5cf6' }} />
      </div>
    );
  }

  return (
    <div className="ds-container">
      <div className="ds-header">
        <div className="ds-title-section">
          <h1>Knowledge Base Overview</h1>
          <p>Monitor ingestion jobs and knowledge base health</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="ds-quick-links">
        <Link href="/admin/knowledge-base/laws" className="ds-quick-link">
          <BookOpen size={20} />
          <span>Manage Laws</span>
        </Link>
        <Link href="/admin/knowledge-base/cases" className="ds-quick-link">
          <Gavel size={20} />
          <span>Manage Cases</span>
        </Link>
      </div>

      {/* KB Stats */}
      {stats && (
        <div className="ds-stats-grid">
          <div className="ds-stat-card">
            <div className="ds-stat-icon" style={{ background: '#ede9fe', color: '#8b5cf6' }}>
              <BookOpen size={22} />
            </div>
            <div className="ds-stat-info">
              <h3>Total Laws</h3>
              <p className="ds-stat-value">{stats.laws.total}</p>
            </div>
          </div>
          <div className="ds-stat-card">
            <div className="ds-stat-icon" style={{ background: '#dbeafe', color: '#3b82f6' }}>
              <Gavel size={22} />
            </div>
            <div className="ds-stat-info">
              <h3>Total Cases</h3>
              <p className="ds-stat-value">{stats.cases.total}</p>
            </div>
          </div>
          <div className="ds-stat-card">
            <div className="ds-stat-icon" style={{ background: '#d1fae5', color: '#059669' }}>
              <CheckCircle size={22} />
            </div>
            <div className="ds-stat-info">
              <h3>Laws Embedded</h3>
              <p className="ds-stat-value">{stats.laws.embedded}</p>
            </div>
          </div>
          <div className="ds-stat-card">
            <div className="ds-stat-icon" style={{ background: '#d1fae5', color: '#059669' }}>
              <CheckCircle size={22} />
            </div>
            <div className="ds-stat-info">
              <h3>Cases Embedded</h3>
              <p className="ds-stat-value">{stats.cases.embedded}</p>
            </div>
          </div>
          <div className="ds-stat-card">
            <div className="ds-stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
              <Layers size={22} />
            </div>
            <div className="ds-stat-info">
              <h3>Law Chunks</h3>
              <p className="ds-stat-value">{stats.laws.chroma_chunks}</p>
            </div>
          </div>
          <div className="ds-stat-card">
            <div className="ds-stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
              <Layers size={22} />
            </div>
            <div className="ds-stat-info">
              <h3>Case Chunks</h3>
              <p className="ds-stat-value">{stats.cases.chroma_chunks}</p>
            </div>
          </div>
        </div>
      )}

      {/* All Ingestion Jobs */}
      <div className="ds-jobs-section">
        <div className="ds-jobs-header">
          <h2>All Ingestion Jobs</h2>
          <button onClick={() => fetchJobs()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }} aria-label="Refresh jobs">
            <RefreshCw size={18} />
          </button>
        </div>
        <div className="ds-jobs-list">
          {jobs.length === 0 ? (
            <div className="ds-empty-jobs">
              <Database size={32} style={{ marginBottom: '0.5rem', opacity: 0.4 }} />
              <p>No ingestion jobs yet. Start ingestion from the Laws or Cases pages.</p>
            </div>
          ) : (
            [...jobs].reverse().map(job => (
              <div key={job.id} className="ds-job-card">
                <div className="ds-job-info">
                  <div className="ds-job-type-icon" style={{ background: job.type === 'cases' ? '#ede9fe' : '#dbeafe', color: job.type === 'cases' ? '#8b5cf6' : '#3b82f6' }}>
                    {job.type === 'cases' ? <Gavel size={20} /> : <FileText size={20} />}
                  </div>
                  <div className="ds-job-details">
                    <h4>{job.type === 'cases' ? 'Case Ingestion' : 'Statute Ingestion'}</h4>
                    <p>
                      {job.type === 'cases' && job.courts ? `${job.courts.length} courts · ${job.limit_per_court}/court · ${job.days_back}d` : 'Federal statutes & rules'}
                      {' · '}{new Date(job.created_at).toLocaleString()}
                    </p>
                    {job.error && <p style={{ color: '#ef4444', fontSize: '0.75rem' }}>{job.error}</p>}
                  </div>
                </div>
                {getJobStatusBadge(job.status)}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
