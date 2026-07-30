/**
 * RemoteScreen — remote-eligibility analysis for the institution's domains.
 * Pulls adminData.getRoleDemand() filtered by remote percentage, rendering
 * in an AdminDataTable.
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
import type { DataState } from "../../types/career";
import type { RoleDemandRow } from "../../types/institution";
import { AdminShell } from "./AdminShell";
import { ComingSoonPanel } from "./ComingSoonPanel";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import type { ColumnDef } from "@/components/admin/AdminDataTable";

const COLUMNS: ColumnDef[] = [
  { key: "roleName", label: "Role", width: undefined },
  { key: "domainName", label: "Domain", width: 130 },
  {
    key: "remotePct",
    label: "Remote %",
    width: 90,
    render: (val: number) => (val != null ? `${Math.round(val)}%` : "—"),
  },
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
    key: "salary",
    label: "Salary range",
    width: 130,
    render: (_: any, row: RoleDemandRow) => {
      if (row.salaryMin != null && row.salaryMax != null) {
        return `₦${(row.salaryMin / 1000).toFixed(0)}k-₦${(row.salaryMax / 1000).toFixed(0)}k`;
      }
      return "—";
    },
  },
];

export function RemoteScreen() {
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
    <AdminShell title="Remote Eligibility" eyebrow="Aggregate intelligence">
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.bg }}
        contentContainerStyle={[styles.scroll, webContainer as object]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, CompassFonts.displayBold, { color: colors.text }]}>
            Remote-eligibility analysis
          </Text>
          <Text style={[styles.lede, { color: colors.textMuted }]}>
            What share of the roles your programmes unlock can be worked remotely
            — including globally remote opportunities.
          </Text>
          <ComingSoonPanel
            state={roles}
            empty={(rows) => rows.length === 0}
            emptyTitle="No remote data yet"
            emptyBody="Remote-eligibility analysis is being populated."
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

export default RemoteScreen;

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