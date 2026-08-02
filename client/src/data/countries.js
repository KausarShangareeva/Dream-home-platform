export const COUNTRIES = [
  { id: 'se', flag: 'SE', name: 'Швеция', currency: 'kr', target: 1000000 },
  { id: 'ru', flag: 'RU', name: 'Россия', currency: '₽', target: 3000000 },
  { id: 'tr', flag: 'TR', name: 'Турция', currency: '₺', target: 1200000 },
  { id: 'ae', flag: 'AE', name: 'ОАЭ', currency: 'AED', target: 500000 },
];

export function getCountry(id) {
  return COUNTRIES.find(c => c.id === id) || COUNTRIES[0];
}

// The SEK -> local-currency conversion rate for a given country (1 for Sweden itself).
export function rateFor(country, rates) {
  const rateMap = { se: 1, ru: rates?.RUB || 1, tr: rates?.TRY || 1, ae: rates?.AED || 1 };
  return rateMap[country.id] ?? 1;
}

// Amounts stored in the database are always in SEK (kr). `rates` = { RUB, TRY, AED } fetched live from the server.
// Use this for deposit totals / progress amounts, which need converting from SEK.
export function fmtCur(amount, country, rates) {
  const converted = amount * rateFor(country, rates);
  const n = Math.round(converted).toLocaleString('ru-RU');
  return country.currency === 'kr' ? `${n} kr` : `${n} ${country.currency}`;
}

// The down-payment target is already set directly in each country's own currency
// (it's a realistic local down-payment figure, not converted from SEK) — format only, no rate.
export function fmtTarget(country) {
  const n = Math.round(country.target).toLocaleString('ru-RU');
  return country.currency === 'kr' ? `${n} kr` : `${n} ${country.currency}`;
}
