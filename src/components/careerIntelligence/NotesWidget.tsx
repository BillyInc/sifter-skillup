/**
 * NotesWidget — a small "My notes" panel for any career-intelligence entity.
 *
 * On mount it calls careerData.getNotes; on save it calls careerData.upsertNote.
 * Both currently return a `coming_soon` envelope, so the widget DEGRADES
 * GRACEFULLY: the input stays usable locally, an inline hint explains notes go
 * live with the search, and a save attempt that isn't `real` surfaces an honest
 * "saved once live" notice rather than claiming success. Real notes (status
 * 'real') hydrate the input and confirm saves.
 */
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useTheme, Spacing, Radius, FontSize } from "../../theme";
import { SifterButton } from "../ui";
import { careerData } from "../../lib/careerData";
import type { SavedEntityType } from "../../types/career";
import { useAuth } from "@/hooks/useAuth";

export interface NotesWidgetProps {
  entityType: SavedEntityType;
  entityId: string;
  style?: StyleProp<ViewStyle>;
}

export function NotesWidget({ entityType, entityId, style }: NotesWidgetProps) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const isGuest = !user || user.auth_provider === "guest";
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState<string | null>(
    "Notes come online with the live search — drafts stay on this device for now.",
  );
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flashHint = (msg: string) => {
    setHint(msg);
    if (hintTimer.current) clearTimeout(hintTimer.current);
    hintTimer.current = setTimeout(
      () =>
        setHint(
          "Notes come online with the live search — drafts stay on this device for now.",
        ),
      3000,
    );
  };

  useEffect(() => {
    let active = true;
    (async () => {
      const result = await careerData.getNotes(entityType, entityId);
      if (!active) return;
      if (result.status === "real" && result.data?.length) {
        setBody(result.data[0].body);
        setHint(null);
      }
      // Otherwise keep the default coming-soon hint and an empty, usable input.
    })();
    return () => {
      active = false;
    };
  }, [entityType, entityId]);

  const onSave = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const result = await careerData.upsertNote(entityType, entityId, body);
      if (result.status === "real") {
        if (result.data?.body != null) setBody(result.data.body);
        flashHint("Note saved.");
      } else {
        flashHint(result.meta?.notice ?? "We'll save this once notes go live.");
      }
    } catch {
      flashHint("Couldn't save just now — your draft is kept locally.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[styles.wrap, style]}>
      <Text style={[styles.title, { color: colors.text }]}>📝 My notes</Text>

      <View
        style={[
          styles.inputWrap,
          { backgroundColor: colors.inputBg, borderColor: colors.inputBorder },
        ]}
      >
        <TextInput
          style={[styles.input, { color: colors.text }]}
          value={body}
          onChangeText={setBody}
          editable={!isGuest}
          placeholder="Jot a thought about this…"
          placeholderTextColor={colors.textMuted}
          multiline
          textAlignVertical="top"
        />
      </View>

      {hint || isGuest ? (
        <Text style={[styles.hint, { color: colors.textMuted }]}>{isGuest ? "Create an account to keep private notes." : hint}</Text>
      ) : null}

      <SifterButton
        label="Save note"
        icon="💾"
        onPress={onSave}
        variant="ghost"
        size="sm"
        loading={busy}
        disabled={isGuest || body.trim().length === 0}
        fullWidth={false}
        style={{ alignSelf: "flex-start" }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.sm },
  title: { fontSize: FontSize.md, fontWeight: "800" },
  inputWrap: {
    borderWidth: 1.5,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
  },
  input: { minHeight: 80, paddingVertical: 11, fontSize: FontSize.md },
  hint: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    lineHeight: FontSize.xs * 1.5,
  },
});

export default NotesWidget;
