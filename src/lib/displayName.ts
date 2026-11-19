/**
 * One source of truth for the name the app shows for the signed-in user.
 *
 * Existing fields only: `username` (which the sign-up flow fills from the
 * first, middle and last name, and which the user can change in Settings) is
 * preferred, then `first_name`. Generic placeholders written by the app itself
 * ("Student", "Guest") are never treated as a real name, so a real account
 * with a name on file never shows them.
 */
export interface NameSource {
  username?: string | null;
  first_name?: string | null;
}

export const NAME_TO_SHOW_MAX = 40;

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
export function sanitizeNameToShow(input: string): NameToShowResult {
  const value = clean(input);
  if (!value) return { ok: false, error: 'Enter the name you want to see.' };
  if (value.length > NAME_TO_SHOW_MAX) {
    return { ok: false, error: `Use ${NAME_TO_SHOW_MAX} characters or fewer.` };
  }
  if (!isRealName(value)) return { ok: false, error: 'Choose a name that is your own.' };
  return { ok: true, value };
}
