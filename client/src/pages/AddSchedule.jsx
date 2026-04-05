import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useHabits } from '../context/HabitContext';
import * as api from '../api';

export default function AddSchedule() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshHabits } = useHabits();

  const baseData = location.state?.habitData || {};

  const [allowSkip, setAllowSkip] = useState(true);
  const [targetValue, setTargetValue] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSave = async () => {
    try {
      setSubmitting(true);
      await api.createHabit({
        title: baseData.title || 'New Habit',
        description: baseData.description || null,
        type: baseData.type || 'binary',
        category: baseData.category || 'health',
        allow_skip: allowSkip,
        target_value: targetValue ? Number(targetValue) : null
      });
      await refreshHabits();
      navigate('/');
    } catch (err) {
      alert("Failed to create habit");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="flex-row gap-4" style={{ marginBottom: 24 }}>
        <ChevronLeft size={24} onClick={() => navigate(-1)} style={{ cursor: 'pointer' }} />
        <h2>Configure habit</h2>
      </div>

      <div className="card" style={{ background: 'var(--accent-light)', marginBottom: 24 }}>
        <h4 style={{ margin: 0, color: 'var(--accent)' }}>{baseData.title || 'New Habit'}</h4>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>{baseData.type} • {baseData.category}</p>
      </div>

      {baseData.type !== 'binary' && (
        <>
          <h4 style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12, letterSpacing: 1 }}>
            Target {baseData.type === 'duration' ? '(minutes)' : '(value)'}
          </h4>
          <input
            type="number"
            className="input-field"
            placeholder={baseData.type === 'duration' ? 'e.g. 30' : 'e.g. 8'}
            value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
            min="0"
          />
          {baseData.type === 'duration' && targetValue && (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              = {Math.floor(Number(targetValue) / 60)}h {Number(targetValue) % 60}m
            </p>
          )}
        </>
      )}

      <div className="flex-between" style={{ marginTop: 24, marginBottom: 32 }}>
        <div>
          <h4 style={{ margin: 0 }}>Allow skip</h4>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Mark as skipped instead of missed</p>
        </div>
        <input
          type="checkbox"
          checked={allowSkip}
          onChange={(e) => setAllowSkip(e.target.checked)}
          style={{ width: 24, height: 24, accentColor: 'var(--accent)' }}
        />
      </div>

      <div style={{ marginTop: 'auto', paddingTop: 40, textAlign: 'center' }}>
        <p style={{ fontSize: 12, marginBottom: 16, color: 'var(--text-muted)' }}>Step 2 of 2</p>
        <button className="btn-primary" disabled={submitting} onClick={handleSave}>
          {submitting ? 'Saving...' : 'Save habit'}
        </button>
      </div>
    </div>
  );
}
