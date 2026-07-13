/**
 * NotesFab — a floating action button (bottom-right) that opens a global
 * quick-note hub. Tapping it opens a lightweight modal to jot a note without
 * leaving the current screen; the note is queued through careerCache so it
 * saves offline-first and syncs when connectivity returns.
 *
 * Self-contained: drop <NotesFab /> onto any screen. It carries its own modal
 * state and styling and only depends on the theme + careerCache write queue.
 */
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
} from "react-native";
import { useTheme, Spacing, FontSize, Radius, Shadow, Brand } from "../../theme";
import { queueWrite, flushQueue } from "../../lib/careerCache";

export interface NotesFabProps {
  /** Optional entity context stamped onto the note. Defaults to a global note. */
  entityType?: string;
  entityId?: string;
}

export function NotesFab({ entityType = "global", entityId }: NotesFabProps) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const close = () => {
    setOpen(false);
    setStatus(null);
  };

  const onSave = async () => {
    const text = body.trim();
    if (!text || busy) return;
    setBusy(true);
    try {
      // Offline-first: enqueue the write, then attempt an immediate flush.
      await queueWrite({
        endpoint: "/api/career/notes",
        method: "POST",
        body: { entity_type: entityType, entity_id: entityId, body: text },
      });
      await flushQueue().catch(() => 0);
      setBody("");
      setStatus("Saved — it'll sync when you're online.");
    } catch {
      setStatus("Kept on this device — we'll sync it later.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Quick note"
        style={[styles.fab, { backgroundColor: Brand.primary }, Shadow.lg]}
      >
        <Text style={styles.fabIcon}>📝</Text>
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={close}
      >
        <TouchableWithoutFeedback onPress={close}>
          <View style={[styles.backdrop, { backgroundColor: colors.overlay }]}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View
                style={[
                  styles.sheet,
                  {
                    backgroundColor: colors.cardElevated,
                    borderColor: colors.border,
                  },
                  Shadow.lg,
                ]}
              >
                <Text style={[styles.title, { color: colors.text }]}>
                  📝 Quick note
                </Text>
                <View
                  style={[
                    styles.inputWrap,
                    {
                      backgroundColor: colors.inputBg,
                      borderColor: colors.inputBorder,
                    },
                  ]}
                >
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    value={body}
                    onChangeText={setBody}
                    placeholder="Jot something down…"
                    placeholderTextColor={colors.textMuted}
                    multiline
                    autoFocus
                    textAlignVertical="top"
                  />
                </View>

                {status ? (
                  <Text style={[styles.status, { color: colors.textMuted }]}>
                    {status}
                  </Text>
                ) : null}

                <View style={styles.actions}>
                  <Pressable onPress={close} hitSlop={8} style={styles.btn}>
                    <Text style={[styles.btnText, { color: colors.textMuted }]}>
                      Close
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={onSave}
                    hitSlop={8}
                    disabled={busy || body.trim().length === 0}
                    style={[
                      styles.btn,
                      styles.saveBtn,
                      {
                        backgroundColor: colors.accent,
                        opacity: body.trim().length === 0 || busy ? 0.5 : 1,
                      },
                    ]}
                  >
                    <Text
                      style={[styles.btnText, { color: colors.textInverse }]}
                    >
                      {busy ? "Saving…" : "Save note"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

export default NotesFab;

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: Spacing.lg,
    bottom: Spacing.xl,
    width: 52,
    height: 52,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 30,
  },
  fabIcon: { fontSize: 22 },
  backdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
  },
  sheet: {
    width: "100%",
    maxWidth: 380,
    borderWidth: 1,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  title: { fontSize: FontSize.lg, fontWeight: "800" },
  inputWrap: {
    borderWidth: 1.5,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
  },
  input: { minHeight: 100, paddingVertical: 11, fontSize: FontSize.md },
  status: { fontSize: FontSize.xs, fontWeight: "600" },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  btn: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
  },
  saveBtn: { minWidth: 110, alignItems: "center" },
  btnText: { fontSize: FontSize.sm, fontWeight: "800" },
});
