import { Router } from 'express';
import Dream from '../models/Dream.js';
import DreamDeposit from '../models/DreamDeposit.js';

const router = Router();

// ---- Custom dreams ----

// GET /api/dreams
router.get('/', async (req, res) => {
  const dreams = await Dream.find().sort({ createdAt: 1 });
  res.json(dreams);
});

// POST /api/dreams  { title, target, icon?, photo? }
router.post('/', async (req, res) => {
  try {
    const { title, target, icon, photo } = req.body;
    if (!title || !target) return res.status(400).json({ error: 'title and target are required' });
    const dream = await Dream.create({ title, target, icon, photo });
    res.status(201).json(dream);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/dreams/:id
router.delete('/:id', async (req, res) => {
  await Dream.findByIdAndDelete(req.params.id);
  await DreamDeposit.deleteMany({ dreamId: req.params.id });
  res.status(204).end();
});

// ---- Deposits toward a dream (works for both built-in and custom dreamIds) ----

// GET /api/dreams/:dreamId/deposits
router.get('/:dreamId/deposits', async (req, res) => {
  const deposits = await DreamDeposit.find({ dreamId: req.params.dreamId }).sort({ date: -1 });
  res.json(deposits);
});

// POST /api/dreams/:dreamId/deposits  { person, amount, date }
router.post('/:dreamId/deposits', async (req, res) => {
  try {
    const { person, amount, date } = req.body;
    if (!person || !amount || !date) return res.status(400).json({ error: 'person, amount and date are required' });
    const deposit = await DreamDeposit.create({ dreamId: req.params.dreamId, person, amount, date });
    res.status(201).json(deposit);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/dreams/:dreamId/deposits/:depositId
router.delete('/:dreamId/deposits/:depositId', async (req, res) => {
  await DreamDeposit.findByIdAndDelete(req.params.depositId);
  res.status(204).end();
});

export default router;
