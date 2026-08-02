import { useEffect, useState, useCallback } from 'react';
import { api } from '../api.js';

const STATUS_LABEL = { todo: 'Не начато', learning: 'Учу', done: 'Готово' };
const STATUS_EMOJI = { todo: '', learning: '📖 ', done: '✅ ' };

export default function QuranTab({ ownerId }) {
  const [surahs, setSurahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const load = useCallback(async () => {
    const s = await api.getSurahs(ownerId);
    setSurahs(s); setLoading(false);
  }, [ownerId]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="empty-state">Загрузка…</div>;

  const done = surahs.filter(s => s.status === 'done');
  const donePages = done.reduce((sum, s) => sum + s.pages, 0);
  const learning = surahs.filter(s => s.status === 'learning');

  const update = async (surah, patch) => {
    await api.updateSurah(ownerId, surah._id, patch);
    load();
  };

  // By default show only surahs already in progress or done, plus the very next "todo" one —
  // 114 rows at once is a lot; "show all" reveals everything.
  const visibleSurahs = showAll
    ? surahs
    : surahs.filter(s => s.status !== 'todo').concat(surahs.find(s => s.status === 'todo') ? [surahs.find(s => s.status === 'todo')] : []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>
          Выучено: {done.length} / 114 сур ({donePages} из 604 страниц) · Учу сейчас: {learning.length}
        </div>
        <button className="btn btn-sm btn-ghost" onClick={() => setShowAll(v => !v)}>
          {showAll ? 'Свернуть' : 'Показать все 114 сур'}
        </button>
      </div>

      <div className="mama-table-wrap">
        <table className="data-table">
          <thead><tr><th className="col-title">Сура</th><th>Страниц</th><th>Статус</th><th>Начало</th><th>Дата готовности</th></tr></thead>
          <tbody>
            {visibleSurahs.map(s => (
              <tr key={s._id}>
                <td className="col-title">{STATUS_EMOJI[s.status]}{s.num}. {s.name}</td>
                <td>{s.pages}</td>
                <td>
                  <select value={s.status} onChange={e => update(s, { status: e.target.value })}>
                    {Object.entries(STATUS_LABEL).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
                  </select>
                </td>
                <td><input type="date" value={s.learningStartDate || ''} onChange={e => update(s, { learningStartDate: e.target.value })} /></td>
                <td><input type="date" value={s.doneDate || ''} onChange={e => update(s, { doneDate: e.target.value })} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
