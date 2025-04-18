/**
 * RTL Helper Utilities
 * Centralizes RTL-specific logic to ensure consistent behavior across components
 */

import { cn } from '@/lib/utils';

export type Direction = 'ltr' | 'rtl';

/**
 * Determines if a locale uses RTL text direction
 */
export function isRtlLocale(locale: string): boolean {
  return locale === 'ar';
}

/**
 * Returns the text direction based on locale
 */
export function getDirection(locale: string): Direction {
  return isRtlLocale(locale) ? 'rtl' : 'ltr';
}

/**
 * Conditionally applies LTR or RTL specific classes
 */
export function rtlClass(isRtl: boolean, ltrClassName: string, rtlClassName: string): string {
  return isRtl ? rtlClassName : ltrClassName;
}

/**
 * Returns the appropriate flex direction for RTL support
 */
export function rtlFlexDirection(isRtl: boolean): string {
  return isRtl ? 'flex-row-reverse' : 'flex-row';
}

/**
 * Returns the appropriate text alignment for RTL support
 */
export function rtlTextAlign(isRtl: boolean): string {
  return isRtl ? 'text-right' : 'text-left';
}

/**
 * Returns the class for RTL icon flipping
 * Uses the project's custom utility class .rtl-flip
 */
export function rtlFlipIcon(isRtl: boolean): string {
  return isRtl ? 'rtl-flip' : '';
}

/**
 * Returns the appropriate margin auto class for RTL support
 */
export function rtlMargin(isRtl: boolean): string {
  return isRtl ? 'mr-auto' : 'ml-auto';
}

/**
 * Returns the appropriate tooltip/popover side for RTL layouts
 */
export function rtlSide(isRtl: boolean): 'left' | 'right' {
  return isRtl ? 'left' : 'right';
}

/**
 * Returns the opposite side value for RTL-aware positioning
 */
export function rtlPositionSide(isRtl: boolean): string {
  return isRtl ? 'right-0' : 'left-0';
}

/**
 * Comprehensive utility for combining common RTL patterns
 */
export function rtlStyles(isRtl: boolean, options: {
  flexDirection?: boolean;
  textAlign?: boolean;
  flipIcon?: boolean;
  margin?: boolean;
  customClasses?: { ltr: string, rtl: string };
}): string {
  const classes = [];
  
  if (options.flexDirection) {
    classes.push(rtlFlexDirection(isRtl));
  }
  
  if (options.textAlign) {
    classes.push(rtlTextAlign(isRtl));
  }
  
  if (options.flipIcon && isRtl) {
    classes.push('rtl-flip');
  }
  
  if (options.margin) {
    classes.push(rtlMargin(isRtl));
  }
  
  if (options.customClasses) {
    classes.push(rtlClass(isRtl, options.customClasses.ltr, options.customClasses.rtl));
  }
  
  return cn(...classes);
}
