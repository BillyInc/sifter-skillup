import { Platform } from 'react-native';

let Haptics: any = null;
if (Platform.OS !== 'web') {
  try {
    Haptics = require('expo-haptics');
  } catch {}
}

let hapticsEnabled = true;

export function setHapticsEnabled(enabled: boolean) {
  hapticsEnabled = enabled;
}

export async function lightTap() {
  if (!hapticsEnabled || !Haptics) return;
  try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
}

export async function mediumTap() {
  if (!hapticsEnabled || !Haptics) return;
  try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
}

export async function heavyTap() {
  if (!hapticsEnabled || !Haptics) return;
  try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch {}
}

export async function successNotification() {
  if (!hapticsEnabled || !Haptics) return;
  try { await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
}

export async function errorNotification() {
  if (!hapticsEnabled || !Haptics) return;
  try { await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch {}
}

export async function selectionTap() {
  if (!hapticsEnabled || !Haptics) return;
  try { await Haptics.selectionAsync(); } catch {}
}
