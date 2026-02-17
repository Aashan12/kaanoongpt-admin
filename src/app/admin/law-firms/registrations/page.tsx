'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Building2, Search, CheckCircle, XCircle, Eye,
  Clock, Shield, MapPin, RefreshCw, AlertCircle
} from 'lucide-react';
import './registrations.css';

interface Registration {
  _id: string;
  firm_name: string;
  firm_email: string;
  firm_phone: string;
  admin_full_name: string;
  admin_email: string;
  city: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  registration_number?: string;
}

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/admin/law-firms/registrations/');
      if (!response.ok) throw new Error('Failed to fetch registrations');
      const data = await response.json();
      setRegistrations(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  const handleApprove = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to approve "${name}"?`)) return;

    setProcessingId(id);
    try {
      const response = await fetch(`http://localhost:8000/api/admin/law-firms/registrations/${id}/approve`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Approval failed');

      alert('Registration approved successfully!');
      fetchRegistrations();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!selectedReg || !rejectionReason) return;

    setProcessingId(selectedReg._id);
    try {
      const response = await fetch(`http://localhost:8000/api/admin/law-firms/registrations/${selectedReg._id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectionReason })
      });
      if (!response.ok) throw new Error('Rejection failed');

      alert('Registration rejected.');
      setIsRejectModalOpen(false);
      setRejectionReason('');
      setSelectedReg(null);
      fetchRegistrations();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = registrations.filter(r =>
    r.firm_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.firm_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    pending: registrations.filter(r => r.status === 'pending').length,
    approved: registrations.filter(r => r.status === 'approved').length,
    rejected: registrations.filter(r => r.status === 'rejected').length,
  };

  return (
    <div className="reg-container">
      <header className="reg-header">
        <div className="reg-title-section">
          <h1>Law Firm Registrations</h1>
          <p>Review and process onboarding requests from professional legal entities</p>
        </div>
        <button className="btn-action btn-view" onClick={fetchRegistrations} disabled={loading}>
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </header>

      <div className="reg-stats-grid">
        <div className="reg-stats-card">
          <div className="stats-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <Clock size={24} />
          </div>
          <div className="stats-info">
            <h3>Pending Review</h3>
            <div className="stats-value">{stats.pending}</div>
          </div>
        </div>
        <div className="reg-stats-card">
          <div className="stats-icon-box" style={{ background: '#ecfdf5', color: '#059669' }}>
            <CheckCircle size={24} />
          </div>
          <div className="stats-info">
            <h3>Approved Firms</h3>
            <div className="stats-value">{stats.approved}</div>
          </div>
        </div>
        <div className="reg-stats-card">
          <div className="stats-icon-box" style={{ background: '#fef2f2', color: '#dc2626' }}>
            <XCircle size={24} />
          </div>
          <div className="stats-info">
            <h3>Rejected</h3>
            <div className="stats-value">{stats.rejected}</div>
          </div>
        </div>
      </div>

      <div className="reg-table-wrapper">
        <div className="reg-table-controls">
          <div className="search-container">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              placeholder="Search by firm name or email..."
              className="reg-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {loading && registrations.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <RefreshCw className="animate-spin mx-auto mb-4" size={32} />
            Loading registrations...
          </div>
        ) : error ? (
          <div className="p-12 text-center text-rose-500">
            <AlertCircle className="mx-auto mb-4" size={32} />
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No registrations found matching your search.
          </div>
        ) : (
          <table className="reg-table">
            <thead>
              <tr>
                <th>Law Firm</th>
                <th>Representative</th>
                <th>Location</th>
                <th>Applied On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((reg) => (
                <tr key={reg._id}>
                  <td>
                    <div className="firm-info-cell">
                      <span className="firm-name">{reg.firm_name}</span>
                      <span className="firm-email">{reg.firm_email}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-700">{reg.admin_full_name}</span>
                      <span className="text-xs text-slate-500">{reg.admin_email}</span>
                    </div>
                  </td>
                  <td>
                    <div className="location-badge">
                      <MapPin size={12} />
                      {reg.city}
                    </div>
                  </td>
                  <td>
                    <span className="text-sm text-slate-600">
                      {new Date(reg.created_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td>
                    <div className="reg-actions">
                      <button
                        className="btn-action btn-view"
                        onClick={() => { setSelectedReg(reg); setIsViewModalOpen(true); }}
                      >
                        <Eye size={16} /> View
                      </button>

                      {reg.status === 'pending' && (
                        <>
                          <button
                            className="btn-action btn-approve"
                            disabled={processingId === reg._id}
                            onClick={() => handleApprove(reg._id, reg.firm_name)}
                          >
                            <CheckCircle size={16} /> Approve
                          </button>
                          <button
                            className="btn-action btn-reject"
                            disabled={processingId === reg._id}
                            onClick={() => { setSelectedReg(reg); setIsRejectModalOpen(true); }}
                          >
                            <XCircle size={16} /> Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Reject Modal */}
      {isRejectModalOpen && selectedReg && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Reject Registration</h2>
            </div>
            <div className="modal-body">
              <p className="text-sm text-slate-600 mb-4">
                Please provide a reason for rejecting <strong>{selectedReg.firm_name}</strong>.
                This will be sent to the applicant via email.
              </p>
              <div className="form-group">
                <label>Rejection Reason</label>
                <textarea
                  className="form-textarea"
                  placeholder="e.g., Missing valid professional license documents..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="px-4 py-2 text-slate-600 font-semibold"
                onClick={() => { setIsRejectModalOpen(false); setRejectionReason(''); }}
              >
                Cancel
              </button>
              <button
                className="px-6 py-2 bg-rose-600 text-white rounded-lg font-bold shadow-lg shadow-rose-200"
                onClick={handleReject}
                disabled={!rejectionReason || processingId === selectedReg._id}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal (Simplistic) */}
      {isViewModalOpen && selectedReg && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>Registration Details</h2>
            </div>
            <div className="modal-body">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">Firm Name</label>
                  <p className="font-semibold text-slate-800">{selectedReg.firm_name}</p>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">Status</label>
                  <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded border ${selectedReg.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      selectedReg.status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                    {selectedReg.status}
                  </span>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">Firm Email</label>
                  <p className="text-slate-700">{selectedReg.firm_email}</p>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">Firm Phone</label>
                  <p className="text-slate-700">{selectedReg.firm_phone || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">Representative</label>
                  <p className="text-slate-700">{selectedReg.admin_full_name}</p>
                  <p className="text-xs text-slate-500">{selectedReg.admin_email}</p>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">Registration #</label>
                  <p className="text-slate-700">{selectedReg.registration_number || 'Not Provided'}</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="px-6 py-2 bg-slate-800 text-white rounded-lg font-bold"
                onClick={() => setIsViewModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
