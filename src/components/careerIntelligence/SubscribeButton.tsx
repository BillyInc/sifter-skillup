/**
 * SubscribeButton — a "🔔 Subscribe" / "Subscribed" toggle for opportunity,
 * organisation and application-window alerts.
 *
 * Calls careerData.subscribe / unsubscribe. Those methods currently return a
 * `coming_soon` envelope, so the toggle DEGRADES GRACEFULLY: it only flips to
 * the subscribed state when `result.status === 'real'`. Otherwise it surfaces a
 * brief inline "Alerts come online soon" hint and leaves the state untouched.
 */
import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useTheme, Spacing, FontSize } from "../../theme";
import { SifterButton } from "../ui";
import { careerData } from "../../lib/careerData";
import type { SubscriptionTarget } from "../../types/career";

export interface SubscribeButtonProps {
  target: SubscriptionTarget;
  targetId: string;
  /** Initial subscribed state (e.g. from a subscriptions query). */
  subscribed?: boolean;
  onChange?: (subscribed: boolean) => void;
  style?: StyleProp<ViewStyle>;
}

export function SubscribeButton({
  target,
  targetId,
  subscribed: initialSubscribed = false,
  onChange,
  style,
}: SubscribeButtonProps) {
  const { colors } = useTheme();
  const [subscribed, setSubscribed] = useState(initialSubscribed);
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showHint = (msg: string) => {
    setHint(msg);
    if (hintTimer.current) clearTimeout(hintTimer.current);
    hintTimer.current = setTimeout(() => setHint(null), 2600);
  };

  const onPress = async () => {
    if (busy) return;
    setBusy(true);
    setHint(null);
    try {
      const result = subscribed
        ? await careerData.unsubscribe(targetId)
        : await careerData.subscribe(target, targetId);

      if (result.status === "real") {
        const next = !subscribed;
        setSubscribed(next);
        onChange?.(next);
      } else {
        // Not live yet — stay honest, don't flip the subscribed state.
        showHint(result.meta?.notice ?? "Alerts come online soon");
      }
    } catch {
      showHint("Couldn't update alerts just now");
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[styles.wrap, style]}>
      <SifterButton
        label={subscribed ? "Subscribed" : "Subscribe"}
        icon={subscribed ? "🔕" : "🔔"}
        onPress={onPress}
        variant={subscribed ? "track" : "ghost"}
        color={subscribed ? colors.gold : undefined}
        loading={busy}
        size="sm"
        fullWidth={false}
      />
      {hint ? (
        <Text style={[styles.hint, { color: colors.textMuted }]}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 4, alignItems: "flex-start" },
  hint: { fontSize: FontSize.xs, fontWeight: "600", maxWidth: 240 },
});

export default SubscribeButton;
