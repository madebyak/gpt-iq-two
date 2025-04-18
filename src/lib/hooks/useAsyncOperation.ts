/**
 * Hook for managing async operations with consistent loading, error, and data states
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { processError } from '../utils/error-handler';
import { logger } from '../utils/logger';

/**
 * Generic hook for managing async operations with consistent state handling
 * @param operation - Function that returns a promise
 * @param context - Context string for error logging
 * @param options - Optional configuration options
 */
export function useAsyncOperation<T, P extends any[]>(
  operation: (...args: P) => Promise<T>,
  context: string,
  options?: {
    defaultErrorMessage?: string;
    autoExecuteArgs?: P;
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
  }
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);
  
  // Use a ref to track mounted state to prevent state updates after unmount
  const isMounted = useRef(true);
  
  // Clear this effect on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Execute the operation with standardized state handling
  const execute = useCallback(async (...args: P) => {
    setLoading(true);
    setError(null);
    
    try {
      logger.info(`Starting async operation: ${context}`);
      const result = await operation(...args);
      
      // Only update state if the component is still mounted
      if (isMounted.current) {
        setData(result);
        setLoading(false);
        
        // Call onSuccess callback if provided
        options?.onSuccess?.(result);
      }
      
      return result;
    } catch (err) {
      const errorMessage = processError(err, context, options?.defaultErrorMessage);
      
      // Only update state if the component is still mounted
      if (isMounted.current) {
        setError(errorMessage);
        setLoading(false);
        
        // Call onError callback if provided
        options?.onError?.(errorMessage);
      }
      
      return null;
    }
  }, [operation, context, options]);
  
  // Auto-execute on mount if args are provided in options
  useEffect(() => {
    if (options?.autoExecuteArgs) {
      execute(...options.autoExecuteArgs);
    }
  }, [execute, options?.autoExecuteArgs]);
  
  // Reset all states (useful for form submissions, etc.)
  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);
  
  return { 
    execute, 
    loading, 
    error, 
    data,
    reset
  };
}
