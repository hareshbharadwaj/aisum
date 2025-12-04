export function validateRegisterInput(body) {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Invalid body' };
  const { name, email, password } = body;
  if (!name || !email || !password) return { ok: false, error: 'name, email, password required' };
  if (String(password).length < 6) return { ok: false, error: 'password must be at least 6 characters' };
  return { ok: true, data: { name: String(name).trim(), email: String(email).trim(), password: String(password) } };
}

export function validateLoginInput(body) {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Invalid body' };
  const { email, password } = body;
  if (!email || !password) return { ok: false, error: 'email and password required' };
  return { ok: true, data: { email: String(email).trim(), password: String(password) } };
}


