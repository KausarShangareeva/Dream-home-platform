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

// PATCH /api/personal/:ownerId/settings  { hoursPerDay?, booksYearlyGoal?, shelfPace?, shelfMonthOverrides? }
router.patch('/:ownerId/settings', async (req, res) => {
  const settings = await ensureSettings(req.params.ownerId);
  if (req.body.hoursPerDay !== undefined) settings.hoursPerDay = Number(req.body.hoursPerDay);
  if (req.body.booksYearlyGoal !== undefined) settings.booksYearlyGoal = Number(req.body.booksYearlyGoal);
  if (req.body.shelfPace !== undefined) settings.shelfPace = Number(req.body.shelfPace);
  if (req.body.shelfMonthOverrides !== undefined) {
    settings.shelfMonthOverrides = req.body.shelfMonthOverrides;
    settings.markModified('shelfMonthOverrides');
  }
  if (req.body.mixLanguages !== undefined) settings.mixLanguages = req.body.mixLanguages;
  await settings.save();
  res.json(settings);
});

// GET /api/personal/:ownerId/languages
router.get('/:ownerId/languages', async (req, res) => {
  await ensureLanguagesSeeded(req.params.ownerId);
  const languages = await Language.find({ ownerId: req.params.ownerId }).sort({ order: 1 });
  res.json(languages);
});

// POST /api/personal/:ownerId/languages  { name, flag?, level, diff?, key?, note?, bridge? }
// Adds a language to the chain. If `key` isn't given (custom/manual entry), one is generated.
router.post('/:ownerId/languages', async (req, res) => {
  const { name, flag, level, diff, key, note, bridge } = req.body;
  if (!name || !level) return res.status(400).json({ error: 'name and level are required' });
  const maxOrder = await Language.find({ ownerId: req.params.ownerId }).sort({ order: -1 }).limit(1);
  const nextOrder = (maxOrder[0]?.order || 0) + 1;
  const lang = await Language.create({
    ownerId: req.params.ownerId,
    key: key || (name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now()),
    name, flag: flag || '🌍', level, diff: diff || 1.0, note: note || '',
    bridge: bridge || null, chain: true, order: nextOrder, status: 'todo',
  });
  res.status(201).json(lang);
});

// PATCH /api/personal/:ownerId/languages/reorder  { ids: [...] } — new order top to bottom
router.patch('/:ownerId/languages/reorder', async (req, res) => {
  const { ids } = req.body;
  await Promise.all(ids.map((id, i) => Language.findOneAndUpdate({ _id: id, ownerId: req.params.ownerId }, { order: i })));
  res.json({ ok: true });
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
