export default function QuranBeadsTracker({ surahs }) {
  const done = surahs.filter(s => s.status === 'done');
  const total = surahs.length || 114;
  const donePages = done.reduce((sum, s) => sum + s.pages, 0);

  if (surahs.length === 0) {
    return <div className="empty-state">Пока нет данных по сурам</div>;
  }

  return (
    <div className="mama-year-block">
      <div className="mama-year-head">
        📿 Хифз Корана <span className="count">{done.length}/{total}</span>
      </div>
      <div className="mama-beads">
        {surahs.map(s => {
          const filled = s.status === 'done';
          const title = filled
            ? `${s.name} — выучена${s.doneDate ? ', ' + new Date(s.doneDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}`
            : s.name;
          return <span className={`mama-bead leaf${filled ? '' : ' empty'}`} title={title} key={s._id} />;
        })}
      </div>
      <div className="mama-year-goal-line">{donePages} из 604 страниц</div>
    </div>
  );
}
