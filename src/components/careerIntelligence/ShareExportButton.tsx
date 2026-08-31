import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme, FontSize } from "../../theme";
import { SifterButton } from "../ui";
import { shareStudentDocument } from "../../lib/provisioningData";
import { hasInternetConnection } from "../../lib/networkState";

export interface ShareExportButtonProps {
  documentPath: string;
  fileName?: string;
  title?: string;
}

/**
 * Shares an authenticated report through the device/browser share sheet.
 * The sheet exposes installed targets such as email, WhatsApp, Drive, and
 * Dropbox without making the app depend on any one provider's SDK.
 */
export function ShareExportButton({
  documentPath,
  fileName = "sifter-guidance-report.html",
  title = "Share report",
}: ShareExportButtonProps) {
  const { colors } = useTheme();
  const [hint, setHint] = useState<string | null>(null);

  const onPress = async () => {
    if (!(await hasInternetConnection())) {
      setHint("Sharing and downloads are available when you are online.");
      return;
    }
    void shareStudentDocument(documentPath, fileName, "Sifter LevelUp guidance report").then((shared) => {
      if (!shared) setHint("The share sheet was unavailable. The report can still be downloaded or printed.");
    });
  };

  return (
    <View style={styles.wrap}>
      <SifterButton
        label={title}
        icon="share-2"
         onPress={() => { void onPress(); }}
        variant="ghost"
        size="sm"
        fullWidth={false}
      />
      {hint ? <Text style={[styles.hint, { color: colors.textMuted }]}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 4, alignItems: "flex-start" },
  hint: { fontSize: FontSize.xs, fontWeight: "600", maxWidth: 240 },
});

export default ShareExportButton;
