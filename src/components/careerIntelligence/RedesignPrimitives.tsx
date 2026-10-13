import React, { forwardRef, type ReactNode } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type StyleProp,
  type TextStyle,
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

export function SectionLabel({
  children,
  action,
  onAction,
  style,
}: {
  children: string;
  action?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.sectionLabelRow, style]}>
      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
        {children}
      </Text>
      {action ? (
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={onAction}
          disabled={!onAction}
          style={styles.sectionAction}
        >
          <Text style={[styles.sectionActionText, { color: colors.accentRole.action }]}>
            {action}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function TextTabs<T extends string>({
  tabs,
  value,
  onChange,
  style,
}: {
  tabs: { value: T; label: string; disabled?: boolean; locked?: boolean }[];
  value: T;
  onChange: (value: T) => void;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.tabs, { borderBottomColor: colors.borderRole.subtle }, style]}>
      {tabs.map((tab) => {
        const active = tab.value === value;
        const disabled = tab.disabled || tab.locked;
        return (
          <TouchableOpacity
            key={tab.value}
            activeOpacity={0.78}
            onPress={() => !disabled && onChange(tab.value)}
            disabled={disabled}
            style={[
              styles.tab,
              active && { borderBottomColor: colors.textRole.primary },
              !active && { borderBottomColor: "transparent" },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color: disabled
                    ? colors.textRole.placeholder
                    : active
                      ? colors.textRole.primary
                      : colors.textRole.secondary,
                },
              ]}
              numberOfLines={1}
            >
              {tab.label}{tab.locked ? "  Lock" : ""}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export function FilterChip({
  label,
  active,
  locked,
  onPress,
}: {
  label: string;
  active?: boolean;
  locked?: boolean;
  onPress?: () => void;
}) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      activeOpacity={0.78}
      onPress={onPress}
      disabled={!onPress || locked}
      style={[
        styles.filterChip,
        {
          backgroundColor: active ? colors.surface.inverse : colors.surface.raised,
          borderColor: active ? colors.surface.inverse : colors.borderRole.subtle,
          opacity: locked ? 0.62 : 1,
        },
      ]}
    >
      <Text
        style={[
          styles.filterChipText,
          { color: active ? colors.textRole.inverse : colors.textRole.secondary },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export const SearchBar = forwardRef<TextInput, Omit<TextInputProps, "style" | "value" | "onChangeText" | "onFocus" | "onBlur"> & {
  value: string;
  onChangeText: (value: string) => void;
  scope?: string;
  loading?: boolean;
  error?: boolean;
  disabled?: boolean;
  onClear?: () => void;
  onFocus?: TextInputProps["onFocus"];
  onBlur?: TextInputProps["onBlur"];
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
}>(function SearchBar({
  value,
  onChangeText,
  placeholder = "Search",
  scope,
  loading,
  error,
  disabled,
  onClear,
  onFocus,
  onBlur,
  style,
  inputStyle,
  ...inputProps
}, ref) {
  const { colors } = useTheme();
  const [focused, setFocused] = React.useState(false);
  const showClear = value.length > 0 && !loading;

  const borderColor = error
    ? colors.accentRole.danger
    : focused
      ? colors.borderRole.focus
      : colors.borderRole.subtle;

  return (
    <View
      style={[
        styles.searchBar,
        {
          backgroundColor: colors.surface.raised,
          borderColor,
        },
        focused && { borderWidth: 1.5 },
        style,
      ]}
    >
      <Feather name="search" size={17} color={error ? colors.accentRole.danger : colors.textRole.muted} />
      {scope ? (
        <View
          style={[
            styles.scopeChip,
            { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle },
          ]}
        >
          <Text style={[styles.scopeChipText, { color: colors.textRole.secondary }]}>
            {scope}
          </Text>
        </View>
      ) : null}
      <TextInput
        ref={ref}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={error ? colors.accentRole.danger + "80" : colors.textRole.placeholder}
        returnKeyType="search"
        autoCorrect={false}
        editable={!disabled}
        onFocus={(e) => { setFocused(true); onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); onBlur?.(e); }}
        style={[
          styles.searchInput,
          { color: colors.textRole.primary },
          disabled && { opacity: 0.5 },
          inputStyle,
        ]}
        {...inputProps}
      />
      {loading ? (
        <ActivityIndicator size="small" color={colors.accentRole.action} />
      ) : null}
      {showClear ? (
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={onClear ?? (() => onChangeText(""))}
          hitSlop={8}
        >
          <Feather name="x" size={17} color={colors.textRole.muted} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
});

export function ListRow({
  title,
  subtitle,
  meta,
  icon,
  selected,
  loading,
  locked,
  empty,
  onPress,
  right,
  style,
}: {
  title: string;
  subtitle?: string;
  meta?: string;
  icon?: keyof typeof Feather.glyphMap;
  selected?: boolean;
  loading?: boolean;
  locked?: boolean;
  empty?: boolean;
  onPress?: () => void;
  right?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  const disabled = loading || locked || empty || !onPress;
  return (
    <TouchableOpacity
      activeOpacity={0.78}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole={selected ? "checkbox" : "button"}
      accessibilityState={selected ? { selected: true, disabled } : { disabled }}
      style={[
        styles.listRow,
        {
          backgroundColor: selected ? colors.surface.subtle : colors.surface.raised,
          borderColor: selected ? colors.borderRole.strong : colors.borderRole.subtle,
          opacity: locked ? 0.68 : 1,
        },
        style,
      ]}
    >
      {icon ? (
        <View
          style={[
            styles.listIcon,
            { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle },
          ]}
        >
          <Feather name={locked ? "lock" : icon} size={16} color={colors.textRole.secondary} />
        </View>
      ) : null}
      <View style={styles.listMain}>
        {loading ? (
          <>
            <View style={[styles.skeletonTitle, { backgroundColor: colors.shimmer }]} />
            <View style={[styles.skeletonMeta, { backgroundColor: colors.shimmerHighlight }]} />
          </>
        ) : (
          <>
            <Text
              style={[
                styles.listTitle,
                { color: empty ? colors.textRole.muted : colors.textRole.primary },
              ]}
              numberOfLines={1}
            >
              {title}
            </Text>
            {subtitle ? (
              <Text style={[styles.listSubtitle, { color: colors.textRole.secondary }]} numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
            {meta ? (
              <Text
                style={[styles.listMeta, CompassFonts.data, { color: colors.textRole.muted }]}
                numberOfLines={1}
              >
                {meta}
              </Text>
            ) : null}
          </>
        )}
      </View>
      {right ?? (
        locked ? (
          <Feather name="lock" size={15} color={colors.state.locked} />
        ) : selected ? (
          <Feather name="check-circle" size={17} color={colors.accentRole.action} />
        ) : onPress ? (
          <Feather name="chevron-right" size={17} color={colors.textRole.muted} />
        ) : null
      )}
    </TouchableOpacity>
  );
}

export function LockedTile({
  title,
  line,
  action,
  onAction,
  icon = "lock",
  style,
}: {
  title: string;
  line: string;
  action?: string;
  onAction?: () => void;
  icon?: keyof typeof Feather.glyphMap;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.lockedTile,
        {
          backgroundColor: colors.surface.raised,
          borderColor: colors.borderRole.subtle,
        },
        style,
      ]}
    >
      <View style={[styles.lockedIcon, { backgroundColor: colors.state.lockedSoft }]}>
        <Feather name={icon} size={18} color={colors.state.locked} />
      </View>
      <View style={styles.lockedMain}>
        <View style={styles.lockedHead}>
          <Text style={[styles.lockedTitle, { color: colors.textRole.primary }]}>
            {title}
          </Text>
          <View
            style={[
              styles.lockedBadge,
              { backgroundColor: colors.state.lockedSoft, borderColor: colors.borderRole.subtle },
            ]}
          >
            <Feather name="lock" size={11} color={colors.state.locked} />
            <Text style={[styles.lockedBadgeText, { color: colors.state.locked }]}>
              Locked
            </Text>
          </View>
        </View>
        <Text style={[styles.lockedLine, { color: colors.textRole.secondary }]}>
          {line}
        </Text>
        {action ? (
          <TouchableOpacity
            activeOpacity={0.76}
            onPress={onAction}
            disabled={!onAction}
            style={styles.lockedAction}
          >
            <Text style={[styles.lockedActionText, { color: colors.accentRole.action }]}>
              {action}
            </Text>
            <Feather name="arrow-right" size={13} color={colors.accentRole.action} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionLabelRow: {
    minHeight: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.9,
    textTransform: "uppercase",
  },
  sectionAction: { minHeight: 28, justifyContent: "center" },
  sectionActionText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  tabs: {
    minHeight: 38,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tab: {
    minHeight: 38,
    justifyContent: "center",
    borderBottomWidth: 2,
    paddingHorizontal: 1,
  },
  tabText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  filterChip: {
    minHeight: 32,
    maxWidth: "100%",
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  filterChipText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  searchBar: {
    minHeight: 44,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    minWidth: 80,
    fontSize: FontSize.md,
    paddingVertical: 0,
  },
  scopeChip: {
    minHeight: 24,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  scopeChipText: { fontSize: 10, fontWeight: FontWeight.semibold },
  listRow: {
    minHeight: 52,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  listIcon: {
    width: 30,
    height: 30,
    borderRadius: Radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  listMain: { flex: 1, minWidth: 0 },
  listTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  listSubtitle: { fontSize: FontSize.xs, marginTop: 2 },
  listMeta: { fontSize: 10, marginTop: 3, letterSpacing: 0 },
  skeletonTitle: {
    width: "54%",
    height: 12,
    borderRadius: Radius.sm,
    marginBottom: 7,
  },
  skeletonMeta: {
    width: "34%",
    height: 9,
    borderRadius: Radius.sm,
  },
  lockedTile: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.md,
    flexDirection: "row",
    gap: Spacing.md,
    alignItems: "flex-start",
  },
  lockedIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  lockedMain: { flex: 1, minWidth: 0, gap: 4 },
  lockedHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },
  lockedTitle: { flex: 1, fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  lockedLine: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.45 },
  lockedBadge: {
    minHeight: 22,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  lockedBadgeText: { fontSize: 10, fontWeight: FontWeight.semibold },
  lockedAction: {
    minHeight: 28,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 4,
  },
  lockedActionText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
});
