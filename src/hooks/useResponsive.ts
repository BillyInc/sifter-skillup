/**
 * useResponsive — shared responsive breakpoint hook.
 *
 * Desktop-first: levelup.com.ng is the primary product.
 *
 * The tiers come from the design system's own breakpoint panel
 * (design/mockups-20260814T165448Z-1-001, "RESPONSIVE BREAKPOINTS"):
 *
 *   Mobile        360–767px    1 column,     bottom nav
 *   Tablet        768–1024px   2 columns,    bottom or side nav
 *   Desktop       1025–1439px  3 columns,    left sidebar
 *   Wide desktop  1440px+      3–4 columns,  left sidebar
 *
 * Two values moved to match that spec: `wide` was 1280 (spec says 1440) and
 * `mobile` was 375 (spec says 360). `desktop` is 1025 rather than 1024 because
 * the spec's tablet tier is inclusive of 1024.
 */
import { Platform, useWindowDimensions } from "react-native";

export const BREAKPOINTS = {
  wide: 1440,
  desktop: 1025,
  tablet: 768,
  mobile: 360,
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

  const columns: 1 | 2 | 3 | 4 = isWide ? 4 : isDesktop ? 3 : isTablet ? 2 : 1;

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
