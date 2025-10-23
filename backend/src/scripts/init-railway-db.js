#!/usr/bin/env node

/**
 * Railway Database Initialization Script
 *
 * This script initializes the PostgreSQL database on Railway with the complete schema.
 *
 * Usage:
 *   railway run node src/scripts/init-railway-db.js
 *
 * Or locally with DATABASE_URL:
 *   DATABASE_URL="postgresql://..." node src/scripts/init-railway-db.js
 */

const fs = require('fs')
const path = require('path')
const { Pool } = require('pg')

// ANSI color codes for better console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
}

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

async function initializeDatabase() {
  log('\n🚀 CCM ENGAGEMINT - Railway Database Initialization\n', colors.bright)

  // Check for DATABASE_URL
  if (!process.env.DATABASE_URL) {
    log('❌ ERROR: DATABASE_URL environment variable not found!', colors.red)
    log('   Make sure you are running this with Railway CLI:', colors.yellow)
    log('   railway run node src/scripts/init-railway-db.js\n', colors.yellow)
    process.exit(1)
  }

  log('📊 Database URL found', colors.green)
  log(`   Host: ${process.env.DATABASE_URL.match(/@([^:]+)/)?.[1] || 'unknown'}\n`)

  // Create database pool
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })

  try {
    // Test connection
    log('🔌 Testing database connection...', colors.blue)
    const client = await pool.connect()
    log('✅ Database connection successful!\n', colors.green)

    // Read the SQL initialization file
    log('📖 Reading database schema file...', colors.blue)
    const sqlFilePath = path.join(__dirname, '..', 'config', 'full-db-init.sql')

    if (!fs.existsSync(sqlFilePath)) {
      throw new Error(`SQL file not found at: ${sqlFilePath}`)
    }

    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8')
    log('✅ Schema file loaded\n', colors.green)

    // Execute the SQL
    log('⚙️  Executing database initialization...', colors.blue)
    log('   This may take a few moments...\n', colors.yellow)

    await client.query(sqlContent)

    log('✅ Database schema created successfully!\n', colors.green)

    // Verify table creation
    log('🔍 Verifying table creation...', colors.blue)
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `)

    log(`✅ Found ${result.rows.length} tables:\n`, colors.green)
    result.rows.forEach((row, index) => {
      log(`   ${(index + 1).toString().padStart(2, ' ')}. ${row.table_name}`, colors.blue)
    })

    // Check default interests
    log('\n🎯 Verifying default interests...', colors.blue)
    const interestsResult = await client.query('SELECT COUNT(*) FROM interests')
    log(`✅ Found ${interestsResult.rows[0].count} interests\n`, colors.green)

    client.release()

    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.bright)
    log('🎉 DATABASE INITIALIZATION COMPLETE!', colors.green)
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.bright)
    log('\n✅ Your Railway database is ready to use!\n', colors.green)
    log('Next steps:', colors.yellow)
    log('  1. Deploy your backend: railway up', colors.blue)
    log('  2. Test the API: curl https://your-app.up.railway.app/api/health', colors.blue)
    log('  3. Update frontend with backend URL\n', colors.blue)

  } catch (error) {
    log('\n❌ DATABASE INITIALIZATION FAILED!\n', colors.red)
    log('Error details:', colors.yellow)
    console.error(error)
    log('\nTroubleshooting:', colors.yellow)
    log('  1. Verify DATABASE_URL is correct', colors.blue)
    log('  2. Check Railway PostgreSQL service is running', colors.blue)
    log('  3. Ensure you have database permissions\n', colors.blue)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

// Run the initialization
initializeDatabase().catch((error) => {
  log('\n❌ Unexpected error:', colors.red)
  console.error(error)
  process.exit(1)
})
