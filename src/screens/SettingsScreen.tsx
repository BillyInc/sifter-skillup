import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Linking, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
  const [mfaStatus, setMfaStatus] = useState('recommended');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaMessage, setMfaMessage] = useState<string | null>(null);
  const [mfaBusy, setMfaBusy] = useState(false);
  const isAdmin = isAdminAccount(user?.account_type);
  useEffect(() => {
    if (!isAdmin) return;
    API.getAdminMfa().then((state) => setMfaStatus(state.status)).catch(() => {});
  }, [isAdmin]);

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

  const startMfa = async () => {
    if (mfaBusy) return;
    setMfaBusy(true);
    setMfaMessage(null);
    try {
      const result = await API.requestAdminMfa();
      setMfaStatus('pending_setup');
      if (result.devCode) setMfaCode(result.devCode);
      setMfaMessage(result.devCode ? `Development code: ${result.devCode}` : 'A security code was sent to your account email.');
    } catch (error) {
      setMfaMessage(error instanceof Error ? error.message : 'Could not send the security code.');
    } finally {
      setMfaBusy(false);
    }
  };

  const verifyMfa = async () => {
    if (mfaBusy || !mfaCode.trim()) return;
    setMfaBusy(true);
    try {
      const result = await API.verifyAdminMfa(mfaCode.trim());
      await API.saveToken(result.token);
      setMfaStatus(result.status);
      setMfaMessage('Admin security is enabled.');
      await refreshUser();
    } catch (error) {
      setMfaMessage(error instanceof Error ? error.message : 'Could not verify the security code.');
    } finally {
      setMfaBusy(false);
    }
  };

  const deferMfa = async () => {
    if (mfaBusy) return;
    setMfaBusy(true);
    try {
      const result = await API.deferAdminMfa();
      setMfaStatus(result.status);
      setMfaMessage('Admin security setup deferred for 30 days.');
    } catch (error) {
      setMfaMessage(error instanceof Error ? error.message : 'Could not defer admin security.');
    } finally {
      setMfaBusy(false);
    }
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
          <Row label="Name" value={user?.username ?? 'Student'} />
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
              Admin accounts can manage students and institution data, so 2FA is recommended after onboarding. You can defer this, but it will remain visible here.
            </Text>
            <Row
              label="Status"
              value={mfaStatus === 'enabled' ? 'Enabled' : mfaStatus === 'pending_setup' ? 'Code requested' : mfaStatus === 'deferred' ? 'Deferred' : 'Recommended'}
            />
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => void startMfa()}
              style={[styles.linkBtn, { borderColor: colors.borderRole.subtle }]}
            >
              <Text style={[styles.linkBtnText, { color: colors.textRole.primary }, CompassFonts.bodyBold]}>
                {mfaStatus === 'enabled' ? 'Send a new security code' : 'Start 2FA setup'}
              </Text>
            </TouchableOpacity>
            {mfaStatus !== 'enabled' ? (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => void deferMfa()}
                style={[styles.linkBtn, { borderColor: colors.borderRole.subtle }]}
              >
                <Text style={[styles.linkBtnText, { color: colors.textRole.primary }, CompassFonts.bodyBold]}>
                  Remind me later
                </Text>
              </TouchableOpacity>
            ) : null}
            {mfaStatus === 'pending_setup' ? (
              <View style={styles.mfaVerifyBox}>
                <TextInput
                  value={mfaCode}
                  onChangeText={setMfaCode}
                  placeholder="6-digit code"
                  keyboardType="number-pad"
                  maxLength={6}
                  style={[styles.mfaInput, { color: colors.textRole.primary, borderColor: colors.borderRole.subtle }]}
                />
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => void verifyMfa()}
                  disabled={mfaBusy || mfaCode.trim().length < 6}
                  style={[styles.linkBtn, { borderColor: colors.borderRole.subtle, opacity: mfaBusy || mfaCode.trim().length < 6 ? 0.5 : 1 }]}
                >
                  <Text style={[styles.linkBtnText, { color: colors.textRole.primary }, CompassFonts.bodyBold]}>Verify code</Text>
                </TouchableOpacity>
              </View>
            ) : null}
            {mfaMessage ? <Text style={[styles.cardBody, { color: colors.textRole.secondary }, CompassFonts.body]}>{mfaMessage}</Text> : null}
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
  mfaVerifyBox: { gap: Spacing.sm },
  mfaInput: { borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, fontSize: FontSize.md, letterSpacing: 3 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  modalCard: { width: '100%', maxWidth: 420, borderRadius: Radius.xl, borderWidth: 1, padding: Spacing.xl, gap: Spacing.md },
  modalTitle: { fontSize: FontSize.xl },
  modalActions: { flexDirection: 'row', gap: Spacing.sm },
  legalActions: { flexDirection: 'row', gap: Spacing.sm },
});
