import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ProvisionDraft } from "../types/institution";

export interface AdminResumeState {
  href: string;
  label: string;
  updatedAt: string;
}

export interface AdminTaskState {
  href: string;
  label: string;
  stage?: string;
  tab?: string;
  updatedAt: string;
}

const RESUME_KEY = "@levelup_admin_resume_v1";
const TASK_KEY = "@levelup_admin_task_v1";
const LOCAL_DRAFTS_KEY = "@levelup_admin_provisioning_drafts_v1";

function scopedKey(base: string, userId?: string | null) {
  return userId ? `${base}:${userId}` : base;
}

function validAdminHref(href: unknown): href is string {
  return typeof href === "string" && href.startsWith("/(admin)/");
}

export async function getAdminResume(userId?: string | null): Promise<AdminResumeState | null> {
  try {
    const raw = await AsyncStorage.getItem(scopedKey(RESUME_KEY, userId));
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<AdminResumeState>;
    if (!validAdminHref(value.href)) return null;
    return {
      href: value.href,
      label: typeof value.label === "string" ? value.label : "Your last admin task",
      updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : "",
    };
  } catch {
    return null;
  }
}

export async function saveAdminResume(
  state: Omit<AdminResumeState, "updatedAt">,
  userId?: string | null,
): Promise<void> {
  if (!validAdminHref(state.href)) return;
  try {
    await AsyncStorage.setItem(
      scopedKey(RESUME_KEY, userId),
      JSON.stringify({ ...state, updatedAt: new Date().toISOString() }),
    );
  } catch {
    // Resume is helpful but never blocks the admin workspace.
  }
}

export async function getAdminTask(userId?: string | null): Promise<AdminTaskState | null> {
  try {
    const raw = await AsyncStorage.getItem(scopedKey(TASK_KEY, userId));
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<AdminTaskState>;
    if (!validAdminHref(value.href)) return null;
    return {
      href: value.href,
      label: typeof value.label === "string" ? value.label : "Your last admin task",
      stage: typeof value.stage === "string" ? value.stage : undefined,
      tab: typeof value.tab === "string" ? value.tab : undefined,
      updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : "",
    };
  } catch {
    return null;
  }
}

export async function saveAdminTask(
  state: Omit<AdminTaskState, "updatedAt">,
  userId?: string | null,
): Promise<void> {
  if (!validAdminHref(state.href)) return;
  try {
    await AsyncStorage.setItem(
      scopedKey(TASK_KEY, userId),
      JSON.stringify({ ...state, updatedAt: new Date().toISOString() }),
    );
  } catch {
    // Resume is helpful but never blocks the admin workspace.
  }
}

export async function clearAdminResume(userId?: string | null): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      scopedKey(RESUME_KEY, userId),
      scopedKey(TASK_KEY, userId),
      scopedKey(LOCAL_DRAFTS_KEY, userId),
    ]);
  } catch {
    // ignore
  }
}

/** Persist only unsubmitted manual rows; these are still drafts, never accounts. */
export async function getAdminProvisioningDrafts(userId?: string | null): Promise<ProvisionDraft[]> {
  try {
    const raw = await AsyncStorage.getItem(scopedKey(LOCAL_DRAFTS_KEY, userId));
    if (!raw) return [];
    const rows = JSON.parse(raw) as unknown;
    return Array.isArray(rows) ? rows as ProvisionDraft[] : [];
  } catch {
    return [];
  }
}

export async function saveAdminProvisioningDrafts(
  drafts: ProvisionDraft[],
  userId?: string | null,
): Promise<void> {
  try {
    if (!drafts.length) {
      await AsyncStorage.removeItem(scopedKey(LOCAL_DRAFTS_KEY, userId));
      return;
    }
    await AsyncStorage.setItem(scopedKey(LOCAL_DRAFTS_KEY, userId), JSON.stringify(drafts));
  } catch {
    // Draft persistence is best-effort and must not block account creation.
  }
}
