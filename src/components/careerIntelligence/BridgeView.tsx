/**
 * BridgeView — the honest 6-layer bridge UX (Model 5).
 *
 * Renders a (start → destination) plan as the fixed, ordered set of bridge
 * layers: Global standard → Nigerian qualification map → Bridge inventory →
 * Timeline & cost → Nigerian employer entry point → Ownership path.
 *
 * The six layer TITLES are the model's spine (structure, not data), so they
 * always render — that's how the app communicates what a bridge will cover.
 * Layer BODIES come from the BridgePlan; until a plan is populated each layer
 * shows an honest "being populated" line rather than any invented content.
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  FontWeight,
  Brand,
} from "../../theme";
import {
  BRIDGE_LAYER_ORDER,
  type BridgePlan,
  type BridgeLayer,
} from "../../types/career";

export interface BridgeViewProps {
  /** Populated plan, when available. When omitted, the canonical layer
   *  outline renders with "being populated" bodies. */
  plan?: BridgePlan | null;
  /** Optional intro line above the layers. */
  caption?: string;
}

export function BridgeView({ plan, caption }: BridgeViewProps) {
  const { colors } = useTheme();

  // Index any populated layers by key so we can render in the fixed order.
  const byKey = new Map<string, BridgeLayer>();
  for (const l of plan?.layers ?? []) byKey.set(l.key, l);

  return (
    <View style={{ gap: Spacing.md }}>
      {caption ? (
        <Text style={[styles.caption, { color: colors.textSoft }]}>
          {caption}
        </Text>
      ) : null}

      {plan?.from && plan?.to ? (
        <View
          style={[
            styles.routeRow,
            { backgroundColor: colors.bgSecondary, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.routeText, { color: colors.text }]}>
            {plan.from} → {plan.to}
          </Text>
        </View>
      ) : null}

      {BRIDGE_LAYER_ORDER.map((spec, i) => {
        const layer = byKey.get(spec.key);
        return (
          <View
            key={spec.key}
            style={[
              styles.layer,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.layerHead}>
              <View
                style={[styles.step, { backgroundColor: colors.goldSoft }]}
              >
                <Text style={[styles.stepText, { color: Brand.primaryDeep }]}>
                  {i + 1}
                </Text>
              </View>
              <Text style={[styles.layerTitle, { color: colors.text }]}>
                {layer?.title ?? spec.title}
              </Text>
            </View>

            {layer?.body ? (
              <Text style={[styles.layerBody, { color: colors.textSoft }]}>
                {layer.body}
              </Text>
            ) : layer?.items?.length ? null : (
              <Text style={[styles.pending, { color: colors.textMuted }]}>
                🕐 Being populated
              </Text>
            )}

            {layer?.items?.length ? (
              <View style={styles.items}>
                {layer.items.map((it, j) => (
                  <Text
                    key={j}
                    style={[styles.item, { color: colors.textSoft }]}
                  >
                    • {it}
                  </Text>
                ))}
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

export default BridgeView;

const styles = StyleSheet.create({
  caption: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
  },
  routeRow: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  routeText: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  layer: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  layerHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  step: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  stepText: { fontSize: FontSize.sm, fontWeight: FontWeight.black },
  layerTitle: { flex: 1, fontSize: FontSize.md, fontWeight: FontWeight.bold },
  layerBody: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
    marginTop: 2,
  },
  pending: { fontSize: FontSize.sm, fontStyle: "italic", marginTop: 2 },
  items: { gap: 3, marginTop: 2 },
  item: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
});
