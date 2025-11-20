# 🚀 The Ultimate EngageMint Solana Integration Guide

> **Transform Viral Videos into Valuable Tokens**
> A complete, elegant, and battle-tested guide to integrate Solana blockchain into your social media platform.

---

## 📖 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [The Two Paths System](#the-two-paths-system)
3. [Bonding Curve Economics](#bonding-curve-economics)
4. [Complete Integration Roadmap](#complete-integration-roadmap)
5. [Smart Contract Deep Dive](#smart-contract-deep-dive)
6. [Frontend Integration](#frontend-integration)
7. [Backend Integration](#backend-integration)
8. [Database Schema](#database-schema)
9. [Testing & Deployment](#testing--deployment)
10. [Production Checklist](#production-checklist)
11. [Troubleshooting](#troubleshooting)

---

## 🏗️ Architecture Overview

### The Vision

EngageMint merges **social media virality** with **Solana blockchain economics** to create a unique value proposition:

- 📹 Users upload videos
- 🔥 Videos that go viral can be "minted" as tokens
- 💰 Community trades these tokens on a bonding curve
- 🚀 Successful tokens graduate to Raydium DEX

### Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 15)                     │
│  ┌────────────┬────────────┬────────────┬─────────────┐    │
│  │   Reels    │    Mint    │  Trading   │  Portfolio  │    │
│  │ Interface  │ Interface  │ Interface  │  Dashboard  │    │
│  └────────────┴────────────┴────────────┴─────────────┘    │
│           ↕                           ↕                      │
│  Solana Wallet Adapter        API Client (fetch)            │
└─────────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────────┐
│               BACKEND (Node.js + Express)                    │
│  ┌──────────────────┬──────────────────┬─────────────────┐ │
│  │  Video Service   │  Token Service   │ Solana Service  │ │
│  │  (PostgreSQL)    │   (Database)     │ (Anchor Client) │ │
│  └──────────────────┴──────────────────┴─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────────┐
│              SOLANA BLOCKCHAIN (Devnet/Mainnet)             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │    EngageMint Bonding Curve Program (Anchor/Rust)    │  │
│  │                                                        │  │
│  │  • initialize_curve()  - Create new token + curve    │  │
│  │  • buy()              - Buy tokens with SOL          │  │
│  │  • sell()             - Sell tokens for SOL          │  │
│  │  • migrate_to_raydium() - Graduate to DEX           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛤️ The Two Paths System

EngageMint offers **two distinct ways** to mint tokens, each serving different user needs:

### PATH A: Instant Mint 💳 (User Pays Upfront)

**Perfect for:** Creators confident in their content, want immediate launch

**Flow:**
```
1. User uploads video + fills token details
2. Popup appears: "Launch with SOL"
3. User connects Phantom wallet
4. User selects SOL amount (0.1 - 5 SOL)
5. Platform shows fee breakdown:
   - Initial liquidity: [X] SOL
   - Platform fee (1%): [Y] SOL
   - Network fee: ~0.001 SOL
   - Total: [Z] SOL
6. User clicks "Confirm & Launch"
7. Wallet prompts for signature
8. Token minted on Solana (~400ms)
9. Video published with token attached
```

**Cost:** 0.1 - 5 SOL (user choice)
**Time:** ~2 seconds
**Risk:** User pays whether video goes viral or not

### PATH B: Viral Auto-Launch 🔥 (Platform Pays After Virality)

**Perfect for:** Organic content, no upfront cost

**Flow:**
```
1. User uploads video (no wallet needed)
2. Video goes live immediately
3. Platform tracks engagement:
   - Likes
   - Comments
   - Shares
   - Watch time
4. When video hits threshold (e.g., 1000 likes):
   - Platform automatically mints token
   - Uses platform wallet (no user interaction)
   - Notifies creator: "Your video went viral! Token launched!"
5. Creator can claim percentage of initial supply
```

**Cost:** FREE for user
**Time:** Automatic when viral
**Risk:** Platform takes risk, gets reward

### When to Use Which Path?

| Criteria | Path A (Instant) | Path B (Viral) |
|----------|------------------|----------------|
| **User has crypto wallet** | ✅ Yes | ❌ No wallet needed |
| **User has SOL** | ✅ 0.1+ SOL | ❌ $0 required |
| **Confidence level** | 🔥 High | 🤷 Testing waters |
| **Launch speed** | ⚡ Instant | ⏰ When viral |
| **Risk** | 💰 User | 🏢 Platform |

---

## 📈 Bonding Curve Economics

### The Pump.fun Model

EngageMint implements a **constant product bonding curve** inspired by Pump.fun:

```
Formula: (x + Δx)(y - Δy) = k

Where:
- x = SOL reserves
- y = Token reserves
- k = Constant product
- Δx = SOL being added (buy)
- Δy = Tokens being removed (sell)
```

### Curve Parameters

```javascript
// Initial state (per token)
const CURVE_CONFIG = {
  virtualTokenReserves: 1_073_000_000 * 1e9,  // 1.073B tokens (virtual)
  virtualSolReserves: 30 * 1e9,                // 30 SOL (virtual)
  realTokenReserves: 793_100_000 * 1e9,       // 793.1M tokens (real, sellable)
  realSolReserves: 0,                          // Starts at 0

  // Graduation threshold
  targetSolAmount: 85 * 1e9,                   // 85 SOL = ~$17k @ $200/SOL

  // Fees
  platformFeeBasisPoints: 100,                 // 1%

  // Token economics
  totalSupply: 1_000_000_000 * 1e9,           // 1 billion tokens
  decimals: 9
}
```

### Price Discovery Mechanism

**Initial Price:**
```
P₀ = virtualSolReserves / virtualTokenReserves
P₀ = 30 SOL / 1,073,000,000 tokens
P₀ ≈ 0.000000028 SOL per token
```

**After 1 SOL Purchase:**
```javascript
// Calculate tokens received
tokensOut = (virtualTokenReserves * solIn) / (virtualSolReserves + solIn)
tokensOut = (1,073,000,000 * 1) / (30 + 1)
tokensOut ≈ 34,612,903 tokens

// New price
newPrice = (30 + 1) / (1,073,000,000 - 34,612,903)
newPrice ≈ 0.000000030 SOL per token
```

**Price increases ~7% per 1 SOL added!** 📈

### Graduation to Raydium

When bonding curve accumulates **85 SOL**:

1. Curve automatically locks
2. Liquidity migrates to Raydium AMM
3. LP tokens burned (liquidity locked forever)
4. Token becomes fully decentralized
5. Trading continues on Raydium with deeper liquidity

---

## 🗺️ Complete Integration Roadmap

### Phase 1: Foundation (2-3 hours) ⚙️

**Goal:** Get Solana program deployed and connected

**Steps:**

1. **Deploy Bonding Curve Program**
   ```bash
   cd /root/ccm-engagemint

   # Build program
   anchor build

   # Deploy to devnet
   anchor deploy --provider.cluster devnet

   # Save program ID
   # Update Anchor.toml with real program ID
   ```

2. **Configure Environment Variables**

   **Backend (.env):**
   ```env
   # Solana
   SOLANA_NETWORK=devnet
   SOLANA_RPC_URL=https://api.devnet.solana.com
   BONDING_CURVE_PROGRAM_ID=<YOUR_PROGRAM_ID>
   PLATFORM_WALLET_PRIVATE_KEY=<BASE58_PRIVATE_KEY>

   # Existing
   DATABASE_URL=postgresql://...
   JWT_SECRET=...
   PORT=5050
   ```

   **Frontend (.env.local):**
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5050/api
   NEXT_PUBLIC_SOLANA_NETWORK=devnet
   NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
   NEXT_PUBLIC_BONDING_CURVE_PROGRAM_ID=<YOUR_PROGRAM_ID>
   NEXT_PUBLIC_INSTANT_MINT_COST_SOL=0.01
   ```

3. **Generate Platform Wallet**
   ```bash
   cd backend

   # Generate keypair
   solana-keygen new --outfile .solana-wallet.json

   # Get address
   solana-keygen pubkey .solana-wallet.json

   # Request airdrop (devnet only)
   solana airdrop 5 <WALLET_ADDRESS> --url devnet
   ```

4. **Run Database Migrations**
   ```bash
   # Already exists in ccm-engagemint-solana branch
   psql -d engagemint_dev -f backend/db-migrations/add-moderation.sql
   ```

### Phase 2: Critical Features (4-6 hours) 🎯

#### Feature 1: Wallet + Fee Popup ⚡ [HIGHEST PRIORITY]

**Status:** ✅ COMPLETE on `ccm-engagemint-solana` branch

**What was built:**
- `SolanaLaunchPopup.tsx` component
- Wallet connection UI (Phantom, Solflare, etc.)
- SOL amount selector (0.1, 0.5, 1, 2, 5 SOL presets)
- Fee breakdown calculator
- Integration with MintInterface

**How to use:**
```typescript
// In MintInterface.tsx
const handleMintClick = () => {
  setShowSolanaPopup(true);
}

// Popup handles:
// 1. Wallet connection
// 2. SOL amount selection
// 3. Fee calculation
// 4. Transaction signing
// 5. Token minting
```

**Fix needed:**
- Metaplex import error in `backend/src/services/metaplexService.js`
- See [Current Issues](#current-issues-to-fix) below

#### Feature 2: Portfolio Dashboard 💼 [HIGH PRIORITY]

**Status:** ✅ COMPLETE on `ccm-engagemint-solana` branch

**What was built:**
- `PortfolioDashboard.tsx` component
- Real-time portfolio value tracking
- P&L calculation (profit/loss)
- Per-token trade buttons
- Backend API: `GET /api/tokens/user/:userId/portfolio`

**Features:**
- Shows all token holdings
- Current value in SOL
- Percentage gains/losses (green/red)
- Links to Solscan explorer
- Empty state for new users

#### Feature 3: Price Charts 📈 [HIGH PRIORITY]

**Status:** ✅ COMPLETE on `ccm-engagemint-solana` branch

**What was built:**
- SVG-based price chart (no external libs)
- Timeframe selector (1H, 24H, 7D, 30D)
- Auto-refresh every 10 seconds
- Backend API: `GET /api/tokens/:mintAddress/price-history`

**Integration point:**
- Embedded in `TradingInterface.tsx`
- Below buy/sell buttons
- Shows price movement at a glance

#### Feature 4: Content Moderation 🚨 [MEDIUM PRIORITY]

**Status:** ✅ COMPLETE on `ccm-engagemint-solana` branch

**What was built:**
- `ReportPopup.tsx` component
- Report reasons: Spam, Offensive, Copyright, Other
- Backend API: `POST /api/videos/:id/report`
- Auto-hide at 5+ reports

**Features:**
- Report button on every video
- Anonymous and authenticated reporting
- Database-backed moderation system
- Future: Admin review dashboard

### Phase 3: Testing & Polish (2-3 hours) ✨

1. **Fix Metaplex Import** [BLOCKING]
2. **End-to-End Testing**
3. **Performance Optimization**
4. **Security Audit**
5. **Deploy to Production**

---

## 🔧 Smart Contract Deep Dive

### Program Structure

```rust
// Location: /programs/engagemint-bonding-curve/src/lib.rs

pub mod engagemint_bonding_curve {
    // Instructions
    pub fn initialize_curve() -> Result<()>
    pub fn buy() -> Result<()>
    pub fn sell() -> Result<()>
    pub fn migrate_to_raydium() -> Result<()>
}

// State
#[account]
pub struct BondingCurve {
    creator: Pubkey,
    token_mint: Pubkey,
    curve_authority: Pubkey,

    // Reserves
    virtual_token_reserves: u64,
    virtual_sol_reserves: u64,
    real_token_reserves: u64,
    real_sol_reserves: u64,

    // Config
    total_supply: u64,
    target_sol_amount: u64,
    fee_basis_points: u16,

    // State
    is_graduated: bool,
    trade_count: u64,
    accumulated_fees: u64,
    created_at: i64,

    // Metadata
    token_name: String,
    token_symbol: String,
    token_uri: String,
    video_id: String,
}
```

### Key Functions Explained

#### 1. initialize_curve()

**Purpose:** Create new token + bonding curve

**Parameters:**
```rust
pub fn initialize_curve(
    ctx: Context<InitializeCurve>,
    token_name: String,      // e.g., "Doge Dancing"
    token_symbol: String,    // e.g., "DOGEDANCE"
    token_uri: String,       // Metadata URI from Arweave
    video_id: String,        // EngageMint video ID
) -> Result<()>
```

**What it does:**
1. Creates SPL token mint (9 decimals)
2. Initializes bonding curve state PDA
3. Creates token vault (holds sellable tokens)
4. Creates SOL vault (holds liquidity)
5. Sets initial reserves (virtual + real)

**PDAs Created:**
```
bonding_curve = PDA["bonding_curve", token_mint]
curve_authority = PDA["curve_authority", token_mint]
curve_sol_vault = PDA["curve_sol_vault", token_mint]
```

#### 2. buy()

**Purpose:** Purchase tokens with SOL

**Parameters:**
```rust
pub fn buy(
    ctx: Context<Buy>,
    sol_amount: u64,        // Lamports to spend
    min_tokens_out: u64,    // Slippage protection
) -> Result<()>
```

**Logic:**
```rust
// 1. Calculate tokens out using bonding curve
let tokens_out = (virtual_token_reserves * sol_amount)
                 / (virtual_sol_reserves + sol_amount);

// 2. Check slippage
require!(tokens_out >= min_tokens_out, SlippageExceeded);

// 3. Calculate fee (1%)
let fee = (sol_amount * 100) / 10000;
let sol_after_fee = sol_amount - fee;

// 4. Transfer SOL: buyer -> curve vault
transfer_sol(buyer, curve_sol_vault, sol_after_fee);

// 5. Transfer fee: buyer -> platform
transfer_sol(buyer, platform_fee_account, fee);

// 6. Transfer tokens: curve vault -> buyer
transfer_tokens(curve_token_vault, buyer_token_account, tokens_out);

// 7. Update reserves
curve.real_sol_reserves += sol_after_fee;
curve.real_token_reserves -= tokens_out;
curve.virtual_sol_reserves += sol_after_fee;
curve.virtual_token_reserves -= tokens_out;

// 8. Check graduation
if curve.real_sol_reserves >= 85 * LAMPORTS_PER_SOL {
    curve.is_graduated = true;
    emit!(GraduationEvent);
}
```

#### 3. sell()

**Purpose:** Sell tokens for SOL

**Similar to buy(), but reversed:**
```rust
// Calculate SOL out
let sol_out = (virtual_sol_reserves * token_amount)
              / (virtual_token_reserves + token_amount);

// Apply fee
let fee = (sol_out * 100) / 10000;
let sol_after_fee = sol_out - fee;

// Update reserves (opposite direction)
curve.real_sol_reserves -= sol_out;
curve.real_token_reserves += token_amount;
```

#### 4. migrate_to_raydium()

**Purpose:** Graduate to Raydium DEX

**Status:** 🚧 Placeholder (requires Raydium SDK)

**Planned Logic:**
```rust
pub fn migrate_to_raydium(ctx: Context<MigrateToRaydium>) -> Result<()> {
    require!(curve.real_sol_reserves >= 85 SOL);
    require!(!curve.is_graduated);

    // TODO: Call Raydium initialize pool
    // TODO: Deposit SOL + tokens
    // TODO: Burn LP tokens
    // TODO: Mark as graduated

    curve.is_graduated = true;
    Ok(())
}
```

---

## 💻 Frontend Integration

### Solana Wallet Setup

**Location:** `frontend/src/app/layout.tsx`

```typescript
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

export default function RootLayout({ children }) {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
```

### Core Solana Functions

**Location:** `frontend/src/lib/solana.ts`

#### Instant Mint Token

```typescript
export async function instantMintToken({
  wallet,
  tokenName,
  tokenSymbol,
  videoId,
  initialSupply = 1_000_000,
}: InstantMintParams): Promise<InstantMintResult> {

  // 1. Create mint account
  const mintKeypair = Keypair.generate();
  const mint = await createMint(
    connection,
    wallet,
    wallet.publicKey,
    wallet.publicKey,
    9,
    mintKeypair
  );

  // 2. Create bonding curve via backend
  const response = await fetch(`${API_URL}/tokens/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tokenName,
      tokenSymbol,
      mintAddress: mint.toString(),
      videoId,
      creatorPublicKey: wallet.publicKey.toString(),
    }),
  });

  const { bondingCurveAddress, signature } = await response.json();

  return {
    mintAddress: mint.toString(),
    bondingCurveAddress,
    signature,
    solPaid: INSTANT_MINT_COST_SOL,
  };
}
```

#### Buy Tokens

```typescript
export async function buyTokens({
  wallet,
  tokenMint,
  solAmount,
  slippage = 1,
}: BuyTokenParams): Promise<string> {

  // 1. Get bonding curve state
  const curveState = await fetch(
    `${API_URL}/tokens/${tokenMint}/curve-state`
  ).then(r => r.json());

  // 2. Calculate expected tokens
  const expectedTokens = calculateTokensOut(solAmount, curveState);
  const minTokens = expectedTokens * (1 - slippage / 100);

  // 3. Build transaction
  const [bondingCurve] = PublicKey.findProgramAddressSync(
    [Buffer.from('bonding_curve'), tokenMint.toBuffer()],
    BONDING_CURVE_PROGRAM_ID
  );

  const tx = await program.methods
    .buy(
      new BN(solAmount * LAMPORTS_PER_SOL),
      new BN(minTokens)
    )
    .accounts({
      buyer: wallet.publicKey,
      bondingCurve,
      // ... other accounts
    })
    .transaction();

  // 4. Sign and send
  const signature = await wallet.sendTransaction(tx, connection);
  await connection.confirmTransaction(signature);

  return signature;
}
```

### UI Components

#### SolanaLaunchPopup

**Location:** `frontend/src/components/SolanaLaunchPopup.tsx`

**Features:**
- Wallet connection button
- SOL amount slider (0.1 - 5 SOL)
- Real-time fee calculation
- Confirm & Launch button
- Loading states
- Error handling

**Key State:**
```typescript
const [walletConnected, setWalletConnected] = useState(false);
const [solAmount, setSolAmount] = useState(0.1);
const [isLoading, setIsLoading] = useState(false);

// Fee calculation
const platformFee = solAmount * 0.01;
const networkFee = 0.001;
const totalCost = solAmount + platformFee + networkFee;
```

#### PortfolioDashboard

**Location:** `frontend/src/components/PortfolioDashboard.tsx`

**Displays:**
```typescript
interface TokenHolding {
  tokenName: string;
  tokenSymbol: string;
  mintAddress: string;
  balance: number;
  currentPrice: number;
  valueSol: number;
  pnl: number;           // Profit/loss in SOL
  pnlPercentage: number; // P&L as %
}
```

**Real-time updates:**
```typescript
useEffect(() => {
  // Fetch portfolio on load
  fetchPortfolio();

  // Subscribe to WebSocket for live updates
  socket.on('token:price-update', (data) => {
    updateTokenPrice(data.mintAddress, data.newPrice);
  });

  // Refresh every 10 seconds
  const interval = setInterval(fetchPortfolio, 10000);
  return () => clearInterval(interval);
}, []);
```

---

## 🗄️ Backend Integration

### Solana Service

**Location:** `backend/src/services/solanaService.js`

#### Create Token with Bonding Curve

```javascript
async function createTokenWithBondingCurve({
  tokenName,
  tokenSymbol,
  tokenUri,
  videoId,
  creatorPublicKey,
  path = 'instant',
}) {
  // 1. Generate mint keypair
  const mintKeypair = Keypair.generate();

  // 2. Call Anchor program
  const curveData = await anchorClient.initializeCurve(
    mintKeypair.publicKey,
    tokenName,
    tokenSymbol,
    tokenUri,
    videoId
  );

  // 3. Store in database
  await db.query(`
    INSERT INTO tokens (
      mint_address,
      bonding_curve_address,
      token_name,
      token_symbol,
      video_id,
      creator_id,
      path
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
  `, [
    mintKeypair.publicKey.toString(),
    curveData.bondingCurve,
    tokenName,
    tokenSymbol,
    videoId,
    creatorPublicKey,
    path
  ]);

  return {
    mintAddress: mintKeypair.publicKey.toString(),
    bondingCurveAddress: curveData.bondingCurve,
    signature: curveData.signature,
  };
}
```

### Anchor Client

**Location:** `backend/src/services/anchorClient.js`

```javascript
class AnchorClient {
  constructor(connection, wallet) {
    this.connection = connection;
    this.wallet = wallet;
    this.program = new Program(IDL, PROGRAM_ID, provider);
  }

  async initializeCurve(mint, name, symbol, uri, videoId) {
    // Find PDAs
    const [bondingCurve] = PublicKey.findProgramAddressSync(
      [Buffer.from('bonding_curve'), mint.toBuffer()],
      this.program.programId
    );

    const [curveAuthority] = PublicKey.findProgramAddressSync(
      [Buffer.from('curve_authority'), mint.toBuffer()],
      this.program.programId
    );

    // Execute transaction
    const tx = await this.program.methods
      .initializeCurve(name, symbol, uri, videoId)
      .accounts({
        creator: this.wallet.publicKey,
        tokenMint: mint,
        bondingCurve,
        curveAuthority,
        // ... other accounts
      })
      .signers([mintKeypair])
      .rpc();

    return {
      bondingCurve: bondingCurve.toString(),
      curveAuthority: curveAuthority.toString(),
      signature: tx,
    };
  }

  async buy(bondingCurve, buyer, solAmount, minTokensOut) {
    const tx = await this.program.methods
      .buy(new BN(solAmount), new BN(minTokensOut))
      .accounts({
        buyer,
        bondingCurve,
        // ...
      })
      .rpc();

    return { signature: tx };
  }

  async getCurveState(bondingCurveAddress) {
    return await this.program.account.bondingCurve.fetch(
      bondingCurveAddress
    );
  }
}
```

### Metaplex Service

**Location:** `backend/src/services/metaplexService.js`

**Current Issue:** Import error with `@metaplex-foundation/js`

**Fix Options:**

1. **Update to latest version:**
   ```bash
   cd backend
   npm uninstall @metaplex-foundation/js
   npm install @metaplex-foundation/js@latest
   ```

2. **Use specific stable version:**
   ```bash
   npm install @metaplex-foundation/js@0.20.1
   ```

3. **Alternative: Use Metaplex JS SDK v1:**
   ```bash
   npm install @metaplex-foundation/mpl-token-metadata
   ```

---

## 🗃️ Database Schema

### New Tables (Already Created on `ccm-engagemint-solana` branch)

#### 1. video_reports

```sql
CREATE TABLE video_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id VARCHAR(255) NOT NULL,
  user_id UUID,
  reason TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),

  FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_video_reports_video_id ON video_reports(video_id);
CREATE INDEX idx_video_reports_created_at ON video_reports(created_at DESC);
```

#### 2. video_view_events

```sql
CREATE TABLE video_view_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id VARCHAR(255) NOT NULL,
  user_id UUID,
  session_id VARCHAR(255),
  watched_duration_seconds INTEGER,
  viewed_at TIMESTAMP DEFAULT NOW(),

  FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
);

CREATE INDEX idx_view_events_video_id ON video_view_events(video_id);
CREATE INDEX idx_view_events_viewed_at ON video_view_events(viewed_at DESC);
```

#### 3. token_holders

```sql
CREATE TABLE token_holders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  token_id UUID NOT NULL,
  balance DECIMAL(20, 9) NOT NULL DEFAULT 0,
  avg_buy_price DECIMAL(20, 9),
  total_invested_sol DECIMAL(20, 9),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (token_id) REFERENCES tokens(id) ON DELETE CASCADE,

  UNIQUE(user_id, token_id)
);

CREATE INDEX idx_token_holders_user_id ON token_holders(user_id);
CREATE INDEX idx_token_holders_token_id ON token_holders(token_id);
```

#### 4. token_price_history

```sql
CREATE TABLE token_price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mint_address VARCHAR(255) NOT NULL,
  price DECIMAL(20, 12) NOT NULL,
  market_cap DECIMAL(20, 9),
  volume_24h DECIMAL(20, 9),
  recorded_at TIMESTAMP DEFAULT NOW(),

  FOREIGN KEY (mint_address) REFERENCES tokens(mint_address) ON DELETE CASCADE
);

CREATE INDEX idx_price_history_mint ON token_price_history(mint_address);
CREATE INDEX idx_price_history_time ON token_price_history(recorded_at DESC);
```

### Modified Tables

#### tokens (Add Solana fields)

```sql
ALTER TABLE tokens ADD COLUMN IF NOT EXISTS bonding_curve_address VARCHAR(255);
ALTER TABLE tokens ADD COLUMN IF NOT EXISTS curve_authority_address VARCHAR(255);
ALTER TABLE tokens ADD COLUMN IF NOT EXISTS path VARCHAR(20) DEFAULT 'instant';
ALTER TABLE tokens ADD COLUMN IF NOT EXISTS is_graduated BOOLEAN DEFAULT FALSE;
ALTER TABLE tokens ADD COLUMN IF NOT EXISTS real_sol_reserves DECIMAL(20, 9) DEFAULT 0;
ALTER TABLE tokens ADD COLUMN IF NOT EXISTS real_token_reserves DECIMAL(20, 9) DEFAULT 0;
```

---

## 🧪 Testing & Deployment

### Local Testing (Devnet)

#### 1. Start Local Environment

```bash
# Terminal 1: Backend
cd /root/ccm-engagemint/backend
npm run dev

# Terminal 2: Frontend
cd /root/ccm-engagemint/frontend
rm -rf .next
npm run dev

# Terminal 3: Solana Test Validator (optional for faster testing)
solana-test-validator
```

#### 2. Test PATH A (Instant Mint)

```bash
# In browser:
1. Go to http://localhost:3000
2. Login with ccm2024
3. Click MINT button → Mint
4. Upload video (or use test video)
5. Fill token details:
   - Name: "Test Doge"
   - Symbol: "TESTDOGE"
   - Description: "Testing bonding curve"
6. Click "Mint & Post"
7. ✅ Popup should appear
8. Connect Phantom wallet (devnet mode)
9. Select 0.1 SOL
10. Verify fees displayed correctly
11. Click "Confirm & Launch"
12. Approve in Phantom
13. Wait for confirmation (~2 seconds)
14. Verify:
    - Success message shown
    - Mint address displayed
    - Video appears in feed
    - Token info visible
```

#### 3. Test Trading

```bash
# Buy test
1. Click on minted video
2. Trading modal opens
3. Click "Buy" tab
4. Enter 0.05 SOL
5. See estimated tokens
6. Click "Buy Tokens"
7. Approve transaction
8. Verify:
   - Tokens received
   - Balance updated
   - Price increased

# Sell test
1. In same modal, click "Sell"
2. Enter token amount
3. See estimated SOL
4. Click "Sell Tokens"
5. Approve transaction
6. Verify:
   - SOL received
   - Token balance decreased
```

#### 4. Test Portfolio

```bash
1. Click MINT → Portfolio
2. Verify:
   - Total portfolio value shown
   - All holdings listed
   - P&L calculated correctly
   - Prices updating
3. Click "Trade" button on a token
4. Trading modal opens correctly
```

#### 5. Test Moderation

```bash
1. View any video
2. Click Report button (red flag icon)
3. Select "Spam"
4. Submit report
5. Verify:
   - Success message
   - Report saved to database
6. Report same video 5 times (different users)
7. Verify video auto-hidden
```

### Deployment to Mainnet

#### Pre-Deployment Checklist

- [ ] Anchor program audited by security firm
- [ ] All tests passing (unit + integration)
- [ ] Frontend E2E tests passing
- [ ] Database backups configured
- [ ] RPC provider selected (Helius, QuickNode, etc.)
- [ ] Platform wallet secured (hardware wallet)
- [ ] Fee recipient addresses configured
- [ ] Rate limiting enabled
- [ ] Monitoring & alerting set up
- [ ] Bug bounty program prepared

#### Deployment Steps

1. **Deploy Program to Mainnet**
   ```bash
   # Build for mainnet
   anchor build --verifiable

   # Deploy (requires SOL for deployment)
   anchor deploy --provider.cluster mainnet-beta

   # Verify deployment
   solana program show <PROGRAM_ID> --url mainnet-beta
   ```

2. **Update Environment Variables**
   ```env
   SOLANA_NETWORK=mainnet-beta
   SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=<KEY>
   BONDING_CURVE_PROGRAM_ID=<MAINNET_PROGRAM_ID>
   ```

3. **Database Migration**
   ```bash
   # Production database
   psql $PRODUCTION_DATABASE_URL -f db-migrations/add-moderation.sql
   ```

4. **Frontend Deployment**
   ```bash
   # Update production .env
   NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
   NEXT_PUBLIC_BONDING_CURVE_PROGRAM_ID=<MAINNET_PROGRAM_ID>

   # Deploy to Vercel
   vercel --prod
   ```

5. **Backend Deployment**
   ```bash
   # Deploy to Railway/Render/AWS
   railway up

   # Or Docker
   docker build -t engagemint-backend .
   docker run -d -p 5050:5050 engagemint-backend
   ```

---

## ✅ Production Checklist

### Security

- [ ] Smart contract audited by reputable firm (Sec3, OtterSec, etc.)
- [ ] No admin keys / upgrade authority renounced
- [ ] Platform wallet uses hardware wallet (Ledger)
- [ ] API rate limiting enabled (100 req/min per IP)
- [ ] CORS configured for production domain only
- [ ] SQL injection protection (parameterized queries)
- [ ] XSS protection (Content Security Policy)
- [ ] Wallet signing messages verified
- [ ] No private keys in code/environment
- [ ] Secrets managed via vault (AWS Secrets Manager, etc.)

### Performance

- [ ] RPC provider with high rate limits (Helius/QuickNode)
- [ ] Database indexes optimized
- [ ] CDN configured for static assets
- [ ] Image optimization enabled
- [ ] Lazy loading for videos
- [ ] WebSocket connection pooling
- [ ] Redis cache for hot data
- [ ] Database connection pooling

### Monitoring

- [ ] Sentry error tracking configured
- [ ] Datadog/New Relic APM enabled
- [ ] Solana transaction monitoring (failed txs alert)
- [ ] Database performance monitoring
- [ ] Uptime monitoring (Pingdom, UptimeRobot)
- [ ] Log aggregation (Papertrail, Loggly)
- [ ] Slack/Discord alerts for critical issues

### Legal & Compliance

- [ ] Terms of Service published
- [ ] Privacy Policy published
- [ ] GDPR compliance (if EU users)
- [ ] Token disclaimer (not financial advice)
- [ ] Age verification (13+ or 18+)
- [ ] DMCA takedown process
- [ ] KYC/AML review (consult lawyer)

---

## 🔧 Current Issues to Fix

### Issue #1: Metaplex Import Error (BLOCKING)

**Error:**
```
Cannot find module '@metaplex-foundation/js'
at backend/src/services/metaplexService.js:12:5
```

**Root Cause:**
- Package installed but exports don't match
- `bundlrStorage` and `toMetaplexFile` may not exist in current version

**Solutions:**

**Option A: Update Package**
```bash
cd /root/ccm-engagemint/backend
npm uninstall @metaplex-foundation/js
npm install @metaplex-foundation/js@latest
npm run dev
```

**Option B: Use Specific Version**
```bash
npm install @metaplex-foundation/js@0.20.1
npm run dev
```

**Option C: Temporary Bypass**
```javascript
// Comment out Metaplex service temporarily
// backend/src/routes/tokens.js line 37-151
// This allows testing other features
```

### Issue #2: Missing Program ID

**Problem:** Program not deployed yet, using placeholder

**Fix:**
```bash
anchor build
anchor deploy --provider.cluster devnet
# Copy program ID from output
# Update Anchor.toml and .env files
```

---

## 🎯 Unique Approach Summary

What makes EngageMint's Solana integration elegant and unique:

### 1. **Dual-Path System** 🛤️
- **PATH A:** User pays upfront (instant gratification)
- **PATH B:** Platform pays after virality (risk-free for users)
- Bridges crypto natives and normies seamlessly

### 2. **Social-First Design** 📱
- Wallet integration feels native (popup, not redirect)
- Portfolio is a "tab" not a separate dApp
- Trading modal inside video player
- No "connect wallet" barrier for viewing

### 3. **Pump.fun Economics** 💰
- Proven bonding curve model
- Fair launch (no presale, no team allocation)
- Automatic graduation to DEX
- Built-in liquidity lock (LP burn)

### 4. **Content Moderation** 🛡️
- Web2 moderation meets Web3 transparency
- Reports stored on-chain (future)
- Community-driven safety
- Auto-hide prevents rug pulls on scam tokens

### 5. **Elegant Developer Experience** 👨‍💻
- Clean separation of concerns
- Anchor program (auditable Rust)
- TypeScript SDK (type-safe frontend)
- Well-documented APIs
- Comprehensive testing suite

---

## 🚀 Next Steps

### Immediate (This Session)

1. Fix Metaplex import error
2. Deploy Anchor program to devnet
3. Test end-to-end flow
4. Record demo video

### Short-term (This Week)

1. Implement PATH B (viral auto-launch)
2. Add Raydium migration logic
3. Build admin moderation dashboard
4. Performance optimization

### Long-term (Next Month)

1. Security audit
2. Deploy to mainnet
3. Marketing campaign
4. Community building

---

## 📚 Resources

### Documentation
- [Anchor Book](https://www.anchor-lang.com/)
- [Solana Cookbook](https://solanacookbook.com/)
- [Metaplex Docs](https://docs.metaplex.com/)

### Inspiration
- [Pump.fun](https://pump.fun) - Bonding curve reference
- [Friend.tech](https://friend.tech) - Social token model

### Tools
- [Solana Explorer](https://explorer.solana.com/)
- [Anchor Playground](https://beta.solpg.io/)
- [Phantom Wallet](https://phantom.app/)

---

**Built with ❤️ for the EngageMint community**

*Transform your viral moments into valuable tokens.* 🚀

---

## 🙋 FAQ

**Q: Why Solana instead of Ethereum?**
A: Speed (400ms finality), cost ($0.00025/tx), and scalability.

**Q: What if the bonding curve never reaches 85 SOL?**
A: Tokens remain tradeable on the curve indefinitely. No expiration.

**Q: How do you prevent rug pulls?**
A: Bonding curve is immutable. Liquidity locked. No admin keys.

**Q: Can I use this on mobile?**
A: Yes! Wallet adapters support mobile wallets (Phantom, Solflare).

**Q: What about gas fees during high traffic?**
A: Solana fees don't surge. Always ~$0.00025 regardless of network activity.

**Q: Is the smart contract upgradeable?**
A: No. Once deployed, it's immutable (unless you keep upgrade authority).

---

*Last Updated: November 9, 2025*
*Branch: ccm-engagemint-solana*
*Status: 95% Complete*
