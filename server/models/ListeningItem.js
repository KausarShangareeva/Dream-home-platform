import mongoose from 'mongoose';

const listeningItemSchema = new mongoose.Schema({
  ownerId: { type: String, required: true, index: true },
  title: { type: String, required: true },     // audiobook / podcast / channel / playlist name
  language: { type: String, default: 'Английский' },
  difficulty: { type: String, default: null },  // A1-C2 / B1+ / B2+ — the CEFR level this item targets
  hours: { type: Number, required: true },      // total hours of content in this item
  status: { type: String, default: 'todo' },    // todo | learning | done
  doneDate: { type: String, default: null },
  order: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('ListeningItem', listeningItemSchema);
