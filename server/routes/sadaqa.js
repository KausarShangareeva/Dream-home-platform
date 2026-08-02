import { Router } from 'express';
import SadaqaDeposit from '../models/SadaqaDeposit.js';
import SadaqaCause from '../models/SadaqaCause.js';
import SadaqaAllocation from '../models/SadaqaAllocation.js';

const router = Router();

// ---- Deposits (who gave how much to the sadaqa pool) ----

router.get('/deposits', async (req, res) => {
  const deposits = await SadaqaDeposit.find().sort({ date: -1 });
  res.json(deposits);
});

router.post('/deposits', async (req, res) => {
  try {
    const { person, amount, date } = req.body;
    if (!person || !amount || !date) return res.status(400).json({ error: 'person, amount and date are required' });
    const deposit = await SadaqaDeposit.create({ person, amount, date });
    res.status(201).json(deposit);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/deposits/:id', async (req, res) => {
  await SadaqaDeposit.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

// ---- Causes (organizations) ----

router.get('/causes', async (req, res) => {
  const causes = await SadaqaCause.find().sort({ createdAt: 1 });
  res.json(causes);
});

router.post('/causes', async (req, res) => {
  try {
    const { name, icon, contact, goal } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const cause = await SadaqaCause.create({ name, icon, contact, goal });
    res.status(201).json(cause);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.patch('/causes/:id', async (req, res) => {
  const { name, icon, contact, goal } = req.body;
  const update = {};
  if (name !== undefined) update.name = name;
  if (icon !== undefined) update.icon = icon;
  if (contact !== undefined) update.contact = contact;
  if (goal !== undefined) update.goal = goal;
  const cause = await SadaqaCause.findByIdAndUpdate(req.params.id, update, { new: true });
  res.json(cause);
});

router.delete('/causes/:id', async (req, res) => {
  await SadaqaCause.findByIdAndDelete(req.params.id);
  await SadaqaAllocation.deleteMany({ causeId: req.params.id });
  res.status(204).end();
});

// POST /api/sadaqa/causes/:id/use   { breakdown: [{person, amount}] }
// Earmarks money for this cause (accumulates into `pending`), without finalizing the send yet.
router.post('/causes/:id/use', async (req, res) => {
  const { breakdown } = req.body;
  if (!Array.isArray(breakdown) || !breakdown.length) {
    return res.status(400).json({ error: 'breakdown array is required' });
  }
  const cause = await SadaqaCause.findById(req.params.id);
  if (!cause) return res.status(404).json({ error: 'cause not found' });

  breakdown.forEach(({ person, amount }) => {
    if (!person || !amount) return;
    const existing = cause.pending.find(p => p.person === person);
    if (existing) existing.amount += Number(amount);
    else cause.pending.push({ person, amount: Number(amount) });
  });
  await cause.save();
  res.json(cause);
});

// POST /api/sadaqa/causes/:id/send
// Finalizes whatever is currently pending into a history record, then clears pending.
router.post('/causes/:id/send', async (req, res) => {
  const cause = await SadaqaCause.findById(req.params.id);
  if (!cause) return res.status(404).json({ error: 'cause not found' });
  if (!cause.pending.length) return res.status(400).json({ error: 'nothing pending to send' });

  const allocation = await SadaqaAllocation.create({
    causeId: cause._id,
    breakdown: cause.pending,
    date: new Date().toISOString().slice(0, 10),
  });
  cause.pending = [];
  await cause.save();
  res.status(201).json(allocation);
});

// ---- Allocations (history of finalized sends) ----

router.get('/allocations', async (req, res) => {
  const allocations = await SadaqaAllocation.find().sort({ date: -1 });
  res.json(allocations);
});

// Deleting an allocation just removes the history record — the money automatically
// becomes "available" again because availability = deposited - (allocations + pending).
router.delete('/allocations/:id', async (req, res) => {
  await SadaqaAllocation.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

export default router;
