import { z } from 'zod'

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),

  // Authentication
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  APP_PASSWORD_HASH: z.string().min(1, 'APP_PASSWORD_HASH is required'),

  // OAuth - TikTok
  NEXT_PUBLIC_TIKTOK_CLIENT_KEY: z.string().min(1),
  TIKTOK_CLIENT_SECRET: z.string().min(1),
  NEXT_PUBLIC_TIKTOK_REDIRECT_URI: z.string().url(),

  // OAuth - Instagram
  NEXT_PUBLIC_INSTAGRAM_CLIENT_ID: z.string().min(1),
  INSTAGRAM_CLIENT_SECRET: z.string().min(1),
  NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI: z.string().url(),

  // File Storage
  BLOB_READ_WRITE_TOKEN: z.string().optional(),

  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

// Validate environment variables
export function validateEnv() {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:')
      error.errors.forEach((err) => {
        console.error(`  ${err.path.join('.')}: ${err.message}`)
      })
      throw new Error('Invalid environment variables')
    }
    throw error
  }
}

// Export validated env
export const env = validateEnv()
