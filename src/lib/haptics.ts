import * as Haptics from 'expo-haptics';

let hapticsEnabled = true;

export function setHapticsEnabled(enabled: boolean) {
  hapticsEnabled = enabled;
}

export async function lightTap() {
  if (!hapticsEnabled) return;
  try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
}

export async function mediumTap() {
  if (!hapticsEnabled) return;
  try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
}

export async function heavyTap() {
  if (!hapticsEnabled) return;
  try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch {}
}

export async function successNotification() {
  if (!hapticsEnabled) return;
  try { await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
}

export async function errorNotification() {
  if (!hapticsEnabled) return;
  try { await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch {}
}

export async function selectionTap() {
  if (!hapticsEnabled) return;
  try { await Haptics.selectionAsync(); } catch {}
}
