import mongoose from 'mongoose';

const listeningItemSchema = new mongoose.Schema({
  ownerId: { type: String, required: true, index: true },
  title: { type: String, required: true },      // audiobook / podcast / channel / playlist name
  language: { type: String, default: 'Английский' },
  type: { type: String, default: null },        // one of the 7 listening-type categories
  link: { type: String, default: '' },
  hours: { type: Number, default: 0 },           // directly editable — how many hours actually listened
  status: { type: String, default: 'todo' },     // todo | learning | done
  doneDate: { type: String, default: null },
  order: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('ListeningItem', listeningItemSchema);
