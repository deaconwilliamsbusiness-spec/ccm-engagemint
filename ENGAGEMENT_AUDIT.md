# 🔍 EngageMint Engagement System Audit

**Date:** Nov 2, 2025
**Scope:** Frontend-to-Backend video engagement flow
**Goal:** Ensure accurate view/like counting per user requirements

---

## 📋 Requirements

### Views
- ✅ **1 view = watching for more than 1 second**
- ✅ **10 rewatches allowed per user per video**
- ✅ **Photos default to 5 seconds duration**

### Likes
- ✅ **1 like per user per video** (toggle on/off)
- ✅ **Real-time count updates**

---

## 🐛 CRITICAL ISSUES FOUND

### Issue #1: **No Video Duration Tracking** ❌
**Location:** `/frontend/src/components/ReelsInterface.tsx`

**Problem:**
- `trackView()` function exists (line 339-368)
- **BUT IT'S NEVER CALLED**
- Views are not being tracked when users watch videos
- No video event listeners (ended, timeupdate, etc.)

**Impact:**
- **ZERO views are being counted**
- View metrics are completely broken
- Viral threshold (100 likes) won't trigger token launch

---

### Issue #2: **Views Count on Scroll, Not on Full Watch** ❌
**Location:** `/backend/src/models/Video.js:132-153`

**Problem:**
```javascript
static async incrementViews(videoId, userId = null) {
  // Always increment view count (tracks every view, not just unique)
  // This counts views on each scroll and on each full watch completion
  await query(
    'UPDATE videos SET views_count = views_count + 1 WHERE id = $1',
    [videoId]
  )
}
```

**Current Behavior:**
- Views increment on every scroll
- No duration tracking
- No limit on rewatches

**Required Behavior:**
- Views should increment after watching >= 1 second
- Max 10 views per user per video
- Track actual watch time

---

### Issue #3: **No Rewatch Limit** ❌
**Location:** `/backend/src/models/Video.js`

**Problem:**
- No table to track individual view events with timestamps
- Can't enforce "10 rewatches max" rule
- `video_views` table only tracks unique user-video pairs (last view time)

**Current Schema:**
```sql
CREATE TABLE video_views (
  video_id VARCHAR(255),
  user_id UUID,
  viewed_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (video_id, user_id)  -- Only 1 record per user-video
);
```

**Required Schema:**
```sql
CREATE TABLE video_view_events (
  id UUID PRIMARY KEY,
  video_id VARCHAR(255),
  user_id UUID,
  watch_duration INTEGER,  -- Seconds watched
  video_duration INTEGER,   -- Total video duration
  completed BOOLEAN,        -- Did they watch to end?
  viewed_at TIMESTAMP DEFAULT NOW()
);
```

---

### Issue #4: **No Photo Duration Default** ❌
**Location:** `/backend/src/controllers/videoController.js`

**Problem:**
- No check for photo vs video
- No default 5-second duration for photos
- Duration comes from frontend but may be missing

**Required:**
```javascript
// If uploaded file is photo, set duration to 5 seconds
const isPhoto = videoFile.mimetype.startsWith('image/')
const finalDuration = isPhoto ? 5 : (duration || 0)
```

---

### Issue #5: **Like Logic is CORRECT** ✅
**Location:** `/backend/src/models/Video.js:156-190`

**Status:** ✅ **Working Correctly**

```javascript
static async like(videoId, userId) {
  // Check if already liked
  const existingLike = await query(
    'SELECT id FROM video_likes WHERE video_id = $1 AND user_id = $2',
    [videoId, userId]
  )

  if (existingLike.rows.length > 0) {
    // Unlike
    DELETE FROM video_likes WHERE video_id = $1 AND user_id = $2
    UPDATE videos SET likes_count = likes_count - 1
    return { liked: false }
  } else {
    // Like
    INSERT INTO video_likes (video_id, user_id) VALUES ($1, $2)
    UPDATE videos SET likes_count = likes_count + 1
    return { liked: true }
  }
}
```

**✅ This correctly enforces 1 like per user per video**

---

## 🔧 REQUIRED FIXES

### Fix #1: Add Video Duration Tracking (Frontend)
**File:** `/frontend/src/components/ReelsInterface.tsx`

**Changes Needed:**
1. Add video ref to track current playing video
2. Add event listeners for:
   - `loadedmetadata` - Get video duration
   - `timeupdate` - Track watch progress
   - `ended` - Mark as fully watched
3. Call `trackView()` only when video is fully watched
4. Handle photo duration (5 seconds default)

---

### Fix #2: Implement Proper View Counting (Backend)
**File:** `/backend/src/models/Video.js`

**Changes Needed:**
1. Create `video_view_events` table
2. Track each view event with duration
3. Only count as "view" if watched >= 80% of duration
4. Enforce max 10 views per user per video
5. Update `videos.views_count` based on valid views

---

### Fix #3: Add Photo Duration Default (Backend)
**File:** `/backend/src/controllers/videoController.js`

**Changes Needed:**
1. Detect if uploaded file is photo
2. Set duration to 5 seconds for photos
3. Validate duration exists for videos

---

### Fix #4: Create Database Migration
**File:** `/backend/db-migrations/add-view-tracking.sql`

**New Tables:**
```sql
-- Track individual view events
CREATE TABLE video_view_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id VARCHAR(255) NOT NULL,
  user_id UUID,
  watch_duration INTEGER NOT NULL,
  video_duration INTEGER NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  viewed_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Index for performance
CREATE INDEX idx_view_events_video_user ON video_view_events(video_id, user_id, viewed_at DESC);
CREATE INDEX idx_view_events_completed ON video_view_events(video_id, completed);

-- Function to count valid views (watched >= 80%)
CREATE OR REPLACE FUNCTION count_valid_views(p_video_id VARCHAR, p_user_id UUID DEFAULT NULL)
RETURNS INTEGER AS $$
DECLARE
  view_count INTEGER;
BEGIN
  IF p_user_id IS NULL THEN
    -- Count all valid views
    SELECT COUNT(*) INTO view_count
    FROM video_view_events
    WHERE video_id = p_video_id
      AND (watch_duration::FLOAT / NULLIF(video_duration, 0)) >= 0.8;
  ELSE
    -- Count views for specific user (max 10)
    SELECT COUNT(*) INTO view_count
    FROM (
      SELECT * FROM video_view_events
      WHERE video_id = p_video_id
        AND user_id = p_user_id
        AND (watch_duration::FLOAT / NULLIF(video_duration, 0)) >= 0.8
      ORDER BY viewed_at DESC
      LIMIT 10
    ) AS limited_views;
  END IF;

  RETURN view_count;
END;
$$ LANGUAGE plpgsql;
```

---

## 🎯 Implementation Plan

### Phase 1: Database (10 min)
1. Create migration file
2. Run migration on local DB
3. Verify tables/functions created

### Phase 2: Backend (20 min)
1. Update `Video.incrementViews()` to use new logic
2. Add view validation (10 views max, 80% duration min)
3. Add photo duration default in upload controller
4. Add endpoint to get user's view count for a video

### Phase 3: Frontend (30 min)
1. Add video ref and event listeners
2. Track watch duration with `timeupdate`
3. Call `trackView()` on `ended` event
4. Handle photos (5s timer)
5. Show "X/10 views remaining" indicator (optional)

### Phase 4: Testing (15 min)
1. Upload video
2. Watch full duration → verify view counted
3. Watch again → verify rewatch counted
4. Watch 10 times → verify limit enforced
5. Like video → verify toggle works
6. Upload photo → verify 5s duration

---

## 📊 Success Criteria

### Views
- [ ] Views only count after watching >= 80% of video
- [ ] Max 10 rewatches per user per video
- [ ] Photos default to 5 seconds
- [ ] View count accurate in database
- [ ] Real-time view updates in UI

### Likes
- [x] 1 like per user per video (already working)
- [x] Toggle on/off (already working)
- [x] Real-time count updates (already working)

---

## 🚨 Priority

**CRITICAL** - Views are completely broken right now:
1. `trackView()` is never called
2. No duration tracking
3. No rewatch limits

**This must be fixed before ANY production testing.**

---

## 📝 Next Steps

1. Create database migration
2. Update backend view logic
3. Update frontend to track duration
4. Test end-to-end flow
5. Verify analytics accuracy

---

**Estimated Time to Fix:** 75 minutes total
**Impact:** Critical - view metrics drive viral token launches

**Status:** 🔴 **BROKEN** → Needs immediate attention
