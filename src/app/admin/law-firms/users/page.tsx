'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Users, Search, UserPlus, Mail, Shield,
  Building2, Trash2, Edit2, Filter, RefreshCw
} from 'lucide-react';
import './users.css';

interface LawFirm {
  _id: string;
  firm_name: string;
  firm_code: string;
}

interface LawFirmUser {
  _id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'user';
  is_active: boolean;
  firm_id: {
    _id: string;
    firm_name: string;
  } | string;
  created_at: string;
}

export default function LawFirmUsersPage() {
  const [users, setUsers] = useState<LawFirmUser[]>([]);
  const [firms, setFirms] = useState<LawFirm[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [firmFilter, setFirmFilter] = useState('all');

  // Modal states
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteData, setInviteData] = useState({
    full_name: '',
    email: '',
    firm_id: '',
    role: 'user'
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, firmsRes] = await Promise.all([
        fetch('http://localhost:8000/api/admin/law-firms/users/all'), // Custom endpoint for all users
        fetch('http://localhost:8000/api/admin/law-firms/accounts/')
      ]);

      // Note: I'll need to add an 'all' endpoint if it doesn't exist, 
      // or fetch per firm. For now, let's assume we fetch all if allowed.
      // If not, I'll update the fetch logic to depend on the firm filter.

      const firmsData = await firmsRes.json();
      setFirms(firmsData);

      if (firmFilter === 'all') {
        // If 'all' is not supported, we might just fetch the first firm's users or empty
        setUsers([]);
      } else {
        const usersResFiltered = await fetch(`http://localhost:8000/api/admin/law-firms/users/${firmFilter}`);
        const usersData = await usersResFiltered.json();
        setUsers(usersData);
      }
    } catch (err) {
      console.error('Fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, [firmFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteData.firm_id) {
      alert('Please select a firm');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/admin/law-firms/users/${inviteData.firm_id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: inviteData.full_name,
          email: inviteData.email,
          role: inviteData.role
        })
      });

      if (response.ok) {
        alert('User added to firm successfully!');
        setIsInviteModalOpen(false);
        setInviteData({ full_name: '', email: '', firm_id: '', role: 'user' });
        fetchData();
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to add user');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u =>
      u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  return (
    <div className="users-container">
      <header className="users-header">
        <div className="users-title-section">
          <h1>Firm Users</h1>
          <p>Manage professionals and staff associated with registered law firms</p>
        </div>
        <button className="btn-primary" onClick={() => setIsInviteModalOpen(true)}>
          <UserPlus size={18} />
          Add Firm User
        </button>
      </header>

      <div className="users-stats-grid">
        <div className="users-stat-card">
          <span className="users-stat-label">Total Professionals</span>
          <span className="users-stat-value">{users.length}</span>
        </div>
        <div className="users-stat-card">
          <span className="users-stat-label">Active Roles</span>
          <span className="users-stat-value text-blue-600">
            {users.filter(u => u.role === 'admin').length} Admins
          </span>
        </div>
      </div>

      <div className="users-controls">
        <div className="search-box">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="users-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <select
            className="filter-select"
            value={firmFilter}
            onChange={(e) => setFirmFilter(e.target.value)}
          >
            <option value="all">Select Law Firm</option>
            {firms.map(f => (
              <option key={f._id} value={f._id}>{f.firm_name}</option>
            ))}
          </select>
          <button className="p-2 bg-slate-100 rounded-lg text-slate-600" onClick={fetchData}>
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="users-table-card">
        <table className="users-table">
          <thead>
            <tr>
              <th>Professional</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-12 text-slate-400">Loading firm users...</td></tr>
            ) : firmFilter === 'all' ? (
              <tr><td colSpan={5} className="text-center py-12 text-slate-400 italic">Please select a law firm to view its users.</td></tr>
            ) : filteredUsers.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-slate-400">No users found for this firm.</td></tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">{user.full_name}</span>
                      <span className="text-xs text-slate-500">{user.email}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`user-role-badge role-${user.role}`}>
                      <Shield size={10} className="inline mr-1" />
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                      <span className="text-sm font-medium text-slate-600">{user.is_active ? 'Active' : 'Inactive'}</span>
                    </div>
                  </td>
                  <td>
                    <span className="text-sm text-slate-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-rose-600 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {isInviteModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="flex items-center gap-2">
                <UserPlus size={20} className="text-blue-600" />
                Add Professional to Firm
              </h2>
            </div>
            <form onSubmit={handleInvite}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Law Firm</label>
                  <select
                    className="filter-select w-full"
                    value={inviteData.firm_id}
                    onChange={(e) => setInviteData({ ...inviteData, firm_id: e.target.value })}
                    required
                  >
                    <option value="">Choose a firm...</option>
                    {firms.map(f => (
                      <option key={f._id} value={f._id}>{f.firm_name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    className="users-search-input"
                    placeholder="Enter full name"
                    value={inviteData.full_name}
                    onChange={(e) => setInviteData({ ...inviteData, full_name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    className="users-search-input"
                    placeholder="professional@firm.com"
                    value={inviteData.email}
                    onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Initial Role</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="role"
                        value="user"
                        checked={inviteData.role === 'user'}
                        onChange={() => setInviteData({ ...inviteData, role: 'user' })}
                      />
                      <span className="text-sm font-medium">Associate / User</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="role"
                        value="admin"
                        checked={inviteData.role === 'admin'}
                        onChange={() => setInviteData({ ...inviteData, role: 'admin' })}
                      />
                      <span className="text-sm font-medium">Firm Administrator</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="px-4 py-2 text-slate-600 font-semibold"
                  onClick={() => setIsInviteModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                >
                  Add Professional
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
