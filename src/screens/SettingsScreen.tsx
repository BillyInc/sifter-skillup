import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { FontSize, FontWeight, NOTIFICATION_CONFIG, Radius, Shadow, Spacing, useTheme, webContainer } from '../theme';
import { useAuth } from '../hooks/useAuth';
import { resolveTrackContext } from '../lib/trackContext';

function SettingsCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, Shadow.sm]}>
      <Text style={[styles.cardTitle, { color: colors.textMuted }]}>{title}</Text>
      {children}
    </View>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const { colors } = useTheme();

  return (
    <View style={[styles.row, { borderTopColor: colors.border }]}>
      <Text style={[styles.rowLabel, { color: colors.textSoft }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, isDark, toggle } = useTheme();
  const { user, signOut, starknetReady, starknetWalletAddress, starknetWalletStatus } = useAuth();
  const trackContext = React.useMemo(() => resolveTrackContext(user), [user]);
  const workspaceHref = trackContext.mode === 'track' ? trackContext.continueHref : '/(tabs)/fields';
  const workspaceLabel = trackContext.mode === 'track' ? trackContext.trackName : 'No active workspace';
  const workspaceCta = trackContext.mode === 'track' ? 'Open Current Workspace' : 'Explore Tracks';
  const workspaceStatus = trackContext.fieldId === 'starknet' || starknetReady
    ? (starknetReady
        ? `Wallet bridge ready as ${starknetWalletAddress?.slice(0, 10)}...${starknetWalletAddress?.slice(-6)}.`
        : `Wallet bridge status: ${starknetWalletStatus}.`)
    : 'This workspace does not need a Starknet wallet to continue.';

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)');
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { backgroundColor: colors.card, borderColor: colors.border }, Shadow.sm]}>
          <Text style={[styles.heroEyebrow, { color: colors.textMuted }]}>Settings</Text>
          <Text style={[styles.heroTitle, { color: colors.text }]}>Light mode is the default. Dark mode is opt-in.</Text>
          <Text style={[styles.heroBody, { color: colors.textSoft }]}>
            Your preferences, account state, and Starknet readiness are collected here so the shell stays honest about what is live and what still needs setup.
          </Text>
        </View>

        <SettingsCard title="APPEARANCE">
          <Text style={[styles.cardHeadline, { color: colors.text }]}>Theme</Text>
          <Text style={[styles.cardBody, { color: colors.textSoft }]}>
            The app now starts in light mode and only changes to dark mode when you toggle it yourself.
          </Text>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={toggle}
            style={[styles.toggleBtn, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}
          >
            <Text style={[styles.toggleBtnText, { color: colors.text }]}>
              Switch to {isDark ? 'Light' : 'Dark'} Mode
            </Text>
          </TouchableOpacity>
        </SettingsCard>

        <SettingsCard title="ACCOUNT">
          <Row label="Username" value={user?.username ?? 'Learner'} />
          <Row label="Email" value={user?.email || 'Not set'} />
          <Row label="Auth Provider" value={user?.auth_provider ?? 'guest'} />
          <Row label="Active Field" value={user?.activeFieldId ?? user?.active_field_id ?? 'Not selected'} />
          <Row label="Active Track" value={user?.currentTrackName ?? user?.currentTrackId ?? 'Not selected'} />
        </SettingsCard>

        <SettingsCard title="WORKSPACE">
          <Text style={[styles.cardHeadline, { color: colors.text }]}>
            {trackContext.mode === 'track' ? `${workspaceLabel} is active` : 'Choose the workspace you want to continue'}
          </Text>
          <Text style={[styles.cardBody, { color: colors.textSoft }]}>
            {trackContext.mode === 'track'
              ? `${trackContext.description} ${workspaceStatus}`
              : 'Pick a track from the dashboard to unlock contextual islands, guild views, portfolio targets, and continue actions.'}
          </Text>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push(workspaceHref as any)}
            style={[styles.toggleBtn, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}
          >
            <Text style={[styles.toggleBtnText, { color: colors.text }]}>{workspaceCta}</Text>
          </TouchableOpacity>
        </SettingsCard>

        <SettingsCard title="NOTIFICATIONS">
          <Text style={[styles.cardHeadline, { color: colors.text }]}>Reminder delivery</Text>
          <Text style={[styles.cardBody, { color: colors.textSoft }]}>
            Provider: {NOTIFICATION_CONFIG.provider}. Weekly digest day: {NOTIFICATION_CONFIG.weeklyDigestDay}. Default reminder hour: {NOTIFICATION_CONFIG.weeklyDigestHour}:00.
          </Text>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/(tabs)/streaks')}
            style={[styles.linkBtn, { borderColor: colors.border }]}
          >
            <Text style={[styles.linkBtnText, { color: colors.text }]}>Review streak timing</Text>
          </TouchableOpacity>
        </SettingsCard>

        <SettingsCard title="LEGAL">
          <Text style={[styles.cardHeadline, { color: colors.text }]}>Privacy and terms</Text>
          <Text style={[styles.cardBody, { color: colors.textSoft }]}>
            Privacy contact: privacy@sifter.app. Legal contact: legal@sifter.app. Governing jurisdiction remains Nigeria per the app’s existing legal copy.
          </Text>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => Linking.openURL('mailto:privacy@sifter.app')}
            style={[styles.linkBtn, { borderColor: colors.border }]}
          >
            <Text style={[styles.linkBtnText, { color: colors.text }]}>Email privacy team</Text>
          </TouchableOpacity>
        </SettingsCard>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleSignOut}
          style={[styles.signOutBtn, { backgroundColor: colors.red }]}
        >
          <Text style={styles.signOutBtnText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {
    ...webContainer,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.md,
  },
  hero: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  heroEyebrow: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.black,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.black,
  },
  heroBody: {
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  card: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  cardTitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.black,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  cardHeadline: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.black,
  },
  cardBody: {
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  row: {
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    gap: 4,
  },
  rowLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.black,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  rowValue: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  toggleBtn: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  toggleBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  linkBtn: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  linkBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  signOutBtn: {
    borderRadius: Radius.xl,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  signOutBtnText: {
    color: '#fff',
    fontSize: FontSize.sm,
    fontWeight: FontWeight.black,
  },
});
