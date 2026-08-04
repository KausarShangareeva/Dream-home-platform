import { Router } from 'express';
import Book from '../models/Book.js';
import { defaultBooksFor } from '../seedData.js';

const router = Router();

async function ensureBooksSeeded(ownerId) {
  const count = await Book.countDocuments({ ownerId });
  if (count === 0) {
    const defaults = defaultBooksFor(ownerId).map(b => ({ ...b, ownerId }));
    await Book.insertMany(defaults);
  }
}

// GET /api/personal/:ownerId/books
router.get('/:ownerId/books', async (req, res) => {
  await ensureBooksSeeded(req.params.ownerId);
  const books = await Book.find({ ownerId: req.params.ownerId }).sort({ order: 1 });
  res.json(books);
});

// POST /api/personal/:ownerId/books  { title, author?, language?, pages }
router.post('/:ownerId/books', async (req, res) => {
  const { title, author, language, pages } = req.body;
  if (!title || !pages) return res.status(400).json({ error: 'title and pages are required' });
  const maxOrder = await Book.find({ ownerId: req.params.ownerId }).sort({ order: -1 }).limit(1);
  const book = await Book.create({
    ownerId: req.params.ownerId, title, author, language, pages,
    order: (maxOrder[0]?.order || 0) + 1,
  });
  res.status(201).json(book);
});

// PATCH /api/personal/:ownerId/books/reorder  { ids: [...] }
router.patch('/:ownerId/books/reorder', async (req, res) => {
  const { ids } = req.body;
  await Promise.all(ids.map((id, i) => Book.findOneAndUpdate({ _id: id, ownerId: req.params.ownerId }, { order: i })));
  res.json({ ok: true });
});

// PATCH /api/personal/:ownerId/books/:id  { status?, difficulty?, genre?, days?, doneDate?, language?, pages?, title?, author?, currentPage? }
router.patch('/:ownerId/books/:id', async (req, res) => {
  const update = {};
  ['status', 'difficulty', 'genre', 'days', 'doneDate', 'startDate', 'language', 'pages', 'title', 'author', 'currentPage'].forEach(f => {
    if (req.body[f] !== undefined) update[f] = req.body[f];
  });

  if (update.status !== undefined) {
    const current = await Book.findOne({ _id: req.params.id, ownerId: req.params.ownerId });
    if (!current) return res.status(404).json({ error: 'Книга не найдена' });
    if (update.status !== current.status) {
      const blocking = await Book.findOne({
        ownerId: req.params.ownerId,
        order: { $lt: current.order },
        status: { $ne: 'done' },
      });
      if (blocking) {
        return res.status(400).json({ error: 'Сначала нужно дочитать предыдущие книги по списку' });
      }
    }
  }

  const book = await Book.findOneAndUpdate({ _id: req.params.id, ownerId: req.params.ownerId }, update, { new: true });
  res.json(book);
});

// DELETE /api/personal/:ownerId/books/:id
router.delete('/:ownerId/books/:id', async (req, res) => {
  await Book.findOneAndDelete({ _id: req.params.id, ownerId: req.params.ownerId });
  res.status(204).end();
});

export default router;
