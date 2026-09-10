import React, { useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, CompassFonts, Spacing, Radius, FontSize, Shadow, webContainer } from '@/theme';
import { useResponsive } from "@/hooks/useResponsive";
import { TERMS_VERSION } from "@/lib/legal";
import { TERMS_SECTIONS } from "@/lib/legalContent";

const SECTIONS = TERMS_SECTIONS;

interface Props {
  onClose?: () => void;
  onReadToEnd?: () => void;
  requireExplicitConfirmation?: boolean;
  confirmLabel?: string;
}

export default function TermsScreen({
  onClose,
  onReadToEnd,
  requireExplicitConfirmation = false,
  confirmLabel = 'I have read the Terms & Conditions',
}: Props) {
  const { colors } = useTheme();
  const resp = useResponsive();
  const isDesktop = resp.isDesktop && resp.isWeb;

  const sectionY = useRef<Record<string, number>>({});
  const [activeSection, setActiveSection] = useState('0');
  const [readToEnd, setReadToEnd] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const handleScroll = useCallback((event: any) => {
    if (readToEnd) return;
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 32) {
      setReadToEnd(true);
      if (!requireExplicitConfirmation) onReadToEnd?.();
    }
  }, [onReadToEnd, readToEnd, requireExplicitConfirmation]);

  const confirmRead = useCallback(() => {
    if (!readToEnd) return;
    setConfirmed(true);
    onReadToEnd?.();
  }, [onReadToEnd, readToEnd]);

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
      {requireExplicitConfirmation && readToEnd && !confirmed ? (
        <TouchableOpacity
          style={[styles.confirmBtn, { backgroundColor: colors.accentRole.action }]}
          onPress={confirmRead}
          accessibilityRole="button"
        >
          <Text style={[styles.confirmBtnText, CompassFonts.bodyBold]}>{confirmLabel}</Text>
        </TouchableOpacity>
      ) : null}
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
            onScroll={handleScroll}
            contentContainerStyle={styles.body}
          >
            {content}
          </ScrollView>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false} scrollEventThrottle={16} onScroll={handleScroll}>
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
  confirmBtn: {
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  confirmBtnText: {
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
