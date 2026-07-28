/**
 * RoleDemandScreen — role-level demand ranking across the institution's domains.
 * Pulls adminData.getRoleDemand and renders an AdminDataTable with columns:
 * role name, domain, NG postings, global postings, NG remote %, salary range,
 * trend, and the market quadrant (volume x value).
 */
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import {
  useTheme,
  Spacing,
  FontSize,
  CompassFonts,
  webContainer,
} from "../../theme";
import { adminData } from "../../lib/adminData";
import type { DataState } from "../../types/career";
import type { RoleDemandRow } from "../../types/institution";
import { AdminShell } from "./AdminShell";
import { ComingSoonPanel } from "./ComingSoonPanel";
import { AdminDataTable } from "../../components/admin/AdminDataTable";
import type { ColumnDef } from "../../components/admin/AdminDataTable";

function formatSalary(row: RoleDemandRow): string {
  if (row.salaryMin != null && row.salaryMax != null) {
    return `₦${(row.salaryMin / 1000).toFixed(0)}k-₦${(row.salaryMax / 1000).toFixed(0)}k`;
  }
  if (row.salaryMin != null) {
    return `From ₦${(row.salaryMin / 1000).toFixed(0)}k`;
  }
  if (row.salaryMax != null) {
    return `Up to ₦${(row.salaryMax / 1000).toFixed(0)}k`;
  }
  return "—";
}

function marketLabel(row: RoleDemandRow): string {
  if (row.interpretation) return row.interpretation;
  switch (row.quadrant) {
    case "high_demand_high_value":
      return "Broad demand, strong upside";
    case "high_demand_lower_value":
      return "Broad entry, lower ceiling";
    case "low_demand_high_value":
      return "Elite pathway, selective entry";
    case "low_demand_low_value":
      return "Limited signal";
    case "emerging_high_growth":
      return "Growing fast";
    default:
      return "Insufficient data";
  }
}

const COLUMNS: ColumnDef[] = [
  { key: "roleName", label: "Role", width: undefined },
  { key: "domainName", label: "Domain", width: 120 },
  {
    key: "ngPostings",
    label: "NG postings",
    width: 90,
    render: (val: number) => (val != null ? val.toLocaleString() : "—"),
  },
  {
    key: "globalPostings",
    label: "Global",
    width: 90,
    render: (val: number) => (val != null ? val.toLocaleString() : "—"),
  },
  {
    key: "remotePct",
    label: "NG remote %",
    width: 80,
    render: (val: number) => (val != null ? `${Math.round(val)}%` : "—"),
  },
  {
    key: "salary",
    label: "Salary range",
    width: 130,
    render: (_: any, row: RoleDemandRow) => formatSalary(row),
  },
  {
    key: "trendPct",
    label: "Trend",
    width: 70,
    render: (val: number) => (val != null ? `${val >= 0 ? "+" : ""}${val}%` : "—"),
  },
  {
    key: "market",
    label: "Market signal",
    width: 170,
    render: (_: any, row: RoleDemandRow) => marketLabel(row),
  },
];

export function RoleDemandScreen() {
  const { colors } = useTheme();
  const [roles, setRoles] = useState<DataState<RoleDemandRow[]>>({
    status: "pending",
    data: null,
  });

  useEffect(() => {
    let active = true;
    adminData.getRoleDemand().then((d) => {
      if (active) setRoles(d);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <AdminShell title="Role Demand" eyebrow="Aggregate intelligence">
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.bg }}
        contentContainerStyle={[styles.scroll, webContainer as object]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, CompassFonts.displayBold, { color: colors.text }]}>
            Role-level demand
          </Text>
          <Text style={[styles.lede, { color: colors.textMuted }]}>
            The specific roles employers are hiring for across the domains your
            programmes reach. Volume is shown beside value so selective,
            high-upside roles are not misread as weak opportunities.
          </Text>
          <ComingSoonPanel
            state={roles}
            empty={(rows) => rows.length === 0}
            emptyTitle="No roles yet"
            emptyBody="Role demand appears here once populated."
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

export default RoleDemandScreen;

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
