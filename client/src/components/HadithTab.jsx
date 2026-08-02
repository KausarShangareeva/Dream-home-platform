import { HADITHS } from '../data/staticContent.js';

export default function HadithTab() {
  return (
    <div className="card">
      <h2 style={{ marginBottom: 18 }}>📿 Хадисы и аяты</h2>
      <div className="hadith-grid">
        {HADITHS.map((q, i) => (
          <div className="hadith-card" key={i}>
            <p>{q.text}</p>
            <span className="hadith-src">{q.src}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
