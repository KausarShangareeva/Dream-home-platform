import { useEffect, useState, useCallback, useRef } from 'react';
import { api } from '../api.js';
import DeleteButton from './ui/DeleteButton.jsx';
import { useDragReorder } from '../hooks/useDragReorder.js';

const STATUS_LABEL = { todo: 'Не начато', learning: 'Изучаю', done: 'Готово' };
const EDU_LEVEL_LABEL = { todo: 'Не начато', applying: 'Подаю документы', studying: 'Учусь', done: 'Готово' };
const EXAM_STATUS_LABEL = { todo: 'Не начато', studying: 'Готовлюсь', done: 'Сдано' };

function ExamsSection({ items, onUpdate, onDelete, onAdd, onReorder }) {
  const [name, setName] = useState('');

  const { ordered, getRowProps } = useDragReorder(items, onReorder);

  return (
    <div style={{ marginBottom: 26 }}>
      <div style={{ fontWeight: 700, marginBottom: 10 }}>📝 Экзамены</div>
      <div className="mama-table-wrap">
        <table className="mama-table">
          <thead>
            <tr>
              <th className="col-num">#</th>
              <th className="col-title">Экзамен</th>
              <th>Целевой балл</th>
              <th className="mobile-hide">Уроки для подготовки</th>
              <th className="mobile-hide">Дата</th>
              <th>Статус</th>
              <th className="col-del"></th>
            </tr>
          </thead>
          <tbody>
            {ordered.length === 0 && <tr><td colSpan={7} className="empty-state">Пока пусто — добавьте экзамен, который планируете сдавать</td></tr>}
            {ordered.map((item, idx) => (
              <tr key={item._id} {...getRowProps(item)} className={`qstatus-${item.status}`}>
                <td className="col-num"><span className="drag-handle">⋮⋮</span><span className="seq-badge">{idx + 1}</span></td>
                <td className="col-title"><b>{item.name}</b></td>
                <td>
                  <input
                    placeholder="напр. 7.5" style={{ maxWidth: 90 }} defaultValue={item.targetScore || ''}
                    onBlur={e => onUpdate(item, { targetScore: e.target.value.trim() })}
                  />
                </td>
                <td className="mobile-hide">
                  <input
                    placeholder="какие курсы/уроки пройти" defaultValue={item.prepNotes || ''}
                    onBlur={e => onUpdate(item, { prepNotes: e.target.value.trim() })}
                  />
                </td>
                <td className="mobile-hide">
                  <input type="date" value={item.examDate || ''} onChange={e => onUpdate(item, { examDate: e.target.value })} />
                </td>
                <td>
                  <select value={item.status} className={`qstatus-select qstatus-${item.status}`} onChange={e => onUpdate(item, { status: e.target.value })}>
                    {Object.entries(EXAM_STATUS_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                  </select>
                </td>
                <td className="col-del"><DeleteButton onConfirm={() => onDelete(item)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mama-add-book-block">
        <div className="mama-strip-title" style={{ margin: '0 0 12px' }}>Добавить экзамен</div>
        <div className="mama-add-row">
          <input placeholder="Название (напр. IELTS)" value={name} onChange={e => setName(e.target.value)} />
          <button
            className="btn btn-sm btn-primary" type="button"
            onClick={() => { if (!name.trim()) return; onAdd({ name: name.trim() }); setName(''); }}
          >+ Добавить</button>
        </div>
      </div>
    </div>
  );
}

function EducationSection({ items, onToggle, onUpdate, onDelete, onAdd, onReorder }) {
  const [faculty, setFaculty] = useState('');
  const [university, setUniversity] = useState('');
  const [language, setLanguage] = useState('');
  const [years, setYears] = useState('');
  const [url, setUrl] = useState('');

  const { ordered, getRowProps } = useDragReorder(items, onReorder);

  return (
    <div style={{ marginBottom: 26 }}>
      <div style={{ fontWeight: 700, marginBottom: 10 }}>🎓 Высшее образование</div>
      <div className="mama-table-wrap">
        <table className="mama-table">
          <thead>
            <tr>
              <th className="col-num">#</th>
              <th className="col-check">✓</th>
              <th className="col-title">Программа</th>
              <th>Уровень</th>
              <th className="mobile-hide">🔗</th>
              <th className="col-del"></th>
            </tr>
          </thead>
          <tbody>
            {ordered.length === 0 && <tr><td colSpan={6} className="empty-state">Пока пусто — добавьте программу, которую рассматриваете</td></tr>}
            {ordered.map((item, idx) => (
              <tr key={item._id} {...getRowProps(item)} className={item.done ? 'book-row-done' : ''}>
                <td className="col-num"><span className="drag-handle">⋮⋮</span><span className="seq-badge">{idx + 1}</span></td>
                <td className="col-check"><input type="checkbox" className="book-done" checked={item.done} onChange={() => onToggle(item)} /></td>
                <td className="col-title">
                  <b>{item.faculty}</b>
                  {(item.university || item.language || item.years) && (
                    <span className="bridge-note">
                      {[item.university, item.language, item.years ? `${item.years} лет` : null].filter(Boolean).join(' · ')}
                    </span>
                  )}
                </td>
                <td>
                  <select value={item.level || 'todo'} className={`qstatus-select qstatus-${item.level === 'done' ? 'done' : item.level === 'studying' ? 'learning' : 'todo'}`} onChange={e => onUpdate(item, { level: e.target.value })}>
                    {Object.entries(EDU_LEVEL_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                  </select>
                </td>
                <td className="mobile-hide">{item.url ? <a href={item.url} target="_blank" rel="noopener noreferrer" title={item.url}>🔗</a> : '—'}</td>
                <td className="col-del"><DeleteButton onConfirm={() => onDelete(item)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mama-add-book-block">
        <div className="mama-strip-title" style={{ margin: '0 0 12px' }}>Добавить высшее образование</div>
        <div className="mama-add-row">
          <input placeholder="Факультет / программа" value={faculty} onChange={e => setFaculty(e.target.value)} />
          <input placeholder="Университет" value={university} onChange={e => setUniversity(e.target.value)} />
          <input placeholder="Язык обучения" value={language} onChange={e => setLanguage(e.target.value)} style={{ maxWidth: 130 }} />
          <input type="number" min="0" placeholder="Лет" value={years} onChange={e => setYears(e.target.value)} style={{ maxWidth: 70 }} />
          <input placeholder="Ссылка на университет" value={url} onChange={e => setUrl(e.target.value)} style={{ maxWidth: 180 }} />
          <button
            className="btn btn-sm btn-primary" type="button"
            onClick={() => {
              if (!faculty.trim()) return;
              onAdd({ faculty: faculty.trim(), university: university.trim(), language: language.trim(), years: Number(years) || 0, url: url.trim() });
              setFaculty(''); setUniversity(''); setLanguage(''); setYears(''); setUrl('');
            }}
          >+ Добавить</button>
        </div>
      </div>
    </div>
  );
}

function StudySection({ title, addLabel, items, onUpdate, onDelete, onAdd, onReorder }) {
  const [name, setName] = useState('');
  const [hours, setHours] = useState('');
  const [url, setUrl] = useState('');

  const { ordered, getRowProps } = useDragReorder(items, onReorder);

  return (
    <div className="mama-col">
      <div style={{ fontWeight: 700, marginBottom: 10 }}>{title}</div>
      <div className="mama-table-wrap">
        <table className="mama-table">
          <thead>
            <tr>
              <th className="col-num">#</th>
              <th className="col-title">Название</th>
              <th>Часов</th>
              <th className="mobile-hide">🔗</th>
              <th>Статус</th>
              <th className="col-del"></th>
            </tr>
          </thead>
          <tbody>
            {ordered.length === 0 && <tr><td colSpan={6} className="empty-state">Пусто</td></tr>}
            {ordered.map((item, idx) => (
              <tr key={item._id} {...getRowProps(item)} className={`qstatus-${item.status}`}>
                <td className="col-num"><span className="drag-handle">⋮⋮</span><span className="seq-badge">{idx + 1}</span></td>
                <td className="col-title">
                  {item.icon} {item.url ? <a href={item.url} target="_blank" rel="noopener noreferrer">{item.name}</a> : item.name}
                  {item.platform && <span className="bridge-note">{item.platform}</span>}
                </td>
                <td>{item.approx ? '≈' : ''}{item.hours} ч</td>
                <td className="mobile-hide">
                  <input
                    type="url" placeholder="ссылка" defaultValue={item.url || ''}
                    onBlur={e => onUpdate(item, { url: e.target.value.trim() })}
                  />
                </td>
                <td>
                  <select value={item.status} className={`qstatus-select qstatus-${item.status}`} onChange={e => onUpdate(item, { status: e.target.value })}>
                    {Object.entries(STATUS_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                  </select>
                </td>
                <td className="col-del"><DeleteButton onConfirm={() => onDelete(item)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mama-add-book-block">
        <div className="mama-strip-title" style={{ margin: '0 0 12px' }}>{addLabel}</div>
        <div className="mama-add-row">
          <input placeholder="Название" value={name} onChange={e => setName(e.target.value)} />
          <input type="number" min="0" step="0.5" placeholder="Часов" style={{ maxWidth: 80 }} value={hours} onChange={e => setHours(e.target.value)} />
          <input placeholder="Ссылка (необязательно)" value={url} onChange={e => setUrl(e.target.value)} />
          <button
            className="btn btn-sm btn-primary" type="button"
            onClick={() => {
              if (!name.trim()) return;
              onAdd({ name: name.trim(), hours: Number(hours) || 0, url: url.trim() });
              setName(''); setHours(''); setUrl('');
            }}
          >+ Добавить</button>
        </div>
      </div>
    </div>
  );
}

export default function StudyTab({ ownerId }) {
  const [items, setItems] = useState([]);
  const [education, setEducation] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadedOnceRef = useRef(false);
  const load = useCallback(async () => {
    if (!loadedOnceRef.current) setLoading(true);
    setError(null);
    try {
      const [study, edu, examGoals] = await Promise.all([api.getStudyItems(ownerId), api.getEducation(ownerId), api.getExamGoals(ownerId)]);
      setItems(study); setEducation(edu); setExams(examGoals);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      loadedOnceRef.current = true;
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
  const reorderStudy = async (ids) => { await api.reorderStudyItems(ownerId, ids); load(); };

  const toggleEdu = async (item) => { await api.updateEducation(ownerId, item._id, { done: !item.done }); load(); };
  const updateEdu = async (item, patch) => { await api.updateEducation(ownerId, item._id, patch); load(); };
  const removeEdu = async (item) => { await api.deleteEducation(ownerId, item._id); load(); };
  const addEdu = async (data) => { await api.addEducation(ownerId, data); load(); };
  const reorderEdu = async (ids) => { await api.reorderEducation(ownerId, ids); load(); };

  const updateExam = async (item, patch) => { await api.updateExamGoal(ownerId, item._id, patch); load(); };
  const removeExam = async (item) => { await api.deleteExamGoal(ownerId, item._id); load(); };
  const addExam = async (data) => { await api.addExamGoal(ownerId, data); load(); };
  const reorderExam = async (ids) => { await api.reorderExamGoals(ownerId, ids); load(); };

  return (
    <div>
      <EducationSection items={education} onToggle={toggleEdu} onUpdate={updateEdu} onDelete={removeEdu} onAdd={addEdu} onReorder={reorderEdu} />
      <ExamsSection items={exams} onUpdate={updateExam} onDelete={removeExam} onAdd={addExam} onReorder={reorderExam} />
      <div className="mama-two-col">
        <StudySection title="📚 Учебные дисциплины" addLabel="Добавить дисциплину" items={subjects} onUpdate={update} onDelete={remove} onAdd={d => add('subject', d)} onReorder={reorderStudy} />
        <StudySection title="🧶 Хобби" addLabel="Добавить хобби" items={hobbies} onUpdate={update} onDelete={remove} onAdd={d => add('hobby', d)} onReorder={reorderStudy} />
      </div>
    </div>
  );
}
