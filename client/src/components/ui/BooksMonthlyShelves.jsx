import { useState } from 'react';
import { BOOK_STATUS_EMOJI } from '../../data/bookLabels.js';

const MONTH_NAMES = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const PACE_OPTIONS = [2, 3, 4, 5, 6, 7, 8, 9];

function daysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

// Walks the shelf's books in order and finds which book + page a given cumulative
// page count lands on. Used to turn "you should have read N pages by now" into a
// concrete "you should be on book X, page Y" — a target that only moves as days
// pass, not every time you update your actual progress.
function findPositionAtPage(shelfBooks, totalPages) {
  let remaining = totalPages;
  for (const b of shelfBooks) {
    if (remaining <= b.pages) return { book: b, page: Math.max(0, Math.round(remaining)) };
    remaining -= b.pages;
  }
  return null; // per the flat plan you should already be done with the whole shelf
}

function computeShelves(books, pace, overrides) {
  const now = new Date();
  const curY = now.getFullYear();
  const curM = now.getMonth(); // 0-indexed
  let cursor = 0;
  let y = curY;
  let m = curM;
  const shelves = [];
  let safety = 0;
  while (cursor < books.length && safety < 60) {
    safety++;
    const monthKey = `${y}-${String(m + 1).padStart(2, '0')}`;
    const monthPace = Math.max(0, overrides[monthKey] ?? pace);
    const shelfBooks = books.slice(cursor, cursor + monthPace);
    cursor += shelfBooks.length;
    const isCurrent = y === curY && m === curM;
    const isPast = y < curY || (y === curY && m < curM);
    const allDone = shelfBooks.length > 0 && shelfBooks.every(b => b.status === 'done');
    const totalPages = shelfBooks.reduce((sum, b) => sum + (b.pages || 0), 0);
    const days = daysInMonth(y, m);
    const pagesPerDay = totalPages > 0 ? Math.ceil(totalPages / days) : 0;
    shelves.push({ monthKey, label: `${MONTH_NAMES[m]} ${y}`, pace: monthPace, books: shelfBooks, isPast, isCurrent, allDone, totalPages, days, pagesPerDay });
    m++; if (m > 11) { m = 0; y++; }
  }
  return shelves;
}

export default function BooksMonthlyShelves({ books, pace, overrides, onChangePace, onChangeMonthOverride, onChangePage }) {
  const [draftPages, setDraftPages] = useState({}); // bookId -> slider value while dragging, before it's saved

  const getPage = (b) => {
    if (b.status === 'done') return b.pages;
    if (draftPages[b._id] !== undefined) return draftPages[b._id];
    return b.currentPage || 0;
  };

  const queue = books; // stable order — includes done books too, so shelf boundaries don't shift as you read
  const shelves = computeShelves(queue, pace, overrides || {});
  const now = new Date();

  return (
    <div className="shelves-block">
      <div className="shelves-header">
        <div className="shelves-title">📅 План по месяцам</div>
        <div className="shelves-pace-picker">
          <span>Сколько книг читать в месяц:</span>
          <div className="pace-pills">
            {PACE_OPTIONS.map(n => (
              <button
                key={n} type="button"
                className={`pace-pill${pace === n ? ' active' : ''}`}
                onClick={() => onChangePace(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="shelves-grid">
        {shelves.map(shelf => {
          const pagesReadInShelf = shelf.books.reduce((sum, b) => sum + getPage(b), 0);
          const remainingPages = Math.max(0, shelf.totalPages - pagesReadInShelf);
          const daysLeft = shelf.isCurrent ? Math.max(1, shelf.days - now.getDate() + 1) : shelf.days;
          const todayPace = remainingPages > 0 ? Math.ceil(remainingPages / daysLeft) : 0;
          const onTrack = todayPace <= shelf.pagesPerDay;
          // Stable target: where the flat plan says you should be by the end of TODAY,
          // based only on the date — not on wherever your slider currently sits, so it
          // doesn't creep forward every time you update your progress.
          const elapsedDays = shelf.isCurrent ? now.getDate() : shelf.days;
          const expectedCumulative = Math.min(shelf.totalPages, Math.round(shelf.pagesPerDay * elapsedDays));
          const targetPosition = shelf.isCurrent ? findPositionAtPage(shelf.books, expectedCumulative) : null;

          return (
            <div className={`shelf-card${shelf.allDone ? ' shelf-done' : ''}${shelf.isPast && !shelf.allDone ? ' shelf-missed' : ''}`} key={shelf.monthKey}>
              <div className="shelf-card-head">
                <span className="shelf-card-title">{shelf.label}</span>
                {shelf.allDone && <span className="shelf-status shelf-status-ok" title="Всё прочитано вовремя">✅</span>}
                {shelf.isPast && !shelf.allDone && <span className="shelf-status shelf-status-bad" title="Не успели прочитать всё в этот месяц">😢</span>}
              </div>

              {shelf.isCurrent && (
                <div className="shelf-today-badge">
                  📍 Сегодня: {now.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              )}

              <select
                className="shelf-pace-select"
                value={overrides?.[shelf.monthKey] ?? ''}
                onChange={e => onChangeMonthOverride(shelf.monthKey, e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">По умолчанию ({pace})</option>
                {PACE_OPTIONS.map(n => <option key={n} value={n}>{n} книг в этот месяц</option>)}
              </select>

              {shelf.totalPages > 0 && (
                <div className="shelf-pace-hint">📄 {shelf.totalPages} стр. за {shelf.days} дн. — <b>{shelf.pagesPerDay} стр/день</b></div>
              )}

              {shelf.isCurrent && shelf.totalPages > 0 && (
                <div className={`shelf-pace-hint shelf-live-hint${onTrack ? ' shelf-hint-ok' : ' shelf-hint-behind'}`}>
                  {onTrack ? '✅ Успеваешь' : '⚠️ Отстаёшь'} — осталось {remainingPages} стр. за {daysLeft} дн. → нужно <b>{todayPace} стр/день</b>
                  {targetPosition
                    ? <> → на сегодня будь на «{targetPosition.book.title}», стр. <b>{targetPosition.page}</b></>
                    : <> → по плану на сегодня весь этот месяц уже должен быть прочитан 🎉</>}
                </div>
              )}

              <ul className="shelf-book-list">
                {shelf.books.map((b, i) => {
                  const page = getPage(b);
                  const isDone = b.status === 'done';
                  const showBadge = shelf.isCurrent && b.status === 'learning';
                  const diff = pagesReadInShelf - expectedCumulative;
                  return (
                    <li key={b._id} className={isDone ? 'shelf-book-done' : ''}>
                      <div className="shelf-book-title-row">
                        <span className="shelf-book-title-text">
                          <span className="shelf-book-num">{i + 1}-</span> {BOOK_STATUS_EMOJI[b.status]}{b.title}
                        </span>
                        {showBadge && (
                          diff > 0 ? <span className="shelf-book-badge badge-ahead" title="Опережаешь график">😄 +{diff} стр.</span>
                          : diff < 0 ? <span className="shelf-book-badge badge-behind" title="Отстаёшь от графика">😢 −{Math.abs(diff)} стр.</span>
                          : <span className="shelf-book-badge badge-ontrack" title="Ровно по норме">😊 норма!</span>
                        )}
                      </div>
                      {b.status === 'learning' && b.pages > 0 && (
                        <div className="shelf-book-slider-row">
                          <input
                            type="range" min="0" max={b.pages} value={page}
                            onChange={e => setDraftPages(prev => ({ ...prev, [b._id]: Number(e.target.value) }))}
                            onMouseUp={e => onChangePage(b, Number(e.target.value))}
                            onTouchEnd={e => onChangePage(b, Number(e.target.value))}
                          />
                          <input
                            type="number" min="0" max={b.pages} value={page}
                            className="shelf-book-page-input"
                            onChange={e => {
                              const v = Math.max(0, Math.min(b.pages, Number(e.target.value) || 0));
                              setDraftPages(prev => ({ ...prev, [b._id]: v }));
                            }}
                            onBlur={e => {
                              const v = Math.max(0, Math.min(b.pages, Number(e.target.value) || 0));
                              onChangePage(b, v);
                            }}
                          />
                          <span className="shelf-book-slider-val">/ {b.pages} стр.</span>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
