# CCM ENGAGEMINT - Railway Deployment Guide

## 🚀 Quick Deployment Steps

### 1. Prerequisites
- Railway account (sign up at https://railway.app)
- Railway CLI installed
- Git repository

### 2. Railway Project Setup

```bash
# Login to Railway
railway login

# Link to existing project or create new one
railway link

# Or create a new project
railway init
```

### 3. Add PostgreSQL Database

In the Railway dashboard:
1. Click "New" → "Database" → "PostgreSQL"
2. Railway will automatically provision a PostgreSQL database
3. Connection details will be available as environment variables

### 4. Configure Environment Variables

In Railway dashboard, add these variables to your backend service:

```env
# Server Configuration
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.vercel.app

# Database (Railway automatically provides DATABASE_URL)
# But you can also set individual variables if needed:
DB_HOST=${{Postgres.PGHOST}}
DB_PORT=${{Postgres.PGPORT}}
DB_NAME=${{Postgres.PGDATABASE}}
DB_USER=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}

# Or use the full DATABASE_URL
DATABASE_URL=${{Postgres.DATABASE_URL}}

# JWT Configuration
JWT_SECRET=<generate-a-secure-random-string-min-32-chars>
JWT_EXPIRE=7d

# Security
BCRYPT_ROUNDS=10
```

**Generate JWT Secret:**
```bash
openssl rand -base64 32
```

### 5. Initialize Database

Once your PostgreSQL database is provisioned:

**Option A: Using Railway CLI**
```bash
# Connect to Railway PostgreSQL
railway run psql $DATABASE_URL -f backend/src/config/full-db-init.sql
```

**Option B: Using Railway Dashboard**
1. Go to your PostgreSQL service
2. Click "Data" tab
3. Click "Query"
4. Copy and paste contents of `backend/src/config/full-db-init.sql`
5. Click "Run"

**Option C: Using Local psql with Railway credentials**
```bash
# Get database URL from Railway
railway variables

# Connect and run initialization
psql "postgresql://user:password@host:port/database" -f backend/src/config/full-db-init.sql
```

### 6. Deploy Backend

```bash
# Deploy to Railway
railway up

# Or use GitHub integration (recommended)
# 1. Push your code to GitHub
# 2. In Railway dashboard, connect your GitHub repo
# 3. Railway will automatically deploy on push to main/master
```

### 7. Verify Deployment

```bash
# Check deployment status
railway status

# View logs
railway logs

# Get service URL
railway url
```

Your backend will be available at: `https://your-app-name.up.railway.app`

### 8. Update Frontend Configuration

Update your frontend's `.env.production`:
```env
NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app/api
```

## 📊 Database Schema Overview

The `full-db-init.sql` script creates:

### Core Tables:
- ✅ users - User accounts and profiles
- ✅ tokens - Creator tokens (KING, QUEEN, etc.)
- ✅ videos - Video content
- ✅ user_token_balances - Token holdings
- ✅ communities - Token-gated communities
- ✅ community_members - Community membership
- ✅ video_likes - Video engagement
- ✅ video_comments - Video comments
- ✅ sessions - Authentication sessions

### Social Features:
- ✅ user_follows - Following/followers relationships
- ✅ interests - Content categories
- ✅ user_interests - User interest preferences
- ✅ user_preferences - User settings
- ✅ video_views - View tracking
- ✅ user_activity - Activity logs

### Functions:
- ✅ get_follower_count() - Get follower count for user
- ✅ get_following_count() - Get following count for user
- ✅ is_following() - Check if user follows another user
- ✅ update_updated_at_column() - Auto-update timestamps

### Default Data:
- ✅ 15 default interests (Music, Comedy, Crypto, Gaming, etc.)

## 🔧 Railway Configuration Files

### railway.json
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "cd backend && node src/server.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

This configuration:
- Uses Nixpacks builder (auto-detects Node.js)
- Starts the backend server from the backend directory
- Auto-restarts on failure (max 10 retries)
- **Frontend is excluded** - only backend is deployed

## 🔍 Testing the Deployment

### Health Check
```bash
curl https://your-backend.up.railway.app/api/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "CCM ENGAGEMINT API is running"
}
```

### Test Signup
```bash
curl -X POST https://your-backend.up.railway.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'
```

### Test Get Videos
```bash
curl https://your-backend.up.railway.app/api/videos
```

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check if database is running
railway logs --service postgresql

# Verify environment variables
railway variables

# Test database connection
railway run node -e "require('./backend/src/config/database.js')"
```

### Build Failures
```bash
# Check build logs
railway logs --deployment

# Verify package.json has all dependencies
cd backend && npm install

# Test locally first
cd backend && npm start
```

### Port Issues
Railway automatically assigns a PORT environment variable. Make sure your server.js uses:
```javascript
const PORT = process.env.PORT || 5000
```

## 📱 Mobile/CORS Configuration

The backend is configured to accept requests from:
- localhost:3000 (development)
- localhost:3001 (development)
- process.env.FRONTEND_URL (production)

Update FRONTEND_URL in Railway environment variables to match your production frontend domain.

## 🔐 Security Notes

1. **Never commit .env files** - Railway handles environment variables
2. **Use strong JWT_SECRET** - Generate with `openssl rand -base64 32`
3. **Database credentials** - Railway auto-generates secure passwords
4. **HTTPS only** - Railway provides SSL certificates automatically
5. **Rate limiting** - Already configured in server.js

## 📈 Monitoring

Railway provides:
- Real-time logs
- Resource usage metrics
- Deployment history
- Custom domains
- Automatic SSL certificates

Access monitoring in the Railway dashboard under your service.

## 🎯 Next Steps

1. ✅ Deploy backend to Railway
2. ✅ Initialize database with full-db-init.sql
3. ✅ Test all API endpoints
4. ✅ Update frontend environment variables
5. ✅ Deploy frontend to Vercel
6. ✅ Test full integration
7. ✅ Set up custom domain (optional)
8. ✅ Configure monitoring and alerts

## 📚 Resources

- Railway Docs: https://docs.railway.app
- PostgreSQL Guide: https://docs.railway.app/databases/postgresql
- Node.js Deployment: https://docs.railway.app/languages/nodejs
- Environment Variables: https://docs.railway.app/develop/variables
