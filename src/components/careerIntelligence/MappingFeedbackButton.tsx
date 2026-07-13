/**
 * MappingFeedbackButton — a compact inline button that opens a feedback prompt
 * for a mapping edge (programme-domain, domain-role, role-skill).
 *
 * Used on detail screens (DomainDetail, RoleDetail, ProgrammeOverview) so
 * experts can flag incorrect mappings, confirm correct ones, or leave suggestions.
 *
 * On press it shows a simple action sheet (or Alert on mobile) with the four
 * feedback types, then submits via careerData.submitFeedback().
 */
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useTheme, Spacing, Radius, FontSize, Brand, FontWeight } from "../../theme";
import { careerData } from "../../lib/careerData";
import type { FeedbackType } from "../../types/career";

export interface MappingFeedbackButtonProps {
  edgeType: string; // "programme_domain" | "domain_role" | "role_skill"
  sourceId: string;
  sourceLabel: string;
  targetId: string;
  targetLabel: string;
  /** Optional compact variant for inline use. */
  compact?: boolean;
  onSubmitted?: () => void;
}

const FEEDBACK_OPTIONS: { value: FeedbackType; label: string; icon: string }[] = [
  { value: "correct", label: "Correct mapping", icon: "✅" },
  { value: "incorrect", label: "Incorrect mapping", icon: "❌" },
  { value: "unsure", label: "Not sure", icon: "🤔" },
  { value: "suggestion", label: "Suggestion", icon: "💡" },
];

export function MappingFeedbackButton({
  edgeType,
  sourceId,
  sourceLabel,
  targetId,
  targetLabel,
  compact,
  onSubmitted,
}: MappingFeedbackButtonProps) {
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState<FeedbackType | null>(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedType) return;
    setSubmitting(true);
    try {
      const result = await careerData.submitFeedback(
        edgeType,
        sourceId,
        targetId,
        selectedType,
        notes.trim() || undefined,
      );
      if (result.status === "real" || result.status === "coming_soon") {
        // Optimistically treat as success even with coming_soon (stub phase)
        setModalVisible(false);
        setSelectedType(null);
        setNotes("");
        if (onSubmitted) onSubmitted();
      }
    } catch {
      Alert.alert("Error", "Failed to submit feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
        style={[
          compact ? styles.compactBtn : styles.btn,
          { backgroundColor: Brand.primary, borderColor: Brand.primary },
        ]}
      >
        <Text style={[styles.btnIcon, compact ? { fontSize: 12 } : undefined]}>
          {compact ? "✏️" : "📝"}
        </Text>
        <Text
          style={[
            compact ? styles.compactBtnLabel : styles.btnLabel,
            { color: "#fff" },
          ]}
        >
          {compact ? "Feedback" : "Submit mapping feedback"}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalOverlay}
        >
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Mapping feedback
            </Text>
            <Text style={[styles.modalSubtitle, { color: colors.textSoft }]}>
              {sourceLabel} → {targetLabel}
            </Text>

            <Text style={[styles.modalLabel, { color: colors.text }]}>
              What kind of feedback is this?
            </Text>
            <View style={styles.options}>
              {FEEDBACK_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => setSelectedType(opt.value)}
                  activeOpacity={0.8}
                  style={[
                    styles.option,
                    {
                      backgroundColor:
                        selectedType === opt.value ? Brand.primaryLight ?? Brand.primary : colors.bgSecondary,
                      borderColor:
                        selectedType === opt.value ? Brand.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={styles.optionIcon}>{opt.icon}</Text>
                  <Text
                    style={[
                      styles.optionLabel,
                      {
                        color:
                          selectedType === opt.value ? "#fff" : colors.text,
                      },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.modalLabel, { color: colors.text }]}>
              Notes (optional)
            </Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Add any notes about this mapping…"
              placeholderTextColor={colors.textMuted}
              multiline
              style={[
                styles.input,
                { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text },
              ]}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={[
                  styles.actionBtn,
                  { borderColor: colors.border },
                ]}
              >
                <Text style={[styles.actionBtnLabel, { color: colors.textSoft }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={!selectedType || submitting}
                style={[
                  styles.actionBtn,
                  {
                    backgroundColor: selectedType ? Brand.primary : colors.border,
                    borderColor: selectedType ? Brand.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.actionBtnLabel,
                    { color: selectedType ? "#fff" : colors.textMuted },
                  ]}
                >
                  {submitting ? "Submitting…" : "Submit"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

export default MappingFeedbackButton;

const styles = StyleSheet.create({
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    borderWidth: 1.5,
    borderRadius: Radius.lg,
    paddingVertical: 12,
    paddingHorizontal: Spacing.lg,
  },
  btnIcon: { fontSize: 16 },
  btnLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  compactBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingVertical: 5,
    paddingHorizontal: Spacing.sm,
  },
  compactBtnLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: Spacing.lg,
  },
  modalContent: {
    width: "100%",
    maxWidth: 420,
    borderWidth: 1,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  modalTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.black,
  },
  modalSubtitle: {
    fontSize: FontSize.sm,
    marginTop: -Spacing.xs,
    fontWeight: FontWeight.medium,
  },
  modalLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    marginTop: Spacing.xs,
  },
  options: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1.5,
    borderRadius: Radius.full,
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
  },
  optionIcon: { fontSize: 13 },
  optionLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  input: {
    borderWidth: 1.5,
    borderRadius: Radius.md,
    padding: Spacing.md,
    fontSize: FontSize.sm,
    minHeight: 80,
    textAlignVertical: "top",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  actionBtn: {
    borderWidth: 1.5,
    borderRadius: Radius.md,
    paddingVertical: 10,
    paddingHorizontal: Spacing.lg,
  },
  actionBtnLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
});