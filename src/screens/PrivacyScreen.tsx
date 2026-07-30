import React, { useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, CompassFonts, Spacing, Radius, FontSize, Shadow, webContainer } from '@/theme';
import { useResponsive } from '@/hooks/useResponsive';

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
  const resp = useResponsive();

  // ── Section positions for nav scrolling ──────────────────────
  const sectionY = useRef<Record<string, number>>({});
  const [activeSection, setActiveSection] = useState(SECTIONS[0].title);
  const scrollRef = useRef<ScrollView>(null);

  const onSectionLayout = useCallback((key: string, y: number) => {
    if (sectionY.current[key] === undefined) {
      sectionY.current[key] = y;
    }
  }, []);

  const scrollTo = useCallback((key: string) => {
    const y = sectionY.current[key];
    if (y !== undefined) {
      scrollRef.current?.scrollTo({ y: Math.max(0, y - 20), animated: true });
    }
    setActiveSection(key);
  }, []);

  const isDesktop = resp.isDesktop && resp.isWeb;

  const header = (
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
  );

  const content = (
    <>
      <View style={[styles.note, { backgroundColor: `${colors.accentRole.success}14`, borderLeftColor: colors.accentRole.success }]}>
        <Text style={[styles.noteText, { color: colors.textRole.primary }, CompassFonts.body]}>
          Short version: we do not sell personal data, we minimise sensitive
          student data, and you can ask to access, correct, export or delete
          your account data.
        </Text>
      </View>

      {SECTIONS.map((section) => (
        <View
          key={section.title}
          onLayout={(e) => onSectionLayout(section.title, e.nativeEvent.layout.y)}
          style={[styles.section, Shadow.sm, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}
        >
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
    </>
  );

  // ── Desktop layout: section nav on left, content on right ───
  if (isDesktop) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.surface.base }]}>
        {header}
        <View style={styles.desktopRow}>
          <View style={styles.navColumn}>
            <View style={[styles.navSticky, { borderColor: colors.borderRole.subtle, position: "sticky" as any, top: 0 }]}>
              <Text style={[styles.navTitle, { color: colors.textRole.muted }, CompassFonts.bodySemibold]}>
                On this page
              </Text>
              {SECTIONS.map((s) => (
                <TouchableOpacity
                  key={s.title}
                  onPress={() => scrollTo(s.title)}
                  style={[
                    styles.navItem,
                    activeSection === s.title && { backgroundColor: colors.surface.subtle },
                  ]}
                  activeOpacity={0.6}
                >
                  <View
                    style={[
                      styles.navDot,
                      {
                        backgroundColor:
                          activeSection === s.title ? colors.accentRole.action : colors.borderRole.subtle,
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.navLabel,
                      { color: activeSection === s.title ? colors.textRole.primary : colors.textRole.secondary },
                      CompassFonts.bodyMedium,
                    ]}
                    numberOfLines={1}
                  >
                    {s.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <ScrollView
            ref={scrollRef}
            style={styles.mainScroll}
            contentContainerStyle={styles.body}
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
          >
            {content}
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  // ── Mobile / tablet: single column ───────────────────────────
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.surface.base }]}>
      {header}
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {content}
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
  },
  title: {
    fontSize: FontSize.lg,
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
  },
  // ── Desktop layout ────────────────────────────────────────
  desktopRow: {
    flex: 1,
    flexDirection: 'row',
    gap: Spacing.xxl,
  },
  navColumn: {
    width: 180,
    flexShrink: 0,
  },
  navSticky: {
    borderRightWidth: StyleSheet.hairlineWidth,
    paddingRight: Spacing.lg,
    gap: Spacing.xs,
  },
  navTitle: {
    fontSize: FontSize.xs,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
  },
  navDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  navLabel: {
    fontSize: FontSize.sm,
  },
  mainScroll: {
    flex: 1,
  },
});
