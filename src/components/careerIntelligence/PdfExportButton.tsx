/**
 * PdfExportButton — a "⤓ Save as PDF" action for career-intelligence views.
 *
 * Behaviour (never throws):
 *  - If `onExport` is provided, it is called and owns the export.
 *  - A report endpoint is required for the export action. The catalogue never
 *    prints its current component tree, which would create a convenient
 *    component-level copy path.
 *  - Else (native) no print/file-system lib is installed, so it DEGRADES
 *    GRACEFULLY: it shows an inline locked export notice instead
 *    of attempting an unavailable native print.
 */
import React, { useRef, useState } from "react";
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme, FontSize } from "../../theme";
import { openStudentDocument } from "../../lib/provisioningData";
import { hasInternetConnection } from "../../lib/networkState";

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

  const onPress = async () => {
    if (!(await hasInternetConnection())) {
      showHint("Printing and downloads are available when you are online.");
      return;
    }
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
    // Fail closed when a screen has not supplied the authenticated report
    // endpoint; never fall back to printing the live catalogue surface.
    showHint("The full online report is not available from this screen yet.");
  };

  return (
    <View style={[styles.wrap, style]}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityHint="Print or save this report"
        onPress={() => { void onPress(); }}
        style={[styles.iconButton, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}
      >
        <Feather name="printer" size={18} color={colors.textRole.primary} />
      </TouchableOpacity>
      {hint ? (
        <Text style={[styles.hint, { color: colors.textMuted }]}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 4, alignItems: "flex-start" },
  iconButton: { width: 38, height: 38, borderWidth: 1, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  hint: { fontSize: FontSize.xs, fontWeight: "600", maxWidth: 240 },
});

export default PdfExportButton;
