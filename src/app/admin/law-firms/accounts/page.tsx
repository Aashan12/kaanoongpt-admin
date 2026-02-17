'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Users, Search, Edit2, ShieldAlert, Trash2,
  ExternalLink, CheckCircle2, MoreHorizontal, Filter
} from 'lucide-react';
import './accounts.css';

interface LawFirm {
  _id: string;
  firm_name: string;
  firm_code: string;
  email: string;
  phone?: string;
  status: 'active' | 'suspended' | 'deleted';
  city: string;
  created_at: string;
}

export default function AccountsPage() {
  const [firms, setFirms] = useState<LawFirm[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchFirms = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/admin/law-firms/accounts/');
      const data = await response.json();
      setFirms(data);
    } catch (err) {
      console.error('Fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFirms();
  }, [fetchFirms]);

  const handleStatusAction = async (id: string, action: 'suspend' | 'reactivate' | 'delete', reason?: string) => {
    const confirmMsg = action === 'delete'
      ? "Warning: This will soft-delete the firm account. Continue?"
      : `Are you sure you want to ${action} this account?`;

    if (!confirm(confirmMsg)) return;

    try {
      let url = `http://localhost:8000/api/admin/law-firms/accounts/${id}/${action}`;
      let method = 'POST';
      let body = action === 'suspend' ? JSON.stringify({ reason: reason || 'Administrative action' }) : null;

      if (action === 'delete') {
        url = `http://localhost:8000/api/admin/law-firms/accounts/${id}`;
        method = 'DELETE';
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body
      });

      if (response.ok) {
        alert(`Firm successfully ${action}d`);
        fetchFirms();
      }
    } catch (err) {
      alert('Action failed');
    }
  };

  const filtered = firms.filter(f => {
    const matchesSearch = f.firm_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.firm_code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="acc-container">
      <header className="acc-header">
        <div className="acc-title-section">
          <h1>Law Firm Accounts</h1>
          <p>Manage active professional profiles and country-specific access</p>
        </div>
      </header>

      <div className="acc-stats-row">
        <div className="acc-stat-mini">
          <span className="acc-stat-label">Total Firms</span>
          <span className="acc-stat-value">{firms.length}</span>
        </div>
        <div className="acc-stat-mini">
          <span className="acc-stat-label">Active</span>
          <span className="acc-stat-value text-emerald-600">
            {firms.filter(f => f.status === 'active').length}
          </span>
        </div>
        <div className="acc-stat-mini">
          <span className="acc-stat-label">Suspended</span>
          <span className="acc-stat-value text-amber-600">
            {firms.filter(f => f.status === 'suspended').length}
          </span>
        </div>
      </div>

      <div className="acc-card">
        <div className="acc-card-header">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search firm code or name..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium focus:outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="suspended">Suspended</option>
              <option value="deleted">Deleted</option>
            </select>
          </div>
        </div>

        <table className="acc-table">
          <thead>
            <tr>
              <th>Firm Identity</th>
              <th>Code</th>
              <th>Status</th>
              <th>City</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-12 text-slate-400">Loading accounts...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-slate-400">No firm accounts found.</td></tr>
            ) : (
              filtered.map((firm) => (
                <tr key={firm._id}>
                  <td>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">{firm.firm_name}</span>
                      <span className="text-xs text-slate-500">{firm.email}</span>
                    </div>
                  </td>
                  <td>
                    <code className="px-2 py-1 bg-slate-100 rounded text-xs font-mono text-slate-600">
                      {firm.firm_code}
                    </code>
                  </td>
                  <td>
                    <span className={`status-badge-premium status-${firm.status}`}>
                      <div className="w-1.5 h-1.5 rounded-full bg-current" />
                      {firm.status}
                    </span>
                  </td>
                  <td><span className="text-sm text-slate-600">{firm.city}</span></td>
                  <td><span className="text-sm text-slate-500">{new Date(firm.created_at).toLocaleDateString()}</span></td>
                  <td>
                    <div className="acc-actions">
                      <button className="btn-icon btn-icon-edit" title="Edit Firm">
                        <Edit2 size={14} />
                      </button>

                      {firm.status === 'active' ? (
                        <button
                          className="btn-icon btn-icon-suspend"
                          title="Suspend"
                          onClick={() => handleStatusAction(firm._id, 'suspend')}
                        >
                          <ShieldAlert size={14} />
                        </button>
                      ) : firm.status === 'suspended' ? (
                        <button
                          className="btn-icon btn-icon-suspend"
                          style={{ color: '#059669', background: '#ecfdf5' }}
                          title="Reactivate"
                          onClick={() => handleStatusAction(firm._id, 'reactivate')}
                        >
                          <CheckCircle2 size={14} />
                        </button>
                      ) : null}

                      <button
                        className="btn-icon btn-icon-delete"
                        title="Soft Delete"
                        onClick={() => handleStatusAction(firm._id, 'delete')}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
