import mongoose from 'mongoose';

const tripDepositSchema = new mongoose.Schema({
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  person: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('TripDeposit', tripDepositSchema);
