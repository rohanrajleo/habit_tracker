const API_URL = import.meta.env.VITE_API_URL;

const fetchAPI = async (endpoint, options = {}) => {
  const sessionStr = localStorage.getItem('session');
  const headers = { 'Content-Type': 'application/json' };

  if (sessionStr) {
    try {
      const session = JSON.parse(sessionStr);
      if (session && session.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
    } catch (e) {
      // Corrupt session data
    }
  }

  const res = await fetch(`${API_URL}${endpoint}`, { headers, ...options });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'API request failed');
  return json.data;
};

// AUTH
export const signup = (email, password, name) =>
  fetchAPI('/auth/signup', { method: 'POST', body: JSON.stringify({ email, password, name }) });
export const login = (email, password) =>
  fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
export const logout = async () => {
  const result = await fetchAPI('/auth/logout', { method: 'POST' }).catch(() => true);
  localStorage.removeItem('session');
  return result;
};
export const getMe = () => fetchAPI('/auth/me');

// HABITS
export const getHabits = () => fetchAPI('/habits');
export const getHabit = (id) => fetchAPI(`/habits/${id}`);
export const createHabit = (data) => fetchAPI('/habits', { method: 'POST', body: JSON.stringify(data) });
export const updateHabit = (id, data) => fetchAPI(`/habits/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteHabit = (id) => fetchAPI(`/habits/${id}`, { method: 'DELETE' });

// LOGS
export const createLog = (data) => fetchAPI('/logs', { method: 'POST', body: JSON.stringify(data) });
export const deleteLog = (habitId, date) => fetchAPI(`/logs/${habitId}/${date}`, { method: 'DELETE' });
export const getTodayLogs = () => fetchAPI('/logs/today');
export const getLogs = (habitId) => fetchAPI(`/logs/${habitId}`);

// STATS
export const getStats = () => fetchAPI('/stats');

// PROFILE
export const getProfile = () => fetchAPI('/profile');
export const updateProfile = (data) => fetchAPI('/profile', { method: 'PUT', body: JSON.stringify(data) });
