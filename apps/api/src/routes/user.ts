import { Router } from 'express';
import crypto from 'crypto';
import { prisma } from '@kin/db';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/user/me
router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        name: true,
        credits: true,
        plan: true,
        createdAt: true,
        telegramLink: {
          select: {
            telegramUsername: true,
            linkedAt: true
          }
        }
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// GET /api/user/dashboard
router.get('/dashboard', requireAuth, async (req: AuthRequest, res) => {
  try {
    const [user, recentTasks, taskCount] = await Promise.all([
      prisma.user.findUnique({
        where: { id: req.userId },
        select: {
          id: true,
          email: true,
          name: true,
          credits: true,
          plan: true,
          telegramLink: {
            select: { telegramUsername: true }
          }
        }
      }),
      prisma.task.findMany({
        where: { userId: req.userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          request: true,
          status: true,
          creditsUsed: true,
          createdAt: true
        }
      }),
      prisma.task.count({
        where: { userId: req.userId }
      })
    ]);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      user: {
        ...user,
        telegramConnected: !!user.telegramLink
      },
      recentTasks,
      taskCount
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to get dashboard' });
  }
});

// POST /api/user/telegram-link
router.post('/telegram-link', requireAuth, async (req: AuthRequest, res) => {
  try {
    // Generate unique token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    // Store in database (using link_tokens table via raw query for now)
    await prisma.$executeRaw`
      INSERT INTO link_tokens (token, user_id, expires_at)
      VALUES (${token}, ${req.userId!}, ${expiresAt})
      ON CONFLICT (token) DO UPDATE SET expires_at = ${expiresAt}
    `;
    
    const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'kin_builder_bot';
    const linkUrl = `https://t.me/${botUsername}?start=${token}`;
    
    res.json({ token, linkUrl });
  } catch (error) {
    console.error('Generate link error:', error);
    res.status(500).json({ error: 'Failed to generate link' });
  }
});

export { router as userRouter };
