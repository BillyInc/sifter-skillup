/**
 * accountType - local source of truth for which side of the app a user is on.
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

export type AccountType = "pending" | "student" | "educator" | "institution_admin";

type RoutedUser = {
  auth_provider?: string | null;
  onboarding_completed?: boolean | null;
  account_type?: string | null;
  account_type_selected_at?: string | null;
};

/**
 * Only completed non-guest accounts that never selected a persona are sent
 * back to the account-type gate. Older databases defaulted these rows to
 * `student`, so the selection timestamp is also part of the legacy signal.
 */
export function needsLegacyTypeSelection(user?: RoutedUser | null): boolean {
  if (!user || user.auth_provider === "guest") return false;
  if (user.onboarding_completed !== true) return false;
  if (user.account_type === "educator" || user.account_type === "institution_admin") {
    return false;
  }
  if (user.account_type === "student") {
    return !user.account_type_selected_at;
  }
  return true;
}

const KEY = "@levelup_account_type_v1";

function keyFor(userId?: string | null): string {
  return userId ? `${KEY}:${userId}` : KEY;
}

/** Treat educator + institution_admin as "the admin side" for routing. */
export function isAdminAccount(t: AccountType | undefined | null): boolean {
  return t === "educator" || t === "institution_admin";
}

export async function getLocalAccountType(userId?: string | null): Promise<AccountType | null> {
  try {
    const raw = await AsyncStorage.getItem(keyFor(userId));
    return raw === "pending" || raw === "educator" || raw === "institution_admin" || raw === "student"
      ? (raw as AccountType)
      : null;
  } catch {
    return null;
  }
}

export async function setLocalAccountType(type: AccountType, userId?: string | null): Promise<void> {
  try {
    await AsyncStorage.setItem(keyFor(userId), type);
  } catch {
    // Non-fatal: onboarding still completes; routing falls back to backend value.
  }
}

export async function clearLocalAccountType(userId?: string | null): Promise<void> {
  try {
    await AsyncStorage.removeItem(keyFor(userId));
    if (userId) {
      await AsyncStorage.removeItem(KEY);
    }
  } catch {
    // ignore
  }
}

/**
 * Effective account type for routing: the backend value wins when present,
 * otherwise the local override. `hydrated` is false until the local read
 * resolves so callers can hold routing decisions for a tick.
 */
export function useEffectiveAccountType(backendType?: AccountType | string, userId?: string | null): {
  accountType: AccountType;
  hydrated: boolean;
} {
  const [local, setLocal] = useState<AccountType | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    getLocalAccountType(userId).then((t) => {
      if (!active) return;
      setLocal(t);
      setHydrated(true);
    });
    return () => {
      active = false;
    };
  }, [userId]);

  const resolved: AccountType =
    backendType === "pending" ||
    backendType === "educator" ||
    backendType === "institution_admin" ||
    backendType === "student"
      ? (backendType as AccountType)
      : (local ?? "pending");

  return { accountType: resolved, hydrated };
}
