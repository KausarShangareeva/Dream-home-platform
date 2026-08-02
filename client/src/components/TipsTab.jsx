import { TIPS } from '../data/staticContent.js';

export default function TipsTab() {
  return (
    <div className="card">
      <h2 style={{ marginBottom: 18 }}>🧭 Что учесть при покупке дома в Швеции</h2>
      <div className="tips-grid">
        {TIPS.map((t, i) => (
          <div className="tip-card" key={i}>
            <h4>{t.icon} {t.title}</h4>
            <p>{t.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
