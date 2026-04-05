import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function Add() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('binary'); // strictly map db schema 'binary'
  const [category, setCategory] = useState('health');

  return (
    <div className="page-container">
      <div className="flex-row gap-4" style={{ marginBottom: 24 }}>
        <ChevronLeft size={24} onClick={() => navigate(-1)} style={{ cursor: 'pointer' }} />
        <h2>New habit</h2>
      </div>

      <p style={{ marginBottom: 12, fontSize: 14 }}>What do you want to build?</p>
      <input 
        type="text" 
        className="input-field" 
        placeholder="Habit title" 
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      <input 
        type="text" 
        className="input-field" 
        placeholder="Why does this matter to you? (optional)" 
        value={description}
        onChange={e => setDescription(e.target.value)}
      />

      <h4 style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--text-muted)', margin: '24px 0 12px', letterSpacing: 1 }}>Type</h4>
      <div className="flex-row gap-2">
        {['binary', 'measurable', 'duration'].map(t => (
          <div 
            key={t}
            className={`chip ${type === t ? 'active' : ''}`}
            onClick={() => setType(t)}
            style={{ textTransform: 'capitalize' }}
          >
            {t}
          </div>
        ))}
      </div>

      <h4 style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--text-muted)', margin: '24px 0 12px', letterSpacing: 1 }}>Category</h4>
      <div className="flex-row gap-2" style={{ flexWrap: 'wrap' }}>
        {['health', 'fitness', 'learning', 'mindfulness'].map(c => (
          <div 
            key={c}
            className={`chip ${category === c ? 'active' : ''}`}
            onClick={() => setCategory(c)}
            style={{ textTransform: 'capitalize' }}
          >
            {c}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 'auto', paddingTop: 40, textAlign: 'center' }}>
        <p style={{ fontSize: 12, marginBottom: 16 }}>Step 1 of 2 • Schedule next</p>
        <button 
          className="btn-primary" 
          onClick={() => navigate('/add/schedule', { state: { habitData: { title, description, type, category } } })}
          disabled={!title.trim()}
          style={{ opacity: !title.trim() ? 0.5 : 1 }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
