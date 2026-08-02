import { useState } from 'react';
import { personById } from '../data/people.js';

export default function UseMoneyModal({ open, cause, availableByPerson, onClose, onSave }) {
  const [amounts, setAmounts] = useState({});

  if (!open || !cause) return null;

  const people = Object.entries(availableByPerson).filter(([, amt]) => amt > 0);
  const total = Object.values(amounts).reduce((s, v) => s + (Number(v) || 0), 0);

  const save = () => {
    const breakdown = Object.entries(amounts)
      .filter(([, v]) => Number(v) > 0)
      .map(([person, v]) => ({ person, amount: Number(v) }));
    if (!breakdown.length) return alert('Впишите хотя бы одну сумму');
    onSave(breakdown);
    setAmounts({});
  };

  return (
    <div className="modal-backdrop open" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <h3>{cause.icon} Использовать деньги: {cause.name}</h3>

        <div className="modal-section">
          {people.length === 0 && <div className="empty-state">Ни у кого нет доступных денег на садаку</div>}
          {people.map(([personId, available]) => {
            const p = personById(personId);
            return (
              <div key={personId} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 2px', borderBottom: '1px dashed var(--line)' }}>
                <span style={{ flex: 1 }}>{p.name}</span>
                <span style={{ fontSize: 11, color: 'var(--ink-soft)' }}>из {available} kr</span>
                <input
                  type="number" min="0" max={available} style={{ maxWidth: 100 }}
                  value={amounts[personId] || ''}
                  onChange={e => setAmounts(a => ({ ...a, [personId]: e.target.value }))}
                />
              </div>
            );
          })}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--line)', fontWeight: 700 }}>
            <span>Итого</span>
            <span>{total} kr</span>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Отмена</button>
          <button className="btn btn-primary" onClick={save}>Использовать</button>
        </div>
      </div>
    </div>
  );
}
