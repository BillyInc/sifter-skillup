/**
 * MetricTooltip — wraps a value with a tooltip icon that shows explanatory text
 * on press. Common pattern across admin dashboards: a stat or metric with a
 * question-mark icon revealing what the number actually means.
 */
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from "react-native";
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  FontWeight,
  Shadow,
} from "../../theme";

export interface MetricTooltipProps {
  value: string | number;
  label: string;
  tooltip: string;
}

export function MetricTooltip({ value, label, tooltip }: MetricTooltipProps) {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <View style={[styles.iconWrap, { backgroundColor: colors.bgSecondary }]}>
          <Text style={[styles.icon, { color: colors.textMuted }]}>?</Text>
        </View>
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <View
            style={[
              styles.tooltipCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
              Shadow.md,
            ]}
          >
            <Text style={[styles.tooltipTitle, { color: colors.text }]}>
              {label}
            </Text>
            <Text style={[styles.tooltipBody, { color: colors.textSoft }]}>
              {tooltip}
            </Text>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

export default MetricTooltip;

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  value: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.black,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  iconWrap: {
    width: 18,
    height: 18,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 11,
    fontWeight: FontWeight.black,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xxl,
  },
  tooltipCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    maxWidth: 320,
    width: "100%",
    gap: 6,
  },
  tooltipTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.heavy,
  },
  tooltipBody: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.6,
  },
});