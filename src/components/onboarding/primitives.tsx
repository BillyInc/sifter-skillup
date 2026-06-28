/**
 * Onboarding form primitives — shared building blocks for every setup step.
 *
 * Stepper · OptionCard · ChoiceChips · SelectField (modal picker) · SearchField
 * · ToggleRow. Selectors that depend on CCMAS/NCE/IBASS data accept a
 * `comingSoon` flag so they render an honest "Live soon" state instead of an
 * empty dropdown until that data is imported.
 */
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Switch,
  Platform,
  type ViewStyle,
} from "react-native";
import { useTheme, Spacing, Radius, FontSize, Brand } from "../../theme";
import { LockedPill } from "../careerIntelligence/ComingSoon";

// ─── Stepper header ───────────────────────────────────────────
export function Stepper({
  step,
  total,
  onBack,
}: {
  step: number;
  total: number;
  onBack?: () => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.stepper}>
      {onBack ? (
        <TouchableOpacity onPress={onBack} hitSlop={10} style={styles.stepBack}>
          <Text style={[styles.stepBackText, { color: colors.accent }]}>
            ← Back
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.stepBack} />
      )}
      <Text style={[styles.stepLabel, { color: colors.textMuted }]}>
        Step {step} of {total}
      </Text>
      <View style={styles.stepDots}>
        {Array.from({ length: total }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.stepDot,
              { backgroundColor: i < step ? Brand.primary : colors.border },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

// ─── Big tappable option card (WhoAreYou etc.) ────────────────
export function OptionCard({
  icon,
  title,
  subtitle,
  selected,
  onPress,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  selected?: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        styles.optionCard,
        {
          backgroundColor: colors.card,
          borderColor: selected ? Brand.primary : colors.border,
          borderWidth: selected ? 2 : 1,
        },
      ]}
    >
      <Text style={styles.optionIcon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[styles.optionTitle, { color: colors.text }]}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.optionSub, { color: colors.textMuted }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {selected ? <Text style={styles.optionCheck}>✓</Text> : null}
    </TouchableOpacity>
  );
}

// ─── Choice chips (single or multi) ───────────────────────────
export interface ChoiceOption {
  label: string;
  value: string;
}

export function ChoiceChips({
  options,
  value,
  onChange,
  multi,
  label,
}: {
  options: ChoiceOption[];
  value: string | string[] | undefined;
  onChange: (value: any) => void;
  multi?: boolean;
  label?: string;
}) {
  const { colors } = useTheme();
  const selectedSet = new Set(
    Array.isArray(value) ? value : value ? [value] : [],
  );

  const toggle = (v: string) => {
    if (multi) {
      const next = new Set(selectedSet);
      next.has(v) ? next.delete(v) : next.add(v);
      onChange(Array.from(next));
    } else {
      onChange(v);
    }
  };

  return (
    <View style={{ gap: Spacing.sm }}>
      {label ? (
        <Text style={[styles.fieldLabel, { color: colors.textSoft }]}>
          {label}
        </Text>
      ) : null}
      <View style={styles.chipWrap}>
        {options.map((o) => {
          const on = selectedSet.has(o.value);
          return (
            <TouchableOpacity
              key={o.value}
              activeOpacity={0.85}
              onPress={() => toggle(o.value)}
              style={[
                styles.chip,
                {
                  backgroundColor: on ? Brand.primary : colors.card,
                  borderColor: on ? Brand.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: on ? Brand.onPrimary : colors.text },
                ]}
              >
                {o.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ─── Select field with modal picker ───────────────────────────
export function SelectField({
  label,
  value,
  placeholder = "Select…",
  options,
  onSelect,
  comingSoon,
  hint,
}: {
  label?: string;
  value?: string;
  placeholder?: string;
  options?: ChoiceOption[];
  onSelect?: (value: string) => void;
  /** Data not yet imported → render a disabled "Live soon" field. */
  comingSoon?: boolean;
  hint?: string;
}) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const selectedLabel = options?.find((o) => o.value === value)?.label;

  return (
    <View style={{ gap: 6 }}>
      {label ? (
        <Text style={[styles.fieldLabel, { color: colors.textSoft }]}>
          {label}
        </Text>
      ) : null}
      <TouchableOpacity
        activeOpacity={comingSoon ? 1 : 0.85}
        onPress={() => !comingSoon && setOpen(true)}
        style={[
          styles.select,
          { backgroundColor: colors.inputBg, borderColor: colors.inputBorder },
        ]}
      >
        <Text
          style={[
            styles.selectText,
            { color: selectedLabel ? colors.text : colors.textMuted },
          ]}
          numberOfLines={1}
        >
          {comingSoon
            ? "Available once your institution data is added"
            : (selectedLabel ?? placeholder)}
        </Text>
        {comingSoon ? (
          <LockedPill label="Live soon" />
        ) : (
          <Text style={{ color: colors.textMuted }}>▾</Text>
        )}
      </TouchableOpacity>
      {hint ? (
        <Text style={[styles.hint, { color: colors.textMuted }]}>{hint}</Text>
      ) : null}

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <View
            style={[
              styles.modalSheet,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {label ?? "Select"}
            </Text>
            <ScrollView style={{ maxHeight: 360 }}>
              {(options ?? []).map((o) => (
                <TouchableOpacity
                  key={o.value}
                  style={[
                    styles.modalRow,
                    { borderBottomColor: colors.border },
                  ]}
                  onPress={() => {
                    onSelect?.(o.value);
                    setOpen(false);
                  }}
                >
                  <Text style={[styles.modalRowText, { color: colors.text }]}>
                    {o.label}
                  </Text>
                  {value === o.value ? (
                    <Text style={{ color: Brand.primary }}>✓</Text>
                  ) : null}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// ─── Search field ─────────────────────────────────────────────
export function SearchField({
  label,
  value,
  onChangeText,
  placeholder = "Search…",
  comingSoon,
}: {
  label?: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  comingSoon?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: 6 }}>
      {label ? (
        <Text style={[styles.fieldLabel, { color: colors.textSoft }]}>
          {label}
        </Text>
      ) : null}
      <View
        style={[
          styles.search,
          { backgroundColor: colors.inputBg, borderColor: colors.inputBorder },
        ]}
      >
        <Text style={{ color: colors.textMuted }}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          editable={!comingSoon}
          autoCorrect={false}
        />
        {comingSoon ? <LockedPill label="Live soon" /> : null}
      </View>
    </View>
  );
}

// ─── Toggle row ───────────────────────────────────────────────
export function ToggleRow({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.toggleRow}>
      <Text style={[styles.toggleLabel, { color: colors.text }]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ true: Brand.primary, false: colors.border }}
        thumbColor={
          Platform.OS === "android"
            ? value
              ? Brand.onPrimary
              : "#f4f3f4"
            : undefined
        }
      />
    </View>
  );
}

export const onboardingFieldStyle: ViewStyle = { gap: 6 };

const styles = StyleSheet.create({
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  stepBack: { minWidth: 64 },
  stepBackText: { fontSize: FontSize.md, fontWeight: "700" },
  stepLabel: { fontSize: FontSize.sm, fontWeight: "600" },
  stepDots: {
    flexDirection: "row",
    gap: 5,
    minWidth: 64,
    justifyContent: "flex-end",
  },
  stepDot: { width: 18, height: 6, borderRadius: 3 },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
  },
  optionIcon: { fontSize: 28 },
  optionTitle: { fontSize: FontSize.lg, fontWeight: "800" },
  optionSub: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.4,
    marginTop: 2,
  },
  optionCheck: { fontSize: 18, fontWeight: "900", color: Brand.primary },
  fieldLabel: { fontSize: FontSize.sm, fontWeight: "700" },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  chip: {
    borderWidth: 1.5,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 9,
    minHeight: 40,
    justifyContent: "center",
  },
  chipText: { fontSize: FontSize.sm, fontWeight: "700" },
  select: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.sm,
    borderWidth: 1.5,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 13,
    minHeight: 48,
  },
  selectText: { flex: 1, fontSize: FontSize.md },
  hint: { fontSize: FontSize.xs },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: Spacing.xl,
  },
  modalSheet: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  modalTitle: {
    fontSize: FontSize.lg,
    fontWeight: "800",
    marginBottom: Spacing.xs,
  },
  modalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 13,
    borderBottomWidth: 1,
  },
  modalRowText: { fontSize: FontSize.md },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    borderWidth: 1.5,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 11,
    minHeight: 48,
  },
  searchInput: { flex: 1, fontSize: FontSize.md },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.sm,
  },
  toggleLabel: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: "600",
    paddingRight: Spacing.md,
  },
});
