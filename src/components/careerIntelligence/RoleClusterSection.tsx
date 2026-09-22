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
  CompassFonts,
} from "@/theme";
import type { SubgroupV2 } from "@/types/career";
import { ToolGroupsBlock } from "./ToolGroupsBlock";
import { CertPlacementList } from "./CertPlacementList";
import { MethodEvidenceBlock } from "./MethodEvidenceBlock";
import { DomainIcon } from "./DomainIcon";
import { GuidanceReportButton } from "./GuidanceReportButton";

export interface RoleClusterSectionProps {
  subgroup: SubgroupV2;
  domainId?: string;
  domainName?: string;
  targetStudentId?: string;
  children?: React.ReactNode;
  defaultOpen?: boolean;
  style?: ViewStyle;
}

export function RoleClusterSection({
  subgroup,
  domainId,
  domainName,
  targetStudentId,
  children,
  defaultOpen = false,
  style,
}: RoleClusterSectionProps) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(defaultOpen);
  const rotateAnim = useRef(new Animated.Value(defaultOpen ? 1 : 0)).current;

  const toggle = () => {
    const next = !open;
    setOpen(next);
    Animated.timing(rotateAnim, {
      toValue: next ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const chevronRotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "90deg"],
  });

  const skills = subgroup.clusterSkills ?? [];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle },
        style,
      ]}
    >
      <TouchableOpacity
        onPress={toggle}
        activeOpacity={0.7}
        style={styles.header}
      >
        <DomainIcon domainId={domainId} size={18} rounded />
        <View style={styles.headerMain}>
          <View style={styles.titleRow}>
            <Text
              style={[styles.title, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}
              numberOfLines={1}
            >
              {subgroup.name}
            </Text>
            {typeof subgroup.roleCount === "number" ? (
              <View
                style={[styles.countChip, { backgroundColor: colors.surface.subtle }]}
              >
                <Text style={[styles.countText, { color: colors.textRole.muted }, CompassFonts.data]}>
                  {subgroup.roleCount}
                  {" "}
                  {subgroup.roleCount === 1 ? "role" : "roles"}
                </Text>
              </View>
            ) : null}
          </View>
          {subgroup.description ? (
            <Text
              style={[styles.desc, { color: colors.textRole.secondary }, CompassFonts.body]}
              numberOfLines={1}
            >
              {subgroup.description}
            </Text>
          ) : null}
        </View>
        <Animated.Text
          style={[
            styles.chevron,
            { color: colors.textRole.muted, transform: [{ rotate: chevronRotation }] },
          ]}
        >
          ›
        </Animated.Text>
      </TouchableOpacity>

      <View style={styles.selectionRow}>
        <GuidanceReportButton
          selection={{ kind: "subgroups", id: subgroup.id, name: subgroup.name, domainId, domainName }}
          targetStudentId={targetStudentId}
        />
      </View>

      {open ? (
        <View style={styles.body}>
          {skills.length ? (
            <View style={styles.skillsBlock}>
              <Text style={[styles.subLabel, { color: colors.textRole.muted }, CompassFonts.bodyBold]}>
                Skills to build first
              </Text>
              <Text style={[styles.guidanceNote, { color: colors.textRole.muted }, CompassFonts.body]}>
                Start with the first skills listed, then add the others as your direction becomes clearer.
              </Text>
              <View style={styles.chipWrap}>
                {skills.map((s, i) => (
                  <View
                    key={`${s}-${i}`}
                    style={[
                      styles.skillChip,
                      {
                        backgroundColor: colors.surface.subtle,
                        borderColor: colors.borderRole.subtle,
                      },
                    ]}
                  >
                    <Text
                      style={[styles.skillChipText, { color: colors.textRole.secondary }, CompassFonts.bodyMedium]}
                      numberOfLines={1}
                    >
                      {s}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          <MethodEvidenceBlock methods={subgroup.methodEvidence} />
          <ToolGroupsBlock
            tools={subgroup.tools}
            title="Tools used in this area"
            commonLabel="Useful across this area"
            distinctiveLabel="More specialised tools in this area"
            explanation="These tools are attached to the area of work. Open a role below to see where they become useful in practice."
          />
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
    borderWidth: StyleSheet.hairlineWidth,
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
    flexShrink: 1,
  },
  countChip: {
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countText: {
    fontSize: FontSize.xs,
  },
  desc: {
    fontSize: FontSize.sm,
  },
  chevron: {
    fontSize: FontSize.xxl,
    lineHeight: FontSize.xxl,
  },
  body: {
    gap: Spacing.lg,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  selectionRow: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  skillsBlock: { gap: Spacing.sm },
  guidanceNote: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.4,
  },
  subLabel: {
    fontSize: FontSize.xs,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  skillChip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
  },
  skillChipText: {
    fontSize: FontSize.sm,
  },
});
