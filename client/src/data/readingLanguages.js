export const KNOWN_READING_LANGUAGES = [
  { name: 'Русский', flag: '🇷🇺' },
  { name: 'Татарский', flag: '🔤' },
  { name: 'Арабский', flag: '🕌' },
  { name: 'Английский', flag: '🇬🇧' },
];

export function readingLangFlag(name) {
  const m = KNOWN_READING_LANGUAGES.find(l => l.name === name);
  return m ? m.flag : '📖';
}
