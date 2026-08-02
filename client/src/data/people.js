// Family members. Swap `photo: null` for an imported image path once you add real photos
// to src/assets and `import kausarPhoto from '../assets/kausar.jpg'`.
export const PEOPLE = [
  { id: 'kausar',   name: 'Каусар',   color: 'var(--rose)',   photo: null },
  { id: 'salim',    name: 'Салим',    color: 'var(--gold)',   photo: null },
  { id: 'khalil',   name: 'Халиль',   color: 'var(--teal)',   photo: null },
  { id: 'ibragim',  name: 'Ибрагим',  color: 'var(--purple)', photo: null },
  { id: 'suleiman', name: 'Сулейман', color: 'var(--leaf)',   photo: null },
  { id: 'kayum',    name: 'Каюм',     color: 'var(--gold)',   photo: null },
  { id: 'ishaq',    name: 'Исхак',    color: 'var(--teal)',   photo: null },
];

export function personById(id) {
  return PEOPLE.find(p => p.id === id) || { id, name: id, color: 'var(--ink-soft)', photo: null };
}

// Built-in dream cards (in addition to whatever custom dreams are added via the API).
export const BUILTIN_DREAMS = [
  { id: 'furniture', title: 'Мебель для нового дома', target: 50000, icon: '🛋️' },
  { id: 'garden',    title: 'Сад и двор',              target: 30000, icon: '🌳' },
  { id: 'car',       title: 'Семейная машина',          target: 150000, icon: '🚗' },
];
