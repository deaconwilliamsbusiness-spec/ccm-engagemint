# EngageMint Solana Integration - Two Upload Paths

## 🎯 Product Flow Overview

### PATH A: "MINT VIDEO!" (Premium - Instant Token)
- **User Experience:** Pay SOL upfront → Token created instantly → Trading enabled immediately
- **Cost:** ~0.1-0.5 SOL (rent + deployment)
- **Target:** Creators who want guaranteed token launch
- **Requirements:** Wallet connection required

### PATH B: "POST VIDEO" (Free - Viral Auto-Launch)
- **User Experience:** Upload free → Video goes live → Hits 10,000 likes → Backend auto-creates token
- **Cost:** FREE (backend wallet pays deployment)
- **Target:** Organic viral content creators
- **Requirements:** No wallet needed initially

---

## 📋 Implementation Checklist

### Phase 1: Project Setup (Current)
- [x] Create feature branch `ccm-engagemint-solana`
- [ ] Install frontend Solana dependencies
- [ ] Install backend Solana dependencies
- [ ] Create Solana programs workspace

### Phase 2: Smart Contracts
- [ ] Create instant mint program (Path A)
- [ ] Create bonding curve AMM
- [ ] Add viral auto-launch logic (Path B)
- [ ] Deploy to devnet
- [ ] Test all scenarios

### Phase 3: Frontend Integration
- [ ] Add wallet adapter for Path A
- [ ] Update MintInterface with dual paths
- [ ] Create premium mint flow (wallet → payment → instant token)
- [ ] Update trading modal with real Solana integration
- [ ] Add token balance display

### Phase 4: Backend Auto-Launch (Path B)
- [ ] Create backend wallet keypair
- [ ] Add viral threshold monitoring (10K likes)
- [ ] Implement auto-token-creation service
- [ ] Add Solana RPC integration
- [ ] Create token launch queue system

### Phase 5: Database Updates
- [ ] Add token_mint_address column
- [ ] Add upload_path column ('instant' | 'viral')
- [ ] Add viral_launch_threshold column
- [ ] Add backend_wallet_signature column
- [ ] Add is_auto_launched column

### Phase 6: Testing
- [ ] Test Path A: Instant mint with Phantom wallet
- [ ] Test Path B: Free upload → viral threshold → auto-launch
- [ ] Test bonding curve trading
- [ ] Test error scenarios
- [ ] Load testing

### Phase 7: Deployment
- [ ] Deploy smart contracts to mainnet
- [ ] Update environment variables
- [ ] Deploy frontend to Vercel
- [ ] Deploy backend to Railway
- [ ] Monitor first 100 token launches

---

## 🔧 Technical Architecture

### PATH A Flow (Instant Mint)
```
User clicks "MINT VIDEO!"
  → Wallet connects (Phantom/Solflare)
  → User uploads video + token details
  → User approves SOL payment (~0.3 SOL)
  → Frontend calls initializeCreatorToken()
  → Smart contract creates token + bonding curve
  → Video uploads to backend with mint_address
  → Trading enabled IMMEDIATELY
```

### PATH B Flow (Viral Auto-Launch)
```
User clicks "POST VIDEO" (Free)
  → Upload video (no wallet needed)
  → Video goes live on feed
  → Users engage (likes, comments, views)
  → Backend monitors: likes_count >= 10,000
  → Backend wallet auto-creates token on Solana
  → Backend calls createTokenForVideo(videoId)
  → Bonding curve launches
  → Users can now trade the token
  → Creator gets notification
```

---

## 💰 Cost Breakdown

### PATH A (User Pays)
- Token account creation: ~0.002 SOL
- Metadata account: ~0.01 SOL
- Bonding curve pool: ~0.02 SOL
- Associated token accounts: ~0.004 SOL
- Transaction fees: ~0.00001 SOL
- **Total: ~0.036 SOL (~$7 at $200/SOL)**
- **Suggested charge: 0.1 SOL** (includes buffer)

### PATH B (Backend Pays)
- Same costs as above
- Backend subsidizes viral content
- Costs recovered through trading fees
- Estimated: 0.036 SOL per viral token
- If 100 videos go viral/month: ~3.6 SOL/month ($720)

---

## 📊 Database Schema Changes

```sql
-- Add new columns to videos table
ALTER TABLE videos
ADD COLUMN upload_path VARCHAR(20) DEFAULT 'viral', -- 'instant' or 'viral'
ADD COLUMN token_mint_address VARCHAR(44),
ADD COLUMN bonding_curve_address VARCHAR(44),
ADD COLUMN viral_launch_threshold INTEGER DEFAULT 10000,
ADD COLUMN is_token_launched BOOLEAN DEFAULT false,
ADD COLUMN launch_signature VARCHAR(88),
ADD COLUMN launched_by VARCHAR(20), -- 'user' or 'backend'
ADD COLUMN launch_timestamp TIMESTAMP,
ADD COLUMN sol_paid_by_user DECIMAL(10, 9);

-- Add backend wallet tracking
CREATE TABLE IF NOT EXISTS backend_token_launches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  mint_address VARCHAR(44) UNIQUE NOT NULL,
  launch_signature VARCHAR(88) NOT NULL,
  sol_spent DECIMAL(10, 9) NOT NULL,
  likes_at_launch INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for viral monitoring
CREATE INDEX idx_videos_viral_check ON videos(is_token_launched, upload_path, likes_count);
```

---

## 🚀 Next Steps

1. Install dependencies
2. Create smart contracts
3. Build wallet integration
4. Update UI for dual paths
5. Implement backend auto-launcher
6. Test extensively on devnet
7. Deploy to mainnet

---

## 📝 Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_TOKEN_PROGRAM_ID=<deployed_address>
NEXT_PUBLIC_BONDING_CURVE_PROGRAM_ID=<deployed_address>
NEXT_PUBLIC_INSTANT_MINT_COST_SOL=0.1
```

### Backend (.env)
```
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_BACKEND_WALLET_PRIVATE_KEY=<base58_encoded_keypair>
TOKEN_PROGRAM_ID=<deployed_address>
BONDING_CURVE_PROGRAM_ID=<deployed_address>
VIRAL_THRESHOLD=10000
AUTO_LAUNCH_ENABLED=true
```

---

**Branch:** ccm-engagemint-solana
**Status:** In Progress
**Last Updated:** 2025-10-31
