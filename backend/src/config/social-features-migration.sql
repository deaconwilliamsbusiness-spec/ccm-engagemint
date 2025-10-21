-- Social Features Migration
-- Run this to add following/followers and personalization features

-- User follows table (Instagram/TikTok-style following)
CREATE TABLE IF NOT EXISTS user_follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id) -- Users cannot follow themselves
);

-- Interests/Categories table
CREATE TABLE IF NOT EXISTS interests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  icon TEXT, -- emoji or icon reference
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User interests (for personalized recommendations)
CREATE TABLE IF NOT EXISTS user_interests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  interest_id UUID REFERENCES interests(id) ON DELETE CASCADE,
  weight DECIMAL(3, 2) DEFAULT 1.0, -- Interest strength (0.0 to 1.0)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, interest_id)
);

-- User preferences for personalization
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  content_language VARCHAR(10) DEFAULT 'en',
  auto_play_videos BOOLEAN DEFAULT TRUE,
  show_mature_content BOOLEAN DEFAULT FALSE,
  personalized_recommendations BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Video views tracking (for recommendations algorithm)
CREATE TABLE IF NOT EXISTS video_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  watch_duration INTEGER DEFAULT 0, -- seconds watched
  completed BOOLEAN DEFAULT FALSE, -- watched to end
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(video_id, user_id)
);

-- User activity log (for feed algorithm)
CREATE TABLE IF NOT EXISTS user_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL, -- 'view', 'like', 'comment', 'share', 'follow'
  target_id UUID, -- video_id, user_id, etc.
  target_type VARCHAR(50), -- 'video', 'user', 'comment'
  metadata JSONB, -- additional activity data
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_user_interests_user ON user_interests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interests_interest ON user_interests(interest_id);
CREATE INDEX IF NOT EXISTS idx_video_views_video ON video_views(video_id);
CREATE INDEX IF NOT EXISTS idx_video_views_user ON video_views(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_user ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_type ON user_activity(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON user_activity(created_at DESC);

-- Triggers to automatically update updated_at
CREATE TRIGGER update_user_interests_updated_at BEFORE UPDATE ON user_interests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default interests
INSERT INTO interests (name, display_name, icon, description) VALUES
  ('music', 'Music', '🎵', 'Music videos, performances, and content'),
  ('comedy', 'Comedy', '😂', 'Funny videos and comedy sketches'),
  ('crypto', 'Crypto & Web3', '💎', 'Cryptocurrency and blockchain content'),
  ('gaming', 'Gaming', '🎮', 'Gaming videos and esports'),
  ('dance', 'Dance', '💃', 'Dance videos and choreography'),
  ('food', 'Food', '🍔', 'Cooking, recipes, and food content'),
  ('fitness', 'Fitness', '💪', 'Workout routines and fitness tips'),
  ('tech', 'Technology', '📱', 'Tech reviews and tutorials'),
  ('art', 'Art & Design', '🎨', 'Art, design, and creative content'),
  ('fashion', 'Fashion', '👗', 'Fashion trends and styling'),
  ('travel', 'Travel', '✈️', 'Travel vlogs and destinations'),
  ('education', 'Education', '📚', 'Educational and tutorial content'),
  ('memes', 'Memes', '😎', 'Meme culture and viral trends'),
  ('nft', 'NFT & Digital Art', '🖼️', 'NFT and digital art content'),
  ('business', 'Business', '💼', 'Entrepreneurship and business tips')
ON CONFLICT (name) DO NOTHING;

-- Function to get follower count
CREATE OR REPLACE FUNCTION get_follower_count(user_uuid UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER FROM user_follows WHERE following_id = user_uuid;
$$ LANGUAGE SQL STABLE;

-- Function to get following count
CREATE OR REPLACE FUNCTION get_following_count(user_uuid UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER FROM user_follows WHERE follower_id = user_uuid;
$$ LANGUAGE SQL STABLE;

-- Function to check if user A follows user B
CREATE OR REPLACE FUNCTION is_following(follower_uuid UUID, following_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM user_follows
    WHERE follower_id = follower_uuid AND following_id = following_uuid
  );
$$ LANGUAGE SQL STABLE;
