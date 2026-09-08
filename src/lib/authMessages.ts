export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function friendlyLoginError(error: unknown, fallback = "Could not sign you in."): string {
  const message = error instanceof Error ? error.message : String(error || "");
  if (/invalid email or password|unauthorized|\b401\b/i.test(message)) {
    return "The email or password is incorrect. Check both and try again.";
  }
  if (/failed to fetch|network|timed out|timeout|abort/i.test(message)) {
    return "We could not reach the sign-in service. Check your connection and try again.";
  }
  return message || fallback;
}
