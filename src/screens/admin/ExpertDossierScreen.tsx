/**
 * ExpertDossierScreen — the mapping-flag SUBMIT form (§6A.2).
 *
 * Admins and educators are domain experts in this context, so the capability
 * retained from the old Expert Dossier is: flag one programme→domain,
 * domain→role, or role→skill edge as wrong. In admin mode this is a submit
 * form, NOT the previous list/review UI — triaging submitted flags against the
 * Direct/Functional/Adjacent evidence thresholds is internal Sifter-team
 * tooling and explicitly out of admin-mode scope (§6A.2, §6A.4).
 *
 * Route params pre-fill the entity when the form is opened from a detail
 * screen: ?edgeType=domain_role&sourceId=...&targetId=...
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
import { useLocalSearchParams } from "expo-router";
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  CompassFonts,
  webContainer,
} from "@/theme";
import { adminData } from "@/lib/adminData";
import { AdminShell } from "./AdminShell";

type EdgeType = "programme_domain" | "domain_role" | "role_skill";

const EDGE_TYPES: {
  key: EdgeType;
  label: string;
  sourceLabel: string;
  targetLabel: string;
}[] = [
  {
    key: "programme_domain",
    label: "Programme → Domain",
    sourceLabel: "Programme",
    targetLabel: "Domain",
  },
  {
    key: "domain_role",
    label: "Domain → Role",
    sourceLabel: "Domain",
    targetLabel: "Role",
  },
  {
    key: "role_skill",
    label: "Role → Skill",
    sourceLabel: "Role",
    targetLabel: "Skill",
  },
];

function asEdgeType(value: unknown): EdgeType | null {
  const raw = Array.isArray(value) ? value[0] : value;
  return EDGE_TYPES.some((e) => e.key === raw) ? (raw as EdgeType) : null;
}

function asText(value: unknown): string {
  const raw = Array.isArray(value) ? value[0] : value;
  return typeof raw === "string" ? raw : "";
}

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent" }
  | { kind: "error"; message: string };

export function ExpertDossierScreen() {
  const { colors } = useTheme();
  const params = useLocalSearchParams();

  const [edgeType, setEdgeType] = useState<EdgeType>(
    asEdgeType(params.edgeType) ?? "programme_domain",
  );
  const [sourceId, setSourceId] = useState(asText(params.sourceId));
  const [targetId, setTargetId] = useState(asText(params.targetId));
  const [notes, setNotes] = useState("");
  const [correction, setCorrection] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const edge = EDGE_TYPES.find((e) => e.key === edgeType) ?? EDGE_TYPES[0];
  const canSubmit =
    sourceId.trim().length > 0 &&
    targetId.trim().length > 0 &&
    notes.trim().length > 0 &&
    status.kind !== "sending";

  const submit = async () => {
    if (!canSubmit) {
      setStatus({
        kind: "error",
        message:
          "Name both ends of the edge and tell us what's wrong with it.",
      });
      return;
    }
    setStatus({ kind: "sending" });
    try {
      const result = await adminData.submitMappingFlag({
        edgeType,
        sourceId: sourceId.trim(),
        targetId: targetId.trim(),
        notes: notes.trim(),
        suggestedCorrection: correction.trim() || undefined,
      });
      if (result.ok) {
        setStatus({ kind: "sent" });
        setNotes("");
        setCorrection("");
      } else {
        setStatus({
          kind: "error",
          message: result.message ?? "Could not send your report. Try again.",
        });
      }
    } catch (e) {
      // Never leave the form stuck in `sending` — that permanently disables
      // the submit button and the user can never retry.
      setStatus({
        kind: "error",
        message:
          e instanceof Error && e.message
            ? e.message
            : "Could not send your report. Try again.",
      });
    }
  };

  const inputStyle = [
    styles.input,
    { color: colors.text, borderColor: colors.border, backgroundColor: colors.card },
  ];

  return (
    <AdminShell title="Flag a mapping issue" eyebrow="Expert dossier">
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
            Flag a mapping issue
          </Text>
          <Text style={[styles.lede, { color: colors.textMuted }]}>
            Tell the Sifter team which mapping edge is wrong. Submissions go
            straight to us for review — there is no shared queue here.
          </Text>
        </View>

        {/* Edge type */}
        <View style={styles.section}>
          <Text style={[styles.label, CompassFonts.bodySemibold, { color: colors.text }]}>
            Edge type
          </Text>
          <View style={styles.chipRow}>
            {EDGE_TYPES.map((option) => {
              const active = option.key === edgeType;
              return (
                <TouchableOpacity
                  key={option.key}
                  activeOpacity={0.75}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  onPress={() => {
                    setEdgeType(option.key);
                    setStatus({ kind: "idle" });
                  }}
                  style={[
                    styles.chip,
                    {
                      borderColor: active ? colors.accent : colors.border,
                      backgroundColor: active ? colors.accentSoft : colors.card,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
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

        {/* Entity — pre-filled from route params when opened from a detail screen */}
        <View style={styles.section}>
          <Text style={[styles.label, CompassFonts.bodySemibold, { color: colors.text }]}>
            Entity
          </Text>
          <Text style={[styles.hint, { color: colors.textMuted }]}>
            Both ends of the edge. Pre-filled when you arrive from a detail
            screen.
          </Text>
          <TextInput
            value={sourceId}
            onChangeText={setSourceId}
            placeholder={edge.sourceLabel}
            placeholderTextColor={colors.textMuted}
            style={inputStyle}
            accessibilityLabel={edge.sourceLabel}
          />
          <Text style={[styles.arrow, { color: colors.textMuted }]}>↓</Text>
          <TextInput
            value={targetId}
            onChangeText={setTargetId}
            placeholder={edge.targetLabel}
            placeholderTextColor={colors.textMuted}
            style={inputStyle}
            accessibilityLabel={edge.targetLabel}
          />
        </View>

        {/* What's wrong */}
        <View style={styles.section}>
          <Text style={[styles.label, CompassFonts.bodySemibold, { color: colors.text }]}>
            What&apos;s wrong
          </Text>
          <TextInput
            value={notes}
            onChangeText={(t) => {
              setNotes(t);
              if (status.kind !== "idle") setStatus({ kind: "idle" });
            }}
            placeholder="Why this edge does not hold in practice."
            placeholderTextColor={colors.textMuted}
            multiline
            textAlignVertical="top"
            style={[
              styles.textArea,
              { color: colors.text, borderColor: colors.border, backgroundColor: colors.card },
            ]}
          />
        </View>

        {/* Suggested correction */}
        <View style={styles.section}>
          <Text style={[styles.label, CompassFonts.bodySemibold, { color: colors.text }]}>
            Suggested correction{" "}
            <Text style={{ color: colors.textMuted }}>(optional)</Text>
          </Text>
          <TextInput
            value={correction}
            onChangeText={setCorrection}
            placeholder="What the mapping should say instead."
            placeholderTextColor={colors.textMuted}
            multiline
            textAlignVertical="top"
            style={[
              styles.textArea,
              { color: colors.text, borderColor: colors.border, backgroundColor: colors.card },
            ]}
          />
        </View>

        {status.kind === "sent" ? (
          <View
            style={[
              styles.banner,
              { borderColor: colors.green, backgroundColor: colors.greenSoft },
            ]}
          >
            <Text style={[styles.bannerText, CompassFonts.bodySemibold, { color: colors.green }]}>
              Thanks — the Sifter team has your mapping report.
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
              Submit to Sifter team
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </AdminShell>
  );
}

export default ExpertDossierScreen;

const styles = StyleSheet.create({
  scroll: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xl,
    flexGrow: 1,
  },
  section: { gap: Spacing.sm },
  sectionTitle: { fontSize: FontSize.lg },
  lede: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
  label: { fontSize: FontSize.md },
  hint: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.6 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  chip: {
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    minHeight: 34,
    justifyContent: "center",
  },
  chipText: { fontSize: FontSize.sm },
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    minHeight: 42,
    fontSize: FontSize.sm,
  },
  arrow: { fontSize: FontSize.md, textAlign: "center" },
  textArea: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    minHeight: 100,
    fontSize: FontSize.sm,
  },
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
