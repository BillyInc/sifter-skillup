/**
 * The user's own recent searches.
 *
 * ReferenceShell previously passed a hardcoded list to the overlay:
 *
 *     recentSearches={["Medicine & Surgery", "UNILAG", "Computer Science"]}
 *
 * "Recent searches" is a claim about this user's history. Showing three
 * searches -- including a named university -- to a student who has never
 * searched presents fabricated information as real, which the product's data
 * rule forbids outright. The section must be empty until they have actually
 * searched, and the overlay hides it when the list is empty.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "@levelup_recent_searches_v1";
export const MAX_RECENT_SEARCHES = 6;

/** Queries shorter than this are noise from in-flight typing. */
const MIN_LENGTH = 2;

export async function getRecentSearches(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((t): t is string => typeof t === "string");
  } catch {
    return [];
  }
}

/**
 * Record a term, most-recent first. Case-insensitively de-duplicated so
 * repeating a search promotes it rather than stacking near-identical rows.
 */
export async function addRecentSearch(term: string): Promise<string[]> {
  const trimmed = (term ?? "").trim();
  if (trimmed.length < MIN_LENGTH) return getRecentSearches();

  try {
    const existing = await getRecentSearches();
    const lower = trimmed.toLowerCase();
    const next = [
      trimmed,
      ...existing.filter((t) => t.toLowerCase() !== lower),
    ].slice(0, MAX_RECENT_SEARCHES);
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
    return next;
  } catch {
    // Best-effort: failing to record history must never break searching.
    return getRecentSearches();
  }
}

export async function clearRecentSearches(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
