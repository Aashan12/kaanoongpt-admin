'use client';

import { useState, useEffect } from 'react';
import { User, Camera, Calendar, UserCircle } from 'lucide-react';
import '../settings.css';

export default function ProfilePage() {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    gender: '',
    date_of_birth: '',
    profile_picture: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await fetch('http://localhost:8000/api/admin/settings/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          // Format date for input
          if (data.date_of_birth) {
            data.date_of_birth = new Date(data.date_of_birth).toISOString().split('T')[0];
          }
          setProfile(data);
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('http://localhost:8000/api/admin/settings/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: profile.full_name,
          gender: profile.gender,
          date_of_birth: profile.date_of_birth
        })
      });
      if (res.ok) {
        alert('Profile updated successfully!');
      } else {
        const error = await res.json();
        alert(error.detail || 'Update failed');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-container">
      <header className="settings-header">
        <h1>Profile</h1>
        <p>Update your account details</p>
      </header>

      <div className="settings-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="Your name"
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              required
            />
            <p className="form-helper">This is the name that will be displayed on your profile and in emails.</p>
          </div>

          <div className="form-group">
            <label>Profile Picture</label>
            <div className="file-input-wrapper">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 overflow-hidden">
                  {profile.profile_picture ? (
                    <img src={profile.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={32} className="text-slate-400" />
                  )}
                </div>
                <input type="file" className="form-input flex-1" accept="image/*" />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Gender</label>
            <select
              className="form-select"
              value={profile.gender || ''}
              onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
            >
              <option value="">Select a Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Date of birth</label>
            <div className="max-w-[200px]">
              <input
                type="date"
                className="form-input"
                value={profile.date_of_birth || ''}
                onChange={(e) => setProfile({ ...profile, date_of_birth: e.target.value })}
              />
            </div>
            <p className="form-helper">Your date of birth is used to calculate your age.</p>
          </div>

          <button type="submit" className="btn-update" disabled={loading}>
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
