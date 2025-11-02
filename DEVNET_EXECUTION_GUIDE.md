# 🚀 DEVNET EXECUTION GUIDE - Zero Fluff

**What you need to launch EngageMint on devnet immediately**

---

## 🎯 CRITICAL FEATURES (In Order of Importance)

### 1. WALLET + FEE POPUP (MintInterface) ⚡ MOST CRITICAL

**What it does:**
- Shows popup BEFORE token launch
- User connects Phantom wallet
- User selects SOL amount (slider: 0.1 - 5 SOL)
- Shows fees clearly:
  - Platform fee: 1%
  - Solana network fee: ~0.001 SOL
  - Total cost displayed
- "Confirm & Launch" button calls Solana
- Actually mints token on-chain
- Returns mint address + bonding curve address
- Then uploads video to backend with addresses

**Files to modify:**
- `/frontend/src/components/MintInterface.tsx`

**Code additions needed:**
```typescript
// Add state
const [showSolanaPopup, setShowSolanaPopup] = useState(false)
const [solAmount, setSolAmount] = useState(0.1)

// Add popup component
<SolanaLaunchPopup
  isOpen={showSolanaPopup}
  onClose={() => setShowSolanaPopup(false)}
  solAmount={solAmount}
  setSolAmount={setSolAmount}
  tokenName={tokenName}
  tokenTicker={tokenTicker}
  onConfirm={handleSolanaMint}
/>

// Handle Solana mint
const handleSolanaMint = async () => {
  if (!wallet.connected) {
    alert('Connect wallet first')
    return
  }

  const result = await instantMintToken(
    wallet,
    tokenName,
    tokenTicker,
    description,
    solAmount
  )

  // Store mint result
  setMintResult(result)

  // Now upload video with mint addresses
  await uploadVideoWithMintData(result)
}
```

**Estimated time:** 30 minutes

---

### 2. PORTFOLIO DASHBOARD (New Page) 💼 HIGH PRIORITY

**What it does:**
- New tab in navigation
- Shows all tokens user holds
- Displays:
  - Token name + symbol
  - Amount held
  - Current price
  - Value in SOL
  - P&L (green/red)
  - Buy/Sell buttons
- Total portfolio value at top

**Files to create:**
- `/frontend/src/components/PortfolioDashboard.tsx`

**Files to modify:**
- `/frontend/src/app/page.tsx` (add portfolio tab)
- `/backend/src/routes/tokens.js` (add `/user/:userId/portfolio` endpoint)

**Backend API needed:**
```javascript
// GET /api/tokens/user/:userId/portfolio
router.get('/user/:userId/portfolio', authenticate, async (req, res) => {
  const holdings = await query(`
    SELECT
      t.token_name,
      t.token_symbol,
      t.mint_address,
      th.balance,
      t.current_price,
      (th.balance * t.current_price) as value_sol
    FROM token_holders th
    JOIN tokens t ON th.token_id = t.id
    WHERE th.user_id = $1 AND th.balance > 0
    ORDER BY value_sol DESC
  `, [req.params.userId])

  res.json({ success: true, data: holdings })
})
```

**Estimated time:** 45 minutes

---

### 3. PRICE CHARTS (TradingInterface) 📈 HIGH PRIORITY

**What it does:**
- Shows price chart in trading modal
- Time frames: 1H, 24H, 7D, 30D
- Uses Recharts library
- Fetches from `token_price_history` table
- Live updates via WebSocket

**Files to modify:**
- `/frontend/src/components/TradingInterface.tsx`
- `/frontend/package.json` (add recharts)

**Code to add:**
```typescript
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

// Fetch price history
const [priceHistory, setPriceHistory] = useState([])
const [timeframe, setTimeframe] = useState('24H')

useEffect(() => {
  fetch(`${API_URL}/tokens/${mintAddress}/price-history?timeframe=${timeframe}`)
    .then(res => res.json())
    .then(data => setPriceHistory(data))
}, [mintAddress, timeframe])

// Render chart
<ResponsiveContainer width="100%" height={200}>
  <LineChart data={priceHistory}>
    <XAxis dataKey="time" />
    <YAxis />
    <Tooltip />
    <Line type="monotone" dataKey="price" stroke="#10b981" />
  </LineChart>
</ResponsiveContainer>
```

**Backend API needed:**
```javascript
// GET /api/tokens/:mint/price-history
router.get('/:mint/price-history', async (req, res) => {
  const { timeframe = '24H' } = req.query
  const hours = timeframe === '1H' ? 1 : timeframe === '24H' ? 24 : 168

  const history = await query(`
    SELECT
      recorded_at as time,
      price
    FROM token_price_history
    WHERE mint_address = $1
      AND recorded_at >= NOW() - INTERVAL '${hours} hours'
    ORDER BY recorded_at ASC
  `, [req.params.mint])

  res.json({ success: true, data: history.rows })
})
```

**Estimated time:** 30 minutes

---

### 4. CONTENT MODERATION (Report Button) 🚨 MEDIUM PRIORITY

**What it does:**
- Report button on each video
- User clicks → popup asks "Why reporting?"
- Options: Spam, Offensive, Copyright, Other
- Sends report to backend
- Auto-hides video if 5+ reports
- Admin dashboard to review (future)

**Files to modify:**
- `/frontend/src/components/ReelsInterface.tsx`
- `/backend/src/routes/videos.js`

**Code to add:**
```typescript
// Frontend - ReelsInterface.tsx
const [showReportPopup, setShowReportPopup] = useState(false)

const handleReport = async (reason: string) => {
  await fetch(`${API_URL}/videos/${videoId}/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason })
  })
  alert('Reported. Thank you!')
  setShowReportPopup(false)
}

// Add button to video UI
<button onClick={() => setShowReportPopup(true)}>
  Report
</button>
```

**Backend API:**
```javascript
// POST /api/videos/:id/report
router.post('/:id/report', optionalAuth, async (req, res) => {
  const { reason } = req.body
  const userId = req.user?.id || null

  // Insert report
  await query(`
    INSERT INTO video_reports (video_id, user_id, reason)
    VALUES ($1, $2, $3)
  `, [req.params.id, userId, reason])

  // Check if >= 5 reports
  const count = await query(`
    SELECT COUNT(*) FROM video_reports WHERE video_id = $1
  `, [req.params.id])

  if (count.rows[0].count >= 5) {
    // Auto-hide
    await query(`
      UPDATE videos SET is_published = FALSE WHERE id = $1
    `, [req.params.id])
  }

  res.json({ success: true })
})
```

**Database migration needed:**
```sql
CREATE TABLE video_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id VARCHAR(255) NOT NULL,
  user_id UUID,
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Estimated time:** 20 minutes

---

### 5. DEVNET TESTING CHECKLIST ✅ CRITICAL

**Complete end-to-end flow:**

1. **Setup**
   - [ ] Anchor program deployed to devnet
   - [ ] Backend running with program ID in .env
   - [ ] Frontend running with program ID in .env.local
   - [ ] Database migrations run
   - [ ] Phantom wallet on devnet with SOL

2. **Test Token Launch (PATH A - Instant Mint)**
   - [ ] Navigate to /mint
   - [ ] Upload video
   - [ ] Fill token details (name, ticker, description)
   - [ ] Click "Mint & Post"
   - [ ] **Wallet popup appears** ✅
   - [ ] Connect Phantom wallet
   - [ ] Select SOL amount (0.1 - 5)
   - [ ] See fees displayed (1% + network fee)
   - [ ] Click "Confirm & Launch"
   - [ ] Phantom prompts for signature
   - [ ] Approve transaction
   - [ ] Wait for confirmation (~400ms)
   - [ ] See success message with mint address
   - [ ] Video uploads with mint data
   - [ ] Redirect to feed
   - [ ] Video appears in feed with token

3. **Test Trading**
   - [ ] Click on minted video
   - [ ] Trading modal opens
   - [ ] **Price chart displayed** ✅
   - [ ] Connect wallet if not connected
   - [ ] Enter buy amount (e.g., 0.1 SOL)
   - [ ] See estimated tokens
   - [ ] Click "Buy"
   - [ ] Approve transaction
   - [ ] Tokens received
   - [ ] Balance updated

4. **Test Portfolio**
   - [ ] Click "Portfolio" tab
   - [ ] **Dashboard shows holdings** ✅
   - [ ] See token list with balances
   - [ ] See current values
   - [ ] See P&L (green/red)
   - [ ] Click "Sell" on a token
   - [ ] Sell modal opens
   - [ ] Execute sell transaction

5. **Test Moderation**
   - [ ] View any video
   - [ ] Click "Report" button
   - [ ] Select reason
   - [ ] Submit report
   - [ ] See confirmation

6. **Database Verification**
   ```sql
   -- Check tokens created
   SELECT * FROM tokens ORDER BY created_at DESC LIMIT 5;

   -- Check trades
   SELECT * FROM token_trades ORDER BY created_at DESC LIMIT 10;

   -- Check view tracking
   SELECT * FROM video_view_events ORDER BY viewed_at DESC LIMIT 10;

   -- Check reports
   SELECT * FROM video_reports ORDER BY created_at DESC;
   ```

---

## 📋 IMPLEMENTATION ORDER (What to build first)

### Day 1 (3-4 hours)
1. ✅ Wallet + Fee Popup (30 min) - **MUST HAVE**
2. ✅ Update backend to receive mint addresses (15 min)
3. ✅ Test token launch end-to-end (30 min)
4. ✅ Portfolio Dashboard frontend (45 min)
5. ✅ Portfolio Dashboard backend API (30 min)
6. ✅ Test portfolio (15 min)

### Day 2 (2-3 hours)
1. ✅ Price Charts integration (30 min)
2. ✅ Price history backend API (20 min)
3. ✅ Test charts (10 min)
4. ✅ Content moderation UI (20 min)
5. ✅ Moderation backend + migration (30 min)
6. ✅ Full devnet testing (60 min)

---

## 🚨 CRITICAL FILES TO MODIFY

### Frontend
1. `/frontend/src/components/MintInterface.tsx` - Add wallet popup
2. `/frontend/src/components/PortfolioDashboard.tsx` - NEW FILE
3. `/frontend/src/components/TradingInterface.tsx` - Add price charts
4. `/frontend/src/components/ReelsInterface.tsx` - Add report button
5. `/frontend/src/app/page.tsx` - Add portfolio tab

### Backend
1. `/backend/src/routes/tokens.js` - Add portfolio + price history endpoints
2. `/backend/src/routes/videos.js` - Add report endpoint
3. `/backend/src/controllers/videoController.js` - Handle mint addresses

### Database
1. `/backend/db-migrations/add-moderation.sql` - NEW FILE

---

## 💰 SOL AMOUNT LOGIC

**For wallet popup:**
- Minimum: 0.1 SOL
- Maximum: 5 SOL (prevent over-spending)
- Slider with presets: 0.1, 0.5, 1, 2, 5
- Calculate fees:
  - Platform fee: 1% of SOL
  - Network fee: ~0.001 SOL (estimate)
  - Total = SOL amount + (SOL * 0.01) + 0.001

**Example:**
```
User selects: 1 SOL
Platform fee: 0.01 SOL (1%)
Network fee: 0.001 SOL
Total cost: 1.011 SOL
```

---

## ✅ SUCCESS CRITERIA

You'll know it's working when:

1. **Wallet popup appears** before token launch
2. **Phantom connects** and shows balance
3. **Transaction succeeds** on-chain (~400ms)
4. **Mint address returned** from Solana
5. **Video uploads** with mint data
6. **Token appears** in portfolio
7. **Price chart shows** in trading modal
8. **Report button works** on videos

---

## 🎯 WHAT DO YOU WANT ME TO CODE FIRST?

Tell me which feature to implement and I'll code it perfectly:

A. Wallet + Fee Popup (MintInterface) - **30 min**
B. Portfolio Dashboard - **45 min**
C. Price Charts (TradingInterface) - **30 min**
D. Content Moderation - **20 min**
E. All of the above - **2-3 hours total**

**OR** should I:
- Just give you the code snippets for each?
- Build everything and commit?
- Build one piece at a time for you to review?

**Your call - no fluff, just execution.** 🚀
