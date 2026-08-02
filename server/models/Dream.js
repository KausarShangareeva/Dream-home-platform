import mongoose from 'mongoose';

const dreamSchema = new mongoose.Schema({
  title: { type: String, required: true },
  target: { type: Number, required: true },
  icon: { type: String, default: '🎯' },     // emoji, used if no photo
  photo: { type: String, default: null },    // data URL or hosted image URL
}, { timestamps: true });

export default mongoose.model('Dream', dreamSchema);
