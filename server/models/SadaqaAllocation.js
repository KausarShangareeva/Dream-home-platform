import mongoose from 'mongoose';

const breakdownEntrySchema = new mongoose.Schema({
  person: { type: String, required: true },
  amount: { type: Number, required: true },
}, { _id: false });

const sadaqaAllocationSchema = new mongoose.Schema({
  causeId: { type: mongoose.Schema.Types.ObjectId, ref: 'SadaqaCause', required: true },
  breakdown: { type: [breakdownEntrySchema], default: [] },
  date: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('SadaqaAllocation', sadaqaAllocationSchema);
