/**
 * A hook for managing resizable panel state in a declarative way
 * Replaces direct DOM manipulation with proper React state management
 */

import { useState, useCallback, useRef, useEffect, RefObject } from 'react';
import { ImperativePanelHandle } from 'react-resizable-panels';
import { logger } from '../utils/logger';

interface ResizablePanelOptions {
  /** Default size of the panel (percentage of container) */
  defaultSize: number;
  
  /** Minimum allowed size (percentage) */
  minSize: number;
  
  /** Maximum allowed size (percentage) */
  maxSize: number;
  
  /** Ref to the ResizablePanel component */
  panelRef: RefObject<ImperativePanelHandle>;
  
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
  panelRef,
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
    logger.debug(`Toggle panel collapse: ${isCollapsed} -> ${nextCollapsed}, panelRef: ${panelRef.current}`);
    
    // Get the imperative handle
    const panel = panelRef.current;
    if (!panel) {
      logger.warn('Panel ref not available for imperative resize.');
      return; // Exit if ref not attached yet
    }
    
    if (nextCollapsed) {
      // COLLAPSING:
      if (!isCollapsed && rememberUserSize) {
        userSizeRef.current = panel.getSize(); // Get size directly from panel before collapse
      }
      setIsCollapsed(true);
      // **Imperatively resize the panel**
      panel.resize(minSize);
      setCurrentSize(minSize); // Keep state in sync
      onCollapse?.();
    } else {
      // EXPANDING:
      const targetSize = rememberUserSize ? userSizeRef.current : defaultSize;
      setIsCollapsed(false);
      // **Imperatively resize the panel**
      panel.resize(targetSize);
      setCurrentSize(targetSize); // Keep state in sync
      onExpand?.();
    }
  }, [
    isCollapsed, 
    defaultSize, 
    // currentSize, // CurrentSize state is less critical dependency now, resize sets it
    onCollapse, 
    onExpand, 
    rememberUserSize, 
    minSize, 
    userSizeRef, 
    panelRef // Add panelRef to dependencies
  ]);
  
  // Handle resize events from panels (USER DRAGGING)
  const handleResize = useCallback((sizes: number[]) => {
    const newSize = sizes[0]; // Assuming sidebar is the first panel
    logger.debug(`Panel resized by user drag: ${currentSize} -> ${newSize}`);
    setCurrentSize(newSize); // Update internal size state
    
    // Update collapsed state based on drag
    if (newSize <= minSize && !isCollapsed) {
      logger.debug('Panel reached minSize by dragging, setting collapsed=true');
      setIsCollapsed(true);
      onCollapse?.();
    } else if (newSize > minSize && isCollapsed) {
      logger.debug('Panel expanded past minSize by dragging, setting collapsed=false');
      setIsCollapsed(false);
      onExpand?.();
    }
    
    // Remember user's manual size setting if not collapsed
    if (newSize > minSize && rememberUserSize) {
      userSizeRef.current = newSize;
    }
  }, [isCollapsed, minSize, currentSize, rememberUserSize, onCollapse, onExpand]); // Removed panelRef, not needed here
  
  // Return minimum necessary values
  return {
    isCollapsed,
    // panelSize, // Less relevant now
    // currentSize, // Internal state mostly
    toggleCollapse,
    handleResize,
    // setIsCollapsed, // Not needed externally
    // setCurrentSize // Not needed externally
  };
}
