import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useTheme, Spacing, Radius, FontSize, Shadow } from '../theme';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message }: LoadingScreenProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[styles.panel, { backgroundColor: colors.card, borderColor: colors.border }, Shadow.md]}>
        <View style={[styles.spinnerHalo, { backgroundColor: colors.accentSoft }]}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>Preparing your workspace</Text>
        {message && <Text style={[styles.message, { color: colors.textSoft }]}>{message}</Text>}
      </View>
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
    maxWidth: 320,
    borderRadius: Radius.xl,
    borderWidth: 1,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
  },
  spinnerHalo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: '800',
    textAlign: 'center',
  },
  message: {
    fontSize: FontSize.md,
    marginTop: Spacing.sm,
    textAlign: 'center',
    lineHeight: 22,
  },
});
