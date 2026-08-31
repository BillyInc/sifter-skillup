/**
 * SaveButton — a bookmark toggle for any career-intelligence entity.
 *
 * Calls careerData.saveItem / removeSavedItem. Because those methods currently
 * return a `coming_soon` envelope, the toggle DEGRADES GRACEFULLY: it only
 * reflects a real saved state when `result.status === 'real'`. Otherwise it
 * surfaces a brief transient "Saving comes online soon" hint and does NOT claim
 * the item was saved.
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { useTheme, Spacing, Radius, FontSize } from "../../theme";
import { Spring, useReducedMotion } from "../../theme/motion";
import { careerData } from "../../lib/careerData";
import type { SavedEntityType } from "../../types/career";
import { useAuth } from "../../hooks/useAuth";

export interface SaveButtonProps {
  entityType: SavedEntityType;
  entityId: string;
  label?: string;
  /** Initial saved state (e.g. from a list query). */
  saved?: boolean;
  onChange?: (saved: boolean) => void;
  /** Icon-only rendering for dense rows. */
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function SaveButton({
  entityType,
  entityId,
  label,
  saved: initialSaved = false,
  onChange,
  compact = false,
  style,
}: SaveButtonProps) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const isGuest = !user || user.auth_provider === "guest";
  const reduced = useReducedMotion();
  const [saved, setSaved] = useState(initialSaved);
  const [savedItemId, setSavedItemId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isGuest) return;
    let active = true;
    void careerData.getSavedItems().then((result) => {
      if (!active || result.status !== "real" || !result.data) return;
      const match = result.data.find((item) => item.entityType === entityType && item.entityId === entityId);
      setSaved(Boolean(match));
      setSavedItemId(match?.id ?? null);
    });
    return () => {
      active = false;
    };
  }, [entityId, entityType, isGuest]);

  const pop = useCallback(() => {
    if (reduced) return;
    scale.value = withSequence(
      withSpring(0.9, Spring.press),
      withSpring(1.15, Spring.arrive),
      withSpring(1, Spring.press),
    );
  }, [reduced, scale]);

  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const showHint = (msg: string) => {
    setHint(msg);
    if (hintTimer.current) clearTimeout(hintTimer.current);
    hintTimer.current = setTimeout(() => setHint(null), 2600);
  };

  const onPress = async () => {
    if (busy) return;
    if (isGuest) {
      showHint("Create an account to save this item.");
      return;
    }
    pop();
    setBusy(true);
    setHint(null);
    try {
      if (saved && !savedItemId) {
        showHint("Could not identify this saved item yet. Try again.");
        return;
      }
      const result = saved
        ? await careerData.removeSavedItem(savedItemId as string)
        : await careerData.saveItem(entityType, entityId, label);

      if (result.status === "real" || result.status === "pending") {
        const next = !saved;
        setSaved(next);
        setSavedItemId(next && result.data && "id" in result.data ? result.data.id : next ? `local_${entityType}_${entityId}` : null);
        onChange?.(next);
        if (result.status === "pending") {
          showHint(result.meta?.notice ?? "Saved on this device; it will sync when you reconnect.");
        }
      } else {
        showHint(result.meta?.notice ?? "Saving comes online soon");
      }
    } catch {
      showHint("Couldn't save just now");
    } finally {
      setBusy(false);
    }
  };

  const text = saved ? "Saved" : "Save";

  return (
    <View style={[styles.wrap, style]}>
      <Animated.View style={btnStyle}>
        <TouchableOpacity
          onPress={onPress}
          disabled={busy}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={saved ? "Remove from saved" : "Save item"}
          accessibilityState={{ busy, selected: saved }}
          style={[
            styles.btn,
            compact ? styles.btnCompact : styles.btnFull,
            {
              backgroundColor: saved ? colors.accentSoft : colors.surface.raised,
              borderColor: saved ? colors.accentRole.action : colors.borderRole.subtle,
              opacity: busy ? 0.6 : 1,
            },
          ]}
        >
          {busy ? (
            <ActivityIndicator size="small" color={colors.textRole.secondary} />
          ) : (
            <Feather
              name={saved ? "bookmark" : "bookmark"}
              size={compact ? 16 : 15}
              color={saved ? colors.accentRole.action : colors.textRole.secondary}
            />
          )}
          {!compact && (
            <Text
              style={[
                styles.label,
                { color: saved ? colors.accentRole.action : colors.textRole.secondary },
              ]}
            >
              {text}
            </Text>
          )}
        </TouchableOpacity>
      </Animated.View>

      {hint ? (
        <Text style={[styles.hint, { color: colors.textRole.muted }]}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 4, alignItems: "flex-start" },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.full,
    minHeight: 44,
  },
  btnFull: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm },
  btnCompact: { width: 44, height: 44, borderRadius: Radius.full },
  label: { fontSize: FontSize.sm, fontWeight: "600" },
  hint: { fontSize: FontSize.xs, fontWeight: "600", maxWidth: 220 },
});

export default SaveButton;
