import { useEffect, useState, useCallback } from 'react';
import { api } from '../api.js';
import DeleteButton from './ui/DeleteButton.jsx';

const STATUS_LABEL = { todo: 'Не начато', learning: 'Изучаю', done: 'Готово' };

function EducationSection({ items, onToggle, onDelete, onAdd }) {
  const [faculty, setFaculty] = useState('');
  const [university, setUniversity] = useState('');

  return (
    <div style={{ marginBottom: 26 }}>
      <div style={{ fontWeight: 700, marginBottom: 10 }}>🎓 Высшее образование</div>
      <div className="mama-table-wrap">
        <table className="mama-table">
          <thead><tr><th>✓</th><th className="col-title">Программа</th><th></th></tr></thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={3} className="empty-state">Пока пусто — добавьте программу, которую рассматриваете</td></tr>}
            {items.map(item => (
              <tr key={item._id}>
                <td><input type="checkbox" checked={item.done} onChange={() => onToggle(item)} /></td>
                <td className="col-title">
                  <b>{item.faculty}</b>
                  {item.university && <span style={{ display: 'block', fontSize: 11, color: 'var(--ink-soft)' }}>{item.university}</span>}
                </td>
                <td><DeleteButton onConfirm={() => onDelete(item)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="form-row" style={{ marginTop: 10 }}>
        <div className="field"><input placeholder="Факультет / программа" value={faculty} onChange={e => setFaculty(e.target.value)} /></div>
        <div className="field"><input placeholder="Университет" value={university} onChange={e => setUniversity(e.target.value)} /></div>
        <button
          className="btn btn-sm btn-primary" type="button"
          onClick={() => { if (!faculty.trim()) return; onAdd({ faculty: faculty.trim(), university: university.trim() }); setFaculty(''); setUniversity(''); }}
        >+ Добавить</button>
      </div>
    </div>
  );
}

function StudySection({ title, items, onUpdate, onDelete, onAdd }) {
  const [name, setName] = useState('');
  const [hours, setHours] = useState('');

  return (
    <div style={{ flex: 1, minWidth: 260 }}>
      <div style={{ fontWeight: 700, marginBottom: 10 }}>{title}</div>
      <div className="mama-table-wrap">
        <table className="mama-table">
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
  const [education, setEducation] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [study, edu] = await Promise.all([api.getStudyItems(ownerId), api.getEducation(ownerId)]);
      setItems(study); setEducation(edu);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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

  const toggleEdu = async (item) => { await api.updateEducation(ownerId, item._id, { done: !item.done }); load(); };
  const removeEdu = async (item) => { await api.deleteEducation(ownerId, item._id); load(); };
  const addEdu = async (data) => { await api.addEducation(ownerId, data); load(); };

  return (
    <div>
      <EducationSection items={education} onToggle={toggleEdu} onDelete={removeEdu} onAdd={addEdu} />
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <StudySection title="📚 Учебные дисциплины" items={subjects} onUpdate={update} onDelete={remove} onAdd={d => add('subject', d)} />
        <StudySection title="🧶 Хобби" items={hobbies} onUpdate={update} onDelete={remove} onAdd={d => add('hobby', d)} />
      </div>
    </div>
  );
}
