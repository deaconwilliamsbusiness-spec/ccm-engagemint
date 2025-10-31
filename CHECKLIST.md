# ✅ MOBILE FIX CHECKLIST

## **Quick Action Plan:**

### **📋 Railway Setup** (15 minutes)

Open: https://railway.com/project/306006da-c63f-44a2-b087-419c54a65dc6

- [ ] **Step 1:** Click "+ New" → "GitHub Repo" → Select `ccm-engagemint` → Root: `backend`
- [ ] **Step 2:** Click "+ New" → "Database" → "Add PostgreSQL"
- [ ] **Step 3:** Click backend service → "Variables" → Copy vars from `RAILWAY_ENV_VARS.txt`
- [ ] **Step 4:** Click PostgreSQL → "Data" → "Query" → Paste `full-db-init.sql` → Run
- [ ] **Step 5:** Click backend → "Settings" → Copy domain URL

### **📋 Vercel Configuration** (2 minutes)

Open: https://vercel.com/deac4236-8073s-projects/ccm-engagemint/settings/environment-variables

- [ ] **Step 6:** Click "Add New"
  - Name: `NEXT_PUBLIC_API_URL`
  - Value: `https://[railway-url].up.railway.app/api`
  - Environments: ✅ All three
- [ ] **Step 7:** Go to Deployments → Latest → "⋮" → "Redeploy"

### **📋 Testing** (1 minute)

- [ ] **Step 8:** Open phone → https://engagemint.meme → Try sign up
- [ ] **Step 9:** Should work! 🎉

---

## **Files Reference:**

📄 **DEPLOY_NOW.md** - Detailed instructions with screenshots
📄 **RAILWAY_ENV_VARS.txt** - Copy-paste environment variables
📄 **MOBILE_FIX_INSTRUCTIONS.md** - Complete troubleshooting guide

---

## **Expected Timeline:**

- Railway setup: **10-15 minutes**
- Vercel config: **2 minutes**
- Deployment wait: **2-3 minutes**
- Testing: **1 minute**

**Total: ~20 minutes** to get mobile working! ⚡

---

## **Quick Test Commands:**

### Test backend health:
```bash
curl https://[your-railway-url].up.railway.app/api/health
```

Should return:
```json
{"status":"ok","message":"CCM ENGAGEMINT API is running"}
```

### Test signup:
```bash
curl -X POST https://[your-railway-url].up.railway.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"TestPass123"}'
```

Should return success with user data.

---

## **If Something Goes Wrong:**

1. **Check Railway logs:** Backend service → Deployments → Latest → Logs
2. **Check database:** PostgreSQL service → Should be green/running
3. **Check Vercel logs:** Deployments → Latest → Runtime Logs
4. **Check browser console:** F12 → Console → Look for errors

---

## **After It Works:**

✅ Sign up on mobile works
✅ Login works
✅ Video upload works
✅ Feed loads
✅ All features functional

Then you can:
- Share with friends
- Add custom domain
- Scale as needed
- Add more features

---

**You got this! 💪**

The backend just needs to be deployed - everything else is already ready!
