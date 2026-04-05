import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      await loginUser(email, password);
      // AuthContext state change handles routing to protected area implicitly
    } catch (err) {
      setError(err.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h1 style={{ color: 'var(--accent)', fontSize: 40, marginBottom: 8 }}>TrackIt</h1>
        <p style={{ color: 'var(--text-muted)' }}>Welcome back to your habits</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {error && <div style={{ color: 'var(--warning)', fontSize: 14, textAlign: 'center' }}>{error}</div>}
        
        <div>
          <label style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>Email Address</label>
          <input 
            type="email" 
            className="input-field" 
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ marginBottom: 0 }}
          />
        </div>

        <div>
          <label style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>Password</label>
          <input 
            type="password" 
            className="input-field" 
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ marginBottom: 0 }}
          />
        </div>

        <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 24 }}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: 32, fontSize: 14 }}>
        Don't have an account? <span style={{ color: 'var(--accent)', fontWeight: 600, cursor: 'pointer' }} onClick={() => navigate('/signup')}>Sign up</span>
      </p>
    </div>
  );
}
