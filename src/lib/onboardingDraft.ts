import AsyncStorage from "@react-native-async-storage/async-storage";
import type { StartingPointProfile, UserType } from "../types/onboarding";
import type { EducatorProfile } from "../types/institution";
import { request } from "./api";

export type OnboardingDraft = {
  userId?: string;
  mode?: "student" | "educator";
  choice?: UserType | "educator" | string;
  step?: number;
  studentProfile?: Partial<StartingPointProfile>;
  educatorProfile?: Partial<EducatorProfile> & {
    accessCode?: string;
    accessGranted?: boolean;
  };
  updatedAt: string;
};

const BASE_KEY = "@levelup_onboarding_draft_v1";
const serverWrites = new Map<string, Promise<void>>();

function keyFor(userId?: string | null): string {
  return userId ? `${BASE_KEY}:${userId}` : BASE_KEY;
}

function serverPayload(draft: OnboardingDraft) {
  return {
    mode: draft.mode,
    choice: draft.choice,
    step: draft.step ?? 0,
    studentProfile: draft.studentProfile ?? {},
    educatorProfile: draft.educatorProfile ?? {},
  };
}

function queueServerWrite(userId: string, draft: OnboardingDraft): Promise<void> {
  const previous = serverWrites.get(userId) ?? Promise.resolve();
  const next = previous
    .catch(() => undefined)
    .then(() => request(`/api/users/onboarding-draft`, {
      method: "PUT",
      timeoutMs: 5000,
      body: JSON.stringify(serverPayload(draft)),
    }))
    .then(() => undefined);
  serverWrites.set(userId, next);
  void next.then(
    () => { if (serverWrites.get(userId) === next) serverWrites.delete(userId); },
    () => { if (serverWrites.get(userId) === next) serverWrites.delete(userId); },
  );
  return next;
}

async function getLocalOnboardingDraft(userId?: string | null): Promise<OnboardingDraft | null> {
  try {
    const raw = await AsyncStorage.getItem(keyFor(userId));
    return raw ? (JSON.parse(raw) as OnboardingDraft) : null;
  } catch {
    return null;
  }
}

export async function getOnboardingDraft(
  userId?: string | null,
): Promise<OnboardingDraft | null> {
  const local = await getLocalOnboardingDraft(userId);
  if (!userId) return local;

  try {
    const remote = await request<OnboardingDraft | null>("/api/users/onboarding-draft", {
      timeoutMs: 5000,
    });
    if (remote && (!local || String(remote.updatedAt ?? "") >= String(local.updatedAt ?? ""))) {
      await AsyncStorage.setItem(keyFor(userId), JSON.stringify(remote));
      return remote;
    }
    if (local) void queueServerWrite(userId, local);
  } catch {
    // Local-first fallback keeps onboarding usable while the server is down.
  }
  return local;
}

export async function saveOnboardingDraft(
  draft: Omit<OnboardingDraft, "updatedAt"> & { updatedAt?: string },
): Promise<void> {
  const full: OnboardingDraft = {
    ...draft,
    updatedAt: draft.updatedAt ?? new Date().toISOString(),
  };
  try {
    await AsyncStorage.setItem(keyFor(full.userId), JSON.stringify(full));
  } catch {
    // Draft persistence is best-effort; the server remains the cross-device copy.
  }
  if (full.userId) await queueServerWrite(full.userId, full).catch(() => undefined);
}

export async function patchOnboardingDraft(
  userId: string | undefined | null,
  patch: Partial<OnboardingDraft>,
): Promise<void> {
  // Patches are emitted on every form change; use the local snapshot here so
  // a field edit does not trigger a server GET before every server PUT.
  const current = await getLocalOnboardingDraft(userId);
  await saveOnboardingDraft({
    ...(current ?? {}),
    ...patch,
    userId: userId ?? current?.userId,
  });
}

export async function clearOnboardingDraft(userId?: string | null): Promise<void> {
  try {
    if (userId) {
      await AsyncStorage.removeItem(keyFor(userId));
    } else {
      await AsyncStorage.removeItem(BASE_KEY);
    }
  } catch {
    // ignore
  }
  if (userId) {
    const previous = serverWrites.get(userId) ?? Promise.resolve();
    const deletion = previous
      .catch(() => undefined)
      .then(() => request(`/api/users/onboarding-draft`, { method: "DELETE", timeoutMs: 5000 }))
      .then(() => undefined);
    serverWrites.set(userId, deletion);
    await deletion.catch(() => undefined);
    if (serverWrites.get(userId) === deletion) serverWrites.delete(userId);
  }
}
