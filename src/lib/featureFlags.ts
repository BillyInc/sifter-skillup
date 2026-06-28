/**
 * featureFlags — small, central place for launch gating.
 *
 * `myWorldLive` controls whether the My World tab exposes the full existing
 * learning game (islands, levels, simulators, tracks, character/XP, Portfolio,
 * Guild) or stays the pre-launch personal page with a Coming-Soon tracks card.
 *
 * Pre-launch it is OFF. Flip it by setting EXPO_PUBLIC_MY_WORLD_LIVE=true in the
 * environment (no code change, coordinated with the go-live release). Reading it
 * through this module — never `process.env` inline — keeps the flip in one spot
 * and makes the gate trivially greppable.
 */
export const featureFlags = {
  /** When true, My World becomes the live learning-world gateway. */
  myWorldLive: process.env.EXPO_PUBLIC_MY_WORLD_LIVE === "true",
} as const;

export type FeatureFlags = typeof featureFlags;
