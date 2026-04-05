import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useHabits } from '../context/HabitContext';
import { ChevronLeft } from 'lucide-react';
import * as api from '../api';
import { getLocalDate } from '../lib/utils';

export default function HabitDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { habits } = useHabits();

  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const habit = habits.find(h => h.id === id);

  useEffect(() => {
    if (!habit) return;
    setLoading(true);
    setError(null);

    api.getLogs(habit.id)
      .then((res) => {
        setLogs(res.logs || []);
        setStats(res.stats || null);
      })
      .catch(() => setError("Failed to fetch history"))
      .finally(() => setLoading(false));
  }, [habit?.id]);

  if (!habit) return <div className="page-container">Habit not found</div>;

  const todayStr = getLocalDate();
  const todayLog = logs.find(l => l.date === todayStr);

  // Logs sorted descending for display
  const sortedLogs = [...logs].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="page-container">
      <div className="flex-row gap-4" style={{ marginBottom: 24 }}>
        <ChevronLeft size={24} onClick={() => navigate(-1)} style={{ cursor: 'pointer' }} />
        <h2>{habit.title}</h2>
      </div>

      <div className="card" style={{ background: 'var(--accent-light)' }}>
        <p style={{ color: 'var(--accent)', fontWeight: 500 }}>{habit.category} • {habit.type}</p>
        {habit.description && <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{habit.description}</p>}
      </div>

      {/* Stats cards */}
      {loading ? (
        <p style={{ marginTop: 24 }}>Loading...</p>
      ) : error ? (
        <p style={{ color: 'var(--warning)', marginTop: 24 }}>{error}</p>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 24, marginBottom: 24 }}>
            <div className="card" style={{ margin: 0, textAlign: 'center', padding: '16px 8px' }}>
              <h2 style={{ color: 'var(--accent)' }}>{stats?.current_streak ?? 0}</h2>
              <p style={{ fontSize: 11 }}>Current streak</p>
            </div>
            <div className="card" style={{ margin: 0, textAlign: 'center', padding: '16px 8px' }}>
              <h2>{stats?.longest_streak ?? 0}</h2>
              <p style={{ fontSize: 11 }}>Best streak</p>
            </div>
            <div className="card" style={{ margin: 0, textAlign: 'center', padding: '16px 8px' }}>
              <h2 style={{ color: 'var(--success)' }}>{stats?.completion_rate ?? 0}%</h2>
              <p style={{ fontSize: 11 }}>Completion</p>
            </div>
          </div>

          {/* Today status */}
          <div className="card" style={{ marginBottom: 8 }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Today</p>
            <p style={{ fontWeight: 500 }}>
              {todayLog ? (
                <span style={{ color: todayLog.status === 'done' ? 'var(--success)' : 'var(--warning)' }}>
                  {todayLog.status.charAt(0).toUpperCase() + todayLog.status.slice(1)}
                  {todayLog.value ? ` — ${todayLog.value}` : ''}
                </span>
              ) : 'Not logged yet'}
            </p>
          </div>

          <button className="btn-primary" style={{ marginBottom: 32 }} onClick={() => navigate(`/habit/${habit.id}/log`)}>
            {todayLog ? "Update today's log" : 'Log today'}
          </button>

          {/* Full history */}
          <h4 style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12, letterSpacing: 1 }}>
            History ({stats?.total_logs ?? 0} logs)
          </h4>

          {sortedLogs.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 16 }}>No logs yet</p>
          ) : (
            <div className="flex-col gap-1" style={{ paddingBottom: 80 }}>
              {sortedLogs.map(log => (
                <div key={log.id} className="card" style={{ margin: 0, padding: '12px 16px' }}>
                  <div className="flex-between">
                    <div>
                      <p style={{ fontWeight: 500, fontSize: 14 }}>
                        {new Date(log.date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      {log.note && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{log.note}</p>}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{
                        fontSize: 12,
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: 8,
                        background: log.status === 'done' ? '#E8F5E9' : log.status === 'skipped' ? '#FFF8E1' : '#FFEBEE',
                        color: log.status === 'done' ? '#2E7D32' : log.status === 'skipped' ? '#F57F17' : '#C62828'
                      }}>
                        {log.status}
                      </span>
                      {log.value !== null && log.value !== undefined && (
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Value: {log.value}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
