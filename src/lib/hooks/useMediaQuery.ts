import { useState, useEffect } from "react";

// Hook to match CSS media queries in React
export function useMediaQuery(query: string): boolean {
  // Initialize with a default value (e.g., false, or true if you prefer mobile-first default during SSR)
  // The actual value will be set correctly on the client after hydration.
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    // Only run this effect on the client
    if (typeof window !== 'undefined') {
      const mediaQueryList = window.matchMedia(query);
      
      // Set the initial state correctly once on the client
      setMatches(mediaQueryList.matches);
      
      const handler = (event: MediaQueryListEvent) => setMatches(event.matches);
      mediaQueryList.addEventListener("change", handler);
      return () => mediaQueryList.removeEventListener("change", handler);
    }
  }, [query]); // query is a dependency

  return matches;
}
