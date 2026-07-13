/**
 * RoleClusterSection — a collapsible sub-group (role cluster) within a domain.
 *
 * Header (whole thing tappable): cluster name + a role-count chip + a one-line
 * muted description, with a chevron that rotates on expand. The expanded body
 * shows the cluster's focus skills as chips, its ToolGroupsBlock, its
 * CertPlacementList (specialisation certs) and finally `children` — the role
 * cards for this cluster, rendered by the parent screen.
 */
import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  type ViewStyle,
} from "react-native";
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  FontWeight,
  AnimPreset,
} from "../../theme";
import type { SubgroupV2 } from "../../types/career";
import { ToolGroupsBlock } from "./ToolGroupsBlock";
import { CertPlacementList } from "./CertPlacementList";

export interface RoleClusterSectionProps {
  subgroup: SubgroupV2;
  children?: React.ReactNode;
  defaultOpen?: boolean;
  style?: ViewStyle;
}

export function RoleClusterSection({
  subgroup,
  children,
  defaultOpen = false,
  style,
}: RoleClusterSectionProps) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(defaultOpen);
  const rotate = useRef(new Animated.Value(defaultOpen ? 1 : 0)).current;

  const toggle = () => {
    const next = !open;
    setOpen(next);
    Animated.timing(rotate, {
      toValue: next ? 1 : 0,
      ...AnimPreset.standard,
    }).start();
  };

  const chevron = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "90deg"],
  });

  const skills = subgroup.clusterSkills ?? [];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.card, borderColor: colors.border },
        style,
      ]}
    >
      <TouchableOpacity
        onPress={toggle}
        activeOpacity={0.7}
        style={styles.header}
      >
        <View style={styles.headerMain}>
          <View style={styles.titleRow}>
            <Text
              style={[styles.title, { color: colors.text }]}
              numberOfLines={1}
            >
              {subgroup.name}
            </Text>
            {typeof subgroup.roleCount === "number" ? (
              <View
                style={[styles.countChip, { backgroundColor: colors.bgSecondary }]}
              >
                <Text style={[styles.countText, { color: colors.textMuted }]}>
                  {subgroup.roleCount}{" "}
                  {subgroup.roleCount === 1 ? "role" : "roles"}
                </Text>
              </View>
            ) : null}
          </View>
          {subgroup.description ? (
            <Text
              style={[styles.desc, { color: colors.textMuted }]}
              numberOfLines={1}
            >
              {subgroup.description}
            </Text>
          ) : null}
        </View>
        <Animated.Text
          style={[
            styles.chevron,
            { color: colors.textMuted, transform: [{ rotate: chevron }] },
          ]}
        >
          ›
        </Animated.Text>
      </TouchableOpacity>

      {open ? (
        <View style={styles.body}>
          {skills.length ? (
            <View style={styles.skillsBlock}>
              <Text style={[styles.subLabel, { color: colors.textMuted }]}>
                Focus skills
              </Text>
              <View style={styles.chipWrap}>
                {skills.map((s, i) => (
                  <View
                    key={`${s}-${i}`}
                    style={[
                      styles.skillChip,
                      {
                        backgroundColor: colors.bgSecondary,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[styles.skillChipText, { color: colors.textSoft }]}
                      numberOfLines={1}
                    >
                      {s}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          <ToolGroupsBlock tools={subgroup.tools} />
          <CertPlacementList subgroup={subgroup.certifications} />

          {children}
        </View>
      ) : null}
    </View>
  );
}

export default RoleClusterSection;

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.md,
  },
  headerMain: { flex: 1, gap: 3 },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    flexWrap: "wrap",
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.heavy,
    flexShrink: 1,
  },
  countChip: {
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  desc: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  chevron: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    lineHeight: FontSize.xxl,
  },
  body: {
    gap: Spacing.lg,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  skillsBlock: { gap: Spacing.sm },
  subLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  skillChip: {
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
  },
  skillChipText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
});
