import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useHabits } from '../context/HabitContext';
import * as api from '../api';

export default function EditProfile() {
  const navigate = useNavigate();
  const { profile, refreshProfile } = useHabits();
  
  const [name, setName] = useState(profile?.name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSave = async () => {
    try {
      setSubmitting(true);
      await api.updateProfile({ name });
      await refreshProfile();
      navigate('/profile');
    } catch (err) {
      alert("Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="flex-row gap-4" style={{ marginBottom: 24 }}>
        <ChevronLeft size={24} onClick={() => navigate(-1)} style={{ cursor: 'pointer' }} />
        <h2>Edit profile</h2>
      </div>

      <div className="flex-col" style={{ alignItems: 'center', marginBottom: 32 }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--accent-light)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 'bold' }}>
          {profile?.initials || 'U'}
        </div>
      </div>

      <p style={{ fontSize: 13, marginBottom: 8 }}>Full name</p>
      <input 
        type="text" 
        className="input-field" 
        value={name}
        onChange={e => setName(e.target.value)}
      />

      <p style={{ fontSize: 13, marginBottom: 8, marginTop: 16 }}>Email address</p>
      <input 
        type="email" 
        className="input-field" 
        value={email}
        disabled
        style={{ opacity: 0.6 }}
      />

      <p style={{ fontSize: 13, marginBottom: 8, marginTop: 16 }}>Member since</p>
      <input 
        type="text" 
        className="input-field" 
        value={profile?.memberSince || ''}
        disabled
        style={{ opacity: 0.6 }}
      />

      <div className="flex-col gap-2" style={{ marginTop: 40 }}>
        <button className="btn-primary" disabled={submitting} onClick={handleSave}>
          {submitting ? 'Saving...' : 'Save changes'}
        </button>
        <button className="btn-primary" disabled={submitting} style={{ background: 'transparent', color: 'var(--text)', border: '1px solid var(--border)' }} onClick={() => navigate(-1)}>Cancel</button>
      </div>
    </div>
  );
}
