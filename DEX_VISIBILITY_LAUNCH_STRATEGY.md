# DEX Visibility & Launch Strategy Guide
## Getting EngageMint Tokens on DexScreener, BirdEye & DEXTools

**Target**: Make all EngageMint tokens (including $EMINT) visible on major DEX aggregators
**Timeline**: Immediate setup for mainnet launch
**Platforms**: DexScreener, BirdEye, DEXTools, Jupiter, CoinGecko, CMC

---

## 1. How DEX Aggregators Work

### Automatic Detection

DEX screeners like DexScreener **automatically index** Solana tokens when they detect:

1. **Liquidity Pool Creation** on a supported DEX (Raydium, Orca, etc.)
2. **Trading Activity** (buys/sells happening)
3. **Metadata** (proper token name, symbol, image)

**You don't need to apply or pay** - it's automatic once liquidity exists.

### Supported DEXs on Solana

✅ **Raydium** (Most important - what you're using)
✅ Orca
✅ Jupiter (aggregator)
✅ Phoenix
✅ Lifinity

**Your bonding curve → Raydium migration** is the key trigger.

---

## 2. Making Tokens Visible on DexScreener

### Step 1: Deploy with Proper Metadata

**Your Metaplex metadata must include**:

```json
{
  "name": "EngageMint",
  "symbol": "EMINT",
  "description": "The first memecoin launchpad to launch their own token for the community",
  "image": "https://arweave.net/your-logo-hash",
  "external_url": "https://engagemint.meme",
  "twitter": "https://twitter.com/engagemint",
  "telegram": "https://t.me/engagemint",
  "discord": "https://discord.gg/engagemint"
}
```

**Critical fields for DexScreener**:
- `name` - Shows as token name
- `symbol` - Shows as ticker
- `image` - Token logo (needs to be on Arweave/IPFS)
- `external_url` - Links to your website
- Socials - Shows social links on DexScreener page

### Step 2: Create Raydium Pool

**When your bonding curve graduates** (reaches 85 SOL), it should:

1. Create Raydium AMM pool
2. Deposit liquidity (SOL + tokens)
3. Burn LP tokens (permanent liquidity lock)

**This triggers DexScreener indexing within 1-5 minutes.**

### Step 3: Initial Trading Volume

DexScreener prioritizes tokens with:
- At least 10 unique traders
- $1000+ volume in first hour
- Consistent trading activity

**Your 200 video launch strategy** naturally creates this ✅

---

## 3. Launch Strategy: $EMINT + 200 Videos

### Phase 1: $EMINT Platform Token (Day 1)

#### Pre-Launch (1 week before)

**1. Build Hype**:
```
Twitter/X:
"We're the FIRST launchpad to launch OUR OWN token on our platform.
No VC presale. No ICO. Pure bonding curve.
Launch: [DATE]"

- Post daily countdown
- Show platform demos
- Tease features
- Build Discord/Telegram community
```

**2. Prepare Marketing Assets**:
- Professional logo (512x512 PNG)
- Banner images for socials
- 30-60 second explainer video
- Whitepaper / Litepaper
- Press release draft

**3. Technical Setup**:
```bash
# Upload $EMINT logo to Arweave
arweave upload logo.png

# Get Arweave URL (permanent)
# https://arweave.net/abc123...

# Update metadata with Arweave logo URL
# Deploy $EMINT token with full metadata
```

#### Launch Day (Hour 0-6)

**Hour 0: Token Creation**
```
1. Admin creates $EMINT via EngageMint platform (dogfooding!)
2. Initial video: "We're launching $EMINT RIGHT NOW"
3. Post everywhere: Twitter, Discord, Telegram

Template:
"🚀 $EMINT IS LIVE

The first launchpad token launched on its own platform.

Contract: [Solana Address]
Buy: https://engagemint.meme/token/emint

We're eating our own dog food. This is how you build trust. 🐕"
```

**Hour 0-1: Family & Friends Wave 1**
```
- 50 people buy $EMINT (small amounts: 0.1-1 SOL each)
- Each person posts on social media
- Creates organic FOMO
- Bonding curve fills up gradually
```

**Hour 1-3: Community Buys**
```
- Announce in Discord/Telegram
- Post trading activity screenshots
- Show bonding curve progress
- "62% to Raydium!"
```

**Hour 3-6: Raydium Graduation**
```
- Bonding curve reaches 85 SOL
- Automatic migration to Raydium
- LP tokens burned
- DexScreener indexing begins
- Post: "🎉 $EMINT GRADUATED TO RAYDIUM
  Liquidity locked forever. Now this is real."
```

#### Post-Launch (Day 1-7)

**Immediate**:
- Share DexScreener link everywhere
- Post volume milestones
- Engage with community constantly
- Daily AMAs

**First Week**:
- Get listed on CoinGecko (apply after 2-3 days)
- Get listed on CoinMarketCap (apply after 1 week)
- Partnerships announcements
- Influencer outreach

### Phase 2: 200 Video Flood (Day 2-7)

#### The Strategy

**Why this works**:
1. Shows platform is ACTIVE (not ghost town)
2. Each video = new token = trading opportunity
3. More tokens = more visibility on DexScreener (trending)
4. Network effects kick in
5. Press writes about you ("200 tokens in first week")

#### Execution Plan

**Day 2-3: 50 Videos**
```
Friends & Family upload:
- Music videos
- Comedy sketches
- Crypto memes
- Dance challenges
- Gaming clips

All high-quality, engaging content.
Each video hits 10K likes threshold (coordinate with group).
```

**Day 4-5: 75 Videos**
```
Expand to:
- Community members
- Small influencers (paid or partnership)
- Local creators

Incentive: "First 100 creators get whitelisted for future perks"
```

**Day 6-7: 75 Videos**
```
Open to public, but curated:
- Application process
- Quality check
- No spam/scam content

By now, organic users are joining.
```

#### Quality Control

**Critical**: These 200 videos must be GOOD
- No low-effort content
- No spam
- No scams
- Represent the brand well

**Each token should**:
1. Graduate to Raydium naturally (organic buying)
2. Maintain healthy trading volume
3. Have active community

**Goal**: Show investors "This platform WORKS. People are making money."

---

## 4. Getting on Major Platforms

### DexScreener (Automatic)

**Timeline**: 1-5 minutes after Raydium pool creation

**What happens**:
1. Raydium pool created
2. DexScreener bot detects new pool
3. Fetches token metadata
4. Creates token page: `dexscreener.com/solana/YOUR_TOKEN_ADDRESS`
5. Appears in "New Pairs" feed

**Boost visibility**:
- Pin to profile (DexScreener feature)
- Get upvotes (community engagement)
- High volume = trending section
- Paid promotion ($500-2000 for featured spot)

### BirdEye (Automatic)

**Timeline**: 5-15 minutes after Raydium pool

**Features**:
- More detailed analytics than DexScreener
- Wallet tracking
- Token security score
- Holder distribution

**Same process**: Automatic indexing once Raydium pool exists.

### Jupiter (Automatic)

**Timeline**: Instant

**Jupiter aggregates** all Solana DEXs, so your token is automatically tradeable through Jupiter once on Raydium.

**Best swap route**: `jupiter.ag/swap/SOL-YOUR_TOKEN`

### CoinGecko (Application Required)

**Timeline**: 1-2 weeks after application

**Requirements**:
- Token on a tracked DEX (Raydium ✅)
- Proper metadata
- Website
- Socials (Twitter/X minimum)
- Active trading for 2-3 days
- Non-zero liquidity

**Apply**: https://www.coingecko.com/en/coins/new

**Form needs**:
- Contract address
- Project details
- Website
- Logo (200x200 transparent PNG)
- Socials
- Market cap / volume data

**Tips**:
- Wait 2-3 days after launch (need volume history)
- Professional presentation
- Response time: 7-14 days

### CoinMarketCap (Application Required)

**Timeline**: 2-4 weeks

**Requirements** (stricter than CoinGecko):
- All CoinGecko requirements +
- At least $2500 daily volume for 7 days
- Circulating supply data
- Max supply data
- Detailed project information

**Apply**: https://coinmarketcap.com/request/

**Self-Reported Listing** (faster):
- Costs $2,999 one-time
- Guaranteed listing within 2 weeks
- Includes priority support
- Worth it for credibility

---

## 5. Technical Implementation Checklist

### Smart Contract Level

```rust
// In your bonding curve contract - ensure these are set:
pub token_name: String,    // "EngageMint"
pub token_symbol: String,  // "EMINT"
pub token_uri: String,     // Arweave metadata URL
```

### Metadata JSON (Host on Arweave)

```json
{
  "name": "EngageMint",
  "symbol": "EMINT",
  "description": "First memecoin launchpad to launch their own token for the community. Fair launch via bonding curve. Built on Solana.",
  "image": "https://arweave.net/YOUR_LOGO_HASH",
  "external_url": "https://engagemint.meme",
  "attributes": [
    {
      "trait_type": "Launch Type",
      "value": "Bonding Curve"
    },
    {
      "trait_type": "Platform",
      "value": "EngageMint"
    },
    {
      "trait_type": "Total Supply",
      "value": "1,000,000,000"
    }
  ],
  "properties": {
    "category": "currency",
    "files": [
      {
        "uri": "https://arweave.net/YOUR_LOGO_HASH",
        "type": "image/png"
      }
    ]
  },
  "twitter": "https://twitter.com/engagemint",
  "telegram": "https://t.me/engagemint",
  "discord": "https://discord.gg/engagemint",
  "website": "https://engagemint.meme"
}
```

### Upload to Arweave (Using Irys)

```javascript
// backend/src/services/metaplexService.js
async function uploadMetadataToArweave(metadata) {
  const metaplexInstance = await initializeMetaplex();

  // Upload JSON
  const { uri } = await metaplexInstance.storage().uploadJson(metadata);

  console.log(`Metadata uploaded: ${uri}`);
  return uri; // https://arweave.net/abc123...
}
```

### Logo Requirements

**File specs**:
- Format: PNG (transparent background)
- Size: 512x512 pixels minimum
- Max file size: 1MB
- Square ratio (1:1)

**Design tips**:
- Simple, memorable
- Looks good at small sizes (32x32)
- Unique color scheme
- Professional quality

### Create Raydium Pool (After Bonding Curve Graduation)

```javascript
// backend/src/services/raydiumIntegration.js
async function createRaydiumPool(tokenMint, bondingCurveState) {
  const raydium = await initializeRaydium();

  // Create CPMM (Constant Product Market Maker) pool
  const pool = await raydium.createCpmmPool({
    token0: tokenMint,
    token1: NATIVE_SOL_MINT,
    token0Amount: bondingCurveState.realTokenReserves,
    token1Amount: bondingCurveState.realSolReserves,
    startTime: Math.floor(Date.now() / 1000),
  });

  console.log(`Raydium pool created: ${pool.poolId}`);

  // Burn LP tokens (lock liquidity forever)
  await burnLPTokens(pool.lpMint);

  return pool;
}
```

---

## 6. SEO & Discovery Optimization

### On-Chain Discoverability

**Ensure your tokens are tagged**:

```rust
// Add tags to metadata
"tags": ["meme", "community", "social", "video", "viral"]
```

**DexScreener indexes tags** → better search results

### Website SEO

**EngageMint.meme homepage**:
```html
<meta name="description" content="First memecoin launchpad to launch on its own platform. Fair launches via bonding curves. Built on Solana.">
<meta name="keywords" content="solana, memecoin, launchpad, bonding curve, fair launch, crypto, web3">

<!-- Open Graph for social sharing -->
<meta property="og:title" content="EngageMint - First Self-Launched Launchpad">
<meta property="og:description" content="We're the first launchpad to launch our own token on our platform.">
<meta property="og:image" content="https://engagemint.meme/og-image.jpg">
<meta property="og:url" content="https://engagemint.meme">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="EngageMint - $EMINT Now Live">
<meta name="twitter:description" content="First launchpad to launch on its own platform. Fair launch bonding curve.">
<meta name="twitter:image" content="https://engagemint.meme/twitter-card.jpg">
```

### Social Media Strategy

**Twitter/X**:
- Post every milestone (10 SOL, 20 SOL, 50 SOL, Raydium graduation)
- Share holder screenshots
- Retweet community content
- Daily updates

**Telegram**:
- Price bot posting buys/sells
- Community chat
- Announcements channel

**Discord**:
- Token holders channel (verify with wallet)
- General chat
- Support
- Trading signals

---

## 7. Monitoring & Analytics

### Track Your Tokens

**DexScreener API**:
```javascript
// Check if token is indexed
const response = await fetch(
  `https://api.dexscreener.com/latest/dex/tokens/${tokenMintAddress}`
);
const data = await response.json();

console.log(`DexScreener indexed: ${data.pairs.length > 0}`);
console.log(`Liquidity: $${data.pairs[0].liquidity.usd}`);
console.log(`24h Volume: $${data.pairs[0].volume.h24}`);
```

**Solscan API**:
```javascript
// Track holders
const holders = await fetch(
  `https://public-api.solscan.io/token/holders?tokenAddress=${tokenMint}`
);
```

**Jupiter API**:
```javascript
// Check if token is tradeable on Jupiter
const quote = await fetch(
  `https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=${tokenMint}&amount=1000000000`
);

// If 200 OK, token is indexed and tradeable
```

### Dashboard for EngageMint Tokens

**Build admin dashboard**:
- All tokens created on platform
- Which are graduated (on Raydium)
- Which are indexed on DexScreener
- Trading volumes
- Holder counts

**Alert when**:
- New token graduates
- Token reaches $100K market cap
- Unusual trading activity

---

## 8. Cost Breakdown

### Token Deployment Costs

**Per Token**:
- Mint account creation: ~0.002 SOL
- Metadata upload (Arweave): ~0.001 SOL
- Bonding curve initialization: ~0.002 SOL
- **Total**: ~0.005 SOL (~$1 @ $200/SOL)

**For 200 Videos**:
- 200 tokens × 0.005 SOL = 1 SOL
- **Cost**: ~$200

### Raydium Pool Creation

**Per Token**:
- Pool initialization: ~0.5 SOL
- LP tokens burn transaction: ~0.000005 SOL

**Note**: This is paid from bonding curve accumulated SOL, not your wallet.

### Marketing Costs

**Minimum (Organic)**:
- Logo design: $100-500 (or free if you design)
- Social media: Free
- Community building: Time
- **Total**: $100-500

**Recommended**:
- Logo + branding: $500-1000
- Website: $0 (you have it)
- Social media manager: $1000-2000/month
- Influencer outreach: $5000-10,000
- DexScreener featured: $500-2000
- **Total**: $7,000-15,000 for launch month

**Aggressive**:
- Everything above +
- CoinMarketCap fast track: $2,999
- Crypto PR agency: $10,000-30,000
- KOL partnerships: $20,000-50,000
- **Total**: $40,000-100,000

### Expected ROI

**Conservative** (200 tokens, 1000 SOL volume per day):
- 1% fee = 10 SOL/day revenue
- 300 SOL/month = $60,000/month @ $200/SOL
- Break-even on $40K marketing: < 1 month

**Aggressive** (1000 tokens, 5000 SOL volume per day):
- 1% fee = 50 SOL/day revenue
- 1500 SOL/month = $300,000/month
- Break-even on $100K marketing: < 2 weeks

---

## 9. Example Launch Timeline

### Week -1 (Pre-Launch)

**Monday-Wednesday**: Final dev work
- Deploy smart contract to mainnet
- Test $EMINT token creation
- Verify Raydium migration works

**Thursday-Friday**: Marketing prep
- Design logo
- Create social accounts
- Write announcements
- Build Discord/Telegram

**Saturday-Sunday**: Community building
- Post teasers
- Grow Discord
- Answer questions
- Build hype

### Week 0 (Launch Week)

**Monday (Day 1)**: $EMINT Launch
- Hour 0: Create $EMINT token
- Hour 0-3: Family & friends buy (50 people)
- Hour 3-6: Graduation to Raydium
- Evening: DexScreener indexed, partying

**Tuesday (Day 2)**: First 50 Video Tokens
- Morning: Announce video launch flood
- Day: Friends/family upload 50 videos
- Each video gets 10K likes (coordinate)
- Tokens graduate throughout the day

**Wednesday-Thursday (Day 3-4)**: Next 75 Videos
- Expand to community
- Small influencers join
- First organic users appear

**Friday-Sunday (Day 5-7)**: Final 75 Videos + Consolidation
- Public applications open
- Curate quality content
- Hit 200 token milestone
- Press release goes out

### Week 1 (Post-Launch)

**Monday**: Apply to CoinGecko
**Tuesday**: Influencer partnerships
**Wednesday**: First major announcement (feature drop)
**Thursday**: Community AMA
**Friday**: Week recap, next steps

**Goal**: By end of Week 1, have $EMINT on:
- ✅ DexScreener
- ✅ BirdEye
- ✅ Jupiter
- ⏳ CoinGecko (pending)
- ⏳ CoinMarketCap (pending)

---

## 10. Red Flags to Avoid

### Don't Do These:

❌ **Pump & Dump**
- Coordinated buying then selling
- Will get flagged by DexScreener
- Community will never trust you

❌ **Fake Volume**
- Wash trading (buying from yourself)
- DexScreener detects this
- Gets your tokens delisted

❌ **Low Quality Tokens**
- Spamming 200 scam tokens
- Ruins platform reputation
- No one uses your platform

❌ **Rugpull**
- Pulling liquidity after launch
- Your contract prevents this ✅
- But don't try to bypass

❌ **Paid Shilling Without Disclosure**
- Paying influencers to shill without #ad
- Illegal in many jurisdictions
- Destroys trust

### Do These Instead:

✅ **Organic Growth**
- Real users, real content
- Authentic engagement
- Long-term community building

✅ **Transparency**
- Open-source contracts
- Regular updates
- Honest communication

✅ **Quality Control**
- Curate content
- High standards
- Protect brand

✅ **Fair Launch**
- No presale
- No team allocation
- Everyone buys on bonding curve

---

## 11. Post-Launch Growth Strategy

### Month 1: Establish Presence
- Get on all DEX aggregators ✅
- CoinGecko listing ✅
- 500+ tokens created
- $100K+ daily volume

### Month 2: Expansion
- CoinMarketCap listing
- First major influencer campaigns
- Mobile app launch
- 2000+ tokens

### Month 3: Domination
- Surpass pump.fun in quality
- Native mobile apps (iOS/Android)
- International expansion
- Partnership announcements

### Month 6: Mainstream
- Major exchange listings (KuCoin, Gate.io)
- Institutional interest
- 10,000+ tokens
- $1M+ daily volume

---

## 12. Quick Start Checklist

**Before Launch**:
- [ ] Logo designed (512x512 PNG)
- [ ] Metadata JSON ready
- [ ] Upload logo to Arweave
- [ ] Update metadata with Arweave URL
- [ ] Test token creation on devnet
- [ ] Test Raydium migration on devnet
- [ ] Social media accounts created
- [ ] Discord/Telegram set up
- [ ] 50 friends/family ready to buy
- [ ] Press release drafted
- [ ] Website live

**Launch Day**:
- [ ] Create $EMINT token
- [ ] Post announcement everywhere
- [ ] Coordinate initial buys
- [ ] Monitor bonding curve progress
- [ ] Graduate to Raydium
- [ ] Verify DexScreener indexing
- [ ] Share DexScreener link
- [ ] Begin video flood

**Week 1**:
- [ ] 200 videos uploaded
- [ ] CoinGecko application submitted
- [ ] Community AMAs daily
- [ ] Influencer outreach
- [ ] Monitor for issues
- [ ] Celebrate milestones

---

## Summary

### The Magic Formula:

1. **$EMINT launches** → Bonding curve → Raydium → **DexScreener indexes**
2. **200 videos launch** → Each creates token → More Raydium pools → **Trending on DexScreener**
3. **Social media explosion** → Everyone talking about it → **Organic growth**
4. **Platform network effects** → More users → More tokens → **More visibility**

### Why This Works:

- **No manual DEX listing needed** - Automatic indexing
- **200 tokens = massive visibility** - Can't be ignored
- **Family & friends ensure quality** - No scam association
- **Dogfooding creates trust** - "They use their own product"
- **First-mover advantage** - No one else has done this

### The Result:

By end of Week 1, EngageMint will be:
- On every major DEX aggregator
- Trending across crypto Twitter
- Featured in crypto media
- Recognized as innovative
- Undeniable market presence

**You're not just launching a token. You're launching a movement.**

---

*Ready to dominate. Let's build.*
