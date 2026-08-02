import { useEffect, useState, useCallback } from 'react';
import { api } from '../api.js';
import DeleteButton from './ui/DeleteButton.jsx';

const STATUS_LABEL = { todo: 'Не начато', learning: 'Изучаю', done: 'Готово' };

function StudySection({ title, items, onUpdate, onDelete, onAdd }) {
  const [name, setName] = useState('');
  const [hours, setHours] = useState('');

  return (
    <div style={{ flex: 1, minWidth: 260 }}>
      <div style={{ fontWeight: 700, marginBottom: 10 }}>{title}</div>
      <div className="mama-table-wrap">
        <table className="data-table">
          <thead><tr><th className="col-title">Название</th><th>Часов</th><th>Статус</th><th></th></tr></thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={4} className="empty-state">Пусто</td></tr>}
            {items.map(item => (
              <tr key={item._id}>
                <td className="col-title">
                  {item.icon} {item.url ? <a href={item.url} target="_blank" rel="noopener noreferrer">{item.name}</a> : item.name}
                  {item.platform && <span style={{ display: 'block', fontSize: 10.5, color: 'var(--ink-soft)' }}>{item.platform}</span>}
                </td>
                <td>{item.approx ? '≈' : ''}{item.hours} ч</td>
                <td>
                  <select value={item.status} onChange={e => onUpdate(item, { status: e.target.value })}>
                    {Object.entries(STATUS_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                  </select>
                </td>
                <td><DeleteButton onConfirm={() => onDelete(item)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="form-row" style={{ marginTop: 10 }}>
        <div className="field"><input placeholder="Название" value={name} onChange={e => setName(e.target.value)} /></div>
        <div className="field" style={{ maxWidth: 80 }}><input type="number" min="0" step="0.5" placeholder="Часов" value={hours} onChange={e => setHours(e.target.value)} /></div>
        <button className="btn btn-sm btn-primary" type="button" onClick={() => { if (!name.trim()) return; onAdd({ name: name.trim(), hours: Number(hours) || 0 }); setName(''); setHours(''); }}>+</button>
      </div>
    </div>
  );
}

export default function StudyTab({ ownerId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setItems(await api.getStudyItems(ownerId)); }
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

  const subjects = items.filter(i => i.category === 'subject');
  const hobbies = items.filter(i => i.category === 'hobby');

  const update = async (item, patch) => { await api.updateStudyItem(ownerId, item._id, patch); load(); };
  const remove = async (item) => { await api.deleteStudyItem(ownerId, item._id); load(); };
  const add = async (category, data) => { await api.addStudyItem(ownerId, { category, ...data }); load(); };

  return (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
      <StudySection title="📚 Дисциплины" items={subjects} onUpdate={update} onDelete={remove} onAdd={d => add('subject', d)} />
      <StudySection title="🎨 Хобби" items={hobbies} onUpdate={update} onDelete={remove} onAdd={d => add('hobby', d)} />
    </div>
  );
}
