require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('railway.app') || process.env.DATABASE_URL.includes('rlwy.net') ? { rejectUnauthorized: false } : false
});

async function createTable() {
  try {
    console.log('Creating video_engagement_history table...');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS video_engagement_history (
        id SERIAL PRIMARY KEY,
        video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
        views_count INTEGER DEFAULT 0,
        likes_count INTEGER DEFAULT 0,
        comments_count INTEGER DEFAULT 0,
        shares_count INTEGER DEFAULT 0,
        engagement_rate DECIMAL(5,2),
        recorded_at TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('✅ Table created successfully');

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_engagement_history_video ON video_engagement_history(video_id);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_engagement_history_recorded ON video_engagement_history(recorded_at);
    `);

    console.log('✅ Indexes created successfully');

    await pool.end();
    console.log('✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createTable();
