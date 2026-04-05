import { useHabits } from '../context/HabitContext';
import { useNavigate } from 'react-router-dom';
import { UserCircle, Lock, ChevronRight, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const navigate = useNavigate();
  const { profile, stats, habits, loading } = useHabits();
  const { logoutUser } = useAuth();

  if (loading || !profile) return <div className="page-container">Loading...</div>;

  const handleLogout = async () => {
    await logoutUser();
  };

  return (
    <div className="page-container">
      <h2>Profile</h2>

      <div className="flex-col" style={{ alignItems: 'center', marginTop: 24, marginBottom: 32 }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--accent-light)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 'bold', marginBottom: 16 }}>
          {profile.initials || 'U'}
        </div>
        <h2 style={{ margin: 0 }}>{profile.name || 'User'}</h2>
        <p style={{ fontSize: 14 }}>{profile.email || ''}</p>
        {profile.memberSince && (
          <div style={{ marginTop: 8, padding: '4px 12px', background: 'var(--accent-light)', color: 'var(--accent)', borderRadius: 12, fontSize: 12, fontWeight: 500 }}>
            Member since {profile.memberSince}
          </div>
        )}
      </div>

      <div className="flex-between" style={{ padding: '0 24px', marginBottom: 40 }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: 'var(--accent)', margin: 0 }}>{stats.currentStreak}</h2>
          <p style={{ fontSize: 12 }}>Day streak</p>
        </div>
        <div style={{ width: 1, height: 40, background: 'var(--border)' }}></div>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ margin: 0 }}>{habits.length}</h2>
          <p style={{ fontSize: 12 }}>Habits</p>
        </div>
        <div style={{ width: 1, height: 40, background: 'var(--border)' }}></div>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: 'var(--success)', margin: 0 }}>{stats.completionRate}%</h2>
          <p style={{ fontSize: 12 }}>Rate</p>
        </div>
      </div>

      <h4 style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12, letterSpacing: 1 }}>Account</h4>
      <div className="card" style={{ padding: '8px 16px' }}>
        <div className="flex-between" style={{ padding: '16px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }} onClick={() => navigate('/profile/edit')}>
          <div className="flex-row gap-4">
            <UserCircle size={24} color="var(--accent)" />
            <div>
              <p style={{ color: 'var(--text)', fontWeight: 500 }}>Edit profile</p>
              <p style={{ fontSize: 12 }}>Name, email, photo</p>
            </div>
          </div>
          <ChevronRight size={20} color="var(--text-muted)" />
        </div>
        <div className="flex-between" style={{ padding: '16px 0', cursor: 'pointer' }} onClick={handleLogout}>
          <div className="flex-row gap-4">
            <LogOut size={24} color="var(--warning)" />
            <div>
              <p style={{ color: 'var(--text)', fontWeight: 500 }}>Sign out</p>
              <p style={{ fontSize: 12 }}>Log out of your account</p>
            </div>
          </div>
          <ChevronRight size={20} color="var(--text-muted)" />
        </div>
      </div>
    </div>
  );
}
