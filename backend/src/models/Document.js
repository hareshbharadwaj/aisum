import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  filename: { type: String },
  mimetype: { type: String },
  size: { type: Number },
  // Store extracted content or JSON representation
  contentJson: { type: Object },
  createdAt: { type: Date, default: () => new Date() }
}, { collection: 'doc_uploaded' });

export default mongoose.models.Document || mongoose.model('Document', documentSchema);
