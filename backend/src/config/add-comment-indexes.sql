-- Add indexes for video_comments table to optimize query performance

-- Index on video_id for fast comment retrieval by video
CREATE INDEX IF NOT EXISTS idx_video_comments_video ON video_comments(video_id);

-- Index on user_id for finding all comments by a user
CREATE INDEX IF NOT EXISTS idx_video_comments_user ON video_comments(user_id);

-- Index on created_at for ordering comments chronologically
CREATE INDEX IF NOT EXISTS idx_video_comments_created_at ON video_comments(created_at DESC);

-- Composite index for video + created_at (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_video_comments_video_created ON video_comments(video_id, created_at DESC);
