import { DIFF_LABEL } from '../../data/bookLabels.js';

// Shared CEFR-level dropdown (A1…C2, with emoji + colour coding). Used by both the
// Books difficulty column and the Languages level column so the two stay identical.
// Pass allowNone for fields where "not rated yet" is a valid state (e.g. Books).
export default function LevelSelect({ value, onChange, allowNone = false, className = '' }) {
  const cls = `diff-select diff-${(value || 'none').replace('+', 'plus')} ${className}`.trim();
  return (
    <select value={value || ''} onChange={e => onChange(e.target.value || null)} className={cls}>
      {allowNone && <option value="">—</option>}
      {Object.entries(DIFF_LABEL).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
    </select>
  );
}
