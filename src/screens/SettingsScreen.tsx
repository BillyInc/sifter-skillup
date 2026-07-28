import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { CompassFonts, FontSize, FontWeight, NOTIFICATION_CONFIG, Radius, Shadow, Spacing, useTheme, webContainer } from '../theme';
import { useAuth } from '../hooks/useAuth';
import { resolveTrackContext } from '../lib/trackContext';
import { useStarknetWalletBridge } from '../components/auth/StarknetWalletBridge';

function SettingsCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }, Shadow.sm]}>
      <Text style={[styles.cardTitle, { color: colors.textRole.muted }, CompassFonts.bodyMedium]}>{title}</Text>
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
    <View style={[styles.row, { borderTopColor: colors.borderRole.subtle }]}>
      <Text style={[styles.rowLabel, { color: colors.textRole.secondary }, CompassFonts.bodyMedium]}>{label}</Text>
      <Text style={[styles.rowValue, { color: colors.textRole.primary }, CompassFonts.body]}>{value}</Text>
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, isDark, toggle } = useTheme();
  const { user, signOut, starknetReady, starknetWalletAddress, starknetWalletStatus } = useAuth();
  const starknetBridge = useStarknetWalletBridge();
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
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.surface.base }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }, Shadow.sm]}>
          <Text style={[styles.heroEyebrow, { color: colors.textRole.muted }, CompassFonts.bodyMedium]}>Settings</Text>
          <Text style={[styles.heroTitle, { color: colors.textRole.primary }, CompassFonts.displayBold]}>Light mode is the default. Dark mode is opt-in.</Text>
          <Text style={[styles.heroBody, { color: colors.textRole.secondary }, CompassFonts.body]}>
            Your preferences, account state, and Starknet readiness are collected here so the shell stays honest about what is live and what still needs setup.
          </Text>
        </View>

        <SettingsCard title="APPEARANCE">
          <Text style={[styles.cardHeadline, { color: colors.textRole.primary }, CompassFonts.bodyBold]}>Theme</Text>
          <Text style={[styles.cardBody, { color: colors.textRole.secondary }, CompassFonts.body]}>
            The app now starts in light mode and only changes to dark mode when you toggle it yourself.
          </Text>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={toggle}
            style={[styles.toggleBtn, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}
          >
            <Text style={[styles.toggleBtnText, { color: colors.textRole.primary }, CompassFonts.bodyBold]}>
              Switch to {isDark ? 'Light' : 'Dark'} Mode
            </Text>
          </TouchableOpacity>
        </SettingsCard>

        <SettingsCard title="ACCOUNT">
          <Row label="Username" value={user?.username ?? 'Learner'} />
          <Row label="Email" value={user?.email || 'Not set'} />
          <Row label="Auth Provider" value={user?.auth_provider ?? 'guest'} />
          <Row label="Starknet Address" value={starknetWalletAddress ?? user?.starknet_address ?? 'Not connected'} />
          <Row label="Starknet Bridge" value={starknetReady ? 'Connected' : starknetWalletStatus} />
          <Row label="Fee Mode" value={starknetBridge.connectionMode ?? 'self-paid'} />
          <Row label="Active Field" value={user?.activeFieldId ?? user?.active_field_id ?? 'Not selected'} />
          <Row label="Active Track" value={user?.currentTrackName ?? user?.currentTrackId ?? 'Not selected'} />
          {user?.starknet_address ? (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={starknetBridge.status === 'disconnected' ? starknetBridge.connect : starknetBridge.disconnect}
              style={[styles.linkBtn, { borderColor: colors.borderRole.subtle }]}
            >
              <Text style={[styles.linkBtnText, { color: colors.textRole.primary }, CompassFonts.bodyBold]}>
                {starknetBridge.status === 'disconnected' ? 'Reconnect Starknet Wallet' : 'Disconnect Starknet Wallet'}
              </Text>
            </TouchableOpacity>
          ) : null}
        </SettingsCard>

        <SettingsCard title="WORKSPACE">
          <Text style={[styles.cardHeadline, { color: colors.textRole.primary }, CompassFonts.bodyBold]}>
            {trackContext.mode === 'track' ? `${workspaceLabel} is active` : 'Choose the workspace you want to continue'}
          </Text>
          <Text style={[styles.cardBody, { color: colors.textRole.secondary }, CompassFonts.body]}>
            {trackContext.mode === 'track'
              ? `${trackContext.description} ${workspaceStatus}`
              : 'Pick a track from the dashboard to unlock contextual islands, guild views, portfolio targets, and continue actions.'}
          </Text>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push(workspaceHref as any)}
            style={[styles.toggleBtn, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}
          >
            <Text style={[styles.toggleBtnText, { color: colors.textRole.primary }, CompassFonts.bodyBold]}>{workspaceCta}</Text>
          </TouchableOpacity>
        </SettingsCard>

        <SettingsCard title="MY SCHOOL">
          <Text style={[styles.cardHeadline, { color: colors.textRole.primary }, CompassFonts.bodyBold]}>Claim or link your school</Text>
          <Text style={[styles.cardBody, { color: colors.textRole.secondary }, CompassFonts.body]}>
            Redeem a claim code from your school, or link your school by its code.
            Your individual progress stays private unless you choose to share it.
          </Text>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/(tabs)/settings/my-school' as any)}
            style={[styles.linkBtn, { borderColor: colors.borderRole.subtle }]}
          >
            <Text style={[styles.linkBtnText, { color: colors.textRole.primary }, CompassFonts.bodyBold]}>Open My School</Text>
          </TouchableOpacity>
        </SettingsCard>

        <SettingsCard title="NOTIFICATIONS">
          <Text style={[styles.cardHeadline, { color: colors.textRole.primary }, CompassFonts.bodyBold]}>Reminder delivery</Text>
          <Text style={[styles.cardBody, { color: colors.textRole.secondary }, CompassFonts.body]}>
            Provider: {NOTIFICATION_CONFIG.provider}. Weekly digest day: {NOTIFICATION_CONFIG.weeklyDigestDay}. Default reminder hour: {NOTIFICATION_CONFIG.weeklyDigestHour}:00.
          </Text>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/(tabs)/streaks')}
            style={[styles.linkBtn, { borderColor: colors.borderRole.subtle }]}
          >
            <Text style={[styles.linkBtnText, { color: colors.textRole.primary }, CompassFonts.bodyBold]}>Review streak timing</Text>
          </TouchableOpacity>
        </SettingsCard>

        <SettingsCard title="LEGAL">
          <Text style={[styles.cardHeadline, { color: colors.textRole.primary }, CompassFonts.bodyBold]}>Privacy and terms</Text>
          <Text style={[styles.cardBody, { color: colors.textRole.secondary }, CompassFonts.body]}>
            Privacy contact: privacy@sifter.app. Legal contact: legal@sifter.app. Governing jurisdiction remains Nigeria per the app's existing legal copy.
          </Text>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => Linking.openURL('mailto:privacy@sifter.app')}
            style={[styles.linkBtn, { borderColor: colors.borderRole.subtle }]}
          >
            <Text style={[styles.linkBtnText, { color: colors.textRole.primary }, CompassFonts.bodyBold]}>Email privacy team</Text>
          </TouchableOpacity>
        </SettingsCard>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleSignOut}
          style={[styles.signOutBtn, { backgroundColor: colors.accentRole.danger }]}
        >
          <Text style={[styles.signOutBtnText, CompassFonts.bodyBold]}>Sign Out</Text>
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
