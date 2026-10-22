/**
 * Data reads may fan out to remote database-backed endpoints and need a
 * longer budget than writes/auth. Callers may still opt into a tighter or
 * longer timeout for a specific operation.
 */
export const API_READ_TIMEOUT_MS = 180_000;
export const API_MUTATION_TIMEOUT_MS = 30_000;

export function resolveRequestTimeout(
  method: string | undefined,
  requestedTimeoutMs?: number,
): number {
  if (requestedTimeoutMs !== undefined) return requestedTimeoutMs;
  const normalizedMethod = (method ?? "GET").toUpperCase();
  return normalizedMethod === "GET" || normalizedMethod === "HEAD"
    ? API_READ_TIMEOUT_MS
    : API_MUTATION_TIMEOUT_MS;
}

