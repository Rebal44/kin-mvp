import { Worker } from 'bullmq';
import Redis from 'ioredis';
import { prisma } from '@kin/db';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false
});

interface TaskJob {
  taskId: string;
  userId: string;
  request: string;
}

async function sendTelegramNotification(userId: string, message: string) {
  if (!BOT_TOKEN) return;
  
  try {
    const link = await prisma.telegramLink.findUnique({
      where: { userId },
      select: { telegramUserId: true }
    });
    
    if (!link) return;
    
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: link.telegramUserId,
        text: message,
        parse_mode: 'HTML'
      })
    });
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
}

async function executeTask(job: TaskJob) {
  const { taskId, userId, request } = job;
  
  console.log(`[Worker] Executing task ${taskId}: ${request.substring(0, 50)}...`);
  
  try {
    // Update task to running
    await prisma.task.update({
      where: { id: taskId },
      data: {
        status: 'RUNNING',
        startedAt: new Date()
      }
    });
    
    // TODO: Integrate with OpenClaw for actual execution
    // For now, simulate task execution
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate result
    const result = {
      summary: `Task completed: "${request.substring(0, 100)}${request.length > 100 ? '...' : ''}"`,
      details: 'This is a placeholder result. Real execution will integrate with OpenClaw.',
      executedAt: new Date().toISOString()
    };
    
    const creditsUsed = 10; // Calculate based on complexity
    
    // Update task as completed
    await prisma.task.update({
      where: { id: taskId },
      data: {
        status: 'COMPLETED',
        result,
        creditsUsed,
        completedAt: new Date()
      }
    });
    
    // Deduct credits
    await prisma.user.update({
      where: { id: userId },
      data: {
        credits: {
          decrement: creditsUsed
        }
      }
    });
    
    // Log audit
    await prisma.auditLog.create({
      data: {
        userId,
        taskId,
        action: 'task_completed',
        details: { creditsUsed, status: 'completed' }
      }
    });
    
    // Notify user on Telegram
    await sendTelegramNotification(
      userId,
      `✅ <b>Task complete!</b>\n\n${result.summary}\n\n<i>Used ${creditsUsed} credits</i>`
    );
    
    console.log(`[Worker] Completed task ${taskId}`);
    
  } catch (error) {
    console.error(`[Worker] Task ${taskId} failed:`, error);
    
    // Update task as failed
    await prisma.task.update({
      where: { id: taskId },
      data: {
        status: 'FAILED',
        result: { error: String(error) },
        completedAt: new Date()
      }
    });
    
    // Log audit
    await prisma.auditLog.create({
      data: {
        userId,
        taskId,
        action: 'task_failed',
        details: { error: String(error) }
      }
    });
    
    await sendTelegramNotification(
      userId,
      `❌ <b>Task failed</b>\n\nSorry, something went wrong. Please try again.`
    );
    
    throw error;
  }
}

// Create worker
const worker = new Worker('tasks', async (job) => {
  if (job.name === 'execute-task') {
    await executeTask(job.data as TaskJob);
  }
}, {
  connection: redis,
  concurrency: 5
});

worker.on('completed', (job) => {
  console.log(`[Worker] Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed:`, err);
});

console.log('🚀 KIN Worker started');

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down worker...');
  await worker.close();
  await redis.quit();
  await prisma.$disconnect();
  process.exit(0);
});
