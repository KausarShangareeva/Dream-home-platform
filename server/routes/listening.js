import { Router } from 'express';
import mongoose from 'mongoose';
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

// Aggregation-pipeline expression that recomputes `hours` as the sum of done sessions'
// hours, straight from whatever `sessions` looks like *after* the preceding $set stage.
// Used inside findOneAndUpdate's pipeline form so the array edit + hours recompute happen
// as a single atomic operation — no fetch-modify-save race between concurrent requests.
const RECOMPUTE_HOURS_STAGE = {
  $set: {
    hours: {
      $sum: {
        $map: {
          input: { $filter: { input: { $ifNull: ['$sessions', []] }, cond: '$$this.done' } },
          as: 'x',
          in: '$$x.hours',
        },
      },
    },
  },
};

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

  const filter = { _id: req.params.id, ownerId: req.params.ownerId };
  const current = await ListeningItem.findOne(filter);
  if (!current) return res.status(404).json({ error: 'Item not found' });

  const newSessions = [];
  // Preserve hours logged before this feature existed, the first time a session is added.
  if (current.sessions.length === 0 && current.hours > 0) {
    newSessions.push({ _id: new mongoose.Types.ObjectId(), name: 'Ранее отмечено', hours: current.hours, done: true });
  }
  newSessions.push({ _id: new mongoose.Types.ObjectId(), name: name || null, hours: Number(hours), done: done !== undefined ? done : true });

  const item = await ListeningItem.findOneAndUpdate(
    filter,
    [
      { $set: { sessions: { $concatArrays: [{ $ifNull: ['$sessions', []] }, newSessions] } } },
      RECOMPUTE_HOURS_STAGE,
    ],
    { new: true }
  );
  res.status(201).json(item);
});

// PATCH /api/personal/:ownerId/listening/:id/sessions/:sessionId  { name?, hours?, done? }
router.patch('/:ownerId/listening/:id/sessions/:sessionId', async (req, res) => {
  const patch = {};
  ['name', 'hours', 'done'].forEach(f => { if (req.body[f] !== undefined) patch[f] = req.body[f]; });
  const sessionObjectId = new mongoose.Types.ObjectId(req.params.sessionId);

  const item = await ListeningItem.findOneAndUpdate(
    { _id: req.params.id, ownerId: req.params.ownerId },
    [
      {
        $set: {
          sessions: {
            $map: {
              input: { $ifNull: ['$sessions', []] },
              as: 's',
              in: {
                $cond: [{ $eq: ['$$s._id', sessionObjectId] }, { $mergeObjects: ['$$s', patch] }, '$$s'],
              },
            },
          },
        },
      },
      RECOMPUTE_HOURS_STAGE,
    ],
    { new: true }
  );
  if (!item) return res.status(404).json({ error: 'Item not found' });
  res.json(item);
});

// DELETE /api/personal/:ownerId/listening/:id/sessions/:sessionId
router.delete('/:ownerId/listening/:id/sessions/:sessionId', async (req, res) => {
  const sessionObjectId = new mongoose.Types.ObjectId(req.params.sessionId);

  const item = await ListeningItem.findOneAndUpdate(
    { _id: req.params.id, ownerId: req.params.ownerId },
    [
      { $set: { sessions: { $filter: { input: { $ifNull: ['$sessions', []] }, cond: { $ne: ['$$this._id', sessionObjectId] } } } } },
      RECOMPUTE_HOURS_STAGE,
    ],
    { new: true }
  );
  if (!item) return res.status(404).json({ error: 'Item not found' });
  res.json(item);
});

export default router;
