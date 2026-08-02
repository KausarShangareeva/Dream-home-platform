import { Router } from 'express';
import ListeningItem from '../models/ListeningItem.js';
import { defaultListeningItemsFor } from '../seedData.js';

const router = Router();

async function ensureListeningSeeded(ownerId) {
  const count = await ListeningItem.countDocuments({ ownerId });
  if (count === 0) {
    const defaults = defaultListeningItemsFor(ownerId).map(i => ({ ...i, ownerId }));
    if (defaults.length) await ListeningItem.insertMany(defaults);
  }
}

// GET /api/personal/:ownerId/listening
router.get('/:ownerId/listening', async (req, res) => {
  await ensureListeningSeeded(req.params.ownerId);
  const items = await ListeningItem.find({ ownerId: req.params.ownerId }).sort({ order: 1 });
  res.json(items);
});

// POST /api/personal/:ownerId/listening  { title, language?, type?, link?, hours? }
router.post('/:ownerId/listening', async (req, res) => {
  const { title, language, type, link, hours } = req.body;
  if (!title) return res.status(400).json({ error: 'title is required' });
  const maxOrder = await ListeningItem.find({ ownerId: req.params.ownerId }).sort({ order: -1 }).limit(1);
  const item = await ListeningItem.create({
    ownerId: req.params.ownerId, title, language, type, link, hours: hours || 0,
    order: (maxOrder[0]?.order || 0) + 1,
  });
  res.status(201).json(item);
});

// PATCH /api/personal/:ownerId/listening/reorder  { ids: [...] }
router.patch('/:ownerId/listening/reorder', async (req, res) => {
  const { ids } = req.body;
  await Promise.all(ids.map((id, i) => ListeningItem.findOneAndUpdate({ _id: id, ownerId: req.params.ownerId }, { order: i })));
  res.json({ ok: true });
});

// PATCH /api/personal/:ownerId/listening/:id  { title?, language?, type?, link?, hours?, status? }
router.patch('/:ownerId/listening/:id', async (req, res) => {
  const update = {};
  ['title', 'language', 'type', 'link', 'hours', 'status', 'doneDate'].forEach(f => {
    if (req.body[f] !== undefined) update[f] = req.body[f];
  });
  const item = await ListeningItem.findOneAndUpdate({ _id: req.params.id, ownerId: req.params.ownerId }, update, { new: true });
  res.json(item);
});

// DELETE /api/personal/:ownerId/listening/:id
router.delete('/:ownerId/listening/:id', async (req, res) => {
  await ListeningItem.findOneAndDelete({ _id: req.params.id, ownerId: req.params.ownerId });
  res.status(204).end();
});

export default router;
