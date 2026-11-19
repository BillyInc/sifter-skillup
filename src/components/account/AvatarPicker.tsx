/**
 * Avatar picker for Settings. A preset is saved through the existing
 * `PUT /api/users/me` { avatar_url } contract; a photo is uploaded to
 * `POST /api/users/me/avatar` (private, owner-only) and removed with
 * `DELETE /api/users/me/avatar`. The session user is refreshed after each change.
 */
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CompassFonts, FontSize, Radius, Spacing, useTheme } from '@/theme';
import { API } from '@/lib/api';
import { AVATAR_PRESETS, avatarUrlForPreset, getAvatarPreset, isUploadedAvatar } from '@/lib/avatarPresets';
import { AVATAR_GUIDANCE, AVATAR_PRIVACY_NOTE, pickAvatarPhoto, type PickedPhoto } from '@/lib/avatarUpload';
import Avatar, { type AvatarUser } from './Avatar';

export default function AvatarPicker({
  user,
  onSaved,
}: {
  user: AvatarUser | null | undefined;
  onSaved: () => Promise<void> | void;
}) {
  const { colors } = useTheme();
  const hasPhoto = isUploadedAvatar(user?.avatar_url);
  const selected = hasPhoto ? 'photo' : getAvatarPreset(user?.avatar_url)?.id ?? null;
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<PickedPhoto | null>(null);

  useEffect(() => () => {
    if (pending && typeof URL !== 'undefined' && pending.previewUri.startsWith('blob:')) URL.revokeObjectURL(pending.previewUri);
  }, [pending]);

  const choosePhoto = async () => {
    if (busyId !== null) return;
    setError(null);
    try {
      const picked = await pickAvatarPhoto();
      if (picked) setPending(picked);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not open your photos.');
    }
  };

  const confirmPhoto = async () => {
    if (!pending || busyId !== null) return;
    setBusyId('photo');
    setError(null);
    try {
      await API.uploadAvatar(pending.blob, pending.name);
      setPending(null);
      await onSaved();
    } catch (e) {
      // Keep the preview so the user can retry without choosing again.
      setError(e instanceof Error && e.message ? e.message : 'Could not upload your photo. Check your connection and try again.');
    } finally {
      setBusyId(null);
    }
  };

  const removePhoto = async () => {
    if (busyId !== null) return;
    setBusyId('remove');
    setError(null);
    try {
      await API.removeAvatar();
      await onSaved();
    } catch {
      setError('Could not remove your photo. Try again.');
    } finally {
      setBusyId(null);
    }
  };

  const choose = async (id: string | null) => {
    if (busyId !== null || id === selected) return;
    setBusyId(id ?? 'default');
    setError(null);
    try {
      await API.updateMe({ avatar_url: id ? avatarUrlForPreset(id) : null });
      await onSaved();
    } catch {
      setError('Could not save your avatar. Check your connection and try again.');
    } finally {
      setBusyId(null);
    }
  };

  const cell = (id: string | null, label: string) => {
    const active = selected === id;
    return (
      <TouchableOpacity
        key={id ?? 'default'}
        accessibilityRole="radio"
        accessibilityLabel={label}
        accessibilityState={{ checked: active, selected: active, disabled: busyId !== null }}
        disabled={busyId !== null}
        onPress={() => { void choose(id); }}
        style={[styles.cell, { borderColor: active ? colors.accentRole.action : colors.borderRole.subtle, borderWidth: active ? 2 : 1, opacity: busyId !== null && busyId !== (id ?? 'default') ? 0.6 : 1 }]}
      >
        <Avatar user={user} presetId={id} size={40} />
        <Text style={[styles.cellLabel, { color: colors.textRole.secondary }]} numberOfLines={1}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.wrap}>
      <Text style={[styles.help, { color: colors.textRole.muted }]}>Pick an avatar, or upload your own photo below. Avatars are saved as soon as you choose them.</Text>
      <View accessibilityRole="radiogroup" accessibilityLabel="Avatar" style={styles.grid}>
        {cell(null, 'My initial')}
        {AVATAR_PRESETS.map((preset) => cell(preset.id, preset.label))}
      </View>
      <View style={[styles.photoBox, { borderColor: colors.borderRole.subtle }]}>
        <Text style={[styles.photoTitle, { color: colors.textRole.primary }]}>Your photo</Text>
        <Text style={[styles.help, { color: colors.textRole.muted }]}>{AVATAR_GUIDANCE}</Text>
        {pending ? (
          <View style={styles.previewRow}>
            <View style={[styles.preview, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.sunken }]}>
              <Image source={{ uri: pending.previewUri }} style={styles.previewImg} resizeMode="contain" accessibilityLabel="Preview of the photo you chose" />
            </View>
            <View style={styles.photoActions}>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Use this photo" accessibilityState={{ disabled: busyId !== null, busy: busyId === 'photo' }} disabled={busyId !== null} onPress={() => { void confirmPhoto(); }} style={[styles.btn, { backgroundColor: colors.accentRole.fill }]}>
                <Text style={[styles.btnText, { color: colors.accentRole.onFill }]}>{busyId === 'photo' ? 'Uploading...' : 'Use this photo'}</Text>
              </TouchableOpacity>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Cancel" disabled={busyId !== null} onPress={() => { setPending(null); setError(null); }} style={[styles.btn, styles.btnGhost, { borderColor: colors.borderRole.subtle }]}>
                <Text style={[styles.btnText, { color: colors.textRole.secondary }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.photoActions}>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel={hasPhoto ? 'Choose a different photo' : 'Upload a photo'} disabled={busyId !== null} onPress={() => { void choosePhoto(); }} style={[styles.btn, styles.btnGhost, { borderColor: colors.accentRole.action }]}>
              <Text style={[styles.btnText, { color: colors.accentRole.action }]}>{hasPhoto ? 'Choose a different photo' : 'Upload a photo'}</Text>
            </TouchableOpacity>
            {hasPhoto ? (
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Remove photo" accessibilityState={{ disabled: busyId !== null, busy: busyId === 'remove' }} disabled={busyId !== null} onPress={() => { void removePhoto(); }} style={[styles.btn, styles.btnGhost, { borderColor: colors.borderRole.subtle }]}>
                <Text style={[styles.btnText, { color: colors.textRole.secondary }]}>{busyId === 'remove' ? 'Removing...' : 'Remove photo'}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        )}
        <Text style={[styles.help, { color: colors.textRole.muted }]}>{AVATAR_PRIVACY_NOTE}</Text>
      </View>
      {error ? <Text accessibilityRole="alert" style={[styles.error, { color: colors.accentRole.danger }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.sm },
  help: { fontSize: FontSize.xs, lineHeight: 17 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  cell: { width: 88, minHeight: 44, borderRadius: Radius.md, alignItems: 'center', paddingVertical: Spacing.sm, paddingHorizontal: 4, gap: 4 },
  cellLabel: { fontSize: FontSize.xs, ...CompassFonts.bodyMedium },
  error: { fontSize: FontSize.xs },
  photoBox: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.sm, gap: Spacing.sm },
  photoTitle: { fontSize: FontSize.sm, ...CompassFonts.bodyBold },
  previewRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, alignItems: 'center' },
  preview: { width: 120, height: 120, borderWidth: 1, borderRadius: Radius.md, overflow: 'hidden' },
  previewImg: { width: '100%', height: '100%' },
  photoActions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  btn: { minHeight: 44, borderRadius: Radius.md, paddingHorizontal: Spacing.md, alignItems: 'center', justifyContent: 'center' },
  btnGhost: { borderWidth: 1, backgroundColor: 'transparent' },
  btnText: { fontSize: FontSize.sm, ...CompassFonts.bodyBold },
});
