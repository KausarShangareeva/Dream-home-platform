export default function QuranBeadsTracker({ surahs }) {
  const done = surahs.filter(s => s.status === 'done');
  const total = surahs.length || 114;
  const donePages = done.reduce((sum, s) => sum + s.pages, 0);
  const totalPages = surahs.reduce((sum, s) => sum + s.pages, 0) || 604;

  if (surahs.length === 0) {
    return <div className="empty-state">Пока нет данных по сурам</div>;
  }

  const sorted = [...done].sort((a, b) => a.num - b.num);
  const emptyCount = Math.max(0, total - sorted.length);

  return (
    <div className="mama-year-block">
      <div className="mama-year-head">
        📿 Выучено сур <span className="count">{sorted.length} / {total}</span>
      </div>
      <div className="mama-beads">
        {sorted.map(s => {
          const title = `${s.num}. ${s.name} — ${s.pages} стр.${s.doneDate ? `, выучена ${new Date(s.doneDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}` : ''}`;
          return <span className="mama-bead leaf" title={title} key={s._id} />;
        })}
        {Array.from({ length: emptyCount }).map((_, i) => <span className="mama-bead empty" key={`empty-${i}`} />)}
      </div>
      <div className="mama-year-goal-line">Выучено {donePages} из {totalPages} страниц Корана</div>
    </div>
  );
}
