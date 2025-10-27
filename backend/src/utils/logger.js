/**
 * Logger utility that respects NODE_ENV
 * Only logs in development, silent in production
 */

const isDevelopment = process.env.NODE_ENV !== 'production'

const logger = {
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args)
    }
  },

  error: (...args) => {
    // Always log errors, even in production
    console.error(...args)
  },

  warn: (...args) => {
    if (isDevelopment) {
      console.warn(...args)
    }
  },

  info: (...args) => {
    // Info logs shown in both dev and prod
    console.info(...args)
  },

  debug: (...args) => {
    // Debug only in development
    if (isDevelopment) {
      console.debug(...args)
    }
  }
}

module.exports = logger
