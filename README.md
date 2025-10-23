# Engagemint.meme
## Social Media Memecoin Launchpad

**A Vine/Pump.fun style social media platform for launching memecoins**

---

## 📁 Project Structure

```
ccm-engagemint/
├── frontend/               # Next.js web application (UI ONLY)
│   ├── src/
│   │   ├── app/           # Next.js App Router
│   │   └── components/    # React UI components
│   ├── public/            # Static assets
│   └── package.json
├── README.md
└── DEVELOPMENT_STATUS.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+

### Development Setup

**Frontend (UI)**
```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:3000`

**Access Password:** `MintDev` (or `ccm2024`, `EngageMint2024`, `TestPass123`)

## 🎨 UI Components

### Main Features (No Wallet/Blockchain Integration)

1. **ReelsInterface** - TikTok/Vine-style vertical video feed
   - Swipe navigation (touch, mouse wheel, keyboard)
   - Engagement analytics charts
   - Token price displays (mock data)
   - Token-gated comments UI

2. **MintInterface** - Token creation interface
   - Media upload (photos/videos)
   - Token metadata input
   - Community settings
   - Slideshow/video preview

3. **CreatorProfile** - Creator dashboard
   - P&L charts
   - Content grid
   - Creator stats

4. **CommunityHub** - Community engagement
   - Latest posts
   - Trending discussions
   - Governance proposals
   - Community switching

5. **PasswordGate** - Access authentication

## 💰 Current Status

✅ **Complete UI Workflow** - All screens and navigation working
✅ **Clean File Structure** - Focused on frontend only
✅ **Professional Code** - Optimized and well-commented
✅ **Mock Data** - Demo content for testing UI

❌ **No Wallet Integration** - To be added later
❌ **No Smart Contracts** - To be added later
❌ **No Backend API** - To be added later

## 🛠️ Development Commands

```bash
# Development
npm run dev        # Start dev server (Turbopack)

# Build
npm run build      # Production build

# Code Quality
npm run lint       # Run ESLint
```

## 📊 Tech Stack

- **Framework:** Next.js 15.5.3 (App Router + Turbopack)
- **UI Library:** React 19
- **Styling:** Tailwind CSS v4
- **Language:** TypeScript
- **Icons:** Lucide React

---

**Built for the memecoin revolution 🚀**

*Last Updated: October 5, 2025*
# Railway deployment fix
