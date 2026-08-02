import ReactCountryFlag from 'react-country-flag';

// Maps our language keys to ISO country codes.
// react-country-flag renders lightweight SVG/PNG flags via flagcdn.com — no bundle bloat,
// no hand-drawn shapes to maintain.
const COUNTRY_CODE = {
  english: 'GB', swedish: 'SE', turkish: 'TR', chinese: 'CN', korean: 'KR',
  japanese: 'JP', french: 'FR', hindi: 'IN', spanish: 'ES', german: 'DE',
  italian: 'IT', portuguese: 'PT', urdu: 'PK', russian: 'RU', indonesian: 'ID',
};

// Arabic isn't tied to one country flag in this context — keep the mosque emoji.
// Tatar has no ISO country code either (Tatarstan isn't a country) — keep a neutral glyph.
const EMOJI_FALLBACK = { arabic: '🕌', tatar: '🔤' };

export default function Flag({ langKey }) {
  if (EMOJI_FALLBACK[langKey]) return <span>{EMOJI_FALLBACK[langKey]}</span>;
  const code = COUNTRY_CODE[langKey];
  if (!code) return <span>🌍</span>;
  return <ReactCountryFlag countryCode={code} svg style={{ width: '1.3em', height: '1.3em' }} title={code} />;
}
