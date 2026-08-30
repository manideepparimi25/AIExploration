import { Router } from 'express';
import prisma from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { todayStr } from '../utils/date.js';

const router = Router();
router.use(requireAuth);

// GET /api/statuses — latest status for every team member (the team board).
router.get('/', async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { name: 'asc' },
      include: { statuses: { orderBy: { date: 'desc' }, take: 1 } },
    });
    const board = users.map((u) => ({
      user: { id: u.id, name: u.name, email: u.email, role: u.role },
      status: u.statuses[0] ?? null,
    }));
    res.json({ board });
  } catch (err) {
    next(err);
  }
});

// GET /api/statuses/me — my latest status.
router.get('/me', async (req, res, next) => {
  try {
    const status = await prisma.status.findFirst({
      where: { userId: req.user.id },
      orderBy: { date: 'desc' },
    });
    res.json({ status });
  } catch (err) {
    next(err);
  }
});

// POST /api/statuses — create or update today's status (upsert).
router.post('/', async (req, res, next) => {
  try {
    const { workingOn, blockers = '' } = req.body;
    if (!workingOn) return res.status(400).json({ error: 'workingOn is required' });
    const date = todayStr();
    const status = await prisma.status.upsert({
      where: { userId_date: { userId: req.user.id, date } },
      update: { workingOn, blockers },
      create: { userId: req.user.id, workingOn, blockers, date },
    });
    res.status(201).json({ status });
  } catch (err) {
    next(err);
  }
});

export default router;
