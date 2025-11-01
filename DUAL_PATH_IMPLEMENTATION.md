# Dual-Path Implementation Guide
## PATH A: Instant Mint vs PATH B: Viral Auto-Launch

---

## 🎯 User Experience Flows

### PATH A: "MINT VIDEO!" - Premium Instant Token

**Step 1: Upload Interface**
```
User clicks "MINT VIDEO!" button
  ↓
Wallet connection modal appears
  → Connect Phantom/Solflare/Backpack
  ↓
Upload form with token details:
  - Video file
  - Token Name (e.g., "Epic Dance Token")
  - Token Symbol (e.g., "DANCE")
  - Description
  - Initial supply (default: 1M tokens)
  ↓
Cost display: "0.1 SOL (~$20)"
  ↓
User clicks "Mint & Upload"
  ↓
Wallet approval popup:
  "EngageMint wants to deduct 0.1 SOL
   for token creation and bonding curve"
  ↓
User approves
  ↓
Loading screen: "Creating your token on Solana..."
  ↓
Success: "Token created! Trading live now 🚀"
  → Video appears in feed
  → Token shows in trading modal
  → Bonding curve active
```

**Technical Flow:**
```javascript
// Frontend: MintInterface.tsx
1. User fills form
2. Check wallet.connected
3. Call initializeInstantToken({
     wallet,
     tokenName,
     tokenSymbol,
     videoFile,
     initialSupply: 1_000_000
   })
4. Solana transaction:
   - Create token mint
   - Initialize metadata
   - Create bonding curve pool
   - Fund pool with initial liquidity
5. Upload video to backend with mint_address
6. Backend stores: upload_path='instant', is_token_launched=true
7. Redirect to feed with new video
```

---

### PATH B: "POST VIDEO" - Free Viral Auto-Launch

**Step 1: Free Upload**
```
User clicks "POST VIDEO" button
  ↓
Simple upload form:
  - Video file
  - Title
  - Description
  - No wallet required!
  ↓
User clicks "Post"
  ↓
Video uploads to backend
  ↓
Success: "Video posted! 🎉"
  → Video appears in feed
  → No token yet
  → No trading available
```

**Step 2: Viral Growth**
```
Video goes live
  ↓
Users engage:
  - Likes
  - Comments
  - Shares
  - Views
  ↓
Likes counter: 9,500... 9,800... 9,950...
  ↓
🎯 HITS 10,000 LIKES!
  ↓
Backend viral monitor detects threshold
  ↓
Auto-launch sequence begins...
```

**Step 3: Automatic Token Launch**
```
Backend service triggers:
  ↓
Backend wallet signs transaction
  ↓
Solana smart contract:
  - Create token mint for video
  - Set creator as authority
  - Initialize bonding curve
  - Fund initial liquidity (backend pays)
  ↓
Database updates:
  - upload_path = 'viral'
  - is_token_launched = true
  - launched_by = 'backend'
  - token_mint_address = <address>
  ↓
Push notification to creator:
  "🚀 Your video went viral!
   A token was automatically created.
   Trading is now live!"
  ↓
Video shows "🔥 VIRAL - TOKEN LIVE" badge
  ↓
Users can now trade the token
```

**Technical Flow:**
```javascript
// Backend: viralMonitor.js
setInterval(async () => {
  // Check for viral videos
  const viralVideos = await db.query(`
    SELECT * FROM videos
    WHERE upload_path = 'viral'
      AND is_token_launched = false
      AND likes_count >= 10000
  `);

  for (const video of viralVideos) {
    await autoLaunchToken(video);
  }
}, 60000); // Check every minute

async function autoLaunchToken(video) {
  // 1. Backend wallet signs
  const backendWallet = loadKeypairFromEnv();

  // 2. Create token on Solana
  const { mint, signature } = await createViralToken({
    wallet: backendWallet,
    creatorPubkey: video.creator_wallet || null,
    videoId: video.id,
    tokenName: video.title,
    tokenSymbol: generateSymbol(video.title)
  });

  // 3. Update database
  await db.query(`
    UPDATE videos
    SET is_token_launched = true,
        token_mint_address = $1,
        launch_signature = $2,
        launched_by = 'backend',
        launch_timestamp = NOW()
    WHERE id = $3
  `, [mint.toString(), signature, video.id]);

  // 4. Notify creator
  await sendPushNotification(video.creator_id, {
    title: "🚀 Your video went viral!",
    body: "A token was auto-created. Start earning!"
  });

  // 5. Emit Socket.io event
  io.to(`video:${video.id}`).emit('token_launched', {
    mintAddress: mint.toString(),
    message: "Token trading is now live!"
  });
}
```

---

## 📱 Frontend Components Updates

### Updated MintInterface.tsx

```typescript
'use client';

import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Upload, Coins, TrendingUp } from 'lucide-react';

export default function MintInterface({ onClose }: { onClose: () => void }) {
  const wallet = useWallet();
  const [uploadPath, setUploadPath] = useState<'instant' | 'viral' | null>(null);

  // Path selection screen
  if (!uploadPath) {
    return (
      <div className="p-8 space-y-6">
        <h2 className="text-2xl font-bold text-white text-center">
          Choose Upload Path
        </h2>

        {/* PATH A: Instant Mint */}
        <button
          onClick={() => setUploadPath('instant')}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-2xl hover:scale-105 transition"
        >
          <div className="flex items-center gap-4">
            <Coins size={48} className="text-white" />
            <div className="text-left">
              <h3 className="text-xl font-bold text-white">MINT VIDEO!</h3>
              <p className="text-green-100 text-sm">Instant Token Creation</p>
            </div>
          </div>
          <div className="mt-4 space-y-2 text-left">
            <p className="text-white">✅ Token created instantly</p>
            <p className="text-white">✅ Trading enabled immediately</p>
            <p className="text-white">✅ Bonding curve launches now</p>
            <p className="text-white">✅ Guaranteed token</p>
          </div>
          <div className="mt-4 bg-white/20 rounded-lg p-3">
            <p className="text-white font-bold">Cost: 0.1 SOL (~$20)</p>
            <p className="text-green-100 text-sm">One-time deployment fee</p>
          </div>
        </button>

        {/* PATH B: Viral Auto-Launch */}
        <button
          onClick={() => setUploadPath('viral')}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-600 p-6 rounded-2xl hover:scale-105 transition"
        >
          <div className="flex items-center gap-4">
            <TrendingUp size={48} className="text-white" />
            <div className="text-left">
              <h3 className="text-xl font-bold text-white">POST VIDEO</h3>
              <p className="text-purple-100 text-sm">Free - Viral Threshold</p>
            </div>
          </div>
          <div className="mt-4 space-y-2 text-left">
            <p className="text-white">✅ Upload completely FREE</p>
            <p className="text-white">✅ No wallet required</p>
            <p className="text-white">✅ Auto-creates token at 10K likes</p>
            <p className="text-white">✅ Backend pays deployment</p>
          </div>
          <div className="mt-4 bg-white/20 rounded-lg p-3">
            <p className="text-white font-bold">Cost: FREE</p>
            <p className="text-purple-100 text-sm">Token launches when viral</p>
          </div>
        </button>

        <button
          onClick={onClose}
          className="w-full text-gray-400 hover:text-white py-3"
        >
          Cancel
        </button>
      </div>
    );
  }

  // PATH A: Instant Mint Flow
  if (uploadPath === 'instant') {
    return <InstantMintFlow onClose={onClose} />;
  }

  // PATH B: Free Post Flow
  return <FreePostFlow onClose={onClose} />;
}

function InstantMintFlow({ onClose }: { onClose: () => void }) {
  const wallet = useWallet();
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleInstantMint() {
    if (!wallet.connected) {
      alert('Please connect your wallet first');
      return;
    }

    setLoading(true);
    try {
      // Call Solana instant mint function
      const { mint, signature } = await instantMintToken({
        wallet,
        tokenName,
        tokenSymbol,
        videoFile,
      });

      alert(`Token created! 🚀\nMint: ${mint}\nSignature: ${signature}`);
      onClose();
    } catch (error) {
      console.error(error);
      alert('Minting failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 space-y-6">
      <h2 className="text-2xl font-bold text-white">Instant Mint</h2>

      {!wallet.connected ? (
        <div className="text-center">
          <p className="text-gray-400 mb-4">Connect wallet to continue</p>
          <WalletMultiButton />
        </div>
      ) : (
        <>
          <input
            type="text"
            value={tokenName}
            onChange={(e) => setTokenName(e.target.value)}
            placeholder="Token Name"
            className="w-full bg-gray-800 p-3 rounded-lg text-white"
          />
          <input
            type="text"
            value={tokenSymbol}
            onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())}
            placeholder="TOKEN"
            maxLength={10}
            className="w-full bg-gray-800 p-3 rounded-lg text-white"
          />
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
            className="w-full"
          />

          <div className="bg-green-500/10 border border-green-500 p-4 rounded-lg">
            <p className="text-white font-bold">Cost: 0.1 SOL</p>
            <p className="text-sm text-gray-300">Includes token + bonding curve deployment</p>
          </div>

          <button
            onClick={handleInstantMint}
            disabled={loading || !tokenName || !tokenSymbol || !videoFile}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-bold disabled:opacity-50"
          >
            {loading ? 'Minting...' : 'Mint Token & Upload'}
          </button>
        </>
      )}
    </div>
  );
}

function FreePostFlow({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleFreePost() {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('video', videoFile!);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('upload_path', 'viral');

      const token = localStorage.getItem('authToken');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/videos/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');

      alert('Video posted! 🎉\nWhen you hit 10K likes, a token will auto-launch!');
      onClose();
    } catch (error) {
      alert('Upload failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 space-y-6">
      <h2 className="text-2xl font-bold text-white">Post Video (Free)</h2>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Video Title"
        className="w-full bg-gray-800 p-3 rounded-lg text-white"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        className="w-full bg-gray-800 p-3 rounded-lg text-white"
        rows={3}
      />
      <input
        type="file"
        accept="video/*"
        onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
        className="w-full"
      />

      <div className="bg-purple-500/10 border border-purple-500 p-4 rounded-lg">
        <p className="text-white font-bold">✨ Completely FREE</p>
        <p className="text-sm text-gray-300">Token auto-launches at 10,000 likes</p>
        <p className="text-sm text-purple-300 mt-2">
          🎯 Current path to token: Get viral!
        </p>
      </div>

      <button
        onClick={handleFreePost}
        disabled={loading || !title || !videoFile}
        className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-lg font-bold disabled:opacity-50"
      >
        {loading ? 'Uploading...' : 'Post Video FREE'}
      </button>
    </div>
  );
}
```

---

## 🗄️ Database Schema

```sql
-- Update videos table for dual paths
ALTER TABLE videos
ADD COLUMN IF NOT EXISTS upload_path VARCHAR(20) DEFAULT 'viral' CHECK (upload_path IN ('instant', 'viral')),
ADD COLUMN IF NOT EXISTS token_mint_address VARCHAR(44),
ADD COLUMN IF NOT EXISTS bonding_curve_address VARCHAR(44),
ADD COLUMN IF NOT EXISTS viral_launch_threshold INTEGER DEFAULT 10000,
ADD COLUMN IF NOT EXISTS is_token_launched BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS launch_signature VARCHAR(88),
ADD COLUMN IF NOT EXISTS launched_by VARCHAR(20) CHECK (launched_by IN ('user', 'backend')),
ADD COLUMN IF NOT EXISTS launch_timestamp TIMESTAMP,
ADD COLUMN IF NOT EXISTS sol_paid_by_user DECIMAL(10, 9);

-- Track backend token launches
CREATE TABLE IF NOT EXISTS backend_token_launches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  mint_address VARCHAR(44) UNIQUE NOT NULL,
  bonding_curve_address VARCHAR(44) NOT NULL,
  launch_signature VARCHAR(88) NOT NULL,
  sol_spent DECIMAL(10, 9) NOT NULL,
  likes_at_launch INTEGER NOT NULL,
  viral_score_at_launch INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for efficient viral monitoring
CREATE INDEX IF NOT EXISTS idx_videos_viral_check
ON videos(upload_path, is_token_launched, likes_count)
WHERE upload_path = 'viral' AND is_token_launched = false;

-- Index for launched tokens
CREATE INDEX IF NOT EXISTS idx_videos_token_launched
ON videos(is_token_launched, token_mint_address)
WHERE is_token_launched = true;
```

---

## 🔧 Backend Implementation

### Viral Monitor Service

**`backend/src/services/viralMonitor.js`:**

```javascript
const { Connection, PublicKey, Keypair, SystemProgram } = require('@solana/web3.js');
const { AnchorProvider, Program, Wallet } = require('@coral-xyz/anchor');
const bs58 = require('bs58');
const pool = require('../config/database');

const VIRAL_THRESHOLD = parseInt(process.env.VIRAL_THRESHOLD) || 10000;
const CHECK_INTERVAL = 60000; // 1 minute

class ViralMonitor {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
    this.backendWallet = null;
  }

  async start() {
    if (this.isRunning) {
      console.log('Viral monitor already running');
      return;
    }

    // Load backend wallet
    const privateKeyBase58 = process.env.SOLANA_BACKEND_WALLET_PRIVATE_KEY;
    if (!privateKeyBase58) {
      console.error('⚠️  SOLANA_BACKEND_WALLET_PRIVATE_KEY not set - viral auto-launch DISABLED');
      return;
    }

    try {
      const privateKeyBytes = bs58.decode(privateKeyBase58);
      this.backendWallet = Keypair.fromSecretKey(privateKeyBytes);
      console.log(`🔑 Backend wallet loaded: ${this.backendWallet.publicKey.toString()}`);
    } catch (error) {
      console.error('Failed to load backend wallet:', error);
      return;
    }

    this.isRunning = true;
    console.log(`🔥 Viral monitor started (threshold: ${VIRAL_THRESHOLD} likes)`);

    // Check immediately
    await this.checkViralVideos();

    // Then check every minute
    this.intervalId = setInterval(() => this.checkViralVideos(), CHECK_INTERVAL);
  }

  async checkViralVideos() {
    try {
      // Find videos that hit viral threshold
      const result = await pool.query(`
        SELECT
          id,
          title,
          creator_id,
          likes_count,
          viral_score
        FROM videos
        WHERE upload_path = 'viral'
          AND is_token_launched = false
          AND likes_count >= $1
        ORDER BY likes_count DESC
        LIMIT 10
      `, [VIRAL_THRESHOLD]);

      if (result.rows.length === 0) {
        return; // No viral videos yet
      }

      console.log(`🎯 Found ${result.rows.length} viral videos ready for token launch`);

      for (const video of result.rows) {
        await this.autoLaunchToken(video);
      }
    } catch (error) {
      console.error('Error checking viral videos:', error);
    }
  }

  async autoLaunchToken(video) {
    console.log(`🚀 Auto-launching token for video: ${video.title} (${video.likes_count} likes)`);

    try {
      // Generate token symbol from title
      const tokenSymbol = this.generateSymbol(video.title);
      const tokenName = video.title.substring(0, 32);

      // Create token on Solana (implementation depends on smart contract)
      const { mintAddress, bondingCurveAddress, signature, solSpent } =
        await this.createTokenOnSolana({
          videoId: video.id,
          tokenName,
          tokenSymbol,
          creatorId: video.creator_id,
        });

      // Update database
      await pool.query(`
        UPDATE videos
        SET is_token_launched = true,
            token_mint_address = $1,
            bonding_curve_address = $2,
            launch_signature = $3,
            launched_by = 'backend',
            launch_timestamp = NOW()
        WHERE id = $4
      `, [mintAddress, bondingCurveAddress, signature, video.id]);

      // Record backend launch
      await pool.query(`
        INSERT INTO backend_token_launches (
          video_id,
          mint_address,
          bonding_curve_address,
          launch_signature,
          sol_spent,
          likes_at_launch,
          viral_score_at_launch
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        video.id,
        mintAddress,
        bondingCurveAddress,
        signature,
        solSpent,
        video.likes_count,
        video.viral_score
      ]);

      console.log(`✅ Token launched successfully!`);
      console.log(`   Mint: ${mintAddress}`);
      console.log(`   Signature: ${signature}`);
      console.log(`   Cost: ${solSpent} SOL`);

      // TODO: Send push notification to creator
      // TODO: Emit Socket.io event for real-time UI update

    } catch (error) {
      console.error(`Failed to auto-launch token for video ${video.id}:`, error);
    }
  }

  async createTokenOnSolana({ videoId, tokenName, tokenSymbol, creatorId }) {
    // This will be implemented with actual Solana program calls
    // For now, return mock data
    return {
      mintAddress: 'MOCK_MINT_ADDRESS',
      bondingCurveAddress: 'MOCK_CURVE_ADDRESS',
      signature: 'MOCK_SIGNATURE',
      solSpent: 0.036,
    };
  }

  generateSymbol(title) {
    // Generate 4-6 char symbol from title
    const cleaned = title.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (cleaned.length <= 6) return cleaned;

    // Take first letters of words
    const words = title.split(' ').map(w => w[0]).join('');
    return words.substring(0, 6);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('Viral monitor stopped');
  }
}

module.exports = new ViralMonitor();
```

**Update `backend/src/server.js`:**

```javascript
const viralMonitor = require('./services/viralMonitor');

// Start services
engagementTracker.start();
viralMonitor.start(); // Add this

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  engagementTracker.stop();
  viralMonitor.stop(); // Add this
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
```

---

## 🎨 UI/UX Considerations

### Visual Indicators

**For Instant Mint Videos (PATH A):**
- Show green "🟢 LIVE" badge
- Display "Trading Active" status
- Show current token price immediately

**For Free Post Videos (PATH B):**
- Before viral threshold:
  - Show progress: "8,547 / 10,000 likes to token launch"
  - Display percentage: "85% to token 🎯"
- After viral threshold:
  - Show gold "🔥 VIRAL" badge
  - Display "Token Launched!" notification
  - Enable trading UI

### Success Messages

**Instant Mint:**
```
🚀 Token Created Successfully!

Your token is now live on Solana!
• Mint Address: 7xKB...
• Trading: ENABLED
• Bonding Curve: ACTIVE

Start sharing your video to drive demand!
```

**Viral Auto-Launch:**
```
🎉 CONGRATULATIONS!

Your video went VIRAL!
🔥 10,000+ likes achieved

A token has been automatically created:
• Token: DANCE
• Trading: NOW LIVE
• You paid: $0 (we covered it!)

Start earning from trading fees now!
```

---

## 📊 Cost Analysis

### PATH A Economics
- **User pays:** 0.1 SOL upfront
- **Platform receives:** 0.064 SOL profit per mint
- **Solana cost:** ~0.036 SOL (rent + deployment)
- **Scaling:** Unlimited (users pay all costs)

### PATH B Economics
- **User pays:** $0
- **Platform pays:** 0.036 SOL per viral token
- **Monthly estimate:** 100 viral videos = 3.6 SOL (~$720 at $200/SOL)
- **Revenue recovery:** 1-2% trading fees on bonding curve
- **Break-even:** ~$36K trading volume per token

---

## ✅ Next Steps

1. Create Solana smart contracts (bonding curve + token factory)
2. Implement wallet adapter in frontend
3. Build InstantMintFlow component
4. Build FreePostFlow component
5. Create viralMonitor backend service
6. Add database migrations
7. Deploy to devnet
8. Test both paths end-to-end
9. Launch on mainnet

**Current Branch:** `ccm-engagemint-solana`
**Status:** In Progress - Dependencies Installed ✅
