import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, Spacing, Radius, FontSize, Shadow, webContainer } from '../theme';

const SECTIONS = [
  {
    title: 'What data we collect',
    body: 'Account details, learning progress, streaks, earned artifacts, and device information needed for sync and notifications.',
  },
  {
    title: 'What we do not collect',
    body: 'Your diary content stays encrypted on-device. We do not store third-party passwords, and we do not track your geographic location.',
  },
  {
    title: 'How we use data',
    body: 'We use it to run the platform, restore progress, send opted-in notifications, power referrals and rewards, and prevent abuse.',
  },
  {
    title: 'Connected platforms',
    body: 'Where you connect external accounts, we store the access token needed for the action you approved. Revoked tokens are removed from our systems.',
  },
  {
    title: 'Your rights',
    body: 'You can request access, correction, deletion, export, or opt-out of non-essential communications by contacting privacy@sifter.app.',
  },
];

interface Props { onClose?: () => void; }

export default function PrivacyScreen({ onClose }: Props) {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.eyebrow, { color: colors.textMuted }]}>LEGAL</Text>
          <Text style={[styles.title, { color: colors.text }]}>Privacy policy</Text>
          <Text style={[styles.sub, { color: colors.textSoft }]}>NDPR-aware, with GDPR-style user rights support.</Text>
        </View>
        {onClose ? (
          <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { borderColor: colors.border, backgroundColor: colors.bgSecondary }]}>
            <Text style={[styles.closeText, { color: colors.textSoft }]}>Close</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={[styles.note, { backgroundColor: colors.greenSoft, borderLeftColor: colors.green }]}>
          <Text style={[styles.noteText, { color: colors.text }]}>
            Short version: your diary stays local, we do not sell your data, and you can ask us to delete your account data.
          </Text>
        </View>

        {SECTIONS.map((section) => (
          <View key={section.title} style={[styles.section, Shadow.sm, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
            <Text style={[styles.sectionBody, { color: colors.textSoft }]}>{section.body}</Text>
          </View>
        ))}

        <View style={[styles.section, Shadow.sm, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact</Text>
          <Text style={[styles.sectionBody, { color: colors.textSoft }]}>
            Privacy concerns: privacy@sifter.app{'\n'}
            Data deletion requests: privacy@sifter.app{'\n'}
            Legal and compliance: legal@sifter.app
          </Text>
        </View>

        <TouchableOpacity style={[styles.emailBtn, { backgroundColor: colors.text }]} onPress={() => Linking.openURL('mailto:privacy@sifter.app')}>
          <Text style={styles.emailBtnText}>Email privacy@sifter.app</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderBottomWidth: 1,
  },
  eyebrow: {
    fontSize: FontSize.xs,
    fontWeight: '800',
    letterSpacing: 1,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '800',
  },
  sub: {
    fontSize: FontSize.xs,
    marginTop: 4,
  },
  closeBtn: {
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
  },
  closeText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  body: {
    ...webContainer,
    paddingBottom: Spacing.xxxl,
  },
  note: {
    borderRadius: Radius.lg,
    borderLeftWidth: 3,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  noteText: {
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  section: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: '800',
    marginBottom: 6,
  },
  sectionBody: {
    fontSize: FontSize.xs,
    lineHeight: 18,
  },
  emailBtn: {
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  emailBtnText: {
    color: '#fff',
    fontSize: FontSize.sm,
    fontWeight: '800',
  },
});
