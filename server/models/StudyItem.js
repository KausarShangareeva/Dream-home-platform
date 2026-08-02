import mongoose from 'mongoose';

const studyItemSchema = new mongoose.Schema({
  ownerId: { type: String, required: true, index: true },
  category: { type: String, required: true, enum: ['subject', 'hobby'] },
  icon: { type: String, default: '📘' },
  name: { type: String, required: true },
  hours: { type: Number, default: 0 },
  approx: { type: Boolean, default: false },
  platform: { type: String, default: '' },
  url: { type: String, default: '' },
  status: { type: String, default: 'todo' }, // todo | learning | done
  order: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('StudyItem', studyItemSchema);
