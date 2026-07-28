import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, CompassFonts, Spacing, Radius, FontSize, Shadow, webContainer } from '@/theme';

const SECTIONS = [
  {
    title: 'What data we collect',
    body: 'Account details, user type, starting point, subjects you choose to enter, saved programmes, schools, domains, subgroups, roles, notes, preferences, device/session data and security logs.',
  },
  {
    title: 'Sensitive student data',
    body: 'We do not need grades, transcripts, exam documents or guardian documents for the core exploration flow. Institution roster visibility is consent-gated and should be limited to what is necessary.',
  },
  {
    title: 'How we use data',
    body: 'We use data to run the platform, restore sessions, personalize guidance, improve search, prevent abuse, support institution verification, generate aggregate intelligence and honour user requests.',
  },
  {
    title: 'Analytics and product improvement',
    body: 'We may use consented or legally-permitted analytics to understand searches, drop-offs, saved paths and confusing screens. Analytics should be aggregated where possible and should not expose individual student records to institutions.',
  },
  {
    title: 'Nigeria-first privacy basis',
    body: 'We design around Nigeria privacy obligations including the NDPA 2023 and NDPR principles: lawful basis, purpose limitation, data minimisation, security, retention limits and data-subject rights.',
  },
  {
    title: 'Minors and guardians',
    body: 'Senior-secondary users may be minors. Where a feature requires guardian or school consent, we will gate that feature and avoid unnecessary exposure of individual student details.',
  },
  {
    title: 'International users',
    body: 'Users outside Nigeria may have additional local rights, including GDPR-style access, correction, portability, objection and erasure rights where applicable.',
  },
  {
    title: 'Retention',
    body: 'We keep account and guidance data only as long as needed for the service, safety, legal compliance and auditability. Users may request deletion, subject to lawful retention requirements.',
  },
  {
    title: 'Security',
    body: 'We use access controls, authentication, role boundaries and server-side checks to reduce unauthorised access. No web service can guarantee perfect security, so sensitive details should be collected sparingly.',
  },
  {
    title: 'Your rights and choices',
    body: 'You can request access, correction, deletion, export, restriction or opt-out of non-essential communications and analytics by contacting privacy@sifter.app.',
  },
];

interface Props { onClose?: () => void; }

export default function PrivacyScreen({ onClose }: Props) {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.surface.base }]}>
      <View style={[styles.header, { backgroundColor: colors.surface.raised, borderBottomColor: colors.borderRole.subtle }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.eyebrow, { color: colors.textRole.muted }, CompassFonts.bodyMedium]}>LEGAL</Text>
          <Text style={[styles.title, { color: colors.textRole.primary }, CompassFonts.displayBold]}>Privacy policy</Text>
          <Text style={[styles.sub, { color: colors.textRole.secondary }, CompassFonts.body]}>Nigeria-first privacy with global user-rights support.</Text>
        </View>
        {onClose ? (
          <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
            <Text style={[styles.closeText, { color: colors.textRole.secondary }, CompassFonts.bodyBold]}>Close</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={[styles.note, { backgroundColor: `${colors.accentRole.success}14`, borderLeftColor: colors.accentRole.success }]}>
          <Text style={[styles.noteText, { color: colors.textRole.primary }, CompassFonts.body]}>
            Short version: we do not sell personal data, we minimise sensitive
            student data, and you can ask to access, correct, export or delete
            your account data.
          </Text>
        </View>

        {SECTIONS.map((section) => (
          <View key={section.title} style={[styles.section, Shadow.sm, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
            <Text style={[styles.sectionTitle, { color: colors.textRole.primary }, CompassFonts.bodyBold]}>{section.title}</Text>
            <Text style={[styles.sectionBody, { color: colors.textRole.secondary }, CompassFonts.body]}>{section.body}</Text>
          </View>
        ))}

        <View style={[styles.section, Shadow.sm, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
          <Text style={[styles.sectionTitle, { color: colors.textRole.primary }, CompassFonts.bodyBold]}>Contact</Text>
          <Text style={[styles.sectionBody, { color: colors.textRole.secondary }, CompassFonts.body]}>
            Privacy concerns: privacy@sifter.app{'\n'}
            Data deletion requests: privacy@sifter.app{'\n'}
            Legal and compliance: legal@sifter.app
          </Text>
        </View>

        <TouchableOpacity style={[styles.emailBtn, { backgroundColor: colors.textRole.primary }]} onPress={() => Linking.openURL('mailto:privacy@sifter.app')}>
          <Text style={[styles.emailBtnText, CompassFonts.bodyBold]}>Email privacy@sifter.app</Text>
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
    letterSpacing: 1,
    fontFamily: 'HankenGrotesk_700Bold',
  },
  title: {
    fontSize: FontSize.lg,
    fontFamily: 'HankenGrotesk_700Bold',
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
    fontFamily: 'HankenGrotesk_600SemiBold',
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
    fontFamily: 'HankenGrotesk_700Bold',
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
    fontFamily: 'HankenGrotesk_700Bold',
  },
});
