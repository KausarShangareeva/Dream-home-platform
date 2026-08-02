import { useEffect, useState, useCallback } from 'react';
import { api } from '../api.js';
import DeleteButton from './ui/DeleteButton.jsx';

function CareerSection({ title, items, onToggle, onDelete, onAdd }) {
  const [name, setName] = useState('');
  return (
    <div style={{ flex: 1, minWidth: 260 }}>
      <div style={{ fontWeight: 700, marginBottom: 10 }}>{title}</div>
      <div className="mama-table-wrap">
        <table className="data-table">
          <thead><tr><th>✓</th><th className="col-title">Профессия</th><th></th></tr></thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={3} className="empty-state">Пусто</td></tr>}
            {items.map(item => (
              <tr key={item._id}>
                <td><input type="checkbox" checked={item.done} onChange={() => onToggle(item)} /></td>
                <td className="col-title">{item.icon} {item.name}</td>
                <td><DeleteButton onConfirm={() => onDelete(item)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="form-row" style={{ marginTop: 10 }}>
        <div className="field"><input placeholder="Название профессии" value={name} onChange={e => setName(e.target.value)} /></div>
        <button className="btn btn-sm btn-primary" type="button" onClick={() => { if (!name.trim()) return; onAdd(name.trim()); setName(''); }}>+</button>
      </div>
    </div>
  );
}

export default function CareerTab({ ownerId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setItems(await api.getCareerGoals(ownerId)); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [ownerId]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="empty-state">Загрузка…</div>;
  if (error) return (
    <div className="empty-state">
      Не удалось загрузить данные: {error}
      <div style={{ marginTop: 10 }}><button className="btn btn-sm btn-ghost" onClick={load}>Повторить</button></div>
    </div>
  );

  const main = items.filter(i => i.category === 'main');
  const side = items.filter(i => i.category === 'side');

  const toggle = async (item) => { await api.updateCareerGoal(ownerId, item._id, { done: !item.done }); load(); };
  const remove = async (item) => { await api.deleteCareerGoal(ownerId, item._id); load(); };
  const add = async (category, name) => { await api.addCareerGoal(ownerId, { category, name }); load(); };

  return (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
      <CareerSection title="💼 Основная работа" items={main} onToggle={toggle} onDelete={remove} onAdd={n => add('main', n)} />
      <CareerSection title="🧩 Подработка" items={side} onToggle={toggle} onDelete={remove} onAdd={n => add('side', n)} />
    </div>
  );
}
