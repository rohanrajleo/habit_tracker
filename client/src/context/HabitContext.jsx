import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import * as api from '../api';

const HabitContext = createContext();

export function HabitProvider({ children }) {
  const { user } = useAuth();
  const [habits, setHabits] = useState([]);
  const [todayLogs, setTodayLogs] = useState([]);
  const [profile, setProfile] = useState({});
  const [stats, setStats] = useState({ activeHabits: 0, totalLogs: 0, completionRate: 0, currentStreak: 0, longestStreak: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAllData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const [h, tl, p, s] = await Promise.all([
        api.getHabits(),
        api.getTodayLogs(),
        api.getProfile(),
        api.getStats()
      ]);

      setHabits(h || []);
      setTodayLogs(tl || []);
      setProfile(p || {});
      setStats(s || { activeHabits: 0, totalLogs: 0, completionRate: 0, currentStreak: 0, longestStreak: 0 });
    } catch (err) {
      console.error('Data fetch error:', err);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Check if a specific habit has been logged today
  const isHabitDoneToday = useCallback((habitId) => {
    return todayLogs.some(log => log.habit_id === habitId && log.status === 'done');
  }, [todayLogs]);

  const refreshHabits = useCallback(async () => {
    try {
      const [h, tl, s] = await Promise.all([
        api.getHabits(),
        api.getTodayLogs(),
        api.getStats()
      ]);
      setHabits(h || []);
      setTodayLogs(tl || []);
      setStats(s || stats);
    } catch (err) {
      console.error("Failed to refresh:", err);
    }
  }, [stats]);

  const refreshProfile = useCallback(async () => {
    try {
      setProfile(await api.getProfile());
    } catch (err) {
      console.error("Failed to refresh profile:", err);
    }
  }, []);

  const value = {
    habits,
    todayLogs,
    stats,
    profile,
    loading,
    error,
    isHabitDoneToday,
    refreshHabits,
    refreshProfile,
  };

  return (
    <HabitContext.Provider value={value}>
      {children}
    </HabitContext.Provider>
  );
}

export const useHabits = () => useContext(HabitContext);
