/**
 * The breakpoint tiers are a design-system contract, not a preference.
 *
 * They come from the supplied mockups' own "RESPONSIVE BREAKPOINTS" panel
 * (design/mockups-20260814T165448Z-1-001):
 *
 *   Mobile        360-767px    1 column,    bottom nav
 *   Tablet        768-1024px   2 columns,   bottom or side nav
 *   Desktop       1025-1439px  3 columns,   left sidebar
 *   Wide desktop  1440px+      3-4 columns, left sidebar
 *
 * Two values had drifted: `wide` was 1280 and `mobile` was 375.
 *
 * The audit (H3) originally recorded this as "there is no shared breakpoint
 * token", which was wrong -- BREAKPOINTS has always existed and is used in 73
 * places. The real defect was that a further 13 sites bypassed it with raw
 * literals across SEVEN distinct thresholds: 768, 900, 960, 1040, 1100, 1120
 * and 720. Only 768 was a defined breakpoint.
 */
import { BREAKPOINTS } from "../src/hooks/useResponsive";

describe("breakpoints match the design system", () => {
  it("pins the four tiers", () => {
    expect(BREAKPOINTS).toEqual({
      wide: 1440,
      desktop: 1025,
      tablet: 768,
      mobile: 360,
    });
  });

  it("keeps the tiers ordered and non-overlapping", () => {
    // The spec's tablet tier is inclusive of 1024, which is why desktop is
    // 1025 and not 1024 -- an off-by-one here silently puts 1024px devices in
    // the wrong tier, and 1024 is an extremely common viewport.
    expect(BREAKPOINTS.mobile).toBeLessThan(BREAKPOINTS.tablet);
    expect(BREAKPOINTS.tablet).toBeLessThan(BREAKPOINTS.desktop);
    expect(BREAKPOINTS.desktop).toBeLessThan(BREAKPOINTS.wide);
    expect(BREAKPOINTS.desktop).toBe(1024 + 1);
  });
});
