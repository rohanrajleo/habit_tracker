import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useHabits } from '../context/HabitContext';
import { ChevronLeft } from 'lucide-react';
import * as api from '../api';
import { getLocalDate } from '../lib/utils';

export default function LogHabit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { habits, refreshHabits } = useHabits();

  const habit = habits.find(h => h.id === id);

  // Use the exact DB enum values directly: 'done', 'skipped', 'missed'
  const [status, setStatus] = useState('done');
  const [value, setValue] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!habit) return <div className="page-container">Habit not found</div>;

  const handleSave = async () => {
    try {
      setSubmitting(true);

      const payload = {
        habitId: habit.id,
        status, // already a valid DB enum: 'done' | 'skipped' | 'missed'
        date: getLocalDate(),
        note: note || null
      };

      // Only attach value for non-binary habits when status is 'done'
      if (habit.type !== 'binary' && status === 'done') {
        if (value === "") {
          payload.value = null;
        } else {
          payload.value = Number(value);
        }
      }

      await api.createLog(payload);
      await refreshHabits();
      navigate('/');
    } catch (err) {
      alert("Failed to save log");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="flex-row gap-4" style={{ marginBottom: 24 }}>
        <ChevronLeft size={24} onClick={() => navigate(-1)} style={{ cursor: 'pointer' }} />
        <h2>Log habit</h2>
      </div>

      <div className="card" style={{ background: 'var(--accent-light)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          ⏱️
        </div>
        <div>
          <h4 style={{ margin: 0 }}>{habit.title}</h4>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{habit.description || habit.category}</p>
        </div>
      </div>

      <h4 style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--text-muted)', margin: '24px 0 12px', letterSpacing: 1 }}>How did it go?</h4>
      <div className="flex-row gap-2">
        {['done', 'skipped', 'missed'].map(s => (
          <div
            key={s}
            className={`chip ${status === s ? 'active' : ''}`}
            onClick={() => setStatus(s)}
            style={{ textTransform: 'capitalize' }}
          >
            {s}
          </div>
        ))}
      </div>

      {habit.type !== 'binary' && status === 'done' && (
        <>
          <h4 style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--text-muted)', margin: '24px 0 12px', letterSpacing: 1 }}>
            {habit.type === 'duration' ? 'Duration (minutes)' : 'Value Achieved'}
          </h4>
          <input
            type="number"
            className="input-field"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={habit.type === 'duration' ? 'e.g. 30' : 'Enter number'}
            min="0"
          />
          {habit.type === 'duration' && value && (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              = {Math.floor(Number(value) / 60)}h {Number(value) % 60}m
            </p>
          )}
        </>
      )}

      <h4 style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--text-muted)', margin: '24px 0 12px', letterSpacing: 1 }}>Note</h4>
      <textarea
        className="input-field"
        style={{ minHeight: 100, resize: 'none' }}
        placeholder="Felt great, extra energy today"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      <div className="flex-col gap-2" style={{ marginTop: 24 }}>
        <button className="btn-primary" disabled={submitting} onClick={handleSave}>
          {submitting ? 'Saving...' : 'Save log'}
        </button>
        <button className="btn-primary" disabled={submitting} style={{ background: 'transparent', color: 'var(--text)', border: '1px solid var(--border)' }} onClick={() => navigate(-1)}>Cancel</button>
      </div>
    </div>
  );
}
