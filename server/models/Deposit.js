import mongoose from 'mongoose';

const depositSchema = new mongoose.Schema({
  person: { type: String, required: true },   // person id, e.g. 'kausar'
  amount: { type: Number, required: true },
  currency: { type: String, default: 'SEK' },
  date: { type: String, required: true },      // ISO date string, e.g. '2026-08-02'
}, { timestamps: true });

export default mongoose.model('Deposit', depositSchema);
