/**
 * Guards the action colour after the switch from blue to orange.
 *
 * The primary action was #1F5EFF (blue). The design brief calls for an orange
 * primary, so it is now #C2410C light / #FF8A4C dark. Two things had to hold,
 * and both are easy to lose in a later tweak:
 *
 *   1. Contrast must not regress against the blue it replaced. The obvious
 *      orange (#D9480F) only reaches 4.30:1 for white text -- below AA and
 *      worse than the blue's 5.12:1. #C2410C reaches 5.18:1.
 *
 *   2. The action must stay distinguishable from the warning. An orange
 *      primary lands between red (danger) and amber (warning), so the palette
 *      is crowded by construction: the previous warning #B45309 sat 8 degrees
 *      of hue from the new action and read as the same colour. It moved to
 *      #A16207 for 18 degrees of separation.
 *
 * The action token also drives borderFocus, so a regression here degrades every
 * keyboard focus ring, not just buttons.
 */

import { LightColors, DarkColors } from "../src/theme";

// ── WCAG 2.1 relative luminance / contrast ───────────────────────────────
function channel(v: number): number {
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function luminance(hex: string): number {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function hue(hex: string): number {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min) return 0;
  const d = max - min;
  let deg: number;
  if (max === r) deg = ((g - b) / d) % 6;
  else if (max === g) deg = (b - r) / d + 2;
  else deg = (r - g) / d + 4;
  deg *= 60;
  return deg < 0 ? deg + 360 : deg;
}

function hueGap(a: string, b: string): number {
  const d = Math.abs(hue(a) - hue(b));
  return Math.min(d, 360 - d);
}

/** Contrast of the blue this replaced, on white. Nothing may fall below it. */
const PREVIOUS_BLUE_ON_WHITE = contrast("#1F5EFF", "#FFFFFF");

describe("action colour contrast", () => {
  it("carries white button text at AA in light mode", () => {
    expect(contrast(LightColors.accentRole.action, "#FFFFFF")).toBeGreaterThanOrEqual(4.5);
  });

  it("does not regress against the blue it replaced", () => {
    // #D9480F would fail this at 4.30 vs the blue's 5.12.
    expect(contrast(LightColors.accentRole.action, "#FFFFFF")).toBeGreaterThanOrEqual(
      PREVIOUS_BLUE_ON_WHITE,
    );
  });

  it("stays legible on the dark card", () => {
    expect(contrast(DarkColors.accentRole.action, DarkColors.card)).toBeGreaterThanOrEqual(4.5);
  });

  it("keeps the focus ring on the action colour in both themes", () => {
    // borderFocus shares the action token; a mismatch means focus rings and
    // buttons disagree, and the dark ring silently stays the old blue.
    expect(LightColors.borderFocus).toBe(LightColors.accentRole.action);
    expect(DarkColors.borderFocus).toBe(DarkColors.accentRole.action);
    expect(LightColors.borderRole.focus).toBe(LightColors.accentRole.action);
    expect(DarkColors.borderRole.focus).toBe(DarkColors.accentRole.action);
  });
});

describe("semantic colours stay distinguishable from the action", () => {
  it("separates action from warning by hue in light mode", () => {
    // The old #B45309 warning sat 8 degrees away and read identically.
    expect(
      hueGap(LightColors.accentRole.action, LightColors.accentRole.warning),
    ).toBeGreaterThanOrEqual(15);
  });

  it("separates action from warning by hue in dark mode", () => {
    expect(
      hueGap(DarkColors.accentRole.action, DarkColors.accentRole.warning),
    ).toBeGreaterThanOrEqual(15);
  });

  it("keeps status informational and blue, not the action colour", () => {
    // With an orange primary, blue is demoted to information only. If status
    // tracked the action again, the two roles would be indistinguishable.
    expect(DarkColors.accentRole.status).not.toBe(DarkColors.accentRole.action);
    expect(LightColors.accentRole.status).not.toBe(LightColors.accentRole.action);
    expect(hue(LightColors.accentRole.status)).toBeGreaterThan(180);
    expect(hue(DarkColors.accentRole.status)).toBeGreaterThan(180);
  });

  it("keeps action and danger distinct, which hue alone now has to do", () => {
    // Worth being precise about the cost of an orange primary. Action and
    // danger have almost identical luminance -- 1.07:1 -- but that is not a
    // regression: with the old blue it was 1.06:1. Lightness never separated
    // them. Hue did, and that gap fell from 219 degrees (blue vs red) to about
    // 13 (orange vs red).
    //
    // 13 degrees is thin, so the two must never be told apart by colour alone.
    // They are separated by form instead: the action is a filled button with
    // white text, danger appears as inline text, an icon, or a soft-tinted
    // background. This pins the floor so a later tweak cannot close the gap
    // further without the failure being visible.
    expect(LightColors.accentRole.danger).not.toBe(LightColors.accentRole.action);
    expect(
      hueGap(LightColors.accentRole.action, LightColors.accentRole.danger),
    ).toBeGreaterThanOrEqual(10);
    expect(
      hueGap(DarkColors.accentRole.action, DarkColors.accentRole.danger),
    ).toBeGreaterThanOrEqual(10);
  });
});
