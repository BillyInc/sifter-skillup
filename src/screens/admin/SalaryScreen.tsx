/**
 * SalaryScreen — salary benchmarks by domain. Pulls adminData.getRoleDemand()
 * filtered to show salary data, rendering in an AdminDataTable with salary columns.
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

const COLUMNS: ColumnDef[] = [
  { key: "roleName", label: "Role", width: undefined },
  { key: "domainName", label: "Domain", width: 130 },
  {
    key: "salary",
    label: "Salary (NGN)",
    width: 130,
    render: (_: any, row: RoleDemandRow) => formatSalary(row),
  },
  {
    key: "ngPostings",
    label: "NG postings",
    width: 90,
    render: (val: number) => (val != null ? val.toLocaleString() : "—"),
  },
];

export function SalaryScreen() {
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
    <AdminShell title="Salary Benchmarks" eyebrow="Aggregate intelligence">
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.bg }}
        contentContainerStyle={[styles.scroll, webContainer as object]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, CompassFonts.displayBold, { color: colors.text }]}>
            Salary benchmarks by domain
          </Text>
          <Text style={[styles.lede, { color: colors.textMuted }]}>
            Entry and mid-level pay ranges for the domains your programmes reach
            — sourced from aggregate market data.
          </Text>
          <ComingSoonPanel
            state={roles}
            empty={(rows) => rows.length === 0}
            emptyTitle="No salary data yet"
            emptyBody="Salary benchmarks by domain are being populated."
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

export default SalaryScreen;

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