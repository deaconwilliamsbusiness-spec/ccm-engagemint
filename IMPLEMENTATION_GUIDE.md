# ENGAGEMINT.MEME - Implementation Guide

## 🎯 Current Status

### ✅ What's Working
- Video upload system (local + in-memory storage)
- User authentication (signup/login)
- Feed interface with video playback
- Mock trading interface (UI only)
- Mock community features (UI only)
- Frontend dev server running on port 3000
- Backend API server running on port 5000

### ❌ What's Missing (Critical)
- **NO Solana integration** - no wallet, no blockchain
- **NO real token minting** - "MINT" just uploads video
- **NO bonding curve** - trading is fake
- **NO on-chain token-gating** - community access is mocked
- **NO creator fees** - no monetization flow
- **NO IPFS/Arweave** - videos stored locally only

---

## 🚀 PHASE 1: Blockchain Foundation (START HERE)

### Objective
Get wallet connection working and test minting a simple SPL token.

### Prerequisites
```bash
# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Install Anchor (for smart contracts)
cargo install --git https://github.com/coral-xyz/anchor avm --locked
avm install latest
avm use latest
```

### Step 1.1: Install Solana Dependencies

```bash
cd /root/ccm-engagemint/frontend

npm install \
  @solana/web3.js@^1.95.0 \
  @solana/spl-token@^0.4.0 \
  @solana/wallet-adapter-base@^0.9.0 \
  @solana/wallet-adapter-react@^0.15.0 \
  @solana/wallet-adapter-react-ui@^0.9.0 \
  @solana/wallet-adapter-wallets@^0.19.0 \
  @project-serum/anchor@^0.30.0 \
  bs58@^5.0.0
```

### Step 1.2: Set up Wallet Provider

**Create `/frontend/src/components/WalletProvider.tsx`**:
```typescript
'use client'

import { useMemo } from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { clusterApiUrl } from '@solana/web3.js'

require('@solana/wallet-adapter-react-ui/styles.css')

export function SolanaWalletProvider({ children }: { children: React.ReactNode }) {
  // Use devnet for testing
  const network = WalletAdapterNetwork.Devnet
  const endpoint = useMemo(() => clusterApiUrl(network), [network])

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  )

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
```

**Wrap app in `/frontend/src/app/page.tsx`**:
```typescript
import { SolanaWalletProvider } from '@/components/WalletProvider'

export default function Home() {
  return (
    <SolanaWalletProvider>
      <PasswordGate>
        <AuthPage>
          {/* ... existing content ... */}
        </AuthPage>
      </PasswordGate>
    </SolanaWalletProvider>
  )
}
```

### Step 1.3: Create Wallet Connect Button

**Create `/frontend/src/components/WalletButton.tsx`**:
```typescript
'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

export function WalletButton() {
  const { publicKey, connected } = useWallet()

  return (
    <div className="flex items-center gap-4">
      <WalletMultiButton className="!bg-green-500 !rounded-xl" />
      {connected && publicKey && (
        <div className="text-white text-sm">
          {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
        </div>
      )}
    </div>
  )
}
```

**Add to header in MintInterface.tsx**:
```typescript
import { WalletButton } from './WalletButton'

// In the header section:
<div className="flex items-center justify-between">
  <WalletButton />
  {/* ... rest of header ... */}
</div>
```

### Step 1.4: Test Wallet Connection

1. Start the app
2. Install Phantom wallet extension
3. Create devnet wallet
4. Get devnet SOL from faucet: https://faucet.solana.com/
5. Click "Connect Wallet" button
6. Approve connection
7. Verify wallet address shows in UI

---

## 🪙 PHASE 2: Simple Token Minting

### Objective
Mint a basic SPL token when user clicks "Post Content".

### Step 2.1: Create Token Minting Utility

**Create `/frontend/src/lib/solana/tokenMint.ts`**:
```typescript
import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js'
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID
} from '@solana/spl-token'

export async function mintContentToken(
  connection: Connection,
  payer: Keypair,
  creator: PublicKey,
  tokenName: string,
  tokenSymbol: string,
  supply: number = 1_000_000_000 // 1 billion tokens
): Promise<{ mintAddress: string, transactionSignature: string }> {

  // 1. Create mint account
  const mint = await createMint(
    connection,
    payer, // Fee payer
    creator, // Mint authority
    null, // Freeze authority (null = can't freeze)
    6 // Decimals
  )

  // 2. Get creator's token account (auto-creates if needed)
  const creatorTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    creator
  )

  // 3. Mint 10% of supply to creator (100M tokens)
  const creatorAmount = supply * 0.1 * Math.pow(10, 6) // Adjust for decimals
  const signature = await mintTo(
    connection,
    payer,
    mint,
    creatorTokenAccount.address,
    creator,
    creatorAmount
  )

  return {
    mintAddress: mint.toBase58(),
    transactionSignature: signature
  }
}
```

### Step 2.2: Modify MintInterface to Mint Token

**Update `/frontend/src/components/MintInterface.tsx`**:
```typescript
import { useWallet, useConnection } from '@solana/wallet-adapter-react'

export function MintInterface({ onBack, setActiveTab }: MintInterfaceProps) {
  const { publicKey, signTransaction } = useWallet()
  const { connection } = useConnection()

  // ... existing state ...

  const handleMint = async () => {
    if (!publicKey) {
      alert('Please connect your wallet first')
      return
    }

    setIsUploading(true)
    setUploadError('')

    try {
      // 1. Upload video to backend (existing code)
      const { videoAPI } = await import('@/lib/api')
      const mainMedia = media[0]

      // Upload returns video ID
      const uploadResponse = await videoAPI.upload(
        mainMedia.file,
        null,
        tokenName,
        description,
        tokenTicker
      )

      const videoId = uploadResponse.data.video.id

      // 2. Mint SPL token
      const { mintContentToken } = await import('@/lib/solana/tokenMint')

      const { mintAddress, transactionSignature } = await mintContentToken(
        connection,
        // NOTE: For now we need a payer keypair - in production this would be your platform wallet
        platformKeypair, // TODO: Set this up
        publicKey,
        tokenName,
        tokenTicker
      )

      console.log('Token minted!', mintAddress)
      console.log('Transaction:', transactionSignature)

      // 3. Update backend with token address
      await videoAPI.updateTokenAddress(videoId, mintAddress)

      // Success! Go to feed
      setActiveTab('feed')

    } catch (error: any) {
      console.error('Mint error:', error)
      setUploadError(error.message || 'Failed to mint token')
    } finally {
      setIsUploading(false)
    }
  }

  // ... rest of component ...
}
```

### Step 2.3: Update Backend to Store Token Address

**Modify `/backend/src/models/VideoMemory.js`**:
```javascript
class VideoMemory {
  static async create({ creatorId, title, description, videoUrl, thumbnailUrl, duration, category }) {
    const video = {
      // ... existing fields ...
      token_mint: null, // Add this - will be updated after minting
      bonding_curve: null, // For future use
    }
    videos.push(video)
    return video
  }

  static async updateTokenAddress(videoId, tokenMint) {
    const video = videos.find(v => v.id === videoId)
    if (video) {
      video.token_mint = tokenMint
    }
    return video
  }
}
```

**Add route in `/backend/src/routes/videos.js`**:
```javascript
router.patch('/:id/token', authenticate, async (req, res) => {
  try {
    const { tokenMint } = req.body
    const video = await Video.updateTokenAddress(req.params.id, tokenMint)
    res.json({ success: true, data: { video } })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update token address' })
  }
})
```

---

## 🎢 PHASE 3: Bonding Curve Smart Contract

### Objective
Create Anchor program for bonding curve trading.

### Step 3.1: Initialize Anchor Project

```bash
cd /root/ccm-engagemint
mkdir -p solana-programs
cd solana-programs

# Initialize Anchor project
anchor init engagemint-bonding-curve
cd engagemint-bonding-curve
```

### Step 3.2: Define Program

**Edit `programs/engagemint-bonding-curve/src/lib.rs`**:
```rust
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("YOUR_PROGRAM_ID_HERE"); // Will be generated

#[program]
pub mod engagemint_bonding_curve {
    use super::*;

    pub fn initialize_curve(
        ctx: Context<InitializeCurve>,
        base_price: u64,
        total_supply: u64,
    ) -> Result<()> {
        let curve = &mut ctx.accounts.bonding_curve;
        curve.token_mint = ctx.accounts.token_mint.key();
        curve.vault = ctx.accounts.vault.key();
        curve.creator = ctx.accounts.creator.key();
        curve.base_price = base_price;
        curve.total_supply = total_supply;
        curve.supply_sold = 0;
        curve.creator_fee_bps = 200; // 2%
        curve.platform_fee_bps = 100; // 1%
        Ok(())
    }

    pub fn buy_tokens(ctx: Context<BuyTokens>, sol_amount: u64) -> Result<()> {
        let curve = &ctx.accounts.bonding_curve;

        // Calculate tokens to receive
        let tokens_out = calculate_buy_amount(
            curve.base_price,
            curve.supply_sold,
            curve.total_supply,
            sol_amount
        )?;

        // Calculate fees
        let creator_fee = sol_amount * curve.creator_fee_bps / 10000;
        let platform_fee = sol_amount * curve.platform_fee_bps / 10000;
        let net_amount = sol_amount - creator_fee - platform_fee;

        // Transfer SOL to vault, creator, and platform
        // ... transfer logic ...

        // Transfer tokens to buyer
        // ... token transfer logic ...

        // Update curve state
        let curve = &mut ctx.accounts.bonding_curve;
        curve.supply_sold += tokens_out;

        Ok(())
    }

    pub fn sell_tokens(ctx: Context<SellTokens>, token_amount: u64) -> Result<()> {
        // Similar to buy but in reverse
        // ... implementation ...
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeCurve<'info> {
    #[account(init, payer = creator, space = 8 + BondingCurve::LEN)]
    pub bonding_curve: Account<'info, BondingCurve>,
    pub token_mint: Account<'info, TokenAccount>,
    pub vault: Account<'info, TokenAccount>,
    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct BuyTokens<'info> {
    #[account(mut)]
    pub bonding_curve: Account<'info, BondingCurve>,
    #[account(mut)]
    pub buyer: Signer<'info>,
    #[account(mut)]
    pub buyer_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub vault: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct BondingCurve {
    pub token_mint: Pubkey,
    pub vault: Pubkey,
    pub creator: Pubkey,
    pub base_price: u64,
    pub total_supply: u64,
    pub supply_sold: u64,
    pub creator_fee_bps: u16,
    pub platform_fee_bps: u16,
}

impl BondingCurve {
    pub const LEN: usize = 32 + 32 + 32 + 8 + 8 + 8 + 2 + 2;
}

// Helper function for bonding curve math
fn calculate_buy_amount(
    base_price: u64,
    supply_sold: u64,
    total_supply: u64,
    sol_amount: u64
) -> Result<u64> {
    // Bonding curve formula: P = BASE * (1 + SOLD/TOTAL)^2
    // This is simplified - real implementation needs precise math
    let price_per_token = base_price * (1 + supply_sold / total_supply).pow(2);
    Ok(sol_amount / price_per_token)
}
```

### Step 3.3: Build and Deploy

```bash
# Build program
anchor build

# Get program ID
solana address -k target/deploy/engagemint_bonding_curve-keypair.json

# Update declare_id! in lib.rs with the program ID

# Deploy to devnet
anchor deploy --provider.cluster devnet
```

---

## 🎯 INTEGRATION CHECKLIST

### Frontend Checklist
- [ ] Solana dependencies installed
- [ ] Wallet provider configured
- [ ] Wallet button in UI
- [ ] Token minting function created
- [ ] MintInterface calls token mint
- [ ] Transaction confirmation shown

### Backend Checklist
- [ ] Token address field in database
- [ ] API endpoint to update token address
- [ ] Video queries include token data

### Smart Contract Checklist
- [ ] Anchor installed
- [ ] Program initialized
- [ ] Bonding curve logic implemented
- [ ] Buy/sell functions working
- [ ] Deployed to devnet
- [ ] Integration tests passing

---

## 🧪 TESTING GUIDE

### Test Token Minting

1. Connect wallet (devnet)
2. Ensure you have devnet SOL
3. Upload a video
4. Click "Post Content"
5. Sign transaction
6. Check Solana Explorer for transaction: https://explorer.solana.com/?cluster=devnet
7. Verify token mint address created
8. Check your wallet - you should see new token

### Test Bonding Curve Trading

1. Go to Trading Modal
2. Enter SOL amount
3. Click "Buy"
4. Sign transaction
5. Check token balance increased
6. Try selling tokens
7. Verify SOL returned

---

## 🐛 COMMON ISSUES

### "Wallet not connected"
- Install Phantom wallet
- Switch to devnet
- Click connect

### "Insufficient SOL for transaction"
- Get devnet SOL: https://faucet.solana.com/
- Need ~0.1 SOL for minting

### "Transaction failed"
- Check RPC endpoint (use custom RPC if public is slow)
- Verify program is deployed
- Check account ownership

### "Token not showing in wallet"
- Refresh wallet
- Manually import token using mint address
- Check on Solana Explorer

---

## 📚 RESOURCES

### Documentation
- Solana Web3.js: https://solana-labs.github.io/solana-web3.js/
- SPL Token: https://spl.solana.com/token
- Anchor: https://www.anchor-lang.com/
- Wallet Adapter: https://github.com/solana-labs/wallet-adapter

### Tools
- Solana Explorer: https://explorer.solana.com/
- Devnet Faucet: https://faucet.solana.com/
- Anchor CLI: https://www.anchor-lang.com/docs/cli

### Examples
- Pump.fun (inspiration): https://pump.fun
- SPL Token examples: https://github.com/solana-labs/solana-program-library
- Bonding curve math: https://yos.io/2018/11/10/bonding-curves/

---

## 🚦 NEXT STEPS

After Phase 3 is complete:

1. **Phase 4**: IPFS integration for decentralized video storage
2. **Phase 5**: Token-gated community access
3. **Phase 6**: Creator dashboard and analytics
4. **Phase 7**: Mainnet deployment

---

This guide provides a clear path from current state to fully functional blockchain integration. Focus on one phase at a time, test thoroughly, and iterate.
