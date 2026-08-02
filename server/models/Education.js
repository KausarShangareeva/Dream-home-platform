import mongoose from 'mongoose';

const educationSchema = new mongoose.Schema({
  ownerId: { type: String, required: true, index: true },
  faculty: { type: String, required: true },
  university: { type: String, default: '' },
  language: { type: String, default: '' },
  years: { type: Number, default: 0 },
  level: { type: String, default: 'todo' }, // todo | applying | studying | done
  url: { type: String, default: '' },
  done: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Education', educationSchema);
