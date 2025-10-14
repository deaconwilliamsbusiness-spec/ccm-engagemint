# Deployment Guide for CCM Engagemint

This guide walks you through deploying both the frontend and backend to production.

## 📋 Overview

- **Frontend**: Deploy to Vercel (Next.js)
- **Backend**: Deploy to Railway, Render, or Heroku (Node.js/Express)
- **Database**: Use cloud PostgreSQL (Supabase, Railway, Render, or Neon)

---

## 🚀 Step 1: Set up Production Database

### Option A: Supabase (Recommended - Free Tier)

1. Go to https://supabase.com and create a new project
2. Wait for the database to be created
3. Go to **Project Settings > Database**
4. Copy the connection details:
   - Host
   - Database name
   - Port (5432)
   - User
   - Password
5. Go to **SQL Editor** and run the SQL from `backend/src/config/init-db.sql`

### Option B: Railway

1. Go to https://railway.app
2. Create a new PostgreSQL database
3. Copy connection credentials from the Variables tab
4. Use Railway's console to run `backend/src/config/init-db.sql`

### Option C: Render

1. Go to https://render.com
2. Create a new PostgreSQL database (free tier available)
3. Copy connection credentials
4. Connect via psql and run init-db.sql

---

## 🖥️ Step 2: Deploy Backend

### Option A: Railway (Recommended)

1. Go to https://railway.app
2. Click **"New Project"** > **"Deploy from GitHub repo"**
3. Connect your GitHub account and select `ccm-engagemint`
4. Configure the service:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add environment variables (from `.env.production`):
   - `PORT=5000`
   - `NODE_ENV=production`
   - `FRONTEND_URL=https://your-vercel-app.vercel.app` (add later)
   - Database credentials from Step 1
   - `JWT_SECRET` (generate a secure random string)
6. Deploy and copy the public URL

### Option B: Render

1. Go to https://render.com
2. Click **"New +"** > **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add environment variables from `.env.production`
6. Deploy and copy the public URL

### Option C: Heroku

```bash
# Install Heroku CLI first
cd backend
heroku create your-app-name
heroku addons:create heroku-postgresql:essential-0

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_secure_secret
heroku config:set FRONTEND_URL=https://your-vercel-app.vercel.app

# Deploy
git subtree push --prefix backend heroku main
```

---

## 🌐 Step 3: Deploy Frontend to Vercel

### Option A: Vercel CLI (Quick)

1. Login to Vercel:
   ```bash
   vercel login
   ```

2. Deploy from the project root:
   ```bash
   cd /root/ccm-engagemint
   vercel
   ```

3. Follow the prompts:
   - **Set up and deploy?** Yes
   - **Which scope?** Your account
   - **Link to existing project?** No
   - **Project name?** ccm-engagemint (or your choice)
   - **Directory?** ./
   - **Override settings?** No

4. Add environment variables:
   ```bash
   vercel env add NEXT_PUBLIC_API_URL production
   ```
   Enter your backend URL from Step 2: `https://your-backend.railway.app/api`

5. Deploy to production:
   ```bash
   vercel --prod
   ```

### Option B: Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** > **"Project"**
3. Import your GitHub repository: `ccm-engagemint`
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend` (or leave empty if vercel.json is configured)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
5. Add Environment Variable:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: Your backend URL (e.g., `https://your-backend.railway.app/api`)
6. Click **"Deploy"**

---

## 🔄 Step 4: Update Backend FRONTEND_URL

After deploying the frontend, update your backend environment variable:

**Railway:**
- Go to your backend service > Variables
- Update `FRONTEND_URL` to your Vercel URL: `https://your-app.vercel.app`
- Redeploy

**Render:**
- Go to your web service > Environment
- Update `FRONTEND_URL`
- Service will auto-redeploy

**Heroku:**
```bash
heroku config:set FRONTEND_URL=https://your-vercel-app.vercel.app
```

---

## ✅ Step 5: Test Production Deployment

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Test the password gate (use password from config)
3. Test video feed and navigation
4. Check browser console for any API errors
5. Test API health check: `https://your-backend.railway.app/api/health`

---

## 🔒 Security Checklist

- [ ] Changed `JWT_SECRET` to a secure random string (min 32 characters)
- [ ] Updated database passwords from defaults
- [ ] Set `NODE_ENV=production` on backend
- [ ] CORS configured with correct frontend URL
- [ ] Database connection uses SSL (check provider settings)
- [ ] Environment variables are not committed to git

---

## 🐛 Troubleshooting

### CORS Errors
- Verify `FRONTEND_URL` in backend matches your Vercel domain exactly
- Check CORS configuration in `backend/src/server.js`

### API Connection Failed
- Verify `NEXT_PUBLIC_API_URL` in Vercel environment variables
- Check backend is running: visit `https://your-backend.com/api/health`
- Check backend logs for errors

### Database Connection Failed
- Verify database credentials are correct
- Check if database allows connections from your backend host
- For Render/Railway, check if SSL is required

### Build Failures
- Check build logs in Vercel/Railway dashboard
- Verify all dependencies are in package.json
- Test build locally: `npm run build`

---

## 🔄 Continuous Deployment

Both Vercel and Railway support automatic deployments:

1. **Vercel** automatically deploys on push to main branch
2. **Railway** can be configured to auto-deploy on git push
3. Any changes to your GitHub repository will trigger new deployments

---

## 📊 Monitoring

- **Vercel Analytics**: Enable in project settings for frontend metrics
- **Railway Metrics**: View CPU, memory, and request metrics
- **Database Monitoring**: Check connection pool usage in Supabase/Railway

---

## 💰 Cost Estimates

- **Vercel**: Free tier (generous limits for hobby projects)
- **Railway**: $5/month free credit (should cover small apps)
- **Supabase**: Free tier (500MB database, 2GB bandwidth)
- **Render**: Free tier available (spins down after inactivity)

**Total**: $0-5/month for hobby/testing projects

---

**Last Updated**: October 14, 2025
