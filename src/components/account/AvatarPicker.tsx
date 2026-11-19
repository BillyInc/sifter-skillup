/**
 * Preset avatar picker for Settings. Saves a short identifier through the
 * existing `PUT /api/users/me` { avatar_url } contract, then refreshes the
 * session user so the profile header and shell update together.
 */
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CompassFonts, FontSize, Radius, Spacing, useTheme } from '@/theme';
import { API } from '@/lib/api';
import { AVATAR_PRESETS, avatarUrlForPreset, getAvatarPreset } from '@/lib/avatarPresets';
import Avatar, { type AvatarUser } from './Avatar';

export default function AvatarPicker({
  user,
  onSaved,
}: {
  user: AvatarUser | null | undefined;
  onSaved: () => Promise<void> | void;
}) {
  const { colors } = useTheme();
  const selected = getAvatarPreset(user?.avatar_url)?.id ?? null;
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      <Text style={[styles.help, { color: colors.textRole.muted }]}>Pick an avatar. It is saved as soon as you choose it.</Text>
      <View accessibilityRole="radiogroup" accessibilityLabel="Avatar" style={styles.grid}>
        {cell(null, 'My initial')}
        {AVATAR_PRESETS.map((preset) => cell(preset.id, preset.label))}
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
});
