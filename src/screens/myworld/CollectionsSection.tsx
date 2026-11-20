/**
 * CollectionsSection — My World collections (slice 1).
 *
 * Named groups of the student's saved items. A collection holds references to
 * saved items, so one item can sit in several collections and removing it from
 * a collection (or deleting the collection) never deletes the saved item or
 * any canonical programme, role or task item.
 *
 * In scope: list, create (starter names are suggestions only), open, rename,
 * delete, add saved items, remove from collection with explicit confirmation.
 * Not in this slice: ordering UI, export, sharing.
 */
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Pressable,
  ActivityIndicator,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme, Spacing, Radius, FontSize, CompassFonts } from "@/theme";
import { collectionsData } from "@/lib/collectionsData";
import {
  type Collection,
  type CollectionItem,
  type CollectionStarter,
  type DataState,
  type SavedItem,
} from "@/types/career";
import { ENTITY_META } from "./entityMeta";
import { GlyphIcon } from "../../components/icons/GlyphIcon";

export const REMOVE_FROM_COLLECTION_COPY =
  "This removes it from this collection. It does not delete the original programme, role or task item.";
export const DELETE_COLLECTION_COPY =
  "Your saved items stay in My World. This does not delete any original programme, role or task item.";
const NAME_MAX = 60;
const WIDE_BREAKPOINT = 720;

type Sheet =
  | { kind: "create" }
  | { kind: "rename"; collection: Collection }
  | { kind: "add" }
  | { kind: "removeItem"; item: CollectionItem }
  | { kind: "deleteCollection" }
  | null;

export function CollectionsSection({ saved }: { saved: DataState<SavedItem[]> | null }) {
  const { colors } = useTheme();
  const [list, setList] = useState<DataState<Collection[]> | null>(null);
  const [starters, setStarters] = useState<CollectionStarter[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [collections, suggestions] = await Promise.all([collectionsData.list(), collectionsData.starters()]);
    setList(collections);
    setStarters(suggestions.status === "real" && suggestions.data ? suggestions.data : []);
  }, []);

  useEffect(() => {
    let active = true;
    void (async () => {
      const [collections, suggestions] = await Promise.all([collectionsData.list(), collectionsData.starters()]);
      if (!active) return;
      setList(collections);
      setStarters(suggestions.status === "real" && suggestions.data ? suggestions.data : []);
    })();
    return () => {
      active = false;
    };
  }, []);

  const collections = list?.status === "real" && list.data ? list.data : [];
  const open = collections.find((c) => c.id === openId) ?? null;
  const supported = list?.status === "real";

  return (
    <View style={styles.wrap} accessibilityLabel="Collections">
      <View style={styles.headerRow}>
        <Text style={[styles.section, CompassFonts.bodyBold, { color: colors.textRole.secondary }]} accessibilityRole="header">
          Collections
        </Text>
        {supported && !open ? (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="New collection"
            onPress={() => setSheet({ kind: "create" })}
            style={[styles.primaryBtn, { backgroundColor: colors.accentRole.action }]}
          >
            <Feather name="plus" size={14} color={colors.textRole.inverse} />
            <Text style={[styles.primaryBtnText, CompassFonts.bodyBold, { color: colors.textRole.inverse }]}>New collection</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {notice ? (
        <Text accessibilityLiveRegion="polite" style={[styles.notice, CompassFonts.body, { color: colors.textRole.secondary }]}>
          {notice}
        </Text>
      ) : null}

      {list === null ? (
        <View style={styles.centered} accessibilityLabel="Loading collections">
          <ActivityIndicator color={colors.accentRole.action} />
          <Text style={[styles.muted, { color: colors.textRole.muted }]}>Loading your collections</Text>
        </View>
      ) : list.status === "coming_soon" ? (
        <Panel icon="info" title="Collections are not available yet" body={list.meta?.notice ?? "Your saved items are safe. Collections will appear here once they are switched on."} />
      ) : list.status === "locked" ? (
        <Panel icon="lock" title="Create an account to use collections" body={list.meta?.notice ?? "Collections are saved to your account."} />
      ) : list.status !== "real" ? (
        <Panel icon="alert-triangle" title="Collections could not load" body={list.meta?.notice ?? "Please try again in a moment."} actionLabel="Try again" onAction={() => void load()} />
      ) : open ? (
        <CollectionDetail
          collection={open}
          saved={saved}
          onBack={() => setOpenId(null)}
          onRename={() => setSheet({ kind: "rename", collection: open })}
          onDelete={() => setSheet({ kind: "deleteCollection" })}
          onAdd={() => setSheet({ kind: "add" })}
          onRemoveItem={(item) => setSheet({ kind: "removeItem", item })}
          sheet={sheet}
          closeSheet={() => setSheet(null)}
          onChanged={(message) => {
            setNotice(message);
            void load();
          }}
          onDeleted={(message) => {
            setSheet(null);
            setOpenId(null);
            setNotice(message);
            void load();
          }}
        />
      ) : (
        <CollectionList
          collections={collections}
          starters={starters.filter((s) => !s.created)}
          onOpen={(c) => {
            setNotice(null);
            setOpenId(c.id);
          }}
          onStart={() => setSheet({ kind: "create" })}
        />
      )}

      {supported && !open ? (
        <NameSheet
          visible={sheet?.kind === "create"}
          mode="create"
          starters={starters.filter((s) => !s.created)}
          onClose={() => setSheet(null)}
          onDone={(c) => {
            setSheet(null);
            setNotice(`Created “${c.name}”.`);
            void load();
          }}
        />
      ) : null}
    </View>
  );
}

function Panel({
  icon,
  title,
  body,
  actionLabel,
  onAction,
}: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.panel, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}>
      <Feather name={icon} size={18} color={colors.textRole.muted} />
      <View style={styles.panelText}>
        <Text style={[styles.panelTitle, CompassFonts.bodyBold, { color: colors.textRole.primary }]}>{title}</Text>
        <Text style={[styles.muted, CompassFonts.body, { color: colors.textRole.secondary }]}>{body}</Text>
        {actionLabel && onAction ? (
          <TouchableOpacity accessibilityRole="button" accessibilityLabel={actionLabel} onPress={onAction} style={styles.linkBtn}>
            <Text style={[styles.linkText, CompassFonts.bodyBold, { color: colors.accentRole.action }]}>{actionLabel}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

function CollectionList({
  collections,
  starters,
  onOpen,
  onStart,
}: {
  collections: Collection[];
  starters: CollectionStarter[];
  onOpen: (c: Collection) => void;
  onStart: () => void;
}) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const wide = width >= WIDE_BREAKPOINT;
  return (
    <View style={styles.listWrap}>
      {collections.length === 0 ? (
        <Panel
          icon="folder"
          title="No collections yet"
          body="Group the programmes, roles and other items you have saved. An item can be in more than one collection."
          actionLabel="Create your first collection"
          onAction={onStart}
        />
      ) : (
        <View style={[styles.grid, wide && styles.gridWide]}>
          {collections.map((c) => (
            <TouchableOpacity
              key={c.id}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Open collection ${c.name}, ${c.itemCount} ${c.itemCount === 1 ? "item" : "items"}`}
              onPress={() => onOpen(c)}
              style={[
                styles.card,
                wide && styles.cardWide,
                { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle },
              ]}
            >
              <Feather name="folder" size={18} color={colors.accentRole.action} />
              <View style={styles.cardText}>
                <Text numberOfLines={2} style={[styles.cardTitle, CompassFonts.bodyBold, { color: colors.textRole.primary }]}>{c.name}</Text>
                <Text style={[styles.muted, { color: colors.textRole.muted }]}>
                  {c.itemCount} {c.itemCount === 1 ? "item" : "items"}
                </Text>
              </View>
              <Feather name="chevron-right" size={16} color={colors.textRole.muted} />
            </TouchableOpacity>
          ))}
        </View>
      )}
      {starters.length > 0 && collections.length > 0 ? (
        <Text style={[styles.muted, CompassFonts.body, { color: colors.textRole.muted }]}>
          Ideas to start with: {starters.map((s) => s.name).join(", ")}. Use New collection to pick one.
        </Text>
      ) : null}
    </View>
  );
}

function CollectionDetail({
  collection,
  saved,
  onBack,
  onRename,
  onDelete,
  onAdd,
  onRemoveItem,
  sheet,
  closeSheet,
  onChanged,
  onDeleted,
}: {
  collection: Collection;
  saved: DataState<SavedItem[]> | null;
  onBack: () => void;
  onRename: () => void;
  onDelete: () => void;
  onAdd: () => void;
  onRemoveItem: (item: CollectionItem) => void;
  sheet: Sheet;
  closeSheet: () => void;
  onChanged: (message: string) => void;
  onDeleted: (message: string) => void;
}) {
  const { colors } = useTheme();
  const [items, setItems] = useState<DataState<CollectionItem[]> | null>(null);

  const loadItems = useCallback(async () => {
    setItems(await collectionsData.items(collection.id));
  }, [collection.id]);

  useEffect(() => {
    let active = true;
    setItems(null);
    void (async () => {
      const result = await collectionsData.items(collection.id);
      if (active) setItems(result);
    })();
    return () => {
      active = false;
    };
  }, [collection.id]);

  const members = items?.status === "real" && items.data ? items.data : [];
  const savedItems = saved?.status === "real" && saved.data ? saved.data : [];
  const memberIds = new Set(members.map((m) => m.savedItemId));
  const addable = savedItems.filter((s) => !memberIds.has(s.id));

  return (
    <View style={styles.listWrap}>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Back to all collections" onPress={onBack} style={styles.backBtn}>
        <Feather name="chevron-left" size={16} color={colors.accentRole.action} />
        <Text style={[styles.linkText, CompassFonts.bodyBold, { color: colors.accentRole.action }]}>All collections</Text>
      </TouchableOpacity>

      <View style={styles.headerRow}>
        <Text accessibilityRole="header" style={[styles.detailTitle, CompassFonts.displayBold, { color: colors.textRole.primary }]}>
          {collection.name}
        </Text>
      </View>
      <View style={styles.actionRow}>
        <OutlineBtn label="Add saved items" icon="plus" onPress={onAdd} colors={colors} />
        <OutlineBtn label="Rename" icon="edit" onPress={onRename} colors={colors} />
        <OutlineBtn label="Delete collection" icon="trash-2" onPress={onDelete} colors={colors} danger />
      </View>

      {items === null ? (
        <View style={styles.centered} accessibilityLabel="Loading collection items">
          <ActivityIndicator color={colors.accentRole.action} />
        </View>
      ) : items.status !== "real" ? (
        <Panel
          icon="alert-triangle"
          title="This collection could not load"
          body={items.meta?.notice ?? "Please try again in a moment."}
          actionLabel="Try again"
          onAction={() => void loadItems()}
        />
      ) : members.length === 0 ? (
        <Panel
          icon="inbox"
          title="Nothing in this collection yet"
          body="Add items you have already saved. They stay in My World either way."
          actionLabel="Add saved items"
          onAction={onAdd}
        />
      ) : (
        <View style={styles.list}>
          {members.map((item) => {
            const meta = ENTITY_META[item.entityType] ?? { icon: "•", label: "Item" };
            const name = item.label ?? item.entityId;
            return (
              <View
                key={item.savedItemId}
                style={[styles.row, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}
              >
                <GlyphIcon glyph={meta.icon} size={20} color={colors.textRole.secondary} fallbackStyle={styles.rowIcon} />
                <View style={styles.cardText}>
                  <Text numberOfLines={2} style={[styles.cardTitle, CompassFonts.bodySemibold, { color: colors.textRole.primary }]}>{name}</Text>
                  <View style={[styles.typeChip, { backgroundColor: colors.surface.subtle }]}>
                    <Text style={[styles.typeChipText, { color: colors.textRole.muted }]}>{meta.label}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${name} from this collection`}
                  onPress={() => onRemoveItem(item)}
                  style={styles.iconBtn}
                >
                  <Feather name="x" size={16} color={colors.textRole.muted} />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      )}

      <NameSheet
        visible={sheet?.kind === "rename"}
        mode="rename"
        collection={collection}
        starters={[]}
        onClose={closeSheet}
        onDone={(c) => {
          closeSheet();
          onChanged(`Renamed to “${c.name}”.`);
        }}
      />
      <AddItemsSheet
        visible={sheet?.kind === "add"}
        collection={collection}
        addable={addable}
        onClose={closeSheet}
        onDone={(count) => {
          closeSheet();
          void loadItems();
          onChanged(`Added ${count} ${count === 1 ? "item" : "items"} to “${collection.name}”.`);
        }}
      />
      <ConfirmSheet
        visible={sheet?.kind === "removeItem"}
        title="Remove from this collection?"
        body={REMOVE_FROM_COLLECTION_COPY}
        confirmLabel="Remove from collection"
        onClose={closeSheet}
        onConfirm={async () => {
          if (sheet?.kind !== "removeItem") return null;
          const result = await collectionsData.removeItem(collection.id, sheet.item.savedItemId);
          if (result.status !== "real") return result.meta?.notice ?? "Could not remove that item.";
          closeSheet();
          void loadItems();
          onChanged("Removed from this collection. It is still in My World.");
          return null;
        }}
      />
      <ConfirmSheet
        visible={sheet?.kind === "deleteCollection"}
        title={`Delete “${collection.name}”?`}
        body={DELETE_COLLECTION_COPY}
        confirmLabel="Delete collection"
        onClose={closeSheet}
        onConfirm={async () => {
          const result = await collectionsData.remove(collection.id);
          if (result.status !== "real") return result.meta?.notice ?? "Could not delete the collection.";
          onDeleted(`Deleted “${collection.name}”. Your saved items are still in My World.`);
          return null;
        }}
      />
    </View>
  );
}

function OutlineBtn({
  label,
  icon,
  onPress,
  colors,
  danger,
}: {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
  colors: ReturnType<typeof useTheme>["colors"];
  danger?: boolean;
}) {
  const tint = danger ? colors.accentRole.danger : colors.textRole.primary;
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.outlineBtn, { borderColor: colors.borderRole.subtle }]}
    >
      <Feather name={icon} size={14} color={tint} />
      <Text style={[styles.outlineText, CompassFonts.bodySemibold, { color: tint }]}>{label}</Text>
    </TouchableOpacity>
  );
}

/** Bottom sheet shell shared by the dialogs (web: centred by maxWidth). */
function SheetShell({
  visible,
  title,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const { colors } = useTheme();
  // Keep the Modal mounted and toggle `visible`: react-native-web only paints
  // its portal after a re-render, so mounting it already visible shows nothing.
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.backdrop, { backgroundColor: colors.overlay }]}>
        {/* Sibling (not parent) of the sheet so its label never swallows the sheet's buttons. */}
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close dialog"
        />
        <View
          accessibilityViewIsModal
          style={[styles.sheet, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}
        >
          <Text accessibilityRole="header" style={[styles.sheetTitle, CompassFonts.displayBold, { color: colors.textRole.primary }]}>
            {title}
          </Text>
          {children}
        </View>
      </View>
    </Modal>
  );
}

function NameSheet({
  visible,
  mode,
  collection,
  starters,
  onClose,
  onDone,
}: {
  visible: boolean;
  mode: "create" | "rename";
  collection?: Collection;
  starters: CollectionStarter[];
  onClose: () => void;
  onDone: (c: Collection) => void;
}) {
  const { colors } = useTheme();
  const [name, setName] = useState("");
  const [starterKey, setStarterKey] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setName(mode === "rename" ? collection?.name ?? "" : "");
      setStarterKey(undefined);
      setProblem(null);
      setBusy(false);
    }
  }, [visible, mode, collection]);

  const trimmed = name.trim();
  const submit = async () => {
    if (busy || !trimmed) return;
    setBusy(true);
    setProblem(null);
    const result =
      mode === "rename" && collection
        ? await collectionsData.rename(collection.id, trimmed)
        : await collectionsData.create(trimmed, starterKey);
    setBusy(false);
    if (result.status === "real" && result.data) onDone(result.data);
    else setProblem(result.meta?.notice ?? "Could not save. Try again.");
  };

  return (
    <SheetShell visible={visible} title={mode === "rename" ? "Rename collection" : "New collection"} onClose={onClose}>
      {mode === "create" && starters.length > 0 ? (
        <View>
          <Text style={[styles.fieldLabel, CompassFonts.bodyBold, { color: colors.textRole.muted }]}>Suggestions</Text>
          <View style={styles.chipRow}>
            {starters.map((s) => {
              const selected = starterKey === s.starterKey;
              return (
                <TouchableOpacity
                  key={s.starterKey}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`Use suggestion ${s.name}`}
                  onPress={() => {
                    setName(s.name);
                    setStarterKey(s.starterKey);
                  }}
                  style={[
                    styles.chip,
                    {
                      borderColor: selected ? colors.accentRole.action : colors.borderRole.subtle,
                      backgroundColor: selected ? colors.surface.subtle : "transparent",
                    },
                  ]}
                >
                  <Text style={[styles.chipText, CompassFonts.bodySemibold, { color: colors.textRole.primary }]}>{s.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ) : null}
      <Text style={[styles.fieldLabel, CompassFonts.bodyBold, { color: colors.textRole.muted }]}>Name</Text>
      <View style={[styles.inputWrap, { borderColor: problem ? colors.accentRole.danger : colors.borderRole.subtle, backgroundColor: colors.surface.base }]}>
        <TextInput
          value={name}
          onChangeText={(v) => {
            setName(v);
            // Editing away from a suggestion makes it a plain custom name.
            if (starterKey) setStarterKey(undefined);
            setProblem(null);
          }}
          maxLength={NAME_MAX}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={() => void submit()}
          placeholder="For example, Courses I like"
          placeholderTextColor={colors.textRole.muted}
          accessibilityLabel="Collection name"
          style={[styles.input, CompassFonts.body, { color: colors.textRole.primary }]}
        />
      </View>
      <Text style={[styles.muted, { color: colors.textRole.muted }]}>{trimmed.length}/{NAME_MAX}</Text>
      {problem ? (
        <Text accessibilityLiveRegion="polite" accessibilityRole="alert" style={[styles.muted, CompassFonts.body, { color: colors.accentRole.danger }]}>
          {problem}
        </Text>
      ) : null}
      <SheetActions
        busy={busy}
        disabled={!trimmed}
        confirmLabel={mode === "rename" ? "Save name" : "Create collection"}
        onClose={onClose}
        onConfirm={() => void submit()}
      />
    </SheetShell>
  );
}

function AddItemsSheet({
  visible,
  collection,
  addable,
  onClose,
  onDone,
}: {
  visible: boolean;
  collection: Collection;
  addable: SavedItem[];
  onClose: () => void;
  onDone: (count: number) => void;
}) {
  const { colors } = useTheme();
  const [picked, setPicked] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setPicked([]);
      setProblem(null);
      setBusy(false);
    }
  }, [visible]);

  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const submit = async () => {
    if (busy || picked.length === 0) return;
    setBusy(true);
    setProblem(null);
    const result = await collectionsData.addItems(collection.id, picked);
    setBusy(false);
    if (result.status === "real") onDone(result.data?.added ?? picked.length);
    else setProblem(result.meta?.notice ?? "Could not add those items. Try again.");
  };

  return (
    <SheetShell visible={visible} title={`Add to “${collection.name}”`} onClose={onClose}>
      {addable.length === 0 ? (
        <Text style={[styles.muted, CompassFonts.body, { color: colors.textRole.secondary }]}>
          Everything you have saved is already here, or you have not saved anything yet. Save programmes, roles and more from Explore, then add them here.
        </Text>
      ) : (
        <ScrollView style={styles.pickScroll} contentContainerStyle={styles.pickList}>
          {addable.map((s) => {
            const meta = ENTITY_META[s.entityType] ?? { icon: "•", label: "Item" };
            const pending = s.id.startsWith("local_");
            const checked = picked.includes(s.id);
            return (
              <TouchableOpacity
                key={s.id}
                disabled={pending}
                accessibilityRole="checkbox"
                accessibilityState={{ checked, disabled: pending }}
                accessibilityLabel={`${s.label ?? s.entityId}, ${meta.label}${pending ? ", waiting to sync" : ""}`}
                onPress={() => toggle(s.id)}
                style={[
                  styles.pickRow,
                  { borderColor: checked ? colors.accentRole.action : colors.borderRole.subtle, opacity: pending ? 0.5 : 1 },
                ]}
              >
                <Feather name={checked ? "check-square" : "square"} size={18} color={checked ? colors.accentRole.action : colors.textRole.muted} />
                <View style={styles.cardText}>
                  <Text numberOfLines={2} style={[styles.cardTitle, CompassFonts.bodySemibold, { color: colors.textRole.primary }]}>{s.label ?? s.entityId}</Text>
                  <Text style={[styles.muted, { color: colors.textRole.muted }]}>
                    {meta.label}{pending ? " · waiting to sync" : ""}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
      {problem ? (
        <Text accessibilityRole="alert" style={[styles.muted, CompassFonts.body, { color: colors.accentRole.danger }]}>{problem}</Text>
      ) : null}
      <SheetActions
        busy={busy}
        disabled={picked.length === 0}
        confirmLabel={picked.length > 0 ? `Add ${picked.length} ${picked.length === 1 ? "item" : "items"}` : "Add items"}
        onClose={onClose}
        onConfirm={() => void submit()}
      />
    </SheetShell>
  );
}

function ConfirmSheet({
  visible,
  title,
  body,
  confirmLabel,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  onClose: () => void;
  /** Resolve null on success (the caller closes) or a problem message. */
  onConfirm: () => Promise<string | null>;
}) {
  const { colors } = useTheme();
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setBusy(false);
      setProblem(null);
    }
  }, [visible]);

  const confirm = async () => {
    if (busy) return;
    setBusy(true);
    const message = await onConfirm();
    setBusy(false);
    if (message) setProblem(message);
  };

  return (
    <SheetShell visible={visible} title={title} onClose={onClose}>
      <Text style={[styles.muted, CompassFonts.body, { color: colors.textRole.secondary }]}>{body}</Text>
      {problem ? (
        <Text accessibilityRole="alert" style={[styles.muted, CompassFonts.body, { color: colors.accentRole.danger }]}>{problem}</Text>
      ) : null}
      <SheetActions busy={busy} confirmLabel={confirmLabel} onClose={onClose} onConfirm={() => void confirm()} />
    </SheetShell>
  );
}

function SheetActions({
  busy,
  disabled,
  confirmLabel,
  onClose,
  onConfirm,
}: {
  busy: boolean;
  disabled?: boolean;
  confirmLabel: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.sheetActions}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Cancel"
        onPress={onClose}
        style={[styles.outlineBtn, styles.sheetBtn, { borderColor: colors.borderRole.subtle }]}
      >
        <Text style={[styles.outlineText, CompassFonts.bodySemibold, { color: colors.textRole.primary }]}>Cancel</Text>
      </TouchableOpacity>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={confirmLabel}
        accessibilityState={{ disabled: !!disabled || busy, busy }}
        disabled={disabled || busy}
        onPress={onConfirm}
        style={[styles.primaryBtn, styles.sheetBtn, { backgroundColor: colors.accentRole.action, opacity: disabled || busy ? 0.5 : 1 }]}
      >
        <Text style={[styles.primaryBtnText, CompassFonts.bodyBold, { color: colors.textRole.inverse }]}>
          {busy ? "Working…" : confirmLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.sm },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: Spacing.sm, marginTop: Spacing.md },
  section: { fontSize: FontSize.sm, letterSpacing: 0.5, textTransform: "uppercase" },
  notice: { fontSize: FontSize.md },
  muted: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
  centered: { alignItems: "center", gap: Spacing.sm, padding: Spacing.lg },
  panel: { flexDirection: "row", gap: Spacing.md, padding: Spacing.md, borderWidth: 1, borderRadius: Radius.lg },
  panelText: { flex: 1, gap: 2 },
  panelTitle: { fontSize: FontSize.md },
  linkBtn: { minHeight: 44, justifyContent: "center", alignSelf: "flex-start" },
  linkText: { fontSize: FontSize.md },
  backBtn: { flexDirection: "row", alignItems: "center", minHeight: 44, alignSelf: "flex-start" },
  listWrap: { gap: Spacing.sm },
  grid: { gap: Spacing.sm },
  gridWide: { flexDirection: "row", flexWrap: "wrap" },
  card: { flexDirection: "row", alignItems: "center", gap: Spacing.md, padding: Spacing.md, borderWidth: 1, borderRadius: Radius.lg, minHeight: 56 },
  cardWide: { flexBasis: "48%", flexGrow: 1 },
  cardText: { flex: 1, gap: 2 },
  cardTitle: { fontSize: FontSize.md },
  detailTitle: { fontSize: FontSize.xxl, flex: 1 },
  actionRow: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  list: { gap: Spacing.sm },
  row: { flexDirection: "row", alignItems: "center", gap: Spacing.md, padding: Spacing.md, borderWidth: 1, borderRadius: Radius.lg, minHeight: 44 },
  rowIcon: { fontSize: 20 },
  typeChip: { alignSelf: "flex-start", borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 1, marginTop: 2 },
  typeChipText: { fontSize: FontSize.sm, letterSpacing: 0.3 },
  iconBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  primaryBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.xs, minHeight: 44, paddingHorizontal: Spacing.lg, borderRadius: Radius.md },
  primaryBtnText: { fontSize: FontSize.md },
  outlineBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.xs, minHeight: 44, paddingHorizontal: Spacing.md, borderRadius: Radius.md, borderWidth: 1 },
  outlineText: { fontSize: FontSize.md },
  backdrop: { flex: 1, justifyContent: "flex-end", alignItems: "center" },
  sheet: { width: "100%", maxWidth: 520, maxHeight: "90%", borderTopLeftRadius: Radius.xxl, borderTopRightRadius: Radius.xxl, borderWidth: 1, padding: Spacing.lg, paddingBottom: Spacing.xxl, gap: Spacing.sm },
  sheetTitle: { fontSize: FontSize.xl },
  fieldLabel: { fontSize: FontSize.sm, letterSpacing: 0.5, textTransform: "uppercase", marginTop: Spacing.xs },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm, marginTop: Spacing.xs },
  chip: { minHeight: 44, paddingHorizontal: Spacing.md, justifyContent: "center", borderRadius: Radius.full, borderWidth: 1.5 },
  chipText: { fontSize: FontSize.md },
  inputWrap: { borderWidth: 1.5, borderRadius: Radius.md, paddingHorizontal: Spacing.md },
  input: { minHeight: 44, paddingVertical: 10, fontSize: FontSize.md },
  pickScroll: { maxHeight: 360 },
  pickList: { gap: Spacing.sm },
  pickRow: { flexDirection: "row", alignItems: "center", gap: Spacing.md, padding: Spacing.md, borderWidth: 1.5, borderRadius: Radius.lg, minHeight: 44 },
  sheetActions: { flexDirection: "row", gap: Spacing.sm, marginTop: Spacing.sm },
  sheetBtn: { flex: 1 },
});
