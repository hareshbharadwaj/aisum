import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { findUserByEmail, createUser } from '../store/mongoStore.js';
import { validateLoginInput, validateRegisterInput } from '../utils/validators.js';

const router = Router();

router.post('/register', async (req, res) => {
  const parseResult = validateRegisterInput(req.body);
  if (!parseResult.ok) return res.status(400).json({ error: parseResult.error });
  const { name, email, password } = parseResult.data;

  const existing = await findUserByEmail(email);
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  const passwordHash = bcrypt.hashSync(password, 10);
  try {
    const user = await createUser({ name, email, passwordHash });
    return res.status(201).json({ user });
  } catch (err) {
    // unique constraint or other db errors
    // eslint-disable-next-line no-console
    console.error('Error creating user', err.message || err);
    return res.status(500).json({ error: 'Failed to create user' });
  }
});

router.post('/login', async (req, res) => {
  const parseResult = validateLoginInput(req.body);
  if (!parseResult.ok) return res.status(400).json({ error: parseResult.error });
  const { email, password } = parseResult.data;

  const user = await findUserByEmail(email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = bcrypt.compareSync(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  // simple token substitute and user object
  return res.json({ token: `dev-${user._id || user.id}`, user: { id: user._id || user.id, name: user.name, email: user.email, createdAt: user.createdAt } });
});

export default router;


