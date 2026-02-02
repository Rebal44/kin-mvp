"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("@kin/db");
const auth_1 = require("./routes/auth");
const user_1 = require("./routes/user");
const tasks_1 = require("./routes/tasks");
const telegram_1 = require("./routes/telegram");
const webhooks_1 = require("./routes/webhooks");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.WEB_URL || '*',
    credentials: true
}));
app.use(express_1.default.json());
// Health check
app.get('/health', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield db_1.prisma.$queryRaw `SELECT 1`;
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            database: 'connected'
        });
    }
    catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            database: 'disconnected'
        });
    }
}));
// Routes
app.use('/api/auth', auth_1.authRouter);
app.use('/api/user', user_1.userRouter);
app.use('/api/tasks', tasks_1.tasksRouter);
app.use('/api/telegram', telegram_1.telegramRouter);
app.use('/webhooks', webhooks_1.webhooksRouter);
// Error handler
app.use((err, req, res, next) => {
    console.error('API Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});
app.listen(PORT, () => {
    console.log(`🚀 KIN API running on port ${PORT}`);
});
