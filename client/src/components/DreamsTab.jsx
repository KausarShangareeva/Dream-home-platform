import { useEffect, useState, useCallback, useRef } from 'react';
import { api } from '../api.js';
import { BUILTIN_DREAMS } from '../data/builtinDreams.js';
import DreamCard from './DreamCard.jsx';
import NewDreamModal from './NewDreamModal.jsx';

export default function DreamsTab() {
  const [customDreams, setCustomDreams] = useState([]);
  const [depositsByDream, setDepositsByDream] = useState({}); // dreamId -> [deposits]
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDream, setEditingDream] = useState(null); // dream being edited, or null when adding new
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const allDreams = [...BUILTIN_DREAMS, ...customDreams.map(d => ({ ...d, id: d._id, isCustom: true }))];

  const loadedOnceRef = useRef(false);
  const loadAll = useCallback(async () => {
    if (!loadedOnceRef.current) setLoading(true);
    setError(null);
    try {
      const custom = await api.getDreams();
      setCustomDreams(custom);
      const ids = [...BUILTIN_DREAMS.map(d => d.id), ...custom.map(d => d._id)];
      const results = await Promise.all(ids.map(id => api.getDreamDeposits(id)));
      const next = {};
      ids.forEach((id, i) => { next[id] = results[i]; });
      setDepositsByDream(next);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      loadedOnceRef.current = true;
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleSaveDream = async (data) => {
    if (editingDream) {
      await api.updateDream(editingDream.id, data);
    } else {
      await api.addDream(data);
    }
    setModalOpen(false);
    setEditingDream(null);
    loadAll();
  };

  const openEdit = (dream) => {
    setEditingDream(dream);
    setModalOpen(true);
  };

  const handleDeleteDream = async (id) => {
    await api.deleteDream(id);
    loadAll();
  };

  const handleAddDeposit = async (dreamId, data) => {
    const existing = (depositsByDream[dreamId] || []).find(d => d.person === data.person);
    if (existing) {
      await api.updateDreamDeposit(dreamId, existing._id, { amount: existing.amount + data.amount });
    } else {
      await api.addDreamDeposit(dreamId, data);
    }
    loadAll();
  };

  const handleUpdateDeposit = async (dreamId, depositId, amount) => {
    await api.updateDreamDeposit(dreamId, depositId, { amount });
    loadAll();
  };

  const handleDeleteDeposit = async (dreamId, depositId) => {
    await api.deleteDreamDeposit(dreamId, depositId);
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

  return (
    <div className="card">
      <div className="dreams-grid">
        {allDreams.map(dream => {
          const deposits = depositsByDream[dream.id] || [];
          const total = deposits.reduce((s, d) => s + d.amount, 0);
          return (
            <DreamCard
              key={dream.id}
              dream={dream}
              total={total}
              deposits={deposits}
              isCustom={dream.isCustom}
              onAddDeposit={(data) => handleAddDeposit(dream.id, data)}
              onUpdateDeposit={(depositId, amount) => handleUpdateDeposit(dream.id, depositId, amount)}
              onDeleteDeposit={(depositId) => handleDeleteDeposit(dream.id, depositId)}
              onDeleteDream={() => handleDeleteDream(dream.id)}
              onEdit={dream.isCustom ? () => openEdit(dream) : null}
            />
          );
        })}
        <button className="dream-add-card" onClick={() => { setEditingDream(null); setModalOpen(true); }}>
          <span style={{ fontSize: 28 }}>＋</span>
          <span>Добавить свою мечту</span>
        </button>
      </div>

      <NewDreamModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingDream(null); }}
        onSave={handleSaveDream}
        editingDream={editingDream}
        modalTitle={editingDream ? '✏️ Изменить мечту' : '✨ Новая мечта'}
        saveLabel={editingDream ? 'Сохранить' : 'Добавить мечту'}
      />
    </div>
  );
}
