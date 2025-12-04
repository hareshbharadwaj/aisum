import { Router } from 'express';
import { schedulesStore } from '../store/memoryStore.js';

const router = Router();

router.get('/', (req, res) => {
  const userId = req.header('x-user-id') || req.query.userId || 'anonymous';
  const items = schedulesStore.filter((s) => s.userId === userId);
  res.json({ items });
});

router.post('/', (req, res) => {
  const userId = req.header('x-user-id') || req.query.userId || 'anonymous';
  const { date, tasks } = req.body || {};
  if (!date) return res.status(400).json({ error: 'date is required' });
  const item = {
    id: String(Date.now()),
    userId,
    date,
    tasks: Array.isArray(tasks) ? tasks : [],
    createdAt: new Date().toISOString(),
  };
  schedulesStore.push(item);
  res.status(201).json({ item });
});

export default router;


