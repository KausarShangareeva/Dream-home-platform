function daysBetween(a, b) {
  const d1 = new Date(a);
  const d2 = new Date(b);
  return Math.round((d2 - d1) / 86400000);
}

export default function BooksYearTracker({ books, goal }) {
  const done = books.filter(b => b.doneDate);
  const thisYear = new Date().getFullYear();

  const byYear = {};
  done.forEach(b => {
    const y = new Date(b.doneDate).getFullYear();
    if (!byYear[y]) byYear[y] = [];
    byYear[y].push(b);
  });
  if (!byYear[thisYear]) byYear[thisYear] = [];

  const years = Object.keys(byYear).map(Number).sort((a, b) => b - a);

  return (
    <div>
      {years.map(y => {
        const list = [...byYear[y]].sort((a, b) => new Date(a.doneDate) - new Date(b.doneDate));
        const isCurrent = y === thisYear;
        const emptyCount = isCurrent ? Math.max(0, goal - list.length) : 0;
        const pct = isCurrent && goal > 0 ? Math.min(100, Math.round((list.length / goal) * 100)) : 0;

        const beadsBlock = (
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="mama-year-head">🏆 {y} год <span className="count">{isCurrent ? `${list.length}/${goal}` : list.length}</span></div>
            <div className="mama-beads">
              {list.map(b => {
                const days = daysBetween(b.startDate || b.doneDate, b.doneDate);
                const title = `${b.title} — ${days} дн., завершена ${new Date(b.doneDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}`;
                return <span className="mama-bead" title={title} key={b._id} />;
              })}
              {isCurrent && Array.from({ length: emptyCount }).map((_, i) => <span className="mama-bead empty" key={`empty-${i}`} />)}
            </div>
            {isCurrent && <div className="mama-year-goal-line">Цель: {list.length} из {goal}</div>}
          </div>
        );

        if (!isCurrent) {
          return <div className="mama-year-block" key={y}>{beadsBlock}</div>;
        }

        return (
          <div className="mama-year-block books-year-row" key={y}>
            {beadsBlock}
            <div className="books-progress-wheel" style={{ '--pct': pct }}>
              <div className="books-progress-wheel-center">
                <span className="books-progress-wheel-num">{list.length}/{goal}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
