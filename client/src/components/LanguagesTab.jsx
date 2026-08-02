import { useEffect, useState, useCallback, useRef } from 'react';
import { api } from '../api.js';
import DeleteButton from './ui/DeleteButton.jsx';
import Flag from './ui/Flag.jsx';
import LevelSelect from './ui/LevelSelect.jsx';
import { LANGUAGE_CATALOG } from '../data/languageCatalog.js';
import { useDragReorder } from '../hooks/useDragReorder.js';
import {
  computeLangSchedule, bridgeCellText, fmtDate, STATUS_LABEL, STATUS_EMOJI,
} from '../data/langSchedule.js';

export default function LanguagesTab({ ownerId }) {
  const [languages, setLanguages] = useState([]);
  const [settings, setSettings] = useState({ hoursPerDay: 2 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [catalogPick, setCatalogPick] = useState('');
  const [customName, setCustomName] = useState('');

  const loadedOnceRef = useRef(false);
  const load = useCallback(async () => {
    if (!loadedOnceRef.current) setLoading(true);
    setError(null);
    try {
      const [langs, s] = await Promise.all([api.getLanguages(ownerId), api.getSettings(ownerId)]);
      setLanguages(langs); setSettings(s);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      loadedOnceRef.current = true;
    }
  }, [ownerId]);

  useEffect(() => { load(); }, [load]);

  const { ordered, getRowProps } = useDragReorder(languages, async (ids) => {
    await api.reorderLanguages(ownerId, ids);
    load();
  });

  if (loading) return <div className="empty-state">Загрузка…</div>;
  if (error) return (
    <div className="empty-state">
      Не удалось загрузить данные: {error}
      <div style={{ marginTop: 10 }}><button className="btn btn-sm btn-ghost" onClick={load}>Повторить</button></div>
    </div>
  );

  const schedule = computeLangSchedule(languages, settings.hoursPerDay || 2);
  // Row order: soonest-starting first (matches the drag order once the user has customized it,
  // but we still sort by the persisted `order` field via useDragReorder's `ordered` list).
  const rows = ordered.filter(l => schedule[l.key]);

  const updateStatus = async (lang, status) => { await api.updateLanguage(ownerId, lang._id, { status }); load(); };
  const updateLevel = async (lang, level) => { await api.updateLanguage(ownerId, lang._id, { level }); load(); };
  const updateHoursPerDay = async (value) => { await api.updateSettings(ownerId, { hoursPerDay: Number(value) }); load(); };

  const haveKeys = languages.map(l => l.key);
  const catalogOptions = Object.entries(LANGUAGE_CATALOG).filter(([k]) => !haveKeys.includes(k));

  const addLanguage = async () => {
    if (catalogPick === '__custom') {
      if (!customName.trim()) return alert('Впишите название языка');
      await api.addLanguage(ownerId, { name: customName.trim(), flag: '🌍', level: 'B1', diff: 1.3, note: 'сложность оценена ориентировочно' });
      setCustomName('');
    } else if (catalogPick) {
      const cat = LANGUAGE_CATALOG[catalogPick];
      await api.addLanguage(ownerId, { key: catalogPick, name: cat.name, flag: cat.flag, level: 'B1', diff: cat.diff });
    } else {
      return;
    }
    setCatalogPick('');
    load();
  };

  return (
    <div>
      <div className="form-row" style={{ marginTop: 0, marginBottom: 18, alignItems: 'flex-end' }}>
        <div className="field" style={{ maxWidth: 140 }}>
          <label>Часов в день</label>
          <select value={settings.hoursPerDay || 2} onChange={e => updateHoursPerDay(e.target.value)}>
            {[1, 2, 3, 4, 5, 6, 7].map(h => <option key={h} value={h}>{h} ч</option>)}
          </select>
        </div>
      </div>

      <div className="mama-table-wrap">
        <table className="mama-table">
          <thead>
            <tr>
              <th className="col-num">#</th>
              <th className="col-title">Язык</th>
              <th className="mobile-hide">Через какой язык</th>
              <th>Уровень</th>
              <th className="mobile-hide">Часов</th>
              <th className="mobile-hide">Месяцев</th>
              <th className="mobile-hide">Старт</th>
              <th>Финиш</th>
              <th>Статус</th>
              <th className="col-del"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((lang, idx) => {
              const sc = schedule[lang.key];
              return (
                <tr key={lang._id} {...getRowProps(lang)} className={`qstatus-${lang.status}`}>
                  <td className="col-num"><span className="drag-handle">⋮⋮</span><span className="seq-badge">{idx + 1}</span></td>
                  <td className="col-title">{STATUS_EMOJI[lang.status]}<Flag langKey={lang.key} /> {lang.name}</td>
                  <td className="mobile-hide">{bridgeCellText(lang, languages)}</td>
                  <td>
                    <LevelSelect value={lang.level} onChange={val => updateLevel(lang, val)} />
                  </td>
                  <td className="mobile-hide">{sc.hours.toLocaleString('ru-RU')} ч</td>
                  <td className="mobile-hide">{sc.months < 1 ? '<1' : sc.months.toFixed(1)} мес</td>
                  <td className="mobile-hide">{fmtDate(sc.start)}</td>
                  <td className="finish-cell">{fmtDate(sc.finish)}</td>
                  <td>
                    <select value={lang.status} onChange={e => updateStatus(lang, e.target.value)} className={`qstatus-select qstatus-${lang.status}`}>
                      {Object.entries(STATUS_LABEL).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
                    </select>
                  </td>
                  <td className="col-del">
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

      <div className="form-row" style={{ marginTop: 16 }}>
        <div className="field">
          <label>Добавить язык</label>
          <select value={catalogPick} onChange={e => setCatalogPick(e.target.value)}>
            <option value="">Выберите язык…</option>
            {catalogOptions.map(([k, c]) => <option key={k} value={k}>{c.flag} {c.name}</option>)}
            <option value="__custom">✏️ Свой язык...</option>
          </select>
        </div>
        {catalogPick === '__custom' && (
          <div className="field">
            <label>Название языка</label>
            <input value={customName} onChange={e => setCustomName(e.target.value)} placeholder="Например, Суахили" />
          </div>
        )}
        <div className="field" style={{ justifyContent: 'flex-end' }}>
          <button className="btn btn-sm btn-primary" type="button" onClick={addLanguage}>+ Добавить</button>
        </div>
      </div>
    </div>
  );
}
