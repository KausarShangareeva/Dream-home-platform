import mongoose from 'mongoose';

const personSettingsSchema = new mongoose.Schema({
  ownerId: { type: String, required: true, unique: true },
  hoursPerDay: { type: Number, default: 2 },
  booksYearlyGoal: { type: Number, default: 100 },
  shelfPace: { type: Number, default: 8 },              // books per month for the monthly-shelves planner
  shelfMonthOverrides: { type: mongoose.Schema.Types.Mixed, default: {} }, // { 'YYYY-MM': customPace }
  mixLanguages: { type: [String], default: [] },         // languages included in the Books "Микс" view
  shelfStartMonth: { type: String, default: null },       // 'YYYY-MM' — the month shelf #1 is anchored to, set once
}, { timestamps: true });

export default mongoose.model('PersonSettings', personSettingsSchema);
