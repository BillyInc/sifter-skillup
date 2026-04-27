import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, Spacing, Radius, FontSize, Shadow, webContainer } from '../theme';

const SECTIONS = [
  ['Who we are', 'Sifter Skill_Up is an educational platform operated by Sifter Technologies Ltd.'],
  ['What the platform is', 'We provide learning content, simulations, artifacts, and guided practice. We are not a recruitment, legal, or financial advisory service.'],
  ['No employment guarantee', 'Completing a path or certification does not guarantee interviews, job offers, salary increases, or any specific career outcome.'],
  ['Interview mode', 'Interview Mode is practice based on common patterns. It is not a live feed of employer interview questions.'],
  ['Artifact ownership', 'You own your work. We only host it in-app and push it where you explicitly authorize us to act.'],
  ['Third-party platforms', 'LinkedIn, GitHub, Upwork, and similar services keep their own rules and may change their APIs or policies at any time.'],
  ['Data and privacy', 'Your diary stays local. Your progress is stored so it can sync across devices. We do not sell your personal data.'],
  ['Termination', 'We may restrict access for abuse, fraud, harmful conduct, or serious terms violations.'],
  ['Governing law', 'These terms are governed by the laws of the Federal Republic of Nigeria, except where mandatory consumer protections override that by law.'],
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
            This version is optimized for clarity. If you need legal guidance for your specific use, please consult a qualified lawyer.
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
    fontWeight: '900',
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
    fontWeight: '900',
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
