/**
 * One source of truth for the name the app shows for the signed-in user.
 *
 * Preference order: `display_name` (the optional name the user chose), then
 * `username` (legacy; sign-up fills it from the legal name), then `first_name`.
 * Because `display_name` comes first, a minor who chose a name never sees their
 * legal full name. Generic placeholders written by the app itself
 * ("Student", "Guest") are never treated as a real name, so a real account
 * with a name on file never shows them.
 */
export interface NameSource {
  display_name?: string | null;
  username?: string | null;
  first_name?: string | null;
}

export const NAME_TO_SHOW_MAX = 40;
/** Server limit for `display_name` (2-30 characters). */
export const DISPLAY_NAME_MAX = 30;

/** True when the user payload carries the `display_name` key (even as null), i.e. the backend supports it. */
export function supportsDisplayName(user: object | null | undefined): boolean {
  return !!user && Object.prototype.hasOwnProperty.call(user, 'display_name') && (user as NameSource).display_name !== undefined;
}

const PLACEHOLDER_NAMES = new Set(['student', 'guest', 'user']);

function clean(value: unknown): string {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';
}

function isRealName(value: string): boolean {
  return value.length > 0 && !PLACEHOLDER_NAMES.has(value.toLowerCase());
}

/** The full name to show, or null when the account has no usable name. */
export function getDisplayName(user: NameSource | null | undefined): string | null {
  if (!user) return null;
  const chosen = clean(user.display_name);
  if (isRealName(chosen)) return chosen;
  const username = clean(user.username);
  if (isRealName(username)) return username;
  const first = clean(user.first_name);
  return isRealName(first) ? first : null;
}

/** The first word of the display name, for greetings. */
export function getGreetingName(user: NameSource | null | undefined): string | null {
  const name = getDisplayName(user);
  return name ? name.split(' ')[0] : null;
}

/** The display name, or the caller's own fallback when none is on file. */
export function getDisplayNameOr(user: NameSource | null | undefined, fallback: string): string {
  return getDisplayName(user) ?? fallback;
}

export type NameToShowResult = { ok: true; value: string } | { ok: false; error: string };

/** Client-side check for the optional "Name to show" field (the API applies none). */
export function sanitizeNameToShow(input: string, max: number = NAME_TO_SHOW_MAX): NameToShowResult {
  const value = clean(input);
  if (!value) return { ok: false, error: 'Enter the name you want to see.' };
  if (value.length > max) {
    return { ok: false, error: `Use ${max} characters or fewer.` };
  }
  if (max === DISPLAY_NAME_MAX && value.length < 2) return { ok: false, error: 'Use at least 2 characters.' };
  if (!isRealName(value)) return { ok: false, error: 'Choose a name that is your own.' };
  return { ok: true, value };
}
