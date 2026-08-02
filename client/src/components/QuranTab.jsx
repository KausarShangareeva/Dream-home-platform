import { useEffect, useState, useCallback } from 'react';
import { api } from '../api.js';

const STATUS_LABEL = { todo: 'Не начато', learning: 'Учу', done: 'Готово' };
const STATUS_EMOJI = { todo: '', learning: '📖 ', done: '✅ ' };

export default function QuranTab({ ownerId }) {
  const [surahs, setSurahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const s = await api.getSurahs(ownerId);
      setSurahs(s);
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

  const done = surahs.filter(s => s.status === 'done');
  const donePages = done.reduce((sum, s) => sum + s.pages, 0);
  const learning = surahs.filter(s => s.status === 'learning');

  const update = async (surah, patch) => {
    await api.updateSurah(ownerId, surah._id, patch);
    load();
  };

  return (
    <div>
      <div style={{ marginBottom: 14, fontSize: 13, fontWeight: 700 }}>
        Выучено: {done.length} / {surahs.length} сур ({donePages} из 604 страниц) · Учу сейчас: {learning.length}
      </div>

      <div className="mama-table-wrap">
        <table className="data-table">
          <thead><tr><th className="col-title">Сура</th><th>Страниц</th><th>Статус</th><th>Начало</th><th>Дата готовности</th></tr></thead>
          <tbody>
            {surahs.map(s => (
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
