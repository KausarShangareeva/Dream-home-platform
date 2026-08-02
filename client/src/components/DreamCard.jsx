import { useState } from 'react';
import { PEOPLE, personById } from '../data/people.js';
import Avatar from './ui/Avatar.jsx';
import DeleteButton from './ui/DeleteButton.jsx';

const fmt = (n) => Math.round(n).toLocaleString('ru-RU') + ' kr';

function ContributionRow({ deposit, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(deposit.amount);
  const p = personById(deposit.person);

  const save = () => {
    if (Number(value) > 0) onUpdate(Number(value));
    setEditing(false);
  };

  return (
    <div className="dream-contrib-row">
      <Avatar person={p} size={22} />
      <span className="dream-contrib-name">{p.name.split(' ')[0]}</span>
      {editing ? (
        <input
          type="number" min="1" autoFocus value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && save()}
          onBlur={save}
          className="dream-contrib-edit"
        />
      ) : (
        <span className="dream-contrib-amt">{fmt(deposit.amount)}</span>
      )}
      {!editing && (
        <button type="button" className="dream-contrib-icon" title="Изменить сумму" onClick={() => setEditing(true)}>✎</button>
      )}
      <DeleteButton onConfirm={onDelete} title="Удалить взнос" />
    </div>
  );
}

export default function DreamCard({ dream, total, deposits, isCustom, onAddDeposit, onUpdateDeposit, onDeleteDeposit, onDeleteDream, onEdit }) {
  const [person, setPerson] = useState(PEOPLE[0].id);
  const [amount, setAmount] = useState('');

  const pct = Math.min(100, (total / dream.target) * 100);

  const submit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    await onAddDeposit({ person, amount: Number(amount), date: new Date().toISOString().slice(0, 10) });
    setAmount('');
  };

  return (
    <div className="dream-card">
      {isCustom && (
        <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 2, display: 'flex', gap: 6 }}>
          {onEdit && (
            <button
              type="button"
              className="icon-del"
              title="Изменить мечту"
              onClick={onEdit}
              style={{ background: 'var(--card)' }}
            >✎</button>
          )}
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
          <span>Собрано <b>{fmt(total)}</b></span>
          <span>Цель {fmt(dream.target)}</span>
        </div>

        <form onSubmit={submit} className="dream-actions">
          <select value={person} onChange={e => setPerson(e.target.value)}>
            {PEOPLE.map(p => <option key={p.id} value={p.id}>{p.name.split(' ')[0]}</option>)}
          </select>
          <input type="number" min="1" placeholder="kr" value={amount} onChange={e => setAmount(e.target.value)} />
          <button type="submit" className="btn btn-sm btn-primary">+</button>
        </form>

        {deposits.length > 0 && (
          <div className="dream-contrib-list">
            {deposits.map(d => (
              <ContributionRow
                key={d._id}
                deposit={d}
                onUpdate={(amount) => onUpdateDeposit(d._id, amount)}
                onDelete={() => onDeleteDeposit(d._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
