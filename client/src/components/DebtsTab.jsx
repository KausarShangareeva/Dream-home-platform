import { useEffect, useState, useCallback, useRef } from 'react';
import { api } from '../api.js';
import DeleteButton from './ui/DeleteButton.jsx';

const fmt = (n) => Math.round(n).toLocaleString('ru-RU') + ' kr';

export default function DebtsTab() {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [creditor, setCreditor] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');

  const loadedOnceRef = useRef(false);
  const load = useCallback(async () => {
    if (!loadedOnceRef.current) setLoading(true);
    setError(null);
    try { setDebts(await api.getDebts()); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); loadedOnceRef.current = true; }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="card"><div className="empty-state">Загрузка…</div></div>;
  if (error) return (
    <div className="card">
      <div className="empty-state">
        Не удалось загрузить данные: {error}
        <div style={{ marginTop: 10 }}><button className="btn btn-sm btn-ghost" onClick={load}>Повторить</button></div>
      </div>
    </div>
  );

  const totalOwed = debts.reduce((s, d) => s + (d.amount - d.paidAmount), 0);

  const addDebt = async () => {
    if (!creditor.trim() || !amount) return alert('Впишите кому и сколько должны');
    await api.addDebt({ creditor: creditor.trim(), amount: Number(amount), description: description.trim(), dueDate: dueDate || null });
    setCreditor(''); setAmount(''); setDescription(''); setDueDate('');
    load();
  };

  const recordPayment = async (debt) => {
    const value = prompt(`Сколько всего уже выплачено по долгу «${debt.creditor}»? (сейчас: ${debt.paidAmount} из ${debt.amount})`, debt.paidAmount);
    if (value === null) return;
    await api.updateDebt(debt._id, { paidAmount: Number(value) });
    load();
  };

  return (
    <div className="card">
      <p style={{ margin: '0 0 18px', fontSize: 13, color: 'var(--ink-soft)' }}>То, что семья должна другим. Итого осталось выплатить: <b style={{ color: 'var(--ink)' }}>{fmt(totalOwed)}</b></p>

      <div className="mama-table-wrap">
        <table className="mama-table">
          <thead><tr><th className="col-title">Кому</th><th>Сумма</th><th>Выплачено</th><th>Остаток</th><th>Срок</th><th></th><th></th></tr></thead>
          <tbody>
            {debts.length === 0 && <tr><td colSpan={7} className="empty-state">Долгов нет — и пусть так и будет 🤲</td></tr>}
            {debts.map(d => {
              const remaining = d.amount - d.paidAmount;
              const done = remaining <= 0;
              return (
                <tr key={d._id} style={{ opacity: done ? 0.6 : 1 }}>
                  <td className="col-title">
                    <b>{d.creditor}</b>
                    {d.description && <span style={{ display: 'block', fontSize: 11, color: 'var(--ink-soft)' }}>{d.description}</span>}
                  </td>
                  <td>{fmt(d.amount)}</td>
                  <td>{fmt(d.paidAmount)}</td>
                  <td style={{ fontWeight: 700, color: done ? 'var(--teal)' : '#c0392b' }}>{done ? 'Погашен ✅' : fmt(remaining)}</td>
                  <td>{d.dueDate || '—'}</td>
                  <td><button className="btn btn-sm btn-ghost" onClick={() => recordPayment(d)}>Внести оплату</button></td>
                  <td><DeleteButton onConfirm={async () => { await api.deleteDebt(d._id); load(); }} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="form-row">
        <div className="field"><label>Кому должны</label><input value={creditor} onChange={e => setCreditor(e.target.value)} /></div>
        <div className="field"><label>Сумма, kr</label><input type="number" min="1" value={amount} onChange={e => setAmount(e.target.value)} /></div>
        <div className="field"><label>За что (необязательно)</label><input value={description} onChange={e => setDescription(e.target.value)} /></div>
        <div className="field"><label>Срок (необязательно)</label><input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} /></div>
        <div className="field" style={{ justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" type="button" onClick={addDebt}>+ Добавить долг</button>
        </div>
      </div>
    </div>
  );
}
