/**
 * Sifter Skill_Up — Diary Screen
 *
 * Encrypted local-only journal. Never syncs to backend.
 * Three modes:
 *   Notes     — free-form entries, categorised by field/type/level
 *   Bookmarks — lesson highlights, auto-filed by field + level + lesson type
 *   Import    — paste external content → AI converts to lesson-style teaching
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, Alert, ActivityIndicator,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Spacing, Radius, FontSize, Shadow, useTheme } from '../theme';
import { useAuth } from '../hooks/useAuth';
import DisclaimerFooter from '../components/DisclaimerFooter';
import {
  DiaryNote, Bookmark, NoteCategory, NoteField,
  createNote, getAllNotes, updateNote, deleteNote,
  getBookmarks, deleteBookmark, convertImportedContent,
} from '../lib/diaryEngine';

type DiaryTab = 'notes' | 'bookmarks' | 'import';

const CATEGORIES: { id: NoteCategory; label: string; emoji: string }[] = [
  { id: 'reflection', label: 'Reflection',  emoji: '🪞' },
  { id: 'question',   label: 'Question',    emoji: '❓' },
  { id: 'insight',    label: 'Insight',     emoji: '💡' },
  { id: 'goal',       label: 'Goal',        emoji: '🎯' },
  { id: 'lesson-note',label: 'Lesson Note', emoji: '📝' },
  { id: 'imported',   label: 'Imported',    emoji: '📥' },
];

const FIELDS: { id: NoteField; label: string }[] = [
  { id: 'general',       label: 'General' },
  { id: 'supply-chain',  label: 'Supply Chain' },
  { id: 'quant',         label: 'Quantitative' },
  { id: 'crypto',        label: 'Crypto' },
  { id: 'software',      label: 'Software' },
  { id: 'data-science',  label: 'Data Science' },
];

// ─── Note Editor ──────────────────────────────────────────────────────────────
function NoteEditor({
  note,
  onSave,
  onClose,
}: {
  note?: DiaryNote;
  onSave: (title: string, content: string, category: NoteCategory, field: NoteField) => void;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const [title,    setTitle]    = useState(note?.title    ?? '');
  const [content,  setContent]  = useState(note?.content  ?? '');
  const [category, setCategory] = useState<NoteCategory>(note?.category ?? 'reflection');
  const [field,    setField]    = useState<NoteField>(note?.field     ?? 'general');

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
        <View style={[styles.editorHeader, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
          <TouchableOpacity onPress={onClose}><Text style={[styles.cancelText, { color: colors.textSoft }]}>Cancel</Text></TouchableOpacity>
          <Text style={[styles.editorTitle, { color: colors.text }]}>{note ? 'Edit Note' : 'New Note'}</Text>
          <TouchableOpacity onPress={() => onSave(title, content, category, field)}>
            <Text style={[styles.saveText, { color: colors.accent }]}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.editorBody} keyboardShouldPersistTaps="handled">
          <TextInput
            style={[styles.titleInput, { fontWeight: '800', color: colors.text, borderBottomColor: colors.border }]}
            value={title}
            onChangeText={setTitle}
            placeholder="Title..."
            placeholderTextColor={colors.textMuted}
          />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
            {CATEGORIES.map(c => (
              <TouchableOpacity
                key={c.id}
                style={[
                  styles.chip,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  category === c.id && { backgroundColor: colors.accent, borderColor: colors.accent },
                ]}
                onPress={() => setCategory(c.id)}
              >
                <Text style={styles.chipEmoji}>{c.emoji}</Text>
                <Text style={[styles.chipLabel, { color: colors.text }, category === c.id && styles.chipLabelActive]}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
            {FIELDS.map(f => (
              <TouchableOpacity
                key={f.id}
                style={[
                  styles.chip,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  field === f.id && { backgroundColor: colors.accent, borderColor: colors.accent },
                ]}
                onPress={() => setField(f.id)}
              >
                <Text style={[styles.chipLabel, { color: colors.text }, field === f.id && styles.chipLabelActive]}>{f.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TextInput
            style={[styles.contentInput, { color: colors.text }]}
            value={content}
            onChangeText={setContent}
            placeholder="Write here..."
            placeholderTextColor={colors.textMuted}
            multiline
            textAlignVertical="top"
          />

          <View style={[styles.encryptedNote, { backgroundColor: colors.greenSoft }]}>
            <Text style={[styles.encryptedText, { color: colors.green }]}>🔒 Stored only on this device. Never uploaded.</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// ─── Import Tab ───────────────────────────────────────────────────────────────
function ImportTab({ userId }: { userId: string }) {
  const { colors } = useTheme();
  const [rawText, setRawText] = useState('');
  const [field,   setField]   = useState<NoteField>('general');
  const [converting, setConverting] = useState(false);
  const [result,  setResult]  = useState<{ title: string; content: string } | null>(null);

  const handlePasteFromClipboard = async () => {
    const text = await Clipboard.getStringAsync();
    setRawText(text);
  };

  const handleConvert = async () => {
    if (!rawText.trim()) return;
    setConverting(true);
    const converted = await convertImportedContent({ rawText, field, userId });
    setResult(converted);
    setConverting(false);
  };

  const handleSave = async () => {
    if (!result) return;
    await createNote(userId, {
      title: result.title,
      content: result.content,
      category: 'imported',
      field,
      tags: ['ai-converted'],
      isAiConverted: true,
    });
    setRawText(''); setResult(null);
    Alert.alert('Saved', 'Note saved to your diary.');
  };

  return (
    <ScrollView contentContainerStyle={styles.importBody} keyboardShouldPersistTaps="handled">
      <View style={[styles.importHero, { backgroundColor: colors.card, borderColor: colors.border }, Shadow.sm]}>
        <Text style={[styles.importTitle, { color: colors.text }]}>Import & Learn</Text>
        <Text style={[styles.importSub, { color: colors.textSoft }]}>
        Paste anything — an article, a term, a concept. The AI converts it to our lesson style. Saved locally only.
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        {FIELDS.map(f => (
          <TouchableOpacity
            key={f.id}
            style={[
              styles.chip,
              { backgroundColor: colors.card, borderColor: colors.border },
              field === f.id && { backgroundColor: colors.accent, borderColor: colors.accent },
            ]}
            onPress={() => setField(f.id)}
          >
            <Text style={[styles.chipLabel, { color: colors.text }, field === f.id && styles.chipLabelActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TextInput
        style={[styles.importInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
        value={rawText}
        onChangeText={setRawText}
        placeholder="Paste text here, or tap the clipboard button below..."
        placeholderTextColor={colors.textMuted}
        multiline textAlignVertical="top"
      />

      <TouchableOpacity style={[styles.pasteBtn, { borderColor: colors.border, backgroundColor: colors.card }]} onPress={handlePasteFromClipboard}>
        <Text style={[styles.pasteBtnText, { color: colors.textSoft }]}>📋 Paste from Clipboard</Text>
      </TouchableOpacity>

      {!result && (
        <TouchableOpacity
          style={[styles.convertBtn, { backgroundColor: colors.accent }, (!rawText.trim() || converting) && styles.convertBtnDisabled]}
          onPress={handleConvert}
          disabled={!rawText.trim() || converting}
        >
          {converting
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.convertBtnText}>✨ Convert to Lesson</Text>
          }
        </TouchableOpacity>
      )}

      {result && (
        <View style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.accent }]}>
          <Text style={[styles.resultLabel, { color: colors.accent }]}>CONVERTED LESSON</Text>
          <Text style={[styles.resultTitle, { color: colors.text }]}>{result.title}</Text>
          <Text style={[styles.resultContent, { color: colors.text }]}>{result.content}</Text>
          <View style={styles.resultActions}>
            <TouchableOpacity style={[styles.saveNoteBtn, { backgroundColor: colors.accent }]} onPress={handleSave}>
              <Text style={styles.saveNoteBtnText}>Save to Diary</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.redoBtn} onPress={() => setResult(null)}>
              <Text style={[styles.redoBtnText, { color: colors.textSoft }]}>Try again</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function DiaryScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [tab,       setTab]       = useState<DiaryTab>('notes');
  const [notes,     setNotes]     = useState<DiaryNote[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [editing,   setEditing]   = useState<DiaryNote | undefined>(undefined);
  const [showEditor,setShowEditor]= useState(false);
  const [filterCat, setFilterCat] = useState<NoteCategory | 'all'>('all');
  const [filterField,setFilterField]= useState<NoteField | 'all'>('all');

  const userId = user?.id ?? 'local';

  const loadNotes = useCallback(async () => {
    const n = await getAllNotes(userId, {
      category: filterCat !== 'all' ? filterCat : undefined,
      field:    filterField !== 'all' ? filterField : undefined,
    });
    setNotes(n);
  }, [userId, filterCat, filterField]);

  const loadBookmarks = useCallback(async () => {
    const b = await getBookmarks({
      field: filterField !== 'all' ? filterField : undefined,
    });
    setBookmarks(b);
  }, [filterField]);

  useEffect(() => { if (tab === 'notes') loadNotes(); }, [tab, loadNotes]);
  useEffect(() => { if (tab === 'bookmarks') loadBookmarks(); }, [tab, loadBookmarks]);

  const handleSaveNote = async (title: string, content: string, category: NoteCategory, field: NoteField) => {
    if (!title.trim()) return;
    if (editing) {
      await updateNote(userId, editing.id, { title, content, category, field });
    } else {
      await createNote(userId, { title, content, category, field, tags: [] });
    }
    setShowEditor(false); setEditing(undefined);
    loadNotes();
  };

  const handleDeleteNote = async (id: string) => {
    Alert.alert('Delete Note', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteNote(userId, id); loadNotes(); } },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
        <Text style={[styles.headerEyebrow, { color: colors.accent }]}>Sifter Workspace</Text>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Diary</Text>
        <Text style={[styles.headerSub, { color: colors.green }]}>🔒 Stored only on this device</Text>
      </View>

      <View style={[styles.tabBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {(['notes', 'bookmarks', 'import'] as DiaryTab[]).map(t => (
          <TouchableOpacity
            key={t}
            style={[
              styles.tabBtn,
              tab === t && { backgroundColor: colors.accentSoft, borderBottomColor: colors.accent, borderBottomWidth: 2 },
            ]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabLabel, { color: colors.textSoft }, tab === t && { color: colors.accent, fontWeight: '800' }]}>
              {t === 'notes' ? '📝 Notes' : t === 'bookmarks' ? '🔖 Bookmarks' : '📥 Import'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'import' ? (
        <ImportTab userId={userId} />
      ) : (
        <>
          {/* Filters */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.filterRow, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
            {tab === 'notes' && [{ id: 'all', label: 'All' }, ...CATEGORIES.map(c => ({ id: c.id, label: c.label }))].map(c => (
              <TouchableOpacity
                key={c.id}
                style={[
                  styles.filterChip,
                  { borderColor: colors.border, backgroundColor: colors.bgSecondary },
                  filterCat === c.id && { backgroundColor: colors.accent, borderColor: colors.accent },
                ]}
                onPress={() => setFilterCat(c.id as any)}
              >
                <Text style={[styles.filterChipText, { color: colors.textSoft }, filterCat === c.id && styles.filterChipTextActive]}>{c.label}</Text>
              </TouchableOpacity>
            ))}
            {[{ id: 'all', label: 'All Fields' }, ...FIELDS.map(f => ({ id: f.id, label: f.label }))].map(f => (
              <TouchableOpacity
                key={f.id}
                style={[
                  styles.filterChip,
                  { borderColor: colors.border, backgroundColor: colors.bgSecondary },
                  filterField === f.id && { backgroundColor: colors.accent, borderColor: colors.accent },
                ]}
                onPress={() => setFilterField(f.id as any)}
              >
                <Text style={[styles.filterChipText, { color: colors.textSoft }, filterField === f.id && styles.filterChipTextActive]}>{f.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            {tab === 'notes' && notes.length === 0 && (
              <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }, Shadow.sm]}>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>No notes yet</Text>
                <Text style={[styles.emptyBody, { color: colors.textSoft }]}>Capture reflections, lesson notes, and questions here. They stay local to this device.</Text>
              </View>
            )}
            {tab === 'notes' && notes.map(note => (
              <TouchableOpacity
                key={note.id}
                style={[styles.noteCard, { backgroundColor: colors.card, borderColor: colors.border }, Shadow.sm]}
                onPress={() => { setEditing(note); setShowEditor(true); }}
                onLongPress={() => handleDeleteNote(note.id)}
                activeOpacity={0.8}
              >
                <View style={styles.noteHeader}>
                  <Text style={styles.noteCat}>{CATEGORIES.find(c => c.id === note.category)?.emoji ?? '📝'}</Text>
                  <Text style={[styles.noteTitle, { color: colors.text }]} numberOfLines={1}>{note.title}</Text>
                </View>
                <Text style={[styles.notePreview, { color: colors.textSoft }]} numberOfLines={2}>{note.content}</Text>
                <View style={styles.noteMeta}>
                  <Text style={[styles.noteMetaText, { color: colors.textMuted, backgroundColor: colors.bgSecondary }]}>{note.field}</Text>
                  {note.level && <Text style={[styles.noteMetaText, { color: colors.textMuted, backgroundColor: colors.bgSecondary }]}>{note.level}</Text>}
                  <Text style={[styles.noteMetaText, { color: colors.textMuted, backgroundColor: colors.bgSecondary }]}>{new Date(note.updatedAt).toLocaleDateString()}</Text>
                </View>
              </TouchableOpacity>
            ))}

            {tab === 'bookmarks' && bookmarks.length === 0 && (
              <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }, Shadow.sm]}>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>No lesson bookmarks yet</Text>
                <Text style={[styles.emptyBody, { color: colors.textSoft }]}>Saved lessons and highlights will appear here with their track and level context.</Text>
              </View>
            )}
            {tab === 'bookmarks' && bookmarks.map(bm => (
              <View key={bm.id} style={[styles.bookmarkCard, { backgroundColor: colors.card, borderColor: colors.border }, Shadow.sm]}>
                <View style={styles.bookmarkMeta}>
                  <Text style={[styles.bookmarkField, { color: colors.accent }]}>{bm.field}</Text>
                  <Text style={[styles.bookmarkSep, { color: colors.textMuted }]}>·</Text>
                  <Text style={[styles.bookmarkLevel, { color: colors.textMuted }]}>{bm.level}</Text>
                  <Text style={[styles.bookmarkSep, { color: colors.textMuted }]}>·</Text>
                  <Text style={[styles.bookmarkType, { color: colors.textMuted }]}>{bm.lessonType}</Text>
                </View>
                <Text style={[styles.bookmarkTitle, { color: colors.text }]}>{bm.lessonTitle}</Text>
                <Text style={[styles.bookmarkExcerpt, { color: colors.textSoft }]} numberOfLines={3}>{bm.excerpt}</Text>
                {bm.note && <Text style={[styles.bookmarkNote, { color: colors.accent }]}>📝 {bm.note}</Text>}
                <TouchableOpacity onPress={() => deleteBookmark(bm.id).then(loadBookmarks)}>
                  <Text style={[styles.deleteBookmarkText, { color: colors.red }]}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}

            <View style={{ height: 100 }} />
          </ScrollView>

          {tab === 'notes' && (
            <TouchableOpacity style={[styles.fab, { backgroundColor: colors.accent }, Shadow.md]} onPress={() => { setEditing(undefined); setShowEditor(true); }}>
              <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>
          )}
        </>
      )}

      {showEditor && (
        <NoteEditor
          note={editing}
          onSave={handleSaveNote}
          onClose={() => { setShowEditor(false); setEditing(undefined); }}
        />
      )}
          <DisclaimerFooter />
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.sm, borderBottomWidth: 1 },
  headerEyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '900' },
  headerSub: { fontSize: FontSize.xs, marginTop: 2, fontWeight: '700' },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, gap: Spacing.xs },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: Radius.full },
  tabBtnActive: {},
  tabLabel: { fontSize: 11, fontWeight: '700' },
  tabLabelActive: { color: '#fff', fontWeight: '800' },

  filterRow: { maxHeight: 48, borderBottomWidth: 1 },
  filterChip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, margin: Spacing.xs, borderRadius: Radius.full, borderWidth: 1 },
  filterChipActive: {},
  filterChipText: { fontSize: 11, fontWeight: '700' },
  filterChipTextActive: { color: '#fff', fontWeight: '800' },

  scroll: { flex: 1 },
  noteCard: { margin: Spacing.md, marginBottom: 0, borderRadius: Radius.xl, padding: Spacing.md, borderWidth: 1 },
  noteHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 6 },
  noteCat: { fontSize: 16 },
  noteTitle: { flex: 1, fontSize: FontSize.sm, fontWeight: '800' },
  notePreview: { fontSize: FontSize.xs, lineHeight: 18, marginBottom: 6 },
  noteMeta: { flexDirection: 'row', gap: Spacing.sm },
  noteMetaText: { fontSize: 10, paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.sm, overflow: 'hidden' },

  bookmarkCard: { margin: Spacing.md, marginBottom: 0, borderRadius: Radius.xl, padding: Spacing.md, borderWidth: 1 },
  bookmarkMeta: { flexDirection: 'row', gap: 4, alignItems: 'center', marginBottom: 4 },
  bookmarkField: { fontSize: 10, fontWeight: '700' },
  bookmarkSep: { fontSize: 10 },
  bookmarkLevel: { fontSize: 10 },
  bookmarkType: { fontSize: 10 },
  bookmarkTitle: { fontSize: FontSize.sm, fontWeight: '800', marginBottom: 4 },
  bookmarkExcerpt: { fontSize: FontSize.xs, lineHeight: 18, marginBottom: 6 },
  bookmarkNote: { fontSize: FontSize.xs, marginBottom: 6 },
  deleteBookmarkText: { fontSize: FontSize.xs, alignSelf: 'flex-end', fontWeight: '700' },

  emptyState: { margin: Spacing.md, borderRadius: Radius.xl, borderWidth: 1, padding: Spacing.lg, gap: Spacing.xs },
  emptyTitle: { fontSize: FontSize.md, fontWeight: '800' },
  emptyBody: { fontSize: FontSize.sm, lineHeight: 20 },

  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  fabText: { color: '#fff', fontSize: 18, fontWeight: '300', lineHeight: 22 },

  // Editor
  editorHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md, borderBottomWidth: 1 },
  cancelText: { fontSize: FontSize.sm },
  editorTitle: { fontSize: FontSize.md, fontWeight: '800' },
  saveText: { fontSize: FontSize.sm, fontWeight: '800' },
  editorBody: { padding: Spacing.lg },
  titleInput: { fontSize: FontSize.lg, marginBottom: Spacing.md, borderBottomWidth: 1, paddingBottom: Spacing.sm },
  chipRow: { marginBottom: Spacing.md },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 5, marginRight: Spacing.xs },
  chipActive: {},
  chipEmoji: { fontSize: 12 },
  chipLabel: { fontSize: 11, fontWeight: '700' },
  chipLabelActive: { color: '#fff', fontWeight: '800' },
  contentInput: { fontSize: FontSize.sm, minHeight: 280, lineHeight: 22 },
  encryptedNote: { marginTop: Spacing.xl, padding: Spacing.sm, borderRadius: Radius.md, alignItems: 'center' },
  encryptedText: { fontSize: FontSize.xs, fontWeight: '700' },

  // Import
  importBody: { padding: Spacing.lg, gap: Spacing.sm, paddingBottom: Spacing.xxxl },
  importHero: { borderRadius: Radius.xl, borderWidth: 1, padding: Spacing.lg },
  importTitle: { fontSize: FontSize.xl, fontWeight: '900', marginBottom: Spacing.xs },
  importSub: { fontSize: FontSize.sm, lineHeight: 20 },
  importInput: { borderWidth: 1, borderRadius: Radius.lg, padding: Spacing.md, fontSize: FontSize.sm, minHeight: 150, marginBottom: Spacing.sm, textAlignVertical: 'top' },
  pasteBtn: { borderWidth: 1, borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'center', marginBottom: Spacing.md },
  pasteBtnText: { fontSize: FontSize.sm, fontWeight: '700' },
  convertBtn: { borderRadius: Radius.xl, padding: Spacing.md, alignItems: 'center' },
  convertBtnDisabled: { opacity: 0.4 },
  convertBtnText: { color: '#fff', fontWeight: '800', fontSize: FontSize.md },
  resultCard: { marginTop: Spacing.lg, borderRadius: Radius.xl, padding: Spacing.lg, borderWidth: 2 },
  resultLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 1, marginBottom: Spacing.sm },
  resultTitle: { fontSize: FontSize.lg, fontWeight: '800', marginBottom: Spacing.md },
  resultContent: { fontSize: FontSize.sm, lineHeight: 22, marginBottom: Spacing.lg },
  resultActions: { flexDirection: 'row', gap: Spacing.sm },
  saveNoteBtn: { flex: 1, borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'center' },
  saveNoteBtnText: { color: '#fff', fontWeight: '800', fontSize: FontSize.sm },
  redoBtn: { padding: Spacing.md, alignItems: 'center' },
  redoBtnText: { fontSize: FontSize.sm, fontWeight: '700' },
});
