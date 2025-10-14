// Temporary in-memory storage for users (no database required)
const bcrypt = require('bcrypt')

let users = []
let userIdCounter = 1

class UserMemory {
  // Create a new user
  static async create({ username, email, password }) {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = {
      id: 'user-' + userIdCounter++,
      username,
      email,
      password_hash: passwordHash,
      display_name: username,
      bio: null,
      profile_image_url: null,
      wallet_address: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_verified: false,
      is_active: true
    }

    users.push(user)
    return user
  }

  // Find user by email
  static async findByEmail(email) {
    return users.find(u => u.email === email)
  }

  // Find user by username
  static async findByUsername(username) {
    return users.find(u => u.username === username)
  }

  // Find user by ID
  static async findById(id) {
    const user = users.find(u => u.id === id)
    if (!user) return null

    // Return without password_hash
    const { password_hash, ...userWithoutPassword } = user
    return userWithoutPassword
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword)
  }

  // Check if email exists
  static async emailExists(email) {
    return users.some(u => u.email === email)
  }

  // Check if username exists
  static async usernameExists(username) {
    return users.some(u => u.username === username)
  }
}

module.exports = UserMemory
