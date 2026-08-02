import { useEffect, useState, useCallback } from 'react';
import { api } from '../api.js';
import DeleteButton from './ui/DeleteButton.jsx';
import { DIFF_LABEL, DIFF_COLOR, GENRE_LABEL, BOOK_STATUS_LABEL } from '../data/bookLabels.js';

export default function BooksTab({ ownerId }) {
  const [books, setBooks] = useState([]);
  const [settings, setSettings] = useState({ booksYearlyGoal: 100 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newPages, setNewPages] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [b, s] = await Promise.all([api.getBooks(ownerId), api.getSettings(ownerId)]);
      setBooks(b); setSettings(s);
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

  const thisYear = new Date().getFullYear();
  const doneThisYear = books.filter(b => b.status === 'done' && b.doneDate && new Date(b.doneDate).getFullYear() === thisYear).length;

  const update = async (book, patch) => {
    await api.updateBook(ownerId, book._id, patch);
    load();
  };

  const updateGoal = async (value) => {
    await api.updateSettings(ownerId, { booksYearlyGoal: Number(value) });
    load();
  };

  const addBook = async () => {
    if (!newTitle.trim() || !newPages) return alert('Впишите название и число страниц');
    await api.addBook(ownerId, { title: newTitle.trim(), author: newAuthor.trim(), pages: Number(newPages) });
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
        <table className="data-table">
          <thead>
            <tr>
              <th className="col-title">Книга</th><th>Жанр</th><th>Сложность</th>
              <th>Прочту за</th><th>Статус</th><th>Завершила</th><th></th>
            </tr>
          </thead>
          <tbody>
            {books.length === 0 && <tr><td colSpan={7} className="empty-state">Пока пусто — добавьте книгу ниже</td></tr>}
            {books.map(b => {
              const pagesPerDay = Math.max(1, Math.ceil(b.pages / Math.max(1, b.days)));
              const done = b.status === 'done';
              const diffColor = b.difficulty ? DIFF_COLOR[b.difficulty] : null;
              return (
                <tr key={b._id}>
                  <td className="col-title">
                    <b>{b.title}</b>
                    {b.author && <span style={{ display: 'block', fontSize: 11, color: 'var(--ink-soft)' }}>{b.author}</span>}
                  </td>
                  <td>
                    <select value={b.genre || ''} onChange={e => update(b, { genre: e.target.value || null })}>
                      <option value="">—</option>
                      {Object.entries(GENRE_LABEL).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
                    </select>
                  </td>
                  <td>
                    <select
                      value={b.difficulty || ''}
                      onChange={e => update(b, { difficulty: e.target.value || null })}
                      style={{
                        fontWeight: 700,
                        background: diffColor ? `color-mix(in srgb, ${diffColor} 50%, white)` : undefined,
                        borderColor: diffColor || undefined,
                      }}
                    >
                      <option value="">—</option>
                      {Object.entries(DIFF_LABEL).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
                    </select>
                  </td>
                  <td>
                    <input
                      type="number" min="1" style={{ maxWidth: 60 }} value={b.days} disabled={done}
                      onChange={e => update(b, { days: Number(e.target.value) })}
                    /> дн. ({pagesPerDay}/день)
                  </td>
                  <td>
                    <select value={b.status} onChange={e => update(b, { status: e.target.value, doneDate: e.target.value === 'done' ? new Date().toISOString().slice(0, 10) : null })}>
                      {Object.entries(BOOK_STATUS_LABEL).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
                    </select>
                  </td>
                  <td>
                    {done && (
                      <input type="date" value={b.doneDate || ''} onChange={e => update(b, { doneDate: e.target.value })} />
                    )}
                  </td>
                  <td><DeleteButton onConfirm={async () => { await api.deleteBook(ownerId, b._id); load(); }} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="form-row">
        <div className="field"><label>Название</label><input value={newTitle} onChange={e => setNewTitle(e.target.value)} /></div>
        <div className="field"><label>Автор</label><input value={newAuthor} onChange={e => setNewAuthor(e.target.value)} /></div>
        <div className="field" style={{ maxWidth: 100 }}><label>Страниц</label><input type="number" min="1" value={newPages} onChange={e => setNewPages(e.target.value)} /></div>
        <div className="field" style={{ justifyContent: 'flex-end' }}>
          <button className="btn btn-sm btn-primary" onClick={addBook} type="button">+ Добавить книгу</button>
        </div>
      </div>
    </div>
  );
}
