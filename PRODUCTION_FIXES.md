# PRODUCTION FIXES - Complete Guide

## 🚨 CRITICAL ISSUES FOUND

### 1. **Videos/Images Not Displaying (Grey Screen)**

**Root Cause**: Multiple issues:
- Images uploaded to wrong folder (`thumbnails/` instead of `videos/`)
- Static file serving path incorrect
- Upload config doesn't distinguish between main content vs actual thumbnails

**Fix Applied**:
```javascript
// backend/src/config/upload.js
// Changed from mimetype-based to fieldname-based routing
if (file.fieldname === 'video') {
  cb(null, 'uploads/videos')  // Main content (video OR image)
} else if (file.fieldname === 'thumbnail') {
  cb(null, 'uploads/thumbnails')  // Actual thumbnails only
}
```

**Manual Fix Needed**:
```bash
# Restart backend to apply changes
cd /root/ccm-engagemint/backend
pkill -f nodemon
npm run dev
```

---

### 2. **TikTok-Style Aspect Ratio (9:16 Portrait)**

**Current**: Videos show in 16:9 landscape (`aspect-video`)
**Need**: 9:16 portrait like TikTok

**Fix Required** in `ReelsInterface.tsx`:
```typescript
// Find line ~302: <div className="relative w-full max-w-md h-full...">
// Change aspect-video to full height

// OLD:
<div className="aspect-video bg-gray-700 relative overflow-hidden">

// NEW:
<div className="w-full h-full bg-gray-900 relative overflow-hidden">
```

Also fix video element to maintain aspect:
```typescript
<video
  className="absolute inset-0 w-full h-full object-contain bg-black"  // object-contain preserves aspect
  src={currentVideo.videoUrl}
  loop
  playsInline
  autoPlay={isPlaying}
/>
```

---

### 3. **Add "Record Now" Camera Feature**

**Implementation Plan**:

Create new component `CameraRecorder.tsx`:
```typescript
'use client'

import { useState, useRef } from 'react'
import { Camera, X, Circle, Square } from 'lucide-react'

interface CameraRecorderProps {
  onRecordingComplete: (file: File) => void
  onClose: () => void
}

export function CameraRecorder({ onRecordingComplete, onClose }: CameraRecorderProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [chunks, setChunks] = useState<Blob[]>([])

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',  // Front camera default
          width: { ideal: 1080 },
          height: { ideal: 1920 }  // 9:16 aspect
        },
        audio: true
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      console.error('Camera access denied:', error)
      alert('Please allow camera access to record')
    }
  }

  const startRecording = () => {
    if (!stream) return

    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9'  // or 'video/mp4' if supported
    })

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        setChunks(prev => [...prev, event.data])
      }
    }

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' })
      const file = new File([blob], `recording-${Date.now()}.webm`, { type: 'video/webm' })
      onRecordingComplete(file)
    }

    mediaRecorderRef.current = mediaRecorder
    mediaRecorder.start()
    setIsRecording(true)
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }
  }

  useEffect(() => {
    startCamera()
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Camera Preview */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="flex-1 w-full h-full object-cover"
      />

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black to-transparent">
        <div className="flex items-center justify-center gap-8">
          <button
            onClick={onClose}
            className="bg-gray-800 rounded-full p-4 hover:bg-gray-700"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`rounded-full p-8 ${
              isRecording ? 'bg-red-500' : 'bg-white'
            }`}
          >
            {isRecording ? (
              <Square className="w-8 h-8 text-white" />
            ) : (
              <Circle className="w-8 h-8 text-red-500" />
            )}
          </button>

          <div className="w-16" /> {/* Spacer */}
        </div>

        {isRecording && (
          <div className="text-center mt-4">
            <span className="text-red-500 font-bold text-lg animate-pulse">● REC</span>
          </div>
        )}
      </div>
    </div>
  )
}
```

**Add to MintInterface.tsx**:
```typescript
// Add state
const [showCamera, setShowCamera] = useState(false)

// Add button next to upload
<button
  onClick={() => setShowCamera(true)}
  className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 rounded-2xl p-8 transition-colors group"
>
  <Camera className="w-8 h-8 text-white mx-auto mb-2" />
  <p className="text-white font-bold">Record Now</p>
  <p className="text-white/80 text-sm">Use your camera</p>
</button>

// Add camera modal
{showCamera && (
  <CameraRecorder
    onRecordingComplete={(file) => {
      addMedia(file)
      setShowCamera(false)
    }}
    onClose={() => setShowCamera(false)}
  />
)}
```

---

### 4. **Remove ALL Mock Data**

**Current Issues**:
- Communities show fake posts
- Comments are hardcoded
- Video data has mock analytics

**Fix Communities** in `ReelsInterface.tsx`:

Find the Community Preview Modal (around line 762) and replace mock posts with:

```typescript
// Fetch real posts from API
const [communityPosts, setCommunityPosts] = useState([])
const [loadingPosts, setLoadingPosts] = useState(true)

useEffect(() => {
  if (isCommunityPageOpen) {
    fetchCommunityPosts(currentVideo.id)
  }
}, [isCommunityPageOpen, currentVideo.id])

const fetchCommunityPosts = async (videoId) => {
  setLoadingPosts(true)
  try {
    const response = await fetch(`http://localhost:5000/api/communities/${videoId}/posts`)
    const data = await response.json()
    setCommunityPosts(data.posts || [])
  } catch (error) {
    console.error('Failed to load posts:', error)
    setCommunityPosts([])
  } finally {
    setLoadingPosts(false)
  }
}

// In the render:
{loadingPosts ? (
  <div className="text-center py-8">
    <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto" />
  </div>
) : communityPosts.length === 0 ? (
  <div className="text-center py-12">
    <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
    <h3 className="text-white font-bold text-lg mb-2">No Posts Yet</h3>
    <p className="text-gray-400 text-sm">Be the first to post in this community!</p>
  </div>
) : (
  // Render actual posts
  communityPosts.map(post => ...)
)}
```

**Backend API for Communities**:

Create `backend/src/routes/communities.js`:
```javascript
const express = require('express')
const router = express.Router()
const { authenticate, optionalAuth } = require('../middleware/auth')

// In-memory community posts storage
let communityPosts = []

// Get community posts
router.get('/:videoId/posts', optionalAuth, async (req, res) => {
  try {
    const posts = communityPosts.filter(p => p.video_id === req.params.videoId)
    res.json({ success: true, posts })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load posts' })
  }
})

// Create community post
router.post('/:videoId/posts', authenticate, async (req, res) => {
  try {
    const { content } = req.body
    const post = {
      id: String(Date.now()),
      video_id: req.params.videoId,
      author_wallet: req.user.username,
      content,
      likes_count: 0,
      created_at: new Date().toISOString()
    }
    communityPosts.push(post)
    res.json({ success: true, post })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create post' })
  }
})

module.exports = router
```

Add to `backend/src/server.js`:
```javascript
const communityRoutes = require('./routes/communities')
app.use('/api/communities', communityRoutes)
```

---

### 5. **Real-Time Comments**

**Current**: Comments are static mock data
**Need**: Real comments that update live

**Backend** - Add to `backend/src/routes/videos.js`:
```javascript
// In-memory comments storage
let comments = []

// Get comments for video
router.get('/:id/comments', optionalAuth, async (req, res) => {
  try {
    const videoComments = comments.filter(c => c.video_id === req.params.id)
    res.json({ success: true, comments: videoComments })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load comments' })
  }
})

// Post comment
router.post('/:id/comments', authenticate, async (req, res) => {
  try {
    const { content } = req.body
    const comment = {
      id: String(Date.now()),
      video_id: req.params.id,
      author_username: req.user.username,
      content,
      likes_count: 0,
      created_at: new Date().toISOString()
    }
    comments.push(comment)

    // TODO: Broadcast via WebSocket for real-time
    res.json({ success: true, comment })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to post comment' })
  }
})
```

**Frontend** - Update `ReelsInterface.tsx` comments section:
```typescript
const [comments, setComments] = useState([])
const [newComment, setNewComment] = useState('')

useEffect(() => {
  if (isChatOpen && currentVideo) {
    fetchComments(currentVideo.id)
  }
}, [isChatOpen, currentVideo])

const fetchComments = async (videoId) => {
  try {
    const response = await fetch(`http://localhost:5000/api/videos/${videoId}/comments`)
    const data = await response.json()
    setComments(data.comments || [])
  } catch (error) {
    console.error('Failed to load comments:', error)
  }
}

const postComment = async () => {
  if (!newComment.trim()) return

  try {
    const token = localStorage.getItem('auth_token')
    const response = await fetch(`http://localhost:5000/api/videos/${currentVideo.id}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ content: newComment })
    })
    const data = await response.json()
    if (data.success) {
      setComments(prev => [data.comment, ...prev])
      setNewComment('')
    }
  } catch (error) {
    console.error('Failed to post comment:', error)
  }
}

// In render:
{comments.length === 0 ? (
  <div className="flex-1 flex items-center justify-center">
    <div className="text-center">
      <MessageCircleIcon className="w-12 h-12 text-gray-600 mx-auto mb-2" />
      <p className="text-gray-400">No comments yet</p>
      <p className="text-gray-500 text-sm">Be the first to comment!</p>
    </div>
  </div>
) : (
  <div className="flex-1 overflow-y-auto p-4 space-y-4">
    {comments.map(comment => (
      <div key={comment.id} className="flex gap-2.5">
        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex-shrink-0" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white font-semibold text-sm">{comment.author_username}</span>
            <span className="text-gray-500 text-xs">
              {new Date(comment.created_at).toLocaleTimeString()}
            </span>
          </div>
          <p className="text-gray-200 text-sm">{comment.content}</p>
        </div>
      </div>
    ))}
  </div>
)}
```

---

### 6. **Empty States Everywhere**

**Principle**: Never show mock data in production. Show empty states instead.

**Example Empty States**:

**No Videos**:
```typescript
<div className="fixed inset-0 bg-black flex items-center justify-center p-4">
  <div className="text-center max-w-md">
    <div className="text-6xl mb-4">📹</div>
    <h2 className="text-white font-bold text-2xl mb-2">No Videos Yet</h2>
    <p className="text-gray-400 mb-6">Be the first to mint and post content!</p>
    <button className="bg-green-500 hover:bg-green-600 text-black font-bold py-3 px-6 rounded-xl">
      Go to MINT
    </button>
  </div>
</div>
```

**No Comments**:
```typescript
<div className="flex-1 flex items-center justify-center">
  <div className="text-center p-8">
    <MessageCircleIcon className="w-16 h-16 text-gray-600 mx-auto mb-3" />
    <h3 className="text-white font-bold mb-1">No comments yet</h3>
    <p className="text-gray-400 text-sm">Start the conversation!</p>
  </div>
</div>
```

**No Community Posts**:
```typescript
<div className="text-center py-12">
  <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
  <h3 className="text-white font-bold text-lg mb-2">Community Just Started</h3>
  <p className="text-gray-400 text-sm mb-4">No posts yet. Buy tokens to join and post!</p>
</div>
```

---

## 🎯 PRODUCTION CHECKLIST

### Critical Fixes (Do First)
- [ ] Restart backend to apply upload config fix
- [ ] Test image upload - should appear in feed now
- [ ] Change video aspect ratio to portrait (9:16)
- [ ] Remove all mock community posts
- [ ] Implement real comments API
- [ ] Add empty states everywhere

### Features to Add (Priority)
- [ ] Camera recorder component
- [ ] Real-time comment updates (WebSocket)
- [ ] Community posts API
- [ ] Token balance verification
- [ ] Creator dashboard with real earnings

### Polish (Before Launch)
- [ ] Video playback controls (play/pause, mute)
- [ ] Loading states for all API calls
- [ ] Error boundaries for crashes
- [ ] Mobile responsive testing
- [ ] Performance optimization

---

## 🚀 IMMEDIATE NEXT STEPS

1. **Restart backend**:
```bash
cd /root/ccm-engagemint/backend
pkill -f nodemon
npm run dev
```

2. **Test video display** - refresh frontend, your image should show now

3. **Change aspect ratio** - edit `ReelsInterface.tsx` lines ~118-136

4. **Remove mock data** - search codebase for `[...Array(` and replace with empty states

5. **Add camera recorder** - create `CameraRecorder.tsx` component

---

This will make the platform production-ready with real functionality!
