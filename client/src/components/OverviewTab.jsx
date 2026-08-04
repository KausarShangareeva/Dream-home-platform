import { useEffect, useState, useCallback, useRef } from 'react';
import { api } from '../api.js';

export default function OverviewTab({ ownerId }) {
  const [languages, setLanguages] = useState([]);
  const [books, setBooks] = useState([]);
  const [surahs, setSurahs] = useState([]);
  const [study, setStudy] = useState([]);
  const [education, setEducation] = useState([]);
  const [career, setCareer] = useState([]);
  const [listening, setListening] = useState([]);
  const [exams, setExams] = useState([]);
  const [settings, setSettings] = useState({ booksYearlyGoal: 100 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadedOnceRef = useRef(false);
  const load = useCallback(async () => {
    if (!loadedOnceRef.current) setLoading(true);
    setError(null);
    try {
      const [langs, b, s, surahs, study, education, career, listening, exams] = await Promise.all([
        api.getLanguages(ownerId), api.getBooks(ownerId), api.getSettings(ownerId), api.getSurahs(ownerId),
        api.getStudyItems(ownerId), api.getEducation(ownerId), api.getCareerGoals(ownerId),
        api.getListeningItems(ownerId), api.getExamGoals(ownerId),
      ]);
      setLanguages(langs); setBooks(b); setSettings(s); setSurahs(surahs);
      setStudy(study); setEducation(education); setCareer(career);
      setListening(listening); setExams(exams);
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

  const thisYear = new Date().getFullYear();
  const langsDone = languages.filter(l => l.status === 'done').length;
  const doneThisYear = books.filter(b => b.status === 'done' && b.doneDate && new Date(b.doneDate).getFullYear() === thisYear).length;

  const pct = (done, total) => (total > 0 ? Math.round((done / total) * 100) : 0);

  const quranDone = surahs.filter(s => s.status === 'done').length;
  const studyDone = study.filter(s => s.status === 'done').length + education.filter(e => e.done).length + exams.filter(e => e.status === 'done').length;
  const studyTotal = study.length + education.length + exams.length;
  const careerDone = career.filter(c => c.done).length;
  const listeningDone = listening.filter(l => l.status === 'done').length;
  const listeningHours = listening.reduce((sum, l) => sum + (l.hours || 0), 0);

  const rows = [
    { icon: '🗣️', label: 'Языки', done: langsDone, total: languages.length },
    { icon: '📖', label: 'Книги', done: doneThisYear, total: settings.booksYearlyGoal || 0 },
    { icon: '🎧', label: 'Аудирование', done: listeningDone, total: listening.length },
    { icon: '📿', label: 'Коран', done: quranDone, total: 114 },
    { icon: '🌱', label: 'Учиться', done: studyDone, total: studyTotal },
    { icon: '🎯', label: 'Профессия', done: careerDone, total: career.length },
  ];

  const validRows = rows.filter(r => r.total > 0);
  const overallPct = validRows.length ? Math.round(validRows.reduce((s, r) => s + pct(r.done, r.total), 0) / validRows.length) : 0;
  const bestRow = validRows.length ? validRows.reduce((a, b) => (pct(b.done, b.total) > pct(a.done, a.total) ? b : a)) : null;

  return (
    <div className="overview-grid">
      <div className="ov-card">
        <div className="ov-title">Прогресс</div>
        <div className="ov-list">
          {rows.map(r => {
            const p = pct(r.done, r.total);
            return (
              <div className="ov-row" key={r.label}>
                <span className="ov-icon">{r.icon}</span>
                <span className="ov-label">{r.label}</span>
                <div className="ov-bar-track"><div className="ov-bar-fill" style={{ width: `${p}%` }} /></div>
                <span className="ov-frac">{r.total > 0 ? `${r.done}/${r.total}` : '—'}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="ov-card ov-stats-card">
        <div className="ov-title">Статистика</div>
        <div className="ov-donut" style={{ '--pct': overallPct }}>
          <div className="ov-donut-center">
            <span className="ov-donut-num">{overallPct}%</span>
            <span className="ov-donut-label">общий прогресс</span>
          </div>
        </div>
        <div className="ov-highlights">
          {bestRow && (
            <div className="ov-hi-row">
              <span className="ov-hi-icon">🔥</span>
              <div className="ov-hi-text"><b>{bestRow.label} — {pct(bestRow.done, bestRow.total)}%</b><span>лучший результат</span></div>
            </div>
          )}
          <div className="ov-hi-row">
            <span className="ov-hi-icon">📚</span>
            <div className="ov-hi-text"><b>{doneThisYear} книг</b><span>прочитано в {thisYear} году</span></div>
          </div>
          <div className="ov-hi-row">
            <span className="ov-hi-icon">🎧</span>
            <div className="ov-hi-text"><b>{listeningHours} ч</b><span>прослушано всего</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
