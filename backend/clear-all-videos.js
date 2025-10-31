const { Pool } = require('pg')
require('dotenv').config({ path: '.env.production' })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

async function clearAllVideos() {
  try {
    console.log('🗑️  Deleting all videos and related data...')

    // Delete in order to respect foreign key constraints
    await pool.query('DELETE FROM video_likes')
    console.log('✅ Deleted all video likes')

    await pool.query('DELETE FROM video_views')
    console.log('✅ Deleted all video views')

    await pool.query('DELETE FROM comments')
    console.log('✅ Deleted all comments')

    await pool.query('DELETE FROM videos')
    console.log('✅ Deleted all videos')

    await pool.query('DELETE FROM tokens')
    console.log('✅ Deleted all tokens')

    await pool.query('DELETE FROM communities')
    console.log('✅ Deleted all communities')

    console.log('\n🎉 All videos and related data cleared successfully!')
    console.log('Platform is now reset and ready for fresh uploads.')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error clearing videos:', error)
    process.exit(1)
  }
}

clearAllVideos()
