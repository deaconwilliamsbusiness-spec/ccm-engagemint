-- Creator Settings Migration
-- Adds fields for community giveback percentage and total earnings tracking

-- Add giveback_percentage column to users table (0-50%)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS giveback_percentage INTEGER DEFAULT 0
CHECK (giveback_percentage >= 0 AND giveback_percentage <= 50);

-- Add total_earnings column to users table (starts at 0, will be updated when Solana is integrated)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS total_earnings DECIMAL(20, 2) DEFAULT 0;

-- Add comment for clarity
COMMENT ON COLUMN users.giveback_percentage IS 'Percentage of earnings returned to community (0-50%)';
COMMENT ON COLUMN users.total_earnings IS 'Total earnings accumulated by creator (updated via Solana integration)';
