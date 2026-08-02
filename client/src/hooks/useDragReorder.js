import { useEffect, useState } from 'react';

// Generic drag-to-reorder for a list of items with a Mongo `_id`.
// Returns the (possibly locally-reordered) list plus per-row drag handler props.
// Call `onPersist(idsInNewOrder)` is fired on drop so the caller can save + reload.
export function useDragReorder(items, onPersist) {
  const [dragId, setDragId] = useState(null);
  const [localIds, setLocalIds] = useState(null);

  // Reset local order whenever the real data changes (e.g. after reload).
  useEffect(() => { setLocalIds(null); }, [items]);

  const ids = localIds || items.map(i => i._id);
  const ordered = ids.map(id => items.find(i => i._id === id)).filter(Boolean);

  const getRowProps = (item) => ({
    draggable: true,
    onDragStart: () => setDragId(item._id),
    onDragEnd: () => setDragId(null),
    onDragOver: (e) => {
      e.preventDefault();
      if (!dragId || dragId === item._id) return;
      const current = (localIds || items.map(i => i._id)).slice();
      const from = current.indexOf(dragId);
      const to = current.indexOf(item._id);
      if (from === -1 || to === -1) return;
      current.splice(from, 1);
      current.splice(to, 0, dragId);
      setLocalIds(current);
    },
    onDrop: (e) => {
      e.preventDefault();
      const finalIds = localIds || items.map(i => i._id);
      setDragId(null);
      onPersist(finalIds);
    },
  });

  return { ordered, getRowProps };
}
