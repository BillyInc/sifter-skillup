import React, { useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, CompassFonts, Spacing, Radius, FontSize, Shadow, webContainer } from '@/theme';
import { useResponsive } from "@/hooks/useResponsive";
import { TERMS_VERSION } from "@/lib/legal";

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
  ['Privacy, consent and Nigerian safeguards', 'We apply the Nigeria Data Protection Act 2023 and applicable NDPC guidance to personal-data handling. Consent must be a clear affirmative choice; silence is not consent, and you can withdraw consent where processing is based on consent. Optional analytics is off unless you opt in. We do not sell personal data.'],
  ['Children, students and school roles', 'Under-18 users should use the service with a parent, guardian, school or counsellor where appropriate. Student records, grades, guardian information and school rosters are role-limited and consent-gated where required. School owners and staff must only upload or view information they are authorised to handle under applicable Nigerian and state child-protection rules.'],
  ['Consumer fairness and complaints', 'Nothing here removes a non-waivable right under applicable consumer-protection law. We will not intentionally present guidance as a guarantee or hide material limitations. Report a concern to legal@sifter.app; privacy complaints may also be directed to the Nigeria Data Protection Commission and consumer complaints to the Federal Competition and Consumer Protection Commission where applicable.'],
  ['Automated guidance and challenge', 'Search ranking, programme matching and career guidance are decision-support features, not admission or employment decisions. They may be incomplete or wrong. You can ask us to explain, correct or review material personal-data issues through privacy@sifter.app.'],
  ['Third-party services', 'Some sources, schools, job boards, professional bodies, APIs and linked services have their own terms. Their data, availability and rules may change without notice.'],
  ['Changes and suspension', 'We may change features, correct data, remove misleading content, suspend abusive accounts or restrict access where needed for security, compliance or platform integrity.'],
  ['Governing law', 'These terms are governed by the laws of the Federal Republic of Nigeria, except where mandatory consumer protections in another jurisdiction apply.'],
];

interface Props { onClose?: () => void; }

export default function TermsScreen({ onClose }: Props) {
  const { colors } = useTheme();
  const resp = useResponsive();
  const isDesktop = resp.isDesktop && resp.isWeb;

  const sectionY = useRef<Record<string, number>>({});
  const [activeSection, setActiveSection] = useState('0');
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

  const content = (
    <>
      <View style={[styles.note, { backgroundColor: `${colors.accentRole.status}14`, borderLeftColor: colors.accentRole.status }]}>
        <Text style={[styles.noteText, { color: colors.textRole.primary }, CompassFonts.body]}>
          Version {TERMS_VERSION}. This is plain-language product copy, not legal advice. Account
          creation requires accepting the current version of these terms and
          the Privacy Policy.
        </Text>
      </View>

      {SECTIONS.map(([title, body], index) => (
        <View
          key={title}
          style={[styles.section, Shadow.sm, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}
          onLayout={(e) => onSectionLayout(String(index), e.nativeEvent.layout.y)}
        >
          <Text style={[styles.sectionNum, { color: colors.accentRole.action }, CompassFonts.bodyBold]}>{index + 1}.</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.sectionTitle, { color: colors.textRole.primary }, CompassFonts.bodyBold]}>{title}</Text>
            <Text style={[styles.sectionBody, { color: colors.textRole.secondary }, CompassFonts.body]}>{body}</Text>
          </View>
        </View>
      ))}

      <TouchableOpacity style={[styles.emailBtn, { backgroundColor: colors.textRole.primary }]} onPress={() => Linking.openURL('mailto:legal@sifter.app')}>
        <Text style={[styles.emailBtnText, CompassFonts.bodyBold]}>Email legal@sifter.app</Text>
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.surface.base }]}>
      <View style={[styles.header, { backgroundColor: colors.surface.raised, borderBottomColor: colors.borderRole.subtle }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.eyebrow, { color: colors.textRole.muted }, CompassFonts.bodyMedium]}>LEGAL</Text>
          <Text style={[styles.title, { color: colors.textRole.primary }, CompassFonts.displayBold]}>Terms of service</Text>
          <Text style={[styles.sub, { color: colors.textRole.secondary }, CompassFonts.body]}>Plain-language overview of the platform rules.</Text>
        </View>
        {onClose ? (
          <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
            <Text style={[styles.closeText, { color: colors.textRole.secondary }, CompassFonts.bodyBold]}>Close</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {isDesktop ? (
        <View style={styles.desktopRow}>
          <View style={styles.navColumn}>
            <View style={[styles.navSticky, { borderColor: colors.borderRole.subtle, position: "sticky" as any, top: 0 }]}>
              <Text style={[styles.navTitle, { color: colors.textRole.muted }, CompassFonts.bodySemibold]}>
                On this page
              </Text>
              {SECTIONS.map(([title], index) => (
                <TouchableOpacity
                  key={title}
                  onPress={() => scrollTo(String(index))}
                  style={[
                    styles.navItem,
                    activeSection === String(index) && { backgroundColor: colors.surface.subtle },
                  ]}
                  activeOpacity={0.6}
                >
                  <View
                    style={[
                      styles.navDot,
                      {
                        backgroundColor:
                          activeSection === String(index) ? colors.accentRole.action : colors.borderRole.subtle,
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.navLabel,
                      { color: activeSection === String(index) ? colors.textRole.primary : colors.textRole.secondary },
                      CompassFonts.bodyMedium,
                    ]}
                    numberOfLines={1}
                  >
                    {title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <ScrollView
            ref={scrollRef}
            style={styles.mainScroll}
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            contentContainerStyle={styles.body}
          >
            {content}
          </ScrollView>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          {content}
        </ScrollView>
      )}
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
  },
  sectionTitle: {
    fontSize: FontSize.sm,
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
  },
  // Desktop layout
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
