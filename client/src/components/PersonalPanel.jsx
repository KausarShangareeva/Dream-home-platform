import { useState } from 'react';
import OverviewTab from './OverviewTab.jsx';
import LanguagesTab from './LanguagesTab.jsx';
import BooksTab from './BooksTab.jsx';
import QuranTab from './QuranTab.jsx';

const SUB_TABS = [
  { id: 'overview', label: '🧭 Обзор' },
  { id: 'languages', label: '🗣️ Языки' },
  { id: 'books', label: '📖 Книги' },
  { id: 'quran', label: '📿 Коран' },
  // 'learn', 'career' will be added in follow-up iterations
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
    </div>
  );
}
