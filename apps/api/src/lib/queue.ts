import { Queue } from 'bullmq';
import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false
});

export const taskQueue = new Queue('tasks', {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50
  }
});

export async function closeQueue() {
  await taskQueue.close();
  await redis.quit();
}
