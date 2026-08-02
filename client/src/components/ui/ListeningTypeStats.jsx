import { TYPE_LABEL, TYPE_COLOR } from '../../data/listeningLabels.js';

const TYPE_ENTRIES = Object.entries(TYPE_LABEL);

export default function ListeningTypeStats({ items }) {
  const hoursByType = {};
  TYPE_ENTRIES.forEach(([k]) => { hoursByType[k] = 0; });
  let grandTotal = 0;
  items.forEach(i => {
    if (i.type && hoursByType[i.type] !== undefined) hoursByType[i.type] += i.hours;
    grandTotal += i.hours;
  });

  // Build conic-gradient stops proportional to each type's share of the total.
  let cursor = 0;
  const stops = [];
  TYPE_ENTRIES.forEach(([k]) => {
    const hours = hoursByType[k];
    if (hours <= 0 || grandTotal <= 0) return;
    const start = cursor;
    cursor += (hours / grandTotal) * 100;
    stops.push(`${TYPE_COLOR[k]} ${start}% ${cursor}%`);
  });
  const wheelBackground = stops.length > 0 ? `conic-gradient(${stops.join(', ')})` : 'var(--card-soft)';

  return (
    <div className="listening-stats">
      <div className="listening-stats-legend">
        {TYPE_ENTRIES.map(([k, label]) => (
          <div className="listening-stats-row" key={k}>
            <span className="listening-stats-dot" style={{ background: TYPE_COLOR[k] }} />
            <span className="listening-stats-label">{label}</span>
            <span className="listening-stats-hours">{hoursByType[k]} ч</span>
          </div>
        ))}
      </div>
      <div className="listening-wheel" style={{ background: wheelBackground }}>
        <div className="listening-wheel-center">
          <span className="listening-wheel-num">{grandTotal}</span>
          <span className="listening-wheel-label">часов</span>
        </div>
      </div>
    </div>
  );
}
