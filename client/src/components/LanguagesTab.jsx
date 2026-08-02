import { useEffect, useState, useCallback } from 'react';
import { api } from '../api.js';
import DeleteButton from './ui/DeleteButton.jsx';
import Flag from './ui/Flag.jsx';
import {
  computeLangSchedule, bridgeCellText, fmtDate, STATUS_LABEL, STATUS_EMOJI, CEFR_LEVELS,
} from '../data/langSchedule.js';

export default function LanguagesTab({ ownerId }) {
  const [languages, setLanguages] = useState([]);
  const [settings, setSettings] = useState({ hoursPerDay: 2 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [langs, s] = await Promise.all([api.getLanguages(ownerId), api.getSettings(ownerId)]);
      setLanguages(langs); setSettings(s);
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

  const schedule = computeLangSchedule(languages, settings.hoursPerDay || 2);
  const rows = [...languages].sort((a, b) => schedule[a.key].start - schedule[b.key].start);

  const updateStatus = async (lang, status) => {
    await api.updateLanguage(ownerId, lang._id, { status });
    load();
  };
  const updateLevel = async (lang, level) => {
    await api.updateLanguage(ownerId, lang._id, { level });
    load();
  };
  const updateHoursPerDay = async (value) => {
    await api.updateSettings(ownerId, { hoursPerDay: Number(value) });
    load();
  };

  return (
    <div>
      <div className="form-row" style={{ marginTop: 0, marginBottom: 18, alignItems: 'flex-end' }}>
        <div className="field" style={{ maxWidth: 140 }}>
          <label>Часов в день</label>
          <input type="number" min="0.5" step="0.5" defaultValue={settings.hoursPerDay} onBlur={e => updateHoursPerDay(e.target.value)} />
        </div>
      </div>

      <div className="mama-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th className="col-title">Язык</th>
              <th>Через какой язык</th>
              <th>Уровень</th>
              <th>Часов</th>
              <th>Финиш</th>
              <th>Статус</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(lang => {
              const sc = schedule[lang.key];
              return (
                <tr key={lang._id}>
                  <td className="col-title">{STATUS_EMOJI[lang.status]}<Flag langKey={lang.key} /> {lang.name}</td>
                  <td>{bridgeCellText(lang, languages)}</td>
                  <td>
                    <select value={lang.level} onChange={e => updateLevel(lang, e.target.value)}>
                      {CEFR_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </td>
                  <td>{sc.hours.toLocaleString('ru-RU')} ч</td>
                  <td>{fmtDate(sc.finish)}</td>
                  <td>
                    <select value={lang.status} onChange={e => updateStatus(lang, e.target.value)}>
                      {Object.entries(STATUS_LABEL).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
                    </select>
                  </td>
                  <td>
                    {lang.removable && (
                      <DeleteButton onConfirm={async () => { await api.deleteLanguage(ownerId, lang._id); load(); }} />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
