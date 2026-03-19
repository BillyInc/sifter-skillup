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
  SafeAreaView, TextInput, Modal, Alert, ActivityIndicator,
  Clipboard,
} from 'react-native';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../theme';
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
  const [title,    setTitle]    = useState(note?.title    ?? '');
  const [content,  setContent]  = useState(note?.content  ?? '');
  const [category, setCategory] = useState<NoteCategory>(note?.category ?? 'reflection');
  const [field,    setField]    = useState<NoteField>(note?.field     ?? 'general');

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.editorHeader}>
          <TouchableOpacity onPress={onClose}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
          <Text style={styles.editorTitle}>{note ? 'Edit Note' : 'New Note'}</Text>
          <TouchableOpacity onPress={() => onSave(title, content, category, field)}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.editorBody} keyboardShouldPersistTaps="handled">
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="Title..."
            placeholderTextColor={Colors.textMuted}
            fontWeight="800"
          />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
            {CATEGORIES.map(c => (
              <TouchableOpacity
                key={c.id}
                style={[styles.chip, category === c.id && styles.chipActive]}
                onPress={() => setCategory(c.id)}
              >
                <Text style={styles.chipEmoji}>{c.emoji}</Text>
                <Text style={[styles.chipLabel, category === c.id && styles.chipLabelActive]}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
            {FIELDS.map(f => (
              <TouchableOpacity
                key={f.id}
                style={[styles.chip, field === f.id && styles.chipActive]}
                onPress={() => setField(f.id)}
              >
                <Text style={[styles.chipLabel, field === f.id && styles.chipLabelActive]}>{f.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TextInput
            style={styles.contentInput}
            value={content}
            onChangeText={setContent}
            placeholder="Write here..."
            placeholderTextColor={Colors.textMuted}
            multiline
            textAlignVertical="top"
          />

          <View style={styles.encryptedNote}>
            <Text style={styles.encryptedText}>🔒 Stored only on this device. Never uploaded.</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// ─── Import Tab ───────────────────────────────────────────────────────────────
function ImportTab({ userId }: { userId: string }) {
  const [rawText, setRawText] = useState('');
  const [field,   setField]   = useState<NoteField>('general');
  const [converting, setConverting] = useState(false);
  const [result,  setResult]  = useState<{ title: string; content: string } | null>(null);

  const handlePasteFromClipboard = async () => {
    const text = await Clipboard.getString();
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
      <Text style={styles.importTitle}>Import & Learn</Text>
      <Text style={styles.importSub}>
        Paste anything — an article, a term, a concept. The AI converts it to our lesson style. Saved locally only.
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        {FIELDS.map(f => (
          <TouchableOpacity key={f.id} style={[styles.chip, field === f.id && styles.chipActive]} onPress={() => setField(f.id)}>
            <Text style={[styles.chipLabel, field === f.id && styles.chipLabelActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TextInput
        style={styles.importInput}
        value={rawText}
        onChangeText={setRawText}
        placeholder="Paste text here, or tap the clipboard button below..."
        placeholderTextColor={Colors.textMuted}
        multiline textAlignVertical="top"
      />

      <TouchableOpacity style={styles.pasteBtn} onPress={handlePasteFromClipboard}>
        <Text style={styles.pasteBtnText}>📋 Paste from Clipboard</Text>
      </TouchableOpacity>

      {!result && (
        <TouchableOpacity
          style={[styles.convertBtn, (!rawText.trim() || converting) && styles.convertBtnDisabled]}
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
        <View style={styles.resultCard}>
          <Text style={styles.resultLabel}>CONVERTED LESSON</Text>
          <Text style={styles.resultTitle}>{result.title}</Text>
          <Text style={styles.resultContent}>{result.content}</Text>
          <View style={styles.resultActions}>
            <TouchableOpacity style={styles.saveNoteBtn} onPress={handleSave}>
              <Text style={styles.saveNoteBtnText}>Save to Diary</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.redoBtn} onPress={() => setResult(null)}>
              <Text style={styles.redoBtnText}>Try again</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function DiaryScreen() {
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
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📓 My Diary</Text>
        <Text style={styles.headerSub}>🔒 Stored only on this device</Text>
      </View>

      <View style={styles.tabBar}>
        {(['notes', 'bookmarks', 'import'] as DiaryTab[]).map(t => (
          <TouchableOpacity key={t} style={[styles.tabBtn, tab === t && styles.tabBtnActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabLabel, tab === t && styles.tabLabelActive]}>
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
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
            {tab === 'notes' && [{ id: 'all', label: 'All' }, ...CATEGORIES.map(c => ({ id: c.id, label: c.label }))].map(c => (
              <TouchableOpacity key={c.id} style={[styles.filterChip, filterCat === c.id && styles.filterChipActive]} onPress={() => setFilterCat(c.id as any)}>
                <Text style={[styles.filterChipText, filterCat === c.id && styles.filterChipTextActive]}>{c.label}</Text>
              </TouchableOpacity>
            ))}
            {[{ id: 'all', label: 'All Fields' }, ...FIELDS.map(f => ({ id: f.id, label: f.label }))].map(f => (
              <TouchableOpacity key={f.id} style={[styles.filterChip, filterField === f.id && styles.filterChipActive]} onPress={() => setFilterField(f.id as any)}>
                <Text style={[styles.filterChipText, filterField === f.id && styles.filterChipTextActive]}>{f.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            {tab === 'notes' && notes.map(note => (
              <TouchableOpacity
                key={note.id}
                style={styles.noteCard}
                onPress={() => { setEditing(note); setShowEditor(true); }}
                onLongPress={() => handleDeleteNote(note.id)}
                activeOpacity={0.8}
              >
                <View style={styles.noteHeader}>
                  <Text style={styles.noteCat}>{CATEGORIES.find(c => c.id === note.category)?.emoji ?? '📝'}</Text>
                  <Text style={styles.noteTitle} numberOfLines={1}>{note.title}</Text>
                </View>
                <Text style={styles.notePreview} numberOfLines={2}>{note.content}</Text>
                <View style={styles.noteMeta}>
                  <Text style={styles.noteMetaText}>{note.field}</Text>
                  {note.level && <Text style={styles.noteMetaText}>{note.level}</Text>}
                  <Text style={styles.noteMetaText}>{new Date(note.updatedAt).toLocaleDateString()}</Text>
                </View>
              </TouchableOpacity>
            ))}

            {tab === 'bookmarks' && bookmarks.map(bm => (
              <View key={bm.id} style={styles.bookmarkCard}>
                <View style={styles.bookmarkMeta}>
                  <Text style={styles.bookmarkField}>{bm.field}</Text>
                  <Text style={styles.bookmarkSep}>·</Text>
                  <Text style={styles.bookmarkLevel}>{bm.level}</Text>
                  <Text style={styles.bookmarkSep}>·</Text>
                  <Text style={styles.bookmarkType}>{bm.lessonType}</Text>
                </View>
                <Text style={styles.bookmarkTitle}>{bm.lessonTitle}</Text>
                <Text style={styles.bookmarkExcerpt} numberOfLines={3}>{bm.excerpt}</Text>
                {bm.note && <Text style={styles.bookmarkNote}>📝 {bm.note}</Text>}
                <TouchableOpacity onPress={() => deleteBookmark(bm.id).then(loadBookmarks)}>
                  <Text style={styles.deleteBookmarkText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}

            <View style={{ height: 100 }} />
          </ScrollView>

          {tab === 'notes' && (
            <TouchableOpacity style={styles.fab} onPress={() => { setEditing(undefined); setShowEditor(true); }}>
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
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: '#fff' },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.text },
  headerSub: { fontSize: FontSize.xs, color: Colors.green, marginTop: 2 },
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Colors.border },
  tabBtn: { flex: 1, paddingVertical: Spacing.sm, alignItems: 'center' },
  tabBtnActive: { borderBottomWidth: 2, borderBottomColor: Colors.accent },
  tabLabel: { fontSize: 11, fontWeight: '600', color: Colors.textSoft },
  tabLabelActive: { color: Colors.accent, fontWeight: '800' },

  filterRow: { maxHeight: 48, borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: '#fff' },
  filterChip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, margin: Spacing.xs, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border },
  filterChipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  filterChipText: { fontSize: 11, color: Colors.textSoft, fontWeight: '600' },
  filterChipTextActive: { color: '#fff', fontWeight: '800' },

  scroll: { flex: 1 },
  noteCard: { backgroundColor: '#fff', margin: Spacing.md, marginBottom: 0, borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm },
  noteHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 6 },
  noteCat: { fontSize: 16 },
  noteTitle: { flex: 1, fontSize: FontSize.sm, fontWeight: '800', color: Colors.text },
  notePreview: { fontSize: FontSize.xs, color: Colors.textSoft, lineHeight: 18, marginBottom: 6 },
  noteMeta: { flexDirection: 'row', gap: Spacing.sm },
  noteMetaText: { fontSize: 10, color: Colors.textMuted, backgroundColor: Colors.bg, paddingHorizontal: 4, paddingVertical: 1, borderRadius: 3 },

  bookmarkCard: { backgroundColor: '#fff', margin: Spacing.md, marginBottom: 0, borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  bookmarkMeta: { flexDirection: 'row', gap: 4, alignItems: 'center', marginBottom: 4 },
  bookmarkField: { fontSize: 10, color: Colors.accent, fontWeight: '700' },
  bookmarkSep: { fontSize: 10, color: Colors.textMuted },
  bookmarkLevel: { fontSize: 10, color: Colors.textMuted },
  bookmarkType: { fontSize: 10, color: Colors.textMuted },
  bookmarkTitle: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  bookmarkExcerpt: { fontSize: FontSize.xs, color: Colors.textSoft, lineHeight: 18, marginBottom: 6 },
  bookmarkNote: { fontSize: FontSize.xs, color: Colors.accent, marginBottom: 6 },
  deleteBookmarkText: { fontSize: FontSize.xs, color: Colors.red, alignSelf: 'flex-end' },

  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center', ...Shadow.md },
  fabText: { color: '#fff', fontSize: 28, fontWeight: '300', lineHeight: 30 },

  // Editor
  editorHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  cancelText: { fontSize: FontSize.sm, color: Colors.textSoft },
  editorTitle: { fontSize: FontSize.md, fontWeight: '800', color: Colors.text },
  saveText: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.accent },
  editorBody: { padding: Spacing.lg },
  titleInput: { fontSize: FontSize.xl, color: Colors.text, marginBottom: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border, paddingBottom: Spacing.sm },
  chipRow: { marginBottom: Spacing.md },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 4, marginRight: Spacing.xs, backgroundColor: '#fff' },
  chipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  chipEmoji: { fontSize: 12 },
  chipLabel: { fontSize: 11, color: Colors.text, fontWeight: '600' },
  chipLabelActive: { color: '#fff', fontWeight: '800' },
  contentInput: { fontSize: FontSize.sm, color: Colors.text, minHeight: 300, lineHeight: 22 },
  encryptedNote: { marginTop: Spacing.xl, padding: Spacing.sm, backgroundColor: Colors.greenSoft, borderRadius: Radius.sm, alignItems: 'center' },
  encryptedText: { fontSize: FontSize.xs, color: Colors.green },

  // Import
  importBody: { padding: Spacing.lg },
  importTitle: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.text, marginBottom: Spacing.sm },
  importSub: { fontSize: FontSize.sm, color: Colors.textSoft, lineHeight: 20, marginBottom: Spacing.lg },
  importInput: { backgroundColor: '#fff', borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, padding: Spacing.md, fontSize: FontSize.sm, color: Colors.text, minHeight: 150, marginBottom: Spacing.sm, textAlignVertical: 'top' },
  pasteBtn: { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center', marginBottom: Spacing.md, backgroundColor: '#fff' },
  pasteBtnText: { fontSize: FontSize.sm, color: Colors.textSoft },
  convertBtn: { backgroundColor: Colors.accent, borderRadius: Radius.lg, padding: Spacing.lg, alignItems: 'center' },
  convertBtnDisabled: { opacity: 0.4 },
  convertBtnText: { color: '#fff', fontWeight: '800', fontSize: FontSize.md },
  resultCard: { marginTop: Spacing.lg, backgroundColor: '#fff', borderRadius: Radius.md, padding: Spacing.lg, borderWidth: 2, borderColor: Colors.accent },
  resultLabel: { fontSize: 9, fontWeight: '800', color: Colors.accent, letterSpacing: 1, marginBottom: Spacing.sm },
  resultTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.text, marginBottom: Spacing.md },
  resultContent: { fontSize: FontSize.sm, color: Colors.text, lineHeight: 22, marginBottom: Spacing.lg },
  resultActions: { flexDirection: 'row', gap: Spacing.sm },
  saveNoteBtn: { flex: 1, backgroundColor: Colors.accent, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center' },
  saveNoteBtnText: { color: '#fff', fontWeight: '800', fontSize: FontSize.sm },
  redoBtn: { padding: Spacing.md, alignItems: 'center' },
  redoBtnText: { fontSize: FontSize.sm, color: Colors.textSoft },
});
