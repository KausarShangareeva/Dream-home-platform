import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
  title: { type: String, required: true },
  target: { type: Number, required: true },
  icon: { type: String, default: '✈️' },
  photo: { type: String, default: null },
}, { timestamps: true });

export default mongoose.model('Trip', tripSchema);
