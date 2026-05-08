"use client";

import { useEffect, useState } from "react";

/**
 * Hook that listens to a CSS media query and returns its match status
 *
 * @param query - CSS media query string
 * @returns Boolean indicating whether the query matches
 *
 * @example
 * const isMobile = useMediaQuery("(max-width: 768px)");
 * const prefersLight = useMediaQuery("(prefers-color-scheme: light)");
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

// Common breakpoint hooks
export const breakpoints = {
  sm: "(min-width: 640px)",
  md: "(min-width: 768px)",
  lg: "(min-width: 1024px)",
  xl: "(min-width: 1280px)",
  "2xl": "(min-width: 1536px)",
} as const;

export function useIsMobile() {
  return !useMediaQuery(breakpoints.md);
}

export function useIsTablet() {
  const isMd = useMediaQuery(breakpoints.md);
  const isLg = useMediaQuery(breakpoints.lg);
  return isMd && !isLg;
}

export function useIsDesktop() {
  return useMediaQuery(breakpoints.lg);
}
