-- ============================================================================
-- Content Moderation System Migration
-- ============================================================================
-- This migration adds the video_reports table for content moderation
-- Allows users to report inappropriate content
-- Auto-hides videos that receive 5+ reports

-- ============================================================================
-- VIDEO REPORTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS video_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id VARCHAR(255) NOT NULL,
  user_id UUID,
  reason TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),

  -- Indexes for performance
  CONSTRAINT fk_video_reports_video FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
  CONSTRAINT fk_video_reports_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_video_reports_video_id ON video_reports(video_id);
CREATE INDEX IF NOT EXISTS idx_video_reports_user_id ON video_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_video_reports_created_at ON video_reports(created_at DESC);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get report count for a video
CREATE OR REPLACE FUNCTION get_report_count(p_video_id VARCHAR)
RETURNS INTEGER AS $$
DECLARE
  count INTEGER;
BEGIN
  SELECT COUNT(*) INTO count
  FROM video_reports
  WHERE video_id = p_video_id;

  RETURN count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ANALYTICS VIEW
-- ============================================================================

-- View for moderation analytics
CREATE OR REPLACE VIEW video_report_analytics AS
SELECT
  v.id as video_id,
  v.title,
  v.creator_id,
  u.username as creator_username,
  COUNT(vr.id) as report_count,
  ARRAY_AGG(DISTINCT vr.reason) as report_reasons,
  MAX(vr.created_at) as last_reported_at,
  v.is_published
FROM videos v
LEFT JOIN video_reports vr ON v.id = vr.video_id
LEFT JOIN users u ON v.creator_id = u.id
WHERE EXISTS (SELECT 1 FROM video_reports WHERE video_id = v.id)
GROUP BY v.id, v.title, v.creator_id, u.username, v.is_published
ORDER BY report_count DESC, last_reported_at DESC;

-- ============================================================================
-- GRANTS (if using specific database users)
-- ============================================================================

-- Grant permissions to your application user
-- GRANT SELECT, INSERT ON video_reports TO your_app_user;
-- GRANT SELECT ON video_report_analytics TO your_app_user;
-- GRANT EXECUTE ON FUNCTION get_report_count(VARCHAR) TO your_app_user;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify table creation
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'video_reports') THEN
    RAISE NOTICE '✅ video_reports table created successfully';
  ELSE
    RAISE EXCEPTION '❌ Failed to create video_reports table';
  END IF;
END $$;

-- Verify view creation
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'video_report_analytics') THEN
    RAISE NOTICE '✅ video_report_analytics view created successfully';
  ELSE
    RAISE WARNING '⚠️  video_report_analytics view not created';
  END IF;
END $$;

RAISE NOTICE '🎉 Content moderation migration completed successfully!';
