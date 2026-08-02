import { Router } from 'express';
import Deposit from '../models/Deposit.js';

const router = Router();

// GET /api/deposits
router.get('/', async (req, res) => {
  const deposits = await Deposit.find().sort({ date: -1 });
  res.json(deposits);
});

// POST /api/deposits  { person, amount, date, currency?, note? }
router.post('/', async (req, res) => {
  try {
    const { person, amount, date, currency, note } = req.body;
    if (!person || !amount || !date) {
      return res.status(400).json({ error: 'person, amount and date are required' });
    }
    const deposit = await Deposit.create({ person, amount, date, currency, note });
    res.status(201).json(deposit);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/deposits/:id
router.delete('/:id', async (req, res) => {
  await Deposit.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

export default router;
