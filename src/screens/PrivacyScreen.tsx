/**
 * Sifter Skill_Up — Privacy Policy
 * NDPR (Nigeria) compliant + GDPR considerations for EU users.
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Linking } from 'react-native';
import { Colors, Spacing, Radius, FontSize } from '../theme';

const SECTIONS = [
  {
    title: 'What data we collect',
    body: 'Account data: name, email, phone number (optional, for SMS notifications), profile photo (optional).\n\nLearning data: completed levels, XP, streaks, portfolio artifacts, last position in the app.\n\nDevice data: device type and OS (for push notifications), device ID (for multi-device sync).\n\nUsage data: feature interactions and analytics (anonymised).\n\nPayment data: handled entirely by our payment processor. We do not store card details.',
  },
  {
    title: 'What we do NOT collect',
    body: 'Your diary content — it is encrypted on your device and never transmitted to our servers.\n\nYour passwords for any third-party platform — we use OAuth tokens only.\n\nYour location — we do not track or store geographic location.',
  },
  {
    title: 'How we use your data',
    body: 'To provide and improve the learning platform.\nTo restore your progress when you change devices.\nTo send you notifications you\'ve opted into.\nTo process referral rewards.\nTo detect and prevent abuse.\nTo comply with legal obligations.',
  },
  {
    title: 'OAuth tokens (LinkedIn, GitHub, Upwork, etc.)',
    body: 'When you connect a third-party platform, we store only the OAuth access token provided by that platform. We use this token only to perform the specific actions you authorise. You can revoke access at any time from your Sifter connected accounts settings or directly from the third-party platform. Revoked tokens are deleted from our systems within 24 hours.',
  },
  {
    title: 'Data sharing',
    body: 'We do not sell your personal data.\n\nWe share data only with: cloud infrastructure providers (encrypted at rest and in transit), payment processors, push notification services (token only, no content), and legal authorities when required by law.\n\nWe do not share your data with advertisers.',
  },
  {
    title: 'Data retention',
    body: 'Active accounts: we retain your data for as long as your account is active.\n\nDeleted accounts: your personal data is deleted within 30 days of account deletion. Anonymised analytics data may be retained indefinitely.\n\nOAuth tokens: deleted within 24 hours of revocation.',
  },
  {
    title: 'Your rights (NDPR + GDPR)',
    body: 'You have the right to: access your personal data, correct inaccurate data, delete your account and data, export your data, opt out of non-essential communications, and withdraw consent for data processing.\n\nTo exercise any of these rights, email privacy@sifter.app. We will respond within 30 days.',
  },
  {
    title: 'Children',
    body: 'Sifter Skill_Up is not directed at children under 13. We do not knowingly collect data from users under 13. If you believe a child under 13 has created an account, contact privacy@sifter.app immediately.',
  },
  {
    title: 'Security',
    body: 'We encrypt all data in transit (TLS) and at rest. We implement access controls, audit logging, and regular security reviews. Your diary data is encrypted on your device and is never accessible to us.\n\nNo system is perfectly secure. In the event of a data breach, we will notify affected users within 72 hours.',
  },
  {
    title: 'Changes to this policy',
    body: 'We will notify you of material changes via in-app notification and email at least 14 days before they take effect.',
  },
  {
    title: 'Contact',
    body: 'Privacy concerns: privacy@sifter.app\nData deletion requests: privacy@sifter.app\nNDPR compliance officer: legal@sifter.app\n\nSifter Technologies Ltd, Lagos, Nigeria.',
  },
];

interface Props { onClose?: () => void; }

export default function PrivacyScreen({ onClose }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Privacy Policy</Text>
          <Text style={styles.sub}>NDPR compliant · Last updated March 2026</Text>
        </View>
        {onClose && <TouchableOpacity onPress={onClose}><Text style={styles.close}>✕</Text></TouchableOpacity>}
      </View>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.shortNote}>
          <Text style={styles.shortNoteText}>
            🔒 Short version: your diary never leaves your device. We don't sell your data. You can delete everything at any time.
          </Text>
        </View>
        {SECTIONS.map((s, i) => (
          <View key={i} style={styles.section}>
            <Text style={styles.sectionTitle}>{s.title}</Text>
            <Text style={styles.sectionBody}>{s.body}</Text>
          </View>
        ))}
        <TouchableOpacity style={styles.emailBtn} onPress={() => Linking.openURL('mailto:privacy@sifter.app')}>
          <Text style={styles.emailBtnText}>Questions? Email privacy@sifter.app</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: '#fff' },
  title: { fontSize: FontSize.lg, fontWeight: '900', color: Colors.text },
  sub: { fontSize: FontSize.xs, color: Colors.textSoft, marginTop: 2 },
  close: { fontSize: 18, color: Colors.textSoft, padding: Spacing.xs },
  body: { padding: Spacing.lg },
  shortNote: { backgroundColor: Colors.greenSoft, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.lg, borderLeftWidth: 3, borderLeftColor: Colors.green },
  shortNoteText: { fontSize: FontSize.sm, color: Colors.text, lineHeight: 20 },
  section: { backgroundColor: '#fff', borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  sectionTitle: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.text, marginBottom: 6 },
  sectionBody: { fontSize: FontSize.xs, color: Colors.textSoft, lineHeight: 18 },
  emailBtn: { borderWidth: 1, borderColor: Colors.green, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center', marginTop: Spacing.md },
  emailBtnText: { fontSize: FontSize.sm, color: Colors.green, fontWeight: '700' },
});
