import { clearLocalAccountType } from "./accountType";
import { clearEducatorProfile } from "./educatorProfile";
import { clearStartingPoint } from "./startingPoint";
import { clearOnboardingDraft } from "./onboardingDraft";

export async function clearLocalUserState(userId?: string | null): Promise<void> {
  await Promise.all([
    clearLocalAccountType(userId),
    clearEducatorProfile(userId),
    clearStartingPoint(userId),
    clearOnboardingDraft(userId),
  ]);
}
