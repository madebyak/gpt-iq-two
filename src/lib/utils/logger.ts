/**
 * Centralized logging utility
 * Provides consistent logging with different severity levels that respect the environment
 * In production, debug and info logs are suppressed, while warnings and errors are preserved
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Only show debug and info logs in development
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Structured logger with environment-aware log levels
 */
export const logger = {
  /**
   * Debug level logging - only shown in development
   * Use for temporary debugging that should never appear in production
   */
  debug: (message: string, ...args: any[]) => {
    if (isDevelopment) console.debug(`[DEBUG] ${message}`, ...args);
  },
  
  /**
   * Info level logging - only shown in development
   * Use for general information that's helpful during development
   */
  info: (message: string, ...args: any[]) => {
    if (isDevelopment) console.info(`[INFO] ${message}`, ...args);
  },
  
  /**
   * Warning level logging - shown in all environments
   * Use for potential issues that don't stop execution
   */
  warn: (message: string, ...args: any[]) => {
    console.warn(`[WARN] ${message}`, ...args);
  },
  
  /**
   * Error level logging - shown in all environments
   * Use for actual errors that affect functionality
   */
  error: (message: string, ...args: any[]) => {
    console.error(`[ERROR] ${message}`, ...args);
  }
};
