import React, { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { CompassFonts, FontSize, Radius, Spacing, useTheme } from "@/theme";
import {
  buildLearningPlanShareCopies,
  type LearningPlanShareCopy,
  type LearningPlanSharePlatform,
  type LearningPlanShareInput,
} from "@/lib/learningPlanShare";

const PLATFORMS: Array<{ id: LearningPlanSharePlatform; label: string; note: string }> = [
  { id: "whatsapp", label: "WhatsApp", note: "A short, forwardable message." },
  { id: "facebook", label: "Facebook", note: "A little more context for your post." },
  { id: "x", label: "X", note: "A concise post for X." },
  { id: "instagram", label: "Instagram", note: "A caption with relevant hashtags." },
  { id: "tiktok", label: "TikTok", note: "A short caption with study and career tags." },
  { id: "email", label: "Email", note: "A subject and message suited to email." },
];

export function LearningPlanShareSheet({
  visible,
  input,
  onClose,
  onShare,
  onCopy,
}: {
  visible: boolean;
  input: LearningPlanShareInput;
  onClose: () => void;
  onShare: (copy: LearningPlanShareCopy) => void;
  onCopy: (copy: LearningPlanShareCopy) => void;
}) {
  const { colors } = useTheme();
  const [platform, setPlatform] = useState<LearningPlanSharePlatform>("whatsapp");
  const copies = useMemo(() => buildLearningPlanShareCopies(input), [input]);
  const selected = copies[platform];
  const selectedDetails = PLATFORMS.find((entry) => entry.id === platform)!;

  useEffect(() => {
    if (visible) setPlatform("whatsapp");
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          accessibilityViewIsModal
          style={[styles.sheet, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}
          onPress={(event) => event.stopPropagation()}
        >
          <View style={styles.header}>
            <View style={styles.titleBlock}>
              <Text style={[styles.eyebrow, { color: colors.textRole.muted }]}>Share your learning plan</Text>
              <Text style={[styles.title, { color: colors.textRole.primary }, CompassFonts.displaySemi]}>Choose where to share</Text>
            </View>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Close share options" onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={20} color={colors.textRole.muted} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.intro, { color: colors.textRole.secondary }]}>
            Preview a message written for each platform. Sharing includes only your route and chosen learning focus—not your name, school or private notes.
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.platforms}>
            {PLATFORMS.map((entry) => (
              <TouchableOpacity
                key={entry.id}
                accessibilityRole="button"
                accessibilityState={{ selected: platform === entry.id }}
                onPress={() => setPlatform(entry.id)}
                style={[styles.platformButton, {
                  borderColor: platform === entry.id ? colors.accentRole.action : colors.borderRole.subtle,
                  backgroundColor: platform === entry.id ? colors.surface.subtle : colors.surface.raised,
                }]}
              >
                <Text style={[styles.platformText, { color: colors.textRole.primary }]}>{entry.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={[styles.note, { color: colors.textRole.muted }]}>{selectedDetails.note}</Text>
          <ScrollView style={[styles.preview, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
            <Text selectable style={[styles.previewText, { color: colors.textRole.primary }]}>{selected.message}</Text>
          </ScrollView>
          <Text style={[styles.disclaimer, { color: colors.textRole.muted }]}>
            Your device will offer available sharing options. Instagram and TikTok may require you to paste the caption into the app before posting.
          </Text>
          <View style={styles.actions}>
            <TouchableOpacity accessibilityRole="button" onPress={() => onCopy(selected)} style={[styles.secondaryAction, { borderColor: colors.borderRole.subtle }]}>
              <Feather name="copy" size={15} color={colors.accentRole.action} />
              <Text style={[styles.secondaryText, { color: colors.accentRole.action }]}>Copy message</Text>
            </TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" onPress={() => onShare(selected)} style={[styles.primaryAction, { backgroundColor: colors.accentRole.action }]}>
              <Feather name="share-2" size={15} color="#fff" />
              <Text style={styles.primaryText}>Continue to share</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.42)" },
  sheet: { maxHeight: "92%", borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, borderWidth: 1, padding: Spacing.lg, gap: Spacing.md },
  header: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.md },
  titleBlock: { flex: 1, gap: 4 },
  eyebrow: { fontSize: FontSize.xs, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.7 },
  title: { fontSize: FontSize.lg },
  closeButton: { minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" },
  intro: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.45 },
  platforms: { gap: Spacing.xs, paddingVertical: 2 },
  platformButton: { minHeight: 42, borderWidth: 1, borderRadius: Radius.full, alignItems: "center", justifyContent: "center", paddingHorizontal: Spacing.md },
  platformText: { fontSize: FontSize.sm, fontWeight: "700" },
  note: { fontSize: FontSize.xs },
  preview: { maxHeight: 190, borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md },
  previewText: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
  disclaimer: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.45 },
  actions: { flexDirection: "row", gap: Spacing.sm },
  secondaryAction: { flex: 1, minHeight: 46, borderWidth: 1, borderRadius: Radius.md, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.xs },
  secondaryText: { fontSize: FontSize.sm, fontWeight: "800" },
  primaryAction: { flex: 1.3, minHeight: 46, borderRadius: Radius.md, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.xs },
  primaryText: { color: "#fff", fontSize: FontSize.sm, fontWeight: "800" },
});
