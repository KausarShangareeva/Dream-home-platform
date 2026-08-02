// Default language chains, ported from the original single-file version.
// `order` determines the bridge/scheduling chain sequence (lower = earlier).

export function defaultMamaLanguages() {
  const L = (key, name, flag, level, bridge, diff, order, status = 'todo', note = '') => ({
    key, name, flag, level, bridge, diff, order, status, note, chain: true, fromLevel: null, removable: false,
  });
  return [
    L('english', 'Английский', '🇬🇧', 'B2', null, 1.00, 1, 'learning', 'база — с неё начинаем'),
    L('swedish', 'Шведский', '🇸🇪', 'B2', 'english', 0.75, 2, 'learning', 'германская семья, как английский'),
    L('arabic', 'Арабский', '🕌', 'C1', null, 1.70, 3, 'learning', 'уже учите — для Корана'),
    L('turkish', 'Турецкий', '🇹🇷', 'B1', 'arabic', 1.30, 4, 'todo', 'много арабских слов в турецком'),
    L('chinese', 'Китайский', '🇨🇳', 'B1', null, 1.70, 5, 'todo', 'новая ветка — тона + иероглифы, самый сложный старт'),
    L('korean', 'Корейский', '🇰🇷', 'B1', 'chinese', 1.30, 6, 'todo', '~60% корейских слов — китайские заимствования'),
    L('japanese', 'Японский', '🇯🇵', 'B1', 'korean', 1.10, 7, 'todo', 'двойной мост: грамматика как в корейском + кандзи как в китайском'),
  ];
}

export function defaultKausarLanguages() {
  const L = (key, name, flag, level, bridge, diff, order, status, note, fromLevel = null) => ({
    key, name, flag, level, bridge, diff, order, status, note, chain: true, fromLevel, removable: false,
  });
  return [
    L('english', 'Английский', '🇬🇧', 'C2', null, 1.00, 1, 'learning', 'уже на уровне B1, продолжаем до C2', 'B1'),
    L('swedish', 'Шведский', '🇸🇪', 'B1', 'english', 0.75, 2, 'todo', 'германская семья, как английский'),
    L('french', 'Французский', '🇫🇷', 'B1', 'english', 1.15, 3, 'todo', 'много общей лексики с английским'),
    L('arabic', 'Арабский', '🕌', 'C2', null, 1.70, 4, 'todo', 'новая ветка — алфавит с нуля'),
    L('turkish', 'Турецкий', '🇹🇷', 'B1', 'arabic', 1.30, 5, 'todo', 'много арабских слов в турецком'),
    L('hindi', 'Хинди', '🇮🇳', 'B1', 'arabic', 1.55, 6, 'todo', 'лексика пересекается через урду/фарси/арабский'),
    L('chinese', 'Китайский', '🇨🇳', 'B1', null, 1.70, 7, 'todo', 'новая ветка — тона + иероглифы, самый сложный старт'),
    L('korean', 'Корейский', '🇰🇷', 'B1', 'chinese', 1.30, 8, 'todo', '~60% корейских слов — китайские заимствования'),
    L('japanese', 'Японский', '🇯🇵', 'B1', 'korean', 1.10, 9, 'todo', 'двойной мост: грамматика как в корейском + кандзи как в китайском'),
  ];
}

export function defaultLanguagesFor(ownerId) {
  return ownerId === 'kausar' ? defaultKausarLanguages() : defaultMamaLanguages();
}
