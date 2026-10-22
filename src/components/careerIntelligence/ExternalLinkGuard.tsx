import React, { useMemo, useState, type ReactNode } from "react";
import { Linking, Modal, StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import { CompassFonts, FontSize, Radius, Spacing, useTheme } from "@/theme";
import { studentSafeUrl } from "@/lib/studentCareerBoundary";
import { RouteButton } from "./RouteButton";

type ExternalLinkGuardProps = {
  url?: string | null;
  label: string;
  accessibilityLabel?: string;
  description?: string | null;
  /** Admin/audit may open retained source URLs; student guidance may not. */
  audience?: "student" | "admin";
  controlRole?: "link" | "button";
  disabled?: boolean;
  hideUnavailable?: boolean;
  icon?: ReactNode;
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
export function ExternalLinkGuard({ url, label, accessibilityLabel, description, audience = "student", controlRole = "link", disabled, hideUnavailable = false, icon, style, textStyle }: ExternalLinkGuardProps) {
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
  if (!destination) return hideUnavailable ? null : <Text style={[styles.unavailable, { color: colors.textRole.muted }, textStyle]}>No verified link is available yet.</Text>;
  return <>
    <RouteButton accessibilityRole={controlRole} accessibilityLabel={accessibilityLabel ?? label} disabled={disabled} onPress={() => { setError(null); setOpen(true); }} variant="secondary" icon={icon} style={style}>
      <Text style={[styles.link, { color: colors.accentRole.action }, textStyle]}>{label}</Text>
    </RouteButton>
    <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
      <View style={styles.backdrop}>
        <View style={[styles.dialog, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
          <Text style={[styles.eyebrow, { color: colors.textRole.muted }]}>External link</Text>
          <Text style={[styles.title, { color: colors.textRole.primary }, CompassFonts.displayBold]}>You’re leaving Sifter LevelUp</Text>
          <Text style={[styles.copy, { color: colors.textRole.secondary }]}>{description || `This opens a source or learning page for ${label.toLowerCase()}.`}</Text>
          <View style={[styles.destination, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}>
            <Text style={[styles.destinationLabel, { color: colors.textRole.muted }]}>YOU’LL OPEN</Text>
            <Text style={[styles.destinationValue, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{hostname || destination}</Text>
          </View>
          {error ? <Text style={[styles.error, { color: colors.textRole.muted }]}>{error}</Text> : null}
          <View style={styles.actions}>
            <RouteButton label="Stay here" variant="secondary" onPress={() => setOpen(false)} style={styles.cancel} />
            <RouteButton label="Open site" variant="primary" onPress={() => { void confirm(); }} style={styles.confirm} />
          </View>
        </View>
      </View>
    </Modal>
  </>;
}

const styles = StyleSheet.create({
  link: { fontSize: 16, lineHeight: 20, fontWeight: "600" }, unavailable: { fontSize: FontSize.md, lineHeight: 18 },
  backdrop: { flex: 1, alignItems: "center", justifyContent: "center", padding: Spacing.lg, backgroundColor: "rgba(11, 18, 32, 0.52)" },
  dialog: { width: "100%", maxWidth: 440, borderWidth: 1, borderRadius: Radius.lg, padding: Spacing.lg, gap: Spacing.md },
  eyebrow: { fontSize: FontSize.md, lineHeight: 18, fontWeight: "600" }, title: { fontSize: FontSize.xl, lineHeight: FontSize.xl * 1.15 }, copy: { fontSize: 16, lineHeight: 24 },
  destination: { borderWidth: 1, borderRadius: Radius.sm, padding: Spacing.sm, gap: 3 }, destinationLabel: { fontSize: FontSize.md, lineHeight: 18, fontWeight: "600" }, destinationValue: { fontSize: 16, lineHeight: 22 }, error: { fontSize: FontSize.md, lineHeight: 18 },
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: Spacing.sm }, cancel: { minHeight: 44 }, confirm: { minHeight: 44 },
});

export default ExternalLinkGuard;
