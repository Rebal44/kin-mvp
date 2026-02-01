import { Router } from 'express';
import { z } from 'zod';
import { prisma, TaskStatus } from '@kin/db';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { taskQueue } from '../lib/queue';

const router = Router();

const createTaskSchema = z.object({
  request: z.string().min(1).max(2000)
});

// GET /api/tasks
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    
    res.json({ tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Failed to get tasks' });
  }
});

// GET /api/tasks/:id
router.get('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const task = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json({ task });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: 'Failed to get task' });
  }
});

// POST /api/tasks
router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { request } = createTaskSchema.parse(req.body);
    
    // Check user credits
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { credits: true }
    });
    
    if (!user || user.credits < 5) {
      return res.status(403).json({ error: 'Insufficient credits' });
    }
    
    // Create task
    const task = await prisma.task.create({
      data: {
        userId: req.userId!,
        request,
        status: 'PENDING',
        source: 'WEB'
      }
    });
    
    // Add to queue
    await taskQueue.add('execute-task', {
      taskId: task.id,
      userId: req.userId,
      request
    }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000
      }
    });
    
    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: req.userId,
        taskId: task.id,
        action: 'task_created',
        details: { source: 'web', request },
        ipAddress: req.ip
      }
    });
    
    res.status(201).json({ task });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

export { router as tasksRouter };
