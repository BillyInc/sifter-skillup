/**
 * accountType — local source of truth for which side of the app a user is on.
 *
 * The institutional/admin side is gated on `account_type`. The backend will
 * eventually persist this on the user record, but until that lands we keep a
 * local override (set during educator onboarding) so routing works end-to-end
 * now. `useEffectiveAccountType` merges the backend value (authoritative when
 * present) with the local override and hydrates synchronously enough for the
 * auth layout to route without a flash.
 */
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type AccountType = "student" | "educator" | "institution_admin";

const KEY = "@levelup_account_type_v1";

/** Treat educator + institution_admin as "the admin side" for routing. */
export function isAdminAccount(t: AccountType | undefined | null): boolean {
  return t === "educator" || t === "institution_admin";
}

export async function getLocalAccountType(): Promise<AccountType | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw === "educator" || raw === "institution_admin" || raw === "student"
      ? (raw as AccountType)
      : null;
  } catch {
    return null;
  }
}

export async function setLocalAccountType(type: AccountType): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, type);
  } catch {
    // Non-fatal: onboarding still completes; routing falls back to backend value.
  }
}

export async function clearLocalAccountType(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

/**
 * Effective account type for routing: the backend value wins when present,
 * otherwise the local override. `hydrated` is false until the local read
 * resolves so callers can hold routing decisions for a tick.
 */
export function useEffectiveAccountType(backendType?: AccountType | string): {
  accountType: AccountType;
  hydrated: boolean;
} {
  const [local, setLocal] = useState<AccountType | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    getLocalAccountType().then((t) => {
      if (!active) return;
      setLocal(t);
      setHydrated(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const resolved: AccountType =
    backendType === "educator" ||
    backendType === "institution_admin" ||
    backendType === "student"
      ? (backendType as AccountType)
      : (local ?? "student");

  return { accountType: resolved, hydrated };
}
