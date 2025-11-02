-- Add proper view tracking for EngageMint
-- Implements: 1 view = full duration watch, max 10 rewatches per user

-- 1. Create video_view_events table to track individual view events
CREATE TABLE IF NOT EXISTS video_view_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id VARCHAR(255) NOT NULL,
  user_id UUID,
  watch_duration INTEGER NOT NULL,  -- Seconds watched
  video_duration INTEGER NOT NULL,  -- Total video duration
  completed BOOLEAN DEFAULT FALSE,   -- Watched to end?
  viewed_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_view_events_video_user
  ON video_view_events(video_id, user_id, viewed_at DESC);

CREATE INDEX IF NOT EXISTS idx_view_events_completed
  ON video_view_events(video_id, completed);

CREATE INDEX IF NOT EXISTS idx_view_events_user
  ON video_view_events(user_id, viewed_at DESC);

-- 3. Function to count valid views (watched >= 80% of duration)
CREATE OR REPLACE FUNCTION count_valid_views(p_video_id VARCHAR, p_user_id UUID DEFAULT NULL)
RETURNS INTEGER AS $$
DECLARE
  view_count INTEGER;
BEGIN
  IF p_user_id IS NULL THEN
    -- Count all valid views for this video
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

-- 4. Function to check if user can view this video again
CREATE OR REPLACE FUNCTION can_user_view(p_video_id VARCHAR, p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  valid_views INTEGER;
BEGIN
  -- Count how many valid views this user has for this video
  SELECT COUNT(*) INTO valid_views
  FROM video_view_events
  WHERE video_id = p_video_id
    AND user_id = p_user_id
    AND (watch_duration::FLOAT / NULLIF(video_duration, 0)) >= 0.8;

  -- Allow if less than 10 views
  RETURN valid_views < 10;
END;
$$ LANGUAGE plpgsql;

-- 5. Function to get user's remaining views for a video
CREATE OR REPLACE FUNCTION get_remaining_views(p_video_id VARCHAR, p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  valid_views INTEGER;
BEGIN
  SELECT COUNT(*) INTO valid_views
  FROM video_view_events
  WHERE video_id = p_video_id
    AND user_id = p_user_id
    AND (watch_duration::FLOAT / NULLIF(video_duration, 0)) >= 0.8;

  RETURN GREATEST(0, 10 - valid_views);
END;
$$ LANGUAGE plpgsql;

-- 6. Trigger to update videos.views_count when valid view is recorded
CREATE OR REPLACE FUNCTION update_video_views_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Only count as view if watched >= 80%
  IF (NEW.watch_duration::FLOAT / NULLIF(NEW.video_duration, 0)) >= 0.8 THEN
    UPDATE videos
    SET views_count = (
      SELECT COUNT(*)
      FROM video_view_events
      WHERE video_id = NEW.video_id
        AND (watch_duration::FLOAT / NULLIF(video_duration, 0)) >= 0.8
    )
    WHERE id = NEW.video_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_views_count
AFTER INSERT ON video_view_events
FOR EACH ROW
EXECUTE FUNCTION update_video_views_count();

-- 7. Add duration column to videos table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'videos' AND column_name = 'duration'
  ) THEN
    ALTER TABLE videos ADD COLUMN duration INTEGER DEFAULT 0;
    COMMENT ON COLUMN videos.duration IS 'Video duration in seconds (5 for photos)';
  END IF;
END $$;

-- 8. Create view for video analytics
CREATE OR REPLACE VIEW video_analytics AS
SELECT
  v.id,
  v.title,
  v.creator_id,
  v.duration,
  v.views_count,
  v.likes_count,
  COUNT(DISTINCT vve.user_id) AS unique_viewers,
  AVG(CASE
    WHEN vve.video_duration > 0
    THEN (vve.watch_duration::FLOAT / vve.video_duration) * 100
    ELSE 0
  END) AS avg_completion_rate,
  SUM(CASE WHEN vve.completed THEN 1 ELSE 0 END) AS completed_views,
  COUNT(vve.id) AS total_view_attempts
FROM videos v
LEFT JOIN video_view_events vve ON v.id = vve.video_id
GROUP BY v.id, v.title, v.creator_id, v.duration, v.views_count, v.likes_count;

-- 9. Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT ON video_view_events TO your_app_user;
-- GRANT EXECUTE ON FUNCTION count_valid_views TO your_app_user;
-- GRANT EXECUTE ON FUNCTION can_user_view TO your_app_user;
-- GRANT EXECUTE ON FUNCTION get_remaining_views TO your_app_user;

-- Migration complete
DO $$
BEGIN
  RAISE NOTICE '✅ View tracking migration complete!';
  RAISE NOTICE '   - video_view_events table created';
  RAISE NOTICE '   - Indexes created for performance';
  RAISE NOTICE '   - View validation functions created';
  RAISE NOTICE '   - Auto-update trigger created';
  RAISE NOTICE '   - Analytics view created';
END $$;
