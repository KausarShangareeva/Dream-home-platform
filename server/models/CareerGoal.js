import mongoose from 'mongoose';

const careerGoalSchema = new mongoose.Schema({
  ownerId: { type: String, required: true, index: true },
  category: { type: String, required: true, enum: ['main', 'side'] },
  icon: { type: String, default: '💼' },
  name: { type: String, required: true },
  done: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('CareerGoal', careerGoalSchema);
