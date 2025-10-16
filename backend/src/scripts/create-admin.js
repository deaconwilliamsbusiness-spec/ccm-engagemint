const bcrypt = require('bcrypt')
const { query } = require('../config/database')

async function createAdminAccount() {
  try {
    // First, add is_admin column to users table if it doesn't exist
    await query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE
    `)

    console.log('✓ Added is_admin column to users table')

    // Create dev admin account
    const email = 'admin@engagemint.dev'
    const username = 'devadmin'
    const password = 'EngageMintDev2025!' // CHANGE THIS IN PRODUCTION!
    const passwordHash = await bcrypt.hash(password, 10)

    // Check if admin already exists
    const existingAdmin = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    )

    if (existingAdmin.rows.length > 0) {
      // Update existing admin
      await query(
        `UPDATE users
         SET is_admin = TRUE,
             is_verified = TRUE,
             is_active = TRUE,
             password_hash = $1
         WHERE email = $2`,
        [passwordHash, email]
      )
      console.log('✓ Updated existing admin account')
    } else {
      // Create new admin
      const result = await query(
        `INSERT INTO users (username, email, password_hash, display_name, is_admin, is_verified, is_active)
         VALUES ($1, $2, $3, $4, TRUE, TRUE, TRUE)
         RETURNING id, username, email`,
        [username, email, passwordHash, '🔥 Dev Admin']
      )

      console.log('✓ Created new admin account:', result.rows[0])
    }

    console.log('\n🎉 DEV ADMIN ACCOUNT READY!')
    console.log('═══════════════════════════════════════')
    console.log('Email:    ', email)
    console.log('Password: ', password)
    console.log('═══════════════════════════════════════')
    console.log('\n⚠️  CHANGE PASSWORD IN PRODUCTION! ⚠️\n')

    process.exit(0)
  } catch (error) {
    console.error('Error creating admin account:', error)
    process.exit(1)
  }
}

createAdminAccount()
