import mongoose from 'mongoose';

const dreamDepositSchema = new mongoose.Schema({
  dreamId: { type: String, required: true }, // 'travel', 'furniture', ... or a Dream _id for custom dreams
  person: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('DreamDeposit', dreamDepositSchema);
