# KIN Railway Deployment - EXACT Environment Variables

## Required Variables (Add these in Railway Dashboard)

### 1. Database (Railway Postgres)
```
DATABASE_URL=${{Postgres.DATABASE_URL}}
```
Or if creating manually:
```
DATABASE_URL=postgresql://postgres:PASSWORD@HOST.railway.app:PORT/railway
```

### 2. Redis (Railway Redis)
```
REDIS_URL=${{Redis.REDIS_URL}}
```
Or:
```
REDIS_URL=redis://default:PASSWORD@HOST.railway.app:PORT
```

### 3. JWT Secret (Generate random string)
```
JWT_SECRET=your-random-secret-min-32-chars-here
```

### 4. Telegram Bot (Already configured)
```
TELEGRAM_BOT_TOKEN=8441840693:AAHfRwUaEnxXrvdA56wKkNQdpMjfVwCZ7Kc
TELEGRAM_BOT_USERNAME=kin_builder_bot
```

### 5. App URLs
```
NODE_ENV=production
PORT=3001
WEB_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}
NEXT_PUBLIC_API_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}/api
```

## Deployment Steps

### Option A: Auto-Deploy (Recommended)
1. Go to https://railway.app/new
2. Select "Deploy from GitHub repo"
3. Choose: `Rebal44/kin-mvp`
4. Railway will auto-detect `railway.json`
5. Add Postgres: Click "New" → Database → Add PostgreSQL
6. Add Redis: Click "New" → Database → Add Redis
7. Add the Environment Variables above
8. Deploy!

### Option B: Manual Service Creation
If auto-deploy fails:

1. **Create Project** → Empty Project
2. **Add Database**: New → Database → PostgreSQL
3. **Add Redis**: New → Database → Redis
4. **Add Service**: New → GitHub Repo → `Rebal44/kin-mvp`
5. **Service Settings**:
   - Build Command: (leave empty, uses Dockerfile)
   - Start Command: `npx concurrently "node apps/api/dist/index.js" "npx serve apps/web/dist -l 3000" "node workers/dist/index.js"`
6. **Add Environment Variables** (from list above)
7. **Deploy**

## Post-Deploy Steps

### 1. Run Database Migrations
In Railway dashboard:
- Click on your service
- Go to "Deployments" tab
- Click "Deploy" dropdown → "Deploy with command"
- Command: `npm run db:migrate`
- Deploy

### 2. Set Telegram Webhook
```bash
curl -X POST https://YOUR_RAILWAY_URL/webhooks/setup-telegram-webhook
```

### 3. Test
- Website: https://YOUR_RAILWAY_URL
- Health: https://YOUR_RAILWAY_URL/health
- API: https://YOUR_RAILWAY_URL/api/auth/register

## Troubleshooting

### Build Exit Code 1
Cause: Missing TypeScript or Prisma
Fix: Already fixed in latest commit - TypeScript added to dependencies

### Build Exit Code 135
Cause: Out of memory during build
Fix: 
- In Railway: Service → Settings → Increase RAM to 2GB
- Or deploy as separate services (API, Web, Worker)

### Database Connection Failed
Cause: DATABASE_URL not set correctly
Fix: Use `${{Postgres.DATABASE_URL}}` variable format

### Prisma Client Not Found
Cause: Prisma generate didn't run
Fix: SSH into service and run: `cd packages/db && npx prisma generate`

## Alternative: Render.com (If Railway Fails)

If Railway continues to fail, use Render:

1. Go to https://dashboard.render.com/
2. New → Web Service → Connect `Rebal44/kin-mvp`
3. Settings:
   - Environment: Node
   - Build Command: `npm install && npm run db:generate && npm run build`
   - Start Command: `node apps/api/dist/index.js`
4. Add Environment Variables (same as above)
5. Create

## Files Changed in This Fix
- `package.json` - Added TypeScript to root
- `apps/api/package.json` - Moved TypeScript to dependencies
- `apps/web/package.json` - Cleaned up
- `workers/package.json` - Moved TypeScript to dependencies  
- `apps/api/Dockerfile` - Simplified build
- `apps/web/Dockerfile` - Fixed static export
- `workers/Dockerfile` - Simplified build
- `Dockerfile` - Single-container fallback option
- `railway.json` - Railway configuration
- `apps/api/railway.json` - API service config
- `apps/web/railway.json` - Web service config
- `workers/railway.json` - Worker service config
- `.dockerignore` - Faster builds
