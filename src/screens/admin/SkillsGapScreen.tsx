/**
 * SkillsGapScreen — cross-programme skills-gap report (curriculum vs employer
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

const COLUMNS: ColumnDef[] = [
  { key: "programmeName", label: "Programme", width: undefined },
  { key: "domainName", label: "Domain", width: 130 },
  { key: "skill", label: "Skill", width: undefined },
  {
    key: "demandPct",
    label: "Demand %",
    width: 80,
    render: (val: number) => (val != null ? `${Math.round(val)}%` : "—"),
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
  const [gaps, setGaps] = useState<DataState<SkillGapRow[]>>({
    status: "pending",
    data: null,
  });

  useEffect(() => {
    let active = true;
    adminData.getSkillsGapReport().then((d) => {
      if (active) setGaps(d);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <AdminShell title="Skills Gap" eyebrow="Aggregate intelligence">
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.bg }}
        contentContainerStyle={[styles.scroll, webContainer as object]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, CompassFonts.displayBold, { color: colors.text }]}>
            Cross-programme skills gap
          </Text>
          <Text style={[styles.lede, { color: colors.textMuted }]}>
            Skills employers demand that the standard curriculum does not yet
            cover — surfaced per programme and domain.
          </Text>
          <ComingSoonPanel
            state={gaps}
            empty={(rows) => rows.length === 0}
            emptyTitle="No gaps yet"
            emptyBody="The skills-gap report appears here once populated."
          >
            {(rows) => (
              <AdminDataTable columns={COLUMNS} data={rows} />
            )}
          </ComingSoonPanel>
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