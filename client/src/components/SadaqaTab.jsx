import { useEffect, useState, useCallback } from 'react';
import { api } from '../api.js';
import { PEOPLE, personById } from '../data/people.js';
import Avatar from './ui/Avatar.jsx';
import DeleteButton from './ui/DeleteButton.jsx';
import UseMoneyModal from './UseMoneyModal.jsx';

const fmt = (n) => Math.round(n).toLocaleString('ru-RU') + ' kr';

export default function SadaqaTab() {
  const [deposits, setDeposits] = useState([]);
  const [causes, setCauses] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [depPerson, setDepPerson] = useState(PEOPLE[0].id);
  const [depAmount, setDepAmount] = useState('');

  const [newCauseIcon, setNewCauseIcon] = useState('💝');
  const [newCauseName, setNewCauseName] = useState('');

  const [useModalCause, setUseModalCause] = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [d, c, a] = await Promise.all([api.getSadaqaDeposits(), api.getCauses(), api.getAllocations()]);
      setDeposits(d); setCauses(c); setAllocations(a);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ---- derived numbers ----
  const usedByPerson = (personId) => {
    let used = 0;
    allocations.forEach(a => a.breakdown.forEach(b => { if (b.person === personId) used += b.amount; }));
    causes.forEach(c => c.pending.forEach(p => { if (p.person === personId) used += p.amount; }));
    return used;
  };
  const depositedByPerson = (personId) => deposits.filter(d => d.person === personId).reduce((s, d) => s + d.amount, 0);
  const availableByPerson = (personId) => depositedByPerson(personId) - usedByPerson(personId);

  const causeSent = (causeId) => allocations.filter(a => a.causeId === causeId).reduce((s, a) => s + a.breakdown.reduce((x, b) => x + b.amount, 0), 0);
  const causePending = (cause) => cause.pending.reduce((s, p) => s + p.amount, 0);
  const causeContributors = (cause) => {
    const totals = {};
    allocations.filter(a => a.causeId === cause._id).forEach(a => a.breakdown.forEach(b => { totals[b.person] = (totals[b.person] || 0) + b.amount; }));
    cause.pending.forEach(p => { totals[p.person] = (totals[p.person] || 0) + p.amount; });
    return Object.entries(totals).filter(([, amt]) => amt > 0);
  };

  // ---- actions ----
  const submitDeposit = async (e) => {
    e.preventDefault();
    if (!depAmount || Number(depAmount) <= 0) return;
    await api.addSadaqaDeposit({ person: depPerson, amount: Number(depAmount), date: new Date().toISOString().slice(0, 10) });
    setDepAmount(''); loadAll();
  };

  const addCause = async () => {
    if (!newCauseName.trim()) return alert('Впишите название организации');
    await api.addCause({ name: newCauseName.trim(), icon: newCauseIcon.trim() || '💝', contact: '', goal: 0 });
    setNewCauseName(''); setNewCauseIcon('💝'); loadAll();
  };

  const updateGoal = async (cause, goal) => {
    await api.updateCause(cause._id, { goal: Math.max(0, Number(goal) || 0) });
    loadAll();
  };

  const useMoney = async (breakdown) => {
    await api.useCauseMoney(useModalCause._id, breakdown);
    setUseModalCause(null); loadAll();
  };

  const sendMoney = async (cause) => {
    await api.sendCauseMoney(cause._id);
    loadAll();
  };

  if (loading) return <div className="card"><div className="empty-state">Загрузка…</div></div>;
  if (error) return (
    <div className="card">
      <div className="empty-state">
        Не удалось загрузить данные: {error}
        <div style={{ marginTop: 10 }}><button className="btn btn-sm btn-ghost" onClick={loadAll}>Повторить</button></div>
      </div>
    </div>
  );

  const availabilityMap = Object.fromEntries(PEOPLE.map(p => [p.id, availableByPerson(p.id)]));

  return (
    <div className="card">
      {/* ---- who deposited how much ---- */}
      <div className="mama-table-wrap">
        <table className="mama-table">
          <thead><tr><th className="col-title">Кто</th><th>Сумма</th><th>Дата</th><th>Использовано</th><th>Остаток</th></tr></thead>
          <tbody>
            {deposits.length === 0 && <tr><td colSpan={5} className="empty-state">Пока никто не отчислил на садаку</td></tr>}
            {deposits.map(d => {
              const p = personById(d.person);
              const used = usedByPerson(d.person);
              const remaining = availableByPerson(d.person);
              return (
                <tr key={d._id}>
                  <td className="col-title"><Avatar person={p} size={22} /> {p.name}</td>
                  <td>{fmt(d.amount)}</td>
                  <td>{d.date}</td>
                  <td style={{ color: used > 0 ? '#c0392b' : 'inherit' }}>{used > 0 ? '-' + fmt(used) : '—'}</td>
                  <td>{fmt(remaining)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <form className="form-row" onSubmit={submitDeposit}>
        <div className="field">
          <label>Кто</label>
          <select value={depPerson} onChange={e => setDepPerson(e.target.value)}>
            {PEOPLE.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Сумма, kr</label>
          <input type="number" min="1" value={depAmount} onChange={e => setDepAmount(e.target.value)} />
        </div>
        <div className="field" style={{ justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" type="submit">+ Отчислить на садаку</button>
        </div>
      </form>

      {/* ---- causes ---- */}
      <h3 style={{ margin: '28px 0 12px', fontSize: 15 }}>Куда отправить</h3>
      <div className="mama-table-wrap">
        <table className="mama-table">
          <thead><tr><th className="col-title">Организация</th><th>Цель</th><th>Собрано</th><th>Осталось</th><th></th><th></th></tr></thead>
          <tbody>
            {causes.length === 0 && <tr><td colSpan={6} className="empty-state">Пока нет организаций — добавьте ниже</td></tr>}
            {causes.map(c => {
              const sent = causeSent(c._id);
              const pending = causePending(c);
              const progress = sent + pending;
              const short = c.goal > 0 ? Math.max(0, c.goal - progress) : null;
              const readyToSend = pending > 0 && (c.goal === 0 || progress >= c.goal);
              return (
                <tr key={c._id}>
                  <td className="col-title">{c.icon} {c.name}</td>
                  <td><input type="number" min="0" defaultValue={c.goal} style={{ maxWidth: 90 }} onBlur={e => updateGoal(c, e.target.value)} /></td>
                  <td>
                    {fmt(progress)}
                    <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
                      {causeContributors(c).map(([personId, amt]) => (
                        <span className="hb-chip" key={personId}><Avatar person={personById(personId)} size={16} /> {fmt(amt)}</span>
                      ))}
                    </div>
                  </td>
                  <td>{short === null ? '—' : fmt(short)}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button className="btn btn-sm btn-ghost" onClick={() => setUseModalCause(c)}>Использовать</button>
                    {readyToSend && <button className="btn btn-sm btn-primary" style={{ marginLeft: 6 }} onClick={() => sendMoney(c)}>Отправить</button>}
                  </td>
                  <td><DeleteButton onConfirm={async () => { await api.deleteCause(c._id); loadAll(); }} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="form-row">
        <div className="field" style={{ maxWidth: 90 }}>
          <label>Значок</label>
          <input value={newCauseIcon} onChange={e => setNewCauseIcon(e.target.value)} maxLength={4} />
        </div>
        <div className="field">
          <label>Название организации</label>
          <input value={newCauseName} onChange={e => setNewCauseName(e.target.value)} />
        </div>
        <div className="field" style={{ justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={addCause} type="button">+ Добавить организацию</button>
        </div>
      </div>

      {/* ---- history ---- */}
      <h3 style={{ margin: '28px 0 12px', fontSize: 15 }}>История отправок</h3>
      {allocations.length === 0 && <div className="empty-state">Пока ничего не отправлено</div>}
      {allocations.length > 0 && (
        <div>
          {allocations.map(a => {
            const cause = causes.find(c => c._id === a.causeId) || { icon: '💝', name: 'Удалённая организация' };
            const total = a.breakdown.reduce((s, b) => s + b.amount, 0);
            return (
              <div className="hist2-row" key={a._id}>
                <div className="hist2-icon">{cause.icon}</div>
                <div className="hist2-main">
                  <div className="hist2-title">{cause.name}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                    {a.breakdown.map((b, i) => (
                      <span className="hb-chip" key={i}><Avatar person={personById(b.person)} size={16} /> {fmt(b.amount)}</span>
                    ))}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="hist2-amount">-{fmt(total)}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>{a.date}</div>
                </div>
                <DeleteButton onConfirm={async () => { await api.deleteAllocation(a._id); loadAll(); }} />
              </div>
            );
          })}
        </div>
      )}

      <UseMoneyModal
        open={!!useModalCause}
        cause={useModalCause}
        availableByPerson={availabilityMap}
        onClose={() => setUseModalCause(null)}
        onSave={useMoney}
      />
    </div>
  );
}
