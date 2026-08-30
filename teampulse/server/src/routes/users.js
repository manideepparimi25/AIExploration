import { Router } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

function sanitizeUser(user) {
  const { passwordHash, ...rest } = user;
  return rest;
}

// GET /api/users — team roster (assignee dropdown / team board).
router.get('/', async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    res.json({ users });
  } catch (err) {
    next(err);
  }
});

// GET /api/users/me — current user's profile.
router.get('/me', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/users/me — update name and/or change password.
router.patch('/me', async (req, res, next) => {
  try {
    const { name, currentPassword, newPassword } = req.body;
    const data = {};

    if (name !== undefined) {
      if (!name.trim()) return res.status(400).json({ error: 'name cannot be empty' });
      data.name = name.trim();
    }

    if (newPassword !== undefined) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'currentPassword is required to change password' });
      }
      const user = await prisma.user.findUnique({ where: { id: req.user.id } });
      const ok = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!ok) return res.status(401).json({ error: 'Current password is incorrect' });
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }
      data.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: 'Nothing to update' });
    }

    const updated = await prisma.user.update({ where: { id: req.user.id }, data });
    res.json({ user: sanitizeUser(updated) });
  } catch (err) {
    next(err);
  }
});

export default router;
