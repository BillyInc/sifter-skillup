import React, { useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert, Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { CompassFonts, FontSize, FontWeight, Radius, Shadow, Spacing, useTheme, webContainer } from '@/theme';
import { useAuth } from '@/hooks/useAuth';
import { API } from '@/lib/api';
import { isAdminAccount } from '@/lib/accountType';

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
  const { user, signOut, refreshUser } = useAuth();
  const isAdmin = isAdminAccount(user?.account_type);
  const admin2FA = useMemo(
    () => (user?.settings?.admin2fa ?? {}) as { setupRequestedAt?: string; deferredAt?: string },
    [user?.settings],
  );

  const handleSignOut = async () => {
    const confirm = async () => {
      await signOut();
      router.replace('/(auth)/sign-in');
    };

    if (Platform.OS === 'web') {
      if (globalThis.confirm?.('Sign out of this account?')) {
        await confirm();
      }
      return;
    }

    Alert.alert('Sign out?', 'You will need to log in again to continue.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => void confirm() },
    ]);
  };

  const updateAdmin2FA = async (patch: Record<string, unknown>) => {
    const settings = {
      ...(user?.settings ?? {}),
      admin2fa: {
        ...admin2FA,
        ...patch,
      },
    };
    await API.updateMe({ settings });
    await refreshUser();
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.surface.base }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }, Shadow.sm]}>
          <Text style={[styles.heroEyebrow, { color: colors.textRole.muted }, CompassFonts.bodyMedium]}>Settings</Text>
          <Text style={[styles.heroTitle, { color: colors.textRole.primary }, CompassFonts.displayBold]}>Light mode is the default. Dark mode is opt-in.</Text>
          <Text style={[styles.heroBody, { color: colors.textRole.secondary }, CompassFonts.body]}>
            Your account preferences, notifications, school link, and privacy controls live here.
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
          <Row label="Name" value={user?.username ?? 'Learner'} />
          <Row label="Email" value={user?.email || 'Not set'} />
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

        {isAdmin ? (
          <SettingsCard title="ADMIN SECURITY">
            <Text style={[styles.cardHeadline, { color: colors.textRole.primary }, CompassFonts.bodyBold]}>
              Two-factor authentication
            </Text>
            <Text style={[styles.cardBody, { color: colors.textRole.secondary }, CompassFonts.body]}>
              Admin accounts can manage learners and institution data, so 2FA is recommended after onboarding. You can defer this, but it will remain visible here.
            </Text>
            <Row
              label="Status"
              value={admin2FA.setupRequestedAt ? 'Setup requested' : admin2FA.deferredAt ? 'Deferred' : 'Recommended'}
            />
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => updateAdmin2FA({ setupRequestedAt: new Date().toISOString() })}
              style={[styles.linkBtn, { borderColor: colors.borderRole.subtle }]}
            >
              <Text style={[styles.linkBtnText, { color: colors.textRole.primary }, CompassFonts.bodyBold]}>
                Start 2FA setup
              </Text>
            </TouchableOpacity>
            {!admin2FA.setupRequestedAt ? (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => updateAdmin2FA({ deferredAt: new Date().toISOString() })}
                style={[styles.linkBtn, { borderColor: colors.borderRole.subtle }]}
              >
                <Text style={[styles.linkBtnText, { color: colors.textRole.primary }, CompassFonts.bodyBold]}>
                  Remind me later
                </Text>
              </TouchableOpacity>
            ) : null}
          </SettingsCard>
        ) : null}

        <SettingsCard title="NOTIFICATIONS">
          <Text style={[styles.cardHeadline, { color: colors.textRole.primary }, CompassFonts.bodyBold]}>Notification controls</Text>
          <Text style={[styles.cardBody, { color: colors.textRole.secondary }, CompassFonts.body]}>
            Alerts for deadlines, saved programmes and school updates will appear here once those features are live.
          </Text>
        </SettingsCard>

        <SettingsCard title="LEGAL">
          <Text style={[styles.cardHeadline, { color: colors.textRole.primary }, CompassFonts.bodyBold]}>Privacy and terms</Text>
          <Text style={[styles.cardBody, { color: colors.textRole.secondary }, CompassFonts.body]}>
            Privacy contact: privacy@sifter.app. Legal contact: legal@sifter.app. Governing jurisdiction remains Nigeria per the app&apos;s existing legal copy.
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
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: FontSize.xl,
    fontWeight: '900',
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
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  cardHeadline: {
    fontSize: FontSize.md,
    fontWeight: '900',
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
    fontWeight: '900',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  rowValue: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  toggleBtn: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  toggleBtnText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  linkBtn: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  linkBtnText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  signOutBtn: {
    borderRadius: Radius.xl,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  signOutBtnText: {
    color: '#fff',
    fontSize: FontSize.sm,
    fontWeight: '900',
  },
});
