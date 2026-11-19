/**
 * Preset avatars. A choice is stored as a short identifier in the existing
 * `users.avatar_url` column (`preset:<id>`); no image is uploaded or fetched.
 * Any other `avatar_url` value (for example a remote photo URL written by an
 * older sign-in path) is deliberately ignored here and the initial is shown.
 */
import type { ColorPalette } from '@/theme';

export const AVATAR_PRESET_PREFIX = 'preset:';

export interface AvatarPreset {
  id: string;
  label: string;
  /** Feather icon name; omitted for initial-based presets. */
  icon?: 'compass' | 'book-open' | 'star' | 'zap';
  /** Resolves background/foreground from the active theme palette. */
  tone: (colors: ColorPalette) => { bg: string; fg: string };
}

export const AVATAR_PRESETS: readonly AvatarPreset[] = [
  { id: 'initial-orange', label: 'Orange initial', tone: (c) => ({ bg: c.accentRole.fill, fg: c.accentRole.onFill }) },
  { id: 'initial-blue', label: 'Blue initial', tone: (c) => ({ bg: c.infoSoft, fg: c.info }) },
  { id: 'initial-green', label: 'Green initial', tone: (c) => ({ bg: c.successSoft, fg: c.success }) },
  { id: 'initial-gold', label: 'Gold initial', tone: (c) => ({ bg: c.eliteSoft, fg: c.elite }) },
  { id: 'icon-compass', label: 'Compass', icon: 'compass', tone: (c) => ({ bg: c.infoSoft, fg: c.info }) },
  { id: 'icon-book', label: 'Open book', icon: 'book-open', tone: (c) => ({ bg: c.successSoft, fg: c.success }) },
  { id: 'icon-star', label: 'Star', icon: 'star', tone: (c) => ({ bg: c.eliteSoft, fg: c.elite }) },
  { id: 'icon-spark', label: 'Spark', icon: 'zap', tone: (c) => ({ bg: c.accentRole.fill, fg: c.accentRole.onFill }) },
];

export function avatarUrlForPreset(id: string): string {
  return `${AVATAR_PRESET_PREFIX}${id}`;
}

/** The preset a stored `avatar_url` refers to, or null for none/unknown/URL values. */
export function getAvatarPreset(avatarUrl: string | null | undefined): AvatarPreset | null {
  if (typeof avatarUrl !== 'string' || !avatarUrl.startsWith(AVATAR_PRESET_PREFIX)) return null;
  const id = avatarUrl.slice(AVATAR_PRESET_PREFIX.length);
  return AVATAR_PRESETS.find((preset) => preset.id === id) ?? null;
}
