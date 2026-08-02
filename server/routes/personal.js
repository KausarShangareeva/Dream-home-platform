import { Router } from 'express';
import Language from '../models/Language.js';
import PersonSettings from '../models/PersonSettings.js';
import { defaultLanguagesFor } from '../seedData.js';

const router = Router();

async function ensureSettings(ownerId) {
  let settings = await PersonSettings.findOne({ ownerId });
  if (!settings) settings = await PersonSettings.create({ ownerId });
  return settings;
}

async function ensureLanguagesSeeded(ownerId) {
  const count = await Language.countDocuments({ ownerId });
  if (count === 0) {
    const defaults = defaultLanguagesFor(ownerId).map(l => ({ ...l, ownerId }));
    await Language.insertMany(defaults);
  }
}

// GET /api/personal/:ownerId/settings
router.get('/:ownerId/settings', async (req, res) => {
  const settings = await ensureSettings(req.params.ownerId);
  res.json(settings);
});

// PATCH /api/personal/:ownerId/settings  { hoursPerDay?, booksYearlyGoal? }
router.patch('/:ownerId/settings', async (req, res) => {
  const settings = await ensureSettings(req.params.ownerId);
  if (req.body.hoursPerDay !== undefined) settings.hoursPerDay = Number(req.body.hoursPerDay);
  if (req.body.booksYearlyGoal !== undefined) settings.booksYearlyGoal = Number(req.body.booksYearlyGoal);
  await settings.save();
  res.json(settings);
});

// GET /api/personal/:ownerId/languages
router.get('/:ownerId/languages', async (req, res) => {
  await ensureLanguagesSeeded(req.params.ownerId);
  const languages = await Language.find({ ownerId: req.params.ownerId }).sort({ order: 1 });
  res.json(languages);
});

// POST /api/personal/:ownerId/languages  { name, flag?, level, diff? }
// Adds a custom language at the end of the chain (no bridge, "from scratch").
router.post('/:ownerId/languages', async (req, res) => {
  const { name, flag, level, diff } = req.body;
  if (!name || !level) return res.status(400).json({ error: 'name and level are required' });
  const maxOrder = await Language.find({ ownerId: req.params.ownerId }).sort({ order: -1 }).limit(1);
  const nextOrder = (maxOrder[0]?.order || 0) + 1;
  const lang = await Language.create({
    ownerId: req.params.ownerId,
    key: name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now(),
    name, flag: flag || '🌍', level, diff: diff || 1.0,
    bridge: null, chain: true, order: nextOrder, status: 'todo',
  });
  res.status(201).json(lang);
});

// PATCH /api/personal/:ownerId/languages/:id  { level?, status? }
router.patch('/:ownerId/languages/:id', async (req, res) => {
  const update = {};
  ['level', 'status'].forEach(f => { if (req.body[f] !== undefined) update[f] = req.body[f]; });
  const lang = await Language.findOneAndUpdate({ _id: req.params.id, ownerId: req.params.ownerId }, update, { new: true });
  res.json(lang);
});

// DELETE /api/personal/:ownerId/languages/:id
router.delete('/:ownerId/languages/:id', async (req, res) => {
  const lang = await Language.findOne({ _id: req.params.id, ownerId: req.params.ownerId });
  if (lang && lang.removable === false) {
    return res.status(400).json({ error: 'this language is part of the base set and cannot be removed' });
  }
  await Language.findOneAndDelete({ _id: req.params.id, ownerId: req.params.ownerId });
  res.status(204).end();
});

export default router;
