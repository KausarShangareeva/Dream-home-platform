import { useState } from 'react';

// Same 5 mood themes from the original single-file version.
const MOODS = [
  { id: 'cotton', name: 'Сладкая вата', hint: 'Нежный, пастельный', emoji: '🍭' },
  { id: 'cappuccino', name: 'Кофейный капучино', hint: 'Тёплый, уютный', emoji: '☕' },
  { id: 'honey', name: 'Медовое настроение', hint: 'Тёплый, янтарный', emoji: '🍯' },
  { id: 'snow', name: 'Снежный лес', hint: 'Прохладный, свежий', emoji: '❄️' },
  { id: 'jungle', name: 'Джунгли', hint: 'Тёмный, роскошный', emoji: '🌴' },
];

export default function Topbar() {
  const [moodOpen, setMoodOpen] = useState(false);
  const [mood, setMood] = useState('cotton');
  const [soundOn, setSoundOn] = useState(false);

  const currentMood = MOODS.find(m => m.id === mood);

  const applyMood = (id) => {
    setMood(id);
    setMoodOpen(false);
    document.body.setAttribute('data-theme', id === 'cotton' ? '' : id);
  };

  return (
    <div className="topbar">
      <div className="greet">Ассаляму алейкум, <b>семья Шангареевых</b> 🌙</div>
      <div className="topbar-right">
        <button
          className={`mood-btn${soundOn ? ' sound-active' : ''}`}
          title="Звуки атмосферы (пока в разработке)"
          onClick={() => setSoundOn(v => !v)}
        >
          <span className="swatch-dot">{soundOn ? '🔊' : '🔇'}</span> Звук
        </button>
        <div className="mood-wrap">
          <button className="mood-btn" onClick={() => setMoodOpen(v => !v)}>
            <span className="swatch-dot">{currentMood.emoji}</span> Настроение
          </button>
          {moodOpen && (
            <div className="mood-panel" style={{ display: 'flex' }}>
              <div className="mp-title">Тема оформления</div>
              {MOODS.map(m => (
                <button key={m.id} className={`mood-option${mood === m.id ? ' active' : ''}`} onClick={() => applyMood(m.id)}>
                  <span className="swatch">{m.emoji}</span>
                  <span>
                    <b>{m.name}</b>
                    <small>{m.hint}</small>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
