# 🎉 EngageMint - Memecoin Launchpad

**Transform viral videos into valuable tokens. Built on Solana.**

A TikTok-style social platform where creators can launch memecoins backed by their viral content. Fair launches, bonding curves, and automatic graduation to Raydium.

---

## ✨ What Makes EngageMint Unique

- 🎥 **Video-Backed Tokens** - Every token is tied to viral content
- 🚀 **Dual Launch Paths** - Instant mint (0.1 SOL) OR free viral launch (100+ likes)
- 📈 **Bonding Curve Trading** - Pump.fun-style constant product AMM
- 🎓 **Auto-Graduation** - Migrate to Raydium DEX at 85 SOL threshold
- 🔒 **Token-Gated Communities** - Hold tokens to access exclusive content
- ⚡ **Real-Time Updates** - WebSocket price feeds and live trading

---

## 🚀 Quick Start

**Setup in 15 minutes** - See [QUICK_START.md](./QUICK_START.md)

```bash
# 1. Deploy Anchor program
cd /root/ccm-engagemint
anchor build && anchor deploy --provider.cluster devnet

# 2. Setup database
createdb engagemint
psql -d engagemint -f backend/db-migrations/create-token-tables.sql

# 3. Configure environment
cd backend && cp .env.example .env  # Add your program ID
cd ../frontend && cp .env.example .env.local  # Add your program ID

# 4. Start services
cd backend && npm install && npm run dev &
cd frontend && npm install && npm run dev

# 5. Open http://localhost:3000
```

**For detailed step-by-step guide:** [QUICK_START.md](./QUICK_START.md)

---

## 📁 Project Structure

```
ccm-engagemint/
├── programs/
│   └── engagemint-bonding-curve/    # Anchor smart contract (Solana)
│       └── src/lib.rs               # Bonding curve program (800 lines)
├── backend/
│   ├── src/
│   │   ├── services/
│   │   │   ├── anchorClient.js      # Anchor program client
│   │   │   ├── solanaService.js     # Token creation & trading
│   │   │   ├── metaplexService.js   # Metadata & Arweave uploads
│   │   │   └── priceMonitor.js      # Real-time price monitoring
│   │   ├── routes/tokens.js         # Token API endpoints
│   │   └── server.js                # Express + Socket.io server
│   └── db-migrations/               # PostgreSQL schema
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── ReelsInterface.tsx   # TikTok-style video feed
│       │   ├── MintInterface.tsx    # Token creation UI
│       │   ├── TradingInterface.tsx # Buy/sell trading UI
│       │   └── CommunityHub.tsx     # Token communities
│       └── context/
│           └── WalletContextProvider.tsx  # Solana wallet adapter
├── QUICK_START.md                   # 15-minute setup guide
├── ARCHITECTURE.md                  # System architecture
└── DEPLOYMENT.md                    # Production deployment
```

---

## 🛠️ Tech Stack

**Blockchain:**
- Solana (devnet/mainnet)
- Anchor Framework v0.31.1
- Metaplex Metadata Standard
- Arweave for metadata storage

**Backend:**
- Node.js + Express
- PostgreSQL (with triggers & views)
- Socket.io (real-time updates)
- @solana/web3.js
- @metaplex-foundation/js

**Frontend:**
- Next.js 15 (App Router)
- React 19 + TypeScript
- Tailwind CSS v4
- Solana Wallet Adapter
- Recharts (price charts)

---

## 📊 How It Works

### 1. Two Launch Paths

**PATH A: Instant Mint**
- Creator pays 0.1 SOL
- Token launches immediately
- Bonding curve initialized
- Trading starts instantly

**PATH B: Viral Auto-Launch**
- Post video for free
- Reach 100+ likes
- Platform auto-mints token
- Creator gets 100% of tokens

### 2. Bonding Curve Mechanics

Based on Pump.fun's proven model:

```
Virtual Reserves:  1.073B tokens × 30 SOL
Real Reserves:     793.1M sellable tokens
Graduation:        85 SOL raised
Formula:           x × y = k (constant product)
```

**Price Discovery:**
- Prices increase as more SOL enters
- Slippage protection built-in
- 1% platform fee on trades
- Real-time price updates (10s intervals)

### 3. Raydium Migration

When bonding curve reaches 85 SOL:
- Automatically creates Raydium liquidity pool
- Locks liquidity permanently
- Token graduates to full DEX trading
- Bonding curve closes

---

## 🎯 Key Features

### For Creators
- ✅ Launch tokens from viral videos
- ✅ Earn from every trade (via bonding curve)
- ✅ Build token-gated communities
- ✅ Track P&L and engagement analytics
- ✅ Two launch paths (instant or viral)

### For Traders
- ✅ Fair launch (no presale, no rug pulls)
- ✅ Instant buy/sell with slippage protection
- ✅ Real-time price charts
- ✅ Low fees (1% platform fee)
- ✅ Auto-graduation to Raydium

### For Platform
- ✅ 1% fee on all trades
- ✅ Optional instant mint fees
- ✅ Scalable architecture
- ✅ Real-time monitoring
- ✅ Clean, maintainable code

---

## 🔧 Environment Variables

### Backend (.env)
```env
PORT=5000
DATABASE_URL=postgresql://localhost:5432/engagemint
JWT_SECRET=your_32_char_secret
SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com
BONDING_CURVE_PROGRAM_ID=<your_program_id>
INSTANT_MINT_COST_SOL=0.1
VIRAL_THRESHOLD=100
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_BONDING_CURVE_PROGRAM_ID=<your_program_id>
NEXT_PUBLIC_INSTANT_MINT_COST_SOL=0.1
```

---

## 📚 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Get running in 15 minutes
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System design & technical details
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment guide

---

## 🚨 Production Checklist

Before deploying to mainnet:

- [ ] **Security audit** of smart contracts (hire professional)
- [ ] **Load testing** (100+ concurrent users)
- [ ] **Dedicated RPC** (Helius/QuickNode - ~$49/month)
- [ ] **Backup platform wallet** securely
- [ ] **Set up monitoring** (Sentry, logs, alerts)
- [ ] **Legal review** (compliance, terms of service)
- [ ] **Update RPC URLs** to mainnet
- [ ] **Fund platform wallet** with production SOL

---

## 💰 Economics

**Platform Revenue:**
- 1% fee on all bonding curve trades
- Optional instant mint fees (0.1 SOL per mint)

**Creator Revenue:**
- Receive tokens at launch
- Benefit from price appreciation
- Earn from community engagement

**User Benefits:**
- Fair launch prices
- No presales or VC allocations
- Automated liquidity provision
- Transparent on-chain trading

---

## 🔗 Links

- **Live Demo:** https://engagemint.meme
- **Documentation:** See /docs folder
- **Support:** GitHub Issues

---

## 🏗️ Development Commands

```bash
# Anchor (Smart Contracts)
anchor build              # Compile programs
anchor test               # Run tests
anchor deploy             # Deploy to configured cluster

# Backend
cd backend
npm install               # Install dependencies
npm run dev               # Start dev server (nodemon)
npm start                 # Start production server

# Frontend
cd frontend
npm install               # Install dependencies
npm run dev               # Start dev server (Turbopack)
npm run build             # Production build
npm run lint              # Run ESLint

# Database
createdb engagemint       # Create database
psql -d engagemint -f backend/db-migrations/create-token-tables.sql
```

---

## 🤝 Contributing

This is a production project. Please test thoroughly before submitting PRs.

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Test on devnet thoroughly
4. Commit changes (`git commit -m 'Add amazing feature'`)
5. Push to branch (`git push origin feature/amazing`)
6. Open Pull Request

---

## 📄 License

Proprietary - All rights reserved

---

## 🙏 Acknowledgments

- **Pump.fun** - Inspiration for bonding curve mechanics
- **Solana** - High-performance blockchain
- **Anchor** - Smart contract framework
- **Metaplex** - NFT/Token metadata standard

---

**Built with ❤️ for the memecoin revolution**

*Transform your viral moments into valuable tokens. Launch fair. Trade instant. Graduate to Raydium.*

🚀 **Ready to launch? See [QUICK_START.md](./QUICK_START.md)**
