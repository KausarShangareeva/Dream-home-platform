import { useEffect, useState, useCallback, useRef } from 'react';
import { api } from '../api.js';
import DeleteButton from './ui/DeleteButton.jsx';
import BooksYearTracker from './ui/BooksYearTracker.jsx';
import { DIFF_LABEL, GENRE_LABEL, BOOK_STATUS_LABEL } from '../data/bookLabels.js';
import { KNOWN_READING_LANGUAGES } from '../data/readingLanguages.js';
import { useDragReorder } from '../hooks/useDragReorder.js';

const AUTHORS = [
  ['Agatha Christie', '🇬🇧', 'самый издаваемый автор детективов в истории.'],
  ['Arthur Conan Doyle', '🇬🇧', 'создал Шерлока Холмса и жанр дедуктивного детектива.'],
  ['George Orwell', '🇬🇧', '«1984», обязательное чтение почти во всех англоязычных школах.'],
  ['Aldous Huxley', '🇬🇧', '«О дивный новый мир», вместе с Оруэллом — главные антиутопии XX века.'],
  ['J. R. R. Tolkien', '🇬🇧', 'фактически создал жанр современного фэнтези.'],
  ['Terry Pratchett', '🇬🇧', 'один из лучших англоязычных стилистов, мастер иронии.'],
  ['Neil Gaiman', '🇬🇧', 'лауреат Hugo, Nebula, Locus, современный мастер сказки для взрослых.'],
  ['Kazuo Ishiguro', '🇬🇧', 'лауреат Нобелевской премии по литературе (2017).'],
  ['Susanna Clarke', '🇬🇧', '«Джонатан Стрендж и мистер Норрелл», одна из самых уважаемых книг жанра за 20 лет.'],
];

export default function BooksTab({ ownerId }) {
  const [books, setBooks] = useState([]);
  const [settings, setSettings] = useState({ booksYearlyGoal: 100 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newLang, setNewLang] = useState(KNOWN_READING_LANGUAGES[0].name);
  const [newPages, setNewPages] = useState('');

  const loadedOnceRef = useRef(false);
  const load = useCallback(async () => {
    if (!loadedOnceRef.current) setLoading(true);
    setError(null);
    try {
      const [b, s] = await Promise.all([api.getBooks(ownerId), api.getSettings(ownerId)]);
      setBooks(b); setSettings(s);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      loadedOnceRef.current = true;
    }
  }, [ownerId]);

  useEffect(() => { load(); }, [load]);

  const { ordered, getRowProps } = useDragReorder(books, async (ids) => {
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

  const thisYear = new Date().getFullYear();
  const doneThisYear = books.filter(b => b.status === 'done' && b.doneDate && new Date(b.doneDate).getFullYear() === thisYear).length;

  const update = async (book, patch) => {
    try {
      await api.updateBook(ownerId, book._id, patch);
      load();
    } catch (err) {
      alert(err.message);
    }
  };
  const updateGoal = async (value) => { await api.updateSettings(ownerId, { booksYearlyGoal: Number(value) }); load(); };

  const addBook = async () => {
    if (!newTitle.trim() || !newPages) return alert('Впишите название и число страниц');
    await api.addBook(ownerId, { title: newTitle.trim(), author: newAuthor.trim(), language: newLang, pages: Number(newPages) });
    setNewTitle(''); setNewAuthor(''); setNewPages('');
    load();
  };

  return (
    <div>
      <div className="form-row" style={{ marginTop: 0, marginBottom: 14, alignItems: 'center' }}>
        <div className="field" style={{ maxWidth: 220, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <label style={{ margin: 0 }}>Цель на этот год:</label>
          <input type="number" min="1" style={{ maxWidth: 80 }} defaultValue={settings.booksYearlyGoal} onBlur={e => updateGoal(e.target.value)} />
          <span>книг</span>
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', fontWeight: 700 }}>
          Прочитано в {thisYear} году: {doneThisYear} / {settings.booksYearlyGoal}
        </div>
      </div>

      <div className="mama-table-wrap">
        <table className="mama-table">
          <thead>
            <tr>
              <th className="col-num">#</th>
              <th className="col-title">Книга</th>
              <th className="mobile-hide">Язык</th>
              <th className="mobile-hide">Жанр</th>
              <th className="mobile-hide">Стр.</th>
              <th>Сложность</th>
              <th>Прочту за</th>
              <th className="mobile-hide">Стр/день</th>
              <th>Статус</th>
              <th>Завершила</th>
              <th className="col-del"></th>
            </tr>
          </thead>
          <tbody>
            {ordered.length === 0 && <tr><td colSpan={11} className="empty-state">Пока пусто — добавьте книгу ниже</td></tr>}
            {ordered.map((b, idx) => {
              const pagesPerDay = Math.max(1, Math.ceil(b.pages / Math.max(1, b.days)));
              const done = b.status === 'done';
              const locked = idx > 0 && ordered[idx - 1].status !== 'done';
              const diffClass = `diff-select diff-${(b.difficulty || 'none').replace('+', 'plus')}`;
              return (
                <tr key={b._id} {...getRowProps(b)} className={`qstatus-${b.status}`}>
                  <td className="col-num"><span className="drag-handle">⋮⋮</span><span className="seq-badge">{idx + 1}</span></td>
                  <td className="col-title">
                    <b>{b.title}</b>
                    {b.author && <span className="bridge-note">{b.author}</span>}
                  </td>
                  <td className="mobile-hide">
                    <select value={b.language || KNOWN_READING_LANGUAGES[0].name} onChange={e => update(b, { language: e.target.value })}>
                      {KNOWN_READING_LANGUAGES.map(l => <option key={l.name} value={l.name}>{l.flag} {l.name}</option>)}
                    </select>
                  </td>
                  <td className="mobile-hide">
                    <select value={b.genre || ''} onChange={e => update(b, { genre: e.target.value || null })} className="genre-select">
                      <option value="">—</option>
                      {Object.entries(GENRE_LABEL).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
                    </select>
                  </td>
                  <td className="mobile-hide">{b.pages} стр</td>
                  <td>
                    <select value={b.difficulty || ''} onChange={e => update(b, { difficulty: e.target.value || null })} className={diffClass}>
                      <option value="">—</option>
                      {Object.entries(DIFF_LABEL).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
                    </select>
                  </td>
                  <td>
                    <input
                      type="number" min="1" style={{ maxWidth: 60 }} value={b.days} disabled={done}
                      onChange={e => update(b, { days: Number(e.target.value) })}
                    /> дн.
                  </td>
                  <td className="finish-cell mobile-hide">{pagesPerDay} стр/день</td>
                  <td>
                    <select
                      value={b.status}
                      disabled={locked}
                      title={locked ? 'Сначала дочитайте предыдущую книгу по списку' : undefined}
                      className={`qstatus-select qstatus-${b.status}${locked ? ' qstatus-locked' : ''}`}
                      onChange={e => update(b, { status: e.target.value, doneDate: e.target.value === 'done' ? new Date().toISOString().slice(0, 10) : null })}
                    >
                      {Object.entries(BOOK_STATUS_LABEL).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
                    </select>
                    {locked && <span className="lock-hint" title="Сначала дочитайте предыдущую книгу по списку">🔒</span>}
                  </td>
                  <td>
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
          <select value={newLang} onChange={e => setNewLang(e.target.value)} style={{ maxWidth: 150 }}>
            {KNOWN_READING_LANGUAGES.map(l => <option key={l.name} value={l.name}>{l.flag} {l.name}</option>)}
          </select>
          <input type="number" min="1" placeholder="Страниц" style={{ maxWidth: 90 }} value={newPages} onChange={e => setNewPages(e.target.value)} />
          <button className="btn btn-sm btn-primary" onClick={addBook} type="button">+ Добавить</button>
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <BooksYearTracker books={books} goal={settings.booksYearlyGoal || 100} />
      </div>

      <div className="tip-card" style={{ marginTop: 18 }}>
        <div className="mama-strip-title" style={{ margin: '0 0 10px' }}>✍️ Авторы, которых стоит запомнить</div>
        <p style={{ margin: '0 0 12px', fontSize: 12.5, color: 'var(--ink-soft)', lineHeight: 1.6 }}>
          Их книги входят в список выше — считаются классикой современной англоязычной литературы:
        </p>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.8, lineHeight: 1.85, color: 'var(--ink)' }}>
          {AUTHORS.map(([name, flag, desc]) => (
            <li key={name}><b>{name}</b> {flag} — {desc}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
