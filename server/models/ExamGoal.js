import mongoose from 'mongoose';

const examGoalSchema = new mongoose.Schema({
  ownerId: { type: String, required: true, index: true },
  name: { type: String, required: true },        // IELTS, TOEFL, SAT, ACT, PSAT, ALPT, ...
  targetScore: { type: String, default: '' },     // free text — scoring scales differ per exam (band, points, etc.)
  prepNotes: { type: String, default: '' },       // which lessons/courses are needed to pass it
  examDate: { type: String, default: null },
  status: { type: String, default: 'todo' },      // todo | studying | done
  order: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('ExamGoal', examGoalSchema);
