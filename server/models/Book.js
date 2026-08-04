import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  ownerId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  author: { type: String, default: '' },
  language: { type: String, default: 'Русский' },
  pages: { type: Number, required: true },
  days: { type: Number, default: 14 },        // planned days to finish
  startDate: { type: String, default: null },
  doneDate: { type: String, default: null },
  status: { type: String, default: 'todo' },  // todo | learning | done
  difficulty: { type: String, default: null }, // A1-C2 / B1+ / B2+
  genre: { type: String, default: null },
  order: { type: Number, default: 0 },
  currentPage: { type: Number, default: 0 }, // how far into the book you've read so far
}, { timestamps: true });

export default mongoose.model('Book', bookSchema);
