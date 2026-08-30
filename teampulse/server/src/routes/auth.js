import { Router } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../db.js';
import { signToken } from '../utils/jwt.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

function sanitizeUser(user) {
  const { passwordHash, ...rest } = user;
  return rest;
}

// POST /api/auth/register — create a member account.
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email, and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, role: 'MEMBER' },
    });
    const token = signToken({ id: user.id, role: user.role });
    res.status(201).json({ token, user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login — exchange credentials for a token.
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = signToken({ id: user.id, role: user.role });
    res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout — stateless; the client discards the token.
router.post('/logout', (_req, res) => {
  res.json({ message: 'Logged out' });
});

// GET /api/auth/me — current user for the logged-in token.
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
});

export default router;
