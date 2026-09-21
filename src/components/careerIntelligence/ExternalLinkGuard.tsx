import React, { useMemo, useState } from "react";
import { Linking, Modal, StyleSheet, Text, TouchableOpacity, View, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import { CompassFonts, FontSize, Radius, Spacing, useTheme } from "@/theme";
import { studentSafeUrl } from "@/lib/studentCareerBoundary";

type ExternalLinkGuardProps = {
  url?: string | null;
  label: string;
  description?: string | null;
  /** Admin/audit may open retained source URLs; student guidance may not. */
  audience?: "student" | "admin";
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

function safeExternalUrl(value?: string | null, audience: "student" | "admin" = "student"): string | null {
  if (audience === "student") return studentSafeUrl(value) ?? null;
  if (!value) return null;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}

/** A deliberate hand-off before a student leaves Sifter for a third-party source. */
export function ExternalLinkGuard({ url, label, description, audience = "student", disabled, style, textStyle }: ExternalLinkGuardProps) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const destination = useMemo(() => safeExternalUrl(url, audience), [audience, url]);
  const hostname = useMemo(() => {
    if (!destination) return null;
    try { return new URL(destination).hostname.replace(/^www\./, ""); } catch { return null; }
  }, [destination]);
  const confirm = async () => {
    if (!destination) return;
    setError(null);
    try {
      await Linking.openURL(destination);
      setOpen(false);
    } catch {
      setError("This link could not be opened on this device. Try again later.");
    }
  };
  if (!destination) return <Text style={[styles.unavailable, { color: colors.textRole.muted }, textStyle]}>No verified link is available yet.</Text>;
  return <>
    <TouchableOpacity accessibilityRole="link" disabled={disabled} onPress={() => { setError(null); setOpen(true); }} style={style}>
      <Text style={[styles.link, { color: colors.accentRole.action }, textStyle]}>{label}</Text>
    </TouchableOpacity>
    <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
      <View style={styles.backdrop}>
        <View style={[styles.dialog, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
          <Text style={[styles.eyebrow, { color: colors.textRole.muted }]}>EXTERNAL LINK</Text>
          <Text style={[styles.title, { color: colors.textRole.primary }, CompassFonts.displayBold]}>You’re leaving Sifter LevelUp</Text>
          <Text style={[styles.copy, { color: colors.textRole.secondary }]}>{description || `This opens a source or learning page for ${label.toLowerCase()}.`}</Text>
          <View style={[styles.destination, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}>
            <Text style={[styles.destinationLabel, { color: colors.textRole.muted }]}>YOU’LL OPEN</Text>
            <Text style={[styles.destinationValue, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{hostname || destination}</Text>
          </View>
          {error ? <Text style={[styles.error, { color: colors.textRole.muted }]}>{error}</Text> : null}
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => setOpen(false)} style={[styles.cancel, { borderColor: colors.borderRole.subtle }]}><Text style={[styles.cancelText, { color: colors.textRole.primary }]}>Stay here</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => { void confirm(); }} style={[styles.confirm, { backgroundColor: colors.accentRole.action }]}><Text style={styles.confirmText}>Open site</Text></TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  </>;
}

const styles = StyleSheet.create({
  link: { fontSize: FontSize.sm, fontWeight: "800", textDecorationLine: "underline" }, unavailable: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.4 },
  backdrop: { flex: 1, alignItems: "center", justifyContent: "center", padding: Spacing.lg, backgroundColor: "rgba(11, 18, 32, 0.52)" },
  dialog: { width: "100%", maxWidth: 440, borderWidth: 1, borderRadius: Radius.lg, padding: Spacing.lg, gap: Spacing.md },
  eyebrow: { fontSize: FontSize.xs, fontWeight: "800", letterSpacing: 0.8 }, title: { fontSize: FontSize.xl, lineHeight: FontSize.xl * 1.15 }, copy: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
  destination: { borderWidth: 1, borderRadius: Radius.sm, padding: Spacing.sm, gap: 3 }, destinationLabel: { fontSize: FontSize.xs, fontWeight: "800", letterSpacing: 0.7 }, destinationValue: { fontSize: FontSize.sm }, error: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.4 },
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: Spacing.sm }, cancel: { borderWidth: 1, borderRadius: Radius.sm, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm }, cancelText: { fontSize: FontSize.sm, fontWeight: "800" }, confirm: { borderRadius: Radius.sm, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm }, confirmText: { color: "#fff", fontSize: FontSize.sm, fontWeight: "800" },
});

export default ExternalLinkGuard;
