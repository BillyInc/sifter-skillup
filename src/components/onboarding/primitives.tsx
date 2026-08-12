/**
 * Shared onboarding form building blocks.
 *
 * Selectors that depend on CCMAS/NCE/IBASS data accept a `comingSoon` flag so
 * they render an honest "Live soon" state instead of an empty dropdown.
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
import { useTheme, Spacing, Radius, FontSize, CompassFonts } from "../../theme";
import { LockedPill } from "../careerIntelligence/ComingSoon";

export interface ChoiceOption {
  label: string;
  value: string;
}

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
          <Text
            style={[
              styles.stepBackText,
              { color: colors.accentRole.action },
              CompassFonts.bodyBold,
            ]}
          >
            Back
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.stepBack} />
      )}
      <Text
        style={[
          styles.stepLabel,
          { color: colors.textRole.muted },
          CompassFonts.body,
        ]}
      >
        Step {step} of {total}
      </Text>
      <View style={styles.stepDots}>
        {Array.from({ length: total }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.stepDot,
              {
                backgroundColor:
                  i < step ? colors.accentRole.action : colors.borderRole.subtle,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

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
          backgroundColor: colors.surface.raised,
          borderColor: selected
            ? colors.accentRole.action
            : colors.borderRole.subtle,
          borderWidth: selected ? 2 : 1,
        },
      ]}
    >
      <Text style={[styles.optionIcon, { color: colors.textRole.primary }]}>
        {icon}
      </Text>
      <View style={{ flex: 1 }}>
        <Text
          style={[
            styles.optionTitle,
            { color: colors.textRole.primary },
            CompassFonts.bodyBold,
          ]}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={[
              styles.optionSub,
              { color: colors.textRole.muted },
              CompassFonts.body,
            ]}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      {selected ? (
        <Text
          style={[
            styles.optionCheck,
            { color: colors.accentRole.action },
            CompassFonts.bodyBold,
          ]}
        >
          Selected
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

export function ChoiceChips({
  options,
  value,
  onChange,
  multi,
  label,
  maxSelected,
}: {
  options: ChoiceOption[];
  value: string | string[] | undefined;
  onChange: (value: any) => void;
  multi?: boolean;
  label?: string;
  maxSelected?: number;
}) {
  const { colors } = useTheme();
  const selectedSet = new Set(
    Array.isArray(value) ? value : value ? [value] : [],
  );

  const toggle = (v: string) => {
    if (multi) {
      const next = new Set(selectedSet);
      if (next.has(v)) {
        next.delete(v);
      } else if (!maxSelected || next.size < maxSelected) {
        next.add(v);
      }
      onChange(Array.from(next));
    } else {
      onChange(v);
    }
  };

  return (
    <View style={{ gap: Spacing.sm }}>
      {label ? (
        <Text
          style={[
            styles.fieldLabel,
            { color: colors.textRole.secondary },
            CompassFonts.bodyBold,
          ]}
        >
          {label}
          {multi && maxSelected ? ` (${selectedSet.size}/${maxSelected})` : ""}
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
                  backgroundColor: on
                    ? colors.accentRole.action
                    : colors.surface.raised,
                  borderColor: on
                    ? colors.accentRole.action
                    : colors.borderRole.subtle,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  {
                    color: on
                      ? colors.textRole.inverse
                      : colors.textRole.primary,
                  },
                  CompassFonts.bodyBold,
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

export function SelectField({
  label,
  value,
  placeholder = "Select...",
  options = [],
  onSelect,
  comingSoon,
  hint,
}: {
  label?: string;
  value?: string;
  placeholder?: string;
  options?: ChoiceOption[];
  onSelect?: (value: string) => void;
  comingSoon?: boolean;
  hint?: string;
}) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selectedLabel = options.find((o) => o.value === value)?.label;
  const searchable = options.length > 8;
  const normalizedQuery = query.trim().toLowerCase();
  const filteredOptions = normalizedQuery
    ? options.filter((o) => o.label.toLowerCase().includes(normalizedQuery))
    : options;

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  return (
    <View style={{ gap: 6 }}>
      {label ? (
        <Text
          style={[
            styles.fieldLabel,
            { color: colors.textRole.secondary },
            CompassFonts.bodyBold,
          ]}
        >
          {label}
        </Text>
      ) : null}
      <TouchableOpacity
        activeOpacity={comingSoon ? 1 : 0.85}
        onPress={() => !comingSoon && setOpen(true)}
        style={[
          styles.select,
          {
            backgroundColor: colors.surface.subtle,
            borderColor: colors.borderRole.subtle,
          },
        ]}
      >
        <Text
          style={[
            styles.selectText,
            {
              color: selectedLabel
                ? colors.textRole.primary
                : colors.textRole.placeholder,
            },
            CompassFonts.body,
          ]}
          numberOfLines={1}
        >
          {comingSoon
            ? "Available once your institution data is added"
            : selectedLabel ?? placeholder}
        </Text>
        {comingSoon ? (
          <LockedPill label="Live soon" />
        ) : (
          <Text style={[styles.chevron, { color: colors.textRole.muted }]}>v</Text>
        )}
      </TouchableOpacity>
      {hint ? (
        <Text
          style={[
            styles.hint,
            { color: colors.textRole.muted },
            CompassFonts.body,
          ]}
        >
          {hint}
        </Text>
      ) : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={close}>
          <TouchableOpacity
            activeOpacity={1}
            style={[
              styles.modalSheet,
              {
                backgroundColor: colors.surface.raised,
                borderColor: colors.borderRole.subtle,
              },
            ]}
          >
            <Text
              style={[
                styles.modalTitle,
                { color: colors.textRole.primary },
                CompassFonts.bodyBold,
              ]}
            >
              {label ?? "Select"}
            </Text>
            {searchable ? (
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search options"
                placeholderTextColor={colors.textRole.placeholder}
                style={[
                  styles.modalSearch,
                  {
                    backgroundColor: colors.surface.subtle,
                    borderColor: colors.borderRole.subtle,
                    color: colors.textRole.primary,
                  },
                  CompassFonts.body,
                ]}
                autoCorrect={false}
              />
            ) : null}
            <ScrollView style={{ maxHeight: 360 }}>
              {filteredOptions.map((o) => (
                <TouchableOpacity
                  key={o.value}
                  style={[
                    styles.modalRow,
                    { borderBottomColor: colors.borderRole.subtle },
                  ]}
                  onPress={() => {
                    onSelect?.(o.value);
                    close();
                  }}
                >
                  <Text
                    style={[
                      styles.modalRowText,
                      { color: colors.textRole.primary },
                      CompassFonts.body,
                    ]}
                  >
                    {o.label}
                  </Text>
                  {value === o.value ? (
                    <Text
                      style={[
                        styles.selectedText,
                        { color: colors.accentRole.action },
                        CompassFonts.bodyBold,
                      ]}
                    >
                      Selected
                    </Text>
                  ) : null}
                </TouchableOpacity>
              ))}
              {filteredOptions.length === 0 ? (
                <Text
                  style={[
                    styles.empty,
                    { color: colors.textRole.muted },
                    CompassFonts.body,
                  ]}
                >
                  No matching options
                </Text>
              ) : null}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

export function SearchField({
  label,
  value,
  onChangeText,
  placeholder = "Search...",
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
        <Text
          style={[
            styles.fieldLabel,
            { color: colors.textRole.secondary },
            CompassFonts.bodyBold,
          ]}
        >
          {label}
        </Text>
      ) : null}
      <View
        style={[
          styles.search,
          {
            backgroundColor: colors.surface.subtle,
            borderColor: colors.borderRole.subtle,
          },
        ]}
      >
        <Text
          style={[
            styles.searchIcon,
            { color: colors.textRole.muted },
            CompassFonts.bodyBold,
          ]}
        >
          Search
        </Text>
        <TextInput
          style={[
            styles.searchInput,
            { color: colors.textRole.primary },
            CompassFonts.body,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textRole.placeholder}
          editable={!comingSoon}
          autoCorrect={false}
        />
        {comingSoon ? <LockedPill label="Live soon" /> : null}
      </View>
    </View>
  );
}

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
      <Text
        style={[
          styles.toggleLabel,
          { color: colors.textRole.primary },
          CompassFonts.body,
        ]}
      >
        {label}
      </Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          true: colors.accentRole.action,
          false: colors.borderRole.subtle,
        }}
        thumbColor={
          Platform.OS === "android"
            ? value
              ? colors.textRole.inverse
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
  stepBackText: { fontSize: FontSize.md },
  stepLabel: { fontSize: FontSize.sm },
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
  optionIcon: { fontSize: FontSize.md, fontWeight: "900", minWidth: 36 },
  optionTitle: { fontSize: FontSize.lg },
  optionSub: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.4,
    marginTop: 2,
  },
  optionCheck: { fontSize: FontSize.xs },
  fieldLabel: { fontSize: FontSize.sm },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  chip: {
    borderWidth: 1.5,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 9,
    minHeight: 40,
    justifyContent: "center",
  },
  chipText: { fontSize: FontSize.sm },
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
  chevron: { fontSize: FontSize.md, fontWeight: "900" },
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
    marginBottom: Spacing.xs,
  },
  modalSearch: {
    borderWidth: 1,
    borderRadius: Radius.md,
    minHeight: 44,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontSize: FontSize.md,
  },
  modalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.md,
    paddingVertical: 13,
    borderBottomWidth: 1,
  },
  modalRowText: { flex: 1, fontSize: FontSize.md },
  selectedText: { fontSize: FontSize.xs },
  empty: {
    paddingVertical: Spacing.lg,
    textAlign: "center",
    fontSize: FontSize.sm,
  },
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
  searchIcon: { fontSize: FontSize.xs },
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
    paddingRight: Spacing.md,
  },
});
