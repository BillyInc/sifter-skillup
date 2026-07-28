import React, { useState } from "react";
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import {
  CompassFonts,
  FontSize,
  FontWeight,
  Radius,
  Spacing,
  useTheme,
} from "../../theme";

// ── SifterTextInput ────────────────────────────────────────────
// Standalone text input with semantic tokens, focus ring, error, disabled, label.

export function SifterTextInput({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  disabled,
  secureTextEntry,
  multiline,
  numberOfLines,
  style,
  inputStyle,
  ...props
}: Omit<TextInputProps, "style" | "value" | "onChangeText"> & {
  label?: string;
  value: string;
  onChangeText: (v: string) => void;
  error?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? colors.accentRole.danger
    : focused
      ? colors.borderRole.focus
      : colors.borderRole.subtle;

  return (
    <View style={[{ gap: Spacing.xs }, style]}>
      {label ? (
        <Text style={[styles.inputLabel, { color: colors.textRole.secondary }]}>{label}</Text>
      ) : null}
      <View
        style={[
          styles.inputWrap,
          {
            backgroundColor: disabled ? colors.surface.subtle : colors.surface.raised,
            borderColor,
          },
          focused && { borderWidth: 1.5 },
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={error ? colors.accentRole.danger + "80" : colors.textRole.placeholder}
          editable={!disabled}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
          style={[
            styles.inputField,
            { color: colors.textRole.primary },
            disabled && { opacity: 0.5 },
            multiline && { minHeight: (numberOfLines ?? 3) * 20 },
            inputStyle,
          ]}
          {...props}
        />
      </View>
      {error ? (
        <Text style={[styles.inputError, { color: colors.accentRole.danger }]}>{error}</Text>
      ) : null}
    </View>
  );
}

// ── SifterSelect ───────────────────────────────────────────────
// Dropdown select with options. Opens a modal picker on mobile, inline on web.

export interface SelectOption {
  label: string;
  value: string;
}

export function SifterSelect({
  label,
  options,
  value,
  onSelect,
  placeholder = "Select…",
  disabled,
  style,
}: {
  label?: string;
  options: SelectOption[];
  value?: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View style={[{ gap: Spacing.xs }, style]}>
      {label ? (
        <Text style={[styles.inputLabel, { color: colors.textRole.secondary }]}>{label}</Text>
      ) : null}
      <TouchableOpacity
        activeOpacity={0.78}
        onPress={() => !disabled && setOpen(true)}
        disabled={disabled}
        style={[
          styles.selectTrigger,
          {
            backgroundColor: disabled ? colors.surface.subtle : colors.surface.raised,
            borderColor: colors.borderRole.subtle,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        <Text
          style={[
            styles.selectText,
            { color: selected ? colors.textRole.primary : colors.textRole.placeholder },
          ]}
          numberOfLines={1}
        >
          {selected?.label ?? placeholder}
        </Text>
        <Feather name="chevron-down" size={16} color={colors.textRole.muted} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity
          style={styles.selectOverlay}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <View
            style={[
              styles.selectDropdown,
              {
                backgroundColor: colors.surface.raised,
                borderColor: colors.borderRole.subtle,
              },
            ]}
          >
            <ScrollView style={{ maxHeight: 300 }} keyboardShouldPersistTaps="handled">
              {options.map((opt) => {
                const isActive = opt.value === value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    activeOpacity={0.75}
                    onPress={() => { onSelect(opt.value); setOpen(false); }}
                    style={[
                      styles.selectOption,
                      {
                        backgroundColor: isActive ? colors.accentRole.action + "12" : "transparent",
                        borderBottomColor: colors.borderRole.subtle,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.selectOptionText,
                        { color: isActive ? colors.accentRole.action : colors.textRole.primary },
                      ]}
                      numberOfLines={1}
                    >
                      {opt.label}
                    </Text>
                    {isActive ? (
                      <Feather name="check" size={16} color={colors.accentRole.action} />
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// ── ChipSelect ─────────────────────────────────────────────────
// Chip-multiselect container. Renders a group of toggleable chips.

export function ChipSelect({
  label,
  options,
  value,
  onChange,
  multi = false,
  style,
}: {
  label?: string;
  options: SelectOption[];
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  multi?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();

  const toggle = (opt: string) => {
    if (multi) {
      const arr = Array.isArray(value) ? value : [];
      const next = arr.includes(opt) ? arr.filter((v) => v !== opt) : [...arr, opt];
      onChange(next);
    } else {
      onChange(opt === value ? "" : opt);
    }
  };

  const isActive = (opt: string) =>
    multi ? Array.isArray(value) && value.includes(opt) : value === opt;

  return (
    <View style={[{ gap: Spacing.xs }, style]}>
      {label ? (
        <Text style={[styles.inputLabel, { color: colors.textRole.secondary }]}>{label}</Text>
      ) : null}
      <View style={styles.chipGrid}>
        {options.map((opt) => {
          const active = isActive(opt.value);
          return (
            <TouchableOpacity
              key={opt.value}
              activeOpacity={0.75}
              onPress={() => toggle(opt.value)}
              style={[
                styles.chipOption,
                {
                  backgroundColor: active ? colors.accentRole.action : colors.surface.raised,
                  borderColor: active ? colors.accentRole.action : colors.borderRole.subtle,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipOptionText,
                  { color: active ? colors.textRole.inverse : colors.textRole.secondary },
                ]}
                numberOfLines={1}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ── SifterDatePicker ───────────────────────────────────────────
// Date picker. On web uses native <input type="date">, on mobile opens a
// simple year/month/day picker modal.

export function SifterDatePicker({
  label,
  value,
  onChange,
  placeholder = "Pick a date",
  disabled,
  style,
}: {
  label?: string;
  value?: string;
  onChange: (date: string) => void;
  placeholder?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();

  if (Platform.OS === "web") {
    return (
      <View style={[{ gap: Spacing.xs }, style]}>
        {label ? (
          <Text style={[styles.inputLabel, { color: colors.textRole.secondary }]}>{label}</Text>
        ) : null}
        <View
          style={[
            styles.inputWrap,
            {
              backgroundColor: disabled ? colors.surface.subtle : colors.surface.raised,
              borderColor: colors.borderRole.subtle,
            },
          ]}
        >
          <Feather name="calendar" size={16} color={colors.textRole.muted} />
          <input
            type="date"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            style={{
              flex: 1,
              border: "none",
              background: "transparent",
              outline: "none",
              color: colors.textRole.primary,
              fontSize: FontSize.md,
              fontFamily: "inherit",
              minWidth: 80,
            }}
          />
        </View>
      </View>
    );
  }

  // Native: simple display with the value, tappable to open a basic modal
  return (
    <View style={[{ gap: Spacing.xs }, style]}>
      {label ? (
        <Text style={[styles.inputLabel, { color: colors.textRole.secondary }]}>{label}</Text>
      ) : null}
      <View
        style={[
          styles.inputWrap,
          {
            backgroundColor: disabled ? colors.surface.subtle : colors.surface.raised,
            borderColor: colors.borderRole.subtle,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        <Feather name="calendar" size={16} color={colors.textRole.muted} />
        <Text
          style={[
            styles.selectText,
            { color: value ? colors.textRole.primary : colors.textRole.placeholder },
          ]}
        >
          {value ?? placeholder}
        </Text>
      </View>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────

const styles = StyleSheet.create({
  inputLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  inputWrap: {
    minHeight: 44,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  inputField: {
    flex: 1,
    fontSize: FontSize.md,
    paddingVertical: 0,
  },
  inputError: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
  // Select
  selectTrigger: {
    minHeight: 44,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectText: {
    flex: 1,
    fontSize: FontSize.md,
  },
  selectOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xxl,
  },
  selectDropdown: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: "hidden",
    width: "100%",
    maxWidth: 360,
  },
  selectOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  selectOptionText: {
    fontSize: FontSize.md,
  },
  // ChipSelect
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
  },
  chipOption: {
    minHeight: 32,
    borderRadius: Radius.full,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  chipOptionText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
});
