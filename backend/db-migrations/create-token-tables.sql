-- ============================================================================
-- EngageMint Token & Trading Tables
-- ============================================================================

-- Tokens table: Stores all minted tokens
CREATE TABLE IF NOT EXISTS tokens (
    id VARCHAR(255) PRIMARY KEY,
    mint_address VARCHAR(255) UNIQUE NOT NULL,
    bonding_curve_address VARCHAR(255) UNIQUE NOT NULL,
    curve_authority_address VARCHAR(255),
    curve_sol_vault_address VARCHAR(255),
    curve_token_vault_address VARCHAR(255),

    -- Token metadata
    token_name VARCHAR(255) NOT NULL,
    token_symbol VARCHAR(50) NOT NULL,
    token_uri TEXT,
    description TEXT,

    -- Associated content
    video_id UUID REFERENCES videos(id) ON DELETE SET NULL,
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Launch info
    launch_path VARCHAR(20) CHECK (launch_path IN ('instant', 'viral')),
    created_at TIMESTAMP DEFAULT NOW(),

    -- Bonding curve state (cached from blockchain)
    current_price DECIMAL(20, 12) DEFAULT 0,
    market_cap DECIMAL(20, 2) DEFAULT 0,
    total_supply BIGINT DEFAULT 1000000000,

    -- Graduation status
    is_graduated BOOLEAN DEFAULT FALSE,
    raydium_pool_address VARCHAR(255),
    graduated_at TIMESTAMP,

    -- Stats
    trade_count INTEGER DEFAULT 0,
    total_volume DECIMAL(20, 8) DEFAULT 0,
    holder_count INTEGER DEFAULT 0,

    -- External links (stored as JSON)
    external_links JSONB DEFAULT '{}'::jsonb,

    updated_at TIMESTAMP DEFAULT NOW()
);

-- Token trades table: Records all buy/sell transactions
CREATE TABLE IF NOT EXISTS token_trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_mint_address VARCHAR(255) NOT NULL REFERENCES tokens(mint_address) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Trade details
    trade_type VARCHAR(10) CHECK (trade_type IN ('buy', 'sell')),
    sol_amount BIGINT NOT NULL,  -- in lamports
    token_amount BIGINT NOT NULL,  -- in smallest unit
    price_per_token DECIMAL(20, 12),

    -- Transaction info
    signature VARCHAR(255) UNIQUE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),

    -- Slippage & fees
    slippage_percent DECIMAL(5, 2),
    fee_amount BIGINT DEFAULT 0,

    created_at TIMESTAMP DEFAULT NOW(),

    INDEX idx_token_trades_token (token_mint_address),
    INDEX idx_token_trades_user (user_id),
    INDEX idx_token_trades_created (created_at DESC)
);

-- Token holders table: Tracks current token holders (updated periodically)
CREATE TABLE IF NOT EXISTS token_holders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_mint_address VARCHAR(255) NOT NULL REFERENCES tokens(mint_address) ON DELETE CASCADE,
    wallet_address VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Holdings
    balance BIGINT NOT NULL DEFAULT 0,  -- in smallest unit
    percentage_owned DECIMAL(5, 4),  -- percentage of total supply

    -- Stats
    first_acquired_at TIMESTAMP DEFAULT NOW(),
    last_updated TIMESTAMP DEFAULT NOW(),
    total_bought BIGINT DEFAULT 0,
    total_sold BIGINT DEFAULT 0,

    UNIQUE(token_mint_address, wallet_address),
    INDEX idx_token_holders_token (token_mint_address),
    INDEX idx_token_holders_wallet (wallet_address)
);

-- Token price history: Tracks price over time for charts
CREATE TABLE IF NOT EXISTS token_price_history (
    id BIGSERIAL PRIMARY KEY,
    token_mint_address VARCHAR(255) NOT NULL REFERENCES tokens(mint_address) ON DELETE CASCADE,

    -- Price data
    price DECIMAL(20, 12) NOT NULL,
    market_cap DECIMAL(20, 2),
    volume DECIMAL(20, 8),

    -- Bonding curve state
    sol_reserves BIGINT,
    token_reserves BIGINT,

    -- Timestamp (1 minute intervals)
    timestamp TIMESTAMP DEFAULT NOW(),

    INDEX idx_price_history_token (token_mint_address),
    INDEX idx_price_history_timestamp (timestamp DESC)
);

-- Token events: Log important events (launches, migrations, etc.)
CREATE TABLE IF NOT EXISTS token_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_mint_address VARCHAR(255) NOT NULL REFERENCES tokens(mint_address) ON DELETE CASCADE,

    -- Event details
    event_type VARCHAR(50) NOT NULL,  -- 'launch', 'first_trade', 'graduated', 'milestone'
    event_data JSONB DEFAULT '{}'::jsonb,
    description TEXT,

    -- Transaction
    signature VARCHAR(255),

    created_at TIMESTAMP DEFAULT NOW(),

    INDEX idx_token_events_token (token_mint_address),
    INDEX idx_token_events_type (event_type),
    INDEX idx_token_events_created (created_at DESC)
);

-- User token watchlist: Users can track tokens they're interested in
CREATE TABLE IF NOT EXISTS token_watchlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_mint_address VARCHAR(255) NOT NULL REFERENCES tokens(mint_address) ON DELETE CASCADE,

    -- Notification preferences
    notify_on_price_change BOOLEAN DEFAULT TRUE,
    notify_on_graduation BOOLEAN DEFAULT TRUE,

    added_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(user_id, token_mint_address),
    INDEX idx_watchlist_user (user_id)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_tokens_creator ON tokens(creator_id);
CREATE INDEX IF NOT EXISTS idx_tokens_video ON tokens(video_id);
CREATE INDEX IF NOT EXISTS idx_tokens_created ON tokens(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tokens_graduated ON tokens(is_graduated);
CREATE INDEX IF NOT EXISTS idx_tokens_market_cap ON tokens(market_cap DESC);
CREATE INDEX IF NOT EXISTS idx_tokens_volume ON tokens(total_volume DESC);

-- ============================================================================
-- TRIGGERS FOR AUTO-UPDATE
-- ============================================================================

-- Update tokens.updated_at on any change
CREATE OR REPLACE FUNCTION update_token_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_token_timestamp
    BEFORE UPDATE ON tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_token_timestamp();

-- Increment trade count when new trade is added
CREATE OR REPLACE FUNCTION increment_trade_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE tokens
    SET
        trade_count = trade_count + 1,
        total_volume = total_volume + (NEW.sol_amount::decimal / 1000000000)
    WHERE mint_address = NEW.token_mint_address;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_trade_count
    AFTER INSERT ON token_trades
    FOR EACH ROW
    EXECUTE FUNCTION increment_trade_count();

-- ============================================================================
-- VIEWS FOR CONVENIENT QUERIES
-- ============================================================================

-- Top tokens by volume
CREATE OR REPLACE VIEW top_tokens_by_volume AS
SELECT
    t.*,
    u.username AS creator_username,
    COUNT(DISTINCT th.wallet_address) AS holder_count,
    COUNT(tt.id) AS total_trades
FROM tokens t
LEFT JOIN users u ON t.creator_id = u.id
LEFT JOIN token_holders th ON t.mint_address = th.token_mint_address
LEFT JOIN token_trades tt ON t.mint_address = tt.token_mint_address
GROUP BY t.id, u.username
ORDER BY t.total_volume DESC;

-- Recently launched tokens
CREATE OR REPLACE VIEW recently_launched_tokens AS
SELECT
    t.*,
    u.username AS creator_username,
    v.title AS video_title,
    COUNT(tt.id) AS trade_count_24h
FROM tokens t
LEFT JOIN users u ON t.creator_id = u.id
LEFT JOIN videos v ON t.video_id = v.id
LEFT JOIN token_trades tt ON t.mint_address = tt.token_mint_address
    AND tt.created_at >= NOW() - INTERVAL '24 hours'
WHERE t.created_at >= NOW() - INTERVAL '7 days'
GROUP BY t.id, u.username, v.title
ORDER BY t.created_at DESC;

-- Tokens close to graduation
CREATE OR REPLACE VIEW tokens_near_graduation AS
SELECT
    t.*,
    u.username AS creator_username,
    (
        SELECT sol_reserves::decimal / 1000000000
        FROM token_price_history
        WHERE token_mint_address = t.mint_address
        ORDER BY timestamp DESC
        LIMIT 1
    ) AS current_sol_raised
FROM tokens t
LEFT JOIN users u ON t.creator_id = u.id
WHERE t.is_graduated = FALSE
ORDER BY current_sol_raised DESC;

-- ============================================================================
-- SAMPLE DATA (DEVELOPMENT ONLY)
-- ============================================================================

-- Uncomment for dev environment
-- INSERT INTO tokens (id, mint_address, bonding_curve_address, token_name, token_symbol, creator_id, launch_path)
-- VALUES
--     ('DEMO1', 'DemoMint1...', 'DemoCurve1...', 'Demo Token 1', 'DEMO1', (SELECT id FROM users LIMIT 1), 'instant'),
--     ('DEMO2', 'DemoMint2...', 'DemoCurve2...', 'Viral Token', 'VIRAL', (SELECT id FROM users LIMIT 1), 'viral');

-- ============================================================================
-- GRANTS (if using specific database users)
-- ============================================================================

-- GRANT SELECT, INSERT, UPDATE ON tokens TO engagemint_app;
-- GRANT SELECT, INSERT ON token_trades TO engagemint_app;
-- GRANT SELECT, INSERT, UPDATE ON token_holders TO engagemint_app;
-- GRANT SELECT, INSERT ON token_price_history TO engagemint_app;
-- GRANT SELECT, INSERT ON token_events TO engagemint_app;
-- GRANT SELECT, INSERT, DELETE ON token_watchlist TO engagemint_app;
