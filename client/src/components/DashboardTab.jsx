import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { PEOPLE, personById } from '../data/people.js';
import Avatar from './ui/Avatar.jsx';
import DeleteButton from './ui/DeleteButton.jsx';

const TARGET = 1000000;
const fmt = (n) => Math.round(n).toLocaleString('ru-RU') + ' kr';

export default function DashboardTab() {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [person, setPerson] = useState(PEOPLE[0].id);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  const load = () => {
    setLoading(true); setError(null);
    api.getDeposits().then(setDeposits).catch(err => setError(err.message)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const total = deposits.reduce((s, d) => s + d.amount, 0);
  const pct = Math.min(100, (total / TARGET) * 100);
  const remaining = Math.max(0, TARGET - total);

  const submit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    await api.addDeposit({ person, amount: Number(amount), date });
    setAmount('');
    load();
  };

  const remove = async (id) => {
    await api.deleteDeposit(id);
    load();
  };

  return (
    <div className="card">
      <div className="goal-info">
        <h2>Дом мечты — цель {fmt(TARGET)}</h2>
      </div>

      <div className="track-wrap">
        <div className="amount-line">
          <span>Собрано: {fmt(total)}</span>
          <span>Осталось: {fmt(remaining)}</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <form className="form-row" onSubmit={submit}>
        <div className="field">
          <label>Кто</label>
          <select value={person} onChange={e => setPerson(e.target.value)}>
            {PEOPLE.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Сумма, kr</label>
          <input type="number" min="1" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Например: 500" />
        </div>
        <div className="field">
          <label>Дата</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <div className="field" style={{ justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" type="submit">+ Добавить взнос</button>
        </div>
      </form>

      <div className="history">
        {loading && <div className="empty-state">Загрузка…</div>}
        {error && (
          <div className="empty-state">
            Не удалось загрузить данные: {error}
            <div style={{ marginTop: 10 }}><button className="btn btn-sm btn-ghost" onClick={load}>Повторить</button></div>
          </div>
        )}
        {!loading && !error && deposits.length === 0 && <div className="empty-state">Пока нет взносов — добавьте первый выше</div>}
        {!loading && !error && deposits.map(d => {
          const p = personById(d.person);
          return (
            <div className="hist-row" key={d._id}>
              <Avatar person={p} />
              <div className="hist-main">
                <div style={{ fontWeight: 700 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>{d.date}</div>
              </div>
              <div className="hist-amount">{fmt(d.amount)}</div>
              <DeleteButton onConfirm={() => remove(d._id)} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
