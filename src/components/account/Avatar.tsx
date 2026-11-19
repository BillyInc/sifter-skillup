import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { CompassFonts, useTheme } from '@/theme';
import { getDisplayName, type NameSource } from '@/lib/displayName';
import { getAvatarPreset } from '@/lib/avatarPresets';

export interface AvatarUser extends NameSource {
  email?: string | null;
  avatar_url?: string | null;
}

/** Profile avatar: the chosen preset, or the user's initial when none is set. */
export default function Avatar({
  user,
  size = 40,
  presetId,
}: {
  user: AvatarUser | null | undefined;
  size?: number;
  /** Render this preset instead of the stored one (used by the picker). */
  presetId?: string | null;
}) {
  const { colors } = useTheme();
  const preset = getAvatarPreset(presetId !== undefined ? (presetId ? `preset:${presetId}` : null) : user?.avatar_url);
  const tone = preset ? preset.tone(colors) : { bg: colors.surface.sunken, fg: colors.textRole.primary };
  const source = getDisplayName(user) ?? user?.email ?? '';
  const initial = (source.trim().charAt(0) || '?').toUpperCase();
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={preset ? `Avatar: ${preset.label}` : 'Avatar'}
      style={[styles.base, { width: size, height: size, borderRadius: size / 2, backgroundColor: tone.bg, borderColor: colors.borderRole.subtle }]}
    >
      {preset?.icon ? (
        <Feather name={preset.icon} size={Math.round(size * 0.5)} color={tone.fg} />
      ) : (
        <Text style={[{ color: tone.fg, fontSize: Math.round(size * 0.44) }, CompassFonts.bodyBold]}>{initial}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
});
