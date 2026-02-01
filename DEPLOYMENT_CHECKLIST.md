# KIN DEPLOYMENT CHECKLIST
**Last Updated:** 2026-02-02 01:00 CET  
**Repo:** https://github.com/Rebal44/kin-mvp  
**Status:** Ready for Deployment

---

## 🔧 EXACT ENVIRONMENT VARIABLES

Copy-paste these into Railway/Render dashboard:

```bash
# Core
NODE_ENV=production

# Database (Railway will auto-fill this if you add Postgres)
DATABASE_URL=${{Postgres.DATABASE_URL}}
# OR manual format:
# DATABASE_URL=postgresql://user:pass@host:port/db

# Redis (Railway will auto-fill if you add Redis)
REDIS_URL=${{Redis.REDIS_URL}}
# OR manual format:  
# REDIS_URL=redis://default:pass@host:port

# Auth
JWT_SECRET=kin-jwt-secret-change-this-in-production-32chars

# Telegram (Already set)
TELEGRAM_BOT_TOKEN=8441840693:AAHfRwUaEnxXrvdA56wKkNQdpMjfVwCZ7Kc
TELEGRAM_BOT_USERNAME=kin_builder_bot

# URLs (Railway auto-fills RAILWAY_PUBLIC_DOMAIN)
PORT=3001
WEB_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}
NEXT_PUBLIC_API_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}/api
```

---

## 🚀 DEPLOYMENT OPTION 1: RAILWAY (Recommended)

### Step 1: Create Project
1. Go to https://railway.app/new
2. Click **"Deploy from GitHub repo"**
3. Select: `Rebal44/kin-mvp`
4. Click **Deploy**

### Step 2: Add Database
1. Click **New** → **Database** → **Add PostgreSQL**
2. Click **New** → **Database** → **Add Redis**

### Step 3: Configure Service
1. Click on your deployed service
2. Go to **Variables** tab
3. Add all variables from EXACT ENVIRONMENT VARIABLES above
4. For `DATABASE_URL` and `REDIS_URL`, use the format:
   - `${{Postgres.DATABASE_URL}}`
   - `${{Redis.REDIS_URL}}`

### Step 4: Redeploy
1. Go to **Deployments** tab
2. Click **Redeploy**

### Step 5: Run Migrations
1. Click **Deployments** → **Deploy** dropdown
2. Select **"Deploy with command"**
3. Enter: `cd packages/db && npx prisma migrate deploy`
4. Click **Deploy**

---

## 🚀 DEPLOYMENT OPTION 2: RENDER (More Reliable)

### Step 1: Create Blueprint
1. Go to https://dashboard.render.com/blueprints
2. Click **New Blueprint Instance**
3. Connect GitHub: `Rebal44/kin-mvp`
4. Render will read `render.yaml` and create:
   - `kin-api` (Web Service)
   - `kin-web` (Static Site)
   - `kin-worker` (Background Worker)
   - `kin-postgres` (Database)
   - `kin-redis` (Redis)

### Step 2: Set Environment Variables
For each service, click **Environment** and add:

**kin-api:**
- `JWT_SECRET` = generate random string
- `TELEGRAM_BOT_TOKEN` = 8441840693:AAHfRwUaEnxXrvdA56wKkNQdpMjfVwCZ7Kc
- `TELEGRAM_BOT_USERNAME` = kin_builder_bot

**kin-web:**
- `NEXT_PUBLIC_API_URL` = URL of kin-api service (e.g., https://kin-api.onrender.com)

**kin-worker:**
- `TELEGRAM_BOT_TOKEN` = 8441840693:AAHfRwUaEnxXrvdA56wKkNQdpMjfVwCZ7Kc
- `TELEGRAM_BOT_USERNAME` = kin_builder_bot

### Step 3: Deploy All Services
Click **Apply** to deploy all services.

### Step 4: Run Migrations
1. Go to kin-api service
2. Click **Shell** tab
3. Run: `cd packages/db && npx prisma migrate deploy`

---

## ✅ POST-DEPLOYMENT CHECKLIST

### Test Health Endpoint
```bash
curl https://YOUR_URL/health
# Expected: {"status":"healthy","database":"connected"}
```

### Set Telegram Webhook
```bash
curl -X POST https://YOUR_URL/webhooks/setup-telegram-webhook
# Expected: {"success":true,"webhookUrl":"..."}
```

### Test User Registration
```bash
curl -X POST https://YOUR_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Test Telegram Bot
1. Message @Kinaitestbot on Telegram
2. Send `/start`
3. Should receive welcome message

---

## 🐛 TROUBLESHOOTING

### "Exit Code 1" During Build
**Cause:** Missing TypeScript compilation  
**Fix:** Already fixed in commit `0d80cbc`. Redeploy.

### "Exit Code 135" During Build
**Cause:** Out of memory  
**Fix:** 
- Railway: Upgrade to at least "Starter" plan ($5/month)
- Render: Upgrade service to Standard plan

### "Cannot find module '@kin/db'"
**Cause:** Workspace not resolved  
**Fix:** Use the `Dockerfile` in root (single-container) instead of individual service Dockerfiles

### "Prisma Client not found"
**Cause:** Prisma generate didn't run  
**Fix:** 
```bash
# SSH into service
cd packages/db && npx prisma generate
```

### Database Connection Refused
**Cause:** DATABASE_URL not set correctly  
**Fix:** Use Railway/Render's auto-inserted variables, not manual URLs

---

## 📊 EXPECTED URLs AFTER DEPLOYMENT

**Railway:**
- API: `https://kin-mvp-production.up.railway.app`
- Web: Same as API (served on same domain)

**Render:**
- API: `https://kin-api.onrender.com`
- Web: `https://kin-web.onrender.com`

---

## 🔄 IF ALL ELSE FAILS: Manual Docker Deploy

```bash
# Clone repo
git clone https://github.com/Rebal44/kin-mvp.git
cd kin-mvp

# Set environment variables
export DATABASE_URL="your-postgres-url"
export REDIS_URL="your-redis-url"
export JWT_SECRET="your-secret"
export TELEGRAM_BOT_TOKEN="8441840693:AAHfRwUaEnxXrvdA56wKkNQdpMjfVwCZ7Kc"

# Build and run
docker build -t kin .
docker run -p 3000:3000 -p 3001:3001 \
  -e DATABASE_URL \
  -e REDIS_URL \
  -e JWT_SECRET \
  -e TELEGRAM_BOT_TOKEN \
  kin
```

---

## 📞 SUPPORT

If deployment continues to fail:
1. Check Railway/Render logs for specific error
2. Ensure all environment variables are set
3. Try Render instead of Railway (more reliable)
4. Use the single-container `Dockerfile` approach

**Current Commit:** `0d80cbc` (Ready to deploy)
