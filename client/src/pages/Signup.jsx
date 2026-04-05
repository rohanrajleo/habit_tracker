import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const navigate = useNavigate();
  const { signupUser } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      await signupUser(email, password, name);
      // Handles implicit routing on token inject
    } catch (err) {
      setError(err.message || "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h1 style={{ color: 'var(--accent)', fontSize: 40, marginBottom: 8 }}>TrackIt</h1>
        <p style={{ color: 'var(--text-muted)' }}>Start building better habits today</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {error && <div style={{ color: 'var(--warning)', fontSize: 14, textAlign: 'center' }}>{error}</div>}
        
        <div>
          <label style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>Full Name</label>
          <input 
            type="text" 
            className="input-field" 
            placeholder="John Doe"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            style={{ marginBottom: 0 }}
          />
        </div>

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
            minLength={6}
            style={{ marginBottom: 0 }}
          />
        </div>

        <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 24 }}>
          {loading ? "Creating account..." : "Sign Up"}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: 32, fontSize: 14 }}>
        Already have an account? <span style={{ color: 'var(--accent)', fontWeight: 600, cursor: 'pointer' }} onClick={() => navigate('/login')}>Sign in</span>
      </p>
    </div>
  );
}
