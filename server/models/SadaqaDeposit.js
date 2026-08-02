import mongoose from 'mongoose';

const sadaqaDepositSchema = new mongoose.Schema({
  person: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('SadaqaDeposit', sadaqaDepositSchema);
