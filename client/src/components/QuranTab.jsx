import { useEffect, useState, useCallback, useRef } from 'react';
import { api } from '../api.js';
import QuranBeadsTracker from './ui/QuranBeadsTracker.jsx';

const STATUS_LABEL = { todo: 'Не начато', learning: 'Учу сейчас', done: 'Выучено' };
const STATUS_EMOJI = { todo: '', learning: '📖 ', done: '✅ ' };
const FILTERS = [['all', 'Все'], ['todo', 'Не начато'], ['learning', 'Учу'], ['done', 'Выучено']];

// Number of days between two ISO date strings, or null if either is missing.
function daysBetween(start, end) {
  if (!start || !end) return null;
  const ms = new Date(end) - new Date(start);
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
}

export default function QuranTab({ ownerId }) {
  const [surahs, setSurahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  const loadedOnceRef = useRef(false);
  const load = useCallback(async () => {
    if (!loadedOnceRef.current) setLoading(true);
    setError(null);
    try {
      const s = await api.getSurahs(ownerId);
      setSurahs(s);
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

  const visibleSurahs = filter === 'all' ? surahs : surahs.filter(s => s.status === filter);

  const update = async (surah, patch) => {
    await api.updateSurah(ownerId, surah._id, patch);
    load();
  };

  return (
    <div>
      <QuranBeadsTracker surahs={surahs} />

      <div className="mama-controls">
        <label>Показать:</label>
        <div className="pace-pills">
          {FILTERS.map(([k, label]) => (
            <button
              key={k}
              type="button"
              className={`pace-pill${filter === k ? ' active' : ''}`}
              onClick={() => setFilter(k)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mama-table-wrap">
        <table className="mama-table">
          <thead>
            <tr>
              <th className="col-num">#</th>
              <th className="col-title">Сура</th>
              <th className="mobile-hide">Прочитана раз</th>
              <th className="mobile-hide">Страниц</th>
              <th>Статус</th>
              <th className="mobile-hide">Начало</th>
              <th className="mobile-hide">Дата готовности</th>
              <th>За сколько</th>
            </tr>
          </thead>
          <tbody>
            {visibleSurahs.length === 0 && <tr><td colSpan={8} className="empty-state">Ничего не найдено</td></tr>}
            {visibleSurahs.map(s => {
              const done = s.status === 'done';
              const daysTaken = daysBetween(s.learningStartDate, s.doneDate);
              return (
                <tr key={s._id} className={`qstatus-${s.status}`}>
                  <td className="col-num"><span className="seq-badge">{s.num}</span></td>
                  <td className="col-title">{STATUS_EMOJI[s.status]}{s.name}</td>
                  <td className="mobile-hide"><span className="read-count-badge">{s.readCount || 0}×</span></td>
                  <td className="mobile-hide">{s.pages}</td>
                  <td>
                    <select value={s.status} className={`qstatus-select qstatus-${s.status}`} onChange={e => update(s, { status: e.target.value })}>
                      {Object.entries(STATUS_LABEL).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
                    </select>
                  </td>
                  <td className="mobile-hide"><input type="date" value={s.learningStartDate || ''} disabled={done} onChange={e => update(s, { learningStartDate: e.target.value })} /></td>
                  <td className="mobile-hide"><input type="date" value={s.doneDate || ''} onChange={e => update(s, { doneDate: e.target.value })} /></td>
                  <td className="finish-cell">{daysTaken !== null ? `${daysTaken} дн.` : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
