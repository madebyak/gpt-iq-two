/**
 * Custom hook for RTL support
 * Provides convenient access to RTL-aware styles and utilities
 */

import { useMemo } from 'react';
import { isRtlLocale, rtlStyles, rtlSide, rtlPositionSide } from '../utils/rtl-helpers';

/**
 * Hook that provides RTL-aware utilities and styles based on the current locale
 * @param locale - The current locale string (e.g., 'en', 'ar')
 */
export function useRtl(locale: string) {
  // Memoize the RTL determination to prevent unnecessary recalculations
  const isRtl = useMemo(() => isRtlLocale(locale), [locale]);
  
  return {
    // Core RTL state
    isRtl,
    direction: isRtl ? 'rtl' : 'ltr',
    
    // Commonly used RTL-aware values
    side: rtlSide(isRtl),
    textAlign: isRtl ? 'text-right' : 'text-left',
    flexDirection: isRtl ? 'flex-row-reverse' : 'flex-row',
    flipIcon: isRtl ? 'rtl-flip' : '',
    margin: isRtl ? 'mr-auto' : 'ml-auto',
    position: rtlPositionSide(isRtl),
    
    // Comprehensive utility function for complex RTL styling
    styles: (options: Parameters<typeof rtlStyles>[1]) => rtlStyles(isRtl, options),
  };
}
