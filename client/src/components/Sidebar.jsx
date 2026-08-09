import { useEffect, useState, useCallback } from 'react';
import { api } from '../api.js';
import { PEOPLE } from '../data/people.js';
import Avatar from './ui/Avatar.jsx';
import mamaPhoto from '../assets/mama.jpg';
import kausarPhoto from '../assets/kausar.jpg';
import kayumPhoto from '../assets/kayum.jpg';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Главная', icon: '🏠' },
  { id: 'dreams', label: 'Другие мечты', icon: '✨' },
  { id: 'travel', label: 'Путешествия', icon: '✈️' },
  { id: 'debts', label: 'Долги', icon: '💳' },
  { id: 'sadaqa', label: 'Садака', icon: '💝' },
  { id: 'hadith', label: 'Хадисы', icon: '📿' },
  { id: 'tips', label: 'Что учесть', icon: '🧭' },
];

const PERSONAL_ITEMS = [
  { id: 'personal:mama', label: 'Личные цели мамы', icon: '🗺️', photo: mamaPhoto },
  { id: 'personal:kausar', label: 'Личные цели — Каусар', icon: '🌸', photo: kausarPhoto },
  { id: 'personal:kayum', label: 'Личные цели — Каюм', icon: '📚', photo: kayumPhoto },
];

export default function Sidebar({ activeTab, onChangeTab }) {
  const [totals, setTotals] = useState({});

  const loadTotals = useCallback(async () => {
    try {
      const [mainDeposits, dreams] = await Promise.all([api.getDeposits(), api.getDreams()]);
      const next = {};
      PEOPLE.forEach(p => { next[p.id] = 0; });
      mainDeposits.forEach(d => { next[d.person] = (next[d.person] || 0) + d.amount; });
      const dreamDepositLists = await Promise.all(dreams.map(d => api.getDreamDeposits(d._id)));
      dreamDepositLists.flat().forEach(d => { next[d.person] = (next[d.person] || 0) + d.amount; });
      setTotals(next);
    } catch {
      // sidebar totals are a nice-to-have; silently skip if the backend isn't reachable yet
    }
  }, []);

  useEffect(() => { loadTotals(); }, [loadTotals, activeTab]);

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="mark">
          <svg viewBox="0 0 40 40" width="26" height="26" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 15 L20 7 L31 15" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
            <text x="20" y="31" textAnchor="middle" fontFamily="Montserrat, sans-serif" fontWeight="800" fontSize="16" fill="#fff" letterSpacing="-0.5">ДМ</text>
          </svg>
        </div>
        <h1>Дом мечты</h1>
        <p>Копилка семьи Shangareev</p>
      </div>
      <nav>
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`nav-btn${activeTab === item.id ? ' active' : ''}`}
            onClick={() => onChangeTab(item.id)}
          >
            <span className="ic">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <div style={{ borderTop: '1px solid var(--line)', margin: '4px 0' }} />
      <nav>
        {PERSONAL_ITEMS.map(item => (
          <button
            key={item.id}
            className={`nav-btn${activeTab === item.id ? ' active' : ''}`}
            onClick={() => onChangeTab(item.id)}
          >
            <span className="ic">
              {item.photo ? <img src={item.photo} alt="" /> : item.icon}
            </span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-people">
        <h4>Кто сколько внёс</h4>
        {PEOPLE.map(p => (
          <div className="mini-person" key={p.id}>
            <Avatar person={p} size={26} />
            <span>{p.name.split(' ')[0]}</span>
            <b>{Math.round(totals[p.id] || 0).toLocaleString('ru-RU')} kr</b>
          </div>
        ))}
      </div>
    </aside>
  );
}
