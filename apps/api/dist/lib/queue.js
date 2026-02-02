"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeQueue = exports.taskQueue = exports.redis = void 0;
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
exports.redis = new ioredis_1.default(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false
});
exports.taskQueue = new bullmq_1.Queue('tasks', {
    connection: exports.redis,
    defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50
    }
});
async function closeQueue() {
    await exports.taskQueue.close();
    await exports.redis.quit();
}
exports.closeQueue = closeQueue;
