import AsyncStorage from "@react-native-async-storage/async-storage";
import type { StartingPointProfile, UserType } from "../types/onboarding";
import type { EducatorProfile } from "../types/institution";

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

function keyFor(userId?: string | null): string {
  return userId ? `${BASE_KEY}:${userId}` : BASE_KEY;
}

export async function getOnboardingDraft(
  userId?: string | null,
): Promise<OnboardingDraft | null> {
  try {
    const raw = await AsyncStorage.getItem(keyFor(userId));
    return raw ? (JSON.parse(raw) as OnboardingDraft) : null;
  } catch {
    return null;
  }
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
    // Draft persistence is best-effort; server persistence still runs on saves.
  }
}

export async function patchOnboardingDraft(
  userId: string | undefined | null,
  patch: Partial<OnboardingDraft>,
): Promise<void> {
  const current = await getOnboardingDraft(userId);
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
}
