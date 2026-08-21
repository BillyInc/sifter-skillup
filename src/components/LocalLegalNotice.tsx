import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { FontSize, Radius, Spacing, useTheme } from "../theme";

type Audience = "student" | "institution";

export default function LocalLegalNotice({ audience }: { audience: Audience }) {
  const { colors } = useTheme();
  const text = audience === "student"
    ? "Your class, stream, school and subject choices are used to personalise guidance. They do not determine admission or eligibility. If you are under 18, involve a parent, guardian, school or counsellor before sharing personal or academic information."
    : "Only submit student or institution information you are authorised to handle. For minors, follow the guardian, school safeguarding and data-protection rules applicable in Nigeria and your state; verification does not by itself unlock individual student data.";
  return (
    <View style={[styles.box, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}>
      <Text style={[styles.label, { color: colors.textRole.muted }]}>DATA USE NOTICE</Text>
      <Text style={[styles.text, { color: colors.textRole.secondary }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.xs },
  label: { fontSize: FontSize.xs, fontWeight: "800", letterSpacing: 0.8 },
  text: { fontSize: FontSize.xs, lineHeight: 18 },
});
