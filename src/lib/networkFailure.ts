/**
 * True when an error means the request never got an answer (offline, DNS,
 * timeout) rather than the server rejecting it. Shared by both auth providers
 * so a transient outage keeps the cached session instead of ending it.
 */
export function isNetworkFailure(e: unknown): boolean {
  const message = (e as Error)?.message ?? "";
  return (
    e instanceof TypeError ||
    /failed to fetch|network request failed|network error|request took too long|timed out/i.test(message)
  );
}
