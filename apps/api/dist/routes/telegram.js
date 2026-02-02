"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.telegramRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
exports.telegramRouter = router;
// GET /api/telegram/status
router.get('/status', auth_1.requireAuth, async (req, res) => {
    // Placeholder for Telegram status check
    res.json({ connected: false });
});
