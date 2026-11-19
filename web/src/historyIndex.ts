/**
 * In-app navigation depth for the web shell. Every in-app push records a
 * 1-based depth in `history.state`, replace keeps the current depth, and a
 * document that was opened directly (deep link, new tab, refresh of a shared
 * URL) starts at 0. "Back" can then tell a real in-app step from a cold entry
 * instead of guessing from `history.length`, which also counts pages visited
 * before the app.
 */
export function currentDepth(): number {
  const idx = (window.history.state as { idx?: unknown } | null)?.idx;
  return typeof idx === "number" && idx > 0 ? idx : 0;
}

export function pushWithDepth(path: string): void {
  window.history.pushState({ ...(window.history.state ?? {}), idx: currentDepth() + 1 }, "", path);
}

export function replaceKeepingDepth(path: string): void {
  window.history.replaceState({ idx: currentDepth() }, "", path);
}

export function canGoBackInApp(): boolean {
  return currentDepth() > 0;
}
