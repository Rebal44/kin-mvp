import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { prisma } from '@kin/db';
import { authRouter } from './routes/auth';
import { userRouter } from './routes/user';
import { tasksRouter } from './routes/tasks';
import { telegramRouter } from './routes/telegram';
import { webhooksRouter } from './routes/webhooks';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.WEB_URL || '*',
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'unhealthy', 
      timestamp: new Date().toISOString(),
      database: 'disconnected'
    });
  }
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/telegram', telegramRouter);
app.use('/webhooks', webhooksRouter);

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('API Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 KIN API running on port ${PORT}`);
});
