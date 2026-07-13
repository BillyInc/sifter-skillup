/**
 * CoachMark — a one-time, first-run tip overlay.
 *
 * Wraps its children and, the first time they're seen, floats a dismissible
 * tip bubble above them. Dismissal is persisted in AsyncStorage under
 * `storageKey`, so the tip never shows again on that device. Tap anywhere on
 * the bubble (or its backdrop) to dismiss.
 *
 *   <CoachMark storageKey="@sifter_coach_explore_v1" text="Tap a card to explore.">
 *     <ExploreGrid />
 *   </CoachMark>
 */
import React, { useEffect, useState, type ReactNode } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme, Spacing, FontSize, Radius, Shadow } from "../../theme";

export interface CoachMarkProps {
  /** Unique AsyncStorage key — once dismissed under this key, never shows again. */
  storageKey: string;
  /** The tip text. */
  text: string;
  children: ReactNode;
}

export function CoachMark({ storageKey, text, children }: CoachMarkProps) {
  const { colors } = useTheme();
  // null = still checking storage; true/false = resolved visibility.
  const [show, setShow] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(storageKey)
      .then((seen) => {
        if (active) setShow(seen ? false : true);
      })
      .catch(() => {
        if (active) setShow(false);
      });
    return () => {
      active = false;
    };
  }, [storageKey]);

  const dismiss = () => {
    setShow(false);
    AsyncStorage.setItem(storageKey, "1").catch(() => {});
  };

  return (
    <View style={styles.wrap}>
      {children}

      {show === null ? (
        <View style={styles.loading} pointerEvents="none">
          <ActivityIndicator size="small" color={colors.textMuted} />
        </View>
      ) : null}

      {show ? (
        <Pressable
          style={[styles.overlay, { backgroundColor: colors.overlay }]}
          onPress={dismiss}
          accessibilityRole="button"
          accessibilityLabel="Dismiss tip"
        >
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
            <Text style={[styles.tipLabel, { color: colors.accent }]}>
              💡 Tip
            </Text>
            <Text style={[styles.tipText, { color: colors.text }]}>{text}</Text>
            <Text style={[styles.dismiss, { color: colors.textMuted }]}>
              Tap anywhere to dismiss
            </Text>
          </View>
        </Pressable>
      ) : null}
    </View>
  );
}

export default CoachMark;

const styles = StyleSheet.create({
  wrap: { position: "relative" },
  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
    zIndex: 20,
  },
  bubble: {
    maxWidth: 320,
    width: "100%",
    borderWidth: 1,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  tipLabel: { fontSize: FontSize.xs, fontWeight: "800", letterSpacing: 0.5 },
  tipText: { fontSize: FontSize.md, fontWeight: "700", lineHeight: FontSize.md * 1.45 },
  dismiss: { fontSize: FontSize.xs, fontWeight: "600", paddingTop: Spacing.xs },
});
