import { Router } from 'express';
import Surah from '../models/Surah.js';
import { defaultSurahs } from '../seedData.js';

const router = Router();

async function ensureSurahsSeeded(ownerId) {
  const count = await Surah.countDocuments({ ownerId });
  if (count === 0) {
    const defaults = defaultSurahs().map(s => ({ ...s, ownerId }));
    await Surah.insertMany(defaults);
  }
}

// GET /api/personal/:ownerId/quran
router.get('/:ownerId/quran', async (req, res) => {
  await ensureSurahsSeeded(req.params.ownerId);
  const surahs = await Surah.find({ ownerId: req.params.ownerId }).sort({ num: 1 });
  res.json(surahs);
});

// PATCH /api/personal/:ownerId/quran/:id  { status?, learningStartDate?, doneDate? }
router.patch('/:ownerId/quran/:id', async (req, res) => {
  const update = {};
  ['status', 'learningStartDate', 'doneDate', 'days'].forEach(f => {
    if (req.body[f] !== undefined) update[f] = req.body[f];
  });
  const surah = await Surah.findOneAndUpdate({ _id: req.params.id, ownerId: req.params.ownerId }, update, { new: true });
  res.json(surah);
});

export default router;
