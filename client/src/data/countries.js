export const COUNTRIES = [
  { id: 'se', flag: 'SE', name: 'Швеция', currency: 'kr', target: 1000000 },
  { id: 'ru', flag: 'RU', name: 'Россия', currency: '₽', target: 3000000 },
  { id: 'tr', flag: 'TR', name: 'Турция', currency: '₺', target: 1200000 },
  { id: 'ae', flag: 'AE', name: 'ОАЭ', currency: 'AED', target: 500000 },
];

export function getCountry(id) {
  return COUNTRIES.find(c => c.id === id) || COUNTRIES[0];
}

// Amounts are stored in the database in SEK (kr). `rates` = { RUB, TRY, AED } fetched live from the server.
export function fmtCur(amount, country, rates) {
  const rateMap = { se: 1, ru: rates?.RUB || 1, tr: rates?.TRY || 1, ae: rates?.AED || 1 };
  const rate = rateMap[country.id] ?? 1;
  const converted = amount * rate;
  const n = Math.round(converted).toLocaleString('ru-RU');
  return country.currency === 'kr' ? `${n} kr` : `${n} ${country.currency}`;
}
