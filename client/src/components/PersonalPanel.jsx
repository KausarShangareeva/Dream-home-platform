import { useState } from 'react';
import OverviewTab from './OverviewTab.jsx';
import LanguagesTab from './LanguagesTab.jsx';
import BooksTab from './BooksTab.jsx';
import QuranTab from './QuranTab.jsx';
import StudyTab from './StudyTab.jsx';
import CareerTab from './CareerTab.jsx';

const SUB_TABS = [
  { id: 'overview', label: '🧭 Обзор' },
  { id: 'languages', label: '🗣️ Языки' },
  { id: 'books', label: '📖 Книги' },
  { id: 'quran', label: '📿 Коран' },
  { id: 'study', label: '🌱 Учиться' },
  { id: 'career', label: '🎯 Профессия' },
];

export default function PersonalPanel({ ownerId, title }) {
  const [subTab, setSubTab] = useState('overview');

  return (
    <div className="card">
      <h2 style={{ marginBottom: 18 }}>{title}</h2>
      <div className="tabs-row">
        {SUB_TABS.map(t => (
          <button
            key={t.id}
            className={`tab-btn${subTab === t.id ? ' active' : ''}`}
            onClick={() => setSubTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {subTab === 'overview' && <OverviewTab ownerId={ownerId} />}
      {subTab === 'languages' && <LanguagesTab ownerId={ownerId} />}
      {subTab === 'books' && <BooksTab ownerId={ownerId} />}
      {subTab === 'quran' && <QuranTab ownerId={ownerId} />}
      {subTab === 'study' && <StudyTab ownerId={ownerId} />}
      {subTab === 'career' && <CareerTab ownerId={ownerId} />}
    </div>
  );
}
