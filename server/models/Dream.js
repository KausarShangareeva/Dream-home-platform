import mongoose from 'mongoose';

const dreamSchema = new mongoose.Schema({
  title: { type: String, required: true },
  target: { type: Number, required: true },
  icon: { type: String, default: '🎯' },     // emoji, used if no photo
  photo: { type: String, default: null },    // data URL or hosted image URL
  pos: { type: String, default: 'center' },  // CSS object-position, e.g. "center 35%"
}, { timestamps: true });

export default mongoose.model('Dream', dreamSchema);
