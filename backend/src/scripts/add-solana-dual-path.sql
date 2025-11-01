-- ========================================
-- ENGAGEMINT SOLANA DUAL-PATH MIGRATION
-- ========================================
-- Adds support for:
-- - PATH A: Instant Mint (user pays SOL)
-- - PATH B: Viral Auto-Launch (backend pays)
-- ========================================

-- Add Solana columns to videos table
ALTER TABLE videos
ADD COLUMN IF NOT EXISTS upload_path VARCHAR(20) DEFAULT 'viral'
  CHECK (upload_path IN ('instant', 'viral')),
ADD COLUMN IF NOT EXISTS token_mint_address VARCHAR(44),
ADD COLUMN IF NOT EXISTS bonding_curve_address VARCHAR(44),
ADD COLUMN IF NOT EXISTS viral_launch_threshold INTEGER DEFAULT 10000,
ADD COLUMN IF NOT EXISTS is_token_launched BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS launch_signature VARCHAR(88),
ADD COLUMN IF NOT EXISTS launched_by VARCHAR(20)
  CHECK (launched_by IN ('user', 'backend')),
ADD COLUMN IF NOT EXISTS launch_timestamp TIMESTAMP,
ADD COLUMN IF NOT EXISTS sol_paid_by_user DECIMAL(10, 9);

-- Add Solana wallet address to users (if not already exists)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS wallet_address VARCHAR(44) UNIQUE;

-- Add Solana mint address to tokens table
ALTER TABLE tokens
ADD COLUMN IF NOT EXISTS mint_address VARCHAR(44) UNIQUE,
ADD COLUMN IF NOT EXISTS bonding_curve_address VARCHAR(44);

-- Create backend_token_launches tracking table
CREATE TABLE IF NOT EXISTS backend_token_launches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  mint_address VARCHAR(44) UNIQUE NOT NULL,
  bonding_curve_address VARCHAR(44) NOT NULL,
  launch_signature VARCHAR(88) NOT NULL,
  sol_spent DECIMAL(10, 9) NOT NULL,
  likes_at_launch INTEGER NOT NULL,
  viral_score_at_launch INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance

-- Index for viral monitoring (checks unlaunched viral videos)
CREATE INDEX IF NOT EXISTS idx_videos_viral_check
ON videos(upload_path, is_token_launched, likes_count)
WHERE upload_path = 'viral' AND is_token_launched = false;

-- Index for launched tokens lookup
CREATE INDEX IF NOT EXISTS idx_videos_token_launched
ON videos(is_token_launched, token_mint_address)
WHERE is_token_launched = true;

-- Index for user wallet lookups
CREATE INDEX IF NOT EXISTS idx_users_wallet_address
ON users(wallet_address)
WHERE wallet_address IS NOT NULL;

-- Index for token mint address lookups
CREATE INDEX IF NOT EXISTS idx_tokens_mint_address
ON tokens(mint_address)
WHERE mint_address IS NOT NULL;

-- Index for backend launch tracking
CREATE INDEX IF NOT EXISTS idx_backend_launches_video
ON backend_token_launches(video_id);

CREATE INDEX IF NOT EXISTS idx_backend_launches_mint
ON backend_token_launches(mint_address);

-- Add comments for documentation
COMMENT ON COLUMN videos.upload_path IS 'instant = user paid SOL upfront, viral = free upload with auto-launch at threshold';
COMMENT ON COLUMN videos.viral_launch_threshold IS 'Number of likes required for auto-launch (default 10000)';
COMMENT ON COLUMN videos.launched_by IS 'user = instant mint, backend = viral auto-launch';
COMMENT ON COLUMN videos.sol_paid_by_user IS 'Amount of SOL user paid for instant mint (null for viral)';

COMMENT ON TABLE backend_token_launches IS 'Tracks all tokens auto-launched by backend wallet for viral videos';

-- Migration complete
DO $$
BEGIN
  RAISE NOTICE '✅ Solana dual-path migration completed successfully!';
  RAISE NOTICE '   - PATH A: Instant Mint (user pays)';
  RAISE NOTICE '   - PATH B: Viral Auto-Launch (backend pays)';
  RAISE NOTICE '   - Viral threshold: 10,000 likes';
END $$;
