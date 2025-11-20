-- =============================================
-- Blockchain Sync Migration
-- Adds columns to track on-chain state
-- Run: psql -d your_db -f add-blockchain-sync.sql
-- =============================================

-- Add blockchain reference columns to tokens table
ALTER TABLE tokens
ADD COLUMN IF NOT EXISTS mint_address VARCHAR(44) UNIQUE,
ADD COLUMN IF NOT EXISTS bonding_curve_address VARCHAR(44),
ADD COLUMN IF NOT EXISTS curve_authority_address VARCHAR(44),
ADD COLUMN IF NOT EXISTS curve_sol_vault_address VARCHAR(44),
ADD COLUMN IF NOT EXISTS deployment_signature VARCHAR(88),
ADD COLUMN IF NOT EXISTS deployed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS is_graduated BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS real_sol_reserves BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS real_token_reserves BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS virtual_sol_reserves BIGINT DEFAULT 30000000000,
ADD COLUMN IF NOT EXISTS virtual_token_reserves BIGINT DEFAULT 1073000000000000,
ADD COLUMN IF NOT EXISTS trade_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP;

-- Add indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_tokens_mint_address ON tokens(mint_address);
CREATE INDEX IF NOT EXISTS idx_tokens_bonding_curve ON tokens(bonding_curve_address);
CREATE INDEX IF NOT EXISTS idx_tokens_graduated ON tokens(is_graduated);
CREATE INDEX IF NOT EXISTS idx_tokens_last_synced ON tokens(last_synced_at);

-- Add similar columns to videos table for token association
ALTER TABLE videos
ADD COLUMN IF NOT EXISTS token_mint_address VARCHAR(44),
ADD COLUMN IF NOT EXISTS bonding_curve_address VARCHAR(44),
ADD COLUMN IF NOT EXISTS is_minted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS minted_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS launch_path VARCHAR(20) CHECK (launch_path IN ('instant', 'viral')),
ADD COLUMN IF NOT EXISTS is_token_launched BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS launch_signature VARCHAR(88),
ADD COLUMN IF NOT EXISTS launched_by VARCHAR(50),
ADD COLUMN IF NOT EXISTS launch_timestamp TIMESTAMP,
ADD COLUMN IF NOT EXISTS viral_launch_threshold INTEGER DEFAULT 10000;

CREATE INDEX IF NOT EXISTS idx_videos_token_mint ON videos(token_mint_address);
CREATE INDEX IF NOT EXISTS idx_videos_is_minted ON videos(is_minted);
CREATE INDEX IF NOT EXISTS idx_videos_launch_path ON videos(launch_path);

-- Create table for tracking backend token launches (viral auto-launch)
CREATE TABLE IF NOT EXISTS backend_token_launches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  mint_address VARCHAR(44) NOT NULL,
  bonding_curve_address VARCHAR(44) NOT NULL,
  launch_signature VARCHAR(88) NOT NULL,
  sol_spent DECIMAL(20, 9) NOT NULL,
  likes_at_launch INTEGER NOT NULL,
  viral_score_at_launch INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_backend_launches_video ON backend_token_launches(video_id);
CREATE INDEX IF NOT EXISTS idx_backend_launches_mint ON backend_token_launches(mint_address);

-- Create table for token holders (for tracking portfolio)
CREATE TABLE IF NOT EXISTS token_holders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token_mint_address VARCHAR(44) NOT NULL,
  balance BIGINT DEFAULT 0,
  avg_buy_price DECIMAL(20, 9) DEFAULT 0,
  total_invested DECIMAL(20, 9) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, token_mint_address)
);

CREATE INDEX IF NOT EXISTS idx_token_holders_user ON token_holders(user_id);
CREATE INDEX IF NOT EXISTS idx_token_holders_token ON token_holders(token_mint_address);
CREATE INDEX IF NOT EXISTS idx_token_holders_balance ON token_holders(balance);

-- Create table for token trades (for analytics)
CREATE TABLE IF NOT EXISTS token_trades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token_mint_address VARCHAR(44) NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  trade_type VARCHAR(4) CHECK (trade_type IN ('buy', 'sell')),
  sol_amount BIGINT NOT NULL,
  token_amount BIGINT NOT NULL,
  price_per_token DECIMAL(20, 9) NOT NULL,
  signature VARCHAR(88) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_token_trades_token ON token_trades(token_mint_address);
CREATE INDEX IF NOT EXISTS idx_token_trades_user ON token_trades(user_id);
CREATE INDEX IF NOT EXISTS idx_token_trades_created_at ON token_trades(created_at DESC);

-- Create table for price history (for charts)
CREATE TABLE IF NOT EXISTS token_price_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mint_address VARCHAR(44) NOT NULL,
  price DECIMAL(20, 9) NOT NULL,
  market_cap DECIMAL(20, 2) NOT NULL,
  volume_24h DECIMAL(20, 9) DEFAULT 0,
  real_sol_reserves BIGINT NOT NULL,
  real_token_reserves BIGINT NOT NULL,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_price_history_mint ON token_price_history(mint_address);
CREATE INDEX IF NOT EXISTS idx_price_history_recorded ON token_price_history(recorded_at DESC);

-- Create table for video reports (moderation)
CREATE TABLE IF NOT EXISTS video_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'action_taken', 'dismissed')),
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_video_reports_video ON video_reports(video_id);
CREATE INDEX IF NOT EXISTS idx_video_reports_status ON video_reports(status);

-- Create function to update updated_at timestamp for token_holders
CREATE OR REPLACE FUNCTION update_token_holder_updated_at()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_token_holders_updated_at ON token_holders;
CREATE TRIGGER update_token_holders_updated_at
BEFORE UPDATE ON token_holders
FOR EACH ROW EXECUTE FUNCTION update_token_holder_updated_at();

-- Add comment explaining the migration
COMMENT ON COLUMN tokens.mint_address IS 'Solana token mint address (unique identifier)';
COMMENT ON COLUMN tokens.bonding_curve_address IS 'PDA address of bonding curve program account';
COMMENT ON COLUMN tokens.is_graduated IS 'True when token has migrated to Raydium (reached threshold)';
COMMENT ON COLUMN tokens.real_sol_reserves IS 'Actual SOL in bonding curve (in lamports)';
COMMENT ON COLUMN tokens.real_token_reserves IS 'Actual tokens in bonding curve (in token-lamports)';
COMMENT ON TABLE backend_token_launches IS 'Tracks tokens auto-launched by backend (PATH B: viral videos)';
COMMENT ON TABLE token_holders IS 'Tracks user token holdings for portfolio dashboard';
COMMENT ON TABLE token_trades IS 'Records all buy/sell transactions for analytics';
COMMENT ON TABLE token_price_history IS 'Snapshots price over time for charts';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Blockchain sync migration completed successfully!';
  RAISE NOTICE 'Tables updated: tokens, videos';
  RAISE NOTICE 'Tables created: backend_token_launches, token_holders, token_trades, token_price_history, video_reports';
  RAISE NOTICE 'Indexes created: 14 new indexes for performance';
END $$;
