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

function recomputeHours(item) {
  item.hours = item.sessions.filter(s => s.done).reduce((sum, s) => sum + s.hours, 0);
}

// GET /api/personal/:ownerId/listening
router.get('/:ownerId/listening', async (req, res) => {
  await ensureListeningSeeded(req.params.ownerId);
  const items = await ListeningItem.find({ ownerId: req.params.ownerId }).sort({ order: 1 });
  res.json(items);
});

// POST /api/personal/:ownerId/listening  { title, language?, type?, theme?, difficulty?, link? }
router.post('/:ownerId/listening', async (req, res) => {
  const { title, language, type, theme, difficulty, link } = req.body;
  if (!title) return res.status(400).json({ error: 'title is required' });
  const maxOrder = await ListeningItem.find({ ownerId: req.params.ownerId }).sort({ order: -1 }).limit(1);
  const item = await ListeningItem.create({
    ownerId: req.params.ownerId, title, language, type, theme, difficulty, link,
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

// PATCH /api/personal/:ownerId/listening/:id  { title?, language?, type?, theme?, difficulty?, link?, status? }
// Note: `hours` is intentionally not editable here — it's derived from sessions.
router.patch('/:ownerId/listening/:id', async (req, res) => {
  const update = {};
  ['title', 'language', 'type', 'theme', 'difficulty', 'link', 'status', 'doneDate'].forEach(f => {
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

// ---- Sessions (episodes checked off, or ad-hoc logged listening time) ----

// POST /api/personal/:ownerId/listening/:id/sessions  { name?, hours, done? }
router.post('/:ownerId/listening/:id/sessions', async (req, res) => {
  const { name, hours, done } = req.body;
  if (!hours) return res.status(400).json({ error: 'hours is required' });
  const item = await ListeningItem.findOne({ _id: req.params.id, ownerId: req.params.ownerId });
  if (!item) return res.status(404).json({ error: 'Item not found' });
  // Preserve hours logged before this feature existed, the first time a session is added.
  if (item.sessions.length === 0 && item.hours > 0) {
    item.sessions.push({ name: 'Ранее отмечено', hours: item.hours, done: true });
  }
  item.sessions.push({ name: name || null, hours: Number(hours), done: done !== undefined ? done : true });
  recomputeHours(item);
  await item.save();
  res.status(201).json(item);
});

// PATCH /api/personal/:ownerId/listening/:id/sessions/:sessionId  { name?, hours?, done? }
router.patch('/:ownerId/listening/:id/sessions/:sessionId', async (req, res) => {
  const item = await ListeningItem.findOne({ _id: req.params.id, ownerId: req.params.ownerId });
  if (!item) return res.status(404).json({ error: 'Item not found' });
  const session = item.sessions.id(req.params.sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  ['name', 'hours', 'done'].forEach(f => { if (req.body[f] !== undefined) session[f] = req.body[f]; });
  recomputeHours(item);
  await item.save();
  res.json(item);
});

// DELETE /api/personal/:ownerId/listening/:id/sessions/:sessionId
router.delete('/:ownerId/listening/:id/sessions/:sessionId', async (req, res) => {
  const item = await ListeningItem.findOne({ _id: req.params.id, ownerId: req.params.ownerId });
  if (!item) return res.status(404).json({ error: 'Item not found' });
  item.sessions.id(req.params.sessionId)?.deleteOne();
  recomputeHours(item);
  await item.save();
  res.json(item);
});

export default router;
