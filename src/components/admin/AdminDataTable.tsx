/**
 * AdminDataTable — a reusable column-based table with a header row and data
 * rows, designed for the admin dashboard screens. Supports custom render
 * functions per column and fixed-width columns for alignment.
 */
import React, { type ReactNode } from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  FontWeight,
} from "../../theme";

export interface ColumnDef {
  key: string;
  label: string;
  render?: (val: any, row: any) => ReactNode;
  width?: number;
}

export interface AdminDataTableProps {
  columns: ColumnDef[];
  data: any[];
}

export function AdminDataTable({ columns, data }: AdminDataTableProps) {
  const { colors } = useTheme();

  if (!data || data.length === 0) {
    return (
      <View style={[styles.empty, { borderColor: colors.border }]}>
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
          No data to display.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { borderColor: colors.border }]}>
      {/* Header */}
      <View style={[styles.headerRow, { borderBottomColor: colors.borderDark }]}>
        {columns.map((col) => (
          <Text
            key={col.key}
            style={[
              styles.headerCell,
              { color: colors.textMuted },
              col.width ? { width: col.width } : styles.flexCell,
            ]}
            numberOfLines={1}
          >
            {col.label}
          </Text>
        ))}
      </View>

      {/* Data rows */}
      {data.map((row, ri) => (
        <View
          key={row.id ?? ri}
          style={[
            styles.dataRow,
            ri < data.length - 1 && {
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            },
          ]}
        >
          {columns.map((col) => (
            <View
              key={col.key}
              style={[
                styles.dataCell,
                col.width ? { width: col.width } : styles.flexCell,
              ]}
            >
              {col.render
                ? col.render(row[col.key], row)
                : (
                  <Text
                    style={[styles.cellText, { color: colors.text }]}
                    numberOfLines={2}
                  >
                    {row[col.key] != null ? String(row[col.key]) : "—"}
                  </Text>
                )}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

export default AdminDataTable;

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 2,
    gap: Spacing.sm,
  },
  headerCell: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dataRow: {
    flexDirection: "row",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    alignItems: "center",
  },
  dataCell: {
    minHeight: 24,
    justifyContent: "center",
  },
  flexCell: {
    flex: 1,
  },
  cellText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  empty: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: "center",
  },
  emptyText: {
    fontSize: FontSize.sm,
  },
});