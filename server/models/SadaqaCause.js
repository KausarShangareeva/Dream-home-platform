import mongoose from 'mongoose';

const pendingEntrySchema = new mongoose.Schema({
  person: { type: String, required: true },
  amount: { type: Number, required: true },
}, { _id: false });

const sadaqaCauseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  icon: { type: String, default: '💝' },
  contact: { type: String, default: '' },
  goal: { type: Number, default: 0 },
  pending: { type: [pendingEntrySchema], default: [] }, // earmarked but not yet sent
}, { timestamps: true });

export default mongoose.model('SadaqaCause', sadaqaCauseSchema);
