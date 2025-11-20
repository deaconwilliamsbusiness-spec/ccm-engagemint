# Complete Solana Integration - Step by Step Guide

**Status**: In Progress
**Completed**: Cargo.toml fixed, Graduation threshold fixed
**Current**: Building smart contract (toolchain issues)

---

## ✅ COMPLETED STEPS

### 1. Fix Cargo.toml Dependencies ✅
```toml
# Changed from 0.31.1 to 0.30.1
[dependencies]
anchor-lang = "0.30.1"
anchor-spl = "0.30.1"
```

### 2. Fix Graduation Threshold ✅
```rust
// Changed from 85 SOL (unreachable) to 20 SOL (achievable)
curve.target_sol_amount = 20_000_000_000;
curve.raydium_migration_threshold = 20_000_000_000;
```

---

## 🔄 IN PROGRESS

### 3. Build Smart Contract

**Issue**: Rust toolchain version mismatch

**Solution**:
```bash
# Install correct Rust version (1.76+)
rustup install 1.78.0
rustup default 1.78.0

# Clean everything
cd /root/ccm-engagemint
find . -name "Cargo.lock" -delete
rm -rf target/

# Rebuild
anchor build

# Expected output:
# ✅ Program compiled successfully
# ✅ IDL generated at target/idl/engagemint_bonding_curve.json
```

**If build succeeds**, program ID will be in:
- `target/deploy/engagemint_bonding_curve-keypair.json`

---

## 📋 PENDING STEPS (In Order)

### 4. Deploy to Devnet

```bash
# Ensure you have devnet SOL
solana airdrop 2 --url devnet

# Deploy
anchor deploy --provider.cluster devnet

# Save program ID
PROGRAM_ID=$(solana address -k target/deploy/engagemint_bonding_curve-keypair.json)
echo "Program ID: $PROGRAM_ID"
```

**Update env files with program ID**:

```bash
# Backend
echo "BONDING_CURVE_PROGRAM_ID=$PROGRAM_ID" >> backend/.env

# Frontend
echo "NEXT_PUBLIC_BONDING_CURVE_PROGRAM_ID=$PROGRAM_ID" >> frontend/.env.local
```

### 5. Fix Backend Price Calculation

**File**: `backend/src/services/solanaService.js`

**Current (WRONG)**:
```javascript
async function getTokenPrice(mintAddress) {
  const state = await anchorClient.getCurveState(bondingCurve);
  return Number(state.virtualSolReserves) / Number(state.virtualTokenReserves) / LAMPORTS_PER_SOL;
  // ❌ This is off by 9 orders of magnitude!
}
```

**Fix**:
```javascript
async function getTokenPrice(mintAddress) {
  const state = await anchorClient.getCurveState(bondingCurve);

  // Convert reserves to human-readable amounts first
  const solReserves = Number(state.virtualSolReserves) / LAMPORTS_PER_SOL; // SOL
  const tokenReserves = Number(state.virtualTokenReserves) / 1e9; // tokens (9 decimals)

  // Price in SOL per token
  return solReserves / tokenReserves;
}
```

### 6. Fix Market Cap Calculation

**File**: `backend/src/services/solanaService.js`

**Current (WRONG)**:
```javascript
async function getMarketCap(mintAddress) {
  const price = await getTokenPrice(mintAddress);
  return price * 1_000_000_000; // ❌ Hardcoded supply
}
```

**Fix**:
```javascript
async function getMarketCap(mintAddress) {
  const tokenMint = new PublicKey(mintAddress);
  const [bondingCurve] = PublicKey.findProgramAddressSync(
    [Buffer.from('bonding_curve'), tokenMint.toBuffer()],
    PROGRAM_ID
  );

  const state = await anchorClient.getCurveState(bondingCurve);
  const price = await getTokenPrice(mintAddress);

  // Total supply from curve state (in tokens, not lamports)
  const totalSupply = Number(state.totalSupply) / 1e9;

  // Market cap in SOL
  return price * totalSupply;
}
```

### 7. Implement Real Anchor Client

**File**: `backend/src/services/anchorClient.js`

This needs complete rewrite to use actual Anchor program:

```javascript
const { Program, AnchorProvider, BN } = require('@coral-xyz/anchor');
const fs = require('fs');
const path = require('path');

// Load IDL (generated from anchor build)
const IDL = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, '../../target/idl/engagemint_bonding_curve.json'),
    'utf-8'
  )
);

class AnchorClient {
  constructor(connection, wallet) {
    this.connection = connection;
    this.wallet = wallet;

    // Create provider
    const provider = new AnchorProvider(
      connection,
      wallet,
      { commitment: 'confirmed' }
    );

    // Create program instance
    this.program = new Program(
      IDL,
      process.env.BONDING_CURVE_PROGRAM_ID,
      provider
    );
  }

  async initializeCurve(tokenMint, tokenName, tokenSymbol, tokenUri, videoId) {
    // Derive PDAs
    const [bondingCurve, bondingCurveBump] = PublicKey.findProgramAddressSync(
      [Buffer.from('bonding_curve'), tokenMint.toBuffer()],
      this.program.programId
    );

    const [curveAuthority, authorityBump] = PublicKey.findProgramAddressSync(
      [Buffer.from('curve_authority'), tokenMint.toBuffer()],
      this.program.programId
    );

    const [curveSolVault, vaultBump] = PublicKey.findProgramAddressSync(
      [Buffer.from('curve_sol_vault'), tokenMint.toBuffer()],
      this.program.programId
    );

    // Get curve token vault (ATA)
    const curveTokenVault = await getAssociatedTokenAddress(
      tokenMint,
      curveAuthority,
      true
    );

    // Call initialize_curve instruction
    const tx = await this.program.methods
      .initializeCurve(tokenName, tokenSymbol, tokenUri, videoId)
      .accounts({
        creator: this.wallet.publicKey,
        tokenMint,
        bondingCurve,
        curveAuthority,
        curveTokenVault,
        curveSolVault,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    return {
      bondingCurve: bondingCurve.toString(),
      curveAuthority: curveAuthority.toString(),
      curveSolVault: curveSolVault.toString(),
      signature: tx,
    };
  }

  async buy(bondingCurveAddress, buyerPublicKey, solAmount, minTokensOut) {
    const bondingCurve = new PublicKey(bondingCurveAddress);

    // Fetch curve state to get token mint
    const curveState = await this.program.account.bondingCurve.fetch(bondingCurve);
    const tokenMint = curveState.tokenMint;

    // Derive PDAs
    const [curveAuthority] = PublicKey.findProgramAddressSync(
      [Buffer.from('curve_authority'), tokenMint.toBuffer()],
      this.program.programId
    );

    const [curveSolVault] = PublicKey.findProgramAddressSync(
      [Buffer.from('curve_sol_vault'), tokenMint.toBuffer()],
      this.program.programId
    );

    // Get accounts
    const curveTokenVault = await getAssociatedTokenAddress(
      tokenMint,
      curveAuthority,
      true
    );

    const buyerTokenAccount = await getAssociatedTokenAddress(
      tokenMint,
      buyerPublicKey
    );

    // Platform fee account (your wallet)
    const platformFeeAccount = new PublicKey(process.env.PLATFORM_WALLET_ADDRESS);

    // Execute buy
    const tx = await this.program.methods
      .buy(new BN(solAmount), new BN(minTokensOut))
      .accounts({
        buyer: buyerPublicKey,
        bondingCurve,
        curveAuthority,
        curveTokenVault,
        curveSolVault,
        buyerTokenAccount,
        platformFeeAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    // Get actual tokens received by querying account balance
    const accountInfo = await this.connection.getTokenAccountBalance(buyerTokenAccount);
    const tokensReceived = accountInfo.value.amount;

    return {
      signature: tx,
      tokensReceived: Number(tokensReceived),
    };
  }

  async sell(bondingCurveAddress, sellerPublicKey, tokenAmount, minSolOut) {
    // Similar to buy, but calls sell instruction
    const bondingCurve = new PublicKey(bondingCurveAddress);
    const curveState = await this.program.account.bondingCurve.fetch(bondingCurve);
    const tokenMint = curveState.tokenMint;

    const [curveAuthority] = PublicKey.findProgramAddressSync(
      [Buffer.from('curve_authority'), tokenMint.toBuffer()],
      this.program.programId
    );

    const [curveSolVault] = PublicKey.findProgramAddressSync(
      [Buffer.from('curve_sol_vault'), tokenMint.toBuffer()],
      this.program.programId
    );

    const curveTokenVault = await getAssociatedTokenAddress(
      tokenMint,
      curveAuthority,
      true
    );

    const sellerTokenAccount = await getAssociatedTokenAddress(
      tokenMint,
      sellerPublicKey
    );

    const platformFeeAccount = new PublicKey(process.env.PLATFORM_WALLET_ADDRESS);

    const tx = await this.program.methods
      .sell(new BN(tokenAmount), new BN(minSolOut))
      .accounts({
        seller: sellerPublicKey,
        bondingCurve,
        curveTokenVault,
        curveSolVault,
        sellerTokenAccount,
        platformFeeAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    // Calculate SOL received
    const solReceived = minSolOut; // Actual amount will be >= this

    return {
      signature: tx,
      solReceived: Number(solReceived),
    };
  }

  async getCurveState(bondingCurveAddress) {
    const bondingCurve = new PublicKey(bondingCurveAddress);

    // Fetch on-chain account data using Anchor
    const curveState = await this.program.account.bondingCurve.fetch(bondingCurve);

    return {
      virtualTokenReserves: curveState.virtualTokenReserves,
      virtualSolReserves: curveState.virtualSolReserves,
      realTokenReserves: curveState.realTokenReserves,
      realSolReserves: curveState.realSolReserves,
      totalSupply: curveState.totalSupply,
      isGraduated: curveState.isGraduated,
      tradeCount: curveState.tradeCount.toNumber(),
    };
  }
}

module.exports = AnchorClient;
```

### 8. Fix Frontend Integration

**File**: `frontend/src/lib/solana.ts`

Remove all simulation functions and implement real transactions:

```typescript
import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import IDL from '../idl/engagemint_bonding_curve.json';

// Initialize program
const provider = new AnchorProvider(connection, wallet as any, { commitment: 'confirmed' });
const program = new Program(IDL, BONDING_CURVE_PROGRAM_ID, provider);

export async function buyTokens({
  wallet,
  tokenMint,
  solAmount,
  slippage = 1,
}: BuyTokenParams): Promise<string> {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error('Wallet not connected');
  }

  // Derive bonding curve PDA
  const [bondingCurve] = PublicKey.findProgramAddressSync(
    [Buffer.from('bonding_curve'), tokenMint.toBuffer()],
    program.programId
  );

  // Fetch curve state to calculate expected tokens
  const curveState = await program.account.bondingCurve.fetch(bondingCurve);

  // Calculate expected tokens using constant product formula
  const solInLamports = solAmount * LAMPORTS_PER_SOL;
  const expectedTokens = calculateTokensOut(
    solInLamports,
    curveState.virtualSolReserves,
    curveState.virtualTokenReserves
  );
  const minTokens = Math.floor(expectedTokens * (1 - slippage / 100));

  // Derive other PDAs
  const [curveAuthority] = PublicKey.findProgramAddressSync(
    [Buffer.from('curve_authority'), tokenMint.toBuffer()],
    program.programId
  );

  const [curveSolVault] = PublicKey.findProgramAddressSync(
    [Buffer.from('curve_sol_vault'), tokenMint.toBuffer()],
    program.programId
  );

  // Get token accounts
  const curveTokenVault = await getAssociatedTokenAddress(
    tokenMint,
    curveAuthority,
    true
  );

  const buyerTokenAccount = await getAssociatedTokenAddress(
    tokenMint,
    wallet.publicKey
  );

  // Platform fee account
  const platformFeeAccount = new PublicKey(process.env.NEXT_PUBLIC_PLATFORM_WALLET!);

  // Build transaction
  const tx = await program.methods
    .buy(new BN(solInLamports), new BN(minTokens))
    .accounts({
      buyer: wallet.publicKey,
      bondingCurve,
      curveAuthority,
      curveTokenVault,
      curveSolVault,
      buyerTokenAccount,
      platformFeeAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  // Wait for confirmation
  await connection.confirmTransaction(tx, 'confirmed');

  return tx;
}

// Helper function for constant product formula
function calculateTokensOut(
  solIn: number,
  solReserves: BN,
  tokenReserves: BN
): number {
  const numerator = tokenReserves.mul(new BN(solIn));
  const denominator = solReserves.add(new BN(solIn));
  return numerator.div(denominator).toNumber();
}
```

### 9. Add Toast Notifications

**Install dependency**:
```bash
cd frontend
npm install react-hot-toast
```

**Update layout**:
```typescript
// frontend/src/app/layout.tsx
import { Toaster } from 'react-hot-toast';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
```

**Replace all alerts**:
```typescript
// OLD
alert('Buy successful!')

// NEW
import toast from 'react-hot-toast';

// Success
toast.success('Buy successful! 🎉');

// Error
toast.error('Transaction failed. Please try again.');

// Loading
const loadingToast = toast.loading('Processing transaction...');
// ... after transaction
toast.dismiss(loadingToast);
toast.success('Complete!');
```

### 10. Add Database Sync Columns

**Create migration file**: `backend/db-migrations/add-blockchain-sync.sql`

```sql
-- Add blockchain reference columns to tokens table
ALTER TABLE tokens
ADD COLUMN IF NOT EXISTS mint_address VARCHAR(44) UNIQUE,
ADD COLUMN IF NOT EXISTS bonding_curve_address VARCHAR(44),
ADD COLUMN IF NOT EXISTS curve_authority_address VARCHAR(44),
ADD COLUMN IF NOT EXISTS curve_sol_vault_address VARCHAR(44),
ADD COLUMN IF NOT EXISTS deployment_signature VARCHAR(88),
ADD COLUMN IF NOT EXISTS deployed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS is_graduated BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS real_sol_reserves BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS real_token_reserves BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS virtual_sol_reserves BIGINT DEFAULT 30000000000,
ADD COLUMN IF NOT EXISTS virtual_token_reserves BIGINT DEFAULT 1073000000000000,
ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP;

-- Add indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_tokens_mint_address ON tokens(mint_address);
CREATE INDEX IF NOT EXISTS idx_tokens_bonding_curve ON tokens(bonding_curve_address);
CREATE INDEX IF NOT EXISTS idx_tokens_graduated ON tokens(is_graduated);

-- Add similar columns to videos table
ALTER TABLE videos
ADD COLUMN IF NOT EXISTS token_mint_address VARCHAR(44),
ADD COLUMN IF NOT EXISTS bonding_curve_address VARCHAR(44),
ADD COLUMN IF NOT EXISTS is_minted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS minted_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_videos_token_mint ON videos(token_mint_address);
```

**Run migration**:
```bash
PGPASSWORD=your_password psql -h your_host -U your_user -d your_db -f backend/db-migrations/add-blockchain-sync.sql
```

### 11. Create Blockchain Sync Service

**Create file**: `backend/src/services/blockchainSync.js`

```javascript
const { query } = require('../config/database');
const solanaService = require('./solanaService');
const logger = require('../utils/logger');

class BlockchainSync {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
  }

  async start() {
    if (this.isRunning) {
      logger.warn('Blockchain sync already running');
      return;
    }

    this.isRunning = true;
    logger.info('🔄 Blockchain sync service started');

    // Run initial sync
    await this.syncActiveTokens();

    // Schedule recurring sync every 10 seconds
    this.intervalId = setInterval(() => {
      this.syncActiveTokens();
    }, 10000);
  }

  async syncActiveTokens() {
    try {
      // Get all non-graduated tokens with mint addresses
      const result = await query(`
        SELECT mint_address, bonding_curve_address
        FROM tokens
        WHERE mint_address IS NOT NULL
          AND is_graduated = false
        ORDER BY last_synced_at ASC NULLS FIRST
        LIMIT 10
      `);

      if (result.rows.length === 0) {
        return;
      }

      logger.info(`Syncing ${result.rows.length} tokens...`);

      for (const token of result.rows) {
        await this.syncToken(token.mint_address);
      }
    } catch (error) {
      logger.error('Blockchain sync error:', error);
    }
  }

  async syncToken(mintAddress) {
    try {
      // Fetch on-chain state
      const curveState = await solanaService.getBondingCurveState(mintAddress);
      const price = await solanaService.getTokenPrice(mintAddress);
      const marketCap = await solanaService.getMarketCap(mintAddress);

      // Update database
      await query(`
        UPDATE tokens
        SET current_price = $1,
            market_cap = $2,
            is_graduated = $3,
            real_sol_reserves = $4,
            real_token_reserves = $5,
            virtual_sol_reserves = $6,
            virtual_token_reserves = $7,
            last_synced_at = NOW()
        WHERE mint_address = $8
      `, [
        price,
        marketCap,
        curveState.isGraduated,
        curveState.realSolReserves,
        curveState.realTokenReserves,
        curveState.virtualSolReserves,
        curveState.virtualTokenReserves,
        mintAddress
      ]);

      logger.debug(`Synced ${mintAddress} - Price: ${price}, Graduated: ${curveState.isGraduated}`);

    } catch (error) {
      logger.error(`Failed to sync token ${mintAddress}:`, error);
    }
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    logger.info('🛑 Blockchain sync service stopped');
  }
}

module.exports = new BlockchainSync();
```

**Start in server.js**:
```javascript
// backend/src/server.js
const blockchainSync = require('./services/blockchainSync');

// After server starts
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  // Start blockchain sync
  blockchainSync.start();
});
```

### 12. Test End-to-End

**Testing checklist**:

```bash
# 1. Verify smart contract deployed
anchor deploy --provider.cluster devnet

# 2. Check program ID saved
echo $BONDING_CURVE_PROGRAM_ID

# 3. Test backend
cd backend
npm run dev

# Should see:
# ✅ Metaplex initialized
# ✅ Platform wallet loaded
# 🔄 Blockchain sync service started
# 🚀 Server running

# 4. Test frontend
cd frontend
npm run dev

# Navigate to http://localhost:3000
# Connect wallet
# Try to create a token
# Try to buy tokens

# 5. Verify on-chain
# Check Solscan for transactions
```

---

## 🎯 Final Checklist Before Production

- [ ] Smart contract deployed to devnet
- [ ] Program ID updated in all env files
- [ ] Backend price calculations fixed
- [ ] Anchor client using real program (not mocks)
- [ ] Frontend using real transactions (not simulations)
- [ ] Database has blockchain sync columns
- [ ] Blockchain sync service running
- [ ] Toast notifications implemented
- [ ] End-to-end test: Create token → Buy → Sell
- [ ] Monitor for errors
- [ ] Test with multiple users
- [ ] Verify DexScreener indexing (after Raydium migration)

---

## 🚨 Known Issues to Monitor

1. **RPC rate limits** - Use dedicated RPC provider (Helius, QuickNode)
2. **Transaction confirmation times** - May take 1-30 seconds
3. **Slippage errors** - Increase slippage if trades fail
4. **Wallet connection** - Some wallets buggy, test multiple
5. **Gas estimation** - May fail in rare cases, retry

---

## 📊 Success Metrics

**You'll know it's working when**:
- ✅ Token creation returns real Solana transaction signature
- ✅ Buy transaction shows up on Solscan
- ✅ User receives tokens in wallet
- ✅ Database updates with on-chain state
- ✅ Price calculations are correct
- ✅ Bonding curve graduates at 20 SOL
- ✅ Token appears on DexScreener after Raydium migration

---

*Last Updated: November 9, 2025*
*Status: Steps 1-2 complete, Step 3 in progress*
*Next: Complete Anchor build, deploy to devnet*
