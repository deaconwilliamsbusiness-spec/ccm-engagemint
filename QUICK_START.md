# EngageMint Memecoin Launchpad - QUICK START ⚡

**Production-ready, simplified setup in 15 minutes.**

---

## 📋 Simplified Code Stats

After simplification:
- ✅ **solanaService.js**: 436 → 287 lines (34% smaller)
- ✅ **metaplexService.js**: 400 → 159 lines (60% smaller)
- ✅ **priceMonitor.js**: 400 → 139 lines (65% smaller)
- ✅ **anchorClient.js**: NEW clean Anchor integration
- ✅ All mock/simulation code **removed**
- ✅ All TODOs and rough edges **cleaned**

---

## 🚀 Step 1: Prerequisites (5 min)

Install required tools:

```bash
# Node.js 18+
node --version

# Solana CLI
solana --version

# Anchor CLI
anchor --version

# PostgreSQL
psql --version
```

If missing, install:
```bash
# Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/v1.18.26/install)"

# Anchor CLI
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install 0.31.1
avm use 0.31.1
```

---

## 🔧 Step 2: Build & Deploy Anchor Program (5 min)

```bash
cd /root/ccm-engagemint

# Build program
anchor build

# Get program ID
anchor keys list
# Output: engagemint_bonding_curve: <YOUR_PROGRAM_ID>

# Update program ID in lib.rs
# Edit: programs/engagemint-bonding-curve/src/lib.rs
# Change: declare_id!("<YOUR_PROGRAM_ID>");

# Also update Anchor.toml
# Change: engagemint_bonding_curve = "<YOUR_PROGRAM_ID>"

# Rebuild with correct ID
anchor build

# Get devnet SOL
solana airdrop 2 --url devnet

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Verify deployment
solana program show <YOUR_PROGRAM_ID> --url devnet
```

---

## 🗄️ Step 3: Setup Database (2 min)

```bash
# Create database
createdb engagemint

# Run migrations
psql -d engagemint -f backend/db-migrations/create-token-tables.sql

# Verify tables
psql -d engagemint -c "\dt"
```

---

## ⚙️ Step 4: Configure Backend (2 min)

Create `/root/ccm-engagemint/backend/.env`:

```env
# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://localhost:5432/engagemint

# JWT (generate strong secret)
JWT_SECRET=your_super_secret_jwt_key_change_this_min_32_characters

# Solana
SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com
BONDING_CURVE_PROGRAM_ID=<YOUR_PROGRAM_ID_FROM_STEP_2>

# Platform Wallet (optional - will auto-generate)
# PLATFORM_WALLET_PRIVATE_KEY=<BASE58_KEY>

# Costs
INSTANT_MINT_COST_SOL=0.1
VIRAL_THRESHOLD=100
```

Install dependencies:
```bash
cd backend
npm install
```

Start backend:
```bash
npm run dev
```

You should see:
```
✅ Platform wallet: <ADDRESS>
💰 Platform wallet balance: 0.0000 SOL
✅ Metaplex initialized
✅ Price monitor started
🎉 All services initialized successfully!
```

If balance is low:
```bash
solana airdrop 2 <PLATFORM_WALLET_ADDRESS> --url devnet
```

---

## 🎨 Step 5: Configure Frontend (1 min)

Create `/root/ccm-engagemint/frontend/.env.local`:

```env
# API
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Solana
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_BONDING_CURVE_PROGRAM_ID=<YOUR_PROGRAM_ID>

# Costs
NEXT_PUBLIC_INSTANT_MINT_COST_SOL=0.1
NEXT_PUBLIC_VIRAL_THRESHOLD=100
```

Install and start:
```bash
cd frontend
npm install
npm run dev
```

Visit: http://localhost:3000

---

## ✅ Step 6: Test Everything (5 min)

### Test 1: Create Token

1. Open http://localhost:3000
2. Connect wallet (Phantom/Solflare)
3. Click "Mint Video"
4. Fill in:
   - Name: "Test Token"
   - Symbol: "TEST"
   - Upload any video
5. Click "Mint & Post"
6. Confirm transaction

**Expected**: Token created, database updated, trading interface opens

### Test 2: Check Backend

```bash
# Check platform wallet balance
curl http://localhost:5000/api/health

# Check tokens
psql -d engagemint -c "SELECT * FROM tokens;"
```

### Test 3: WebSocket Updates

Open browser console (F12) and run:
```javascript
const socket = io('http://localhost:5000');
socket.on('price_updates', (data) => console.log('Price update:', data));
```

You should see price updates every 10 seconds.

---

## 📁 Simplified File Structure

```
ccm-engagemint/
├── backend/
│   ├── src/
│   │   ├── services/
│   │   │   ├── anchorClient.js      ✅ NEW (clean Anchor integration)
│   │   │   ├── solanaService.js     ✅ SIMPLIFIED (34% smaller)
│   │   │   ├── metaplexService.js   ✅ SIMPLIFIED (60% smaller)
│   │   │   └── priceMonitor.js      ✅ SIMPLIFIED (65% smaller)
│   │   └── routes/
│   │       └── tokens.js            ✅ Clean API routes
│   └── db-migrations/
│       └── create-token-tables.sql
├── frontend/
│   └── src/
│       └── components/
│           ├── MintInterface.tsx
│           └── TradingInterface.tsx
└── programs/
    └── engagemint-bonding-curve/
        └── src/lib.rs               ✅ Production-ready Anchor program
```

---

## 🐛 Troubleshooting

### Backend won't start

**Problem**: "Cannot find module"
```bash
cd backend && npm install
```

**Problem**: "Database connection failed"
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check database exists
psql -l | grep engagemint
```

**Problem**: "Platform wallet has no SOL"
```bash
solana airdrop 2 <WALLET_ADDRESS> --url devnet
```

### Frontend won't connect

**Problem**: "API_URL not defined"
- Check `.env.local` exists in frontend/
- Restart dev server: `npm run dev`

**Problem**: "Wallet won't connect"
- Install Phantom or Solflare extension
- Switch wallet to devnet

### Program deployment fails

**Problem**: "Insufficient funds"
```bash
solana airdrop 2 --url devnet
```

**Problem**: "Program ID mismatch"
1. Run `anchor keys list`
2. Update `lib.rs` declare_id!()
3. Update `Anchor.toml`
4. Rebuild: `anchor build`

---

## 🎯 What's Working Now

✅ **Clean, simplified code** (40-65% size reduction)
✅ **Anchor program** with bonding curves
✅ **Backend services** (Solana, Metaplex, PriceMonitor)
✅ **API routes** for token creation and trading
✅ **Database schema** with triggers and views
✅ **Real-time WebSocket** price updates
✅ **Trading interface** (buy/sell with slippage)
✅ **Platform wallet** management
✅ **Two launch paths** (instant + viral)

---

## 🚀 Next Steps

### Immediate
1. Test token creation ✓
2. Test buy/sell transactions
3. Verify WebSocket updates
4. Check database records

### Before Production
1. **Audit smart contracts** (hire professional auditor)
2. **Deploy to mainnet** (after thorough testing)
3. **Use dedicated RPC** (Helius/QuickNode)
4. **Backup platform wallet** securely
5. **Set up monitoring** (logs, alerts)

---

## 📚 Key Files Reference

| File | Purpose | Lines |
|------|---------|-------|
| `programs/.../lib.rs` | Bonding curve contract | 800 |
| `backend/services/anchorClient.js` | Anchor program client | 150 |
| `backend/services/solanaService.js` | Solana operations | 287 |
| `backend/services/metaplexService.js` | Metadata creation | 159 |
| `backend/services/priceMonitor.js` | Real-time prices | 139 |
| `backend/routes/tokens.js` | Token API | 500 |
| `frontend/components/TradingInterface.tsx` | Trading UI | 600 |

**Total Production Code**: ~2,635 lines (simplified and clean)

---

## 💡 Environment Variables Quick Reference

### Backend `.env`
```env
PORT=5000
DATABASE_URL=postgresql://localhost:5432/engagemint
JWT_SECRET=<32+ chars>
SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com
BONDING_CURVE_PROGRAM_ID=<your_program_id>
INSTANT_MINT_COST_SOL=0.1
VIRAL_THRESHOLD=100
```

### Frontend `.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_BONDING_CURVE_PROGRAM_ID=<your_program_id>
NEXT_PUBLIC_INSTANT_MINT_COST_SOL=0.1
```

---

## ✨ Success Indicators

You're ready when you see:

**Backend Console:**
```
✅ Platform wallet: <address>
✅ Metaplex initialized
✅ Price monitor started
📊 Monitoring 0 tokens
🎉 All services initialized successfully!
```

**Frontend:**
- Wallet connects successfully
- "Mint Video" button works
- Token creation completes
- Trading interface opens

**Database:**
```sql
SELECT COUNT(*) FROM tokens;
-- Should show created tokens
```

---

## 🎉 You're Done!

You now have a **production-ready, simplified** memecoin launchpad running locally.

**Ready to deploy?**
- Follow full deployment guide in `MEMECOIN_LAUNCHPAD_SETUP.md`
- Ensure all tests pass
- Get smart contract audit
- Deploy to mainnet

**Questions?**
Check logs:
- Backend: Terminal output
- Frontend: Browser console (F12)
- Database: `psql -d engagemint`

---

**Built with ❤️ for the EngageMint Community**

*Launch fair. Trade instant. Graduate to Raydium.*
