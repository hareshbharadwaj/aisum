import { Router } from 'express';
import { quizHistoryStore } from '../store/memoryStore.js';

const router = Router();

router.get('/history', (req, res) => {
  const userId = req.header('x-user-id') || req.query.userId || 'anonymous';
  const items = quizHistoryStore.filter((q) => q.userId === userId);
  res.json({ items });
});

router.post('/history', (req, res) => {
  const userId = req.header('x-user-id') || req.query.userId || 'anonymous';
  // Accept flexible field names from frontend: total or totalQuestions, topic or summaryTitle
  const { score, total, topic, totalQuestions, summaryTitle, percentage } = req.body || {};
  const totalVal = typeof total === 'number' ? total : (typeof totalQuestions === 'number' ? totalQuestions : null);
  if (typeof score !== 'number' || typeof totalVal !== 'number' || totalVal === 0) {
    return res.status(400).json({ error: 'score and total (or totalQuestions) must be valid numbers' });
  }
  const perc = typeof percentage === 'number' ? percentage : Math.round((score / totalVal) * 100);
  const item = {
    id: String(Date.now()),
    userId,
    score,
    total: totalVal,
    percentage: perc,
    topic: topic || summaryTitle || null,
    createdAt: new Date().toISOString(),
  };
  quizHistoryStore.push(item);
  res.status(201).json({ item });
});

export default router;


