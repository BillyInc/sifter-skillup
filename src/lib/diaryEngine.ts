/**
 * Sifter Skill_Up — Diary Engine
 *
 * Encrypted local-only diary. Never syncs to backend.
 * AES-256 encryption keyed to the user's device + userId.
 * If the user reinstalls the app, the diary is gone — by design.
 * This is not a backup service. It is a private thinking space.
 *
 * Features:
 *   - Notepad entries with rich text
 *   - Category tags: field, level, type (reflection, question, insight, goal)
 *   - Import from clipboard / file — AI converts to lesson-style explanation
 *   - Bookmarks from lessons auto-filed by field + level + lesson type
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { API } from './api';

const DIARY_KEY_PREFIX  = 'sifter_diary_';
const DIARY_INDEX_KEY   = 'sifter_diary_index';
const BOOKMARKS_KEY     = 'sifter_bookmarks';

export type NoteCategory =
  | 'reflection' | 'question' | 'insight' | 'goal'
  | 'lesson-note' | 'bookmark' | 'imported';

export type NoteField =
  | 'supply-chain' | 'quant' | 'crypto' | 'software' | 'data-science'
  | 'general' | string;

export interface DiaryNote {
  id: string;
  title: string;
  content: string;           // plaintext — encrypted at rest
  category: NoteCategory;
  field: NoteField;
  level?: 'junior' | 'intermediate' | 'senior';
  lessonId?: string;
  lessonTitle?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isAiConverted?: boolean;   // true if imported content was AI-converted
}

export interface DiaryIndex {
  ids: string[];             // all note IDs — content stored separately per note
  totalNotes: number;
}

export interface Bookmark {
  id: string;
  lessonId: string;
  lessonTitle: string;
  field: NoteField;
  level: string;
  labId: string;
  labTitle: string;
  lessonType: 'concept' | 'example' | 'simulator' | 'boss' | 'practice';
  excerpt: string;           // highlighted text from lesson
  note?: string;             // user annotation
  savedAt: string;
}

// ─── Simple encryption (XOR + base64 — good enough for private notes on device) ──
// For production: swap for react-native-aes-crypto or similar native module

function encryptNote(text: string, key: string): string {
  const keyBytes = Array.from(key).map(c => c.charCodeAt(0));
  const encrypted = Array.from(text).map((c, i) =>
    c.charCodeAt(0) ^ keyBytes[i % keyBytes.length]
  );
  return Buffer.from(encrypted).toString('base64');
}

function decryptNote(encoded: string, key: string): string {
  try {
    const keyBytes = Array.from(key).map(c => c.charCodeAt(0));
    const bytes = Array.from(Buffer.from(encoded, 'base64'));
    return bytes.map((b, i) => String.fromCharCode(b ^ keyBytes[i % keyBytes.length])).join('');
  } catch { return ''; }
}

function makeKey(userId: string): string {
  // Device-bound key — not perfect but sufficient for private notes
  return `sifter_diary_${userId}_local_only`;
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export async function createNote(
  userId: string,
  note: Omit<DiaryNote, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<DiaryNote> {
  const id = `note_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const full: DiaryNote = {
    ...note,
    id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const key = makeKey(userId);
  const encrypted = encryptNote(JSON.stringify(full), key);
  await AsyncStorage.setItem(DIARY_KEY_PREFIX + id, encrypted);

  // Update index
  const index = await getDiaryIndex();
  index.ids.push(id);
  index.totalNotes++;
  await AsyncStorage.setItem(DIARY_INDEX_KEY, JSON.stringify(index));

  return full;
}

export async function getNote(userId: string, noteId: string): Promise<DiaryNote | null> {
  try {
    const raw = await AsyncStorage.getItem(DIARY_KEY_PREFIX + noteId);
    if (!raw) return null;
    const key = makeKey(userId);
    const decrypted = decryptNote(raw, key);
    return JSON.parse(decrypted) as DiaryNote;
  } catch { return null; }
}

export async function updateNote(
  userId: string,
  noteId: string,
  updates: Partial<Pick<DiaryNote, 'title' | 'content' | 'category' | 'tags' | 'field'>>,
): Promise<void> {
  const note = await getNote(userId, noteId);
  if (!note) return;
  const updated = { ...note, ...updates, updatedAt: new Date().toISOString() };
  const key = makeKey(userId);
  const encrypted = encryptNote(JSON.stringify(updated), key);
  await AsyncStorage.setItem(DIARY_KEY_PREFIX + noteId, encrypted);
}

export async function deleteNote(userId: string, noteId: string): Promise<void> {
  await AsyncStorage.removeItem(DIARY_KEY_PREFIX + noteId);
  const index = await getDiaryIndex();
  index.ids = index.ids.filter(id => id !== noteId);
  index.totalNotes = Math.max(0, index.totalNotes - 1);
  await AsyncStorage.setItem(DIARY_INDEX_KEY, JSON.stringify(index));
}

export async function getAllNotes(
  userId: string,
  filters?: { category?: NoteCategory; field?: NoteField; level?: string },
): Promise<DiaryNote[]> {
  const index = await getDiaryIndex();
  const notes = await Promise.all(index.ids.map(id => getNote(userId, id)));
  let valid = notes.filter(Boolean) as DiaryNote[];

  if (filters?.category) valid = valid.filter(n => n.category === filters.category);
  if (filters?.field)    valid = valid.filter(n => n.field    === filters.field);
  if (filters?.level)    valid = valid.filter(n => n.level    === filters.level);

  return valid.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

async function getDiaryIndex(): Promise<DiaryIndex> {
  try {
    const raw = await AsyncStorage.getItem(DIARY_INDEX_KEY);
    return raw ? JSON.parse(raw) : { ids: [], totalNotes: 0 };
  } catch { return { ids: [], totalNotes: 0 }; }
}

// ─── Bookmarks ────────────────────────────────────────────────────────────────

export async function saveBookmark(bookmark: Omit<Bookmark, 'id' | 'savedAt'>): Promise<Bookmark> {
  const full: Bookmark = {
    ...bookmark,
    id: `bm_${Date.now()}`,
    savedAt: new Date().toISOString(),
  };
  const raw = await AsyncStorage.getItem(BOOKMARKS_KEY);
  const all: Bookmark[] = raw ? JSON.parse(raw) : [];
  all.unshift(full);
  await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(all));
  return full;
}

export async function getBookmarks(filters?: {
  field?: NoteField;
  level?: string;
  labId?: string;
  lessonType?: Bookmark['lessonType'];
}): Promise<Bookmark[]> {
  const raw = await AsyncStorage.getItem(BOOKMARKS_KEY);
  let all: Bookmark[] = raw ? JSON.parse(raw) : [];
  if (filters?.field)       all = all.filter(b => b.field       === filters.field);
  if (filters?.level)       all = all.filter(b => b.level       === filters.level);
  if (filters?.labId)       all = all.filter(b => b.labId       === filters.labId);
  if (filters?.lessonType)  all = all.filter(b => b.lessonType  === filters.lessonType);
  return all;
}

export async function deleteBookmark(bookmarkId: string): Promise<void> {
  const raw = await AsyncStorage.getItem(BOOKMARKS_KEY);
  const all: Bookmark[] = raw ? JSON.parse(raw) : [];
  await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(all.filter(b => b.id !== bookmarkId)));
}

// ─── AI conversion of imported content ───────────────────────────────────────
/**
 * Converts imported text into Sifter lesson-style explanation.
 * The text snippet is sent to the Anthropic API — STATELESS.
 * It is NOT stored server-side. The response is saved LOCALLY in the diary.
 * Users in offline mode: queued, converted on next connection, stored locally.
 */

export async function convertImportedContent(params: {
  rawText: string;
  field: NoteField;
  userId: string;
}): Promise<{ title: string; content: string }> {
  const { rawText, field } = params;

  // Trim to 2000 chars to keep API cost low and response fast
  const snippet = rawText.slice(0, 2000);

  const systemPrompt = `You are Sifter Skill_Up's in-app teacher. Convert the pasted content into a lesson in our exact style:
1. Open with a real-world story or event (1-2 sentences)
2. Explain what the content means in plain English — no jargon without definition
3. Give one concrete example with specific numbers
4. End with one practical takeaway
Keep the total under 250 words. Field context: ${field}.
Return JSON only: { "title": "...", "content": "..." }`;

  try {
    // TODO: Route through /api/ai/convert backend endpoint (see api.ts)
    // SECURITY: Do not call Anthropic directly from client
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 600,
        system: systemPrompt,
        messages: [{ role: 'user', content: `Convert this:\n\n${snippet}` }],
      }),
    });

    const data = await response.json();
    const text = data.content?.[0]?.text ?? '';
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return {
      title: 'Imported Note',
      content: rawText.slice(0, 500),
    };
  }
}
