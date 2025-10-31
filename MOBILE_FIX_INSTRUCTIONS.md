# 🔧 FIX: Mobile "Load Error" on Sign Up

## **Problem:**
When you try to sign up on your mobile phone at https://engagemint.meme, you get a "load error" message.

## **Root Cause:**
Your frontend (Vercel) is trying to connect to `localhost:5000` which doesn't exist on mobile. You need a deployed backend.

---

## **SOLUTION: Deploy Backend & Configure Frontend**

### **Step 1: Deploy Backend to Railway**

#### **Option A: Using Railway Dashboard (Easiest)**

1. **Go to Railway Dashboard:** https://railway.app/dashboard
2. **Find your "CCM-Engagemint" project**
3. **Click on the project**
4. **Check if backend service exists:**
   - If **NO service**: Click "New" → "GitHub Repo" → Select `ccm-engagemint` → Deploy from `/backend` folder
   - If **service exists**: Note the URL (looks like `https://xxx.up.railway.app`)

5. **Add PostgreSQL Database (if not already added):**
   - Click "New" → "Database" → "PostgreSQL"
   - Railway will auto-provision it

6. **Configure Environment Variables:**
   Click on your backend service → "Variables" → Add these:
   ```
   PORT=5000
   NODE_ENV=production
   FRONTEND_URL=https://engagemint.meme
   JWT_SECRET=<copy from backend/.env or generate new: openssl rand -base64 32>
   JWT_EXPIRE=7d
   BCRYPT_ROUNDS=10
   ```

7. **Initialize Database:**
   - Click on PostgreSQL service → "Data" → "Query"
   - Copy entire contents of `/root/ccm-engagemint/backend/src/config/full-db-init.sql`
   - Paste and run

8. **Get your backend URL:**
   - Click on backend service → "Settings" → Copy the domain
   - Should look like: `https://ccm-engagemint-production.up.railway.app`

#### **Option B: Using Railway CLI (From Your Computer)**

```bash
# Go to project directory
cd /root/ccm-engagemint

# Login to Railway (if not already logged in)
railway login --browserless

# Link to project (select CCM-Engagemint when prompted)
# Since we can't do interactive, use the web dashboard instead

# Or deploy using:
railway up
```

---

### **Step 2: Configure Vercel Frontend**

1. **Go to Vercel Dashboard:** https://vercel.com/deac4236-8073s-projects/ccm-engagemint

2. **Click "Settings" → "Environment Variables"**

3. **Add this variable:**
   ```
   Name: NEXT_PUBLIC_API_URL
   Value: https://your-railway-backend-url.up.railway.app/api
   ```
   *(Replace with your actual Railway backend URL from Step 1)*

4. **Select environments:** Production, Preview, Development (check all three)

5. **Click "Save"**

6. **Redeploy:**
   - Go to "Deployments" tab
   - Click the 3 dots on latest deployment
   - Click "Redeploy"

---

### **Step 3: Verify It Works**

1. **Test Backend:**
   ```bash
   curl https://your-railway-backend.up.railway.app/api/health
   ```
   Should return: `{"status":"ok","message":"CCM ENGAGEMINT API is running"}`

2. **Test Frontend:**
   - Open https://engagemint.meme on your phone
   - Try to sign up
   - Should work now! ✅

---

## **Quick Command Reference**

### **Check Railway Status:**
```bash
railway status
```

### **View Railway Logs:**
```bash
railway logs
```

### **Get Railway URL:**
```bash
railway url
```

### **Redeploy Vercel:**
```bash
vercel --prod
```

---

## **Expected URLs After Setup:**

- **Frontend:** https://engagemint.meme (Vercel)
- **Backend:** https://ccm-engagemint-production.up.railway.app (Railway)
- **Database:** Railway PostgreSQL (internal)

---

## **Troubleshooting**

### **"Cannot connect to server" error:**
- Backend is not deployed or crashed
- Check Railway logs: `railway logs`
- Verify environment variables are set

### **CORS error:**
- Add your Vercel domain to `FRONTEND_URL` in Railway
- Should be: `FRONTEND_URL=https://engagemint.meme`

### **Database connection error:**
- Run the `full-db-init.sql` script in Railway PostgreSQL
- Verify DATABASE_URL environment variable exists

### **Still getting errors:**
- Check browser console (F12) for detailed error
- Check Railway logs for backend errors
- Verify `NEXT_PUBLIC_API_URL` in Vercel matches Railway URL

---

## **Alternative: Quick Local Test**

If you want to test locally first:

1. **Start local backend:**
   ```bash
   cd /root/ccm-engagemint/backend
   npm start
   ```

2. **In another terminal, start frontend:**
   ```bash
   cd /root/ccm-engagemint/frontend
   npm run dev
   ```

3. **Visit:** http://localhost:3000
4. **Sign up should work!**

But for mobile, you MUST deploy backend to Railway/Render/Heroku.

---

**Need Help?**
- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- Project logs are your friend!
