import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { api } from '../api.js';
import DeleteButton from './ui/DeleteButton.jsx';
import BooksYearTracker from './ui/BooksYearTracker.jsx';
import BooksMonthlyShelves from './ui/BooksMonthlyShelves.jsx';
import LevelSelect from './ui/LevelSelect.jsx';
import LanguageSelect from './ui/LanguageSelect.jsx';
import Flag from './ui/Flag.jsx';
import { GENRE_LABEL, BOOK_STATUS_LABEL, BOOK_STATUS_EMOJI } from '../data/bookLabels.js';
import { KNOWN_READING_LANGUAGES } from '../data/readingLanguages.js';
import { useDragReorder } from '../hooks/useDragReorder.js';
import ReactCountryFlag from 'react-country-flag';

// Round-robin merge: book[0] from each selected language, then book[1] from each, and so on —
// languages that run out just get skipped, the rest keep alternating (англ-швед-англ-швед...).
function interleaveByLanguage(books, languageNames, langKeyByName) {
  const queues = languageNames.map(name => books.filter(b => b.language === name));
  const result = [];
  let idx = 0;
  let anyLeft = true;
  while (anyLeft) {
    anyLeft = false;
    for (let qi = 0; qi < queues.length; qi++) {
      const q = queues[qi];
      if (idx < q.length) {
        result.push({ ...q[idx], _langKey: langKeyByName[languageNames[qi]] });
        anyLeft = true;
      }
    }
    idx++;
  }
  return result;
}

const AUTHORS = [
  ['Agatha Christie', 'GB', 'самый издаваемый автор детективов в истории.'],
  ['Arthur Conan Doyle', 'GB', 'создал Шерлока Холмса и жанр дедуктивного детектива.'],
  ['George Orwell', 'GB', '«1984», обязательное чтение почти во всех англоязычных школах.'],
  ['Aldous Huxley', 'GB', '«О дивный новый мир», вместе с Оруэллом — главные антиутопии XX века.'],
  ['J. R. R. Tolkien', 'GB', 'фактически создал жанр современного фэнтези.'],
  ['Terry Pratchett', 'GB', 'один из лучших англоязычных стилистов, мастер иронии.'],
  ['Neil Gaiman', 'GB', 'лауреат Hugo, Nebula, Locus, современный мастер сказки для взрослых.'],
  ['Kazuo Ishiguro', 'GB', 'лауреат Нобелевской премии по литературе (2017).'],
  ['Susanna Clarke', 'GB', '«Джонатан Стрендж и мистер Норрелл», одна из самых уважаемых книг жанра за 20 лет.'],
  ['Roald Dahl', 'GB', 'один из самых читаемых детских авторов XX века — «Матильда», «Чарли и шоколадная фабрика».'],
  ['Hergé', 'BE', 'бельгийский автор комиксов «Приключения Тинтина» — классика европейской иллюстрированной литературы.'],
];

export default function BooksTab({ ownerId }) {
  const [books, setBooks] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [settings, setSettings] = useState({ booksYearlyGoal: 100 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newLang, setNewLang] = useState('');
  const [newPages, setNewPages] = useState('');

  const loadedOnceRef = useRef(false);
  const load = useCallback(async () => {
    if (!loadedOnceRef.current) setLoading(true);
    setError(null);
    try {
      const [b, s, langs] = await Promise.all([api.getBooks(ownerId), api.getSettings(ownerId), api.getLanguages(ownerId)]);
      setBooks(b); setSettings(s); setLanguages(langs);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      loadedOnceRef.current = true;
    }
  }, [ownerId]);

  useEffect(() => { load(); }, [load]);

  // Reading languages = the ones she's actually learning, plus the original fixed set
  // (Russian/Tatar aren't part of the learning chain but are still valid book languages).
  const allLanguages = useMemo(() => {
    const merged = [...KNOWN_READING_LANGUAGES];
    languages.forEach(l => { if (!merged.some(m => m.name === l.name)) merged.push(l); });
    return merged;
  }, [languages]);

  useEffect(() => {
    if (!selectedLanguage && books.length) setSelectedLanguage(books[0].language || allLanguages[0]?.name);
    else if (!selectedLanguage && allLanguages.length) setSelectedLanguage(allLanguages[0].name);
  }, [books, allLanguages, selectedLanguage]);
  useEffect(() => { if (selectedLanguage && selectedLanguage !== '__mix__') setNewLang(selectedLanguage); }, [selectedLanguage]);

  const booksForLanguage = useMemo(
    () => books.filter(b => b.language === selectedLanguage),
    [books, selectedLanguage]
  );

  const langKeyByName = useMemo(
    () => Object.fromEntries(allLanguages.map(l => [l.name, l.key])),
    [allLanguages]
  );
  const mixLanguages = settings.mixLanguages || [];
  const isMix = selectedLanguage === '__mix__';
  const booksForMix = useMemo(
    () => (isMix ? interleaveByLanguage(books, mixLanguages, langKeyByName) : []),
    [isMix, books, mixLanguages, langKeyByName]
  );
  const shelfBooks = isMix ? booksForMix : booksForLanguage;

  const toggleMixLanguage = async (name) => {
    const next = mixLanguages.includes(name) ? mixLanguages.filter(n => n !== name) : [...mixLanguages, name];
    await api.updateSettings(ownerId, { mixLanguages: next });
    load();
  };

  const { ordered, getRowProps } = useDragReorder(booksForLanguage, async (ids) => {
    await api.reorderBooks(ownerId, ids);
    load();
  });

  if (loading) return <div className="empty-state">Загрузка…</div>;
  if (error) return (
    <div className="empty-state">
      Не удалось загрузить данные: {error}
      <div style={{ marginTop: 10 }}><button className="btn btn-sm btn-ghost" onClick={load}>Повторить</button></div>
    </div>
  );

  const now = new Date();
  const thisYear = now.getFullYear();
  const doneThisYear = books.filter(b => b.status === 'done' && b.doneDate && new Date(b.doneDate).getFullYear() === thisYear).length;
  const yearlyGoal = settings.booksYearlyGoal || 100;
  const monthsLeft = Math.max(1, 12 - now.getMonth()); // getMonth() is 0-indexed; current month still counts as available
  const remainingBooks = Math.max(0, yearlyGoal - doneThisYear);

  const MONTH_NAMES = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
  const baselinePace = yearlyGoal / 12; // ровный темп, если бы читали с начала года (для прогноза ниже)
  const basePace = Math.floor(yearlyGoal / 12);      // базовый темп на большинство месяцев
  const extraMonths = yearlyGoal % 12;                // сколько месяцев должны читать на 1 книгу больше
  const baseMonths = 12 - extraMonths;                // сколько месяцев читают базовый темп
  const projectedTotal = Math.floor(doneThisYear + baselinePace * monthsLeft); // куда придёшь, если продолжишь в обычном темпе
  const catchUpPace = Math.ceil(remainingBooks / monthsLeft); // сколько нужно читать, чтобы реально успеть

  const update = async (book, patch) => {
    try {
      await api.updateBook(ownerId, book._id, patch);
      load();
    } catch (err) {
      alert(err.message);
    }
  };
  const updateGoal = async (value) => { await api.updateSettings(ownerId, { booksYearlyGoal: Number(value) }); load(); };
  const updateShelfPace = async (n) => { await api.updateSettings(ownerId, { shelfPace: n }); load(); };
  const updateMonthOverride = async (monthKey, value) => {
    const overrides = { ...(settings.shelfMonthOverrides || {}) };
    if (value === null) delete overrides[monthKey];
    else overrides[monthKey] = value;
    await api.updateSettings(ownerId, { shelfMonthOverrides: overrides });
    load();
  };

  const addBook = async () => {
    if (!newTitle.trim() || !newPages) return alert('Впишите название и число страниц');
    await api.addBook(ownerId, { title: newTitle.trim(), author: newAuthor.trim(), language: newLang, pages: Number(newPages) });
    setNewTitle(''); setNewAuthor(''); setNewPages('');
    load();
  };

  const totalsByLanguage = {};
  allLanguages.forEach(l => { totalsByLanguage[l.name] = 0; });
  books.forEach(b => { totalsByLanguage[b.language] = (totalsByLanguage[b.language] || 0) + 1; });

  return (
    <div>
      <div className="form-row" style={{ marginTop: 0, marginBottom: 14, alignItems: 'center' }}>
        <div className="field" style={{ maxWidth: 220, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <label style={{ margin: 0 }}>Цель на этот год:</label>
          <input type="number" min="1" style={{ maxWidth: 80 }} defaultValue={settings.booksYearlyGoal} onBlur={e => updateGoal(e.target.value)} />
          <span>книг</span>
        </div>
      </div>

      <div className="books-pace-card">
        {remainingBooks === 0 ? (
          <div className="books-pace-row books-pace-done">🎉 Цель уже выполнена!</div>
        ) : (
          <>
            {extraMonths === 0 ? (
              <div className="books-pace-row">📖 Обычный темп: <b>{basePace} книг/мес</b> весь год — ровно {yearlyGoal} за год</div>
            ) : (
              <div className="books-pace-row">
                📖 Обычный темп: <b>{basePace} книг/мес</b> ({MONTH_NAMES[0]}–{MONTH_NAMES[baseMonths - 1]}), потом{' '}
                <b>{basePace + 1} книг/мес</b> ({MONTH_NAMES[baseMonths]}–{MONTH_NAMES[11]}) — ровно {yearlyGoal} за год
              </div>
            )}
            {projectedTotal >= yearlyGoal ? (
              <div className="books-pace-row books-pace-ok">✅ В этом темпе ты уложишься в цель</div>
            ) : (
              <div className="books-pace-row books-pace-warn">⚠️ Если продолжишь в этом темпе — прочитаешь ≈{projectedTotal} книг за год</div>
            )}
            <div className="books-pace-row books-pace-target">🎯 Чтобы прочитать все {yearlyGoal} — читай <b>{catchUpPace} книг/мес</b></div>
          </>
        )}
      </div>

      <div style={{ marginBottom: 18 }}>
        <BooksYearTracker books={books} goal={yearlyGoal} />
      </div>

      <div className="listening-lang-rail" style={{ marginTop: 0 }}>
        {allLanguages.map(l => (
          <button
            key={l.key}
            type="button"
            className={`listening-lang-pill${selectedLanguage === l.name ? ' active' : ''}`}
            onClick={() => setSelectedLanguage(l.name)}
            title={l.name}
          >
            <Flag langKey={l.key} />
            <span>{totalsByLanguage[l.name] || 0}</span>
          </button>
        ))}
        <button
          type="button"
          className={`listening-lang-pill mix-pill${isMix ? ' active' : ''}`}
          onClick={() => setSelectedLanguage('__mix__')}
          title="Читать сразу на нескольких языках"
        >
          🎨 Микс
        </button>
      </div>

      {isMix && (
        <div className="mix-picker">
          <div className="mix-picker-label">Каких языках сейчас читаешь одновременно:</div>
          <div className="mix-picker-options">
            {allLanguages.map(l => (
              <button
                key={l.key}
                type="button"
                className={`mix-picker-chip${mixLanguages.includes(l.name) ? ' active' : ''}`}
                onClick={() => toggleMixLanguage(l.name)}
              >
                <Flag langKey={l.key} /> {l.name}
              </button>
            ))}
          </div>
          {mixLanguages.length === 0 && <div className="mix-picker-hint">Выбери хотя бы один язык выше.</div>}
        </div>
      )}

      <BooksMonthlyShelves
        books={shelfBooks}
        pace={settings.shelfPace || 8}
        overrides={settings.shelfMonthOverrides || {}}
        onChangePace={updateShelfPace}
        onChangeMonthOverride={updateMonthOverride}
        onChangePage={(book, page) => update(book, { currentPage: page })}
      />

      <div className="mama-table-wrap">
        <table className="mama-table books-table">
          <thead>
            <tr>
              <th className="col-num">#</th>
              <th className="col-title">Книга</th>
              <th className="mobile-hide col-lang">Язык</th>
              <th className="mobile-hide col-genre">Жанр</th>
              <th className="mobile-hide col-pages">Стр.</th>
              <th className="col-diff">Сложность</th>
              <th className="col-days">Прочту за</th>
              <th className="mobile-hide col-pace">Стр/день</th>
              <th className="col-status">Статус</th>
              <th className="col-done">Завершила</th>
              <th className="col-del"></th>
            </tr>
          </thead>
          <tbody>
            {ordered.length === 0 && <tr><td colSpan={11} className="empty-state">Пока пусто для этого языка — добавьте книгу ниже</td></tr>}
            {ordered.map((b, idx) => {
              const pagesPerDay = Math.max(1, Math.ceil(b.pages / Math.max(1, b.days)));
              const done = b.status === 'done';
              const locked = idx > 0 && ordered[idx - 1].status !== 'done';
              return (
                <tr key={b._id} {...getRowProps(b)} className={`qstatus-${b.status}`}>
                  <td className="col-num"><span className="drag-handle">⋮⋮</span><span className="seq-badge">{idx + 1}</span></td>
                  <td className="col-title">
                    <b>{BOOK_STATUS_EMOJI[b.status]}{b.title}</b>
                    {b.author && <span className="bridge-note">{b.author}</span>}
                  </td>
                  <td className="mobile-hide col-lang">
                    <LanguageSelect
                      value={b.language || allLanguages[0]?.name}
                      options={allLanguages}
                      onChange={val => update(b, { language: val })}
                      compact
                    />
                  </td>
                  <td className="mobile-hide col-genre">
                    <select value={b.genre || ''} onChange={e => update(b, { genre: e.target.value || null })} className="genre-select">
                      <option value="">—</option>
                      {Object.entries(GENRE_LABEL).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
                    </select>
                  </td>
                  <td className="mobile-hide col-pages">
                    <input
                      type="number" min="1" defaultValue={b.pages}
                      onBlur={e => {
                        const v = Number(e.target.value);
                        if (v > 0 && v !== b.pages) update(b, { pages: v });
                      }}
                    />
                  </td>
                  <td className="col-diff">
                    <LevelSelect value={b.difficulty} onChange={val => update(b, { difficulty: val })} allowNone />
                  </td>
                  <td className="col-days">
                    <input
                      type="number" min="1" defaultValue={b.days} disabled={done}
                      onBlur={e => {
                        const v = Number(e.target.value);
                        if (v > 0 && v !== b.days) update(b, { days: v });
                      }}
                    />
                  </td>
                  <td className="finish-cell mobile-hide col-pace">{pagesPerDay}</td>
                  <td className="col-status">
                    <select
                      value={b.status}
                      disabled={locked}
                      title={locked ? 'Сначала дочитайте предыдущую книгу по списку' : undefined}
                      className={`qstatus-select qstatus-${b.status}${locked ? ' qstatus-locked' : ''}`}
                      onChange={e => update(b, { status: e.target.value, doneDate: e.target.value === 'done' ? new Date().toISOString().slice(0, 10) : null })}
                    >
                      {Object.entries(BOOK_STATUS_LABEL).map(([k, label]) => <option key={k} value={k}>{BOOK_STATUS_EMOJI[k]}{label}</option>)}
                    </select>
                    {locked && <span className="lock-hint" title="Сначала дочитайте предыдущую книгу по списку">🔒</span>}
                  </td>
                  <td className="col-done">
                    {done && (
                      <input type="date" value={b.doneDate || ''} onChange={e => update(b, { doneDate: e.target.value })} />
                    )}
                  </td>
                  <td className="col-del"><DeleteButton onConfirm={async () => { await api.deleteBook(ownerId, b._id); load(); }} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mama-add-book-block">
        <div className="mama-strip-title" style={{ margin: '0 0 12px' }}>Добавить книгу</div>
        <div className="mama-add-row">
          <input placeholder="Название" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
          <input placeholder="Автор" value={newAuthor} onChange={e => setNewAuthor(e.target.value)} />
          <LanguageSelect value={newLang} options={allLanguages} onChange={setNewLang} style={{ maxWidth: 150 }} />
          <input type="number" min="1" placeholder="Страниц" style={{ maxWidth: 90 }} value={newPages} onChange={e => setNewPages(e.target.value)} />
          <button className="btn btn-sm btn-primary" onClick={addBook} type="button">+ Добавить</button>
        </div>
      </div>

      <div className="tip-card" style={{ marginTop: 18 }}>
        <div className="mama-strip-title" style={{ margin: '0 0 10px' }}>✍️ Авторы, которых стоит запомнить</div>
        <p style={{ margin: '0 0 12px', fontSize: 12.5, color: 'var(--ink-soft)', lineHeight: 1.6 }}>
          Их книги входят в список выше — считаются классикой мировой литературы:
        </p>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.8, lineHeight: 1.85, color: 'var(--ink)' }}>
          {AUTHORS.map(([name, countryCode, desc]) => (
            <li key={name}>
              <b>{name}</b> <ReactCountryFlag countryCode={countryCode} svg style={{ width: '1.1em', height: '1.1em' }} /> — {desc}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
