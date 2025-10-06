# Engagemint.meme - Project Structure

## 📂 Clean File Organization

```
ccm-engagemint/
│
├── frontend/                           # Main application (UI only)
│   │
│   ├── src/
│   │   ├── app/                       # Next.js App Router
│   │   │   ├── page.tsx              # Main app with tab navigation
│   │   │   ├── layout.tsx            # Root layout
│   │   │   ├── globals.css           # Global styles + Tailwind
│   │   │   └── favicon.ico           # Site icon
│   │   │
│   │   ├── components/                # React UI Components
│   │   │   ├── ReelsInterface.tsx    # Video feed (Vine-style)
│   │   │   ├── MintInterface.tsx     # Token creation UI
│   │   │   ├── CreatorProfile.tsx    # Creator dashboard
│   │   │   ├── CommunityHub.tsx      # Community features
│   │   │   └── PasswordGate.tsx      # Authentication
│   │   │
│   │   └── lib/                       # Utilities (optional)
│   │
│   ├── public/                        # Static assets
│   │   ├── mint-logo.png
│   │   ├── handshake-logo.png
│   │   └── ...
│   │
│   ├── package.json                   # Dependencies
│   ├── next.config.ts                 # Next.js config
│   ├── tailwind.config.ts             # Tailwind config
│   └── tsconfig.json                  # TypeScript config
│
├── README.md                          # Project overview
├── DEVELOPMENT_STATUS.md              # Development progress
└── PROJECT_STRUCTURE.md               # This file

```

## 🎯 Component Overview

### 1. **ReelsInterface** (`ReelsInterface.tsx`)
**Purpose:** Vine/TikTok-style vertical video feed

**Features:**
- Vertical swipe navigation (touch, mouse, keyboard)
- Video playback controls
- Engagement analytics with charts
- Token price displays
- Token-gated comments
- Navigation menu
- Like/comment/share actions

**Key UI Elements:**
- Video container with gradients
- Analytics charts (TikTok & Pump.fun style)
- Green navigation menu button
- Token metrics display
- Comment section with token verification

### 2. **MintInterface** (`MintInterface.tsx`)
**Purpose:** Token/memecoin creation interface

**Features:**
- Photo/video upload (multiple files)
- Slideshow preview for images
- Video preview with controls
- Token metadata input
- Social links (optional)
- Community access settings

**Key UI Elements:**
- Media preview with timeline
- Upload dropzone
- Token details form
- Community settings
- Create token button

### 3. **CreatorProfile** (`CreatorProfile.tsx`)
**Purpose:** Creator dashboard and analytics

**Features:**
- Profile information display
- P&L charts with time periods
- Content grid view
- Stats dashboard

**Key UI Elements:**
- Avatar with edit button
- Stats cards (videos, followers, earnings)
- Interactive bar chart
- Content thumbnails grid

### 4. **CommunityHub** (`CommunityHub.tsx`)
**Purpose:** Community engagement and governance

**Features:**
- Community switching
- Latest posts/chats
- Trending discussions
- Governance proposals with voting

**Key UI Elements:**
- Community selector
- Tab navigation (Latest/Trending/Engage)
- Post cards with engagement
- Voting interface
- Proposal creation

### 5. **PasswordGate** (`PasswordGate.tsx`)
**Purpose:** Access authentication

**Features:**
- Password protection
- Multiple valid passwords
- Session persistence

**Valid Passwords:**
- `MintDev` (primary)
- `ccm2024` (fallback)
- `EngageMint2024` (alternative)
- `TestPass123` (emergency)

## 🔄 Navigation Flow

```
PasswordGate
    ↓
ReelsInterface (Feed)
    ├── → CreatorProfile
    ├── → MintInterface
    ├── → CommunityHub
    └── ← Back to Feed
```

## 🎨 Design System

**Colors:**
- Primary: Green (#10b981)
- Background: Black/Gray (#000, #111827, #1f2937)
- Text: White/Gray
- Accents: Purple, Blue, Yellow (for communities)

**Typography:**
- Font: System fonts (Geist)
- Sizes: xs to 3xl

**Components:**
- Rounded corners (xl, 2xl, 3xl)
- Backdrop blur effects
- Gradient backgrounds
- Smooth transitions

## 📦 Tech Stack

- **Framework:** Next.js 15.5.3
- **Build Tool:** Turbopack
- **UI:** React 19
- **Styling:** Tailwind CSS v4
- **Language:** TypeScript
- **Icons:** Lucide React
- **State:** React hooks (useState, useEffect, useRef)

## 🚀 Development

```bash
# Install dependencies
cd frontend
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint
```

## 📝 Notes

- **No wallet integration** - UI only, blockchain features to be added later
- **Mock data** - All data is hardcoded for demo purposes
- **Responsive design** - Mobile-first approach
- **Clean code** - Optimized and well-commented
- **Professional structure** - Easy to maintain and extend

---

*Last updated: October 5, 2025*
