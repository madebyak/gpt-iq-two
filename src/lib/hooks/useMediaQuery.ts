import { useState, useEffect } from "react";

// Hook to match CSS media queries in React
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    setMatches(mediaQueryList.matches); // Update state with actual value on client
    const handler = (event: MediaQueryListEvent) => setMatches(event.matches);
    mediaQueryList.addEventListener("change", handler);
    return () => mediaQueryList.removeEventListener("change", handler);
  }, [query]);

  return matches;
}
