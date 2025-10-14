# ENGAGEMINT.MEME - Complete Workflow Design

## 🎯 ULTRA VISION: The Complete User Journey

This document maps out EVERY connection, EVERY interaction, and EVERY workflow in the Engagemint platform.

---

## 🎬 USER JOURNEYS

### Journey 1: NEW CREATOR (First-Time User)

**Goal**: User discovers platform, posts their first video, becomes a creator

```
1. ARRIVAL
   └→ PasswordGate (ccm2024)
      └→ AuthPage (click lock to skip or real signup)
         └→ ✅ Authenticated & Lands in ReelsInterface

2. DISCOVERY PHASE
   └→ User scrolls through existing videos
   └→ Likes some content
   └→ Checks out communities
   └→ Thinks: "I want to post content too!"

3. CREATION TRIGGER
   └→ Clicks Home button (top-left green circle)
      └→ Navigation menu opens
         └→ Clicks "MINT" option
            └→ MintInterface opens

4. CONTENT CREATION
   └→ TWO OPTIONS:
      A) Upload existing file:
         └→ Click "Add Photos/Videos"
         └→ Select file from device
         └→ Preview appears

      B) Record now:
         └→ Click "Record Now" button
         └→ Camera opens (front/back toggle)
         └→ Record video (up to 60 seconds)
         └→ Review recording
         └→ Use or retake

5. TOKENIZATION
   └→ Fill in details:
      ├→ Token Name: "My First Token"
      ├→ Token Ticker: "FIRST"
      ├→ Description: "This is my first post!"
      └→ Community settings: Minimum tokens = 10

6. MINTING
   └→ Click "Post Content" button
      ├→ Frontend validates: ✓ video ✓ name ✓ ticker
      ├→ Shows "Uploading..." state
      ├→ Uploads to backend (/api/videos/upload)
      ├→ Backend saves file to disk
      ├→ Backend creates video record
      ├→ Backend returns video data
      └→ ✅ SUCCESS!

7. IMMEDIATE FEEDBACK
   └→ Auto-redirect to ReelsInterface
   └→ User's new video is NOW THE FIRST VIDEO
   └→ Video plays automatically
   └→ Shows "Your Post" badge (green pill, top-right)
   └→ Shows special creator controls:
      ├→ Edit button
      ├→ Delete button
      └→ Share link

8. CREATOR EXPERIENCE
   └→ User sees their content LIVE
   └→ Can scroll to other videos
   └→ When scrolling back to their video:
      └→ Still shows "Your Post" badge
      └→ Still has creator controls

9. DASHBOARD ACCESS
   └→ User curious about stats
   └→ Clicks Home → "Creator Profile"
      └→ CreatorProfile dashboard opens
         ├→ Shows video thumbnail
         ├→ Shows stats: 5 views, 2 likes, 0 comments
         ├→ Shows token info: $FIRST
         └→ Shows "Upload New Content" button

10. GROWTH PHASE
    └→ User posts more content over time
    └→ Builds audience
    └→ Earns from token trading (future blockchain integration)
```

---

### Journey 2: EXPERIENCED CREATOR (Returning User)

**Goal**: Creator manages content, checks stats, uploads new video

```
1. RETURN
   └→ Password gate → Skip login → Lands in feed
   └→ OR goes directly to Creator Profile

2. DASHBOARD REVIEW
   └→ CreatorProfile shows:
      ├→ Total videos: 15
      ├→ Total views: 50,000
      ├→ Total likes: 5,000
      ├→ Total earnings: 5.2 SOL (when blockchain is live)
      └→ Video grid (3 columns)

3. VIDEO MANAGEMENT
   └→ Clicks on a video thumbnail
      └→ NAVIGATES to ReelsInterface
      └→ Feed opens AT THAT SPECIFIC VIDEO
      └→ Can watch, see comments, check analytics

4. ANALYTICS DEEP DIVE
   └→ From any of their videos
   └→ Click "Analytics" button
      └→ Charts modal opens showing:
         ├→ View count over time
         ├→ Like count over time
         ├→ Token price chart (future)
         └→ Trading volume (future)

5. CONTENT CREATION
   └→ From dashboard, clicks "Upload New Content"
      └→ Goes to MintInterface
      └→ Uploads new video
      └→ Posts successfully
      └→ Redirects back to feed showing new video
      └→ Can return to dashboard to see updated list

6. COMMUNITY MANAGEMENT
   └→ In feed, sees their video
   └→ Clicks "Community" icon
      └→ Opens community modal
      └→ Sees posts from token holders
      └→ Can post updates to community
      └→ Engages with fans
```

---

### Journey 3: VIEWER → INVESTOR → COMMUNITY MEMBER

**Goal**: User discovers content, buys tokens, unlocks community

```
1. BROWSING
   └→ User scrolls ReelsInterface
   └→ Finds video they love
   └→ Watches multiple times
   └→ Likes and comments

2. DECISION TO INVEST
   └→ User thinks: "I want to support this creator"
   └→ Clicks "Buy" button on video
      └→ TradingModal opens
         ├→ Shows token: $COOL
         ├→ Shows price: 0.0024 SOL
         ├→ Shows bonding curve chart
         └→ User enters: 1 SOL

3. TOKEN PURCHASE (Future - Blockchain Integration)
   └→ Clicks "Buy $COOL"
   └→ Wallet connection prompt (Phantom/Solflare)
   └→ User approves transaction
   └→ Tokens transferred to wallet
   └→ ✅ User now holds tokens

4. COMMUNITY ACCESS UNLOCKED
   └→ User still watching same video
   └→ Clicks "Community" icon
      └→ Community modal opens
      └→ Banner shows: "Access Granted ✓"
      └→ "You hold 4,166 $COOL tokens"
      └→ Can now see all posts
      └→ Can create new posts

5. COMMUNITY ENGAGEMENT
   └→ User posts: "Great video! Love the content"
   └→ Upvotes other member posts
   └→ Replies to discussions
   └→ Feels part of exclusive group

6. CREATOR INTERACTION
   └→ Creator responds to user's post
   └→ User gets notification (future)
   └→ User feels valued
   └→ Continues engaging with community
```

---

### Journey 4: MULTI-CREATOR INTERACTION

**Goal**: User follows multiple creators, trades multiple tokens

```
1. DIVERSE CONSUMPTION
   └→ User browses feed
   └→ Finds 5 creators they love
   └→ Buys tokens from each:
      ├→ 1 SOL → $COOL
      ├→ 0.5 SOL → $FIRE
      ├→ 2 SOL → $MOON
      ├→ 0.3 SOL → $PUMP
      └→ 1.5 SOL → $GEM

2. PORTFOLIO MANAGEMENT (Future)
   └→ User has "My Tokens" tab
      └→ Shows all holdings:
         ├→ $COOL: 4,166 tokens ($1.20 value) ↑ +15%
         ├→ $FIRE: 1,500 tokens ($0.80 value) ↑ +5%
         ├→ $MOON: 8,000 tokens ($3.50 value) ↑ +75%
         ├→ $PUMP: 800 tokens ($0.25 value) ↓ -15%
         └→ $GEM: 5,000 tokens ($2.10 value) ↑ +40%

3. MULTI-COMMUNITY ACCESS
   └→ User is member of 5 communities
   └→ Each creator posts exclusive content
   └→ User engages across all communities
   └→ Feels like VIP everywhere

4. TRADING ACTIVITY
   └→ $MOON is mooning (up 75%)
   └→ User decides to take profits
   └→ Opens TradingModal from any $MOON video
   └→ Switches to "Sell" tab
   └→ Sells 4,000 tokens for 2.5 SOL
   └→ ✅ Profit: 1 SOL (100% return)

5. REINVESTMENT
   └→ Uses profit to buy new creators
   └→ Cycle continues
   └→ Platform thrives
```

---

## 🔗 TECHNICAL CONNECTIONS

### Connection 1: MintInterface → ReelsInterface

**When**: After successful video upload
**What Happens**: User sees their new content immediately

```typescript
// In page.tsx (parent component)
export default function Home() {
  const [videos, setVideos] = useState<VideoData[]>([])
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [activeTab, setActiveTab] = useState('feed')

  // Callback for when upload succeeds
  const handleUploadSuccess = (newVideo: VideoData) => {
    // Prepend new video to beginning of array
    setVideos([newVideo, ...videos])

    // Set current index to 0 (first video)
    setCurrentVideoIndex(0)

    // Navigate to feed
    setActiveTab('feed')
  }

  return (
    <SolanaWalletProvider>
      <PasswordGate>
        <AuthPage>
          {activeTab === 'feed' && (
            <ReelsInterface
              videos={videos}
              setVideos={setVideos}
              currentVideoIndex={currentVideoIndex}
              setCurrentVideoIndex={setCurrentVideoIndex}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'trade' && (
            <MintInterface
              onBack={() => setActiveTab('feed')}
              onUploadSuccess={handleUploadSuccess}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'creator' && (
            <CreatorProfile
              videos={videos}
              onVideoClick={(videoId) => {
                const index = videos.findIndex(v => v.id === videoId)
                if (index !== -1) {
                  setCurrentVideoIndex(index)
                  setActiveTab('feed')
                }
              }}
              onBack={() => setActiveTab('feed')}
            />
          )}
        </AuthPage>
      </PasswordGate>
    </SolanaWalletProvider>
  )
}
```

**In MintInterface.tsx**:
```typescript
interface MintInterfaceProps {
  onBack: () => void
  onUploadSuccess: (video: VideoData) => void
  setActiveTab: (tab: string) => void
}

// After successful upload
try {
  const response = await videoAPI.upload(...)

  // Convert API response to VideoData format
  const newVideo: VideoData = {
    id: response.data.video.id,
    creator: `@${currentUser.username}`,
    creatorToken: tokenTicker,
    title: tokenName,
    description: description,
    videoUrl: `http://localhost:5000${response.data.video.video_url}`,
    views: '0',
    likes: '0',
    comments: '0',
    isLiked: false,
    // ... rest of fields
  }

  // Call parent callback
  onUploadSuccess(newVideo)

} catch (error) {
  setUploadError(error.message)
}
```

---

### Connection 2: ReelsInterface ↔ CreatorProfile

**When**: User clicks video thumbnail in dashboard
**What Happens**: Feed opens at that specific video

```typescript
// In CreatorProfile.tsx
interface CreatorProfileProps {
  videos: VideoData[]
  onVideoClick: (videoId: string) => void
  onBack: () => void
}

export function CreatorProfile({ videos, onVideoClick, onBack }: CreatorProfileProps) {
  // Filter to only user's videos
  const myVideos = videos.filter(v => v.creator_id === currentUser.id)

  return (
    <div className="...">
      <h2>My Videos ({myVideos.length})</h2>

      <div className="grid grid-cols-3 gap-4">
        {myVideos.map(video => (
          <div
            key={video.id}
            onClick={() => onVideoClick(video.id)}
            className="cursor-pointer hover:scale-105 transition-transform"
          >
            <div className="aspect-[9/16] relative">
              {video.videoUrl?.includes('.mp4') ? (
                <video src={video.videoUrl} className="w-full h-full object-cover rounded-lg" />
              ) : (
                <img src={video.videoUrl} className="w-full h-full object-cover rounded-lg" />
              )}
            </div>
            <p className="text-white text-sm mt-2">{video.title}</p>
            <p className="text-gray-400 text-xs">{video.views} views</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

### Connection 3: User Context (Know Who's Logged In)

**Why**: To show "Your Post" badge and creator controls

```typescript
// Create UserContext.tsx
'use client'

import { createContext, useContext, useState, useEffect } from 'react'

interface User {
  id: string
  username: string
  email: string
}

interface UserContextType {
  user: User | null
  setUser: (user: User | null) => void
  isAuthenticated: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  // Load user from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      // Fetch user profile
      fetchUserProfile().then(setUser)
    }
  }, [])

  const isAuthenticated = user !== null

  return (
    <UserContext.Provider value={{ user, setUser, isAuthenticated }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) throw new Error('useUser must be used within UserProvider')
  return context
}
```

**In ReelsInterface.tsx**:
```typescript
import { useUser } from '@/context/UserContext'

export function ReelsInterface({ ... }) {
  const { user } = useUser()

  const currentVideo = videos[currentVideoIndex]
  const isOwnVideo = user && currentVideo.creator_id === user.id

  return (
    <div className="...">
      {/* Video element */}

      {/* Show "Your Post" badge if it's the user's video */}
      {isOwnVideo && (
        <div className="absolute top-6 right-6 z-40">
          <div className="bg-green-500 text-black px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2">
            <span>✓</span>
            <span>Your Post</span>
          </div>
        </div>
      )}

      {/* Show creator controls if it's the user's video */}
      {isOwnVideo && (
        <div className="absolute top-20 right-6 z-40 space-y-2">
          <button
            onClick={handleEditVideo}
            className="bg-blue-500 hover:bg-blue-600 rounded-full p-3"
          >
            <Edit className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={handleDeleteVideo}
            className="bg-red-500 hover:bg-red-600 rounded-full p-3"
          >
            <Trash className="w-6 h-6 text-white" />
          </button>
        </div>
      )}
    </div>
  )
}
```

---

### Connection 4: Delete Video Workflow

**When**: Creator clicks delete on their video
**What Happens**: Video removed from feed and database

```typescript
const handleDeleteVideo = async () => {
  // Confirm deletion
  const confirmed = confirm('Delete this video? This cannot be undone.')
  if (!confirmed) return

  try {
    // Call API
    await videoAPI.delete(currentVideo.id)

    // Remove from videos array
    const updatedVideos = videos.filter(v => v.id !== currentVideo.id)
    setVideos(updatedVideos)

    // Navigate to next video (or previous if last video)
    if (currentVideoIndex >= updatedVideos.length) {
      setCurrentVideoIndex(Math.max(0, updatedVideos.length - 1))
    }

    // Show success toast
    alert('Video deleted successfully')

  } catch (error) {
    alert('Failed to delete video: ' + error.message)
  }
}
```

---

## 🎨 UI/UX POLISH

### "Your Post" Indicator Design

```typescript
<div className="absolute top-6 right-6 z-50 animate-fade-in">
  <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-black px-4 py-2 rounded-full font-bold text-sm shadow-2xl flex items-center gap-2 border-2 border-white/20">
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
    <span>Your Post</span>
  </div>
</div>
```

### Success Toast After Upload

```typescript
<div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[100] animate-slide-down">
  <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl font-bold flex items-center gap-3 border-2 border-white/30">
    <div className="bg-white rounded-full p-2">
      <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    </div>
    <div>
      <p className="text-lg">Video Posted!</p>
      <p className="text-sm text-white/80">Your content is now live</p>
    </div>
  </div>
</div>
```

---

## 📊 STATE MANAGEMENT ARCHITECTURE

### Centralized State in Parent

```typescript
// page.tsx becomes the state manager
export default function Home() {
  // VIDEO STATE
  const [videos, setVideos] = useState<VideoData[]>([])
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [isLoadingVideos, setIsLoadingVideos] = useState(false)
  const [hasMoreVideos, setHasMoreVideos] = useState(true)

  // UI STATE
  const [activeTab, setActiveTab] = useState<'feed' | 'trade' | 'creator' | 'community'>('feed')

  // USER STATE (from UserContext)
  const { user, isAuthenticated } = useUser()

  // FETCH VIDEOS ON MOUNT
  useEffect(() => {
    fetchInitialVideos()
  }, [])

  const fetchInitialVideos = async () => {
    setIsLoadingVideos(true)
    try {
      const response = await videoAPI.getAll(20, 0)
      if (response.success) {
        const videoData = response.data.videos.map(convertAPIToVideoData)
        setVideos(videoData)
      }
    } catch (error) {
      console.error('Failed to load videos:', error)
    } finally {
      setIsLoadingVideos(false)
    }
  }

  // CALLBACKS FOR CHILD COMPONENTS
  const handleUploadSuccess = (newVideo: VideoData) => {
    setVideos([newVideo, ...videos])
    setCurrentVideoIndex(0)
    setActiveTab('feed')
    // Show success toast
  }

  const handleVideoDelete = (videoId: string) => {
    const updatedVideos = videos.filter(v => v.id !== videoId)
    setVideos(updatedVideos)
    if (currentVideoIndex >= updatedVideos.length) {
      setCurrentVideoIndex(Math.max(0, updatedVideos.length - 1))
    }
  }

  const handleNavigateToVideo = (videoId: string) => {
    const index = videos.findIndex(v => v.id === videoId)
    if (index !== -1) {
      setCurrentVideoIndex(index)
      setActiveTab('feed')
    }
  }

  // RENDER
  return (
    <UserProvider>
      <SolanaWalletProvider>
        <PasswordGate>
          <AuthPage>
            {activeTab === 'feed' && (
              <ReelsInterface
                videos={videos}
                currentVideoIndex={currentVideoIndex}
                setCurrentVideoIndex={setCurrentVideoIndex}
                setActiveTab={setActiveTab}
                onVideoDelete={handleVideoDelete}
              />
            )}

            {activeTab === 'trade' && (
              <MintInterface
                onBack={() => setActiveTab('feed')}
                onUploadSuccess={handleUploadSuccess}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === 'creator' && (
              <CreatorProfile
                videos={videos.filter(v => v.creator_id === user?.id)}
                onVideoClick={handleNavigateToVideo}
                onBack={() => setActiveTab('feed')}
              />
            )}
          </AuthPage>
        </PasswordGate>
      </SolanaWalletProvider>
    </UserProvider>
  )
}
```

---

## 🚀 IMPLEMENTATION PRIORITY

### Phase 1: Core Connections (THIS WEEK)
1. ✅ Lift state to parent component
2. ✅ Add onUploadSuccess callback in MintInterface
3. ✅ Show new video immediately after upload
4. ✅ Add UserContext for authentication
5. ✅ Add "Your Post" badge
6. ✅ Add delete functionality for own videos

### Phase 2: Creator Dashboard (NEXT WEEK)
1. ✅ Fetch user's videos in CreatorProfile
2. ✅ Display video grid with thumbnails
3. ✅ Click video → Navigate to feed at that video
4. ✅ Show total stats (views, likes, earnings)
5. ✅ Add "Upload New Content" button

### Phase 3: Advanced Features (WEEK 3)
1. ✅ Edit video metadata
2. ✅ Video analytics dashboard
3. ✅ Community management tools
4. ✅ Token holder list
5. ✅ Earnings dashboard (when blockchain is integrated)

---

This is the complete vision for how everything connects!
