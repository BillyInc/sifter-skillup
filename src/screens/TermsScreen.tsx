import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, Spacing, Radius, FontSize, Shadow, webContainer } from '../theme';

const SECTIONS = [
  ['Who we are', 'Sifter LevelUp is a career-intelligence and education platform operated for students, educators, schools, tutorial centres and institutions.'],
  ['What the platform does', 'We help users explore starting points, subjects, programmes, schools, domains, sub-groups, roles, skills, tools, certifications and market-intelligence signals.'],
  ['Guidance, not a guarantee', 'Programme mappings, cut-off marks, role readiness, demand, salary and remote-work signals are guidance. They are not admission, employment, salary, migration, legal, financial or professional advice.'],
  ['Admissions and school data', 'Cut-off marks, school requirements and formulas are historical or indicative unless clearly marked otherwise. We do not guarantee admission, eligibility, scholarship access or school placement.'],
  ['Jobs and market intelligence', 'Posting counts, salary ranges, employer lists and trend labels are estimates from available sources. Low-volume/high-value roles may be selective; high-volume roles may still have lower pay or progression limits.'],
  ['Students and minors', 'Senior-secondary students and other minors should use LevelUp with guidance from a parent, guardian, school or counsellor. Individual student visibility for institutions requires consent where applicable.'],
  ['Educators and institutions', 'Institution dashboards use aggregate intelligence. Verification does not by itself unlock individual student details. Student records, rosters and provisioning remain consent-gated.'],
  ['Guest use', 'Guests may browse limited Explore surfaces. Saving, notes, alerts, student management and institution-specific features require an account and, where relevant, acceptance of these terms.'],
  ['Acceptable use', 'Do not abuse the service, attack the platform, scrape restricted data, impersonate a school or educator, upload unlawful content, or use the platform to mislead students.'],
  ['Your content', 'You keep ownership of notes, saved paths, feedback and any learning artifacts you create. You give us permission to store, process and display them only to operate the service.'],
  ['Third-party services', 'Some sources, schools, job boards, professional bodies, APIs and linked services have their own terms. Their data, availability and rules may change without notice.'],
  ['Changes and suspension', 'We may change features, correct data, remove misleading content, suspend abusive accounts or restrict access where needed for security, compliance or platform integrity.'],
  ['Governing law', 'These terms are governed by the laws of the Federal Republic of Nigeria, except where mandatory consumer protections in another jurisdiction apply.'],
];

interface Props { onClose?: () => void; }

export default function TermsScreen({ onClose }: Props) {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.eyebrow, { color: colors.textMuted }]}>LEGAL</Text>
          <Text style={[styles.title, { color: colors.text }]}>Terms of service</Text>
          <Text style={[styles.sub, { color: colors.textSoft }]}>Plain-language overview of the platform rules.</Text>
        </View>
        {onClose ? (
          <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { borderColor: colors.border, backgroundColor: colors.bgSecondary }]}>
            <Text style={[styles.closeText, { color: colors.textSoft }]}>Close</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={[styles.note, { backgroundColor: colors.goldSoft, borderLeftColor: colors.gold }]}>
          <Text style={[styles.noteText, { color: colors.text }]}>
            This is plain-language product copy, not legal advice. Account
            creation requires accepting the current version of these terms and
            the Privacy Policy.
          </Text>
        </View>

        {SECTIONS.map(([title, body], index) => (
          <View key={title} style={[styles.section, Shadow.sm, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionNum, { color: colors.accent }]}>{index + 1}.</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
              <Text style={[styles.sectionBody, { color: colors.textSoft }]}>{body}</Text>
            </View>
          </View>
        ))}

        <TouchableOpacity style={[styles.emailBtn, { backgroundColor: colors.text }]} onPress={() => Linking.openURL('mailto:legal@sifter.app')}>
          <Text style={styles.emailBtnText}>Email legal@sifter.app</Text>
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
    flexDirection: 'row',
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sectionNum: {
    width: 24,
    fontSize: FontSize.sm,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: '800',
    marginBottom: 4,
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
