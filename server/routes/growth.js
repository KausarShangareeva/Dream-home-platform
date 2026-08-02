import { Router } from 'express';
import StudyItem from '../models/StudyItem.js';
import Education from '../models/Education.js';
import CareerGoal from '../models/CareerGoal.js';
import { defaultStudyItemsFor, defaultEducationFor, defaultCareerGoalsFor } from '../seedData.js';

const router = Router();

async function ensureSeeded(Model, ownerId, defaultsFn) {
  const count = await Model.countDocuments({ ownerId });
  if (count === 0) {
    const defaults = defaultsFn(ownerId).map(d => ({ ...d, ownerId }));
    if (defaults.length) await Model.insertMany(defaults);
  }
}

// ---- Study items (subjects + hobbies) ----

router.get('/:ownerId/study', async (req, res) => {
  await ensureSeeded(StudyItem, req.params.ownerId, defaultStudyItemsFor);
  const items = await StudyItem.find({ ownerId: req.params.ownerId }).sort({ category: 1, order: 1 });
  res.json(items);
});

router.post('/:ownerId/study', async (req, res) => {
  const { category, name, hours, platform, url, icon } = req.body;
  if (!category || !name) return res.status(400).json({ error: 'category and name are required' });
  const item = await StudyItem.create({ ownerId: req.params.ownerId, category, name, hours, platform, url, icon: icon || '📘' });
  res.status(201).json(item);
});

router.patch('/:ownerId/study/:id', async (req, res) => {
  const update = {};
  ['status', 'hours', 'url', 'platform'].forEach(f => { if (req.body[f] !== undefined) update[f] = req.body[f]; });
  const item = await StudyItem.findOneAndUpdate({ _id: req.params.id, ownerId: req.params.ownerId }, update, { new: true });
  res.json(item);
});

router.delete('/:ownerId/study/:id', async (req, res) => {
  await StudyItem.findOneAndDelete({ _id: req.params.id, ownerId: req.params.ownerId });
  res.status(204).end();
});

// ---- Education ----

router.get('/:ownerId/education', async (req, res) => {
  await ensureSeeded(Education, req.params.ownerId, defaultEducationFor);
  const items = await Education.find({ ownerId: req.params.ownerId }).sort({ order: 1 });
  res.json(items);
});

router.post('/:ownerId/education', async (req, res) => {
  const { faculty, university, language, years, url } = req.body;
  if (!faculty) return res.status(400).json({ error: 'faculty is required' });
  const item = await Education.create({ ownerId: req.params.ownerId, faculty, university, language, years, url });
  res.status(201).json(item);
});

router.patch('/:ownerId/education/:id', async (req, res) => {
  const update = {};
  ['level', 'done', 'years', 'url'].forEach(f => { if (req.body[f] !== undefined) update[f] = req.body[f]; });
  const item = await Education.findOneAndUpdate({ _id: req.params.id, ownerId: req.params.ownerId }, update, { new: true });
  res.json(item);
});

router.delete('/:ownerId/education/:id', async (req, res) => {
  await Education.findOneAndDelete({ _id: req.params.id, ownerId: req.params.ownerId });
  res.status(204).end();
});

// ---- Career goals ----

router.get('/:ownerId/career', async (req, res) => {
  await ensureSeeded(CareerGoal, req.params.ownerId, defaultCareerGoalsFor);
  const items = await CareerGoal.find({ ownerId: req.params.ownerId }).sort({ category: 1, order: 1 });
  res.json(items);
});

router.post('/:ownerId/career', async (req, res) => {
  const { category, name, icon } = req.body;
  if (!category || !name) return res.status(400).json({ error: 'category and name are required' });
  const item = await CareerGoal.create({ ownerId: req.params.ownerId, category, name, icon: icon || '💼' });
  res.status(201).json(item);
});

router.patch('/:ownerId/career/:id', async (req, res) => {
  const update = {};
  if (req.body.done !== undefined) update.done = req.body.done;
  const item = await CareerGoal.findOneAndUpdate({ _id: req.params.id, ownerId: req.params.ownerId }, update, { new: true });
  res.json(item);
});

router.delete('/:ownerId/career/:id', async (req, res) => {
  await CareerGoal.findOneAndDelete({ _id: req.params.id, ownerId: req.params.ownerId });
  res.status(204).end();
});

export default router;
