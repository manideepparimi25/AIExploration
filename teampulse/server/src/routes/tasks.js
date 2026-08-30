import { Router } from 'express';
import prisma from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';

const router = Router();

router.use(requireAuth);

const VALID_STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'];
const VALID_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];

// GET /api/tasks?mine=1&status=TODO&assigneeId=3
router.get('/', async (req, res, next) => {
  try {
    const where = {};
    if (req.query.mine === '1' || req.query.mine === 'true') {
      where.assigneeId = req.user.id;
    }
    if (req.query.status) {
      if (!VALID_STATUSES.includes(req.query.status)) {
        return res.status(400).json({ error: 'Invalid status filter' });
      }
      where.status = req.query.status;
    }
    if (req.query.assigneeId) {
      where.assigneeId = Number(req.query.assigneeId);
    }
    const tasks = await prisma.task.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });
    res.json({ tasks });
  } catch (err) {
    next(err);
  }
});

// POST /api/tasks — leads create + assign tasks.
router.post('/', requireRole('LEAD'), async (req, res, next) => {
  try {
    const {
      title,
      description = '',
      status = 'TODO',
      priority = 'MEDIUM',
      assigneeId = null,
    } = req.body;
    if (!title) return res.status(400).json({ error: 'title is required' });
    if (!VALID_STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid status' });
    if (!VALID_PRIORITIES.includes(priority)) return res.status(400).json({ error: 'Invalid priority' });

    if (assigneeId) {
      const assignee = await prisma.user.findUnique({ where: { id: Number(assigneeId) } });
      if (!assignee) return res.status(400).json({ error: 'Assignee not found' });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status,
        priority,
        assigneeId: assigneeId ? Number(assigneeId) : null,
        createdById: req.user.id,
      },
      include: {
        assignee: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });
    res.status(201).json({ task });
  } catch (err) {
    next(err);
  }
});

// GET /api/tasks/:id — task detail with comments.
router.get('/:id', async (req, res, next) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true } },
        comments: {
          orderBy: { createdAt: 'asc' },
          include: { user: { select: { id: true, name: true } } },
        },
      },
    });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ task });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/tasks/:id — leads edit anything; assignee can change status.
router.patch('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const isLead = req.user.role === 'LEAD';
    const isAssignee = task.assigneeId === req.user.id;
    if (!isLead && !isAssignee) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const data = {};
    if (isLead) {
      if (req.body.title !== undefined) data.title = req.body.title;
      if (req.body.description !== undefined) data.description = req.body.description;
      if (req.body.priority !== undefined) {
        if (!VALID_PRIORITIES.includes(req.body.priority)) {
          return res.status(400).json({ error: 'Invalid priority' });
        }
        data.priority = req.body.priority;
      }
      if (req.body.assigneeId !== undefined) {
        data.assigneeId = req.body.assigneeId ? Number(req.body.assigneeId) : null;
      }
      if (req.body.status !== undefined) {
        if (!VALID_STATUSES.includes(req.body.status)) {
          return res.status(400).json({ error: 'Invalid status' });
        }
        data.status = req.body.status;
      }
    } else if (req.body.status !== undefined) {
      if (!VALID_STATUSES.includes(req.body.status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      data.status = req.body.status;
    }

    const updated = await prisma.task.update({
      where: { id },
      data,
      include: {
        assignee: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });
    res.json({ task: updated });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/tasks/:id — leads or the task creator.
router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (req.user.role !== 'LEAD' && task.createdById !== req.user.id) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    await prisma.task.delete({ where: { id } });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
});

// POST /api/tasks/:id/comments — any authenticated user.
router.post('/:id/comments', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'content is required' });
    const comment = await prisma.comment.create({
      data: { content, taskId: id, userId: req.user.id },
      include: { user: { select: { id: true, name: true } } },
    });
    res.status(201).json({ comment });
  } catch (err) {
    next(err);
  }
});

export default router;
