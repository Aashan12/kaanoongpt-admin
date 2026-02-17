'use client';

import { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import '../settings.css';

export default function SecurityPage() {
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false });
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.new_password !== formData.confirm_password) {
      alert('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('http://localhost:8000/api/admin/settings/security', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        alert('Password changed successfully!');
        setFormData({ current_password: '', new_password: '', confirm_password: '' });
      } else {
        const error = await res.json();
        alert(error.detail || 'Failed to change password');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPwd({ ...showPwd, [field]: !showPwd[field] });
  };

  return (
    <div className="settings-container">
      <header className="settings-header">
        <h1>Settings</h1>
        <p>Change your password</p>
      </header>

      <div className="settings-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Current Password</label>
            <div className="password-wrapper">
              <input
                type={showPwd.current ? "text" : "password"}
                className="form-input"
                placeholder="Enter your current password"
                value={formData.current_password}
                onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
                required
              />
              <button type="button" className="eye-btn" onClick={() => toggleVisibility('current')}>
                {showPwd.current ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>New Password</label>
            <div className="password-wrapper">
              <input
                type={showPwd.new ? "text" : "password"}
                className="form-input"
                placeholder="Enter your new password"
                value={formData.new_password}
                onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                required
              />
              <button type="button" className="eye-btn" onClick={() => toggleVisibility('new')}>
                {showPwd.new ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <div className="password-wrapper">
              <input
                type={showPwd.confirm ? "text" : "password"}
                className="form-input"
                placeholder="Confirm New Password"
                value={formData.confirm_password}
                onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                required
              />
              <button type="button" className="eye-btn" onClick={() => toggleVisibility('confirm')}>
                {showPwd.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-update" disabled={loading}>
            {loading ? 'Processing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
