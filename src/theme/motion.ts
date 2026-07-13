/**
 * COMPASS motion system — "travel down the line".
 *
 * Every animation in the career-intelligence surface derives from these presets
 * so motion stays orchestrated, not scattered. The single rule: the cobalt accent
 * marks *active / current / you-are-here* state only; everything at rest is ink.
 *
 * Reduce-motion: call useReducedMotion() and branch to FADE_ONLY — no transforms,
 * no count-up (show the final value immediately).
 */
import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import {
  Easing,
  withTiming,
  withSpring,
  type WithTimingConfig,
  type WithSpringConfig,
} from 'react-native-reanimated';

// ─── Timing curves ────────────────────────────────────────────
export const Timing = {
  /** Micro — chip wash, focus border. */
  fast: { duration: 180, easing: Easing.out(Easing.cubic) } as WithTimingConfig,
  /** Standard — fades, reveals. */
  base: { duration: 240, easing: Easing.out(Easing.cubic) } as WithTimingConfig,
  /** The route line drawing itself in. */
  route: { duration: 320, easing: Easing.inOut(Easing.cubic) } as WithTimingConfig,
  /** Count-up for stat numerals. */
  count: { duration: 520, easing: Easing.out(Easing.quad) } as WithTimingConfig,
} as const;

// ─── Spring presets ───────────────────────────────────────────
export const Spring = {
  /** Press feedback — card lift, chip toggle. */
  press: { mass: 0.6, damping: 15, stiffness: 220 } as WithSpringConfig,
  /** A station "arriving" — save pop, node fill. */
  arrive: { mass: 0.7, damping: 11, stiffness: 260 } as WithSpringConfig,
  /** Layout collapse / expand. */
  layout: { mass: 0.9, damping: 18, stiffness: 180 } as WithSpringConfig,
} as const;

/** Stagger delay for list / station entrances (ms). */
export const STAGGER = { list: 45, station: 60, skillBar: 70 } as const;

/** Reduce-motion fallback — the ONLY animation allowed when RM is on. */
export const FADE_ONLY: WithTimingConfig = {
  duration: 120,
  easing: Easing.out(Easing.quad),
};

/**
 * Live reduce-motion flag. Components read this and branch:
 *   reduced ? withTiming(v, FADE_ONLY) : withSpring(v, Spring.arrive)
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => {
      if (alive) setReduced(v);
    });
    const sub = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (v) => setReduced(v),
    );
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);
  return reduced;
}

/** Helpers that respect reduce-motion at the call site. */
export const motion = {
  reveal(reduced: boolean, to: number) {
    return withTiming(to, reduced ? FADE_ONLY : Timing.base);
  },
  spring(reduced: boolean, to: number, cfg: WithSpringConfig = Spring.arrive) {
    return reduced ? withTiming(to, FADE_ONLY) : withSpring(to, cfg);
  },
};
