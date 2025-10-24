# 🚂 Railway Deployment Guide - Web Dashboard Only

**NO CLI NEEDED** - Everything done in your browser!

---

## ✅ **What's Already Set Up:**

Your app now has **automatic database setup**. When you deploy to Railway:
1. It installs dependencies
2. **Automatically creates all database tables** (no manual SQL needed!)
3. Builds Next.js
4. Starts your app

**You just need to deploy and add environment variables.**

---

## 🚀 **Step-by-Step Deployment**

### **Step 1: Open Railway Dashboard**

Go to: **https://railway.app/dashboard**

### **Step 2: Open Your Project**

Click on your **"CCM-ENGAGEMINT"** project

### **Step 3: Create New Service**

Click the **"+ New"** button (usually top right)

### **Step 4: Deploy from GitHub**

1. Click **"GitHub Repo"**
2. Search for: **"ccm-engagemint"**
3. Select: **deaconwilliamsbusiness-spec/ccm-engagemint**
4. Choose branch: **claude/clarify-identity-011CUS5S3WXGQnirs1Pua8vH**
5. Click **"Deploy"**

### **Step 5: Connect Database**

1. In your new service, click **"Variables"** tab
2. Click **"+ New Variable"**
3. Click **"Reference"**
4. Select: **Postgres.DATABASE_URL**
5. Name it: **DATABASE_URL**

This connects your app to your PostgreSQL database automatically!

### **Step 6: Add Other Environment Variables**

Still in the "Variables" tab, click **"+ New Variable"** for each:

```
JWT_SECRET = Kr57RC8YqqaNxUVQs+QxB4JUQnCrEfM6XDnkXC3kswg=
```

```
APP_PASSWORD_HASH = $2b$10$WnpZBSnTJFNTZ.fbI91SDuFTa6C2nJieI1iuMZmXnpKeqRRxdEDyO
```

```
NODE_ENV = production
```

**Optional (add later when you set up OAuth):**

```
NEXT_PUBLIC_TIKTOK_CLIENT_KEY = your-tiktok-key
TIKTOK_CLIENT_SECRET = your-tiktok-secret
NEXT_PUBLIC_TIKTOK_REDIRECT_URI = https://your-app.railway.app/auth/tiktok/callback
NEXT_PUBLIC_INSTAGRAM_CLIENT_ID = your-instagram-id
INSTAGRAM_CLIENT_SECRET = your-instagram-secret
NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI = https://your-app.railway.app/auth/instagram/callback
```

### **Step 7: Wait for Deployment**

Railway will now:
- ✅ Install packages
- ✅ Generate Prisma client
- ✅ **Create database tables automatically** (this is the magic!)
- ✅ Build Next.js
- ✅ Start your app

Watch the logs - you should see:
```
🔄 prisma db push
✅ Your database is now in sync with your Prisma schema.
```

This means tables were created!

### **Step 8: Get Your URL**

1. Click on your service
2. Go to **"Settings"** tab
3. Scroll to **"Networking"**
4. Click **"Generate Domain"**
5. Copy the URL (looks like: `your-app.railway.app`)

### **Step 9: Test Your App**

1. Open the URL in your browser
2. You should see the password gate
3. Enter password: **`ccm2024`**
4. You're in! 🎉

---

## 🐛 **Troubleshooting**

### **If build fails:**

1. Check the logs in Railway
2. Look for "DATABASE_URL" - make sure it's set
3. Make sure you referenced `${{ Postgres.DATABASE_URL }}`

### **If password doesn't work:**

The password is: **`ccm2024`**

If it still doesn't work, the APP_PASSWORD_HASH might be wrong. Copy it exactly:
```
$2b$10$WnpZBSnTJFNTZ.fbI91SDuFTa6C2nJieI1iuMZmXnpKeqRRxdEDyO
```

### **If you see "Database connection failed":**

Make sure the DATABASE_URL variable is set correctly and references your Postgres service.

---

## 📋 **Complete Environment Variables Checklist**

Required (add these now):
- [x] DATABASE_URL → Reference: `${{ Postgres.DATABASE_URL }}`
- [x] JWT_SECRET
- [x] APP_PASSWORD_HASH
- [x] NODE_ENV

Optional (add when you have OAuth apps):
- [ ] NEXT_PUBLIC_TIKTOK_CLIENT_KEY
- [ ] TIKTOK_CLIENT_SECRET
- [ ] NEXT_PUBLIC_TIKTOK_REDIRECT_URI
- [ ] NEXT_PUBLIC_INSTAGRAM_CLIENT_ID
- [ ] INSTAGRAM_CLIENT_SECRET
- [ ] NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI

---

## 🎯 **Summary**

**What you need to do:**
1. ✅ Click "+ New" in Railway
2. ✅ Deploy from GitHub
3. ✅ Reference Postgres.DATABASE_URL
4. ✅ Add JWT_SECRET and APP_PASSWORD_HASH
5. ✅ Wait for build
6. ✅ Generate domain
7. ✅ Visit URL and login with: `ccm2024`

**That's it!** No SQL, no CLI, just clicking in the web dashboard.

The database tables are created **automatically** during the build process. 🎉

---

## 🆘 **Need Help?**

If something goes wrong, check the **"Deployments"** tab and click on the latest deployment to see the logs. Look for any red error messages.

Most common issues:
1. DATABASE_URL not set → Add the reference
2. Prisma can't connect → Check DATABASE_URL format
3. Build fails → Check logs for specific error

---

**Your app login password is: `ccm2024`**

Remember this! You'll need it to access your app after deployment.
