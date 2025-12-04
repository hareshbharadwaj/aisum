import { Router } from 'express';
import mongoose from 'mongoose';

const router = Router();

// Returns connection state and list of collections (safe for local dev)
router.get('/', async (_req, res) => {
  try {
    const state = mongoose.connection.readyState; // 0 disconnected,1 connected,2 connecting,3 disconnecting
    const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
    const conn = mongoose.connection;
    const dbName = conn && conn.name ? conn.name : null;
    let collections = [];
    try {
      const list = await conn.db.listCollections().toArray();
      collections = list.map((c) => c.name);
    } catch (e) {
      // ignore list errors
    }

    return res.json({
      connected: state === 1,
      state: states[state] || state,
      dbName,
      collections,
      uri: process.env.MONGO_URI || null,
    });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

export default router;
