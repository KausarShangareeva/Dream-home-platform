import kausarPhoto from '../assets/kausar.jpg';
import salimPhoto from '../assets/salim.jpg';
import khalilPhoto from '../assets/khalil.jpg';
import suleimanPhoto from '../assets/suleiman.jpg';
import kayumPhoto from '../assets/kayum.jpg';
import ishaqPhoto from '../assets/ishaq.jpg';

// Family members with their real photos.
export const PEOPLE = [
  { id: 'kausar',   name: 'Каусар (мама)', color: 'var(--rose)',   photo: kausarPhoto },
  { id: 'salim',    name: 'Салим (20)',    color: 'var(--gold)',   photo: salimPhoto },
  { id: 'khalil',   name: 'Халиль (17)',   color: 'var(--teal)',   photo: khalilPhoto },
  { id: 'ibragim',  name: 'Ибрагим (23)',  color: 'var(--purple)', photo: null },
  { id: 'suleiman', name: 'Сулейман (6)',  color: 'var(--leaf)',   photo: suleimanPhoto },
  { id: 'kayum',    name: 'Каюм (14)',     color: 'var(--gold)',   photo: kayumPhoto },
  { id: 'ishaq',    name: 'Исхак (12)',    color: 'var(--teal)',   photo: ishaqPhoto },
];

export function personById(id) {
  return PEOPLE.find(p => p.id === id) || { id, name: id, color: 'var(--ink-soft)', photo: null };
}
