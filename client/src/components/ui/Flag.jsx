// Small, hand-made flag SVGs for just the languages this app needs — no external
// flag library, so no 400KB of unused countries in the CSS bundle.

const FLAGS = {
  gb: (
    <svg viewBox="0 0 60 36" width="20" height="12">
      <rect width="60" height="36" fill="#012169" />
      <path d="M0,0 60,36 M60,0 0,36" stroke="#fff" strokeWidth="7" />
      <path d="M0,0 60,36 M60,0 0,36" stroke="#C8102E" strokeWidth="3" />
      <path d="M30,0 30,36 M0,18 60,18" stroke="#fff" strokeWidth="11" />
      <path d="M30,0 30,36 M0,18 60,18" stroke="#C8102E" strokeWidth="6" />
    </svg>
  ),
  se: (
    <svg viewBox="0 0 60 36" width="20" height="12">
      <rect width="60" height="36" fill="#006AA7" />
      <rect x="20" width="8" height="36" fill="#FECC00" />
      <rect y="14" width="60" height="8" fill="#FECC00" />
    </svg>
  ),
  fr: (
    <svg viewBox="0 0 60 36" width="20" height="12">
      <rect width="20" height="36" fill="#0055A4" />
      <rect x="20" width="20" height="36" fill="#fff" />
      <rect x="40" width="20" height="36" fill="#EF4135" />
    </svg>
  ),
  tr: (
    <svg viewBox="0 0 60 36" width="20" height="12">
      <rect width="60" height="36" fill="#E30A17" />
      <circle cx="24" cy="18" r="9" fill="#fff" />
      <circle cx="27" cy="18" r="7.2" fill="#E30A17" />
      <polygon points="34,18 40,15.5 38,20 42,22 36,21.5 34,26 33,21 27,20.5 32,18.5" fill="#fff" />
    </svg>
  ),
  cn: (
    <svg viewBox="0 0 60 36" width="20" height="12">
      <rect width="60" height="36" fill="#DE2910" />
      <polygon points="10,6 12,12 18,12 13,15.5 15,21 10,17.5 5,21 7,15.5 2,12 8,12" fill="#FFDE00" />
    </svg>
  ),
  kr: (
    <svg viewBox="0 0 60 36" width="20" height="12">
      <rect width="60" height="36" fill="#fff" />
      <circle cx="30" cy="18" r="8" fill="#CD2E3A" />
      <path d="M30,10 a8,8 0 0 1 0,16 a4,4 0 0 1 0,-8 a4,4 0 0 0 0,-8" fill="#0047A0" />
    </svg>
  ),
  jp: (
    <svg viewBox="0 0 60 36" width="20" height="12">
      <rect width="60" height="36" fill="#fff" />
      <circle cx="30" cy="18" r="10" fill="#BC002D" />
    </svg>
  ),
  in: (
    <svg viewBox="0 0 60 36" width="20" height="12">
      <rect width="60" height="12" fill="#FF9933" />
      <rect y="12" width="60" height="12" fill="#fff" />
      <rect y="24" width="60" height="12" fill="#138808" />
      <circle cx="30" cy="18" r="4" fill="none" stroke="#000080" strokeWidth="0.8" />
    </svg>
  ),
};

const LANG_TO_COUNTRY = {
  english: 'gb', swedish: 'se', french: 'fr', turkish: 'tr',
  chinese: 'cn', korean: 'kr', japanese: 'jp', hindi: 'in',
};

// Arabic isn't tied to one country flag in this context — keep the mosque emoji.
const EMOJI_FALLBACK = { arabic: '🕌' };

export default function Flag({ langKey }) {
  if (EMOJI_FALLBACK[langKey]) return <span>{EMOJI_FALLBACK[langKey]}</span>;
  const code = LANG_TO_COUNTRY[langKey];
  if (code && FLAGS[code]) return <span style={{ display: 'inline-flex', verticalAlign: 'middle', borderRadius: 2, overflow: 'hidden' }}>{FLAGS[code]}</span>;
  return <span>🌍</span>;
}
