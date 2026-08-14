/**
 * PdfExportButton — a "⤓ Save as PDF" action for career-intelligence views.
 *
 * Behaviour (never throws):
 *  - If `onExport` is provided, it is called and owns the export.
 *  - Else on web (Platform.OS === 'web') it calls window.print(), guarded by a
 *    `typeof window !== 'undefined'` check.
 *  - Else (native) no print/file-system lib is installed, so it DEGRADES
 *    GRACEFULLY: it shows an inline locked export notice instead
 *    of attempting an unavailable native print.
 */
import React, { useRef, useState } from "react";
import {
  View,
  Text,
  Platform,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useTheme, FontSize } from "../../theme";
import { SifterButton } from "../ui";
import { openStudentDocument } from "../../lib/provisioningData";

export interface PdfExportButtonProps {
  title?: string;
  /** Custom export handler. When provided it fully owns the export. */
  onExport?: () => void;
  /** Authenticated document endpoint for the full guidance report. */
  documentPath?: string;
  style?: StyleProp<ViewStyle>;
}

export function PdfExportButton({
  title = "Save as PDF",
  onExport,
  documentPath,
  style,
}: PdfExportButtonProps) {
  const { colors } = useTheme();
  const [hint, setHint] = useState<string | null>(null);
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showHint = (msg: string) => {
    setHint(msg);
    if (hintTimer.current) clearTimeout(hintTimer.current);
    hintTimer.current = setTimeout(() => setHint(null), 3000);
  };

  const onPress = () => {
    if (onExport) {
      onExport();
      return;
    }
    if (documentPath) {
      void openStudentDocument(documentPath).then((opened) => {
        if (!opened) showHint("Create an account and confirm your guidance path before printing.");
      });
      return;
    }
    if (Platform.OS === "web" && typeof window !== "undefined") {
      window.print();
      return;
    }
    // No expo-print / file-system lib installed — be honest on native.
    showHint("PDF export is locked on mobile while the export flow is prepared.");
  };

  return (
    <View style={[styles.wrap, style]}>
      <SifterButton
        label={title}
        icon="⤓"
        onPress={onPress}
        variant="ghost"
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

export default PdfExportButton;
