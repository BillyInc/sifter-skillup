/**
 * RoleDemandScreen — role-level demand ranking across the institution's domains.
 * Pulls adminData.getRoleDemand (a `coming_soon` envelope this phase) and lets
 * ComingSoonPanel branch the state — no fabricated figures.
 */
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useTheme, Spacing, FontSize, FontWeight, webContainer } from "../../theme";
import { adminData } from "../../lib/adminData";
import type { DataState } from "../../types/career";
import type { RoleDemandRow } from "../../types/institution";
import { AdminShell } from "./AdminShell";
import { ComingSoonPanel } from "./ComingSoonPanel";

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
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Role-level demand
          </Text>
          <Text style={[styles.lede, { color: colors.textMuted }]}>
            The specific roles employers are hiring for across the domains your
            programmes reach, ranked by posting volume.
          </Text>
          <ComingSoonPanel
            state={roles}
            empty={(rows) => rows.length === 0}
            emptyTitle="No roles yet"
            emptyBody="Role demand appears here once populated."
          >
            {() => null}
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
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.black },
  lede: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
    marginTop: -Spacing.xs,
  },
});
