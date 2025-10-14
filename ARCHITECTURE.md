# ENGAGEMINT.MEME - Complete System Architecture

## 🎯 VISION

**"The TikTok of Tokenized Content"**

Engagemint.meme is a decentralized social media platform where every piece of content is a tradeable token on Solana. Creators instantly monetize through bonding curve economics. Investors buy creator tokens to access exclusive communities and support creators they believe in.

### Core Value Propositions
1. **For Creators**: Instant monetization - earn from every trade of your token
2. **For Investors**: Invest in creators early, profit as they grow
3. **For Community**: Token-gated access creates engaged, aligned communities
4. **For Retail**: Fun, meme-driven investing with real social value

---

## 🏗️ SYSTEM ARCHITECTURE

### High-Level Flow
```
User → Connect Wallet → Create Content → Mint Token on Solana
                                              ↓
                                    Bonding Curve Created
                                              ↓
                            Token Tradeable (Buy/Sell with SOL)
                                              ↓
                              Holder unlocks Community Access
                                              ↓
                            Creator earns from trading fees
```

---

## 💰 TOKENOMICS MODEL

### Token Creation (Minting)
When a creator posts content:
1. SPL Token is minted on Solana
2. Token supply: 1,000,000,000 tokens (1B)
3. Creator receives: 10% (100M tokens) immediately
4. Bonding curve holds: 90% (900M tokens) for trading
5. Token metadata includes: video URL, creator info, description

### Bonding Curve Pricing
**Algorithm**: Exponential bonding curve (price increases as supply decreases)

```
Price = BASE_PRICE * (1 + SUPPLY_SOLD / TOTAL_SUPPLY)^2
```

**Parameters**:
- `BASE_PRICE`: 0.0001 SOL per token
- `TOTAL_SUPPLY`: 900M tokens (available for trading)
- `CURVE_FACTOR`: 2 (exponential growth)

**Example Pricing**:
- First 1M tokens: ~0.0001 SOL each
- At 10M sold: ~0.00012 SOL each
- At 100M sold: ~0.0015 SOL each
- At 450M sold (50%): ~0.0004 SOL each

### Fee Structure
**On Every Trade (Buy or Sell)**:
- Creator Fee: 2% (goes directly to creator's wallet)
- Platform Fee: 1% (protocol treasury)
- Liquidity: 97% (executes trade via bonding curve)

**Revenue Split Example**:
- User buys $100 worth of tokens:
  - $2 → Creator wallet
  - $1 → Platform treasury
  - $97 → Bonding curve execution

---

## 🔗 SOLANA BLOCKCHAIN INTEGRATION

### Smart Contract Architecture

**1. Token Factory Program** (Rust/Anchor)
```rust
pub fn create_token_content(
    ctx: Context<CreateTokenContent>,
    metadata: TokenMetadata,
    bonding_curve_params: BondingCurveParams
) -> Result<()> {
    // 1. Mint SPL Token
    // 2. Initialize bonding curve account
    // 3. Transfer creator allocation
    // 4. Store metadata
    // 5. Emit creation event
}
```

**2. Bonding Curve Program** (Rust/Anchor)
```rust
pub fn buy_tokens(
    ctx: Context<BuyTokens>,
    sol_amount: u64
) -> Result<()> {
    // 1. Calculate tokens based on curve
    // 2. Deduct fees (creator + platform)
    // 3. Transfer SOL to curve vault
    // 4. Transfer tokens to buyer
    // 5. Update curve state
}

pub fn sell_tokens(
    ctx: Context<SellTokens>,
    token_amount: u64
) -> Result<()> {
    // 1. Calculate SOL to return based on curve
    // 2. Deduct fees
    // 3. Burn or hold tokens
    // 4. Transfer SOL to seller
    // 5. Update curve state
}
```

### On-Chain Accounts

**TokenContent Account**:
```rust
pub struct TokenContent {
    pub creator: Pubkey,           // Creator wallet
    pub mint: Pubkey,              // SPL token mint
    pub bonding_curve: Pubkey,     // Bonding curve account
    pub metadata_uri: String,      // IPFS/Arweave URI
    pub created_at: i64,
    pub total_volume: u64,         // Total trading volume
    pub holder_count: u32,
}
```

**BondingCurve Account**:
```rust
pub struct BondingCurve {
    pub token_content: Pubkey,
    pub vault: Pubkey,             // SOL vault
    pub supply_sold: u64,          // Tokens sold so far
    pub base_price: u64,
    pub curve_factor: u8,
    pub creator_fee_bps: u16,      // Basis points (200 = 2%)
    pub platform_fee_bps: u16,     // Basis points (100 = 1%)
}
```

### Metadata Storage

**Option 1: IPFS (Preferred)**
- Upload video to IPFS
- Create metadata JSON:
```json
{
  "name": "Token Name",
  "symbol": "TICKER",
  "description": "Video description",
  "image": "ipfs://...",
  "animation_url": "ipfs://...",  // Video URL
  "attributes": [
    {"trait_type": "Creator", "value": "@username"},
    {"trait_type": "Created", "value": "2025-10-13"}
  ]
}
```
- Store metadata URI in TokenContent account

**Option 2: Arweave**
- Permanent storage for important content
- Higher cost but immutable

---

## 🌐 FRONTEND ARCHITECTURE

### Required Solana Dependencies
```json
{
  "@solana/web3.js": "^1.95.0",
  "@solana/spl-token": "^0.4.0",
  "@solana/wallet-adapter-react": "^0.15.0",
  "@solana/wallet-adapter-wallets": "^0.19.0",
  "@project-serum/anchor": "^0.30.0",
  "bs58": "^5.0.0"
}
```

### Wallet Integration

**Supported Wallets**:
- Phantom
- Solflare
- Backpack
- Glow

**Implementation**:
```typescript
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'

// Wrap app with providers
<ConnectionProvider endpoint={RPC_ENDPOINT}>
  <WalletProvider wallets={wallets} autoConnect>
    <App />
  </WalletProvider>
</ConnectionProvider>
```

### Key Frontend Components

**1. Wallet Connect Button**
```typescript
// Components/WalletButton.tsx
import { useWallet } from '@solana/wallet-adapter-react'

export function WalletButton() {
  const { publicKey, connect, disconnect } = useWallet()

  return publicKey ? (
    <button onClick={disconnect}>
      {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
    </button>
  ) : (
    <button onClick={connect}>Connect Wallet</button>
  )
}
```

**2. Token Mint Interface** (Modified MintInterface.tsx)
```typescript
const handleMint = async () => {
  // 1. Upload video to IPFS
  const videoIpfsHash = await uploadToIPFS(videoFile)

  // 2. Create metadata JSON
  const metadata = { name, symbol, description, animation_url: videoIpfsHash }
  const metadataIpfsHash = await uploadToIPFS(JSON.stringify(metadata))

  // 3. Call smart contract to mint token
  const tx = await program.methods
    .createTokenContent(metadata, bondingCurveParams)
    .accounts({ creator: wallet.publicKey })
    .rpc()

  // 4. Save to database (video ID → token address)
  await api.saveTokenMapping(videoId, tokenMint)
}
```

**3. Trading Interface** (Modified TradingModal.tsx)
```typescript
const handleBuy = async (solAmount: number) => {
  // 1. Get bonding curve state
  const curve = await program.account.bondingCurve.fetch(curveAddress)

  // 2. Calculate expected tokens
  const tokensOut = calculateTokensOut(curve, solAmount)

  // 3. Execute buy transaction
  const tx = await program.methods
    .buyTokens(solAmountLamports)
    .accounts({
      buyer: wallet.publicKey,
      bondingCurve: curveAddress,
      tokenMint: tokenMint
    })
    .rpc()

  // 4. Update UI
  await refreshBalance()
}
```

---

## 🔐 TOKEN-GATED COMMUNITIES

### Access Control

**Check User Balance On-Chain**:
```typescript
const checkCommunityAccess = async (
  userWallet: PublicKey,
  tokenMint: PublicKey,
  minimumTokens: number
): Promise<boolean> => {
  // Get user's token account
  const tokenAccount = await getAssociatedTokenAddress(tokenMint, userWallet)

  // Fetch balance
  const accountInfo = await connection.getTokenAccountBalance(tokenAccount)
  const balance = accountInfo.value.uiAmount || 0

  // Check if meets minimum
  return balance >= minimumTokens
}
```

### Community Features

**1. Token-Gated Posts**
- Only visible to users holding minimum tokens
- Verified on-chain before showing content

**2. Exclusive Discussions**
- Reddit/Discord style threads
- Create thread: requires token balance check
- View thread: requires token balance check

**3. Governance**
- Token holders vote on community decisions
- Voting power = token balance
- On-chain voting using Solana program

**4. Creator Benefits**
- Direct messaging with holders
- Early access announcements
- Community polls and feedback

---

## 💵 CREATOR MONETIZATION

### Revenue Streams

**1. Trading Fees (Passive Income)**
- 2% of every buy/sell transaction
- Accumulates automatically in creator wallet
- No action required from creator

**Example**:
- Token has $10,000 daily volume
- Creator earns: $10,000 × 2% = $200/day
- Monthly: $6,000 (if volume sustains)

**2. Initial Token Allocation**
- Creator gets 10% of total supply (100M tokens)
- Can sell gradually on bonding curve
- Or hold for long-term appreciation

**3. Tips & Donations**
- Direct SOL tips from fans
- Integrated "tip" button on videos
- 100% goes to creator

**4. Premium Content**
- Token-gated exclusive content
- Higher minimum token requirement
- Additional revenue from token demand

### Creator Dashboard
- Real-time earnings tracker
- Token holder analytics
- Community engagement metrics
- Withdraw SOL anytime

---

## 🎨 USER EXPERIENCE FLOW

### New Creator Flow
1. **Onboard**: Connect wallet → Create profile
2. **Create**: Upload video → Add title/description
3. **Mint**: Click "Mint Token" → Sign transaction → Token created
4. **Share**: Video appears in feed with ticker symbol
5. **Earn**: Trading volume generates fees → SOL accumulates in wallet

### Investor/Fan Flow
1. **Discover**: Browse feed → Find interesting content
2. **Buy**: Click "Buy" → Enter SOL amount → Sign transaction
3. **Hold**: Tokens appear in wallet
4. **Access**: Unlock creator's community
5. **Trade**: Sell anytime on bonding curve

### Social Interactions
- Like/comment on videos (free)
- Buy tokens to support creator
- Join token-gated community
- Vote on community decisions
- Tip creator directly

---

## 📊 BACKEND ARCHITECTURE

### Database Schema (PostgreSQL)

**users table**:
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  wallet_address VARCHAR(44) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255),
  profile_image_url TEXT,
  bio TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**videos table**:
```sql
CREATE TABLE videos (
  id UUID PRIMARY KEY,
  creator_id UUID REFERENCES users(id),
  token_mint VARCHAR(44) UNIQUE NOT NULL,  -- Solana token address
  bonding_curve VARCHAR(44) NOT NULL,      -- Bonding curve address
  title VARCHAR(255) NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  ipfs_metadata_uri TEXT,
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**token_holders table**:
```sql
CREATE TABLE token_holders (
  id UUID PRIMARY KEY,
  video_id UUID REFERENCES videos(id),
  wallet_address VARCHAR(44) NOT NULL,
  token_balance NUMERIC(20, 6),
  last_updated TIMESTAMP DEFAULT NOW(),
  UNIQUE(video_id, wallet_address)
);
```

**communities table**:
```sql
CREATE TABLE communities (
  id UUID PRIMARY KEY,
  video_id UUID REFERENCES videos(id) UNIQUE,
  minimum_tokens NUMERIC(20, 6) NOT NULL,
  member_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**community_posts table**:
```sql
CREATE TABLE community_posts (
  id UUID PRIMARY KEY,
  community_id UUID REFERENCES communities(id),
  author_wallet VARCHAR(44) NOT NULL,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints

**Content Management**:
- `POST /api/videos/mint` - Mint new token + upload video
- `GET /api/videos/feed` - Get video feed
- `GET /api/videos/:id` - Get single video details
- `GET /api/videos/token/:mintAddress` - Get video by token address

**Trading**:
- `GET /api/tokens/:mint/price` - Get current token price
- `GET /api/tokens/:mint/chart` - Get price history
- `POST /api/tokens/:mint/buy` - Initiate buy (returns tx for signing)
- `POST /api/tokens/:mint/sell` - Initiate sell (returns tx for signing)

**Community**:
- `GET /api/communities/:videoId` - Get community info
- `POST /api/communities/:videoId/posts` - Create post (verify token balance)
- `GET /api/communities/:videoId/posts` - Get posts (verify access)
- `POST /api/communities/:videoId/join` - Join community (verify balance)

**User**:
- `GET /api/users/:wallet` - Get user profile
- `GET /api/users/:wallet/tokens` - Get user's token holdings
- `GET /api/users/:wallet/communities` - Get joined communities

### Background Jobs (Cron)

**1. Token Balance Sync** (Every 5 minutes)
- Fetch on-chain balances for all token holders
- Update `token_holders` table
- Update community member counts

**2. Price Updates** (Real-time via WebSocket)
- Listen to bonding curve events
- Update price cache
- Broadcast to connected clients

**3. View Count Aggregation** (Every hour)
- Aggregate view counts
- Update video analytics

---

## 🚀 IMPLEMENTATION ROADMAP

### Phase 1: Foundation (Week 1-2)
**Goal**: Get basic blockchain integration working

- [ ] Install Solana dependencies
- [ ] Set up wallet connection
- [ ] Create token mint program (basic)
- [ ] Deploy to devnet
- [ ] Test token minting from frontend
- [ ] Store token address in database

### Phase 2: Trading (Week 3-4)
**Goal**: Implement bonding curve trading

- [ ] Build bonding curve smart contract
- [ ] Deploy curve contract
- [ ] Implement buy/sell functions
- [ ] Add price calculation
- [ ] Integrate with TradingModal
- [ ] Test buy/sell flow end-to-end

### Phase 3: Communities (Week 5-6)
**Goal**: Token-gated access working

- [ ] On-chain balance verification
- [ ] Community post creation
- [ ] Access control middleware
- [ ] Community UI updates
- [ ] Test gating mechanism

### Phase 4: Creator Monetization (Week 7-8)
**Goal**: Fee distribution working

- [ ] Implement fee collection in smart contract
- [ ] Creator dashboard
- [ ] Earnings tracker
- [ ] Withdrawal system
- [ ] Analytics

### Phase 5: IPFS & Metadata (Week 9-10)
**Goal**: Decentralized storage

- [ ] IPFS integration
- [ ] Video upload to IPFS
- [ ] Metadata JSON creation
- [ ] Link metadata to tokens
- [ ] Test content persistence

### Phase 6: Polish & Launch (Week 11-12)
**Goal**: Production ready

- [ ] Mainnet deployment
- [ ] Security audit
- [ ] Performance optimization
- [ ] Marketing website
- [ ] Beta launch

---

## 🔧 TECHNICAL DECISIONS

### Why Solana?
- **Fast**: 400ms block time (near-instant trades)
- **Cheap**: $0.00025 per transaction (vs $50+ on Ethereum)
- **Scalable**: 65,000 TPS capacity
- **Growing ecosystem**: Pump.fun, Jupiter, Tensor all on Solana

### Why Bonding Curve?
- **Instant liquidity**: No need for liquidity pools
- **Fair pricing**: Price discovery based on supply/demand
- **Creator revenue**: Sustainable income model
- **Proven model**: Pump.fun shows it works

### Why Token-Gated Communities?
- **Aligned incentives**: Holders are invested in creator success
- **Quality engagement**: Reduces spam, increases commitment
- **Network effects**: Token value tied to community strength
- **Monetization**: Creators earn as community grows

---

## 🎯 SUCCESS METRICS

### Platform Metrics
- Daily Active Users (DAU)
- Videos minted per day
- Total trading volume
- Total creator earnings
- Community member count

### Engagement Metrics
- Average session duration
- Videos watched per session
- Buy conversion rate (viewer → token holder)
- Community posts per day
- Retention rate

### Creator Metrics
- Creator sign-ups per week
- Average creator earnings
- Token holder count per creator
- Community engagement rate

---

## 🛡️ SECURITY CONSIDERATIONS

### Smart Contract Security
- [ ] Use Anchor framework (audited)
- [ ] Implement reentrancy guards
- [ ] Add overflow checks
- [ ] Test extensively on devnet
- [ ] Professional audit before mainnet

### Platform Security
- [ ] Wallet signature verification
- [ ] Rate limiting on API
- [ ] CORS configuration
- [ ] Content moderation system
- [ ] Spam prevention

---

## 💡 FUTURE ENHANCEMENTS

### V2 Features
- **NFT Integration**: Convert top videos to NFTs
- **Staking**: Stake tokens for additional benefits
- **Liquidity Pools**: Migrate mature tokens to DEX
- **Cross-chain**: Bridge to other chains
- **Mobile App**: Native iOS/Android apps
- **Live Streaming**: Token-gated live streams
- **Collaboration**: Multi-creator tokens
- **Governance**: DAO for platform decisions

---

## 📈 GO-TO-MARKET STRATEGY

### Launch Strategy
1. **Private Beta**: 100 invited creators
2. **Public Beta**: Open to all (devnet SOL)
3. **Mainnet Launch**: Real SOL trading
4. **Viral Push**: Partner with crypto influencers

### Marketing Channels
- Twitter/X: Crypto community
- TikTok: Content creator outreach
- Discord: Community building
- Telegram: Updates & announcements
- YouTube: Tutorial videos

### Creator Incentives
- **Early Adopter Bonus**: Extra token allocation
- **Referral Program**: Earn from creator referrals
- **Featured Placement**: Spotlight top performers
- **Platform Token**: Future airdrop for early users

---

This architecture provides a complete blueprint for building Engagemint.meme into a revolutionary social media platform where creators win, investors win, and communities thrive.
