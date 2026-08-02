import { Router } from 'express';
import Trip from '../models/Trip.js';
import TripDeposit from '../models/TripDeposit.js';

const router = Router();

router.get('/', async (req, res) => {
  const trips = await Trip.find().sort({ createdAt: 1 });
  res.json(trips);
});

router.post('/', async (req, res) => {
  try {
    const { title, target, icon, photo } = req.body;
    if (!title || !target) return res.status(400).json({ error: 'title and target are required' });
    const trip = await Trip.create({ title, target, icon, photo });
    res.status(201).json(trip);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  await Trip.findByIdAndDelete(req.params.id);
  await TripDeposit.deleteMany({ tripId: req.params.id });
  res.status(204).end();
});

router.get('/:tripId/deposits', async (req, res) => {
  const deposits = await TripDeposit.find({ tripId: req.params.tripId }).sort({ date: -1 });
  res.json(deposits);
});

router.post('/:tripId/deposits', async (req, res) => {
  try {
    const { person, amount, date } = req.body;
    if (!person || !amount || !date) return res.status(400).json({ error: 'person, amount and date are required' });
    const deposit = await TripDeposit.create({ tripId: req.params.tripId, person, amount, date });
    res.status(201).json(deposit);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:tripId/deposits/:depositId', async (req, res) => {
  await TripDeposit.findByIdAndDelete(req.params.depositId);
  res.status(204).end();
});

export default router;
