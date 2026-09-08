import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Pressable, Platform,
  SafeAreaView, StatusBar, Modal, TextInput, Share,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLessonEngine, type Question } from '../hooks/useLessonEngine';
import { useProgress } from '../hooks/useProgress';
import { useAuth } from '@/hooks/useAuth';
import { useResume } from '../hooks/useResume';
import { API, API_BASE } from '../lib/api';
import { findTrackById } from '../lib/trackContext';
import { getLevel, LEVELS } from '../data/levels';
import { getIslandForLevel } from '../data/islands';
import {
  getAuthoredLessonSummary,
  getAuthoredLessonTopic,
} from '../data/tracks/starknet_ecosystem/authoredLesson';
import { getStarknetTrackBossLevel } from '../data/tracks/starknet_ecosystem/bossLevels';
import {
  STARKNET_LEVELS,
  getStarknetIslandLevel,
} from '../data/tracks/starknet_ecosystem/island/levels';
import {
  isStarknetTrack,
  getStarknetLab,
  getStarknetLessonRuntimeId,
  type StarknetTrackId,
} from '../data/tracks/starknet_ecosystem/starknetLessonRegistry';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../theme';
import SimulatorCard from '../components/simulators/SimulatorCard';
import StarknetFaucetButton from '../components/StarknetFaucetButton';
import DisclaimerFooter from '../components/DisclaimerFooter';
import { shuffleOptionsWithCorrectTracking } from '../lib/shuffleOptions';
import FlagModal from '../components/FlagModal';
import { TrackChoiceScreen } from './PostIslandTrackSelection';
import {
  deleteBookmark as deleteDiaryBookmark,
  getBookmarks as getDiaryBookmarks,
  saveBookmark as saveDiaryBookmark,
} from '../lib/diaryEngine';

// ── Animated layer components ──────────────────────────────────
import LessonXPBar, { type LessonMood } from '../components/LessonXPBar';
import CelebrationOverlay, { type CelebrationEventType } from '../components/CelebrationOverlay';
import AIExplainer from '../components/AIExplainer';
import LessonTransition from '../components/LessonTransition';

// ── Types ─────────────────────────────────────────────────────
interface Props {
  levelId: number;
  onExit: () => void;
  onComplete: (stars: number, xp: number) => void;
  onNavigateToLesson?: (levelId: number) => void;
  // Starknet lab lessons: when these are provided AND it's not a boss, the
  // lesson is resolved from starknetLessonRegistry instead of the flat
  // numeric LEVELS table. Boss levels (3001-3011, 4001-4015, 5001-5020 etc.)
  // still fall through to the numeric lookup for backward compat.
  trackId?: string;
  labId?: string;
  labNumber?: number;
  lessonIndex?: number;
  isBoss?: boolean;
}

interface TermLink {
  term: string;
  summary: string;
  originLevelId: number;
  originTopic: string;
}

interface Bookmark {
  levelId: number;
  topic: string;
  fact: string;
  savedAt: number;
}

interface Note {
  id: string;
  levelId: number;
  topic: string;
  content: string;
  createdAt: number;
}

function getLessonParagraphs(text?: string): string[] {
  if (!text) return [];
  return text
    .split(/\n\s*\n+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0 && part !== '---');
}

// ── Storage ───────────────────────────────────────────────────
const BOOKMARKS_KEY = 'sifter_bookmarks_v1';
const NOTES_KEY     = 'sifter_notes_v1';

async function loadBookmarks(): Promise<Bookmark[]> {
  try { const r = await AsyncStorage.getItem(BOOKMARKS_KEY); return r ? JSON.parse(r) : []; } catch { return []; }
}
async function saveBookmarks(bm: Bookmark[]) {
  try { await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bm)); } catch {}
}
async function loadNotes(): Promise<Note[]> {
  try { const r = await AsyncStorage.getItem(NOTES_KEY); return r ? JSON.parse(r) : []; } catch { return []; }
}
async function saveNotes(notes: Note[]) {
  try { await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(notes)); } catch {}
}

// ── Term detection ────────────────────────────────────────────
function escapeRe(s: string) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function detectTermLinks(currentLevelId: number, text: string): TermLink[] {
  const links: TermLink[] = [];
  const seen = new Set<string>();
  const glossaryLevels = [
    ...Object.values(LEVELS),
    ...Object.values(STARKNET_LEVELS as Record<number, any>),
  ];
  glossaryLevels.forEach(level => {
    if (level.id >= currentLevelId || !level.glossaryWord) return;
    const t = level.glossaryWord.toLowerCase();
    if (seen.has(t)) return;
    if (new RegExp(`\\b${escapeRe(t)}\\b`, 'i').test(text)) {
      seen.add(t);
      links.push({ term: level.glossaryWord, summary: level.fact, originLevelId: level.id, originTopic: level.topic });
    }
  });
  return links;
}

// ── Export helper ─────────────────────────────────────────────
async function exportAll() {
  const [bm, notes] = await Promise.all([loadBookmarks(), loadNotes()]);
  let txt = '============================\n  SIFTER LEVELUP — MY STUDY EXPORT\n';
  txt += `  ${new Date().toLocaleString()}\n============================\n\n`;
  txt += '── BOOKMARKS ───────────────────────────\n\n';
  if (bm.length) bm.forEach((b,i) => { txt += `${i+1}. ${b.topic}\n   ${b.fact}\n   Saved: ${new Date(b.savedAt).toLocaleDateString()}\n\n`; });
  else txt += '   No bookmarks yet.\n\n';
  txt += '── NOTES ───────────────────────────────\n\n';
  if (notes.length) {
    const byTopic: Record<string,Note[]> = {};
    notes.forEach(n => { byTopic[n.topic] = byTopic[n.topic] || []; byTopic[n.topic].push(n); });
    Object.entries(byTopic).forEach(([topic, ns]) => {
      txt += `📚 ${topic}\n`;
      ns.forEach(n => { txt += `   • ${n.content}\n     (${new Date(n.createdAt).toLocaleDateString()})\n`; });
      txt += '\n';
    });
  } else txt += '   No notes yet.\n';
  try { await Share.share({ message: txt, title: 'Sifter Study Export' }); } catch {}
}

// ── Term Link Modal ───────────────────────────────────────────
function TermLinkModal({ link, visible, onClose, onGoToLesson }: {
  link: TermLink | null; visible: boolean; onClose: () => void; onGoToLesson: (id: number) => void;
}) {
  if (!link) return null;
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={sty.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={sty.termModal}>
          <View style={sty.termModalHead}>
            <Text style={sty.termModalIcon}>🔗</Text>
            <Text style={sty.termModalTitle}>{link.originTopic}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{top:10,bottom:10,left:10,right:10}}>
              <Text style={{fontSize:20,color:Colors.textSoft}}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={sty.termModalBody}>{link.summary}</Text>
          <TouchableOpacity style={sty.termModalBtn} onPress={() => { onClose(); onGoToLesson(link.originLevelId); }} activeOpacity={0.85}>
            <Text style={sty.termModalBtnText}>View Lesson {link.originLevelId} →</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

// ── Notes Panel ───────────────────────────────────────────────
function NotesPanel({ visible, levelId, topic, onClose }: {
  visible: boolean; levelId: number; topic: string; onClose: () => void;
}) {
  const [myNotes, setMyNotes] = useState<Note[]>([]);
  const [draft, setDraft]     = useState('');

  useEffect(() => {
    if (visible) loadNotes().then(all => setMyNotes(all.filter(n => n.levelId === levelId)));
  }, [visible, levelId]);

  const addNote = async () => {
    if (!draft.trim()) return;
    const all = await loadNotes();
    const n: Note = { id: `${Date.now()}`, levelId, topic, content: draft.trim(), createdAt: Date.now() };
    await saveNotes([n, ...all]);
    setMyNotes(prev => [n, ...prev]);
    setDraft('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const deleteNote = async (id: string) => {
    const all = await loadNotes();
    await saveNotes(all.filter(n => n.id !== id));
    setMyNotes(prev => prev.filter(n => n.id !== id));
  };

  if (!visible) return null;
  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={sty.notePanel}>
        <View style={sty.notePanelHead}>
          <Text style={sty.notePanelTitle}>📝 Notes</Text>
          <Text style={{flex:1,fontSize:FontSize.sm,color:Colors.textSoft,marginLeft:Spacing.sm}} numberOfLines={1}>{topic}</Text>
          <TouchableOpacity onPress={onClose}><Text style={{fontSize:20,color:Colors.textSoft}}>✕</Text></TouchableOpacity>
        </View>
        <View style={sty.noteDraftRow}>
          <TextInput
            style={sty.noteDraftInput} placeholder="Add a note…" placeholderTextColor={Colors.textMuted}
            value={draft} onChangeText={setDraft} multiline maxLength={500}
          />
          <TouchableOpacity style={sty.noteSaveBtn} onPress={addNote} activeOpacity={0.85}>
            <Text style={sty.noteSaveBtnTxt}>Save</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={{padding:Spacing.lg,gap:Spacing.md}}>
          {myNotes.length === 0 && <Text style={{color:Colors.textMuted,textAlign:'center',marginTop:Spacing.xxl}}>No notes for this lesson yet.</Text>}
          {myNotes.map(n => (
            <View key={n.id} style={sty.noteCard}>
              <Text style={sty.noteContent}>{n.content}</Text>
              <View style={sty.noteFooter}>
                <Text style={sty.noteDate}>{new Date(n.createdAt).toLocaleDateString()}</Text>
                <TouchableOpacity onPress={() => deleteNote(n.id)}><Text style={{color:Colors.red,fontSize:FontSize.sm}}>Delete</Text></TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

// ── Top bar (upgraded with LessonXPBar) ──────────────────────
function TopActionButton({
  icon,
  label,
  onPress,
  color,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  color?: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <View style={sty.topActionWrap}>
      {Platform.OS === 'web' && hovered ? (
        <View style={sty.topActionTooltip}>
          <Text style={sty.topActionTooltipText}>{label}</Text>
        </View>
      ) : null}
      <Pressable
        onPress={onPress}
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        style={sty.topActionBtn}
      >
        <Text style={{fontSize:18,color:color ?? Colors.textSoft,fontWeight:'800'}}>{icon}</Text>
      </Pressable>
    </View>
  );
}

function TopBar({ progress, hearts, onExit, isBookmarked, onBookmark, onNotes, onExport, onFlag,
  totalXp, sessionXp, correctStreak, mood, onAIExplainer }: {
  progress:number; hearts:number; onExit:()=>void;
  isBookmarked:boolean; onBookmark:()=>void; onNotes:()=>void; onExport:()=>void; onFlag:()=>void;
  totalXp: number; sessionXp: number; correctStreak: number; mood: LessonMood;
  onAIExplainer: () => void;
}) {
  return (
    <View style={sty.topBar}>
      <TouchableOpacity onPress={onExit} style={sty.exitBtn} hitSlop={{top:10,bottom:10,left:10,right:10}}>
        <Text style={sty.exitTxt}>✕</Text>
      </TouchableOpacity>

      {/* LessonXPBar replaces the plain progress bar */}
      <View style={{ flex: 1 }}>
        <LessonXPBar
          totalXp={totalXp}
          sessionXp={sessionXp}
          correctStreak={correctStreak}
          mood={mood}
          compact
        />
      </View>

      <View style={sty.topActionsAccessible}>
        <TopActionButton icon="💡" label="Explain" onPress={onAIExplainer} />
        <TopActionButton icon={isBookmarked ? '🔖' : '🏷️'} label={isBookmarked ? 'Bookmarked' : 'Bookmark'} onPress={onBookmark} color={isBookmarked?Colors.gold:Colors.textSoft} />
        <TopActionButton icon="📝" label="Notes" onPress={onNotes} />
        <TopActionButton icon="🚩" label="Flag" onPress={onFlag} />
        <TopActionButton icon="⬆️" label="Export" onPress={onExport} />
      </View>
      <View style={sty.topActions}>
        <TouchableOpacity onPress={onAIExplainer} hitSlop={{top:8,bottom:8,left:8,right:8}}>
          <Text style={{fontSize:20}}>💡</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onBookmark} hitSlop={{top:8,bottom:8,left:8,right:8}}>
          <Text style={{fontSize:20,color:isBookmarked?Colors.gold:Colors.textSoft}}>{isBookmarked?'🔖':'🏷️'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onNotes} hitSlop={{top:8,bottom:8,left:8,right:8}}>
          <Text style={{fontSize:20}}>📝</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onFlag} hitSlop={{top:8,bottom:8,left:8,right:8}}>
          <Text style={{fontSize:18}}>🚩</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onExport} hitSlop={{top:8,bottom:8,left:8,right:8}}>
          <Text style={{fontSize:20}}>⬆️</Text>
        </TouchableOpacity>
        <View style={sty.hearts}>
          {Array.from({length:5},(_,i)=>(
            <Text key={i} style={[sty.heart,{color:i<hearts?Colors.red:Colors.border}]}>♥</Text>
          ))}
        </View>
      </View>
    </View>
  );
}

// ── Return banner ─────────────────────────────────────────────
function ReturnBanner({ topic, onReturn }: { topic: string; onReturn: () => void }) {
  return (
    <TouchableOpacity style={sty.returnBanner} onPress={onReturn} activeOpacity={0.85}>
      <Text style={sty.returnTxt}>← Back to &quot;{topic}&quot;</Text>
    </TouchableOpacity>
  );
}

// ── Concept card with term links ──────────────────────────────
function LessonNavRow({ previousTopic, onPrevious }: {
  previousTopic?: string | null; onPrevious?: (() => void) | null;
}) {
  if (!previousTopic || !onPrevious) return null;
  return (
    <View style={sty.lessonNavRow}>
      <TouchableOpacity style={sty.lessonNavBtn} onPress={onPrevious} activeOpacity={0.85}>
        <Text style={sty.lessonNavBtnText}>Previous lesson: {previousTopic}</Text>
      </TouchableOpacity>
    </View>
  );
}

function LessonStepBackRow({ canGoBack, onBack }: {
  canGoBack: boolean;
  onBack: () => void;
}) {
  if (!canGoBack) return null;
  return (
    <View style={sty.lessonNavRow}>
      <TouchableOpacity style={sty.lessonNavBtn} onPress={onBack} activeOpacity={0.85}>
        <Text style={sty.lessonNavBtnText}>Previous step in this lesson</Text>
      </TouchableOpacity>
    </View>
  );
}

function ConceptCard({ q, onNext, levelId, onTermPress }: {
  q: Question; onNext: () => void; levelId: number; onTermPress: (link: TermLink) => void;
}) {
  const tc = q.tier === 'beginner' ? Colors.beginner : q.tier === 'intermediate' ? Colors.intermediate : Colors.pro;
  const tl = q.tier === 'beginner' ? '🟢 Beginner' : q.tier === 'intermediate' ? '🟡 Intermediate' : '🔵 Pro';
  const lessonParagraphs = getLessonParagraphs(q.lessonBody);
  const takeaway = q.keyTakeaway ?? q.fact;
  const fullText = [q.lessonBody, q.fact, q.plain].filter(Boolean).join(' ');
  const termLinks = detectTermLinks(levelId, fullText);

  return (
    <ScrollView style={sty.body} contentContainerStyle={sty.bodyContent} showsVerticalScrollIndicator={false}>
      <View style={[sty.card, Shadow.md]}>
        <View style={[sty.tierBadge,{backgroundColor:tc+'20',borderColor:tc+'50'}]}>
          <Text style={[sty.tierLabel,{color:tc}]}>{tl}</Text>
        </View>
        <Text style={sty.conceptTopic}>{q.topic}</Text>
        <View style={[sty.divider,{backgroundColor:tc}]}/>
        {lessonParagraphs.length > 0 ? (
          <View style={sty.lessonBodyWrap}>
            {lessonParagraphs.map((paragraph, index) => (
              <Text key={`${index}-${paragraph.slice(0, 24)}`} style={sty.lessonParagraph}>
                {paragraph}
              </Text>
            ))}
          </View>
        ) : takeaway ? (
          <Text style={sty.conceptFact}>{takeaway}</Text>
        ) : null}
        {takeaway ? (
          <View style={sty.takeawayBox}>
            <Text style={sty.takeawayLabel}>Key Takeaway</Text>
            <Text style={sty.takeawayText}>{takeaway}</Text>
          </View>
        ) : null}
        {q.plain && q.plain !== takeaway ? (
          <View style={sty.analogy}>
            <Text style={sty.analogyLabel}>💡 THINK OF IT LIKE THIS</Text>
            <Text style={sty.analogyText}>{q.plain}</Text>
          </View>
        ) : null}
        {q.examples && q.examples.length > 0 ? (
          <View style={sty.exampleSection}>
            <Text style={sty.exampleSectionLabel}>Worked Examples</Text>
            {q.examples.slice(0, 3).map((example, index) => (
              <View key={`${index}-${example.scenario.slice(0, 24)}`} style={sty.exampleCard}>
                {example.contextTag ? <Text style={sty.exampleTag}>{example.contextTag}</Text> : null}
                {example.context ? <Text style={sty.exampleContext}>{example.context}</Text> : null}
                <Text style={sty.exampleScenario}>{example.scenario}</Text>
                <Text style={sty.exampleOutcome}>{example.outcome}</Text>
              </View>
            ))}
          </View>
        ) : null}
        {termLinks.length > 0 && (
          <View style={sty.termSection}>
            <Text style={sty.termSectionLabel}>🔗 Terms from earlier lessons — tap to review</Text>
            <View style={sty.termRow}>
              {termLinks.map(link => (
                <TouchableOpacity key={link.term} onPress={() => onTermPress(link)} style={sty.termBadge} activeOpacity={0.75}>
                  <Text style={sty.termBadgeTxt}>🔗 {link.term}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>
      <TouchableOpacity style={[sty.primaryBtn,{marginTop:Spacing.xl}]} onPress={onNext} activeOpacity={0.85}>
        <Text style={sty.primaryBtnTxt}>Got it →</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ── MCQ ───────────────────────────────────────────────────────
function MCQQuestion({ q, onCorrect, onWrong }: { q: Question; onCorrect:()=>void; onWrong:()=>void }) {
  const [chosen, setChosen] = useState<number|null>(null);
  const opts = q.options || [];
  
  // Shuffle options at render time
  const shuffled = useMemo(() => {
    if (!opts.length) return { shuffledOptions: [], newCorrectIndex: 0 };
    return shuffleOptionsWithCorrectTracking(opts.map(o => o.text), Number(q.correct ?? 0));
  }, [opts, q.correct]);
  
  const shuffledOptions = shuffled.shuffledOptions;
  const correctIndex = shuffled.newCorrectIndex;
  
  const handleTap = async (i: number) => {
    if (chosen !== null) return;
    setChosen(i);
    const ok = i === correctIndex;
    await Haptics.impactAsync(ok ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Heavy);
    setTimeout(() => ok ? onCorrect() : onWrong(), 800);
  };
  return (
    <ScrollView style={sty.body} contentContainerStyle={sty.bodyContent} showsVerticalScrollIndicator={false}>
      <View style={[sty.card, Shadow.md]}>
        {q.context ? <Text style={sty.qCtx}>{q.context}</Text> : null}
        <Text style={sty.qPrompt}>{q.prompt}</Text>
      </View>
      <View style={{marginTop:Spacing.lg,gap:Spacing.sm}}>
        {shuffledOptions.map((opt,i)=>{
          const isCh=chosen===i, isOk=i===correctIndex, rev=chosen!==null;
          let bg=Colors.card, bc=Colors.border, tc=Colors.text;
          if(rev&&isOk){bg=Colors.greenSoft;bc=Colors.green;}
          if(rev&&isCh&&!isOk){bg=Colors.redSoft;bc=Colors.red;tc=Colors.red;}
          return (
            <TouchableOpacity key={i} onPress={()=>handleTap(i)} disabled={chosen!==null}
              style={[sty.optBtn,{backgroundColor:bg,borderColor:bc},Shadow.sm]} activeOpacity={0.8}>
              <View style={[sty.optLetter,{backgroundColor:rev&&isOk?Colors.green:rev&&isCh?Colors.red:Colors.border}]}>
                <Text style={[sty.optLetterTxt,{color:rev&&(isOk||isCh)?'#fff':Colors.textSoft}]}>{'ABCD'[i]}</Text>
              </View>
              <Text style={[sty.optTxt,{color:tc}]}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

// ── True / False ──────────────────────────────────────────────
function TrueFalseQuestion({ q, onCorrect, onWrong }: { q:Question; onCorrect:()=>void; onWrong:()=>void }) {
  const [chosen, setChosen] = useState<boolean|null>(null);
  const handleTap = async (val:boolean) => {
    if (chosen!==null) return;
    setChosen(val);
    const ok=val===q.correct;
    await Haptics.impactAsync(ok?Haptics.ImpactFeedbackStyle.Medium:Haptics.ImpactFeedbackStyle.Heavy);
    setTimeout(()=>ok?onCorrect():onWrong(),700);
  };
  return (
    <View style={sty.body}>
      <View style={[sty.card,Shadow.md]}>
        <Text style={sty.qCtx}>True or False?</Text>
        <Text style={[sty.qPrompt,{fontStyle:'italic'}]}>&quot;{q.prompt}&quot;</Text>
      </View>
      <View style={[sty.tfRow,{marginTop:Spacing.xxl}]}>
        {[{val:true,label:'✓  TRUE',bg:'#d1fae5',color:'#065f46'},{val:false,label:'✗  FALSE',bg:'#fee2e2',color:'#7f1d1d'}].map(({val,label,bg,color})=>{
          const isCh=chosen===val, rev=chosen!==null, isOk=val===q.correct;
          let fb=bg, fc=color;
          if(rev&&isCh&&isOk){fb=Colors.green;fc='#fff';}
          if(rev&&isCh&&!isOk){fb=Colors.red;fc='#fff';}
          return (
            <TouchableOpacity key={String(val)} onPress={()=>handleTap(val)} disabled={chosen!==null}
              style={[sty.tfBtn,{backgroundColor:fb}]} activeOpacity={0.8}>
              <Text style={[sty.tfTxt,{color:fc}]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ── Order ─────────────────────────────────────────────────────
function OrderQuestion({ q, onCorrect, onWrong }: { q:Question; onCorrect:()=>void; onWrong:()=>void }) {
  const [placed,setPlaced]=useState<string[]>([]);
  const [checked,setChecked]=useState(false);
  const remaining=(q.items||[]).filter(x=>!placed.includes(x));
  const addItem=(item:string)=>{if(!checked)setPlaced(p=>[...p,item]);};
  const removeItem=(i:number)=>{if(!checked)setPlaced(p=>p.filter((_,idx)=>idx!==i));};
  const check=async()=>{
    setChecked(true);
    const ok=placed.every((x,i)=>x===(q.answer||[])[i]);
    await Haptics.impactAsync(ok?Haptics.ImpactFeedbackStyle.Medium:Haptics.ImpactFeedbackStyle.Heavy);
    setTimeout(()=>ok?onCorrect():onWrong(),800);
  };
  return (
    <ScrollView style={sty.body} contentContainerStyle={sty.bodyContent}>
      <View style={[sty.card,Shadow.md]}>
        {q.context?<Text style={sty.qCtx}>{q.context}</Text>:null}
        <Text style={sty.qPrompt}>{q.prompt}</Text>
        <View style={{marginTop:Spacing.md,gap:Spacing.sm}}>
          {(q.answer||[]).map((_,i)=>(
            <View key={i} style={placed[i]?sty.orderFilled:sty.orderEmpty}>
              <View style={sty.orderNum}><Text style={sty.orderNumTxt}>{i+1}</Text></View>
              {placed[i]?(<><Text style={sty.orderSlotTxt}>{placed[i]}</Text><TouchableOpacity onPress={()=>removeItem(i)}><Text style={{color:Colors.textSoft,fontSize:18}}>×</Text></TouchableOpacity></>):(<Text style={sty.orderPlaceholder}>Tap a step below…</Text>)}
            </View>
          ))}
        </View>
      </View>
      <View style={{flexDirection:'row',flexWrap:'wrap',gap:Spacing.sm,marginTop:Spacing.lg}}>
        {remaining.map(item=>(<TouchableOpacity key={item} onPress={()=>addItem(item)} style={sty.orderChip}><Text style={sty.orderChipTxt}>{item}</Text></TouchableOpacity>))}
      </View>
      {placed.length===(q.answer||[]).length&&!checked&&(
        <TouchableOpacity style={[sty.primaryBtn,{marginTop:Spacing.xl}]} onPress={check} activeOpacity={0.85}>
          <Text style={sty.primaryBtnTxt}>Check →</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

// ── Multi-select ──────────────────────────────────────────────
function MultiSelectQuestion({ q, onCorrect, onWrong }: { q:Question; onCorrect:()=>void; onWrong:()=>void }) {
  const [selected,setSelected]=useState<Set<number>>(new Set());
  const opts=q.options||[];
  
  // Shuffle options at render time
  const shuffled = useMemo(() => {
    if (!opts.length) return { shuffledOptions: [], correctIndices: [] };
    const shuffledOptions = [...opts];
    for (let i = shuffledOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
    }
    return {
      shuffledOptions: shuffledOptions.map((o) => o.text),
      correctIndices: shuffledOptions.map((o, i) => o.correct ? i : -1).filter(i => i >= 0),
    };
  }, [opts]);
  
  const toggle=(i:number)=>setSelected(prev=>{const s=new Set(prev);s.has(i)?s.delete(i):s.add(i);return s;});
  const check=async()=>{
    const cIdx = shuffled.correctIndices;
    const ok=cIdx.every(i=>selected.has(i))&&selected.size===cIdx.length;
    await Haptics.impactAsync(ok?Haptics.ImpactFeedbackStyle.Medium:Haptics.ImpactFeedbackStyle.Heavy);
    ok?onCorrect():onWrong();
  };
  return (
    <View style={sty.body}>
      <View style={[sty.card,Shadow.md]}><Text style={sty.qPrompt}>{q.prompt}</Text></View>
      <View style={{marginTop:Spacing.lg,gap:Spacing.sm}}>
        {shuffled.shuffledOptions.map((opt,i)=>{
          const sel=selected.has(i);
          return (
            <TouchableOpacity key={i} onPress={()=>toggle(i)}
              style={[sty.optBtn,{borderColor:sel?Colors.accent:Colors.border,backgroundColor:sel?Colors.accentSoft:Colors.card}]} activeOpacity={0.8}>
              <View style={[sty.checkbox,{backgroundColor:sel?Colors.accent:'transparent',borderColor:sel?Colors.accent:Colors.border}]}>
                {sel&&<Text style={{color:'#fff',fontSize:12,fontWeight:'800'}}>✓</Text>}
              </View>
              <Text style={[sty.optTxt,{color:sel?Colors.accent:Colors.text}]}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {selected.size>0&&(<TouchableOpacity style={[sty.primaryBtn,{marginTop:Spacing.xl}]} onPress={check} activeOpacity={0.85}><Text style={sty.primaryBtnTxt}>Check →</Text></TouchableOpacity>)}
    </View>
  );
}

// ── Match pairs ───────────────────────────────────────────────
function MatchPairsQuestion({ q, onCorrect, onWrong }: { q:Question; onCorrect:()=>void; onWrong:()=>void }) {
  const pairs=q.pairs||[];
  const terms=pairs.map(p=>p.term);
  const defs=React.useMemo(()=>shuffle([...pairs.map(p=>p.def)]),[]);
  const [matched,setMatched]=useState<Record<string,string>>({});
  const [selTerm,setSelTerm]=useState<string|null>(null);
  const [checked,setChecked]=useState(false);
  const handleTermTap=(term:string)=>{if(checked)return;setSelTerm(prev=>prev===term?null:term);};
  const handleDefTap=(def:string)=>{if(checked||!selTerm)return;setMatched(prev=>({...prev,[selTerm]:def}));setSelTerm(null);};
  const allMatched=Object.keys(matched).length===pairs.length;
  const check=async()=>{
    setChecked(true);
    const ok=pairs.every(p=>matched[p.term]===p.def);
    await Haptics.impactAsync(ok?Haptics.ImpactFeedbackStyle.Medium:Haptics.ImpactFeedbackStyle.Heavy);
    setTimeout(()=>ok?onCorrect():onWrong(),800);
  };
  return (
    <ScrollView style={sty.body} contentContainerStyle={sty.bodyContent}>
      <View style={[sty.card,Shadow.md]}>
        {q.context?<Text style={sty.qCtx}>{q.context}</Text>:null}
        <Text style={sty.qPrompt}>{q.prompt}</Text>
      </View>
      <View style={{flexDirection:'row',gap:Spacing.sm,marginTop:Spacing.lg}}>
        <View style={{flex:1,gap:Spacing.sm}}>
          {terms.map(term=>{
            const isSel=selTerm===term,isMat=!!matched[term];
            const isOk=checked&&matched[term]===pairs.find(p=>p.term===term)?.def;
            const isWr=checked&&matched[term]!==pairs.find(p=>p.term===term)?.def;
            return (
              <TouchableOpacity key={term} onPress={()=>handleTermTap(term)} disabled={isMat||checked}
                style={[sty.matchChip,{borderColor:isWr?Colors.red:isOk?Colors.green:isSel?Colors.accent:isMat?Colors.green:Colors.border,backgroundColor:isWr?Colors.redSoft:isOk?Colors.greenSoft:isSel?Colors.accentSoft:isMat?Colors.greenSoft:Colors.card}]}>
                <Text style={[sty.matchTxt,{color:isSel?Colors.accent:isMat?Colors.green:Colors.text}]}>{term}</Text>
                {isMat&&<Text style={{fontSize:10,color:Colors.green}}>→ {matched[term]}</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={{flex:1,gap:Spacing.sm}}>
          {defs.map(def=>{
            const isUsed=Object.values(matched).includes(def);
            const isOk=checked&&pairs.find(p=>p.def===def)&&matched[pairs.find(p=>p.def===def)!.term]===def;
            return (
              <TouchableOpacity key={def} onPress={()=>handleDefTap(def)} disabled={isUsed||checked||!selTerm}
                style={[sty.matchChip,{borderColor:isOk?Colors.green:isUsed?Colors.border:selTerm?Colors.accent:Colors.border,backgroundColor:isOk?Colors.greenSoft:isUsed?'#f9fafb':selTerm?Colors.accentSoft:Colors.card,opacity:isUsed&&!isOk?0.5:1}]}>
                <Text style={[sty.matchTxt,{color:isOk?Colors.green:Colors.text,fontSize:FontSize.xs}]}>{def}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      {allMatched&&!checked&&(<TouchableOpacity style={[sty.primaryBtn,{marginTop:Spacing.xl}]} onPress={check} activeOpacity={0.85}><Text style={sty.primaryBtnTxt}>Check →</Text></TouchableOpacity>)}
    </ScrollView>
  );
}

// ── Fill blank ────────────────────────────────────────────────
function FillBlankQuestion({ q, onCorrect, onWrong }: { q:Question; onCorrect:()=>void; onWrong:()=>void }) {
  const opts=React.useMemo(()=>shuffle([q.blank??'',...(q.distractors??[])].filter(Boolean)),[q.blank,q.distractors]);
  const [chosen,setChosen]=useState<string|null>(null);
  const handleTap=async(opt:string)=>{
    if(chosen)return;
    setChosen(opt);
    const ok=opt===q.blank;
    await Haptics.impactAsync(ok?Haptics.ImpactFeedbackStyle.Medium:Haptics.ImpactFeedbackStyle.Heavy);
    setTimeout(()=>ok?onCorrect():onWrong(),700);
  };
  const parts=(q.sentence||'').split('___');
  return (
    <View style={sty.body}>
      <View style={[sty.card,Shadow.md]}>
        {q.context?<Text style={sty.qCtx}>{q.context}</Text>:null}
        <Text style={sty.qPrompt}>{q.prompt}</Text>
        <View style={{flexDirection:'row',flexWrap:'wrap',alignItems:'center',marginTop:Spacing.md,gap:4}}>
          <Text style={sty.blankSentence}>{parts[0]}</Text>
          <View style={[sty.blankBox,chosen?{borderColor:chosen===q.blank?Colors.green:Colors.red,backgroundColor:chosen===q.blank?Colors.greenSoft:Colors.redSoft}:{}]}>
            <Text style={[sty.blankBoxTxt,{color:chosen===q.blank?Colors.green:chosen?Colors.red:Colors.textSoft}]}>{chosen??'_____'}</Text>
          </View>
          {parts[1]?<Text style={sty.blankSentence}>{parts[1]}</Text>:null}
        </View>
      </View>
      <View style={{flexDirection:'row',flexWrap:'wrap',gap:Spacing.sm,marginTop:Spacing.xl,justifyContent:'center'}}>
        {opts.map(opt=>{
          const isCh=chosen===opt,isOk=opt===q.blank;
          let bg=Colors.card,border=Colors.border,color=Colors.text;
          if(chosen){if(isCh&&isOk){bg=Colors.greenSoft;border=Colors.green;color=Colors.green;}if(isCh&&!isOk){bg=Colors.redSoft;border=Colors.red;color=Colors.red;}if(!isCh&&isOk){bg=Colors.greenSoft;border=Colors.green;color=Colors.green;}}
          return (<TouchableOpacity key={opt} onPress={()=>handleTap(opt)} disabled={!!chosen} style={[sty.blankOpt,{backgroundColor:bg,borderColor:border}]}><Text style={[sty.blankOptTxt,{color}]}>{opt}</Text></TouchableOpacity>);
        })}
      </View>
    </View>
  );
}

// ── Feedback bar ──────────────────────────────────────────────
function FeedbackBar({ correct, combo, xp, explanation, onNext, isLast }: {
  correct:boolean; combo:number; xp:number; explanation?:string; onNext:()=>void; isLast:boolean;
}) {
  return (
    <View style={[sty.feedbackBar,{backgroundColor:correct?Colors.greenSoft:Colors.redSoft,borderTopColor:correct?Colors.green:Colors.red}]}>
      <View style={sty.feedbackRow}>
        <Text style={sty.feedbackIcon}>{correct?'✓':'✗'}</Text>
        <View style={{flex:1}}>
          <Text style={[sty.feedbackTitle,{color:correct?Colors.green:Colors.red}]}>{correct?(combo>2?`${combo}x Combo! 🔥`:'Correct!'):'Not quite.'}</Text>
          {explanation?<Text style={sty.feedbackExpl} numberOfLines={3}>{explanation}</Text>:null}
        </View>
        {correct?<View style={sty.xpBadge}><Text style={sty.xpBadgeTxt}>+{combo>2?20:10} XP</Text></View>:null}
      </View>
      <TouchableOpacity style={[sty.primaryBtn,{backgroundColor:correct?Colors.green:Colors.red,marginTop:Spacing.md}]} onPress={onNext} activeOpacity={0.85}>
        <Text style={sty.primaryBtnTxt}>{isLast?'Finish ✓':'Continue →'}</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Complete / Fail screens ───────────────────────────────────
function CompleteScreen({ stars, xp, topic, onContinue, warning }: {
  stars:number; xp:number; topic:string; onContinue:()=>void; warning?: string | null;
}) {
  return (
    <View style={sty.fullCenter}>
      <Text style={sty.stars}>{'★'.repeat(stars)+'☆'.repeat(3-stars)}</Text>
      <Text style={sty.bigTitle}>Lesson Complete!</Text>
      <Text style={sty.subtopic}>{topic}</Text>
      <Text style={sty.xpNum}>+{xp} XP</Text>
      {stars===3&&<View style={sty.perfectBadge}><Text style={sty.perfectTxt}>⚡ Perfect!</Text></View>}
      {warning ? <Text style={sty.completionWarning}>{warning}</Text> : null}
      <TouchableOpacity style={[sty.primaryBtn,{marginTop:Spacing.xxxl}]} onPress={onContinue} activeOpacity={0.85}>
        <Text style={sty.primaryBtnTxt}>Continue →</Text>
      </TouchableOpacity>
    </View>
  );
}
function FailScreen({ topic, onRetry, onQuit }: { topic:string; onRetry:()=>void; onQuit:()=>void }) {
  return (
    <View style={sty.fullCenter}>
      <Text style={{fontSize: 18,marginBottom:Spacing.lg}}>💔</Text>
      <Text style={sty.bigTitle}>Out of hearts!</Text>
      <Text style={sty.subtopic}>You were studying: {topic}</Text>
      <Text style={{color:Colors.textSoft,marginTop:Spacing.sm,textAlign:'center',lineHeight:20}}>Hearts refill over time.</Text>
      <View style={{flexDirection:'row',gap:Spacing.md,marginTop:Spacing.xxxl,width:'100%'}}>
        <TouchableOpacity style={[sty.ghostBtn,{flex:1}]} onPress={onQuit}><Text style={sty.ghostTxt}>Quit</Text></TouchableOpacity>
        <TouchableOpacity style={[sty.primaryBtn,{flex:1}]} onPress={onRetry}><Text style={sty.primaryBtnTxt}>Try Again</Text></TouchableOpacity>
      </View>
    </View>
  );
}

// ── Main ──────────────────────────────────────────────────────
export default function LessonScreen({
  levelId,
  onExit,
  onComplete,
  onNavigateToLesson,
  trackId,
  labId,
  labNumber,
  lessonIndex,
  isBoss,
}: Props) {
  // ── Resolve lesson source ─────────────────────────────────────────────
  // A Starknet lab lesson is addressed by (trackId, labNumber, lessonIndex).
  // Boss levels — which have real numeric IDs that are registered in the
  // backend (3001-3011 navigator, 4001-4015 ecosystem, 5001-5020 cairo, and
  // island boss 310) — continue to use the flat numeric LEVELS table so the
  // existing completion / scoring / API paths still work.
  const isStarknetLabLesson = Boolean(
    !isBoss
    && trackId
    && isStarknetTrack(trackId)
    && labNumber !== undefined
    && lessonIndex !== undefined,
  );
  // Lab metadata is synchronous; the lesson bodies are not. They live in a
  // lazily-loaded chunk (see starknetLessonRegistry), so they resolve after
  // first paint instead of being bundled into the entry chunk.
  const starknetLab = isStarknetLabLesson
    ? getStarknetLab(trackId as StarknetTrackId, labNumber as number)
    : null;
  const [starknetLessons, setStarknetLessons] = useState<any[] | null>(null);
  useEffect(() => {
    if (!starknetLab) {
      setStarknetLessons(null);
      return;
    }
    let alive = true;
    starknetLab
      .loadLessons()
      .then((ls) => { if (alive) setStarknetLessons(ls); })
      // An empty array (not null) so the render guard resolves instead of
      // leaving the screen blank forever if the chunk fails to load.
      .catch(() => { if (alive) setStarknetLessons([]); });
    return () => { alive = false; };
  }, [starknetLab]);

  const starknetLesson =
    starknetLessons && lessonIndex !== undefined
      ? starknetLessons[lessonIndex] ?? null
      : null;
  const classicLevel = getStarknetIslandLevel(levelId) ?? getStarknetTrackBossLevel(levelId) ?? getLevel(levelId);
  const lessonTopic = starknetLesson ? getAuthoredLessonTopic(starknetLesson as any) : classicLevel?.topic ?? 'Lesson';
  const lessonSummary = starknetLesson ? getAuthoredLessonSummary(starknetLesson as any) : classicLevel?.fact ?? '';

  const { user } = useAuth();
  const { savePosition } = useResume();
  const { state, startLesson, startStarknetLesson, advance, goBack, answerCorrect, answerWrong, resetLesson, completeSimulator } = useLessonEngine();
  const { completeLevel } = useProgress();

  const [showFeedback, setShowFeedback]       = useState(false);
  const [isBookmarked, setIsBookmarked]       = useState(false);
  const [showNotes, setShowNotes]             = useState(false);
  const [activeLink, setActiveLink]           = useState<TermLink|null>(null);
  const [termVisible, setTermVisible]         = useState(false);
  const [returnTopic, setReturnTopic]         = useState<string|null>(null);
  // ── Animated layer ─────────────────────────────────────────
  const [lessonMood, setLessonMood]           = useState<LessonMood>('idle');
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationType, setCelebType]       = useState<CelebrationEventType>('lesson');
  const [showExplainer, setShowExplainer]     = useState(false);
  const [explainerText, setExplainerText]     = useState('');
  const [explainerUsed, setExplainerUsed]     = useState(0);
  const [celebrationDone, setCelebrationDone] = useState(false);
  // ── Lesson transition ──────────────────────────────────────
  const [showTransition, setShowTransition]   = useState(false);
  const [pendingLevelId, setPendingLevelId]   = useState<number|null>(null);
  const [showPostIslandTracks, setShowPostIslandTracks] = useState(false);
  const [showFlag, setShowFlag]               = useState(false);
  const [isFinishing, setIsFinishing]         = useState(false);
  const [completionWarning, setCompletionWarning] = useState<string | null>(null);

  const totalXp    = (user as any)?.points ?? (user as any)?.totalXp ?? 0;
  const isBossLvl  = Boolean(isBoss || classicLevel?.isBoss || classicLevel?.mechanic === 'boss');
  // starknetLab is resolved above, alongside the lazy lesson load.
  const hasNextStarknetLesson = Boolean(
    starknetLab
    && lessonIndex !== undefined
    // lessonCount, so "is there a next lesson" never waits on the chunk
    && lessonIndex + 1 < starknetLab.lessonCount,
  );
  const userTrackId =
    (user as any)?.currentTrackId
    ?? (user as any)?.current_track_id
    ?? (user as any)?.active_track
    ?? 'crypto';
  const inferredTrackId = trackId
    ?? (
      ((user as any)?.activeFieldId === 'starknet')
      || ((user as any)?.active_field_id === 'starknet')
      || (levelId >= 291 && levelId <= 310)
        ? 'starknet-islands'
        : userTrackId
    );
  const inferredTrack = findTrackById(inferredTrackId);
  const inferredTrackName =
    inferredTrack?.name
    ?? ((user as any)?.currentTrackName)
    ?? ((user as any)?.current_track_name)
    ?? inferredTrackId;
  const resolvedLabIndex = labNumber ?? labIndexFromLegacyId(labId) ?? (inferredTrackId === 'starknet-islands' ? 18 : 0);
  const resolvedLabTitle =
    inferredTrackId === 'starknet-islands' ? 'Starknet Islands' : inferredTrackName;
  const nextTarget = hasNextStarknetLesson
    ? {
        levelId: getStarknetLessonRuntimeId(
          trackId as StarknetTrackId,
          labNumber as number,
          (lessonIndex as number) + 1,
        ),
        topic: starknetLessons?.[(lessonIndex as number) + 1]?.title ?? 'Next Lesson',
        mechanic: 'memory',
      }
    : isStarknetLabLesson && starknetLab
      ? {
          levelId: starknetLab.bossLevelId,
          topic: getStarknetTrackBossLevel(starknetLab.bossLevelId)?.topic ?? 'Boss Challenge',
          mechanic: getStarknetTrackBossLevel(starknetLab.bossLevelId)?.mechanic ?? 'simulator',
        }
      : (() => {
          const nextLevelId = levelId + 1;
          const nextLevel = getStarknetIslandLevel(nextLevelId) ?? getStarknetTrackBossLevel(nextLevelId) ?? getLevel(nextLevelId);
          return nextLevel
            ? {
                levelId: nextLevelId,
                topic: nextLevel.topic,
                mechanic: nextLevel.mechanic,
              }
            : null;
        })();
  const previousTarget = isStarknetLabLesson && starknetLab && lessonIndex !== undefined && lessonIndex > 0
    ? {
        levelId: getStarknetLessonRuntimeId(
          trackId as StarknetTrackId,
          labNumber as number,
          lessonIndex - 1,
        ),
        topic: starknetLessons?.[lessonIndex - 1]?.title ?? 'Previous Lesson',
      }
    : (() => {
        const prevLevelId = levelId - 1;
        const prevLevel = getStarknetIslandLevel(prevLevelId) ?? getStarknetTrackBossLevel(prevLevelId) ?? getLevel(prevLevelId);
        return prevLevel
          ? {
              levelId: prevLevelId,
              topic: prevLevel.topic,
            }
          : null;
      })();

  useEffect(() => {
    if (!lessonTopic) {
      return;
    }

    void savePosition({
      trackId: inferredTrackId,
      trackName: inferredTrackName,
      level: inferResumeLevel(resolvedLabIndex),
      labId: labId ?? (inferredTrackId === 'starknet-islands' ? 'island-18' : inferredTrackId),
      labTitle: resolvedLabTitle,
      lessonId: String(levelId),
      lessonTitle: lessonTopic,
      lessonIndex: lessonIndex ?? 0,
      labIndex: resolvedLabIndex,
      simulatorState: null,
    }).catch(() => {});
  }, [inferredTrackId, inferredTrackName, labId, labNumber, lessonTopic, levelId, lessonIndex, resolvedLabIndex, resolvedLabTitle, savePosition, trackId, user]);

  useEffect(()=>{loadBookmarks().then(bm=>setIsBookmarked(bm.some(b=>b.levelId===levelId)));}, [levelId]);
  useEffect(()=>{
    if (starknetLesson) {
      // Starknet lab lesson — build questions from the authored content
      // (key takeaway, simulator, guidedPractice MCQs).
      startStarknetLesson(starknetLesson);
    } else if (classicLevel) {
      startLesson(classicLevel);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelId, trackId, labId, labNumber, lessonIndex, starknetLesson]);
  useEffect(()=>{ if(state?.answered) setShowFeedback(true); }, [state?.answered]);

  const resetMood = useCallback(() => {
    setTimeout(() => { setLessonMood('idle'); }, 1500);
  }, []);

  const handleNext = () => { setShowFeedback(false); advance(); };

  const handleFinish = async () => {
    if(!state || celebrationDone || isFinishing) return;
    setIsFinishing(true);
    const requestedTrack = trackId ?? userTrackId;
    let completionSaved = false;
    try {
      await completeLevel(
        levelId,
        requestedTrack,
        state.xp,
        state.wrongCount===0,
      );
      completionSaved = true;
      setCompletionWarning(null);
    } catch (error) {
      console.warn('completeLevel failed (non-fatal):', error);
      setCompletionWarning('Lesson complete, but progress could not be synced to the server yet.');
    }

    // ── Navigator boss completion (levels 3001–3011) ──────────────────────────
    // Fires POST /api/game/navigator-lab-complete which unlocks next Navigator lab.
    // Only fire when this is actually a boss — a Starknet lab lesson can reuse
    // a numeric `levelId` that happens to land in the boss range (e.g. Lab 2
    // lesson 0 previously routed with levelId=3001), and we do NOT want those
    // to wrongly register a lab completion.
    if (completionSaved && !isStarknetLabLesson && levelId >= 3001 && levelId <= 3011) {
      const labNum = levelId - 3000;
      try {
        const tok = await API.getToken();
        await fetch(`${API_BASE}/api/game/navigator-lab-complete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tok}` },
          body: JSON.stringify({ lab_number: labNum }),
        });
      } catch (e) {
        console.warn('navigator-lab-complete failed (non-fatal):', e);
      }
    }

    // ── Cairo Builder boss completion (levels 5001–5020) ─────────────────────
    if (completionSaved && !isStarknetLabLesson && levelId >= 5001 && levelId <= 5020) {
      const labNum = levelId - 5000;
      try {
        const tok2 = await API.getToken();
        await fetch(`${API_BASE}/api/game/cairo-lab-complete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tok2}` },
          body: JSON.stringify({ lab: labNum }),
        });
      } catch (e) {
        console.warn('cairo-lab-complete failed (non-fatal):', e);
      }
    }

    // ── Ecosystem Deep Dive boss completion (levels 4001–4015) ───────────────
    if (completionSaved && !isStarknetLabLesson && levelId >= 4001 && levelId <= 4015) {
      const labNum = levelId - 4000;
      try {
        const tok3 = await API.getToken();
        await fetch(`${API_BASE}/api/game/ecosystem-lab-complete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tok3}` },
          body: JSON.stringify({ lab: labNum }),
        });
      } catch (e) {
        console.warn('ecosystem-lab-complete failed (non-fatal):', e);
      }
    }

    // ── Starknet Island boss (level 310) — show two-track selection ──────────
    // Handled by onComplete callback → IslandMapScreen reads stars and routes.

    setCelebType(isBossLvl ? 'boss' : 'lesson');
    setShowCelebration(true);
    setIsFinishing(false);
  };

  const handleCelebDismiss = () => {
    setShowCelebration(false);
    setCelebrationDone(true);
    if (levelId === 310) {
      setShowPostIslandTracks(true);
      return;
    }
    // Play portal transition when there is a next lesson in sequence;
    // skip it and call onComplete directly at track/island end.
    if (nextTarget) {
      setPendingLevelId(nextTarget.levelId);
      setShowTransition(true);
    } else {
      if (state) onComplete(state.stars, state.xp);
    }
  };

  const handleAnswerCorrect = () => {
    setLessonMood((state?.combo ?? 0) >= 2 ? 'streak' : 'correct');
    resetMood();
    answerCorrect();
  };

  const handleAnswerWrong = () => {
    setLessonMood('wrong');
    resetMood();
    answerWrong();
  };

  const handleBookmark = async () => {
    const bm = await loadBookmarks();
    if (isBookmarked) {
      await saveBookmarks(bm.filter(b=>b.levelId!==levelId));
      const diaryBookmarks = await getDiaryBookmarks();
      const matches = diaryBookmarks.filter(b => String(b.lessonId) === String(levelId));
      await Promise.all(matches.map(b => deleteDiaryBookmark(b.id)));
      setIsBookmarked(false);
    } else {
      if (lessonTopic) {
        bm.unshift({levelId,topic:lessonTopic,fact:lessonSummary,savedAt:Date.now()});
        await saveBookmarks(bm);
        await saveDiaryBookmark({
          lessonId: String(levelId),
          lessonTitle: lessonTopic,
          field: String((user as any)?.activeFieldId ?? (user as any)?.active_field_id ?? 'general'),
          level: String(levelId),
          labId: String(labId ?? trackId ?? 'lesson'),
          labTitle: String((user as any)?.currentTrackName ?? trackId ?? 'Lesson'),
          lessonType: isBossLvl ? 'boss' : q?.type === 'simulator' ? 'simulator' : 'concept',
          excerpt: String(lessonSummary).slice(0, 240),
          note: q?.prompt ? String(q.prompt).slice(0, 180) : undefined,
        });
      }
      setIsBookmarked(true);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };
  const handleTermPress = (link: TermLink) => { setActiveLink(link); setTermVisible(true); };
  const handleGoToLinked = (id: number) => {
    if(onNavigateToLesson) { setReturnTopic(lessonTopic); onNavigateToLesson(id); }
  };
  const handleAIExplainer = () => {
    if (!state) return;
    const q = state.questions[state.qIndex];
    const txt = q?.type === 'concept_card'
      ? `${q.lessonBody ?? ''} ${q.keyTakeaway ?? q.fact ?? ''} ${q.plain ?? ''}`
      : q?.prompt ?? lessonSummary;
    setExplainerText(txt);
    setShowExplainer(true);
  };

  if (!state || (!classicLevel && !starknetLesson)) return null;
  const q        = state.questions[state.qIndex];
  const progress = (state.qIndex / state.questions.length) * 100;
  const isLast   = state.qIndex + 1 >= state.questions.length;
  const isJudgmentSimulator =
    q?.type === 'simulator'
    && String(q.simulatorType ?? '').startsWith('judgment-');
  const sessionXp = state.xp ?? 0;
  const simulatorIslandId = q?.simulatorType === 'phase1-boss' ? levelId : getIslandForLevel(levelId);
  const showStarknetFaucet = Boolean(
    user?.starknet_address
    && (
      (trackId && isStarknetTrack(trackId as StarknetTrackId))
      || (levelId >= 291 && levelId <= 310)
    ),
  );

  // Finished — show celebration then hand off
  if (state.finished) {
    if (!showCelebration && !celebrationDone && !isFinishing) handleFinish();
    return (
      <SafeAreaView style={sty.screen}>
        <CelebrationOverlay
          visible={showCelebration}
          type={celebrationType}
          xpEarned={sessionXp}
          stageUp={false}
          onDismiss={handleCelebDismiss}
        />
        {/* CompleteScreen is hidden while the portal transition is playing */}
        {!showCelebration && !showTransition && (
          showPostIslandTracks ? (
            <TrackChoiceScreen showBackToFields />
          ) : (
            <CompleteScreen
              stars={state.stars}
              xp={sessionXp}
              topic={lessonTopic}
              warning={completionWarning}
              onContinue={handleCelebDismiss}
            />
          )
        )}
        {/*
          LessonTransition MUST live here, not only in the main return.
          When state.finished is true the main return is never reached, so
          the component was already unmounted before handleCelebDismiss ever
          called setShowTransition(true) - making the transition a no-op and
          leaving the user stuck on CompleteScreen with no way to advance.
          Starknet lab lessons always have a non-null nextTarget (next lesson
          or boss within the same lab), so they always hit this path.
        */}
        <LessonTransition
          visible={showTransition}
          fromTopic={lessonTopic}
          toTopic={nextTarget?.topic ?? ''}
          fieldColor={(user as any)?.activeFieldColor}
          mechanic={nextTarget?.mechanic}
          onDone={() => {
            setShowTransition(false);
            if (pendingLevelId != null && !isStarknetLabLesson && onNavigateToLesson) {
              const nextLevelId = pendingLevelId;
              setPendingLevelId(null);
              onNavigateToLesson(nextLevelId);
              return;
            }
            setPendingLevelId(null);
            if (state) onComplete(state.stars, state.xp);
          }}
        />
      </SafeAreaView>
    );
  }
  if (state.failed) return <SafeAreaView style={sty.screen}><FailScreen topic={lessonTopic} onRetry={resetLesson} onQuit={onExit}/></SafeAreaView>;

  return (
    <SafeAreaView style={sty.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg}/>

      <TopBar
        progress={progress}
        hearts={state.hearts}
        onExit={onExit}
        isBookmarked={isBookmarked}
        onBookmark={handleBookmark}
        onNotes={()=>setShowNotes(true)}
        onFlag={()=>setShowFlag(true)}
        onExport={exportAll}
        totalXp={totalXp}
        sessionXp={sessionXp}
        correctStreak={state.combo ?? 0}
        mood={lessonMood}
        onAIExplainer={handleAIExplainer}
      />

      <LessonNavRow
        previousTopic={previousTarget?.topic ?? null}
        onPrevious={previousTarget && onNavigateToLesson ? () => onNavigateToLesson(previousTarget.levelId) : null}
      />
      <LessonStepBackRow
        canGoBack={Boolean(state && state.qIndex > 0 && !state.finished)}
        onBack={goBack}
      />

      {showStarknetFaucet && user?.starknet_address ? (
        <View style={sty.faucetBanner}>
          <View style={sty.faucetBannerRow}>
            <View style={sty.faucetBannerCopy}>
              <Text style={sty.faucetBannerTitle}>Need fresh STRK for this Starknet lesson?</Text>
              <Text style={sty.faucetBannerSub}>
                Claim Sepolia test STRK here before you run a live wallet step.
              </Text>
            </View>
            <StarknetFaucetButton walletAddress={user.starknet_address} compact />
          </View>
        </View>
      ) : null}

      {returnTopic && <ReturnBanner topic={returnTopic} onReturn={()=>{setReturnTopic(null);onExit();}}/>}

      {q?.type==='concept_card' && <ConceptCard key={state.qIndex} q={q} onNext={()=>{handleAnswerCorrect();setTimeout(advance,200);}} levelId={levelId} onTermPress={handleTermPress}/>}
      {q?.type==='simulator' && (
        <View style={[sty.simulatorStage, isJudgmentSimulator && sty.judgmentSimulatorStage]}>
          <View style={sty.simulatorCardWrap}>
            <SimulatorCard
              key={`sim-${state.qIndex}`}
              simulatorType={q.simulatorType ?? ''}
              islandId={simulatorIslandId}
              scenario={q.scenario}
              scoringCriteria={q.scoringCriteria}
              trackId={trackId}
              labNumber={labNumber}
              onComplete={() => { completeSimulator(); advance(); }}
              onSkip={() => advance()}
            />
          </View>
        </View>
      )}
      {q?.type==='mcq'          && <MCQQuestion key={state.qIndex} q={q} onCorrect={handleAnswerCorrect} onWrong={handleAnswerWrong}/>}
      {q?.type==='true_false'   && <TrueFalseQuestion key={state.qIndex} q={q} onCorrect={handleAnswerCorrect} onWrong={handleAnswerWrong}/>}
      {q?.type==='order'        && <OrderQuestion key={state.qIndex} q={q} onCorrect={handleAnswerCorrect} onWrong={handleAnswerWrong}/>}
      {q?.type==='multi_select' && <MultiSelectQuestion key={state.qIndex} q={q} onCorrect={handleAnswerCorrect} onWrong={handleAnswerWrong}/>}
      {q?.type==='match_pairs'  && <MatchPairsQuestion key={state.qIndex} q={q} onCorrect={handleAnswerCorrect} onWrong={handleAnswerWrong}/>}
      {q?.type==='fill_blank'   && <FillBlankQuestion key={state.qIndex} q={q} onCorrect={handleAnswerCorrect} onWrong={handleAnswerWrong}/>}

      {showFeedback&&state.answered&&q?.type!=='concept_card'&&q?.type!=='simulator'&&(
        <FeedbackBar correct={state.lastCorrect??false} combo={state.combo} xp={sessionXp} explanation={q?.explanation} onNext={handleNext} isLast={isLast}/>
      )}

      {showExplainer && (
        <AIExplainer
          conceptText={explainerText}
          lessonId={levelId}
          trackId={(user as any)?.currentTrackId ?? 'default'}
          trackName={(user as any)?.currentTrackName ?? 'Your Track'}
          isBlocked={q?.type === 'simulator'}
          sessionUsed={explainerUsed}
          onClose={() => setShowExplainer(false)}
          onUsed={() => setExplainerUsed(n => n + 1)}
        />
      )}

      <TermLinkModal link={activeLink} visible={termVisible} onClose={()=>setTermVisible(false)} onGoToLesson={handleGoToLinked}/>
      <NotesPanel visible={showNotes} levelId={levelId} topic={lessonTopic} onClose={()=>setShowNotes(false)}/>
      <FlagModal
        visible={showFlag}
        lessonId={String(levelId)}
        lessonTitle={lessonTopic}
        questionId={`${levelId}-${state.qIndex}`}
        userId={String((user as any)?.id ?? 'local')}
        onClose={() => setShowFlag(false)}
      />
      {/* LessonTransition moved into the finished-state branch above.
          showTransition is only ever set true after state.finished === true,
          so this position in the main return could never fire it anyway. */}
      <DisclaimerFooter />
    </SafeAreaView>
  );
}

function labIndexFromLegacyId(labId?: string) {
  if (!labId) {
    return null;
  }

  const match = labId.match(/(\d+)/);
  return match ? Number(match[1]) : null;
}

function inferResumeLevel(labIndex: number): 'junior' | 'intermediate' | 'senior' {
  if (labIndex >= 8) {
    return 'senior';
  }
  if (labIndex >= 4) {
    return 'intermediate';
  }
  return 'junior';
}

// ── Styles ────────────────────────────────────────────────────
const sty = StyleSheet.create({
  screen:        {flex:1,backgroundColor:Colors.bg},
  topBar:        {flexDirection:'row',alignItems:'center',height:44,paddingHorizontal:Spacing.md,paddingVertical:0,backgroundColor:Colors.card,borderBottomWidth:1,borderBottomColor:Colors.border,gap:Spacing.sm,width:'100%',maxWidth:1120,alignSelf:'center'},
  exitBtn:       {padding:Spacing.sm},
  exitTxt:       {fontSize:16,color:Colors.textSoft},
  progressWrap:  {flex:1},
  progressBg:    {height:10,backgroundColor:Colors.border,borderRadius: 14},
  progressFill:  {height:10,backgroundColor:Colors.accent,borderRadius: 14},
  topActionsAccessible:{flexDirection:'row',alignItems:'center',gap:6},
  topActions:    {display:'none'},
  hearts:        {display:'none'},
  heart:         {display:'none'},
  topActionWrap: {position:'relative',alignItems:'center',justifyContent:'center'},
  topActionBtn:  {minWidth:28,minHeight:28,alignItems:'center',justifyContent:'center',paddingHorizontal:4},
  topActionTooltip:{position:'absolute',top:28,backgroundColor:Colors.text,borderRadius:Radius.sm,paddingHorizontal:Spacing.sm,paddingVertical:4,zIndex:20},
  topActionTooltipText:{color:'#fff',fontSize:10,fontWeight:'700'},
  body:          {flex:1,paddingHorizontal:Spacing.lg,paddingTop:Spacing.md,width:'100%',maxWidth:1040,alignSelf:'center'},
  bodyContent:   {paddingBottom:Spacing.xxl},
  card:          {backgroundColor:Colors.card,borderRadius:Radius.lg,borderWidth:1,borderColor:Colors.border,padding:Spacing.md},
  tierBadge:     {alignSelf:'flex-start',borderRadius:Radius.full,borderWidth:1.5,paddingHorizontal:Spacing.md,paddingVertical:3,marginBottom:Spacing.md},
  tierLabel:     {fontSize:FontSize.xs,fontWeight:'800',textTransform:'uppercase',letterSpacing:0.5},
  conceptTopic:  {fontSize:FontSize.lg,fontWeight: '800',color:Colors.text,lineHeight:24,marginBottom:Spacing.sm},
  divider:       {height:2,borderRadius: 14,marginBottom:Spacing.md,opacity:0.6},
  conceptFact:   {fontSize:FontSize.md,lineHeight:28,color:Colors.text},
  lessonBodyWrap:{gap:Spacing.sm},
  lessonParagraph:{fontSize:FontSize.md,lineHeight:28,color:Colors.text},
  takeawayBox:   {backgroundColor:Colors.bgSecondary,borderRadius:Radius.lg,borderWidth:1,borderColor:Colors.border,padding:Spacing.sm,marginTop:Spacing.lg},
  takeawayLabel: {fontSize:9,fontWeight:'800',color:Colors.textSoft,textTransform:'uppercase',letterSpacing:0.5,marginBottom:4},
  takeawayText:  {fontSize:FontSize.md,lineHeight:24,color:Colors.text},
  analogy:       {backgroundColor:Colors.accentSoft,borderLeftWidth:4,borderLeftColor:Colors.accent,borderRadius:Radius.lg,padding:Spacing.sm,marginTop:Spacing.lg},
  analogyLabel:  {fontSize:9,fontWeight:'800',color:Colors.accent,textTransform:'uppercase',letterSpacing:0.5,marginBottom:4},
  analogyText:   {fontSize:FontSize.md,lineHeight:24,color:'#374151'},
  exampleSection:{marginTop:Spacing.lg,gap:Spacing.sm},
  exampleSectionLabel:{fontSize:FontSize.xs,fontWeight:'800',color:Colors.textSoft,textTransform:'uppercase',letterSpacing:0.5},
  exampleCard:   {backgroundColor:'#fff7ed',borderRadius:Radius.lg,borderWidth:1,borderColor:'#fdba7440',padding:Spacing.md,gap:Spacing.xs},
  exampleTag:    {fontSize:FontSize.xs,fontWeight:'800',color:'#c2410c'},
  exampleContext:{fontSize:FontSize.xs,lineHeight:18,color:Colors.textSoft},
  exampleScenario:{fontSize:FontSize.sm,fontWeight:'700',lineHeight:20,color:Colors.text},
  exampleOutcome:{fontSize:FontSize.sm,lineHeight:20,color:'#7c2d12'},
  // term links
  termSection:   {marginTop:Spacing.lg,borderTopWidth:1,borderTopColor:Colors.border,paddingTop:Spacing.md},
  termSectionLabel:{fontSize:FontSize.xs,fontWeight:'800',color:Colors.textSoft,textTransform:'uppercase',letterSpacing:0.5,marginBottom:Spacing.sm},
  termRow:       {flexDirection:'row',flexWrap:'wrap',gap:Spacing.sm},
  termBadge:     {flexDirection:'row',alignItems:'center',backgroundColor:Colors.accentSoft,borderRadius:Radius.full,paddingHorizontal:Spacing.md,paddingVertical:5,borderWidth:1,borderColor:Colors.accent+'40'},
  termBadgeTxt:  {fontSize:FontSize.xs,fontWeight:'700',color:Colors.accent},
  // overlay/modal
  overlay:       {flex:1,backgroundColor:'rgba(0,0,0,0.45)',justifyContent:'center',alignItems:'center',padding:Spacing.xl},
  termModal:     {backgroundColor:Colors.card,borderRadius:Radius.xl,padding:Spacing.xxl,width:'100%',maxWidth:420,borderWidth:1,borderColor:Colors.border},
  termModalHead: {flexDirection:'row',alignItems:'center',marginBottom:Spacing.md,gap:Spacing.sm},
  termModalIcon: {fontSize: 18},
  termModalTitle:{flex:1,fontSize:FontSize.md,fontWeight:'800',color:Colors.text},
  termModalBody: {fontSize:FontSize.sm,lineHeight:21,color:Colors.textSoft,marginBottom:Spacing.lg},
  termModalBtn:  {backgroundColor:Colors.accent,borderRadius:Radius.md,paddingVertical:Spacing.md,alignItems:'center'},
  termModalBtnText:{color:'#fff',fontSize:FontSize.sm,fontWeight:'800'},
  // return banner
  returnBanner:  {backgroundColor:Colors.accentSoft,borderBottomWidth:1,borderBottomColor:Colors.accent+'40',paddingHorizontal:Spacing.lg,paddingVertical:Spacing.sm,width:'100%',maxWidth:980,alignSelf:'center'},
  returnTxt:     {fontSize:FontSize.sm,fontWeight:'700',color:Colors.accent},
  lessonNavRow:  {width:'100%',maxWidth:1120,alignSelf:'center',paddingHorizontal:Spacing.lg,paddingTop:Spacing.sm},
  lessonNavBtn:  {alignSelf:'flex-start',backgroundColor:Colors.card,borderRadius:Radius.full,borderWidth:1,borderColor:Colors.border,paddingHorizontal:Spacing.md,paddingVertical:Spacing.sm},
  lessonNavBtnText:{fontSize:FontSize.sm,fontWeight:'700',color:Colors.textSoft},
  // notes panel
  notePanel:     {flex:1,backgroundColor:Colors.bg,marginTop:60,borderTopLeftRadius:Radius.xl,borderTopRightRadius:Radius.xl,overflow:'hidden'},
  notePanelHead: {flexDirection:'row',alignItems:'center',padding:Spacing.lg,backgroundColor:Colors.card,borderBottomWidth:1,borderBottomColor:Colors.border},
  notePanelTitle:{fontSize:FontSize.md,fontWeight:'800',color:Colors.text},
  noteDraftRow:  {flexDirection:'row',alignItems:'flex-start',gap:Spacing.sm,padding:Spacing.lg,backgroundColor:Colors.card,borderBottomWidth:1,borderBottomColor:Colors.border},
  noteDraftInput:{flex:1,minHeight:128,maxHeight:220,borderWidth:1.5,borderColor:Colors.inputBorder,borderRadius:Radius.lg,paddingHorizontal:Spacing.md,paddingVertical:Spacing.md,fontSize:FontSize.md,color:Colors.text,backgroundColor:Colors.inputBg,textAlignVertical:'top',lineHeight:22},
  noteSaveBtn:   {backgroundColor:Colors.accent,borderRadius:Radius.md,paddingHorizontal:Spacing.lg,minHeight:52,alignItems:'center',justifyContent:'center'},
  noteSaveBtnTxt:{color:'#fff',fontSize:FontSize.sm,fontWeight:'800'},
  noteCard:      {backgroundColor:Colors.card,borderRadius:Radius.lg,padding:Spacing.md,borderWidth:1,borderColor:Colors.border,marginBottom:Spacing.sm},
  noteContent:   {fontSize:FontSize.sm,lineHeight:20,color:Colors.text},
  noteFooter:    {flexDirection:'row',justifyContent:'space-between',marginTop:Spacing.sm},
  noteDate:      {fontSize:FontSize.xs,color:Colors.textMuted},
  faucetBanner:  {marginHorizontal:Spacing.lg, marginTop:Spacing.md, borderRadius:Radius.xl, borderWidth:1, borderColor:'#f59e0b40', backgroundColor:Colors.goldSoft, paddingHorizontal:Spacing.md, paddingVertical:Spacing.sm, width:'100%', maxWidth:1120, alignSelf:'center'},
  faucetBannerRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:Spacing.md},
  faucetBannerCopy:{flex:1},
  faucetBannerTitle:{fontSize:FontSize.sm,fontWeight:'800',color:'#b45309'},
  faucetBannerSub:{fontSize:FontSize.xs,lineHeight:18,color:Colors.textSoft,marginTop:4},
  simulatorStage:{flex:1,width:'100%',maxWidth:1040,alignSelf:'center',paddingHorizontal:Spacing.lg,paddingTop:Spacing.md,paddingBottom:Spacing.sm},
  judgmentSimulatorStage:{maxWidth:1180,paddingTop:2},
  simulatorCardWrap:{flex:1,minHeight:0},
  // questions
  qCtx:          {fontSize:FontSize.xs,fontWeight:'800',color:Colors.accent,textTransform:'uppercase',letterSpacing:0.5,marginBottom:Spacing.sm},
  qPrompt:       {fontSize:FontSize.sm,fontWeight:'700',color:Colors.text,lineHeight:20},
  optBtn:        {flexDirection:'row',alignItems:'center',gap:Spacing.sm,padding:Spacing.sm,backgroundColor:Colors.card,borderRadius:Radius.md,borderWidth:1.5,borderColor:Colors.border},
  optLetter:     {width:26,height:26,borderRadius:8,backgroundColor:Colors.border,alignItems:'center',justifyContent:'center'},
  optLetterTxt:  {fontSize:FontSize.xs,fontWeight:'800'},
  optTxt:        {flex:1,fontSize:FontSize.sm,fontWeight:'600',color:Colors.text,lineHeight:18},
  checkbox:      {width:24,height:24,borderRadius:6,borderWidth:2,alignItems:'center',justifyContent:'center'},
  tfRow:         {flexDirection:'row',gap:Spacing.md},
  tfBtn:         {flex:1,padding:Spacing.md,borderRadius:Radius.md,alignItems:'center',justifyContent:'center'},
  tfTxt:         {fontSize:FontSize.sm,fontWeight:'800'},
  orderEmpty:    {flexDirection:'row',alignItems:'center',gap:Spacing.sm,padding:Spacing.md,borderRadius:Radius.md,borderWidth:2,borderStyle:'dashed',borderColor:Colors.border,minHeight:48},
  orderFilled:   {flexDirection:'row',alignItems:'center',gap:Spacing.sm,padding:Spacing.md,borderRadius:Radius.md,borderWidth:2,borderColor:Colors.accent,backgroundColor:Colors.accentSoft,minHeight:48},
  orderNum:      {width:24,height:24,borderRadius:Radius.full,backgroundColor:Colors.accentSoft,alignItems:'center',justifyContent:'center'},
  orderNumTxt:   {fontSize:FontSize.xs,fontWeight:'800',color:Colors.accent},
  orderSlotTxt:  {flex:1,fontSize:FontSize.sm,fontWeight:'600',color:Colors.text},
  orderPlaceholder:{flex:1,fontSize:FontSize.sm,color:Colors.textSoft},
  orderChip:     {paddingHorizontal:Spacing.md,paddingVertical:Spacing.sm,backgroundColor:Colors.card,borderRadius:Radius.full,borderWidth:2,borderColor:Colors.border},
  orderChipTxt:  {fontSize:FontSize.sm,fontWeight:'700',color:Colors.text},
  matchChip:     {padding:Spacing.sm,borderRadius:Radius.md,borderWidth:2,borderColor:'#e2e8f0',backgroundColor:'#fff',minHeight:48,justifyContent:'center'},
  matchTxt:      {fontSize:FontSize.sm,fontWeight:'700',color:'#1e293b',lineHeight:18},
  blankSentence: {fontSize:FontSize.md,fontWeight:'600',color:'#1e293b',lineHeight:24},
  blankBox:      {borderWidth:2,borderColor:'#cbd5e1',borderRadius:8,paddingHorizontal:Spacing.md,paddingVertical:4,minWidth:80,alignItems:'center',backgroundColor:'#f8fafc'},
  blankBoxTxt:   {fontSize:FontSize.md,fontWeight:'800',color:'#94a3b8'},
  blankOpt:      {paddingHorizontal:Spacing.lg,paddingVertical:Spacing.md,borderRadius:Radius.full,borderWidth:2,borderColor:'#e2e8f0',backgroundColor:'#fff',minWidth:80,alignItems:'center'},
  blankOptTxt:   {fontSize:FontSize.md,fontWeight:'700',color:'#1e293b'},
  feedbackBar:   {borderTopWidth:3,padding:Spacing.md,width:'100%',maxWidth:1120,alignSelf:'center'},
  feedbackRow:   {flexDirection:'row',alignItems:'flex-start',gap:Spacing.md},
  feedbackIcon:  {fontSize: 18},
  feedbackTitle: {fontSize:FontSize.sm,fontWeight:'800'},
  feedbackExpl:  {fontSize:FontSize.xs,color:Colors.textSoft,lineHeight:19,marginTop:2},
  xpBadge:       {backgroundColor:Colors.accentSoft,borderRadius:Radius.full,paddingHorizontal:Spacing.sm,paddingVertical:2,alignSelf:'flex-start'},
  xpBadgeTxt:    {fontSize:FontSize.xs,fontWeight:'800',color:Colors.accent},
  fullCenter:    {flex:1,alignItems:'center',justifyContent:'center',padding:Spacing.xl,maxWidth:560,alignSelf:'center',width:'100%'},
  stars:         {fontSize: 18,letterSpacing:6,color:Colors.gold,marginBottom:Spacing.lg},
  bigTitle:      {fontSize:FontSize.xxxl,fontWeight:'900',color:Colors.text},
  subtopic:      {fontSize:FontSize.md,color:Colors.textSoft,marginTop:Spacing.sm,textAlign:'center'},
  xpNum:         {fontSize: 18,fontWeight: '800',color:Colors.accent,marginTop:Spacing.lg},
  perfectBadge:  {backgroundColor:Colors.gold,borderRadius:Radius.full,paddingHorizontal:Spacing.lg,paddingVertical:Spacing.sm,marginTop:Spacing.md},
  perfectTxt:    {fontSize:FontSize.sm,fontWeight:'800',color:'#fff',letterSpacing:0.5},
  completionWarning:{marginTop:Spacing.lg,paddingHorizontal:Spacing.lg,color:Colors.textSoft,textAlign:'center',lineHeight:20,maxWidth:320},
  primaryBtn:    {backgroundColor:Colors.accent,borderRadius:Radius.md,paddingVertical:14,paddingHorizontal:Spacing.lg,minHeight:52,alignItems:'center',justifyContent:'center',width:'100%'},
  primaryBtnTxt: {color:'#fff',fontSize:FontSize.sm,fontWeight:'800',letterSpacing:0.2},
  ghostBtn:      {borderRadius:Radius.md,paddingVertical:14,paddingHorizontal:Spacing.lg,minHeight:52,alignItems:'center',justifyContent:'center',borderWidth:1.5,borderColor:Colors.border,backgroundColor:Colors.card},
  ghostTxt:      {color:Colors.textSoft,fontSize:FontSize.sm,fontWeight:'700'},
});

function shuffle<T>(arr:T[]):T[]{const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
