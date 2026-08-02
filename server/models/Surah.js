import mongoose from 'mongoose';

const surahSchema = new mongoose.Schema({
  ownerId: { type: String, required: true, index: true },
  num: { type: Number, required: true },
  name: { type: String, required: true },
  ayahs: { type: Number, required: true },
  pages: { type: Number, required: true },
  status: { type: String, default: 'todo' }, // todo | learning | done
  learningStartDate: { type: String, default: null },
  doneDate: { type: String, default: null },
}, { timestamps: true });

export default mongoose.model('Surah', surahSchema);
