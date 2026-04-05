import { createContext, useState, useEffect, useContext } from 'react';
import * as api from '../api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const sessionStr = localStorage.getItem('session');
      if (sessionStr) {
        try {
          const u = await api.getMe();
          setUser(u);
        } catch (err) {
          console.error("Invalid or broken session token:", err);
          localStorage.removeItem('session');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const loginUser = async (email, password) => {
    const data = await api.login(email, password);
    localStorage.setItem('session', JSON.stringify(data.session));
    setUser(data.user);
  };

  const signupUser = async (email, password, name) => {
    const data = await api.signup(email, password, name);
    localStorage.setItem('session', JSON.stringify(data.session));
    setUser(data.user);
  };

  const logoutUser = async () => {
    await api.logout();
    localStorage.removeItem('session');
    setUser(null);
  };

  const value = {
    user,
    loading,
    loginUser,
    signupUser,
    logoutUser
  };

  if (loading) return <div className="page-container" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh'}}>Loading App...</div>;

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
