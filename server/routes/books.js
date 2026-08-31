import { Router } from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import Book from '../models/Book.js';
import { defaultBooksFor } from '../seedData.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 80 * 1024 * 1024 } }); // 80MB cap — plenty for a scanned book

function pdfBucket() {
  return new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'bookPdfs' });
}

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
  const { title, titleRu, author, language, pages, difficulty, genre, country } = req.body;
  if (!title || !pages) return res.status(400).json({ error: 'title and pages are required' });
  const maxOrder = await Book.find({ ownerId: req.params.ownerId }).sort({ order: -1 }).limit(1);
  const book = await Book.create({
    ownerId: req.params.ownerId, title, titleRu, author, language, pages, difficulty, genre, country,
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
  ['status', 'difficulty', 'genre', 'days', 'doneDate', 'startDate', 'language', 'pages', 'title', 'titleRu', 'author', 'currentPage', 'country'].forEach(f => {
    if (req.body[f] !== undefined) update[f] = req.body[f];
  });

  if (update.status !== undefined) {
    const current = await Book.findOne({ _id: req.params.id, ownerId: req.params.ownerId });
    if (!current) return res.status(404).json({ error: 'Книга не найдена' });
    if (update.status !== current.status) {
      const blocking = await Book.findOne({
        ownerId: req.params.ownerId,
        language: current.language,
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
  const book = await Book.findOne({ _id: req.params.id, ownerId: req.params.ownerId });
  if (book?.pdfFileId) {
    try { await pdfBucket().delete(book.pdfFileId); } catch { /* file may already be gone, ignore */ }
  }
  await Book.findOneAndDelete({ _id: req.params.id, ownerId: req.params.ownerId });
  res.status(204).end();
});

// ---- PDF: upload, read, remove ----

// POST /api/personal/:ownerId/books/:id/pdf  (multipart/form-data, field name "pdf")
router.post('/:ownerId/books/:id/pdf', upload.single('pdf'), async (req, res) => {
  const book = await Book.findOne({ _id: req.params.id, ownerId: req.params.ownerId });
  if (!book) return res.status(404).json({ error: 'Книга не найдена' });
  if (!req.file) return res.status(400).json({ error: 'Файл не получен' });
  if (req.file.mimetype !== 'application/pdf') return res.status(400).json({ error: 'Нужен файл в формате PDF' });

  // Replace any previous PDF for this book.
  if (book.pdfFileId) {
    try { await pdfBucket().delete(book.pdfFileId); } catch { /* already gone, ignore */ }
  }

  const bucket = pdfBucket();
  const uploadStream = bucket.openUploadStream(req.file.originalname, { contentType: 'application/pdf' });
  uploadStream.end(req.file.buffer);

  uploadStream.on('finish', async () => {
    book.pdfFileId = uploadStream.id;
    book.pdfFileName = req.file.originalname;
    await book.save();
    res.status(201).json(book);
  });
  uploadStream.on('error', (err) => res.status(500).json({ error: err.message }));
});

// GET /api/personal/:ownerId/books/:id/pdf  — streams the PDF for inline viewing
router.get('/:ownerId/books/:id/pdf', async (req, res) => {
  const book = await Book.findOne({ _id: req.params.id, ownerId: req.params.ownerId });
  if (!book?.pdfFileId) return res.status(404).json({ error: 'PDF не найден' });

  res.set('Content-Type', 'application/pdf');
  res.set('Content-Disposition', `inline; filename="${encodeURIComponent(book.pdfFileName || 'book.pdf')}"`);
  const downloadStream = pdfBucket().openDownloadStream(book.pdfFileId);
  downloadStream.on('error', () => res.status(404).end());
  downloadStream.pipe(res);
});

// DELETE /api/personal/:ownerId/books/:id/pdf — removes just the attached PDF, keeps the book
router.delete('/:ownerId/books/:id/pdf', async (req, res) => {
  const book = await Book.findOne({ _id: req.params.id, ownerId: req.params.ownerId });
  if (!book) return res.status(404).json({ error: 'Книга не найдена' });
  if (book.pdfFileId) {
    try { await pdfBucket().delete(book.pdfFileId); } catch { /* already gone, ignore */ }
    book.pdfFileId = null;
    book.pdfFileName = null;
    await book.save();
  }
  res.json(book);
});

export default router;
