# EngageMint Solana Integration

## 🎯 Overview

This branch (`ccm-engagemint-solana`) adds complete Solana blockchain integration to EngageMint with **two distinct upload paths**:

### PATH A: "MINT VIDEO!" 💎
- **Premium instant token creation**
- User pays 0.1 SOL upfront (~$20)
- Token created IMMEDIATELY on Solana
- Trading enabled from moment of upload
- For creators who want guaranteed token launch

### PATH B: "POST VIDEO" 🚀
- **Free upload with viral auto-launch**
- User uploads for FREE (no wallet needed)
- Video goes live normally
- When hits 10,000 likes → backend auto-creates token
- Backend wallet pays deployment (~0.036 SOL)
- For organic viral content creators

---

## 📦 What's Included

### Core Files Created

#### Frontend
- `frontend/src/context/WalletContextProvider.tsx` - Wallet adapter (Phantom, Solflare, Backpack)
- `frontend/src/lib/solana.ts` - Complete Solana integration library
  - Instant mint functions
  - Viral status checking
  - Trading (buy/sell)
  - Balance queries

#### Backend
- `backend/src/services/viralMonitor.js` - Viral auto-launch service
  - Monitors for 10K likes
  - Auto-creates tokens
  - Uses backend wallet
  - Full logging

#### Database
- `backend/src/scripts/add-solana-dual-path.sql` - Complete migration
  - Dual path support
  - Token tracking
  - Launch history
  - Performance indexes

#### Documentation
- `SOLANA_INTEGRATION_PLAN.md` - High-level strategy
- `DUAL_PATH_IMPLEMENTATION.md` - Detailed technical guide
- `SOLANA_IMPLEMENTATION_SUMMARY.md` - Complete implementation plan (this file)
- `SOLANA_README.md` - This file

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Solana CLI (for backend wallet generation)
- Phantom/Solflare wallet (for testing)

### 1. Install Dependencies

Already done! Dependencies installed:

**Frontend:**
- `@solana/web3.js` v1.95.8
- `@solana/wallet-adapter-react` v0.15.35
- `@solana/spl-token` v0.4.9
- And more...

**Backend:**
- `@solana/web3.js` v1.95.8
- `@solana/spl-token` v0.4.9
- `@coral-xyz/anchor` v0.30.1

### 2. Setup Database

```bash
cd /root/ccm-engagemint/backend
psql $DATABASE_URL -f src/scripts/add-solana-dual-path.sql
```

### 3. Generate Backend Wallet

```bash
# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Generate keypair
solana-keygen new --outfile /root/backend-wallet.json

# Airdrop devnet SOL
solana airdrop 2 $(solana-keygen pubkey /root/backend-wallet.json) --url devnet
```

### 4. Configure Environment

**Backend `.env`:**
```bash
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_BACKEND_WALLET_PRIVATE_KEY=<base58_from_wallet>
VIRAL_THRESHOLD=10000
AUTO_LAUNCH_ENABLED=true
```

**Frontend `.env.local`:**
```bash
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_INSTANT_MINT_COST_SOL=0.1
```

### 5. Update Code

See `SOLANA_IMPLEMENTATION_SUMMARY.md` for complete step-by-step integration instructions.

Key files to update:
- `backend/src/server.js` - Start viral monitor
- `backend/src/routes/videos.js` - Add viral status endpoint
- `frontend/src/app/layout.tsx` - Wrap with WalletContextProvider
- `frontend/src/components/MintInterface.tsx` - Add dual-path UI
- `frontend/src/components/SimplifiedTradingModal.tsx` - Add real trading

### 6. Test

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev

# Visit http://localhost:3000
```

---

## 💡 How It Works

### PATH A: Instant Mint Flow

```
User Flow:
1. Click "MINT VIDEO!" button
2. Connect wallet (Phantom/Solflare)
3. Upload video + token details
4. Pay 0.1 SOL
5. Token created INSTANTLY
6. Trading enabled immediately

Technical Flow:
1. Frontend calls instantMintToken()
2. Creates SPL token on Solana
3. Initializes bonding curve
4. Uploads video to backend with mint_address
5. Database stores: upload_path='instant', is_token_launched=true
6. Users can immediately trade
```

### PATH B: Viral Auto-Launch Flow

```
User Flow:
1. Click "POST VIDEO" button
2. Upload video (no wallet needed!)
3. Video goes live
4. Users like/comment/share
5. Hits 10,000 likes
6. Backend auto-creates token
7. Creator gets notification
8. Trading enabled

Technical Flow:
1. Video uploaded: upload_path='viral'
2. Viral monitor checks every minute
3. Detects likes_count >= 10000
4. Backend wallet creates token on Solana
5. Database updated: is_token_launched=true, launched_by='backend'
6. Frontend shows "🔥 VIRAL" badge
7. Trading now available
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│         FRONTEND (Next.js)              │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  WalletContextProvider             │ │
│  │  - Phantom, Solflare, Backpack     │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  MintInterface                     │ │
│  │  - PATH A: Instant Mint            │ │
│  │  - PATH B: Free Post               │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  solana.ts Library                 │ │
│  │  - instantMintToken()              │ │
│  │  - buyTokens() / sellTokens()      │ │
│  │  - checkViralStatus()              │ │
│  └────────────────────────────────────┘ │
└──────────────┬──────────────────────────┘
               │
               │ REST API
               │
┌──────────────▼──────────────────────────┐
│         BACKEND (Express)               │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  viralMonitor.js                   │ │
│  │  - Checks every 60 seconds         │ │
│  │  - Detects 10K+ likes              │ │
│  │  - Auto-creates tokens             │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  API Endpoints                     │ │
│  │  - GET /viral-status               │ │
│  │  - POST /upload (dual path)        │ │
│  └────────────────────────────────────┘ │
└──────────────┬──────────────────────────┘
               │
               │ PostgreSQL
               │
┌──────────────▼──────────────────────────┐
│         DATABASE                        │
│                                          │
│  videos:                                 │
│  - upload_path ('instant' | 'viral')     │
│  - token_mint_address                    │
│  - is_token_launched                     │
│  - launched_by ('user' | 'backend')      │
│                                          │
│  backend_token_launches:                 │
│  - Tracks auto-launches                  │
│  - SOL spent, likes at launch           │
└──────────────────────────────────────────┘
```

---

## 🧪 Testing

### Test PATH A (Instant Mint)

1. Connect Phantom wallet to Devnet
2. Get devnet SOL: https://solfaucet.com
3. Click "MINT VIDEO!"
4. Upload video + fill token details
5. Approve 0.1 SOL transaction
6. Verify token on Solana Explorer
7. Test trading (buy/sell)

### Test PATH B (Viral Auto-Launch)

1. Click "POST VIDEO"
2. Upload video (no wallet)
3. Manually set likes to 10K:
```sql
UPDATE videos SET likes_count = 10000 WHERE id = '<video_id>';
```
4. Wait 1 minute for viral monitor
5. Check backend logs for "🚀 AUTO-LAUNCHING TOKEN"
6. Verify token created
7. Test trading

---

## 📊 Database Schema

### New Columns in `videos` table:
- `upload_path` - 'instant' | 'viral'
- `token_mint_address` - Solana mint address
- `bonding_curve_address` - Bonding curve pool address
- `viral_launch_threshold` - Likes needed (default 10K)
- `is_token_launched` - Boolean
- `launch_signature` - Solana transaction signature
- `launched_by` - 'user' | 'backend'
- `launch_timestamp` - When token launched
- `sol_paid_by_user` - Amount paid for instant mint

### New Table: `backend_token_launches`
- `id` - UUID
- `video_id` - FK to videos
- `mint_address` - Token mint
- `bonding_curve_address` - Curve address
- `launch_signature` - Transaction signature
- `sol_spent` - Cost in SOL
- `likes_at_launch` - Likes when launched
- `viral_score_at_launch` - Viral score
- `created_at` - Timestamp

---

## 💰 Economics

### PATH A: Instant Mint
- User pays: **0.1 SOL** (~$20)
- Actual cost: ~0.036 SOL (~$7)
- Platform profit: **0.064 SOL** (~$13) per mint
- Scaling: **Unlimited** (users pay all costs)

### PATH B: Viral Auto-Launch
- User pays: **FREE**
- Platform pays: ~0.036 SOL (~$7) per viral video
- Monthly estimate: 100 viral = 3.6 SOL (~$720)
- Revenue: 1-2% trading fees
- Break-even: ~$36K trading volume per token

---

## 🔒 Security

### Wallet Security
- User wallets: Only sign transactions, never share private keys
- Backend wallet: Stored as encrypted environment variable
- Production: Use hardware wallet for backend

### Transaction Safety
- Slippage protection on trades
- Maximum SOL limits
- Rate limiting on auto-launches
- Transaction simulation before signing

### Database Security
- Prepared statements (SQL injection prevention)
- Indexed columns for performance
- Cascade deletes for data integrity

---

## 🚀 Deployment

### Devnet (Testing)
1. Use devnet RPC: `https://api.devnet.solana.com`
2. Fund backend wallet with devnet SOL
3. Test thoroughly

### Mainnet (Production)
1. Upgrade RPC to Helius/QuickNode (reliability)
2. Fund backend wallet with real SOL (10+ recommended)
3. Set `AUTO_LAUNCH_ENABLED=true`
4. Monitor SOL balance (alerts at 1 SOL)
5. Monitor auto-launch logs (Sentry/Datadog)

---

## 📚 Documentation

- **`SOLANA_INTEGRATION_PLAN.md`** - High-level overview and strategy
- **`DUAL_PATH_IMPLEMENTATION.md`** - Complete technical implementation details
- **`SOLANA_IMPLEMENTATION_SUMMARY.md`** - Step-by-step integration guide
- **`SOLANA_README.md`** - This file (quick reference)

---

## 🆘 Troubleshooting

### Wallet won't connect
- Ensure wallet is on Devnet
- Check RPC URL is correct
- Try different wallet adapter

### Transaction fails
- Check user has enough SOL
- Verify RPC not rate-limited
- Check Solana Explorer for details

### Viral monitor not working
- Verify `AUTO_LAUNCH_ENABLED=true`
- Check backend wallet funded
- Review backend logs
- Verify database updated

### Token not trading
- Check `is_token_launched=true`
- Verify `token_mint_address` set
- Check bonding curve initialized

---

## 🎯 Next Steps

1. **Apply database migration** - Run `add-solana-dual-path.sql`
2. **Generate backend wallet** - Create and fund keypair
3. **Update environment variables** - Configure .env files
4. **Integrate frontend components** - Follow SOLANA_IMPLEMENTATION_SUMMARY.md
5. **Integrate backend services** - Start viral monitor
6. **Test on devnet** - PATH A and PATH B
7. **Deploy to production** - After thorough testing

---

## 📞 Support

For questions or issues:
1. Review documentation files
2. Check backend logs
3. Test on Solana Devnet first
4. Use Solana Explorer for transaction debugging

---

## ✅ Checklist

Before deploying to production:

- [ ] Database migration applied
- [ ] Backend wallet generated and funded
- [ ] Environment variables configured
- [ ] Viral monitor running
- [ ] PATH A tested (instant mint)
- [ ] PATH B tested (viral auto-launch)
- [ ] Trading tested (buy/sell)
- [ ] Error scenarios tested
- [ ] RPC upgraded (Helius/QuickNode)
- [ ] Monitoring setup (logs, alerts)
- [ ] Security review completed

---

**Branch:** `ccm-engagemint-solana`
**Status:** ✅ Ready for Integration
**Last Updated:** 2025-10-31

Start with `SOLANA_IMPLEMENTATION_SUMMARY.md` for complete step-by-step integration instructions!
