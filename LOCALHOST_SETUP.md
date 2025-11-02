# 🚀 EngageMint Localhost Setup Guide

**Complete setup in 15-20 minutes**

---

## ✅ Pre-Flight Checklist

Before starting, ensure you have:

- [ ] **Node.js 18+** installed (`node --version`)
- [ ] **PostgreSQL** installed and running (`psql --version`)
- [ ] **Solana CLI** installed (`solana --version`)
- [ ] **Anchor CLI** installed (`anchor --version`)
- [ ] **Git** repository cloned

---

## 📦 Step 1: Install Dependencies (3 min)

### Backend
```bash
cd /root/ccm-engagemint/backend
npm install
```

**Expected packages:**
- express, pg, socket.io, jsonwebtoken
- @solana/web3.js, @coral-xyz/anchor
- @metaplex-foundation/js
- multer, bcryptjs, winston

### Frontend
```bash
cd /root/ccm-engagemint/frontend
npm install
```

**Expected packages:**
- next, react, typescript
- @solana/wallet-adapter-react
- tailwindcss, lucide-react

---

## 🗄️ Step 2: Setup Database (5 min)

### Create Database
```bash
# Create database
createdb engagemint

# Verify creation
psql -l | grep engagemint
```

### Run Main Migration
```bash
cd /root/ccm-engagemint/backend

# Run full database initialization
psql -d engagemint -f src/config/full-db-init.sql
```

**This creates all tables:**
- users, videos, comments, video_likes
- tokens, token_trades, token_holders
- communities, community_members
- video_views, user_activity

### Run View Tracking Migration (NEW!)
```bash
# Add view tracking system
psql -d engagemint -f db-migrations/add-view-tracking.sql
```

**This adds:**
- video_view_events table
- View validation functions
- Auto-update triggers
- Analytics views

### Verify Tables Created
```bash
psql -d engagemint -c "\dt"
```

**Expected output:** 15+ tables including `video_view_events`

---

## ⚙️ Step 3: Configure Environment Variables (3 min)

### Backend Environment

Create `/root/ccm-engagemint/backend/.env`:

```env
# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://localhost:5432/engagemint

# JWT Secret (generate strong secret)
JWT_SECRET=your_super_secret_jwt_key_change_this_min_32_characters

# Solana (devnet for testing)
SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com

# Solana Program (update after deploying)
BONDING_CURVE_PROGRAM_ID=11111111111111111111111111111111

# Platform Wallet (auto-generates if not provided)
# PLATFORM_WALLET_PRIVATE_KEY=your_base58_private_key

# Token Launch Settings
INSTANT_MINT_COST_SOL=0.1
VIRAL_THRESHOLD=100
```

**🔐 Security Notes:**
- Generate JWT_SECRET: `openssl rand -base64 32`
- Never commit `.env` to git
- Change default passwords

### Frontend Environment

Create `/root/ccm-engagemint/frontend/.env.local`:

```env
# API Connection
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Solana Configuration
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com

# Program ID (update after deploying Anchor program)
NEXT_PUBLIC_BONDING_CURVE_PROGRAM_ID=11111111111111111111111111111111

# Token Launch Settings
NEXT_PUBLIC_INSTANT_MINT_COST_SOL=0.1
NEXT_PUBLIC_VIRAL_THRESHOLD=100
```

---

## 🔗 Step 4: Deploy Anchor Program (Optional - 5 min)

**Note:** Skip this if you only want to test the social features without token launches.

### Build Program
```bash
cd /root/ccm-engagemint
anchor build
```

### Get Program ID
```bash
anchor keys list
# Output: engagemint_bonding_curve: <YOUR_PROGRAM_ID>
```

### Update Program ID in Code
```bash
# Update lib.rs
nano programs/engagemint-bonding-curve/src/lib.rs
# Change: declare_id!("YOUR_PROGRAM_ID");

# Update Anchor.toml
nano Anchor.toml
# Change: engagemint_bonding_curve = "YOUR_PROGRAM_ID"
```

### Rebuild with Correct ID
```bash
anchor build
```

### Get Devnet SOL
```bash
solana config set --url devnet
solana airdrop 2
```

### Deploy to Devnet
```bash
anchor deploy --provider.cluster devnet
```

### Update Environment Files
```bash
# Update backend/.env
BONDING_CURVE_PROGRAM_ID=<YOUR_PROGRAM_ID>

# Update frontend/.env.local
NEXT_PUBLIC_BONDING_CURVE_PROGRAM_ID=<YOUR_PROGRAM_ID>
```

---

## 🚀 Step 5: Start Services (2 min)

### Terminal 1: Backend
```bash
cd /root/ccm-engagemint/backend
npm run dev
```

**Expected output:**
```
🚀 Server is running on port 5000
✅ Database connected
✅ Platform wallet: <ADDRESS>
💰 Platform wallet balance: X.XXXX SOL
✅ Metaplex initialized
✅ Price monitor started
📊 Monitoring 0 tokens
🎉 All services initialized successfully!
```

**If platform wallet has no SOL:**
```bash
solana airdrop 2 <PLATFORM_WALLET_ADDRESS> --url devnet
```

### Terminal 2: Frontend
```bash
cd /root/ccm-engagemint/frontend
npm run dev
```

**Expected output:**
```
▲ Next.js 15.5.3
- Local:        http://localhost:3000
- Network:      http://0.0.0.0:3000

✓ Ready in 2.5s
```

---

## ✅ Step 6: Verify Everything Works (5 min)

### 1. Open Browser
Navigate to: **http://localhost:3000**

### 2. Test Authentication
- Click "Sign Up"
- Create account: `testuser` / `password123`
- Should log in successfully

### 3. Test Video Upload
- Click "+" (Upload)
- Select "POST VIDEO" (free viral path)
- Upload a video file
- Add title and description
- Click "Post Video"
- **Expected:** Video appears in feed

### 4. Test Engagement
- Scroll to your video in feed
- Wait 1 second
- **Expected:** View count increases by 1
- Click heart icon
- **Expected:** Like count increases by 1

### 5. Test Backend API
```bash
# Check health endpoint
curl http://localhost:5000/api/health

# Expected: {"status":"ok","message":"CCM ENGAGEMINT API is running"}

# Check videos endpoint
curl http://localhost:5000/api/videos | jq
```

### 6. Test Database
```bash
# Check videos created
psql -d engagemint -c "SELECT id, title, views_count, likes_count FROM videos LIMIT 5;"

# Check view tracking
psql -d engagemint -c "SELECT * FROM video_view_events ORDER BY viewed_at DESC LIMIT 5;"
```

---

## 🐛 Troubleshooting

### Backend Won't Start

**Error: "Cannot find module"**
```bash
cd backend && npm install
```

**Error: "Database connection failed"**
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check database exists
psql -l | grep engagemint

# Test connection
psql -d engagemint -c "SELECT NOW();"
```

**Error: "Port 5000 already in use"**
```bash
# Find and kill process
lsof -ti:5000 | xargs kill -9

# Or change port in backend/.env
PORT=5001
```

### Frontend Won't Start

**Error: "API_URL is not defined"**
- Ensure `frontend/.env.local` exists
- Restart dev server: `npm run dev`

**Error: "Module not found"**
```bash
cd frontend && npm install
```

**Error: "Port 3000 already in use"**
```bash
# Kill Next.js process
pkill -f "next dev"

# Start on different port
npm run dev -- -p 3001
```

### Database Issues

**Error: "relation does not exist"**
```bash
# Run migrations again
psql -d engagemint -f backend/src/config/full-db-init.sql
psql -d engagemint -f backend/db-migrations/add-view-tracking.sql
```

**Error: "function count_valid_views does not exist"**
```bash
# Run view tracking migration
psql -d engagemint -f backend/db-migrations/add-view-tracking.sql
```

### Solana/Anchor Issues

**Error: "Program ID mismatch"**
1. Run `anchor keys list`
2. Update `programs/engagemint-bonding-curve/src/lib.rs`
3. Update `Anchor.toml`
4. Rebuild: `anchor build`
5. Redeploy: `anchor deploy --provider.cluster devnet`

**Error: "Insufficient funds"**
```bash
solana airdrop 2 --url devnet
```

---

## 🔍 Health Checks

### Backend Health
```bash
curl http://localhost:5000/api/health
# Expected: {"status":"ok"}
```

### Database Health
```bash
psql -d engagemint -c "SELECT COUNT(*) FROM videos;"
# Expected: Numeric count
```

### Frontend Health
```bash
curl -s http://localhost:3000 | grep -q "EngageMint" && echo "OK" || echo "FAIL"
```

---

## 📊 Success Criteria

You're fully set up when:

- [x] Backend running on port 5000
- [x] Frontend running on port 3000
- [x] Database has 15+ tables
- [x] Can create account and login
- [x] Can upload videos
- [x] Views tracked after 1 second
- [x] Likes work (toggle on/off)
- [x] Platform wallet has SOL (if using token features)

---

## 🎯 Next Steps

### For Development
1. **Test all features** - Upload, view, like, comment
2. **Check logs** - Backend terminal for errors
3. **Monitor database** - Watch view_view_events table
4. **Test Solana wallet** - Connect Phantom/Solflare

### For Production
1. **Security audit** - Smart contracts
2. **Load testing** - 100+ concurrent users
3. **Deploy to mainnet** - Update RPC URLs
4. **Use dedicated RPC** - Helius/QuickNode ($49/month)
5. **Set up monitoring** - Sentry, logs, alerts

---

## 🆘 Need Help?

1. **Check logs:**
   - Backend: Terminal running `npm run dev`
   - Frontend: Browser console (F12)
   - Database: `psql -d engagemint`

2. **Review docs:**
   - [QUICK_START.md](./QUICK_START.md)
   - [ENGAGEMENT_AUDIT.md](./ENGAGEMENT_AUDIT.md)
   - [README.md](./README.md)

3. **Common issues:**
   - All documented in troubleshooting section above

---

## 📝 Environment Variables Reference

### Backend Required
- `DATABASE_URL` - PostgreSQL connection
- `JWT_SECRET` - Auth token signing (32+ chars)
- `SOLANA_NETWORK` - devnet/mainnet
- `SOLANA_RPC_URL` - RPC endpoint

### Frontend Required
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_SOLANA_NETWORK` - Match backend
- `NEXT_PUBLIC_SOLANA_RPC_URL` - Match backend

### Optional (Token Features)
- `BONDING_CURVE_PROGRAM_ID` - Deployed Anchor program
- `PLATFORM_WALLET_PRIVATE_KEY` - Platform wallet
- `INSTANT_MINT_COST_SOL` - Fee for instant mints
- `VIRAL_THRESHOLD` - Likes needed for auto-launch

---

## 🎉 You're Ready!

Your localhost environment is now fully configured and ready for development.

**Test the engagement system:**
1. Upload a video
2. Scroll to it in feed
3. Wait 1 second
4. Check view count increased
5. Like the video
6. Check like count increased

**All features work!** 🚀

---

**Built with ❤️ for the EngageMint Community**

*Transform your viral moments into valuable tokens.*
