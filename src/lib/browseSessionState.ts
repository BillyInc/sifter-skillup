/**
 * Browse session state: the small piece of "where was I" a student expects
 * back when they open a result and return (Explore search query and filter,
 * admission browse inputs, scroll position).
 *
 * It is deliberately tiny: an in-memory map that is mirrored to
 * `sessionStorage` where the platform has it (the web shell remounts a screen
 * on every route change, native stacks keep it mounted). Nothing here is
 * persisted to the account, nothing survives the browser session, and entries
 * expire so an old search does not greet a student who comes back much later.
 */

export interface BrowseSnapshot {
  /** Plain JSON-serialisable field values (query, filter, chosen school...). */
  fields: Record<string, unknown>;
  /** Vertical scroll offset in px. */
  scrollY: number;
  savedAt: number;
}

export const BROWSE_STATE_TTL_MS = 30 * 60 * 1000;
const STORAGE_PREFIX = "sifter:browse:";
const memory = new Map<string, BrowseSnapshot>();

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function storage(): StorageLike | null {
  try {
    const candidate = (globalThis as { sessionStorage?: StorageLike }).sessionStorage;
    return candidate ?? null;
  } catch {
    return null;
  }
}

function isSnapshot(value: unknown): value is BrowseSnapshot {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<BrowseSnapshot>;
  return typeof v.savedAt === "number"
    && typeof v.scrollY === "number"
    && !!v.fields && typeof v.fields === "object";
}

/** Builds a key scoped to a screen and, when known, the signed-in account. */
export function browseStateKey(screen: string, userId?: string | null, variant?: string): string {
  return [screen, userId || "anon", variant || ""].join("|");
}

export function readBrowseState(key: string, now: number = Date.now()): BrowseSnapshot | null {
  let snapshot = memory.get(key) ?? null;
  if (!snapshot) {
    try {
      const raw = storage()?.getItem(STORAGE_PREFIX + key);
      const parsed = raw ? JSON.parse(raw) : null;
      if (isSnapshot(parsed)) snapshot = parsed;
    } catch {
      snapshot = null;
    }
  }
  if (!snapshot) return null;
  if (now - snapshot.savedAt > BROWSE_STATE_TTL_MS) {
    clearBrowseState(key);
    return null;
  }
  return snapshot;
}

/** Merges a partial update into the stored snapshot. */
export function writeBrowseState(
  key: string,
  patch: { fields?: Record<string, unknown>; scrollY?: number },
  now: number = Date.now(),
): BrowseSnapshot {
  const current = readBrowseState(key, now);
  const next: BrowseSnapshot = {
    fields: patch.fields ? { ...(current?.fields ?? {}), ...patch.fields } : (current?.fields ?? {}),
    scrollY: patch.scrollY !== undefined ? Math.max(0, Math.round(patch.scrollY)) : (current?.scrollY ?? 0),
    savedAt: now,
  };
  memory.set(key, next);
  try {
    storage()?.setItem(STORAGE_PREFIX + key, JSON.stringify(next));
  } catch {
    // Quota or privacy mode: the in-memory copy still serves this session.
  }
  return next;
}

export function clearBrowseState(key: string): void {
  memory.delete(key);
  try {
    storage()?.removeItem(STORAGE_PREFIX + key);
  } catch {
    // ignore
  }
}

/** Test helper: forget every in-memory entry. */
export function resetBrowseStateMemory(): void {
  memory.clear();
}
