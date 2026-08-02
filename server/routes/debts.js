import { Router } from 'express';
import Debt from '../models/Debt.js';

const router = Router();

router.get('/', async (req, res) => {
  const debts = await Debt.find().sort({ createdAt: -1 });
  res.json(debts);
});

router.post('/', async (req, res) => {
  try {
    const { creditor, amount, description, dueDate } = req.body;
    if (!creditor || !amount) return res.status(400).json({ error: 'creditor and amount are required' });
    const debt = await Debt.create({ creditor, amount, description, dueDate });
    res.status(201).json(debt);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/debts/:id  { paidAmount? } — records a payment toward the debt
router.patch('/:id', async (req, res) => {
  const debt = await Debt.findById(req.params.id);
  if (!debt) return res.status(404).json({ error: 'debt not found' });
  if (req.body.paidAmount !== undefined) debt.paidAmount = Math.min(debt.amount, Math.max(0, Number(req.body.paidAmount)));
  if (req.body.dueDate !== undefined) debt.dueDate = req.body.dueDate;
  await debt.save();
  res.json(debt);
});

router.delete('/:id', async (req, res) => {
  await Debt.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

export default router;
