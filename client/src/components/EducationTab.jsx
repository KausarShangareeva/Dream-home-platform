import { useEffect, useState, useCallback } from 'react';
import { api } from '../api.js';
import DeleteButton from './ui/DeleteButton.jsx';

export default function EducationTab({ ownerId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [faculty, setFaculty] = useState('');
  const [university, setUniversity] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setItems(await api.getEducation(ownerId)); }
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

  const toggleDone = async (item) => { await api.updateEducation(ownerId, item._id, { done: !item.done }); load(); };
  const remove = async (item) => { await api.deleteEducation(ownerId, item._id); load(); };
  const add = async () => {
    if (!faculty.trim()) return alert('Впишите программу/факультет');
    await api.addEducation(ownerId, { faculty: faculty.trim(), university: university.trim() });
    setFaculty(''); setUniversity(''); load();
  };

  return (
    <div>
      <div className="mama-table-wrap">
        <table className="data-table">
          <thead><tr><th>✓</th><th className="col-title">Программа</th><th></th></tr></thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={3} className="empty-state">Пока пусто — добавьте программу, которую рассматриваете</td></tr>}
            {items.map(item => (
              <tr key={item._id}>
                <td><input type="checkbox" checked={item.done} onChange={() => toggleDone(item)} /></td>
                <td className="col-title">
                  <b>{item.faculty}</b>
                  {item.university && <span style={{ display: 'block', fontSize: 11, color: 'var(--ink-soft)' }}>{item.university}</span>}
                </td>
                <td><DeleteButton onConfirm={() => remove(item)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="form-row">
        <div className="field"><label>Программа/факультет</label><input value={faculty} onChange={e => setFaculty(e.target.value)} /></div>
        <div className="field"><label>Университет</label><input value={university} onChange={e => setUniversity(e.target.value)} /></div>
        <div className="field" style={{ justifyContent: 'flex-end' }}>
          <button className="btn btn-sm btn-primary" type="button" onClick={add}>+ Добавить</button>
        </div>
      </div>
    </div>
  );
}
