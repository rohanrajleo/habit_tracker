import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHabits } from '../context/HabitContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as api from '../api';

export default function Stats() {
  const { stats, habits, loading } = useHabits();
  const navigate = useNavigate();

  if (loading) return <div className="page-container">Loading...</div>;

  // Per-habit stats come from the stats.habits array (from GET /stats)
  const habitStats = stats.habits || [];

  return (
    <div className="page-container">
      <h2>Your progress</h2>

      {/* Overall summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
        <div className="card" style={{ margin: 0 }}>
          <h1 style={{ color: 'var(--accent)' }}>{stats.currentStreak}</h1>
          <p style={{ fontSize: 13 }}>Current streak</p>
        </div>
        <div className="card" style={{ margin: 0 }}>
          <h1>{stats.longestStreak}</h1>
          <p style={{ fontSize: 13 }}>Longest streak</p>
        </div>
        <div className="card" style={{ margin: 0 }}>
          <h1 style={{ color: 'var(--success)' }}>{stats.completionRate}%</h1>
          <p style={{ fontSize: 13 }}>Overall completion</p>
        </div>
        <div className="card" style={{ margin: 0 }}>
          <h1>{stats.activeHabits}</h1>
          <p style={{ fontSize: 13 }}>Active habits</p>
        </div>
      </div>

      {/* Per-habit completion rates */}
      <h4 style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 16, letterSpacing: 1 }}>Per habit</h4>

      {habitStats.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 24 }}>No habits yet</p>
      ) : (
        <div className="flex-col gap-2">
          {habitStats.map(h => (
            <div
              key={h.id}
              className="card"
              style={{ margin: 0, cursor: 'pointer' }}
              onClick={() => navigate(`/habit/${h.id}`)}
            >
              <div className="flex-between" style={{ marginBottom: 8 }}>
                <div>
                  <h4 style={{ margin: 0 }}>{h.title}</h4>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{h.category} • {h.doneCount}/{h.totalLogs} logged</p>
                </div>
                <div className="flex-row gap-2" style={{ alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold', color: h.completionRate >= 70 ? 'var(--success)' : h.completionRate >= 40 ? 'var(--warning)' : 'var(--text-muted)' }}>
                    {h.completionRate}%
                  </span>
                  <ChevronRight size={16} color="var(--text-muted)" />
                </div>
              </div>
              {/* Progress bar */}
              <div style={{ height: 6, borderRadius: 3, background: 'var(--bg)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${h.completionRate}%`,
                  borderRadius: 3,
                  background: h.completionRate >= 70 ? 'var(--success)' : h.completionRate >= 40 ? 'var(--warning)' : 'var(--text-muted)',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
