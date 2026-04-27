import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, Spacing, Radius, FontSize, Shadow } from '../theme';

interface EmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, message, actionLabel, onAction }: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[styles.panel, { backgroundColor: colors.card, borderColor: colors.border }, Shadow.md]}>
        <View style={[styles.accentRail, { backgroundColor: colors.accent }]} />
        <Text style={[styles.eyebrow, { color: colors.accent }]}>Sifter Workspace</Text>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.message, { color: colors.textSoft }]}>{message}</Text>
      </View>
      {actionLabel && onAction && (
        <TouchableOpacity style={[styles.button, { backgroundColor: colors.accent }, Shadow.sm]} onPress={onAction}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  panel: {
    width: '100%',
    maxWidth: 420,
    borderRadius: Radius.xl,
    borderWidth: 1,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
  },
  accentRail: {
    width: 56,
    height: 4,
    borderRadius: Radius.full,
    marginBottom: Spacing.md,
  },
  eyebrow: {
    fontSize: FontSize.xs,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: FontSize.md,
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    marginTop: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxl,
    borderRadius: Radius.lg,
  },
  buttonText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: '#ffffff',
  },
});
