/**
 * Profile-photo picking and client-side pre-checks. The server is the authority
 * (magic bytes, size, dimensions, re-encode); these checks only give a kinder,
 * faster message. Native uses expo-image-picker; on web that alias is a stub
 * that always cancels, so web uses a file input.
 */
import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
export const AVATAR_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const AVATAR_GUIDANCE =
  'JPEG, PNG or WebP, up to 2 MB, at least 128 x 128 pixels. We keep the middle square and show it as a circle.';
export const AVATAR_PRIVACY_NOTE = 'Only you can see your photo.';

export interface PickedPhoto {
  blob: Blob;
  name: string;
  type: string;
  previewUri: string;
}

/** Plain-language problem with a candidate file, or null when it looks fine. */
export function avatarFileProblem(file: { type?: string | null; size?: number | null }): string | null {
  const type = (file.type ?? '').toLowerCase();
  if (type && !(AVATAR_ALLOWED_TYPES as readonly string[]).includes(type)) {
    return 'Use a JPEG, PNG or WebP photo.';
  }
  if (typeof file.size === 'number' && file.size > AVATAR_MAX_BYTES) {
    return 'That photo is larger than 2 MB. Choose a smaller one.';
  }
  return null;
}

/** Opens the picker. Resolves null when the user cancels; throws a user-safe Error on problems. */
export async function pickAvatarPhoto(): Promise<PickedPhoto | null> {
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    const file = await new Promise<File | null>((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/jpeg,image/png,image/webp';
      input.onchange = () => resolve(input.files?.[0] ?? null);
      input.oncancel = () => resolve(null);
      input.click();
    });
    if (!file) return null;
    const problem = avatarFileProblem(file);
    if (problem) throw new Error(problem);
    return { blob: file, name: file.name, type: file.type, previewUri: URL.createObjectURL(file) };
  }

  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) throw new Error('Allow photo access in your device settings to choose a photo.');
  const result = await ImagePicker.launchImageLibraryAsync({
    allowsEditing: false,
    quality: 0.8,
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
  });
  if (result.canceled || !result.assets[0]) return null;
  const asset = result.assets[0];
  const blob = await fetch(asset.uri).then((r) => r.blob());
  const type = asset.mimeType ?? blob.type ?? 'image/jpeg';
  const problem = avatarFileProblem({ type, size: asset.fileSize ?? blob.size });
  if (problem) throw new Error(problem);
  return { blob, name: asset.fileName ?? `avatar.${type.split('/')[1] ?? 'jpg'}`, type, previewUri: asset.uri };
}
