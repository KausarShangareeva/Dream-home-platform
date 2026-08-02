import { useState } from 'react';
import LanguagesTab from './LanguagesTab.jsx';

const SUB_TABS = [
  { id: 'languages', label: '🗣️ Языки' },
  // 'books', 'learn', 'career', 'quran' will be added in follow-up iterations
];

export default function PersonalPanel({ ownerId, title }) {
  const [subTab, setSubTab] = useState('languages');

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
      {subTab === 'languages' && <LanguagesTab ownerId={ownerId} />}
    </div>
  );
}
