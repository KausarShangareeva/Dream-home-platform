import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
  title: { type: String, required: true },
  target: { type: Number, required: true },
  icon: { type: String, default: '✈️' },
  photo: { type: String, default: null },
  pos: { type: String, default: 'center' },  // CSS object-position, e.g. "center 35%"
}, { timestamps: true });

export default mongoose.model('Trip', tripSchema);
