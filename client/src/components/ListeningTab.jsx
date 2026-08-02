import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { api } from '../api.js';
import DeleteButton from './ui/DeleteButton.jsx';
import LevelSelect from './ui/LevelSelect.jsx';
import Flag from './ui/Flag.jsx';
import ListeningLevelTracker from './ui/ListeningLevelTracker.jsx';
import ListeningSessionsModal from './ListeningSessionsModal.jsx';
import { TYPE_LABEL, THEME_LABEL } from '../data/listeningLabels.js';
import { useDragReorder } from '../hooks/useDragReorder.js';

const STATUS_LABEL = { todo: 'В планах', learning: 'Слушаю', done: 'Прослушано' };
const STATUS_EMOJI = { todo: '', learning: '⏳ ', done: '✅ ' };

export default function ListeningTab({ ownerId }) {
  const [items, setItems] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [sessionsModalId, setSessionsModalId] = useState(null);

  const [newTitle, setNewTitle] = useState('');
  const [newLang, setNewLang] = useState('');
  const [newType, setNewType] = useState('');
  const [newTheme, setNewTheme] = useState('');
  const [newDifficulty, setNewDifficulty] = useState('B1');
  const [newLink, setNewLink] = useState('');

  const loadedOnceRef = useRef(false);
  const load = useCallback(async () => {
    if (!loadedOnceRef.current) setLoading(true);
    setError(null);
    try {
      const [i, langs] = await Promise.all([api.getListeningItems(ownerId), api.getLanguages(ownerId)]);
      setItems(i); setLanguages(langs);
      setSelectedLanguage(prev => prev || langs[0]?.name || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      loadedOnceRef.current = true;
    }
  }, [ownerId]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (selectedLanguage) setNewLang(selectedLanguage); }, [selectedLanguage]);

  const itemsForLanguage = useMemo(
    () => items.filter(i => i.language === selectedLanguage),
    [items, selectedLanguage]
  );
  const { ordered, getRowProps } = useDragReorder(itemsForLanguage, async (ids) => {
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
    if (!newTitle.trim()) return alert('Впишите название');
    await api.addListeningItem(ownerId, {
      title: newTitle.trim(), language: newLang, type: newType || null, theme: newTheme || null,
      difficulty: newDifficulty, link: newLink.trim(),
    });
    setNewTitle(''); setNewLink('');
    load();
  };

  const totalsByLanguage = {};
  languages.forEach(l => { totalsByLanguage[l.name] = 0; });
  items.forEach(i => { totalsByLanguage[i.language] = (totalsByLanguage[i.language] || 0) + i.hours; });
  const grandTotal = items.reduce((sum, i) => sum + i.hours, 0);

  const sessionsModalItem = items.find(i => i._id === sessionsModalId) || null;

  return (
    <div>
      <div className="listening-lang-overview">
        <div className="listening-lang-total">Всего: <b>{grandTotal} ч</b></div>
        <div className="listening-lang-chips">
          {languages.map(l => (
            <button
              key={l.key}
              type="button"
              className={`listening-lang-chip${selectedLanguage === l.name ? ' active' : ''}`}
              onClick={() => setSelectedLanguage(l.name)}
            >
              <Flag langKey={l.key} /> {l.name} <b>{totalsByLanguage[l.name] || 0} ч</b>
            </button>
          ))}
        </div>
      </div>

      <ListeningLevelTracker items={itemsForLanguage} language={selectedLanguage} />

      <div className="mama-table-wrap" style={{ marginTop: 18 }}>
        <table className="mama-table">
          <thead>
            <tr>
              <th className="col-num">#</th>
              <th className="col-title">Название</th>
              <th className="mobile-hide">Тип</th>
              <th className="mobile-hide">Тематика</th>
              <th>Сложность</th>
              <th>Часов</th>
              <th className="mobile-hide">🔗</th>
              <th>Статус</th>
              <th className="col-del"></th>
            </tr>
          </thead>
          <tbody>
            {ordered.length === 0 && <tr><td colSpan={9} className="empty-state">Пока пусто для этого языка — добавьте ниже</td></tr>}
            {ordered.map((item, idx) => (
              <tr key={item._id} {...getRowProps(item)} className={`qstatus-${item.status}`}>
                <td className="col-num"><span className="drag-handle">⋮⋮</span><span className="seq-badge">{idx + 1}</span></td>
                <td className="col-title">
                  <button type="button" className="listening-title-btn" onClick={() => setSessionsModalId(item._id)}>
                    <b>{STATUS_EMOJI[item.status]}{item.title}</b>
                  </button>
                  {item.sessions.length > 0 && (
                    <span className="bridge-note">{item.sessions.filter(s => s.done).length}/{item.sessions.length} эпизодов</span>
                  )}
                </td>
                <td className="mobile-hide">
                  <select value={item.type || ''} onChange={e => update(item, { type: e.target.value || null })}>
                    <option value="">—</option>
                    {Object.entries(TYPE_LABEL).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
                  </select>
                </td>
                <td className="mobile-hide">
                  <select value={item.theme || ''} onChange={e => update(item, { theme: e.target.value || null })}>
                    <option value="">—</option>
                    {Object.entries(THEME_LABEL).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
                  </select>
                </td>
                <td><LevelSelect value={item.difficulty} onChange={val => update(item, { difficulty: val })} allowNone /></td>
                <td className="finish-cell">{item.hours} ч</td>
                <td className="mobile-hide">
                  {item.link ? <a href={item.link} target="_blank" rel="noreferrer" title={item.link}>🔗</a> : '—'}
                </td>
                <td>
                  <select value={item.status} className={`qstatus-select qstatus-${item.status}`} onChange={e => update(item, { status: e.target.value })}>
                    {Object.entries(STATUS_LABEL).map(([k, label]) => <option key={k} value={k}>{STATUS_EMOJI[k]}{label}</option>)}
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
          <input placeholder="Название" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
          <select value={newType} onChange={e => setNewType(e.target.value)}>
            <option value="">Тип...</option>
            {Object.entries(TYPE_LABEL).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
          </select>
          <select value={newTheme} onChange={e => setNewTheme(e.target.value)}>
            <option value="">Тематика...</option>
            {Object.entries(THEME_LABEL).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
          </select>
          <LevelSelect value={newDifficulty} onChange={setNewDifficulty} />
          <input placeholder="Ссылка (необязательно)" value={newLink} onChange={e => setNewLink(e.target.value)} />
          <button className="btn btn-sm btn-primary" onClick={addItem} type="button">+ Добавить</button>
        </div>
      </div>

      {sessionsModalItem && (
        <ListeningSessionsModal
          ownerId={ownerId}
          item={sessionsModalItem}
          onClose={() => setSessionsModalId(null)}
          onChange={load}
        />
      )}
    </div>
  );
}
