# 🚀 DEPLOY BACKEND TO RAILWAY - STEP BY STEP

Your Railway Project: https://railway.com/project/306006da-c63f-44a2-b087-419c54a65dc6

---

## **STEP 1: Create Backend Service**

1. **Open your Railway project:** https://railway.com/project/306006da-c63f-44a2-b087-419c54a65dc6

2. **Click "+ New"** button (top right)

3. **Select "GitHub Repo"**

4. **Choose:** `deaconwilliamsbusiness-spec/ccm-engagemint`

5. **Important:** Under "Root Directory", enter: `backend`
   - This tells Railway to only deploy the backend folder

6. **Click "Deploy"**

---

## **STEP 2: Add PostgreSQL Database**

1. **In same project, click "+ New"** again

2. **Select "Database" → "Add PostgreSQL"**

3. **Railway will auto-provision the database** ✅

---

## **STEP 3: Configure Backend Environment Variables**

1. **Click on your backend service** (the one you just created)

2. **Go to "Variables" tab**

3. **Click "+ New Variable"** and add each of these:

### **Required Variables:**

```
PORT
5000

NODE_ENV
production

FRONTEND_URL
https://engagemint.meme

JWT_SECRET
<Generate new: open terminal and run: openssl rand -base64 32>

JWT_EXPIRE
7d

BCRYPT_ROUNDS
10
```

### **Database Variables (Auto-detected from PostgreSQL):**

Railway should automatically detect these, but verify they exist:
```
DATABASE_URL
${{Postgres.DATABASE_URL}}

DB_HOST
${{Postgres.PGHOST}}

DB_PORT
${{Postgres.PGPORT}}

DB_NAME
${{Postgres.PGDATABASE}}

DB_USER
${{Postgres.PGUSER}}

DB_PASSWORD
${{Postgres.PGPASSWORD}}
```

4. **Click "Save" or "Add" after each variable**

---

## **STEP 4: Initialize Database**

1. **Click on your PostgreSQL service**

2. **Go to "Data" tab**

3. **Click "Query" or connect via psql**

4. **Copy the ENTIRE contents** of this file:
   `/root/ccm-engagemint/backend/src/config/full-db-init.sql`

5. **Paste into the query box and click "Run"**

6. **Verify:** You should see tables created successfully

---

## **STEP 5: Get Your Backend URL**

1. **Click on your backend service**

2. **Go to "Settings" tab**

3. **Scroll to "Domains" section**

4. **Your backend URL will be shown** - looks like:
   ```
   https://ccm-engagemint-production-XXXX.up.railway.app
   ```
   Or you might have a custom domain.

5. **Copy this URL!** You'll need it for Vercel.

6. **Test it:** Open in browser: `https://your-url.up.railway.app/api/health`
   - Should return: `{"status":"ok","message":"CCM ENGAGEMINT API is running"}`

---

## **STEP 6: Configure Vercel Frontend**

1. **Go to Vercel:** https://vercel.com/deac4236-8073s-projects/ccm-engagemint/settings/environment-variables

2. **Click "Add New"**

3. **Add this variable:**
   ```
   Name: NEXT_PUBLIC_API_URL
   Value: https://your-railway-url.up.railway.app/api
   ```
   ⚠️ **IMPORTANT:** Add `/api` at the end!

4. **Select all environments:** Production, Preview, Development

5. **Click "Save"**

---

## **STEP 7: Redeploy Vercel**

1. **Go to:** https://vercel.com/deac4236-8073s-projects/ccm-engagemint

2. **Click "Deployments" tab**

3. **Find the latest deployment**

4. **Click the 3 dots (⋮) → "Redeploy"**

5. **Wait for deployment to complete** (~1-2 minutes)

---

## **STEP 8: TEST ON MOBILE! 🎉**

1. **Open your phone browser**

2. **Go to:** https://engagemint.meme

3. **Try to sign up with:**
   - Username: testuser123
   - Email: test@example.com
   - Password: TestPass123

4. **Should work now!** ✅

---

## **Troubleshooting**

### **If sign-up still fails:**

1. **Check Railway logs:**
   - Railway Dashboard → Backend Service → "Deployments" → Click latest → View logs
   - Look for errors

2. **Check database connection:**
   - Make sure PostgreSQL service is running (green dot)
   - Verify you ran the `full-db-init.sql` script

3. **Check Vercel environment:**
   - Make sure `NEXT_PUBLIC_API_URL` is set correctly
   - Make sure you redeployed after adding the variable

4. **Test backend directly:**
   ```bash
   curl https://your-railway-url.up.railway.app/api/health
   ```
   Should return: `{"status":"ok"}`

5. **Check CORS:**
   - Make sure `FRONTEND_URL` in Railway matches your Vercel domain exactly:
     `https://engagemint.meme` (no trailing slash)

---

## **Quick Reference**

### **Your URLs:**
- **Frontend:** https://engagemint.meme
- **Backend:** https://[your-railway-url].up.railway.app
- **Railway Dashboard:** https://railway.com/project/306006da-c63f-44a2-b087-419c54a65dc6
- **Vercel Dashboard:** https://vercel.com/deac4236-8073s-projects/ccm-engagemint

### **Generate JWT Secret:**
```bash
openssl rand -base64 32
```

### **View Railway Logs (CLI):**
```bash
railway logs
```

### **Redeploy Backend (CLI):**
```bash
cd /root/ccm-engagemint/backend
railway up
```

---

## **Expected Result**

After completing all steps:

✅ Backend deployed on Railway
✅ Database initialized with all tables
✅ Frontend connected to backend
✅ Mobile sign-up works!
✅ All features functional

---

**Need Help?**
- Railway Support: https://railway.app/help
- Check the logs first - they usually tell you what's wrong!
- Make sure all environment variables are set correctly
