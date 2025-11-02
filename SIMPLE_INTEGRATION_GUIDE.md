# 🚀 ENGAGEMINT SOLANA - SIMPLE INTEGRATION (NO AIRDROPS)

**$1-2 fees • Mainnet ready • Production focused • No test airdrops**

---

## 💰 Cost Structure (Updated)

### PATH A: "MINT VIDEO!" (User Pays)
- **User pays:** 0.01 SOL (~$2 at $200/SOL)
- **Actual cost:** ~0.002 SOL (~$0.40)
- **Platform profit:** ~0.008 SOL (~$1.60) per mint

### PATH B: "POST VIDEO" (Backend Pays)
- **User pays:** FREE
- **Platform pays:** ~0.002 SOL (~$0.40) per viral token
- **Monthly cost (100 viral):** ~0.2 SOL (~$40)

---

## 📋 STEP-BY-STEP INTEGRATION (20 min)

### ⚡ STEP 1: Install Solana CLI (5 min)

```bash
# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Add to PATH
export PATH="/root/.local/share/solana/install/active_release/bin:$PATH"
echo 'export PATH="/root/.local/share/solana/install/active_release/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Verify
solana --version
```

**Expected:** `solana-cli 1.18.x`

---

### ⚡ STEP 2: Generate Backend Wallet (2 min)

```bash
# Generate wallet
solana-keygen new --outfile /root/backend-wallet.json --no-bip39-passphrase

# Save address
BACKEND_WALLET=$(solana-keygen pubkey /root/backend-wallet.json)
echo "Backend Wallet: $BACKEND_WALLET"
echo $BACKEND_WALLET > /root/backend-wallet-address.txt

# IMPORTANT: Save this address! You'll fund it later.
```

**⚠️ DO NOT FUND YET** - We'll use mainnet, not devnet airdrops

---

### ⚡ STEP 3: Apply Database Migration (2 min)

```bash
cd /root/ccm-engagemint/backend
psql $DATABASE_URL -f src/scripts/add-solana-dual-path.sql
```

**Verify:**
```bash
psql $DATABASE_URL -c "\d videos" | grep upload_path
```

**Expected:** Should show `upload_path` column

---

### ⚡ STEP 4: Configure Backend (3 min)

```bash
cd /root/ccm-engagemint/backend

# Get wallet key
WALLET_KEY=$(cat /root/backend-wallet.json | python3 -c "import sys, json; k=json.load(sys.stdin); print(','.join(map(str,k)))")

# Add to .env
cat >> .env << EOF

# Solana Configuration (MAINNET)
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_BACKEND_WALLET_PRIVATE_KEY=[$WALLET_KEY]
VIRAL_THRESHOLD=10000
VIRAL_CHECK_INTERVAL_MS=60000
AUTO_LAUNCH_ENABLED=false
EOF
```

**⚠️ NOTE:** `AUTO_LAUNCH_ENABLED=false` until you fund the wallet

---

### ⚡ STEP 5: Configure Frontend (2 min)

```bash
cd /root/ccm-engagemint/frontend

cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_INSTANT_MINT_COST_SOL=0.01
EOF
```

---

### ⚡ STEP 6: Start Backend (1 min)

```bash
cd /root/ccm-engagemint/backend
npm run dev
```

**Expected output:**
```
🚀 Server is running on port 5000
⚠️  SOLANA_BACKEND_WALLET_PRIVATE_KEY not set
   Viral auto-launch DISABLED
   (This is normal - will enable after funding)
```

**Leave running, open new terminal**

---

### ⚡ STEP 7: Start Frontend (1 min)

```bash
cd /root/ccm-engagemint/frontend
pkill -f "next dev"
npm run dev
```

**Open:** http://localhost:3000

**Expected:** App loads, no errors

---

### ⚡ STEP 8: Fund Backend Wallet (5 min)

**Now we'll add REAL SOL to the backend wallet for production.**

**Option A: From Your Wallet (Recommended)**

If you have a Solana wallet with SOL:

```bash
# Show backend wallet address
cat /root/backend-wallet-address.txt
```

**Send 0.1 SOL (~$20) to this address from:**
- Phantom wallet
- Solflare wallet
- Centralized exchange (Coinbase, Binance, etc.)

**Option B: Buy SOL First**

1. Go to Phantom.app or Solflare.com
2. Create wallet
3. Buy 0.2 SOL (~$40) via MoonPay/Ramp
4. Send 0.1 SOL to backend wallet address

**Verify funds arrived:**
```bash
solana balance $(cat /root/backend-wallet-address.txt) --url mainnet-beta
```

**Expected:** `0.1 SOL` or more

---

### ⚡ STEP 9: Enable Auto-Launch (1 min)

**Once wallet is funded:**

```bash
cd /root/ccm-engagemint/backend

# Enable auto-launch
sed -i 's/AUTO_LAUNCH_ENABLED=false/AUTO_LAUNCH_ENABLED=true/' .env

# Restart backend
pkill -f "node src/server.js"
npm run dev
```

**Expected output:**
```
🚀 Server is running on port 5000
🔑 Backend wallet loaded successfully
   Address: 7xKB...
   Balance: 0.1000 SOL
🔥 Viral Monitor Started
   Threshold: 10,000 likes
```

**✅ AUTO-LAUNCH NOW ACTIVE!**

---

### ⚡ STEP 10: Test PATH B (Viral Auto-Launch) (5 min)

**Create test video:**

```bash
psql $DATABASE_URL << 'EOF'
INSERT INTO videos (
  id,
  creator_id,
  title,
  description,
  video_url,
  upload_path,
  likes_count,
  viral_score,
  is_published
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM users ORDER BY created_at DESC LIMIT 1),
  'First Mainnet Viral Test',
  'Testing production auto-launch',
  '/uploads/test.mp4',
  'viral',
  10000,
  150,
  true
) RETURNING id, title, likes_count;
EOF
```

**Wait 60 seconds**

**Watch backend logs:**
```
🎯 Found 1 video(s) ready for auto-launch
🚀 AUTO-LAUNCHING TOKEN
   Creating token on Solana...
   ✓ Mint created: xyz123...
   ✓ Vault created: abc456...
   ✓ Tokens minted: def789...
✅ TOKEN LAUNCHED SUCCESSFULLY!
   SOL Spent: 0.002 SOL
```

**Verify on Solana Explorer:**
```bash
# Get the mint address from logs, then visit:
echo "https://solscan.io/token/YOUR_MINT_ADDRESS"
```

**Check database:**
```bash
psql $DATABASE_URL -c "SELECT title, is_token_launched, launched_by, token_mint_address FROM videos WHERE title = 'First Mainnet Viral Test';"
```

**Expected:**
```
is_token_launched = t
launched_by = backend
token_mint_address = xyz123...
```

**✅ PATH B WORKING ON MAINNET!**

---

## 🎉 SUCCESS! YOU'RE LIVE ON MAINNET!

### ✅ What's Working:
- [x] Backend wallet funded with real SOL
- [x] Viral auto-launch active on mainnet
- [x] Frontend configured for mainnet
- [x] Database ready
- [x] $1-2 fees configured (0.01 SOL)
- [x] Production ready

### 💰 Costs Summary:
- **Initial investment:** 0.1 SOL (~$20)
- **Per viral video:** ~0.002 SOL (~$0.40)
- **50 viral videos:** 0.1 SOL will last for ~50 launches
- **User instant mints:** 0.01 SOL (~$2) - they pay!

---

## 📊 Monitor Your Wallet

```bash
# Check balance anytime
solana balance $(cat /root/backend-wallet-address.txt) --url mainnet-beta

# Check how much spent
psql $DATABASE_URL -c "SELECT SUM(sol_spent) as total_spent FROM backend_token_launches;"

# Check launches count
psql $DATABASE_URL -c "SELECT COUNT(*) as total_launches FROM backend_token_launches;"
```

---

## 🔄 Adding More SOL When Needed

**When balance gets low (<0.02 SOL):**

```bash
# Check current balance
solana balance $(cat /root/backend-wallet-address.txt) --url mainnet-beta

# If low, send more:
# Send 0.1 SOL to: (get address below)
cat /root/backend-wallet-address.txt
```

**Set up alerts:**
```bash
# Add to backend .env
echo "WALLET_BALANCE_ALERT_THRESHOLD=0.02" >> .env
```

---

## 🎯 PATH A: Instant Mint (Requires Frontend Update)

**To enable instant minting ($2 fee):**

1. Update `MintInterface.tsx` with dual-path UI
2. Users connect Phantom/Solflare wallet
3. Users pay 0.01 SOL (~$2)
4. Token created instantly
5. Platform keeps 0.008 SOL (~$1.60) profit

**See:** `DUAL_PATH_IMPLEMENTATION.md` for complete code

---

## 🚀 Production Deployment

### Vercel (Frontend)
```bash
cd /root/ccm-engagemint/frontend

# Add env vars to Vercel dashboard:
# NEXT_PUBLIC_API_URL=https://your-backend.railway.app
# NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
# NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
# NEXT_PUBLIC_INSTANT_MINT_COST_SOL=0.01

# Deploy
vercel --prod
```

### Railway (Backend)
```bash
cd /root/ccm-engagemint/backend

# Add env vars to Railway dashboard:
# SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
# SOLANA_BACKEND_WALLET_PRIVATE_KEY=[your,wallet,key,array]
# AUTO_LAUNCH_ENABLED=true
# VIRAL_THRESHOLD=10000

# Deploy
git push railway main
```

---

## 📈 Economics (Real Numbers)

### Scenario: 100 viral videos/month

**Costs:**
- 100 videos × 0.002 SOL = 0.2 SOL (~$40/month)

**Revenue (if you charge trading fees):**
- 2% fee on $50K trading volume = $1,000/month
- **Net profit:** $960/month

### Scenario: 50 instant mints/month

**Revenue:**
- 50 mints × 0.008 SOL profit = 0.4 SOL (~$80/month)

**Total monthly:**
- **Costs:** $40 (viral)
- **Revenue:** $1,000 (trading) + $80 (mints) = $1,080
- **Net:** $1,040/month

---

## 🔒 Security Best Practices

### Backend Wallet Security:

```bash
# 1. Backup wallet
cp /root/backend-wallet.json /root/backend-wallet-BACKUP-$(date +%Y%m%d).json

# 2. Store backup securely (off-server)
# Download to your local machine

# 3. Consider hardware wallet for production
# Use Ledger to sign transactions (advanced)
```

### Monitor for unusual activity:

```bash
# Check recent transactions
solana transaction-history $(cat /root/backend-wallet-address.txt) --url mainnet-beta

# Alert if balance drops quickly
# (implement in monitoring system)
```

---

## 🐛 Troubleshooting

### "Insufficient funds" error
```bash
# Check balance
solana balance $(cat /root/backend-wallet-address.txt) --url mainnet-beta

# If low, add more SOL
```

### Auto-launch not working
```bash
# Check AUTO_LAUNCH_ENABLED
grep AUTO_LAUNCH_ENABLED /root/ccm-engagemint/backend/.env

# Should show: AUTO_LAUNCH_ENABLED=true

# Check wallet loaded
# Backend logs should show: "Backend wallet loaded successfully"
```

### RPC rate limiting
```bash
# Upgrade to premium RPC (recommended for production)
# Options:
# - Helius: https://helius.dev (free tier: 100 req/s)
# - QuickNode: https://quicknode.com (paid: $49/month)
# - Triton: https://triton.one (paid: $79/month)

# Update .env:
# SOLANA_RPC_URL=https://your-premium-rpc-url.com
```

---

## 📚 What You Have Now

### ✅ Fully Functional:
- Backend wallet funded with real SOL
- Viral auto-launch on mainnet
- Database schema ready
- Environment configured
- $1-2 fee structure
- Production-ready code

### 📝 Documentation:
- `DUAL_PATH_IMPLEMENTATION.md` - Full component code
- `SOLANA_IMPLEMENTATION_SUMMARY.md` - Complete integration
- `SOLANA_README.md` - Quick reference

---

## 🎯 Next Steps

**Immediate (This Week):**
1. ✅ PATH B working on mainnet
2. Update MintInterface.tsx for PATH A
3. Test instant minting with real wallet
4. Deploy to Vercel + Railway

**Short-term (This Month):**
1. Add trading fees (1-2%)
2. Implement bonding curve pricing
3. Add analytics dashboard
4. Monitor wallet balance

**Long-term (Next 3 Months):**
1. Custom Anchor programs
2. Advanced bonding curves
3. Liquidity pools
4. Token staking

---

## 💡 Pro Tips

1. **Start small** - 0.1 SOL is enough for 50 viral videos
2. **Monitor daily** - Check wallet balance every day
3. **Set alerts** - Get notified when balance < 0.02 SOL
4. **Use premium RPC** - Avoid rate limiting on mainnet
5. **Backup wallet** - Store backup offline safely
6. **Test thoroughly** - Use 1-2 test videos before going live

---

## 📞 Support

**Issues?**
1. Check backend logs
2. Verify wallet balance
3. Check database for errors
4. Review Solana Explorer for transactions

**Solana Explorer:**
- Mainnet: https://solscan.io
- Check your wallet: https://solscan.io/account/YOUR_ADDRESS
- Check transactions: https://solscan.io/tx/YOUR_SIGNATURE

---

**🎉 CONGRATULATIONS!**

**You're now running EngageMint on Solana mainnet with:**
- ✅ Real token creation ($0.40 cost)
- ✅ $2 user fees (0.01 SOL)
- ✅ Viral auto-launch working
- ✅ Production ready
- ✅ No test airdrops needed

**Status:** ✅ **LIVE ON MAINNET**

**Total setup time:** ~20 minutes
**Initial investment:** 0.1 SOL (~$20)
**Monthly costs:** ~$40 (for 100 viral videos)
