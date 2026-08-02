// CEFR levels, cumulative hours to reach each level from zero (Council of Europe estimates).
// B1+/B2+ are interpolated midpoints, added so the language level list can match Books exactly.
export const CEFR_HOURS = { A1: 100, A2: 200, B1: 350, 'B1+': 475, B2: 600, 'B2+': 700, C1: 800, C2: 1200 };
export const CEFR_LEVELS = Object.keys(CEFR_HOURS);

export function langHoursNeeded(lang) {
  const fromHours = lang.fromLevel ? (CEFR_HOURS[lang.fromLevel] || 0) : 0;
  return Math.round(Math.max(0, CEFR_HOURS[lang.level] - fromHours) * lang.diff);
}

export function langMonthsNeeded(lang, hoursPerDay) {
  const hours = langHoursNeeded(lang);
  return hours / (hoursPerDay * 30);
}

// Builds a start/finish schedule across the whole chain: each chain language starts
// the day the previous one (by `order`) finishes. Non-chain languages are scheduled
// independently starting today.
export function computeLangSchedule(languages, hoursPerDay) {
  const sched = {};
  const chainLangs = languages.filter(l => l.chain !== false).sort((a, b) => a.order - b.order);
  let cursor = new Date();

  chainLangs.forEach(lang => {
    const months = langMonthsNeeded(lang, hoursPerDay);
    const start = new Date(cursor);
    const finish = new Date(cursor);
    finish.setDate(finish.getDate() + Math.round(months * 30));
    sched[lang.key] = { start, finish, months, hours: langHoursNeeded(lang) };
    cursor = finish;
  });

  languages.filter(l => l.chain === false).forEach(lang => {
    const months = langMonthsNeeded(lang, hoursPerDay);
    const start = new Date();
    const finish = new Date();
    finish.setDate(finish.getDate() + Math.round(months * 30));
    sched[lang.key] = { start, finish, months, hours: langHoursNeeded(lang) };
  });

  return sched;
}

export function bridgeCellText(lang, languages) {
  if (lang.bridge) {
    const bridgeLang = languages.find(l => l.key === lang.bridge);
    return bridgeLang ? bridgeLang.name : lang.bridge;
  }
  if (lang.fromLevel) return `уже на ${lang.fromLevel}`;
  if (lang.chain === false) return '—';
  return 'с нуля';
}

export function fmtDate(d) {
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
}

export const STATUS_LABEL = { todo: 'Не начато', learning: 'Изучаю', done: 'Готово' };
export const STATUS_EMOJI = { todo: '', learning: '📖 ', done: '✅ ' };
