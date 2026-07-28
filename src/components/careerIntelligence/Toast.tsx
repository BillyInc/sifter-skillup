import React, { useCallback, useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import {
  FontSize,
  FontWeight,
  Radius,
  Spacing,
  useTheme,
} from "../../theme";

// ── Toast types ────────────────────────────────────────────────

export type ToastVariant = "celebration" | "info" | "error" | "warning";

// ── Toast state (singleton) ────────────────────────────────────

let _showToast: ((msg: string, variant: ToastVariant, duration?: number) => void) | null = null;

/** Programmatic toast — call from anywhere with a reference to the provider. */
export function showToast(msg: string, variant: ToastVariant = "info", duration = 3000) {
  _showToast?.(msg, variant, duration);
}

// ── Helpers ────────────────────────────────────────────────────

function toastPalette(
  variant: ToastVariant,
  colors: ReturnType<typeof useTheme>["colors"],
) {
  switch (variant) {
    case "celebration":
      return { icon: "award" as const, bg: colors.apricotWash, border: `${colors.apricot}40`, text: colors.apricot };
    case "info":
      return { icon: "info" as const, bg: colors.accentRole.status + "12", border: `${colors.accentRole.status}30`, text: colors.accentRole.status };
    case "error":
      return { icon: "alert-circle" as const, bg: colors.dangerSoft, border: `${colors.danger}30`, text: colors.danger };
    case "warning":
      return { icon: "alert-triangle" as const, bg: colors.warningSoft, border: `${colors.warning}30`, text: colors.warning };
  }
}

// ── Toast Provider (wrap root) ─────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  const [visible, setVisible] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [variant, setVariant] = React.useState<ToastVariant>("info");
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-12)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: -12, duration: 200, useNativeDriver: true }),
    ]).start(() => setVisible(false));
  }, [opacity, translateY]);

  const show = useCallback(
    (msg: string, v: ToastVariant = "info", duration = 3000) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setMessage(msg);
      setVariant(v);
      setVisible(true);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
      timerRef.current = setTimeout(hide, duration);
    },
    [hide, opacity, translateY],
  );

  useEffect(() => {
    _showToast = show;
    return () => {
      _showToast = null;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [show]);

  if (!visible) return <>{children}</>;

  const p = toastPalette(variant, colors);

  return (
    <>
      {children}
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.toastWrapper,
          { opacity, transform: [{ translateY }] },
        ]}
      >
        <View
          style={[
            styles.toast,
            { backgroundColor: p.bg, borderColor: p.border },
          ]}
        >
          <Feather name={p.icon} size={16} color={p.text} />
          <Text style={[styles.toastText, { color: p.text }]} numberOfLines={2}>
            {message}
          </Text>
          <TouchableOpacity activeOpacity={0.7} onPress={hide} hitSlop={8}>
            <Feather name="x" size={14} color={p.text} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </>
  );
}

// ── Inline Toast (for embedding in screens) ────────────────────

export function Toast({
  message,
  variant = "info",
  onDismiss,
  style,
}: {
  message: string;
  variant?: ToastVariant;
  onDismiss?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  const p = toastPalette(variant, colors);

  return (
    <View
      style={[
        styles.toast,
        { backgroundColor: p.bg, borderColor: p.border },
        style,
      ]}
    >
      <Feather name={p.icon} size={16} color={p.text} />
      <Text style={[styles.toastText, { color: p.text }]} numberOfLines={2}>
        {message}
      </Text>
      {onDismiss ? (
        <TouchableOpacity activeOpacity={0.7} onPress={onDismiss} hitSlop={8}>
          <Feather name="x" size={14} color={p.text} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  toastWrapper: {
    position: "absolute",
    top: Platform.OS === "web" ? 20 : 60,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    maxWidth: 420,
    width: "100%",
    elevation: 4,
  },
  toastText: {
    flex: 1,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
});
