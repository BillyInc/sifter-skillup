/**
 * InfoTooltip — a small "ⓘ" pressable that reveals a short explanatory
 * popover. Used inline next to labels/metrics across the career-intelligence
 * surfaces to explain a term without leaving the screen.
 *
 * Implemented with a transparent Modal so the bubble floats above everything
 * and dismisses on backdrop press. Theme-driven (useTheme + tokens) so it reads
 * correctly in light and dark mode.
 */
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { useTheme, Spacing, FontSize, Radius, Shadow } from "../../theme";

export interface InfoTooltipProps {
  /** Optional heading shown at the top of the popover. */
  label?: string;
  /** The explanatory body text. */
  text: string;
}

export function InfoTooltip({ label, text }: InfoTooltipProps) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={label ? `More info: ${label}` : "More info"}
        style={[styles.dot, { borderColor: colors.border }]}
      >
        <Text style={[styles.dotText, { color: colors.textMuted }]}>ⓘ</Text>
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setOpen(false)}>
          <View style={[styles.backdrop, { backgroundColor: colors.overlay }]}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View
                style={[
                  styles.bubble,
                  {
                    backgroundColor: colors.cardElevated,
                    borderColor: colors.border,
                  },
                  Shadow.lg,
                ]}
              >
                {label ? (
                  <Text style={[styles.title, { color: colors.text }]}>
                    {label}
                  </Text>
                ) : null}
                <Text style={[styles.body, { color: colors.textSoft }]}>
                  {text}
                </Text>
                <Pressable
                  onPress={() => setOpen(false)}
                  hitSlop={8}
                  style={styles.close}
                >
                  <Text style={[styles.closeText, { color: colors.accent }]}>
                    Got it
                  </Text>
                </Pressable>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

export default InfoTooltip;

const styles = StyleSheet.create({
  dot: {
    width: 18,
    height: 18,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dotText: { fontSize: FontSize.xs, fontWeight: "800", lineHeight: FontSize.md },
  backdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
  },
  bubble: {
    maxWidth: 340,
    width: "100%",
    borderWidth: 1,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  title: { fontSize: FontSize.md, fontWeight: "800" },
  body: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.55 },
  close: { alignSelf: "flex-end", paddingTop: Spacing.xs },
  closeText: { fontSize: FontSize.sm, fontWeight: "800" },
});
