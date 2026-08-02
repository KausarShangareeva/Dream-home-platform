import mongoose from 'mongoose';

// One checked-off episode ("Escape from Alcatraz") or one ad-hoc logged listening
// session ("today: 1h20m", name left blank). Either way it's counted the moment
// it exists with done=true — that's what makes the item's total hours automatic.
const sessionSchema = new mongoose.Schema({
  name: { type: String, default: null },
  hours: { type: Number, required: true },
  done: { type: Boolean, default: true },
}, { _id: true });

const listeningItemSchema = new mongoose.Schema({
  ownerId: { type: String, required: true, index: true },
  title: { type: String, required: true },      // audiobook / podcast / channel / playlist name
  language: { type: String, default: 'Английский' },
  type: { type: String, default: null },        // audiobook | podcast | youtube | ted | interview | radio | movie
  theme: { type: String, default: null },       // romance | detective | history | ai | programming | space | religion | law | fantasy
  link: { type: String, default: '' },
  difficulty: { type: String, default: null },  // A1-C2 / B1+ / B2+ — the CEFR level this item targets
  hours: { type: Number, default: 0 },           // cached sum of sessions where done=true — recomputed server-side, not typed by hand
  status: { type: String, default: 'todo' },     // todo | learning | done
  doneDate: { type: String, default: null },
  order: { type: Number, default: 0 },
  sessions: { type: [sessionSchema], default: [] },
}, { timestamps: true });

export default mongoose.model('ListeningItem', listeningItemSchema);
