import { useEffect, useState } from 'react';
import ReactCountryFlag from 'react-country-flag';
import { api } from '../api.js';
import { PEOPLE, personById } from '../data/people.js';
import { HADITHS } from '../data/staticContent.js';
import { COUNTRIES, getCountry, fmtCur, fmtTarget, rateFor } from '../data/countries.js';
import Avatar from './ui/Avatar.jsx';
import DeleteButton from './ui/DeleteButton.jsx';
import houseImg from '../assets/house.jpg';

export default function DashboardTab() {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [person, setPerson] = useState(PEOPLE[0].id);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('');
  const [countryId, setCountryId] = useState('se');
  const [rates, setRates] = useState(null);

  const country = getCountry(countryId);

  const load = () => {
    setLoading(true); setError(null);
    api.getDeposits().then(setDeposits).catch(err => setError(err.message)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);
  useEffect(() => { api.getRates().then(setRates).catch(() => {}); }, []);

  const cur = (n) => fmtCur(n, country, rates?.rates);

  const total = deposits.reduce((s, d) => s + d.amount, 0);
  const rate = rateFor(country, rates?.rates);
  const totalInLocalCurrency = total * rate;
  const remaining = Math.max(0, country.target - totalInLocalCurrency);
  const formatLocal = (n) => {
    const rounded = Math.round(n).toLocaleString('ru-RU');
    return country.currency === 'kr' ? `${rounded} kr` : `${rounded} ${country.currency}`;
  };

  const totalsByPerson = Object.fromEntries(PEOPLE.map(p => [p.id, 0]));
  deposits.forEach(d => { totalsByPerson[d.person] = (totalsByPerson[d.person] || 0) + d.amount; });

  const submit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    await api.addDeposit({ person, amount: Number(amount), date, note });
    setAmount(''); setNote('');
    load();
  };

  const remove = async (id) => {
    await api.deleteDeposit(id);
    load();
  };

  return (
    <>
      <div className="goal-row">
        <div className="goal-photo">
          <img src={houseImg} alt="Дом мечты: 8 спален, бассейн, сад" />
          <div className="goal-photo-tag">🏡 8 спален · бассейн · сад</div>
        </div>
        <div className="goal-info">
          <span className="goal-eyebrow">🕌 Ризк ради семьи · первый взнос за дом</span>

          <div className="country-switch">
            {COUNTRIES.map(c => (
              <button
                key={c.id}
                className={`country-pill${c.id === countryId ? ' active' : ''}`}
                onClick={() => setCountryId(c.id)}
              >
                <span className="flag"><ReactCountryFlag countryCode={c.flag} svg style={{ width: '1.1em', height: '1.1em' }} /></span> {c.name}
              </button>
            ))}
          </div>

          <h2>Дом мечты — цель {fmtTarget(country)}</h2>

          <div className="people-row">
            {PEOPLE.map(p => (
              <div className="person-chip" key={p.id}>
                <Avatar person={p} />
                <div>
                  <span className="pname">{p.name.split(' ')[0]}</span>
                  <span className="pamt">{cur(totalsByPerson[p.id] || 0)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="track-wrap">
            <div className="amount-line">
              <span>Собрано: {cur(total)}</span>
              <span>Осталось: {formatLocal(remaining)}</span>
            </div>
            <input type="range" className="track" min="0" max={country.target} value={Math.min(totalInLocalCurrency, country.target)} disabled />
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3>💸 Добавить взнос</h3>
          <form onSubmit={submit}>
            <div className="form-row">
              <div className="field">
                <select value={person} onChange={e => setPerson(e.target.value)}>
                  {PEOPLE.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="field">
                <input type="number" min="1" step="1" placeholder="Сумма, kr" value={amount} onChange={e => setAmount(e.target.value)} />
              </div>
              <div className="field">
                <input type="date" aria-label="Дата" value={date} onChange={e => setDate(e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <div className="field" style={{ flex: '1 1 100%' }}>
                <select value={note} onChange={e => setNote(e.target.value)}>
                  <option value="">Откуда деньги (необязательно)</option>
                  <option value="Зарплата">Зарплата</option>
                  <option value="Подработка">Подработка</option>
                  <option value="Пособие">Пособие</option>
                  <option value="Другое">Другое</option>
                </select>
              </div>
            </div>
            <button className="btn btn-primary" type="submit"><span className="plus-sign">+</span> Внести деньги</button>
          </form>

          <h3 style={{ marginTop: 22 }}>📜 История взносов</h3>
          <div className="history">
            {loading && <div className="empty-state">Загрузка…</div>}
            {error && (
              <div className="empty-state">
                Не удалось загрузить данные: {error}
                <div style={{ marginTop: 10 }}><button className="btn btn-sm btn-ghost" onClick={load}>Повторить</button></div>
              </div>
            )}
            {!loading && !error && deposits.length === 0 && <div className="empty-state">Пока нет взносов — станьте первым и внесите деньги! 🌱</div>}
            {!loading && !error && deposits.map(d => {
              const p = personById(d.person);
              return (
                <div className="hrow" key={d._id}>
                  <Avatar person={p} />
                  <div className="meta">
                    <div className="who">{p.name}</div>
                    <div className="when">{d.date}</div>
                    {d.note && <div className="note">{d.note}</div>}
                  </div>
                  <div className="amt">{cur(d.amount)}</div>
                  <DeleteButton onConfirm={() => remove(d._id)} />
                </div>
              );
            })}
          </div>
        </div>

        <div className="quote-box">
          <h3>📿 Мотивация на каждый день</h3>
          <div className="quote-viewport">
            <div className="quote-track">
              {[...HADITHS, ...HADITHS].map((q, i) => (
                <div className="quote-item" key={i}>
                  {q.text}
                  <span className="src">{q.src}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
