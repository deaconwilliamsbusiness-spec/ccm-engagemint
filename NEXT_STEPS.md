# 🚀 ENGAGEMINT SOLANA - NEXT STEPS
**Date:** December 2, 2025

---

## ⚡ IMMEDIATE ACTIONS (DO THESE FIRST)

### 1. Apply Database Migration to Railway ✋ **CRITICAL**

The Solana columns don't exist in the database yet! You need to apply the migration.

**Step 1: Get Railway DATABASE_URL**
```bash
# Option A: Railway CLI
cd /root/ccm-engagemintbackend
railway variables | grep DATABASE_URL

# Option B: Railway Dashboard
# Go to: https://railway.app
# Project: CCM-Engagemint
# Tab: Variables
# Copy: DATABASE_URL value
```

**Step 2: Apply Migration**
```bash
# Once you have the DATABASE_URL, run:
export DATABASE_URL="postgresql://postgres:password@host:port/database"

# Apply the migration
psql $DATABASE_URL -f /root/ccm-engagemint/backend/src/scripts/add-solana-dual-path.sql

# You should see:
# ✅ Solana dual-path migration completed successfully!
# - PATH A: Instant Mint (user pays)
# - PATH B: Viral Auto-Launch (backend pays)
# - Viral threshold: 10,000 likes
```

**What This Adds:**
- `videos` table: 9 new Solana columns (upload_path, token_mint_address, etc.)
- `tokens` table: 2 new columns (mint_address, bonding_curve_address)
- `users` table: 1 new column (wallet_address)
- New table: `backend_token_launches` for tracking viral auto-launches
- 6 performance indexes

---

### 2. Test Basic Token Creation on Devnet 🧪

Before integrating with the UI, let's test that token creation actually works!

**Step 1: Switch to Devnet and Fund Wallet**
```bash
# Use the devnet wallet you already created
solana config set --url https://api.devnet.solana.com
solana config set --keypair ~/.config/solana/devnet-wallet.json

# Check address
solana address
# Should show: EKi3twpzQF74VK2xut7SV5ZuWyJh8kfGhfNSqut6F6Gt

# Airdrop devnet SOL (free!)
solana airdrop 2
solana airdrop 2
solana balance
# Should show: 4 SOL
```

**Step 2: Create Test Token Script**
```bash
cd /root/ccm-engagemint/backend
cat > test-token-creation.js << 'EOF'
const { Connection, Keypair } = require('@solana/web3.js');
const { createMint, getOrCreateAssociatedTokenAccount, mintTo } = require('@solana/spl-token');
const fs = require('fs');

async function testTokenCreation() {
  console.log('🧪 Testing Token Creation on Devnet\n');

  // Load devnet wallet
  const keypairData = JSON.parse(fs.readFileSync('/root/.config/solana/devnet-wallet.json'));
  const payer = Keypair.fromSecretKey(new Uint8Array(keypairData));

  console.log('Wallet:', payer.publicKey.toString());

  // Connect to devnet
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

  // Check balance
  const balance = await connection.getBalance(payer.publicKey);
  console.log('Balance:', balance / 1e9, 'SOL\n');

  if (balance < 0.1e9) {
    console.error('❌ Not enough SOL! Run: solana airdrop 2');
    return;
  }

  console.log('Creating token mint...');
  const startBalance = balance;

  // Create mint (same as viralMonitor.js does)
  const mint = await createMint(
    connection,
    payer,              // Payer
    payer.publicKey,    // Mint authority
    payer.publicKey,    // Freeze authority
    9                   // Decimals
  );

  console.log('✅ Mint created:', mint.toString());

  // Create token account
  console.log('Creating token account...');
  const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    payer.publicKey
  );

  console.log('✅ Token account:', tokenAccount.address.toString());

  // Mint 1M tokens
  console.log('Minting 1,000,000 tokens...');
  const signature = await mintTo(
    connection,
    payer,
    mint,
    tokenAccount.address,
    payer.publicKey,
    1_000_000 * 1e9  // 1M tokens with 9 decimals
  );

  console.log('✅ Minted! Signature:', signature);

  // Check cost
  const endBalance = await connection.getBalance(payer.publicKey);
  const cost = (startBalance - endBalance) / 1e9;

  console.log('\n📊 Cost Analysis:');
  console.log('SOL Spent:', cost.toFixed(4), 'SOL');
  console.log('USD Cost (at $200/SOL):', (cost * 200).toFixed(2), 'USD');
  console.log('\n✅ Token creation works! Ready for integration.');
  console.log('\nView on Solana Explorer:');
  console.log('https://explorer.solana.com/address/' + mint.toString() + '?cluster=devnet');
}

testTokenCreation().catch(console.error);
EOF

# Run the test
node test-token-creation.js
```

**Expected Output:**
```
🧪 Testing Token Creation on Devnet

Wallet: EKi3twpzQF74VK2xut7SV5ZuWyJh8kfGhfNSqut6F6Gt
Balance: 4 SOL

Creating token mint...
✅ Mint created: [some_address]
Creating token account...
✅ Token account: [some_address]
Minting 1,000,000 tokens...
✅ Minted! Signature: [signature]

📊 Cost Analysis:
SOL Spent: 0.0036 SOL
USD Cost (at $200/SOL): 0.72 USD

✅ Token creation works! Ready for integration.
```

This confirms:
- ✅ Backend wallet can create tokens
- ✅ Minting costs ~0.0036 SOL (~$0.72 on mainnet)
- ✅ viralMonitor.js will work when triggered

---

### 3. Update Backend .env for Devnet Testing

Let's test on devnet first before going to mainnet:

```bash
# Update backend/.env
cd /root/ccm-engagemint/backend
cat > .env << 'EOF'
# Server Configuration
PORT=5050
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database Configuration
DATABASE_URL=postgresql://postgres:password@host:port/database
# ☝️ UPDATE THIS with your Railway DATABASE_URL

# JWT Configuration
JWT_SECRET=ccm_engagemint_production_jwt_secret_ultra_secure_2025_key_minimum_32_chars
JWT_EXPIRE=7d

# Security
BCRYPT_ROUNDS=10

# ============================================
# SOLANA CONFIGURATION - DEVNET (TESTING)
# ============================================

# Devnet RPC (free, for testing)
SOLANA_RPC_URL=https://api.devnet.solana.com

# Backend Wallet - DEVNET wallet
# Get the private key base58:
# cd /root/ccm-engagemint/backend && node -e "const fs = require('fs'); const {default: bs58} = require('bs58'); const keypair = JSON.parse(fs.readFileSync('/root/.config/solana/devnet-wallet.json', 'utf-8')); console.log(bs58.encode(Buffer.from(keypair)));"

SOLANA_BACKEND_WALLET_PRIVATE_KEY=GET_THIS_FROM_COMMAND_ABOVE
# Public Key: EKi3twpzQF74VK2xut7SV5ZuWyJh8kfGhfNSqut6F6Gt

# Viral Auto-Launch Settings
VIRAL_THRESHOLD=100
# ☝️ LOWERED to 100 likes for easy testing!

VIRAL_CHECK_INTERVAL_MS=10000
# ☝️ Check every 10 seconds (faster for testing)

AUTO_LAUNCH_ENABLED=true
EOF

echo "\n✅ Backend .env updated for devnet testing"
echo "⚠️  Don't forget to update DATABASE_URL!"
```

Get the devnet wallet private key:
```bash
cd /root/ccm-engagemint/backend
node -e "const fs = require('fs'); const {default: bs58} = require('bs58'); const keypair = JSON.parse(fs.readFileSync('/root/.config/solana/devnet-wallet.json', 'utf-8')); console.log(bs58.encode(Buffer.from(keypair)));"

# Copy the output and paste it into SOLANA_BACKEND_WALLET_PRIVATE_KEY
```

**Update frontend/.env.local for devnet:**
```bash
cd /root/ccm-engagemint/frontend
cat > .env.local << 'EOF'
# API Backend URL
NEXT_PUBLIC_API_URL=http://localhost:5050

# ============================================
# SOLANA CONFIGURATION - DEVNET (TESTING)
# ============================================

# Devnet for testing
NEXT_PUBLIC_SOLANA_NETWORK=devnet

# Devnet RPC
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com

# PATH A: Instant Mint Cost (DEVNET - lower for testing)
NEXT_PUBLIC_INSTANT_MINT_COST_SOL=0.1
# ☝️ Only 0.1 SOL on devnet (free to get)

# PATH B: Viral Threshold (LOWERED for testing)
NEXT_PUBLIC_VIRAL_THRESHOLD=100
# ☝️ Only need 100 likes to trigger auto-launch

# Token Program IDs
NEXT_PUBLIC_TOKEN_PROGRAM_ID=11111111111111111111111111111111
NEXT_PUBLIC_BONDING_CURVE_PROGRAM_ID=11111111111111111111111111111111
EOF

echo "✅ Frontend .env.local updated for devnet testing"
```

---

## 📋 INTEGRATION CHECKLIST

### Phase 1: Database & Testing (30 minutes)
- [ ] Get Railway DATABASE_URL
- [ ] Apply Solana migration to Railway database
- [ ] Test token creation on devnet (run test script above)
- [ ] Update backend .env with devnet wallet
- [ ] Update frontend .env.local for devnet
- [ ] Airdrop 4 SOL to devnet wallet

### Phase 2: Backend Testing (30 minutes)
- [ ] Start backend: `cd backend && npm run dev`
- [ ] Check logs for "🔥 Viral Monitor Started"
- [ ] Check logs for "Backend wallet loaded successfully"
- [ ] Check backend wallet balance in logs
- [ ] Test health endpoint: `curl http://localhost:5050/api/health`

### Phase 3: Frontend UI Updates (2-3 hours)
- [ ] Update MintInterface - dual buttons ("MINT VIDEO!" vs "POST VIDEO")
- [ ] Update MintInterface - wallet connection for PATH A
- [ ] Update MintInterface - instant mint flow integration
- [ ] Update ReelsInterface - viral progress bar
- [ ] Update ReelsInterface - token badges
- [ ] Update SimplifiedTradingModal - real buy/sell functions

### Phase 4: End-to-End Testing (1 hour)
- [ ] Test PATH A: Upload with "MINT VIDEO!" button
- [ ] Test PATH B: Upload with "POST VIDEO" button
- [ ] Manually set video to 100 likes to trigger auto-launch
- [ ] Verify token creation in backend logs
- [ ] Test trading modal with real functions

### Phase 5: Production Deployment (1 hour)
- [ ] Switch backend .env to mainnet
- [ ] Switch frontend .env.local to mainnet
- [ ] Fund mainnet backend wallet (Gr4PTCaP5BDipPhmEa9515hZ2pKu4LDxMkYHKHt3soSx)
- [ ] Deploy backend to Railway
- [ ] Deploy frontend to Vercel
- [ ] Test on production with real SOL

---

## 🧪 TESTING STRATEGY

### Devnet Testing (SAFE - FREE SOL)
1. Set VIRAL_THRESHOLD=100 (easy to trigger)
2. Set INSTANT_MINT_COST_SOL=0.1 (cheap to test)
3. Airdrop free devnet SOL as needed
4. Test all flows multiple times
5. Fix any bugs

### Mainnet Testing (REAL MONEY)
1. Set VIRAL_THRESHOLD=10000 (production value)
2. Set INSTANT_MINT_COST_SOL=1.5 (production pricing)
3. Fund backend wallet with 5-10 SOL (~$1000-2000)
4. Test conservatively
5. Monitor costs closely

---

## 📞 WHAT TO DO NEXT (RIGHT NOW)

**Option A: I can help you get Railway DATABASE_URL**
- Guide you through Railway dashboard
- Apply the migration for you

**Option B: Test token creation first**
- Run the test script above
- Verify everything works
- Then do database migration

**Option C: Start with frontend UI**
- Update MintInterface with dual buttons
- Get the UI looking good
- Database migration can wait

**What would you like to do first?**

My recommendation: **Do them in order:**
1. Get DATABASE_URL → Apply migration (10 min)
2. Test token creation on devnet (15 min)
3. Update frontend UI components (2-3 hours)
4. End-to-end testing (1 hour)
5. Deploy to production (1 hour)

Total time: **~5-6 hours to full production deployment**

Let me know which step you want to start with!
