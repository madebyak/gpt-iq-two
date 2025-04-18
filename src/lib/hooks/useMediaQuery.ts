import { useState, useEffect } from "react";

// Hook to match CSS media queries in React
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(
    typeof window === "undefined" ? false : window.matchMedia(query).matches
  );

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    const handler = (event: MediaQueryListEvent) => setMatches(event.matches);
    mediaQueryList.addEventListener("change", handler);
    return () => mediaQueryList.removeEventListener("change", handler);
  }, [query]);

  return matches;
}
