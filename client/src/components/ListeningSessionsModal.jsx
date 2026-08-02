import { useState } from 'react';
import { api } from '../api.js';
import DeleteButton from './ui/DeleteButton.jsx';

function fmtHours(h) {
  const rounded = Math.round(h * 10) / 10;
  return rounded % 1 === 0 ? String(rounded) : rounded.toFixed(1);
}

export default function ListeningSessionsModal({ ownerId, item, onClose, onChange }) {
  const [newEpisodeName, setNewEpisodeName] = useState('');
  const [newEpisodeHours, setNewEpisodeHours] = useState('');
  const [quickHours, setQuickHours] = useState('');
  const [quickMinutes, setQuickMinutes] = useState('');

  const toggleSession = async (session) => {
    await api.updateListeningSession(ownerId, item._id, session._id, { done: !session.done });
    onChange();
  };

  const addEpisode = async () => {
    if (!newEpisodeName.trim() || !newEpisodeHours) return;
    await api.addListeningSession(ownerId, item._id, { name: newEpisodeName.trim(), hours: Number(newEpisodeHours), done: false });
    setNewEpisodeName(''); setNewEpisodeHours('');
    onChange();
  };

  const addQuickLog = async () => {
    const h = Number(quickHours || 0) + Number(quickMinutes || 0) / 60;
    if (h <= 0) return;
    await api.addListeningSession(ownerId, item._id, { hours: h, done: true });
    setQuickHours(''); setQuickMinutes('');
    onChange();
  };

  const deleteSession = async (session) => {
    await api.deleteListeningSession(ownerId, item._id, session._id);
    onChange();
  };

  return (
    <div className="modal-backdrop open" onClick={onClose}>
      <div className="modal-card form-modal" onClick={e => e.stopPropagation()}>
        <h3>{item.title}</h3>

        {item.sessions.length > 0 && (
          <div className="modal-section listening-episode-list">
            {item.sessions.map(s => (
              <div className="listening-episode-row" key={s._id}>
                <label>
                  <input type="checkbox" checked={s.done} onChange={() => toggleSession(s)} />
                  {s.name || 'Прослушано (без названия)'}
                </label>
                <span className="listening-episode-hours">{fmtHours(s.hours)} ч</span>
                <DeleteButton onConfirm={() => deleteSession(s)} title="Удалить запись" />
              </div>
            ))}
          </div>
        )}

        <div className="modal-section">
          <label style={{ fontSize: 11.5, color: 'var(--ink-soft)', display: 'block', marginBottom: 7 }}>Добавить эпизод в список</label>
          <div className="form-row" style={{ margin: 0 }}>
            <input placeholder="Название эпизода" value={newEpisodeName} onChange={e => setNewEpisodeName(e.target.value)} />
            <input type="number" min="0.1" step="0.1" placeholder="Часов" style={{ maxWidth: 90 }} value={newEpisodeHours} onChange={e => setNewEpisodeHours(e.target.value)} />
            <button className="btn btn-sm btn-ghost" type="button" onClick={addEpisode}>+</button>
          </div>
        </div>

        <div className="modal-section listening-quick-log">
          <label style={{ fontSize: 11.5, color: 'var(--ink-soft)', display: 'block', marginBottom: 7 }}>Сегодня прослушала</label>
          <div className="form-row" style={{ margin: 0, alignItems: 'center' }}>
            <input type="number" min="0" placeholder="ч" style={{ maxWidth: 60 }} value={quickHours} onChange={e => setQuickHours(e.target.value)} />
            <input type="number" min="0" max="59" placeholder="мин" style={{ maxWidth: 60 }} value={quickMinutes} onChange={e => setQuickMinutes(e.target.value)} />
            <button className="btn btn-sm btn-primary" type="button" onClick={addQuickLog}>Добавить</button>
          </div>
        </div>

        <div className="listening-modal-total">Прослушано: <b>{fmtHours(item.hours)} ч</b></div>

        <div className="modal-actions">
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={onClose} type="button">Готово</button>
        </div>
      </div>
    </div>
  );
}
