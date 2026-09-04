import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { CompassFonts, FontSize, FontWeight, Radius, Spacing, useTheme, type ColorPalette } from "../../theme";

/**
 * The Explore guide is deliberately a product-level help surface. A small
 * inline tooltip can define one word, but it cannot explain the route, the
 * guest boundary, and the meaning of the priority labels together.
 */
export function ExploreGuide({ isGuest }: { isGuest: boolean }) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="How Sifter works"
        style={[styles.trigger, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}
      >
        <Feather name="help-circle" size={16} color={colors.accentRole.action} />
        <Text style={[styles.triggerText, { color: colors.textRole.primary }]}>How Sifter works</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={[styles.backdrop, { backgroundColor: colors.overlay }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} accessibilityLabel="Close help" />
          <View style={[styles.sheet, { backgroundColor: colors.surface.base, borderColor: colors.borderRole.subtle }]}>
            <View style={styles.header}>
              <View style={styles.headerCopy}>
                <Text style={[styles.eyebrow, { color: colors.textRole.muted }]}>EXPLORE GUIDE</Text>
                <Text style={[styles.title, { color: colors.textRole.primary }]}>How Sifter works</Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setOpen(false)}
                accessibilityRole="button"
                accessibilityLabel="Close Explore guide"
                style={[styles.close, { backgroundColor: colors.surface.subtle }]}
              >
                <Feather name="x" size={18} color={colors.textRole.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
              <GuideSection colors={colors} number="01" title="Start anywhere">
                Search or browse a programme, university, domain, subgroup, role, skill, tool, certification, or opportunity. Sifter keeps the result in its correct context instead of mixing unrelated matches together.
              </GuideSection>
              <GuideSection colors={colors} number="02" title="Follow the route">
                A programme explains what you study. A domain shows the wider professional world. A subgroup narrows that world, and a role explains the work. When a subgroup is not supported, the route goes directly from the domain to the role.
              </GuideSection>
              <GuideSection colors={colors} number="03" title="Read the priorities">
                Start with the capabilities marked as essential or foundational. Optional items remain available under “See all” so you can understand the full picture without treating everything as a first-step checklist.
              </GuideSection>
              <GuideSection colors={colors} number="04" title="Understand the connections">
                Direct means your programme knowledge closely relates to the domain. Functional means it can be applied there with additional preparation. Adjacent means it is a possible pivot that needs a bridge.
              </GuideSection>
              <View style={[styles.accountNote, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}>
                <Feather name={isGuest ? "lock" : "bookmark"} size={16} color={colors.accentRole.action} />
                <Text style={[styles.accountText, { color: colors.textRole.secondary }]}>
                  {isGuest
                    ? "You are viewing a guest preview. Create an account to see the full catalogue, start personalized guidance, save your direction, and resume later."
                    : "Your account lets you save direction, resume guidance, keep notes, and receive relevant updates when those services are live."}
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

function GuideSection({ colors, number, title, children }: { colors: ColorPalette; number: string; title: string; children: string }) {
  return (
    <View style={styles.section}>
      <Text style={[styles.number, { color: colors.accentRole.action }]}>{number}</Text>
      <View style={styles.sectionCopy}>
        <Text style={[styles.sectionTitle, { color: colors.textRole.primary }]}>{title}</Text>
        <Text style={[styles.body, { color: colors.textRole.secondary }]}>{children}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    minHeight: 42,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
  },
  triggerText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  backdrop: { flex: 1, justifyContent: "center", alignItems: "center", padding: Spacing.lg },
  sheet: { width: "100%", maxWidth: 640, maxHeight: "88%", borderWidth: 1, borderRadius: Radius.xl, overflow: "hidden" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: Spacing.lg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "rgba(128,128,128,0.22)" },
  headerCopy: { gap: Spacing.xs },
  eyebrow: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, letterSpacing: 1 },
  title: { fontSize: FontSize.xl, ...CompassFonts.displayBold },
  close: { width: 42, height: 42, borderRadius: Radius.full, alignItems: "center", justifyContent: "center" },
  content: { padding: Spacing.lg, gap: Spacing.lg },
  section: { flexDirection: "row", gap: Spacing.md },
  number: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, minWidth: 24 },
  sectionCopy: { flex: 1, gap: Spacing.xs },
  sectionTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  body: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.55 },
  accountNote: { flexDirection: "row", gap: Spacing.sm, borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md },
  accountText: { flex: 1, fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
});

export default ExploreGuide;
