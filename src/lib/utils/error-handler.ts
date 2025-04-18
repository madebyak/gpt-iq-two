/**
 * Standardized error handling utilities
 * Provides consistent error handling patterns across the application
 */

import { logger } from './logger';

/**
 * Processes an error of any type into a user-friendly error message
 * @param error - The error to process
 * @param defaultMessage - Default message to show if error can't be processed
 * @returns A user-friendly error message string
 */
export function handleApiError(error: unknown, defaultMessage = "An unexpected error occurred"): string {
  // For Error instances, use the error message
  if (error instanceof Error) return error.message;
  
  // For string errors, use directly
  if (typeof error === 'string') return error;
  
  // For Supabase-style errors that have a message property
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  
  // For any other type, return the default message
  return defaultMessage;
}

/**
 * Logs an error with contextual information
 * @param error - The error to log
 * @param context - Context identifier to help with debugging
 */
export function logError(error: unknown, context: string): void {
  logger.error(`Error in ${context}:`, error);
}

/**
 * Processes and logs an error in a standardized way
 * @param error - The error to process
 * @param context - Context identifier to help with debugging
 * @param defaultMessage - Default message to show if error can't be processed
 * @returns A user-friendly error message string
 */
export function processError(error: unknown, context: string, defaultMessage?: string): string {
  logError(error, context);
  return handleApiError(error, defaultMessage);
}

/**
 * Creates a standardized error handler for async functions
 * @param context - Context identifier to help with debugging
 * @param defaultMessage - Default message to show if error can't be processed
 * @returns A function that wraps your async operations with standardized error handling
 */
export function createErrorHandler(context: string, defaultMessage?: string) {
  return async <T>(operation: () => Promise<T>): Promise<[T | null, string | null]> => {
    try {
      const result = await operation();
      return [result, null];
    } catch (error) {
      const errorMessage = processError(error, context, defaultMessage);
      return [null, errorMessage];
    }
  };
}
