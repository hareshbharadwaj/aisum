import { Router } from 'express';
import Document from '../models/Document.js';
import SummarisedNote from '../models/SummarisedNote.js';
import { summariesStore } from '../store/memoryStore.js';

const router = Router();

// GET summaries (fallback to in-memory store for older data)
router.get('/', async (req, res) => {
  const userId = req.header('x-user-id') || req.query.userId || 'anonymous';
  try {
    // populate the referenced document to get original content
    const notes = await SummarisedNote.find({ userId }).sort({ createdAt: -1 }).lean();
    if (notes && notes.length) {
      const populated = await Promise.all(notes.map(async (n) => {
        const doc = await Document.findById(n.docId).lean().catch(() => null);
        return {
          id: n._id,
          title: n.title || (doc && doc.filename) || 'Untitled',
          summaryContent: n.sum_notes,
          originalContent: doc && doc.contentJson ? (doc.contentJson.text || JSON.stringify(doc.contentJson)) : '',
          createdAt: n.createdAt
        };
      }));
      return res.json({ items: populated });
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error fetching summarised notes', err.message || err);
  }

  // fallback
  const items = summariesStore.filter((s) => s.userId === userId);
  res.json({ items });
});

// POST legacy: push into in-memory store (kept for backward compatibility)
router.post('/', (req, res) => {
  const userId = req.header('x-user-id') || req.query.userId || 'anonymous';
  const { title, content } = req.body || {};
  if (!title || !content) return res.status(400).json({ error: 'title and content are required' });
  const item = {
    id: String(Date.now()),
    userId,
    title,
    content,
    createdAt: new Date().toISOString(),
  };
  summariesStore.push(item);
  res.status(201).json({ item });
});

// POST /save - create both Document and SummarisedNote in DB
router.post('/save', async (req, res) => {
  const userId = req.header('x-user-id') || req.body.userId || 'anonymous';
  const { filename, mimetype, size, contentJson, title, sum_notes } = req.body || {};
  if (!sum_notes) return res.status(400).json({ error: 'sum_notes is required' });

  try {
    const doc = new Document({ userId, filename, mimetype, size, contentJson });
    await doc.save();

    const note = new SummarisedNote({ userId, docId: doc._id, title, sum_notes });
    await note.save();

    return res.status(201).json({ doc, note });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error saving summary/doc', err.message || err);
    return res.status(500).json({ error: 'Failed to save summary and document' });
  }
});

export default router;


