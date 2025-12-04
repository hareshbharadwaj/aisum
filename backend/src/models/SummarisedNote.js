import mongoose from 'mongoose';

const summarisedNoteSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  docId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
  title: { type: String },
  sum_notes: { type: String, required: true },
  createdAt: { type: Date, default: () => new Date() }
}, { collection: 'summarised_notes' });

export default mongoose.models.SummarisedNote || mongoose.model('SummarisedNote', summarisedNoteSchema);
