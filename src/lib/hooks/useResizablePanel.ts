/**
 * A hook for managing resizable panel state in a declarative way
 * Replaces direct DOM manipulation with proper React state management
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { logger } from '../utils/logger';

interface ResizablePanelOptions {
  /** Default size of the panel (percentage of container) */
  defaultSize: number;
  
  /** Minimum allowed size (percentage) */
  minSize: number;
  
  /** Maximum allowed size (percentage) */
  maxSize: number;
  
  /** Optional callback when panel is collapsed */
  onCollapse?: () => void;
  
  /** Optional callback when panel is expanded */
  onExpand?: () => void;
  
  /** Track user-set size when manually resizing */
  rememberUserSize?: boolean;
}

/**
 * Hook for managing resizable panel state in a React-friendly way
 */
export function useResizablePanel({
  defaultSize,
  minSize,
  maxSize,
  onCollapse,
  onExpand,
  rememberUserSize = true
}: ResizablePanelOptions) {
  // Track collapsed state
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Current panel size as percentage
  const [currentSize, setCurrentSize] = useState(defaultSize);
  
  // Remember the user's last manually set size (the size before collapsing)
  const userSizeRef = useRef(defaultSize);
  
  // The effective size to use for the panel's defaultSize prop
  const panelSize = isCollapsed ? minSize : currentSize;
  
  // Toggle between collapsed and expanded states
  const toggleCollapse = useCallback(() => {
    const nextCollapsed = !isCollapsed;
    logger.debug(`Toggle panel collapse: ${isCollapsed} -> ${nextCollapsed}`);
    
    if (nextCollapsed) {
      // When collapsing, remember current size but don't change it yet
      if (!isCollapsed && rememberUserSize) {
        userSizeRef.current = currentSize;
      }
      setIsCollapsed(true);
      onCollapse?.();
    } else {
      // When expanding, restore to user's previous size or default
      setCurrentSize(rememberUserSize ? userSizeRef.current : defaultSize);
      setIsCollapsed(false);
      onExpand?.();
    }
  }, [isCollapsed, defaultSize, currentSize, onCollapse, onExpand, rememberUserSize]);
  
  // Handle resize events from panels
  const handleResize = useCallback((sizes: number[]) => {
    // Only update if panel isn't collapsed and size changed
    if (!isCollapsed && sizes[0] > minSize && sizes[0] !== currentSize) {
      logger.debug(`Panel resized: ${currentSize} -> ${sizes[0]}`);
      setCurrentSize(sizes[0]);
      
      // Remember user's manual size setting
      if (rememberUserSize) {
        userSizeRef.current = sizes[0];
      }
    }
  }, [isCollapsed, minSize, currentSize, rememberUserSize]);
  
  // Effects to ensure consistent collapsed state based on size
  useEffect(() => {
    // If size becomes minSize and not already collapsed, update collapsed state
    if (currentSize <= minSize && !isCollapsed) {
      setIsCollapsed(true);
      onCollapse?.();
    } 
    // If size becomes greater than minSize and is collapsed, update collapsed state
    else if (currentSize > minSize && isCollapsed) {
      setIsCollapsed(false);
      onExpand?.();
    }
  }, [currentSize, minSize, isCollapsed, onCollapse, onExpand]);
  
  return {
    isCollapsed,
    panelSize,
    currentSize,
    toggleCollapse,
    handleResize,
    setIsCollapsed,
    setCurrentSize: (size: number) => {
      const clampedSize = Math.min(Math.max(size, minSize), maxSize);
      setCurrentSize(clampedSize);
    }
  };
}
