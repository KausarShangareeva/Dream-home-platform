const NAV_ITEMS = [
  { id: 'dashboard', label: 'Главная', icon: '🏠' },
  { id: 'dreams', label: 'Другие мечты', icon: '✨' },
  { id: 'sadaqa', label: 'Садака', icon: '💝' },
];

const PERSONAL_ITEMS = [
  { id: 'personal:mama', label: 'Личные цели мамы', icon: '🗺️' },
  { id: 'personal:kausar', label: 'Личные цели — Каусар', icon: '🌸' },
];

export default function Sidebar({ activeTab, onChangeTab }) {
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
    </aside>
  );
}
