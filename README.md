# KIN - Production AI Agent Platform

## Architecture
- Frontend: Next.js 14 (App Router)
- API: Node.js + Express
- Database: Supabase Postgres
- Queue: Upstash Redis + BullMQ
- Workers: Docker containers
- Hosting: Railway

## Structure
```
kin/
├── apps/
│   ├── web/           # Next.js frontend
│   └── api/           # Express API server
├── packages/
│   ├── shared/        # Types, schemas, utils
│   └── db/            # Database client
├── workers/           # OpenClaw task executors
└── infra/             # Railway configs
```

## Deployment
Railway handles all deployment via Git integration.
