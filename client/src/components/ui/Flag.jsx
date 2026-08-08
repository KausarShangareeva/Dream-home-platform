import ReactCountryFlag from 'react-country-flag';

// Tatarstan isn't a sovereign country, so there's no ISO code / emoji flag for react-country-flag
// to use. Its real flag does exist though (green–white–red tricolor with a golden tulip emblem),
// so draw it by hand instead of falling back to a generic glyph.
function TatarFlag() {
  return (
    <svg viewBox="0 0 24 24" width="1.3em" height="1.3em" style={{ borderRadius: 3, display: 'inline-block', verticalAlign: 'middle' }}>
      <rect x="0" y="0" width="24" height="24" fill="#fff" />
      <rect x="0" y="0" width="24" height="10.5" fill="#2C9F45" />
      <rect x="0" y="13.5" width="24" height="10.5" fill="#C60C30" />
      <path
        d="M8.5 9.8 C6.7 9.8 6.1 11.3 7.3 12.2 C6.1 13 6.3 14.3 7.7 14.3 L9.3 14.3 C10.7 14.3 10.9 13 9.7 12.2 C10.9 11.3 10.3 9.8 8.5 9.8 Z"
        fill="#C8A028"
      />
    </svg>
  );
}

// Maps our language keys to ISO country codes.
// react-country-flag renders lightweight SVG/PNG flags via flagcdn.com — no bundle bloat,
// no hand-drawn shapes to maintain.
const COUNTRY_CODE = {
  english: 'GB', swedish: 'SE', turkish: 'TR', chinese: 'CN', korean: 'KR',
  japanese: 'JP', french: 'FR', hindi: 'IN', spanish: 'ES', german: 'DE',
  italian: 'IT', portuguese: 'PT', urdu: 'PK', russian: 'RU', indonesian: 'ID',
  persian: 'IR',
};

// Arabic isn't tied to one country flag in this context — keep the mosque emoji.
const EMOJI_FALLBACK = { arabic: '🕌' };

export default function Flag({ langKey }) {
  if (langKey === 'tatar') return <TatarFlag />;
  if (EMOJI_FALLBACK[langKey]) return <span>{EMOJI_FALLBACK[langKey]}</span>;
  const code = COUNTRY_CODE[langKey];
  if (!code) return <span>🌍</span>;
  return <ReactCountryFlag countryCode={code} svg style={{ width: '1.3em', height: '1.3em' }} title={code} />;
}
