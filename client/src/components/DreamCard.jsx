import { useState } from 'react';
import { PEOPLE } from '../data/people.js';
import DeleteButton from './ui/DeleteButton.jsx';

const fmt = (n) => Math.round(n).toLocaleString('ru-RU') + ' kr';

export default function DreamCard({ dream, total, isCustom, onAddDeposit, onDeleteDream }) {
  const [adding, setAdding] = useState(false);
  const [person, setPerson] = useState(PEOPLE[0].id);
  const [amount, setAmount] = useState('');

  const pct = Math.min(100, (total / dream.target) * 100);

  const submit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    await onAddDeposit({ person, amount: Number(amount), date: new Date().toISOString().slice(0, 10) });
    setAmount(''); setAdding(false);
  };

  return (
    <div className="dream-card">
      {isCustom && (
        <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}>
          <DeleteButton onConfirm={onDeleteDream} title="Удалить мечту" />
        </div>
      )}
      <div className="dream-img">
        {dream.photo ? (
          <img
            src={dream.photo}
            alt={dream.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: dream.pos || 'center', display: 'block' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, background: 'var(--card-soft)' }}>
            {dream.icon}
          </div>
        )}
      </div>
      <div className="dream-body">
        <h4>{dream.title}</h4>
        <div className="dream-progress-track"><div className="dream-progress-fill" style={{ width: `${pct}%` }} /></div>
        <div className="dream-nums">
          <span>Собрано</span>
          <b>{fmt(total)} / {fmt(dream.target)}</b>
        </div>

        {!adding && (
          <div className="dream-actions">
            <button className="btn btn-sm btn-ghost" onClick={() => setAdding(true)}>+ Внести</button>
          </div>
        )}
        {adding && (
          <form onSubmit={submit} className="dream-actions" style={{ flexDirection: 'column' }}>
            <select value={person} onChange={e => setPerson(e.target.value)}>
              {PEOPLE.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input type="number" min="1" placeholder="Сумма" value={amount} onChange={e => setAmount(e.target.value)} autoFocus />
            <div style={{ display: 'flex', gap: 6 }}>
              <button type="button" className="btn btn-sm btn-ghost" onClick={() => setAdding(false)} style={{ flex: 1 }}>Отмена</button>
              <button type="submit" className="btn btn-sm btn-primary" style={{ flex: 1 }}>Ок</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
