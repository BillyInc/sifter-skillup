/**
 * Optional "Name to show" control for Settings. It writes through the existing
 * `PUT /api/users/me` ({ display_name } when the API returns that field, else legacy { username }) and then refreshes the session
 * user, so every surface that reads `getDisplayName` updates together.
 */
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { CompassFonts, FontSize, Radius, Spacing, useTheme } from '@/theme';
import { API } from '@/lib/api';
import { DISPLAY_NAME_MAX, getDisplayName, NAME_TO_SHOW_MAX, sanitizeNameToShow, supportsDisplayName, type NameSource } from '@/lib/displayName';

export default function NameToShowField({
  user,
  onSaved,
}: {
  user: NameSource | null | undefined;
  onSaved: () => Promise<void> | void;
}) {
  const { colors } = useTheme();
  const current = getDisplayName(user);
  const useDisplayName = supportsDisplayName(user);
  const max = useDisplayName ? DISPLAY_NAME_MAX : NAME_TO_SHOW_MAX;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = () => {
    setDraft(current ?? '');
    setError(null);
    setEditing(true);
  };

  const save = async () => {
    if (busy) return;
    const result = sanitizeNameToShow(draft, max);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (result.value === current) {
      setEditing(false);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await API.updateMe(useDisplayName ? { display_name: result.value } : { username: result.value });
      await onSaved();
      setEditing(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '';
      setError(useDisplayName && msg && !/network|fetch|timeout|failed to/i.test(msg) ? msg : 'Could not save your name. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[styles.wrap, { borderTopColor: colors.borderRole.subtle }]}>
      <Text style={[styles.label, { color: colors.textRole.secondary }, CompassFonts.bodyMedium]}>Name to show</Text>
      {editing ? (
        <>
          <TextInput
            value={draft}
            onChangeText={(value) => { setDraft(value); if (error) setError(null); }}
            placeholder="The name you want to see"
            placeholderTextColor={colors.textRole.placeholder}
            maxLength={max}
            autoCapitalize="words"
            autoComplete="name"
            autoFocus
            editable={!busy}
            returnKeyType="done"
            onSubmitEditing={() => { void save(); }}
            accessibilityLabel="Name to show"
            style={[styles.input, { color: colors.textRole.primary, borderColor: error ? colors.accentRole.danger : colors.borderRole.strong, backgroundColor: colors.surface.base }, CompassFonts.body]}
          />
          {error ? <Text accessibilityRole="alert" style={[styles.error, { color: colors.accentRole.danger }]}>{error}</Text> : null}
          <View style={styles.actions}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Save name"
              accessibilityState={{ disabled: busy, busy }}
              disabled={busy}
              onPress={() => { void save(); }}
              style={[styles.btn, { backgroundColor: colors.accentRole.fill, borderColor: colors.accentRole.fill, opacity: busy ? 0.6 : 1 }]}
            >
              <Text style={[styles.btnText, { color: colors.accentRole.onFill }, CompassFonts.bodyBold]}>{busy ? 'Saving…' : 'Save'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Cancel editing name"
              disabled={busy}
              onPress={() => setEditing(false)}
              style={[styles.btn, { borderColor: colors.borderRole.subtle }]}
            >
              <Text style={[styles.btnText, { color: colors.textRole.primary }, CompassFonts.bodyBold]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.valueRow}>
          <Text style={[styles.value, { color: colors.textRole.primary }, CompassFonts.body]}>{current ?? 'Not set'}</Text>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Change name to show" onPress={open} style={styles.change}>
            <Text style={[styles.changeText, { color: colors.accentRole.action }, CompassFonts.bodyBold]}>Change</Text>
          </TouchableOpacity>
        </View>
      )}
      <Text style={[styles.help, { color: colors.textRole.muted }]}>Shown on Home, your profile and the menu. It does not change your account email.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: Spacing.sm, borderTopWidth: 1, gap: 6 },
  label: { fontSize: FontSize.xs, fontWeight: '900', letterSpacing: 0.4, textTransform: 'uppercase' },
  valueRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm },
  value: { flex: 1, fontSize: FontSize.sm, fontWeight: '700' },
  change: { minHeight: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.sm },
  changeText: { fontSize: FontSize.sm },
  input: { borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: 10, fontSize: FontSize.sm, minHeight: 44 },
  error: { fontSize: FontSize.xs },
  actions: { flexDirection: 'row', gap: Spacing.sm },
  btn: { minHeight: 44, borderRadius: Radius.md, borderWidth: 1, paddingHorizontal: Spacing.lg, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontSize: FontSize.sm },
  help: { fontSize: FontSize.xs, lineHeight: 17 },
});
