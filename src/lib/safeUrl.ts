/**
 * Safe external link opening.
 *
 * URLs that come from an API response or from a user (feed metadata, source
 * references, saved entities, OAuth hand-offs) must never reach
 * `Linking.openURL` unchecked: on web `javascript:` and `data:` URLs would run
 * in the page's origin. Only http(s) is opened by default; `mailto:` only when
 * the caller asks for it. Constant URLs written in the source need no check.
 */
import { Linking } from "react-native";

export type SafeUrlOptions = { allowMailto?: boolean };

/** The normalised URL when it is safe to open, otherwise null. */
export function safeExternalUrl(value: unknown, options: SafeUrlOptions = {}): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  // Control characters and embedded whitespace are how scheme filters get bypassed
  // (`java\tscript:`), and no legitimate URL needs them.
  if (!trimmed || /[\u0000-\u001f\u007f\s]/.test(trimmed)) return null;
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }
  if (parsed.protocol === "https:" || parsed.protocol === "http:") {
    return parsed.hostname ? parsed.toString() : null;
  }
  if (options.allowMailto && parsed.protocol === "mailto:" && parsed.pathname) return parsed.toString();
  return null;
}

/** Opens the URL if it is safe. Resolves false (and opens nothing) otherwise or on failure. */
export async function openExternalUrl(value: unknown, options: SafeUrlOptions = {}): Promise<boolean> {
  const url = safeExternalUrl(value, options);
  if (!url) return false;
  try {
    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
}
