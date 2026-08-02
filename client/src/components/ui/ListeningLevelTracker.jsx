import { DIFF_LABEL } from '../../data/bookLabels.js';

// Hour targets per CEFR level, per the listening roadmap.
const LEVEL_TARGETS = [
  ['B1', 140],
  ['B1+', 150],
  ['B2', 200],
  ['B2+', 250],
  ['C1', 300],
];
const HOURS_PER_BEAD = 10;

export default function ListeningLevelTracker({ items, language }) {
  // Each level's progress comes only from items actually tagged at that level —
  // not a shared pool that fills B1 first regardless of what you marked done.
  // Hours count the moment they're logged (checked episode / quick log), independent
  // of the item's own todo/learning/done status.
  const segments = LEVEL_TARGETS.map(([level, target]) => {
    const raw = items.filter(i => i.difficulty === level).reduce((sum, i) => sum + i.hours, 0);
    const hoursInLevel = Math.min(target, raw);
    return { level, target, hoursInLevel, done: hoursInLevel >= target };
  });

  const totalHours = segments.reduce((sum, s) => sum + s.hoursInLevel, 0);
  const grandTotal = LEVEL_TARGETS.reduce((sum, [, target]) => sum + target, 0);

  // The level currently being worked on — first one that isn't finished yet (or the last if all are).
  const currentIdx = segments.findIndex(s => !s.done);
  const currentLevel = currentIdx === -1 ? segments[segments.length - 1].level : segments[currentIdx].level;

  return (
    <div className="mama-year-block">
      <div className="mama-year-head">
        🎧 {language ? `${language} — ` : ''}Аудирование <span className="count">{totalHours} / {grandTotal} ч</span>
        <span className="listening-current-level">сейчас: {DIFF_LABEL[currentLevel]}</span>
      </div>

      <div className="listening-levels">
        {segments.map(s => {
          const beadsTotal = Math.ceil(s.target / HOURS_PER_BEAD);
          const beadsFilled = Math.floor(s.hoursInLevel / HOURS_PER_BEAD);
          return (
            <div className={`listening-level${s.done ? ' done' : ''}`} key={s.level}>
              <div className="listening-level-head">
                <span>{DIFF_LABEL[s.level]}</span>
                <span className="listening-level-hours">{s.hoursInLevel} / {s.target} ч{s.done ? ' ✅' : ''}</span>
              </div>
              <div className="mama-beads mama-beads-sm">
                {Array.from({ length: beadsTotal }).map((_, i) => (
                  <span className={`mama-bead leaf${i < beadsFilled ? '' : ' empty'}`} key={i} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
