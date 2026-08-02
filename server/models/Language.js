import mongoose from 'mongoose';

const languageSchema = new mongoose.Schema({
  ownerId: { type: String, required: true, index: true }, // 'mama' | 'kausar' | ...
  key: { type: String, required: true },     // 'english', 'swedish', ...
  name: { type: String, required: true },
  flag: { type: String, default: '🌍' },
  level: { type: String, required: true },   // target CEFR level: A1-C2
  fromLevel: { type: String, default: null }, // starting level, if not from scratch
  chain: { type: Boolean, default: true },
  bridge: { type: String, default: null },   // key of the language this one bridges from
  diff: { type: Number, default: 1.0 },
  status: { type: String, default: 'todo' }, // todo | learning | done
  note: { type: String, default: '' },
  order: { type: Number, default: 0 },
  removable: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Language', languageSchema);
