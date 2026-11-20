/**
 * The name OTHER users may see for a person.
 *
 * `username` is built from the legal first + middle + last name at sign-up, so
 * screens that show someone else (leaderboard, guild, referrals, rooms) must
 * use the server's `public_name` (display_name, else first name only, else
 * "Learner"). Only when a payload from an older server lacks the field do we
 * fall back to the legacy value, which the updated server already replaces with
 * the public name. The signed-in user's OWN name still comes from
 * `getDisplayName` (src/lib/displayName.ts).
 */
export const NEUTRAL_PUBLIC_NAME = 'Learner';

export interface PublicNameSource {
  public_name?: string | null;
  display_name?: string | null;
  first_name?: string | null;
  username?: string | null;
  author_username?: string | null;
}

const PLACEHOLDERS = new Set(['student', 'guest', 'user', 'learner']);

function clean(value: unknown): string {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';
}

function usable(value: string): boolean {
  return value.length > 0 && !PLACEHOLDERS.has(value.toLowerCase()) && !value.includes('@');
}

/** Name to show for ANOTHER user's row/message. */
export function getPublicName(
  entry: PublicNameSource | null | undefined,
  fallback: string = NEUTRAL_PUBLIC_NAME,
): string {
  if (!entry) return fallback;
  const served = clean(entry.public_name);
  if (served) return served;
  // Field absent (older server): legacy display value.
  const legacy = clean(entry.username) || clean(entry.author_username);
  return legacy || fallback;
}

/**
 * The public name for the signed-in user's own account, for the few places
 * that publish it to others or outside the app (room posts, portfolio files):
 * display_name, else first name only, else neutral. Never `username`.
 */
export function getOwnPublicName(user: PublicNameSource | null | undefined): string {
  if (!user) return NEUTRAL_PUBLIC_NAME;
  const chosen = clean(user.display_name);
  if (usable(chosen)) return chosen;
  const first = clean(user.first_name).split(' ')[0];
  return usable(first) ? first : NEUTRAL_PUBLIC_NAME;
}
