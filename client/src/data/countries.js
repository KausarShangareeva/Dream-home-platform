export const COUNTRIES = [
  { id: 'se', flag: '🇸🇪', name: 'Швеция', currency: 'kr', rate: 1, target: 1000000, note: 'Копим впятером на кунтантинсатс (первый взнос) для рассрочки в Швеции. Каждый взнос приближает нас к своему дому, ин ша Аллах.' },
  { id: 'ru', flag: '🇷🇺', name: 'Россия', currency: '₽', rate: 8.15, target: 3000000, note: 'Если окажемся в России: обычно банки требуют минимум 20% от стоимости дома как первый взнос по ипотеке. Ориентир ниже — с запасом.' },
  { id: 'tr', flag: '🇹🇷', name: 'Турция', currency: '₺', rate: 4.99, target: 1200000, note: 'Если окажемся в Турции: ипотека там менее распространена, банки часто просят от 30–50% суммы сразу. Ориентир ниже — с запасом.' },
  { id: 'ae', flag: '🇦🇪', name: 'ОАЭ', currency: 'AED', rate: 0.38, target: 500000, note: 'Если окажемся в ОАЭ: для экспатов первый взнос обычно 20–25% от стоимости виллы. Ориентир ниже — с запасом.' },
];

export function getCountry(id) {
  return COUNTRIES.find(c => c.id === id) || COUNTRIES[0];
}

// Amounts are stored in the database in SEK (kr) — this converts + formats for display.
export function fmtCur(amount, country) {
  const converted = amount * country.rate;
  const n = Math.round(converted).toLocaleString('ru-RU');
  return country.currency === 'kr' ? `${n} kr` : `${n} ${country.currency}`;
}
