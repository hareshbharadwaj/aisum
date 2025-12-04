import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables. Prefer .env.local (developer provided) then .env
try {
  // attempt to load .env.local if present
  dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
} catch (e) {
  // ignore
}
// then load default .env to supplement
dotenv.config();

// Prefer a prebuilt URI, otherwise construct one from discrete Atlas env vars
const {
  MONGO_URI: RAW_MONGO_URI,
  MONGO_USER,
  MONGO_PASS,
  MONGO_HOST,
  MONGO_DB,
} = process.env;

const MONGO_URI = (() => {
  if (RAW_MONGO_URI && RAW_MONGO_URI.trim().length > 0) return RAW_MONGO_URI.trim();
  if (MONGO_USER && MONGO_PASS && MONGO_HOST) {
    const user = encodeURIComponent(MONGO_USER);
    const pass = encodeURIComponent(MONGO_PASS);
    const host = MONGO_HOST.trim();
    const db = (MONGO_DB && MONGO_DB.trim()) || 'ai_study_companion';
    // SRV connection string for Atlas
    return `mongodb+srv://${user}:${pass}@${host}/${db}?retryWrites=true&w=majority`;
  }
  // Fallback to local dev
  return 'mongodb://127.0.0.1:27017/ai_study_companion';
})();

let isConnected = false;

export async function connectDb() {
  if (isConnected) return mongoose.connection;
  await mongoose.connect(MONGO_URI, { dbName: 'ai_study_companion' });
  isConnected = true;
  // eslint-disable-next-line no-console
  try {
    const sanitized = MONGO_URI.replace(/:\S+@/, ':***@');
    console.log('Connected to MongoDB at', sanitized);
  } catch {
    console.log('Connected to MongoDB');
  }
  return mongoose.connection;
}

export async function ensureCollections() {
  // Ensure collections and indexes exist. Mongoose will create collections on insert,
  // but we can ensure indexes (like unique email) are built now.
  try {
    await User.init(); // ensures indexes for User schema
    // create placeholder collections by creating if not exists via the connection
    const conn = mongoose.connection;
    const collectionNames = await conn.db.listCollections().toArray();
    const names = collectionNames.map(c => c.name);

    const created = [];
    if (!names.includes('doc_uploadeds') && !names.includes('doc_uploaded')) {
      await conn.createCollection('doc_uploaded').catch(() => {});
      created.push('doc_uploaded');
    }
    if (!names.includes('summarised_notes')) {
      await conn.createCollection('summarised_notes').catch(() => {});
      created.push('summarised_notes');
    }
    if (!names.includes('users')) {
      // users collection will be created by Mongoose when User model is used, but create now
      await conn.createCollection('users').catch(() => {});
      created.push('users');
    }

    return { created, existing: names };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('ensureCollections error:', err.message || err);
    return { created: [], existing: [] };
  }
}

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: () => new Date() },
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export async function findUserByEmail(email) {
  if (!email) return null;
  return User.findOne({ email: String(email).toLowerCase() }).lean();
}

export async function createUser({ name, email, passwordHash }) {
  const user = new User({ name, email: String(email).toLowerCase(), passwordHash });
  await user.save();
  const obj = user.toObject();
  delete obj.passwordHash;
  return obj;
}

export default {
  connectDb,
  findUserByEmail,
  createUser,
};
