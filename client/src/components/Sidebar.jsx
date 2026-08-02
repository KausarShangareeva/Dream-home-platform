import { useEffect, useState, useCallback } from 'react';
import { api } from '../api.js';
import { PEOPLE } from '../data/people.js';
import Avatar from './ui/Avatar.jsx';

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
  { id: 'personal:mama', label: 'Личные цели мамы', icon: '🗺️' },
  { id: 'personal:kausar', label: 'Личные цели — Каусар', icon: '🌸' },
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
      <div className="brand">🏡 Дом мечты</div>
      <nav>
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`nav-btn${activeTab === item.id ? ' active' : ''}`}
            onClick={() => onChangeTab(item.id)}
          >
            <span>{item.icon}</span>
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
            <span>{item.icon}</span>
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
