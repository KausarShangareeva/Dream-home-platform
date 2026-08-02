import { useEffect, useState, useCallback } from 'react';
import { api } from '../api.js';
import DreamCard from './DreamCard.jsx';
import NewDreamModal from './NewDreamModal.jsx';

export default function TravelTab() {
  const [trips, setTrips] = useState([]);
  const [depositsByTrip, setDepositsByTrip] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const list = await api.getTrips();
      setTrips(list);
      const results = await Promise.all(list.map(t => api.getTripDeposits(t._id)));
      const next = {};
      list.forEach((t, i) => { next[t._id] = results[i]; });
      setDepositsByTrip(next);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  if (loading) return <div className="card"><div className="empty-state">Загрузка…</div></div>;
  if (error) return (
    <div className="card">
      <div className="empty-state">
        Не удалось загрузить данные: {error}
        <div style={{ marginTop: 10 }}><button className="btn btn-sm btn-ghost" onClick={loadAll}>Повторить</button></div>
      </div>
    </div>
  );

  const handleAddTrip = async (data) => {
    await api.addTrip({ ...data, icon: data.icon || '✈️' });
    setModalOpen(false);
    loadAll();
  };

  return (
    <div className="card">
      <h2 style={{ marginBottom: 18 }}>✈️ Путешествия</h2>
      <div className="dreams-grid">
        {trips.map(trip => {
          const deposits = depositsByTrip[trip._id] || [];
          const total = deposits.reduce((s, d) => s + d.amount, 0);
          return (
            <DreamCard
              key={trip._id}
              dream={{ id: trip._id, title: trip.title, target: trip.target, icon: trip.icon, photo: trip.photo }}
              total={total}
              deposits={deposits}
              isCustom
              onAddDeposit={(data) => api.addTripDeposit(trip._id, data).then(loadAll)}
              onUpdateDeposit={(depositId, amount) => api.updateTripDeposit(trip._id, depositId, { amount }).then(loadAll)}
              onDeleteDeposit={(depositId) => api.deleteTripDeposit(trip._id, depositId).then(loadAll)}
              onDeleteDream={() => api.deleteTrip(trip._id).then(loadAll)}
            />
          );
        })}
        <button className="dream-add-card" onClick={() => setModalOpen(true)}>
          <span style={{ fontSize: 28 }}>＋</span>
          <span>Добавить поездку</span>
        </button>
      </div>
      <NewDreamModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleAddTrip}
        modalTitle="✈️ Новая поездка"
        saveLabel="Добавить поездку"
        namePlaceholder="Куда едем"
      />
    </div>
  );
}
