/**
 * worldNav — the single source of truth for how the fourth destination
 * (`/(tabs)/myworld`) NAMES ITSELF to the user.
 *
 * The destination is one route with two faces, gated by
 * `featureFlags.myWorldLive` — the same flag MyWorldScreen branches on:
 *
 *  • flag OFF (pre-launch default): the screen IS the saved-items page. It
 *    renders `/api/career/saved` plus personal notes and titles itself "Your
 *    saved careers, bookmarks & notes", with tracks/portfolio behind a locked
 *    card. The final UI concepts sheet names this destination "Saved", so that
 *    is what every surface calls it, with the bookmark glyph the sheet uses.
 *  • flag ON: the same route becomes the learning-world gateway (Tracks ·
 *    Portfolio · Guild) and "Saved" would undersell it, so the label reverts.
 *
 * There is no second saved destination in the product, so the sheet's "Saved"
 * entry is this one renamed — not an extra tab. The route, the `/(tabs)/myworld`
 * path and the `myworld` NavId are unchanged in both states; only the label,
 * icon and strapline move.
 *
 * This lives in `lib/` rather than in the shell so that screens can consume the
 * label without importing from `components/shell` — the shell already depends
 * on lib, and the reverse edge would be a cycle waiting to happen.
 */
import { featureFlags } from './featureFlags';

export interface WorldNav {
  /** Destination name as used in nav items, list rows and buttons. */
  label: 'My World' | 'Saved';
  /** Uppercase form for screen eyebrows. */
  eyebrow: 'MY WORLD' | 'SAVED';
  /** Feather glyph (a `keyof typeof Feather.glyphMap` member). */
  icon: 'book-open' | 'bookmark';
  /** Nav strapline. */
  sub: string;
}

export const WORLD_NAV: WorldNav = featureFlags.myWorldLive
  ? { label: 'My World', eyebrow: 'MY WORLD', icon: 'book-open', sub: 'Tracks · Portfolio · Guild' }
  : { label: 'Saved',    eyebrow: 'SAVED',    icon: 'bookmark',  sub: 'Saved items & your notes' };
