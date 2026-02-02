"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tasksRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const db_1 = require("@kin/db");
const auth_1 = require("../middleware/auth");
const queue_1 = require("../lib/queue");
const router = (0, express_1.Router)();
exports.tasksRouter = router;
const createTaskSchema = zod_1.z.object({
    request: zod_1.z.string().min(1).max(2000)
});
// GET /api/tasks
router.get('/', auth_1.requireAuth, async (req, res) => {
    try {
        const tasks = await db_1.prisma.task.findMany({
            where: { userId: req.userId },
            orderBy: { createdAt: 'desc' },
            take: 50
        });
        res.json({ tasks });
    }
    catch (error) {
        console.error('Get tasks error:', error);
        res.status(500).json({ error: 'Failed to get tasks' });
    }
});
// GET /api/tasks/:id
router.get('/:id', auth_1.requireAuth, async (req, res) => {
    try {
        const task = await db_1.prisma.task.findFirst({
            where: {
                id: req.params.id,
                userId: req.userId
            }
        });
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json({ task });
    }
    catch (error) {
        console.error('Get task error:', error);
        res.status(500).json({ error: 'Failed to get task' });
    }
});
// POST /api/tasks
router.post('/', auth_1.requireAuth, async (req, res) => {
    try {
        const { request } = createTaskSchema.parse(req.body);
        // Check user credits
        const user = await db_1.prisma.user.findUnique({
            where: { id: req.userId },
            select: { credits: true }
        });
        if (!user || user.credits < 5) {
            return res.status(403).json({ error: 'Insufficient credits' });
        }
        // Create task
        const task = await db_1.prisma.task.create({
            data: {
                userId: req.userId,
                request,
                status: 'PENDING',
                source: 'WEB'
            }
        });
        // Add to queue
        await queue_1.taskQueue.add('execute-task', {
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
        await db_1.prisma.auditLog.create({
            data: {
                userId: req.userId,
                taskId: task.id,
                action: 'task_created',
                details: { source: 'web', request },
                ipAddress: req.ip
            }
        });
        res.status(201).json({ task });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: 'Invalid input', details: error.errors });
        }
        console.error('Create task error:', error);
        res.status(500).json({ error: 'Failed to create task' });
    }
});
