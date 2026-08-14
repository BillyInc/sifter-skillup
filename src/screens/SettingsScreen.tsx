import React, { useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Linking, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { CompassFonts, FontSize, Radius, Shadow, Spacing, useTheme, webContainer } from '@/theme';
import { useAuth } from '@/hooks/useAuth';
import { API } from '@/lib/api';
import { isAdminAccount } from '@/lib/accountType';
import TermsScreen from '@/screens/TermsScreen';
import PrivacyScreen from '@/screens/PrivacyScreen';

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
  const { user, signOut, deleteAccount, refreshUser } = useAuth();
  const [accountAction, setAccountAction] = useState<'sign-out' | 'delete' | null>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [legalPage, setLegalPage] = useState<'terms' | 'privacy' | null>(null);
  const isAdmin = isAdminAccount(user?.account_type);
  const admin2FA = useMemo(
    () => (user?.settings?.admin2fa ?? {}) as { setupRequestedAt?: string; deferredAt?: string },
    [user?.settings],
  );

  const handleAccountAction = async () => {
    if (!accountAction || actionBusy) return;
    setActionBusy(true);
    try {
      if (accountAction === 'sign-out') await signOut();
      else await deleteAccount();
      setAccountAction(null);
      router.replace('/(auth)/sign-in');
    } finally {
      setActionBusy(false);
    }
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
            Nigeria-first privacy and consumer safeguards apply. Review the current terms, privacy policy, and your rights before sharing student or school data.
          </Text>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => Linking.openURL('mailto:privacy@sifter.app')}
            style={[styles.linkBtn, { borderColor: colors.borderRole.subtle }]}
          >
            <Text style={[styles.linkBtnText, { color: colors.textRole.primary }, CompassFonts.bodyBold]}>Email privacy team</Text>
          </TouchableOpacity>
          <View style={styles.legalActions}>
            <TouchableOpacity onPress={() => setLegalPage('terms')} style={[styles.linkBtn, { borderColor: colors.borderRole.subtle, flex: 1 }]}>
              <Text style={[styles.linkBtnText, { color: colors.textRole.primary }, CompassFonts.bodyBold]}>View terms</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setLegalPage('privacy')} style={[styles.linkBtn, { borderColor: colors.borderRole.subtle, flex: 1 }]}>
              <Text style={[styles.linkBtnText, { color: colors.textRole.primary }, CompassFonts.bodyBold]}>View privacy</Text>
            </TouchableOpacity>
          </View>
        </SettingsCard>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setAccountAction('sign-out')}
          style={[styles.signOutBtn, { backgroundColor: colors.accentRole.danger }]}
        >
          <Text style={[styles.signOutBtnText, CompassFonts.bodyBold]}>Sign Out</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setAccountAction('delete')}
          style={[styles.deleteAccountBtn, { borderColor: colors.accentRole.danger }]}
        >
          <Text style={[styles.deleteAccountBtnText, { color: colors.accentRole.danger }, CompassFonts.bodyBold]}>Delete account</Text>
        </TouchableOpacity>
      </ScrollView>
      <Modal visible={accountAction !== null} transparent animationType="fade" onRequestClose={() => setAccountAction(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
            <Text style={[styles.modalTitle, { color: colors.textRole.primary }, CompassFonts.displayBold]}>
              {accountAction === 'delete' ? 'Delete your account?' : 'Sign out?'}
            </Text>
            <Text style={[styles.cardBody, { color: colors.textRole.secondary }, CompassFonts.body]}>
              {accountAction === 'delete'
                ? 'Your account will be marked for deletion according to the recovery policy.'
                : 'You will need to log in again to continue.'}
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setAccountAction(null)} disabled={actionBusy} style={[styles.linkBtn, { borderColor: colors.borderRole.subtle, flex: 1 }]}>
                <Text style={[styles.linkBtnText, { color: colors.textRole.primary }, CompassFonts.bodyBold]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAccountAction} disabled={actionBusy} style={[styles.linkBtn, { borderColor: colors.accentRole.danger, backgroundColor: colors.accentRole.danger, flex: 1, opacity: actionBusy ? 0.6 : 1 }]}>
                <Text style={[styles.linkBtnText, { color: '#fff' }, CompassFonts.bodyBold]}>{accountAction === 'delete' ? 'Delete account' : 'Sign out'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal visible={legalPage !== null} animationType="slide" onRequestClose={() => setLegalPage(null)}>
        {legalPage === 'terms' ? <TermsScreen onClose={() => setLegalPage(null)} /> : <PrivacyScreen onClose={() => setLegalPage(null)} />}
      </Modal>
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
  deleteAccountBtn: { borderRadius: Radius.xl, borderWidth: 1, paddingVertical: Spacing.md, alignItems: 'center' },
  deleteAccountBtnText: { fontSize: FontSize.sm, fontWeight: '900' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  modalCard: { width: '100%', maxWidth: 420, borderRadius: Radius.xl, borderWidth: 1, padding: Spacing.xl, gap: Spacing.md },
  modalTitle: { fontSize: FontSize.xl },
  modalActions: { flexDirection: 'row', gap: Spacing.sm },
  legalActions: { flexDirection: 'row', gap: Spacing.sm },
});
