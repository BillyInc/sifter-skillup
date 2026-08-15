/**
 * SkillsGapScreen — per-programme skills-gap report (curriculum vs employer
 * demand). Reads adminData.getSkillsGapReport and renders an AdminDataTable
 * with columns: programme, domain, skill, demand %, in curriculum.
 */
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import {
  useTheme,
  Spacing,
  FontSize,
  CompassFonts,
  webContainer,
} from "@/theme";
import { adminData } from "@/lib/adminData";
import { Badge } from "@/components/ui";
import type { DataState } from "../../types/career";
import type { SkillGapRow } from "../../types/institution";
import { AdminShell } from "./AdminShell";
import { ComingSoonPanel } from "./ComingSoonPanel";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import type { ColumnDef } from "@/components/admin/AdminDataTable";
import { getEducatorProfile } from "@/lib/educatorProfile";
import { adminAudienceForProfile } from "@/lib/adminAudience";
import { useAuth } from "@/hooks/useAuth";

const COLUMNS: ColumnDef[] = [
  { key: "programmeName", label: "Programme", width: undefined },
  { key: "domainName", label: "Domain", width: 130 },
  { key: "skill", label: "Skill", width: undefined },
  {
    key: "demandPct",
    label: "Demand %",
    width: 80,
    render: (val: number) => (val != null ? `${Math.round(val)}%` : "Not available"),
  },
  {
    key: "inCurriculum",
    label: "In curriculum?",
    width: 110,
    render: (val: boolean, _row: SkillGapRow) => (
      <Badge
        label={val ? "Covered" : "Gap"}
        variant={val ? "success" : "warning"}
        size="sm"
      />
    ),
  },
];

export function SkillsGapScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [isUniversity, setIsUniversity] = useState(false);
  const [gaps, setGaps] = useState<DataState<SkillGapRow[]>>({
    status: "pending",
    data: null,
  });

  useEffect(() => {
    let active = true;
    getEducatorProfile(user?.id).then((profile) => {
      if (active) setIsUniversity(adminAudienceForProfile(profile) === "university");
    });
    adminData.getSkillsGapReport().then((d) => {
      if (active) setGaps(d);
    });
    return () => {
      active = false;
    };
  }, [user?.id]);

  return (
    <AdminShell title="Skills Gap" eyebrow="Aggregate intelligence">
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.bg }}
        contentContainerStyle={[styles.scroll, webContainer as object]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, CompassFonts.displayBold, { color: colors.text }]}>
            Per-programme skill coverage
          </Text>
          <Text style={[styles.lede, { color: colors.textMuted }]}>
            Review skill coverage for each university programme. This surface
            stays unavailable until both curriculum evidence and demand data
            exist; it does not infer a gap from a generic domain skill list.
          </Text>
          {!isUniversity ? (
            <ComingSoonPanel
              state={{ status: "coming_soon", data: null, meta: { notice: "Programme skill coverage is for university curriculum teams." } }}
              empty={() => true}
              emptyTitle="Not part of this workspace"
              emptyBody="School and tutorial teams should use learner guidance and teaching workflows instead."
            >
              {() => null}
            </ComingSoonPanel>
          ) : (
            <ComingSoonPanel
              state={gaps}
              empty={(rows) => rows.length === 0}
              emptyTitle="No programme coverage data yet"
              emptyBody="Coverage appears after programme curriculum and market-demand data are loaded."
            >
              {(rows) => <AdminDataTable columns={COLUMNS} data={rows} />}
            </ComingSoonPanel>
          )}
        </View>
      </ScrollView>
    </AdminShell>
  );
}

export default SkillsGapScreen;

const styles = StyleSheet.create({
  scroll: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xl,
    flexGrow: 1,
  },
  section: { gap: Spacing.md },
  sectionTitle: { fontSize: FontSize.lg },
  lede: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
  },
});
