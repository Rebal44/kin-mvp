# KIN Platform

Multi-tenant AI agent platform powered by OpenClaw.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your values

# Start development
npm run dev
```

## Structure

- `api/` - REST API (Express + Prisma)
- `web/` - React frontend (Vite)
- `bot/` - Telegram bot service
- `shared/` - Database schema and shared code

## Deployment

Railway auto-deploys from GitHub pushes.

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection
- `REDIS_URL` - Redis connection
- `TELEGRAM_BOT_TOKEN` - From @BotFather
- `OPENAI_API_KEY` - For AI responses
- `STRIPE_SECRET_KEY` - For payments (test mode)
- `JWT_SECRET` - For auth tokens
