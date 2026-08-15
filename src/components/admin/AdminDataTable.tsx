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
      <View style={[styles.empty, { borderColor: colors.borderRole.subtle }]}>
        <Text style={[styles.emptyText, { color: colors.textRole.muted }]}>
          No data to display.
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle },
      ]}
    >
      {/* Header */}
      <View style={[styles.headerRow, { borderBottomColor: colors.borderRole.subtle }]}>
        {columns.map((col) => (
          <Text
            key={col.key}
            style={[
              styles.headerCell,
              { color: colors.textRole.muted },
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
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderBottomColor: colors.borderRole.subtle,
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
                ? renderCellValue(col.render(row[col.key], row), colors)
                : (
                  <Text
                    style={[styles.cellText, { color: colors.textRole.primary }]}
                    numberOfLines={2}
                  >
                    {row[col.key] != null ? String(row[col.key]) : "Not available"}
                  </Text>
                )}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

/** React Native <View> cannot contain a raw string/number. Custom column
 * renderers are allowed to return primitives for convenience, so normalize
 * those values at the table boundary and keep elements untouched. */
function renderCellValue(
  value: ReactNode,
  colors: ReturnType<typeof useTheme>["colors"],
): ReactNode {
  return typeof value === "string" || typeof value === "number"
    ? <Text style={[styles.cellText, { color: colors.textRole.primary }]} numberOfLines={2}>{String(value)}</Text>
    : value;
}

export default AdminDataTable;

const styles = StyleSheet.create({
  container: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.sm,
  },
  headerCell: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    textTransform: "uppercase",
    letterSpacing: 0.8,
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
    fontWeight: FontWeight.medium,
  },
  empty: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.xl,
    alignItems: "center",
  },
  emptyText: {
    fontSize: FontSize.sm,
  },
});
