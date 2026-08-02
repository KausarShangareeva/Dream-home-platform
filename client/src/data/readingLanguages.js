export const KNOWN_READING_LANGUAGES = [
  { name: 'Русский', key: 'russian', flag: '🇷🇺' },
  { name: 'Татарский', key: 'tatar', flag: '🔤' },
  { name: 'Арабский', key: 'arabic', flag: '🕌' },
  { name: 'Английский', key: 'english', flag: '🇬🇧' },
];

export function readingLangFlag(name) {
  const m = KNOWN_READING_LANGUAGES.find(l => l.name === name);
  return m ? m.flag : '📖';
}
