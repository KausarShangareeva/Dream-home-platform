import { useEffect, useState, useCallback, useRef } from 'react';
import { api } from '../api.js';
import DeleteButton from './ui/DeleteButton.jsx';
import LevelSelect from './ui/LevelSelect.jsx';
import ListeningLevelTracker from './ui/ListeningLevelTracker.jsx';
import { KNOWN_READING_LANGUAGES } from '../data/readingLanguages.js';
import { useDragReorder } from '../hooks/useDragReorder.js';

const STATUS_LABEL = { todo: 'В планах', learning: 'Слушаю', done: 'Прослушано' };

export default function ListeningTab({ ownerId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [newLang, setNewLang] = useState(KNOWN_READING_LANGUAGES[0].name);
  const [newDifficulty, setNewDifficulty] = useState('B1');
  const [newHours, setNewHours] = useState('');

  const loadedOnceRef = useRef(false);
  const load = useCallback(async () => {
    if (!loadedOnceRef.current) setLoading(true);
    setError(null);
    try {
      setItems(await api.getListeningItems(ownerId));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      loadedOnceRef.current = true;
    }
  }, [ownerId]);

  useEffect(() => { load(); }, [load]);

  const { ordered, getRowProps } = useDragReorder(items, async (ids) => {
    await api.reorderListeningItems(ownerId, ids);
    load();
  });

  if (loading) return <div className="empty-state">Загрузка…</div>;
  if (error) return (
    <div className="empty-state">
      Не удалось загрузить данные: {error}
      <div style={{ marginTop: 10 }}><button className="btn btn-sm btn-ghost" onClick={load}>Повторить</button></div>
    </div>
  );

  const update = async (item, patch) => {
    try {
      await api.updateListeningItem(ownerId, item._id, patch);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const addItem = async () => {
    if (!newTitle.trim() || !newHours) return alert('Впишите название и число часов');
    await api.addListeningItem(ownerId, { title: newTitle.trim(), language: newLang, difficulty: newDifficulty, hours: Number(newHours) });
    setNewTitle(''); setNewHours('');
    load();
  };

  return (
    <div>
      <ListeningLevelTracker items={items} />

      <div className="mama-table-wrap" style={{ marginTop: 18 }}>
        <table className="mama-table">
          <thead>
            <tr>
              <th className="col-num">#</th>
              <th className="col-title">Название</th>
              <th className="mobile-hide">Язык</th>
              <th>Сложность</th>
              <th>Часов</th>
              <th>Статус</th>
              <th className="col-del"></th>
            </tr>
          </thead>
          <tbody>
            {ordered.length === 0 && <tr><td colSpan={6} className="empty-state">Пока пусто — добавьте аудиокнигу, подкаст или канал ниже</td></tr>}
            {ordered.map((item, idx) => (
              <tr key={item._id} {...getRowProps(item)} className={`qstatus-${item.status}`}>
                <td className="col-num"><span className="drag-handle">⋮⋮</span><span className="seq-badge">{idx + 1}</span></td>
                <td className="col-title"><b>{item.title}</b></td>
                <td className="mobile-hide">
                  <select value={item.language || KNOWN_READING_LANGUAGES[0].name} onChange={e => update(item, { language: e.target.value })}>
                    {KNOWN_READING_LANGUAGES.map(l => <option key={l.name} value={l.name}>{l.flag} {l.name}</option>)}
                  </select>
                </td>
                <td><LevelSelect value={item.difficulty} onChange={val => update(item, { difficulty: val })} allowNone /></td>
                <td>
                  <input
                    type="number" min="1" style={{ maxWidth: 70 }} value={item.hours}
                    onChange={e => update(item, { hours: Number(e.target.value) })}
                  /> ч
                </td>
                <td>
                  <select
                    value={item.status}
                    className={`qstatus-select qstatus-${item.status}`}
                    onChange={e => update(item, { status: e.target.value, doneDate: e.target.value === 'done' ? new Date().toISOString().slice(0, 10) : null })}
                  >
                    {Object.entries(STATUS_LABEL).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
                  </select>
                </td>
                <td className="col-del"><DeleteButton onConfirm={async () => { await api.deleteListeningItem(ownerId, item._id); load(); }} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mama-add-book-block">
        <div className="mama-strip-title" style={{ margin: '0 0 12px' }}>Добавить аудиокнигу / подкаст / канал</div>
        <div className="mama-add-row">
          <input placeholder="Название (напр. BBC Learning English)" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
          <select value={newLang} onChange={e => setNewLang(e.target.value)} style={{ maxWidth: 150 }}>
            {KNOWN_READING_LANGUAGES.map(l => <option key={l.name} value={l.name}>{l.flag} {l.name}</option>)}
          </select>
          <LevelSelect value={newDifficulty} onChange={setNewDifficulty} />
          <input type="number" min="1" placeholder="Часов" style={{ maxWidth: 90 }} value={newHours} onChange={e => setNewHours(e.target.value)} />
          <button className="btn btn-sm btn-primary" onClick={addItem} type="button">+ Добавить</button>
        </div>
      </div>
    </div>
  );
}
