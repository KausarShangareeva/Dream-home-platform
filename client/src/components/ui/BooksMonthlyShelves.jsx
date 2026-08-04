import { BOOK_STATUS_EMOJI } from '../../data/bookLabels.js';

const MONTH_NAMES = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const PACE_OPTIONS = [2, 4, 6, 8];

function daysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
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

export default function BooksMonthlyShelves({ books, pace, overrides, onChangePace, onChangeMonthOverride }) {
  const queue = books; // stable order — includes done books too, so shelf boundaries don't shift as you read
  const shelves = computeShelves(queue, pace, overrides || {});

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
        {shelves.map(shelf => (
          <div className={`shelf-card${shelf.allDone ? ' shelf-done' : ''}${shelf.isPast && !shelf.allDone ? ' shelf-missed' : ''}`} key={shelf.monthKey}>
            <div className="shelf-card-head">
              <span className="shelf-card-title">{shelf.label}</span>
              {shelf.allDone && <span className="shelf-status shelf-status-ok" title="Всё прочитано вовремя">✅</span>}
              {shelf.isPast && !shelf.allDone && <span className="shelf-status shelf-status-bad" title="Не успели прочитать всё в этот месяц">😢</span>}
            </div>

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

            <ul className="shelf-book-list">
              {shelf.books.map((b, i) => (
                <li key={b._id} className={b.status === 'done' ? 'shelf-book-done' : ''}>
                  <span className="shelf-book-num">{i + 1}-</span> {BOOK_STATUS_EMOJI[b.status]}{b.title}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
