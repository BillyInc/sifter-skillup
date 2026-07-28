/**
 * useResponsive — shared responsive breakpoint hook.
 *
 * Desktop-first: levelup.com.ng is the primary product.
 *
 * Breakpoints:
 *   ≥1280px  wide desktop   → 3+ columns, sidebar visible
 *   ≥1024px  desktop        → 2–3 columns, sidebar visible
 *   ≥768px   tablet/smlap   → 2 columns, collapsed nav
 *   ≥375px   mobile         → 1 column, bottom tabs
 *   <375px   small mobile   → 1 column, compact
 */
import { Platform, useWindowDimensions } from "react-native";

export const BREAKPOINTS = {
  wide: 1280,
  desktop: 1024,
  tablet: 768,
  mobile: 375,
} as const;

export interface ResponsiveInfo {
  /** Viewport width in px. */
  width: number;
  /** Viewport height in px. */
  height: number;
  isSmallMobile: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isWide: boolean;
  /** Number of columns suitable for grid layouts. */
  columns: 1 | 2 | 3 | 4;
  /** True on native web (not native mobile). */
  isWeb: boolean;
}

export function useResponsive(): ResponsiveInfo {
  const { width, height } = useWindowDimensions();
  const isWeb = Platform.OS === "web";

  const isSmallMobile = width < BREAKPOINTS.mobile;
  const isMobile = width < BREAKPOINTS.tablet;
  const isTablet = width >= BREAKPOINTS.tablet && width < BREAKPOINTS.desktop;
  const isDesktop = width >= BREAKPOINTS.desktop;
  const isWide = width >= BREAKPOINTS.wide;

  const columns = isWide ? 4 : isDesktop ? 3 : isTablet ? 2 : 1 as 1 | 2 | 3 | 4;

  return {
    width,
    height,
    isSmallMobile,
    isMobile,
    isTablet,
    isDesktop,
    isWide,
    columns,
    isWeb,
  };
}

/** Convenience: "the nav should be a sidebar" check. */
export function useSidebarNav(): boolean {
  const { isWeb, isDesktop } = useResponsive();
  return isWeb && isDesktop;
}

/** Convenience: "the search should render as a command palette". */
export function useCommandPalette(): boolean {
  const { isWeb, isDesktop } = useResponsive();
  return isWeb && isDesktop;
}
