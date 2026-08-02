import mongoose from 'mongoose';

const personSettingsSchema = new mongoose.Schema({
  ownerId: { type: String, required: true, unique: true },
  hoursPerDay: { type: Number, default: 2 },
  booksYearlyGoal: { type: Number, default: 100 },
}, { timestamps: true });

export default mongoose.model('PersonSettings', personSettingsSchema);
