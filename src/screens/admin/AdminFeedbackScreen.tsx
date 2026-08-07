/**
 * AdminFeedbackScreen — the admin-mode "send feedback" form (§5.6 / PART 6A).
 *
 * Feedback is OUTBOUND ONLY (§6A.1): every account type sends to the Sifter /
 * LevelUp team, and nobody browses anybody else's submissions. There is
 * deliberately no read here — GET /api/feedback is internal-staff-only (§6A.4)
 * and would 403 for an institution admin. The old browsable feedback-inbox
 * screen was removed for exactly that reason.
 *
 * Flagging a specific mapping edge as wrong is a different shape of report, so
 * it routes to the Expert Dossier mapping-flag form (§6A.2) rather than being
 * squeezed into the free-text box here.
 */
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  CompassFonts,
  webContainer,
} from "@/theme";
import { adminData } from "@/lib/adminData";
import { adminNav, type Nav } from "@/lib/adminNav";
import { AdminShell } from "./AdminShell";

/** The eight categories are fixed by the §6A.5 DB CHECK constraint. */
type FeedbackCategory =
  | "mapping_wrong"
  | "data_outdated"
  | "bug"
  | "confusing"
  | "missing_info"
  | "feature_request"
  | "praise"
  | "other";

const CATEGORIES: { key: FeedbackCategory; label: string }[] = [
  { key: "mapping_wrong", label: "A mapping looks wrong (domain, role, or programme)" },
  { key: "data_outdated", label: "A number looks wrong (salary, demand, requirement, cut-off)" },
  { key: "bug", label: "Something's broken (bug, crash, blank screen)" },
  { key: "confusing", label: "Confusing to use" },
  { key: "missing_info", label: "Missing information I was looking for" },
  { key: "feature_request", label: "Feature request" },
  { key: "praise", label: "App rating / general praise" },
  { key: "other", label: "Other" },
];

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent" }
  | { kind: "error"; message: string };

export function AdminFeedbackScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [category, setCategory] = useState<FeedbackCategory | null>(null);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const canSubmit =
    category != null && message.trim().length > 0 && status.kind !== "sending";

  const submit = async () => {
    if (category == null) {
      setStatus({ kind: "error", message: "Pick a category first." });
      return;
    }
    if (message.trim().length === 0) {
      setStatus({ kind: "error", message: "Add a message so we know what to look at." });
      return;
    }
    setStatus({ kind: "sending" });
    const result = await adminData.submitFeedback({
      category,
      message: message.trim(),
    });
    if (result.ok) {
      setStatus({ kind: "sent" });
      setCategory(null);
      setMessage("");
    } else {
      setStatus({
        kind: "error",
        message: result.message ?? "Could not send your feedback. Try again.",
      });
    }
  };

  return (
    <AdminShell title="Send feedback" eyebrow="To the Sifter team">
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.bg }}
        contentContainerStyle={[styles.scroll, webContainer as object]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, CompassFonts.displayBold, { color: colors.text }]}
          >
            Send feedback to the Sifter team
          </Text>
          <Text style={[styles.lede, { color: colors.textMuted }]}>
            This goes straight to us. Nobody else at your institution sees it,
            and there is no shared inbox to browse.
          </Text>
        </View>

        {/* Category — required */}
        <View style={styles.section}>
          <Text style={[styles.label, CompassFonts.bodySemibold, { color: colors.text }]}>
            What&apos;s this about?{" "}
            <Text style={{ color: colors.textMuted }}>(required)</Text>
          </Text>
          <View style={styles.options}>
            {CATEGORIES.map((option) => {
              const active = option.key === category;
              return (
                <TouchableOpacity
                  key={option.key}
                  activeOpacity={0.75}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  onPress={() => {
                    setCategory(option.key);
                    setStatus({ kind: "idle" });
                  }}
                  style={[
                    styles.option,
                    {
                      borderColor: active ? colors.accent : colors.border,
                      backgroundColor: active ? colors.accentSoft : colors.card,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.radio,
                      {
                        borderColor: active ? colors.accent : colors.border,
                        backgroundColor: active ? colors.accent : "transparent",
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.optionLabel,
                      active ? CompassFonts.bodySemibold : CompassFonts.bodyMedium,
                      { color: active ? colors.text : colors.textSoft },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Message */}
        <View style={styles.section}>
          <Text style={[styles.label, CompassFonts.bodySemibold, { color: colors.text }]}>
            Message
          </Text>
          <TextInput
            value={message}
            onChangeText={(t) => {
              setMessage(t);
              if (status.kind !== "idle") setStatus({ kind: "idle" });
            }}
            placeholder="Tell us what you saw, and what you expected instead."
            placeholderTextColor={colors.textMuted}
            multiline
            textAlignVertical="top"
            style={[
              styles.textArea,
              {
                color: colors.text,
                borderColor: colors.border,
                backgroundColor: colors.card,
              },
            ]}
          />
        </View>

        {/* Mapping-flag hand-off (§5.6 → §6A.2) */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => adminNav.expertDossier(router as Nav)}
          style={[
            styles.link,
            { borderColor: colors.border, backgroundColor: colors.bgSecondary },
          ]}
        >
          <View style={{ flex: 1, gap: Spacing.xs }}>
            <Text
              style={[styles.linkTitle, CompassFonts.bodySemibold, { color: colors.text }]}
            >
              Flag a specific mapping edge as wrong
            </Text>
            <Text style={[styles.linkBody, { color: colors.textMuted }]}>
              Programme → domain, domain → role, or role → skill. Opens the
              mapping-flag form so we get the exact edge.
            </Text>
          </View>
          <Text style={[styles.linkChevron, { color: colors.textMuted }]}>→</Text>
        </TouchableOpacity>

        {/* Result states — both success and failure are visible */}
        {status.kind === "sent" ? (
          <View
            style={[
              styles.banner,
              { borderColor: colors.green, backgroundColor: colors.greenSoft },
            ]}
          >
            <Text style={[styles.bannerText, CompassFonts.bodySemibold, { color: colors.green }]}>
              Thanks — your feedback reached the Sifter team.
            </Text>
          </View>
        ) : null}
        {status.kind === "error" ? (
          <View
            style={[
              styles.banner,
              { borderColor: colors.red, backgroundColor: colors.redSoft },
            ]}
          >
            <Text style={[styles.bannerText, CompassFonts.bodySemibold, { color: colors.red }]}>
              {status.message}
            </Text>
          </View>
        ) : null}

        <TouchableOpacity
          activeOpacity={0.85}
          disabled={!canSubmit}
          onPress={submit}
          accessibilityRole="button"
          style={[
            styles.submit,
            {
              backgroundColor: canSubmit ? colors.accent : colors.bgTertiary,
              opacity: canSubmit ? 1 : 0.7,
            },
          ]}
        >
          {status.kind === "sending" ? (
            <ActivityIndicator color={colors.textInverse} />
          ) : (
            <Text
              style={[
                styles.submitText,
                CompassFonts.bodyBold,
                { color: canSubmit ? colors.textInverse : colors.textMuted },
              ]}
            >
              Send
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </AdminShell>
  );
}

export default AdminFeedbackScreen;

const styles = StyleSheet.create({
  scroll: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xl,
    flexGrow: 1,
  },
  section: { gap: Spacing.md },
  sectionTitle: { fontSize: FontSize.lg },
  lede: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
  label: { fontSize: FontSize.md },
  options: { gap: Spacing.sm },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    minHeight: 44,
  },
  radio: {
    width: 16,
    height: 16,
    borderRadius: Radius.full,
    borderWidth: 2,
  },
  optionLabel: { flex: 1, fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.4 },
  textArea: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    minHeight: 120,
    fontSize: FontSize.sm,
  },
  link: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  linkTitle: { fontSize: FontSize.md },
  linkBody: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.6 },
  linkChevron: { fontSize: FontSize.lg },
  banner: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  bannerText: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.4 },
  submit: {
    minHeight: 46,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  submitText: { fontSize: FontSize.md },
});
