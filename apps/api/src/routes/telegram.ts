import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/telegram/status
router.get('/status', requireAuth, async (req: AuthRequest, res) => {
  // Placeholder for Telegram status check
  res.json({ connected: false });
});

export { router as telegramRouter };
