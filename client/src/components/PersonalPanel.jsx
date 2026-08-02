import { useState } from 'react';
import OverviewTab from './OverviewTab.jsx';
import LanguagesTab from './LanguagesTab.jsx';
import ListeningTab from './ListeningTab.jsx';
import BooksTab from './BooksTab.jsx';
import QuranTab from './QuranTab.jsx';
import StudyTab from './StudyTab.jsx';
import CareerTab from './CareerTab.jsx';

const SUB_TABS = [
  { id: 'overview', label: 'Обзор', icon: '🧭', color: 'var(--rose)' },
  { id: 'languages', label: 'Языки', icon: '🗣️', color: 'var(--gold)' },
  { id: 'listening', label: 'Аудирование', icon: '🎧', color: 'var(--purple)' },
  { id: 'books', label: 'Книги', icon: '📖', color: 'var(--violet)' },
  { id: 'quran', label: 'Коран', icon: '📿', color: 'var(--leaf)' },
  { id: 'study', label: 'Учиться', icon: '🌱', color: 'var(--teal)' },
  { id: 'career', label: 'Профессия', icon: '🎯', color: 'var(--rose)' },
];

export default function PersonalPanel({ ownerId, title, icon, photo }) {
  const [subTab, setSubTab] = useState('overview');

  return (
    <div className="card mama-corner">
      <div className="mama-header">
        <h2>
          <span className="mama-header-avatar">
            {photo ? <img src={photo} alt="" /> : icon}
          </span>
          {title}
        </h2>
      </div>
      <div className="mama-tabs">
        {SUB_TABS.map(t => (
          <button
            key={t.id}
            className={`mama-tab${subTab === t.id ? ' active' : ''}`}
            onClick={() => setSubTab(t.id)}
          >
            <span className="mtab-ic" style={{ background: t.color }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>
      {subTab === 'overview' && <OverviewTab ownerId={ownerId} />}
      {subTab === 'languages' && <LanguagesTab ownerId={ownerId} />}
      {subTab === 'listening' && <ListeningTab ownerId={ownerId} />}
      {subTab === 'books' && <BooksTab ownerId={ownerId} />}
      {subTab === 'quran' && <QuranTab ownerId={ownerId} />}
      {subTab === 'study' && <StudyTab ownerId={ownerId} />}
      {subTab === 'career' && <CareerTab ownerId={ownerId} />}
    </div>
  );
}
