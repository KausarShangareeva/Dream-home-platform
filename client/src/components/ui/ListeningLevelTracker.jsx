import { DIFF_LABEL } from '../../data/bookLabels.js';

// Hour targets per CEFR level, per the listening roadmap: each level needs this many
// *additional* hours on top of every level before it (cumulative, not a total from zero).
const LEVEL_TARGETS = [
  ['B1', 140],
  ['B1+', 150],
  ['B2', 200],
  ['B2+', 250],
  ['C1', 300],
];
const HOURS_PER_BEAD = 10;

export default function ListeningLevelTracker({ items }) {
  const totalHours = items.filter(i => i.status === 'done').reduce((sum, i) => sum + i.hours, 0);
  const grandTotal = LEVEL_TARGETS.reduce((sum, [, target]) => sum + target, 0);

  let cursor = 0; // hours consumed by levels already accounted for
  const segments = LEVEL_TARGETS.map(([level, target]) => {
    const hoursInLevel = Math.min(target, Math.max(0, totalHours - cursor));
    cursor += target;
    return { level, target, hoursInLevel, done: hoursInLevel >= target };
  });

  // The level currently being worked on — first one that isn't finished yet (or the last if all are).
  const currentIdx = segments.findIndex(s => !s.done);
  const currentLevel = currentIdx === -1 ? segments[segments.length - 1].level : segments[currentIdx].level;

  return (
    <div className="mama-year-block">
      <div className="mama-year-head">
        🎧 Аудирование <span className="count">{totalHours} / {grandTotal} ч</span>
        <span className="listening-current-level">сейчас: {DIFF_LABEL[currentLevel]}</span>
      </div>

      <div className="listening-levels">
        {segments.map((s, idx) => {
          const beadsTotal = Math.ceil(s.target / HOURS_PER_BEAD);
          const beadsFilled = Math.floor(s.hoursInLevel / HOURS_PER_BEAD);
          const locked = idx > 0 && !segments[idx - 1].done && s.hoursInLevel === 0;
          return (
            <div className={`listening-level${s.done ? ' done' : ''}${locked ? ' locked' : ''}`} key={s.level}>
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
