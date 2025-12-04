import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import authRouter from './routes/auth.js';
import { connectDb } from './store/mongoStore.js';
import summariesRouter from './routes/summaries.js';
import schedulesRouter from './routes/schedules.js';
import quizRouter from './routes/quiz.js';
import dbRouter from './routes/db.js';

const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(morgan('dev'));

// API routes
app.use('/api/auth', authRouter);
app.use('/api/summaries', summariesRouter);
app.use('/api/schedules', schedulesRouter);
app.use('/api/quiz', quizRouter);
app.use('/api/db', dbRouter);
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'backend', time: new Date().toISOString() });
});

// Serve static files from the React build directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '../../dist')));

// For any other request, serve the index.html file
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../../dist/index.html'));
});

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    await connectDb();
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to connect to the database', error);
    process.exit(1);
  }
}

startServer();


