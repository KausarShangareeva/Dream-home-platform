import { useEffect, useState, useCallback, useRef } from 'react';
import { api } from '../api.js';
import DeleteButton from './ui/DeleteButton.jsx';
import { useDragReorder } from '../hooks/useDragReorder.js';

function CareerSection({ title, items, onToggle, onDelete, onAdd, onReorder }) {
  const [name, setName] = useState('');
  const { ordered, getRowProps } = useDragReorder(items, onReorder);

  return (
    <div style={{ flex: 1, minWidth: 260 }}>
      <div style={{ fontWeight: 700, marginBottom: 10 }}>{title}</div>
      <div className="mama-table-wrap">
        <table className="mama-table">
          <thead>
            <tr>
              <th className="col-num">#</th>
              <th className="col-check">✓</th>
              <th className="col-title">Профессия</th>
              <th className="col-del"></th>
            </tr>
          </thead>
          <tbody>
            {ordered.length === 0 && <tr><td colSpan={4} className="empty-state">Пусто</td></tr>}
            {ordered.map((item, idx) => (
              <tr key={item._id} {...getRowProps(item)} className={item.done ? 'book-row-done' : ''}>
                <td className="col-num"><span className="drag-handle">⋮⋮</span><span className="seq-badge">{idx + 1}</span></td>
                <td className="col-check"><input type="checkbox" className="book-done" checked={item.done} onChange={() => onToggle(item)} /></td>
                <td className="col-title">{item.icon} {item.name}</td>
                <td className="col-del"><DeleteButton onConfirm={() => onDelete(item)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mama-add-row">
        <input placeholder="Название профессии" value={name} onChange={e => setName(e.target.value)} />
        <button className="btn btn-sm btn-primary" type="button" onClick={() => { if (!name.trim()) return; onAdd(name.trim()); setName(''); }}>+</button>
      </div>
    </div>
  );
}

export default function CareerTab({ ownerId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadedOnceRef = useRef(false);
  const load = useCallback(async () => {
    if (!loadedOnceRef.current) setLoading(true);
    setError(null);
    try { setItems(await api.getCareerGoals(ownerId)); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); loadedOnceRef.current = true; }
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
  const reorder = async (ids) => { await api.reorderCareerGoals(ownerId, ids); load(); };

  return (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
      <CareerSection title="💼 Основная работа" items={main} onToggle={toggle} onDelete={remove} onAdd={n => add('main', n)} onReorder={reorder} />
      <CareerSection title="🧩 Подработка" items={side} onToggle={toggle} onDelete={remove} onAdd={n => add('side', n)} onReorder={reorder} />
    </div>
  );
}
