"use client";

import { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '@/lib/utils/logger';

interface ErrorBoundaryProps {
  /**
   * Component or render function to display when an error occurs
   * If a function is provided, it will receive the error object
   */
  fallback: ReactNode | ((error: Error) => ReactNode);
  
  /**
   * The children to render when no error has occurred
   */
  children: ReactNode;
  
  /**
   * Optional context identifier for error reporting
   */
  context?: string;
  
  /**
   * Optional callback fired when an error is caught
   */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component that catches JavaScript errors in its child component tree.
 * Displays a fallback UI instead of crashing the whole application.
 * 
 * Usage:
 * ```tsx
 * <ErrorBoundary 
 *   fallback={<div>Something went wrong</div>}
 *   context="ChatSection"
 * >
 *   <ComponentThatMightError />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to our logging service
    const context = this.props.context || 'ErrorBoundary';
    logger.error(`Error in ${context}:`, error, errorInfo);
    
    // Call the optional onError callback
    this.props.onError?.(error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      const { fallback } = this.props;
      
      // If fallback is a function, call it with the error
      if (typeof fallback === 'function') {
        return fallback(this.state.error!);
      }
      
      // Otherwise render the fallback element
      return fallback;
    }
    
    return this.props.children;
  }
}
