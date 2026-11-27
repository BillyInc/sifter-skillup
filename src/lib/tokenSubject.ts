/** The user id a JWT was issued for, or null when it cannot be read. */
export function tokenSubject(token: string): string | null {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const b64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
    const claims = JSON.parse(globalThis.atob(padded));
    return claims?.sub != null ? String(claims.sub) : null;
  } catch {
    return null;
  }
}
