import { useState } from 'react';
import { useHabits } from '../context/HabitContext';
import { CheckCircle2, Circle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as api from '../api';
import { getLocalDate } from '../lib/utils';

export default function Home() {
  const { habits, profile, loading, error, isHabitDoneToday, refreshHabits } = useHabits();
  const navigate = useNavigate();
  const [submittingId, setSubmittingId] = useState(null);

  if (loading) return <div className="page-container">Loading...</div>;
  if (error) return <div className="page-container" style={{ color: 'var(--warning)' }}>{error}</div>;

  const todayStr = getLocalDate();

  const handleToggle = async (e, habit) => {
    e.stopPropagation();
    if (submittingId) return;

    const isDone = isHabitDoneToday(habit.id);

    // For non-binary habits, navigate to log page instead of one-tap
    if (!isDone && habit.type !== 'binary') {
      navigate(`/habit/${habit.id}/log`);
      return;
    }

    try {
      setSubmittingId(habit.id);

      if (isDone) {
        // UNDO: delete today's log
        await api.deleteLog(habit.id, todayStr);
      } else {
        // MARK DONE: upsert today's log
        await api.createLog({ habitId: habit.id, status: 'done', date: todayStr });
      }

      await refreshHabits();
    } catch (err) {
      alert("Failed to update habit");
    } finally {
      setSubmittingId(null);
    }
  };

  const doneCount = habits.filter(h => isHabitDoneToday(h.id)).length;
  const totalCount = habits.length;

  return (
    <div className="page-container">
      <div className="flex-between" style={{ marginBottom: 24 }}>
        <div>
          <p style={{ fontSize: 12 }}>{new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' })}</p>
          <h1>Good morning,<br/>{profile?.name || 'User'}</h1>
        </div>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--accent-light)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
          {profile?.initials || 'U'}
        </div>
      </div>

      <div className="card" style={{ background: '#FFFDF5', border: '1px solid #FDF0C6', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 50, height: 50, borderRadius: '50%', border: '4px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', fontWeight: 'bold' }}>
          {totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0}%
        </div>
        <div>
          <h3 style={{ margin: 0 }}>{doneCount} of {totalCount} done</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{totalCount - doneCount} habits remaining</p>
        </div>
      </div>

      <h2 style={{ marginTop: 32 }}>Today</h2>

      {habits.length === 0 ? (
        <p style={{ textAlign: 'center', marginTop: 40, color: 'var(--text-muted)' }}>No habits yet. Tap + to create one!</p>
      ) : (
        <div className="flex-col gap-2">
          {habits.map(habit => {
            const isDone = isHabitDoneToday(habit.id);
            const isSubmitting = submittingId === habit.id;

            return (
              <div
                key={habit.id}
                className="card flex-between"
                style={{ margin: 0, cursor: 'pointer', opacity: isSubmitting ? 0.6 : 1 }}
                onClick={() => navigate(`/habit/${habit.id}`)}
              >
                <div className="flex-row gap-4">
                  <div
                    onClick={(e) => handleToggle(e, habit)}
                    style={{ cursor: 'pointer', color: isDone ? 'var(--accent)' : 'var(--border)' }}
                  >
                    {isDone ? <CheckCircle2 fill="var(--accent)" color="white" size={28} /> : <Circle size={28} />}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, textDecoration: isDone ? 'line-through' : 'none', color: isDone ? 'var(--text-muted)' : 'var(--text)' }}>
                      {habit.title}
                    </h4>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{habit.description || habit.category}</p>
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 500, color: isDone ? 'var(--success)' : 'var(--warning)' }}>
                    {isDone ? 'Done' : 'Pending'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
