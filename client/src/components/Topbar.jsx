import { useState } from 'react';

const MOODS = [
  { id: 'default', label: 'Тепло' },
  { id: 'cool', label: 'Прохладно' },
  { id: 'night', label: 'Ночь' },
];

export default function Topbar() {
  const [moodOpen, setMoodOpen] = useState(false);
  const [mood, setMood] = useState('default');

  const applyMood = (id) => {
    setMood(id);
    setMoodOpen(false);
    document.body.dataset.mood = id;
  };

  return (
    <div className="topbar">
      <div className="greet">Ассаляму алейкум, <b>семья Шангареевых</b> 🌙</div>
      <div className="topbar-right" style={{ position: 'relative' }}>
        <button className="btn btn-sm btn-ghost" onClick={() => setMoodOpen(v => !v)}>🎨 Настроение</button>
        {moodOpen && (
          <div className="mood-panel">
            {MOODS.map(m => (
              <button key={m.id} className={`mood-option${mood === m.id ? ' active' : ''}`} onClick={() => applyMood(m.id)}>
                {m.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
