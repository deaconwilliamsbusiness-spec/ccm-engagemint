# EngageMint Implementation Fixes Plan

**Status**: Ready for Implementation
**Last Updated**: November 9, 2025
**Priority**: CRITICAL - Must fix before production launch

---

## Executive Summary

After comprehensive audit of frontend (4 components, 1,287 lines) and backend (3 route files, 897 lines), I've identified **22 issues** requiring fixes:

- **8 CRITICAL P0** (blocking production, security risks)
- **9 IMPORTANT P1** (UX blockers, incomplete features)
- **5 NICE-TO-HAVE P2** (polish, optimization)

**Estimated Implementation Time**: 6-8 hours for P0+P1

---

## CRITICAL P0 ISSUES (FIX IMMEDIATELY)

### 1. SQL Injection Vulnerability - tokens.js:454

**Location**: `backend/src/routes/tokens.js:454`

**Problem**:
```javascript
// VULNERABLE CODE
ORDER BY ${sortBy} ${order}
LIMIT $1 OFFSET $2
```

User-controlled `sortBy` and `order` parameters are directly interpolated into SQL query without validation.

**Attack Example**:
```bash
GET /api/tokens?sortBy=created_at;DROP+TABLE+users;--&order=DESC
```

**Fix**:
```javascript
// Add whitelist validation
const allowedSortFields = ['created_at', 'token_name', 'volume'];
const allowedOrder = ['ASC', 'DESC'];

if (!allowedSortFields.includes(sortBy)) {
  return res.status(400).json({
    success: false,
    message: 'Invalid sort field'
  });
}

if (!allowedOrder.includes(order.toUpperCase())) {
  return res.status(400).json({
    success: false,
    message: 'Invalid sort order'
  });
}

// Now safe to use
ORDER BY ${sortBy} ${order}
```

**Priority**: P0 - CRITICAL
**Time**: 15 minutes

---

### 2. SQL Injection Vulnerability - tokens.js:569

**Location**: `backend/src/routes/tokens.js:569`

**Problem**:
```javascript
// VULNERABLE CODE
AND recorded_at >= NOW() - INTERVAL '${hours} hours'
```

The `hours` variable is calculated from user input without proper validation.

**Fix**:
```javascript
// Whitelist timeframes
const timeRanges = {
  '1H': 1,
  '24H': 24,
  '7D': 168,
  '30D': 720,
};

const hours = timeRanges[timeframe];

if (!hours) {
  return res.status(400).json({
    success: false,
    message: 'Invalid timeframe. Must be 1H, 24H, 7D, or 30D'
  });
}

// Now safe - hours is guaranteed to be a number from whitelist
AND recorded_at >= NOW() - INTERVAL '${hours} hours'
```

**Priority**: P0 - CRITICAL
**Time**: 10 minutes

---

### 3. No Rate Limiting on Token Creation

**Location**: `backend/src/routes/tokens.js:37`

**Problem**: No rate limiting on `/api/tokens/create` endpoint. Malicious users could spam token creation, filling blockchain and database.

**Impact**:
- Spam tokens flooding platform
- Blockchain transaction spam
- Database bloat
- RPC costs skyrocket

**Fix**:
```javascript
const createTokenLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Max 5 token creations per hour per user
  message: 'Too many token creations. Please try again later.',
  keyGenerator: (req) => req.user.userId, // Rate limit by user, not IP
});

router.post('/create', createTokenLimiter, authenticate, async (req, res) => {
  // ... existing code
});
```

**Priority**: P0 - CRITICAL
**Time**: 10 minutes

---

### 4. No SOL Balance Validation (Frontend)

**Location**: `frontend/src/components/SolanaLaunchPopup.tsx:35`

**Problem**: Users can attempt to launch tokens without sufficient SOL balance. Transaction will fail with confusing error.

**Fix**:
```typescript
const handleLaunch = async () => {
  if (!wallet.connected) {
    alert('Please connect your wallet first');
    return;
  }

  // NEW: Check SOL balance
  try {
    const balance = await getSolBalance(wallet.publicKey);
    if (balance < totalCost) {
      alert(`Insufficient SOL. You need ${totalCost.toFixed(4)} SOL but only have ${balance.toFixed(4)} SOL`);
      return;
    }
  } catch (error) {
    alert('Failed to check wallet balance. Please try again.');
    return;
  }

  setIsLaunching(true);
  // ... rest of code
};
```

**Priority**: P0 - CRITICAL
**Time**: 15 minutes

---

### 5. Hardcoded Devnet in Solscan Links

**Location**: `frontend/src/components/PortfolioDashboard.tsx:213`

**Problem**:
```typescript
window.open(`https://solscan.io/token/${holding.mint_address}?cluster=devnet`, '_blank')
```

Hardcoded to devnet. Will show wrong network in production.

**Fix**:
```typescript
const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';
const clusterParam = network === 'mainnet-beta' ? '' : `?cluster=${network}`;
window.open(`https://solscan.io/token/${holding.mint_address}${clusterParam}`, '_blank');
```

**Also Fix**: `frontend/src/components/TradingInterface.tsx:304`

**Priority**: P0 - CRITICAL
**Time**: 10 minutes

---

### 6. Alert() Usage Instead of Proper UI

**Locations**:
- `frontend/src/components/TradingInterface.tsx:225, 281`
- `frontend/src/components/SolanaLaunchPopup.tsx:37, 47`
- `frontend/src/components/ReportPopup.tsx:31, 49, 52, 56`

**Problem**: Using browser `alert()` for user feedback. Terrible UX, blocks UI, looks unprofessional.

**Fix**: Implement toast notification system

**Step 1**: Install react-hot-toast
```bash
cd frontend
npm install react-hot-toast
```

**Step 2**: Add ToastProvider to layout
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

**Step 3**: Replace all alert() calls
```typescript
// OLD
alert('Buy successful!')

// NEW
import toast from 'react-hot-toast';
toast.success('Buy successful! 🎉');

// For errors
toast.error('Transaction failed. Please try again.');

// For loading
const loadingToast = toast.loading('Processing transaction...');
// ... after transaction
toast.dismiss(loadingToast);
toast.success('Complete!');
```

**Priority**: P0 - CRITICAL (UX blocker)
**Time**: 45 minutes

---

### 7. No Slippage Validation

**Location**: `backend/src/routes/tokens.js:164, 240`

**Problem**: Slippage parameter is not validated. Could be negative, > 100%, or non-numeric.

**Fix**:
```javascript
// In buy endpoint (line 164)
const { solAmount, slippage = 1 } = req.body;

// ADD VALIDATION
if (typeof slippage !== 'number' || slippage < 0 || slippage > 50) {
  return res.status(400).json({
    success: false,
    message: 'Invalid slippage. Must be between 0 and 50%'
  });
}

// Same for sell endpoint
```

**Priority**: P0 - CRITICAL
**Time**: 10 minutes

---

### 8. Simplified Price Calculation (Not Querying Curve)

**Location**: `frontend/src/components/TradingInterface.tsx:168`

**Problem**:
```typescript
// Simple calculation - in production, query actual bonding curve
const sol = parseFloat(solAmount);
const expectedTokens = (sol / price) * (1 - slippage / 100);
```

Using simplified linear calculation instead of querying actual bonding curve state. Will show **incorrect estimates** to users.

**Fix**: Create backend endpoint to calculate expected output

**Backend** (`backend/src/routes/tokens.js`):
```javascript
/**
 * POST /api/tokens/:mintAddress/calculate-buy
 * Calculate expected token output for SOL input
 */
router.post('/:mintAddress/calculate-buy', async (req, res) => {
  try {
    const { mintAddress } = req.params;
    const { solAmount, slippage = 1 } = req.body;

    // Query actual bonding curve
    const curveState = await solanaService.getBondingCurveState(mintAddress);

    // Calculate using actual bonding curve math
    const expectedTokens = calculateBuyOutput(
      curveState.realSolReserves,
      curveState.realTokenReserves,
      solAmount
    );

    const minTokens = expectedTokens * (1 - slippage / 100);

    res.json({
      success: true,
      data: {
        expectedTokens,
        minTokens,
        priceImpact: calculatePriceImpact(curveState, solAmount),
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Calculation failed' });
  }
});

// Similar endpoint for /calculate-sell
```

**Frontend**:
```typescript
// Replace calculateOutput function
const calculateOutput = useCallback(async () => {
  if (activeTab === 'buy' && solAmount) {
    try {
      const response = await fetch(`${API_URL}/tokens/${mintAddress}/calculate-buy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ solAmount: parseFloat(solAmount), slippage })
      });
      const data = await response.json();
      if (data.success) {
        setTokenAmount(data.data.expectedTokens.toFixed(2));
        setPriceImpact(data.data.priceImpact); // Show price impact to user
      }
    } catch (error) {
      console.error('Calculation failed:', error);
    }
  }
  // ... similar for sell
}, [activeTab, solAmount, tokenAmount, mintAddress, slippage]);
```

**Priority**: P0 - CRITICAL (incorrect data to users)
**Time**: 90 minutes

---

## IMPORTANT P1 ISSUES (FIX BEFORE LAUNCH)

### 9. No Duplicate Report Prevention

**Location**: `backend/src/routes/videos.js:108`

**Problem**: Same user can submit unlimited reports for same video, artificially inflating report count.

**Fix**:
```javascript
// Before inserting report, check for duplicate
const existingReport = await query(
  `SELECT id FROM video_reports
   WHERE video_id = $1 AND user_id = $2`,
  [videoId, userId]
);

if (existingReport.rows.length > 0) {
  return res.status(400).json({
    success: false,
    message: 'You have already reported this video'
  });
}

// Then insert
await query(
  `INSERT INTO video_reports (video_id, user_id, reason, created_at)
   VALUES ($1, $2, $3, NOW())`,
  [videoId, userId, reason]
);
```

**Priority**: P1 - IMPORTANT
**Time**: 10 minutes

---

### 10. No Report Reason Length Validation

**Location**: `backend/src/routes/videos.js:95`

**Problem**: Report reason could be megabytes of text, causing database/memory issues.

**Fix**:
```javascript
if (!reason || typeof reason !== 'string') {
  return res.status(400).json({
    success: false,
    message: 'Reason is required'
  });
}

// ADD LENGTH VALIDATION
if (reason.length > 500) {
  return res.status(400).json({
    success: false,
    message: 'Reason must be 500 characters or less'
  });
}
```

**Priority**: P1 - IMPORTANT
**Time**: 5 minutes

---

### 11. Incomplete Admin Check on Migration

**Location**: `backend/src/routes/tokens.js:619`

**Problem**: Comment says "TODO: Add admin check" but only checks creator. Migration should be admin-only or automated.

**Fix**:
```javascript
// Get token and check permissions
const tokenResult = await query(
  'SELECT creator_id FROM tokens WHERE mint_address = $1',
  [mintAddress]
);

if (!tokenResult.rows[0]) {
  return res.status(404).json({
    success: false,
    message: 'Token not found'
  });
}

// Check if user is admin OR if curve has reached threshold automatically
const userResult = await query(
  'SELECT is_admin FROM users WHERE id = $1',
  [req.user.userId]
);

const isAdmin = userResult.rows[0]?.is_admin;
const curveState = await solanaService.getBondingCurveState(mintAddress);

if (!isAdmin && curveState.realSolReserves < curveState.raydiumMigrationThreshold) {
  return res.status(403).json({
    success: false,
    message: 'Only admins can trigger manual migration'
  });
}
```

**Priority**: P1 - IMPORTANT
**Time**: 20 minutes

---

### 12. No Error Display When Portfolio Fetch Fails

**Location**: `frontend/src/components/PortfolioDashboard.tsx:61`

**Problem**: Errors are logged to console but user sees nothing. They'll think portfolio is loading forever.

**Fix**:
```typescript
const [error, setError] = useState<string | null>(null);

const fetchPortfolio = async () => {
  if (!user) return;

  setIsLoading(true);
  setError(null); // Clear previous errors

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/tokens/user/${user.id}/portfolio`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    if (data.success) {
      setPortfolio(data.data);
    } else {
      setError(data.message || 'Failed to load portfolio');
    }
  } catch (error) {
    console.error('Failed to fetch portfolio:', error);
    setError('Network error. Please check your connection.');
  } finally {
    setIsLoading(false);
  }
};

// Then display error in UI
{error && (
  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 m-4">
    <p className="text-red-400">{error}</p>
    <button
      onClick={fetchPortfolio}
      className="mt-2 text-sm underline"
    >
      Try Again
    </button>
  </div>
)}
```

**Priority**: P1 - IMPORTANT
**Time**: 15 minutes

---

### 13. No Environment Variable Validation (Backend)

**Location**: `backend/src/config/database.js`

**Problem**: If critical environment variables are missing, server starts but fails silently or with cryptic errors.

**Fix**: Create `backend/src/config/validateEnv.js`

```javascript
/**
 * Validate required environment variables on startup
 */
function validateEnv() {
  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
    'SOLANA_NETWORK',
    'RPC_URL',
    'BONDING_CURVE_PROGRAM_ID',
  ];

  const missing = [];

  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.error('\nPlease check your .env file');
    process.exit(1);
  }

  // Validate network value
  const validNetworks = ['devnet', 'testnet', 'mainnet-beta'];
  if (!validNetworks.includes(process.env.SOLANA_NETWORK)) {
    console.error(`❌ Invalid SOLANA_NETWORK: ${process.env.SOLANA_NETWORK}`);
    console.error(`   Must be one of: ${validNetworks.join(', ')}`);
    process.exit(1);
  }

  console.log('✅ Environment variables validated');
}

module.exports = { validateEnv };
```

Then call in `backend/src/server.js`:
```javascript
const { validateEnv } = require('./config/validateEnv');

// Call before anything else
validateEnv();

// ... rest of server setup
```

**Priority**: P1 - IMPORTANT
**Time**: 20 minutes

---

### 14. No Request Body Validation on Token Creation

**Location**: `backend/src/routes/tokens.js:39-47`

**Problem**: Only checks if fields exist, not if they're valid. Could have:
- Empty strings
- Extremely long strings (DoS)
- Special characters causing issues
- Invalid video IDs

**Fix**:
```javascript
// Enhanced validation
if (!tokenName || typeof tokenName !== 'string' || tokenName.trim().length === 0) {
  return res.status(400).json({
    success: false,
    message: 'Token name is required'
  });
}

if (tokenName.length > 32) {
  return res.status(400).json({
    success: false,
    message: 'Token name must be 32 characters or less'
  });
}

if (!tokenSymbol || typeof tokenSymbol !== 'string' || tokenSymbol.trim().length === 0) {
  return res.status(400).json({
    success: false,
    message: 'Token symbol is required'
  });
}

if (tokenSymbol.length > 10) {
  return res.status(400).json({
    success: false,
    message: 'Token symbol must be 10 characters or less'
  });
}

// Validate symbol is alphanumeric
if (!/^[A-Z0-9]+$/.test(tokenSymbol)) {
  return res.status(400).json({
    success: false,
    message: 'Token symbol must be uppercase letters and numbers only'
  });
}

// Verify video exists and belongs to user
const videoResult = await query(
  'SELECT creator_id, is_minted FROM videos WHERE id = $1',
  [videoId]
);

if (videoResult.rows.length === 0) {
  return res.status(404).json({
    success: false,
    message: 'Video not found'
  });
}

if (videoResult.rows[0].creator_id !== req.user.userId) {
  return res.status(403).json({
    success: false,
    message: 'You can only create tokens for your own videos'
  });
}

if (videoResult.rows[0].is_minted) {
  return res.status(400).json({
    success: false,
    message: 'This video already has a token'
  });
}
```

**Priority**: P1 - IMPORTANT
**Time**: 30 minutes

---

### 15. TradingInterface Missing mintAddress Validation

**Location**: `frontend/src/components/TradingInterface.tsx:50`

**Problem**: Component accepts mintAddress as string prop but doesn't validate it's a valid Solana address.

**Fix**:
```typescript
import { PublicKey } from '@solana/web3.js';

export function TradingInterface({
  mintAddress,
  tokenName,
  tokenSymbol,
  bondingCurveAddress,
  onClose
}: TradingInterfaceProps) {
  const wallet = useWallet();
  const [error, setError] = useState('');

  // Validate mint address on mount
  useEffect(() => {
    try {
      new PublicKey(mintAddress);
    } catch (err) {
      setError('Invalid token address');
      console.error('Invalid mint address:', mintAddress);
    }
  }, [mintAddress]);

  if (error === 'Invalid token address') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Invalid Token</h2>
          <p className="text-gray-400 mb-6">The token address is invalid.</p>
          {onClose && (
            <button onClick={onClose} className="px-6 py-3 bg-green-500 rounded-xl">
              Close
            </button>
          )}
        </div>
      </div>
    );
  }

  // ... rest of component
}
```

**Priority**: P1 - IMPORTANT
**Time**: 15 minutes

---

### 16. No Loading State for Chart Data

**Location**: `frontend/src/components/TradingInterface.tsx:398-446`

**Problem**: Chart shows "Loading chart..." but then could fail silently and show "No price data available yet" even if there was an error.

**Fix**:
```typescript
const [chartError, setChartError] = useState<string | null>(null);

const fetchPriceHistory = useCallback(async () => {
  setLoadingChart(true);
  setChartError(null); // Clear previous errors

  try {
    const response = await fetch(`${API_URL}/tokens/${mintAddress}/price-history?timeframe=${timeframe}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.success && data.data) {
      setPriceHistory(data.data);
    } else {
      setChartError('Failed to load chart data');
    }
  } catch (err) {
    console.error('Failed to fetch price history:', err);
    setChartError('Network error loading chart');
  } finally {
    setLoadingChart(false);
  }
}, [mintAddress, timeframe]);

// Then in render
{loadingChart ? (
  <div className="flex items-center justify-center h-full">
    <div className="text-gray-400">Loading chart...</div>
  </div>
) : chartError ? (
  <div className="flex flex-col items-center justify-center h-full text-gray-400">
    <p>{chartError}</p>
    <button
      onClick={fetchPriceHistory}
      className="mt-2 text-sm text-green-400 underline"
    >
      Retry
    </button>
  </div>
) : priceHistory.length > 0 ? (
  // ... chart SVG
) : (
  <div className="flex items-center justify-center h-full text-gray-400">
    No price data available yet
  </div>
)}
```

**Priority**: P1 - IMPORTANT
**Time**: 15 minutes

---

### 17. Missing Authorization Check on Portfolio Endpoint

**Location**: `backend/src/routes/tokens.js:488`

**Problem**: Code checks `req.user.userId !== userId` but userId comes from URL params as a string, while req.user.userId might be different type.

**Fix**:
```javascript
// Ensure type consistency
if (req.user.userId !== userId && !req.user.isAdmin) {
  return res.status(403).json({
    success: false,
    message: 'Unauthorized'
  });
}

// Also add check that userId is valid UUID
const { validate: isValidUUID } = require('uuid');

if (!isValidUUID(userId)) {
  return res.status(400).json({
    success: false,
    message: 'Invalid user ID format'
  });
}
```

**Priority**: P1 - IMPORTANT
**Time**: 10 minutes

---

## NICE-TO-HAVE P2 ISSUES (Polish)

### 18. Empty State When No Trades

**Location**: `frontend/src/components/TradingInterface.tsx:690-692`

**Problem**: Empty state is bland: "No trades yet"

**Improvement**:
```typescript
{tradeHistory.length === 0 ? (
  <div className="text-center py-8">
    <Activity className="w-12 h-12 text-gray-600 mx-auto mb-3" />
    <p className="text-gray-400">No trades yet</p>
    <p className="text-gray-500 text-sm mt-1">
      Be the first to trade this token!
    </p>
  </div>
) : (
  // ... trade list
)}
```

**Priority**: P2 - NICE-TO-HAVE
**Time**: 10 minutes

---

### 19. Optimize Chart Rendering

**Location**: `frontend/src/components/TradingInterface.tsx:404-441`

**Problem**: Chart recalculates min/max on every render. Should memoize.

**Fix**:
```typescript
const chartData = useMemo(() => {
  if (priceHistory.length === 0) return null;

  const prices = priceHistory.map(p => p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 1;

  const points = priceHistory.map((point, i) => {
    const x = (i / (priceHistory.length - 1)) * 800;
    const y = 200 - ((point.price - minPrice) / priceRange) * 180;
    return { x, y };
  });

  return {
    points,
    minPrice,
    maxPrice,
    priceRange
  };
}, [priceHistory]);

// Then use chartData.points in SVG
```

**Priority**: P2 - NICE-TO-HAVE
**Time**: 20 minutes

---

### 20. Add Transaction Confirmation Count

**Location**: `frontend/src/components/TradingInterface.tsx:183-230`

**Problem**: After transaction signature, no confirmation that transaction was successful on-chain.

**Improvement**: Wait for confirmation before showing success

```typescript
const handleBuy = async () => {
  // ... validation

  setLoading(true);
  setError('');

  try {
    const result = await buyTokens({
      wallet,
      tokenMint: new PublicKey(mintAddress),
      solAmount: parseFloat(solAmount),
      slippage,
    });

    // NEW: Wait for confirmation
    const connection = new Connection(RPC_URL);
    toast.loading('Waiting for confirmation...', { id: 'tx-confirm' });

    await connection.confirmTransaction(result, 'confirmed');

    toast.success('Transaction confirmed! 🎉', { id: 'tx-confirm' });

    // Add to trade history
    // ... rest of code
  } catch (err: any) {
    toast.error(err.message || 'Transaction failed');
    setError(err.message || 'Transaction failed');
  } finally {
    setLoading(false);
  }
};
```

**Priority**: P2 - NICE-TO-HAVE
**Time**: 15 minutes

---

### 21. Show Gas Estimate Before Transaction

**Location**: `frontend/src/components/SolanaLaunchPopup.tsx:154`

**Problem**: Network fee is hardcoded to 0.001 SOL estimate. Should calculate actual fee.

**Improvement**:
```typescript
const [estimatedFee, setEstimatedFee] = useState(0.001);

useEffect(() => {
  async function estimateFee() {
    if (!wallet.connected) return;

    try {
      // Simulate transaction to get actual fee
      const fee = await solanaService.estimateTokenCreationFee();
      setEstimatedFee(fee);
    } catch (error) {
      console.error('Fee estimation failed:', error);
      // Keep default 0.001
    }
  }

  estimateFee();
}, [wallet.connected]);
```

**Priority**: P2 - NICE-TO-HAVE
**Time**: 30 minutes

---

### 22. Add Refresh Button to Trading Interface

**Location**: `frontend/src/components/TradingInterface.tsx:294`

**Problem**: Data refreshes every 10 seconds automatically, but users can't manually refresh.

**Improvement**:
```typescript
<div className="flex items-center justify-between mb-8">
  <div>
    <h1 className="text-4xl font-bold mb-2">{tokenName}</h1>
    {/* ... */}
  </div>

  <div className="flex items-center gap-4">
    {/* NEW: Refresh Button */}
    <button
      onClick={() => {
        loadMarketData();
        loadBalances();
        fetchPriceHistory();
      }}
      disabled={loading}
      className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors disabled:opacity-50"
      title="Refresh data"
    >
      <RefreshCw className={`w-5 h-5 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
    </button>

    <WalletMultiButton />
    {/* ... */}
  </div>
</div>
```

**Priority**: P2 - NICE-TO-HAVE
**Time**: 10 minutes

---

## Implementation Order

### Phase 1: Security Critical (2 hours)
1. SQL injection fixes (Issues #1, #2) - 25 min
2. Rate limiting on token creation (Issue #3) - 10 min
3. Slippage validation (Issue #7) - 10 min
4. Request body validation (Issue #14) - 30 min
5. Environment validation (Issue #13) - 20 min
6. Authorization fixes (Issue #17) - 10 min
7. Report validation (Issues #9, #10) - 15 min

**Total: ~2 hours**

### Phase 2: UX Critical (2 hours)
1. Replace alert() with toast notifications (Issue #6) - 45 min
2. SOL balance validation (Issue #4) - 15 min
3. Hardcoded devnet fixes (Issue #5) - 10 min
4. Error display improvements (Issue #12) - 15 min
5. Chart error handling (Issue #16) - 15 min
6. Mint address validation (Issue #15) - 15 min

**Total: ~2 hours**

### Phase 3: Functionality Critical (2 hours)
1. Accurate price calculation from curve (Issue #8) - 90 min
2. Admin check on migration (Issue #11) - 20 min

**Total: ~2 hours**

### Phase 4: Polish (2 hours) - Optional
1. Empty state improvements (Issue #18) - 10 min
2. Chart optimization (Issue #19) - 20 min
3. Transaction confirmations (Issue #20) - 15 min
4. Gas estimate (Issue #21) - 30 min
5. Refresh button (Issue #22) - 10 min

**Total: ~2 hours**

---

## Testing Checklist

After implementing fixes, test each:

### Security Tests
- [ ] Try SQL injection in sortBy parameter
- [ ] Try SQL injection in timeframe parameter
- [ ] Attempt rapid token creation (should be rate-limited)
- [ ] Try negative slippage values
- [ ] Try slippage > 100%
- [ ] Submit duplicate reports (should be blocked)
- [ ] Submit 10,000 character report reason (should be rejected)
- [ ] Attempt token creation with empty name
- [ ] Attempt token creation with 100-character symbol

### UX Tests
- [ ] Buy tokens without sufficient SOL (should show clear error)
- [ ] Sell tokens without holding any (should show clear error)
- [ ] Network request fails (should show error, not hang forever)
- [ ] Click Solscan link on devnet (should open devnet Solscan)
- [ ] Click Solscan link on mainnet (should open mainnet Solscan)
- [ ] All success messages show as toast notifications
- [ ] All error messages show as toast notifications

### Functionality Tests
- [ ] Price calculation matches bonding curve exactly
- [ ] Buy 1 SOL worth, check output matches estimate
- [ ] Sell 1000 tokens, check output matches estimate
- [ ] Price chart loads correctly for all timeframes (1H, 24H, 7D, 30D)
- [ ] Portfolio shows accurate P&L
- [ ] Migration only works for admin or when threshold reached

---

## Environment Variable Checklist

Ensure these are set in all environments:

### Backend (.env)
```bash
# Database
DATABASE_URL=postgresql://...

# Auth
JWT_SECRET=your_secret_here

# Solana
SOLANA_NETWORK=devnet|testnet|mainnet-beta
RPC_URL=https://...
BONDING_CURVE_PROGRAM_ID=...

# Metaplex
METAPLEX_KEYPAIR_PATH=./keypairs/metaplex-keypair.json

# Server
PORT=5000
NODE_ENV=development|production
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOLANA_NETWORK=devnet|testnet|mainnet-beta
NEXT_PUBLIC_RPC_URL=https://...
NEXT_PUBLIC_BONDING_CURVE_PROGRAM_ID=...
```

---

## Completion Criteria

Ready for production when:

✅ All P0 issues fixed and tested
✅ All P1 issues fixed and tested
✅ Security audit passed (or scheduled)
✅ End-to-end user flow tested
✅ Environment variables configured for mainnet
✅ RPC provider set up with sufficient credits
✅ Database backups configured
✅ Error monitoring set up (Sentry, etc.)

---

## Next Steps After Fixes

1. **Deploy to Staging**: Test all fixes in staging environment
2. **Security Audit**: Engage Sec3 or similar for smart contract + backend audit
3. **Load Testing**: Simulate 100+ concurrent users
4. **Bug Bounty**: Offer rewards for finding issues
5. **Launch**: Deploy to mainnet with monitoring

---

**Total Implementation Time**: 6-8 hours for P0+P1
**Blocker Status**: 8 critical blockers identified
**Security Risk**: HIGH until P0 issues fixed
**Ready for Production**: NO (after fixes: YES)

---

*Generated: November 9, 2025*
*Status: Complete audit, ready for implementation*
