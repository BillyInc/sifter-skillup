import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  SafeAreaView, StatusBar, Platform, Modal, TextInput, Share,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLessonEngine, type Question } from '../hooks/useLessonEngine';
import { useProgress } from '../hooks/useProgress';
import { getLevel, LEVELS } from '../data/levels';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../theme';
import SimulatorCard from '../components/simulators/SimulatorCard';
import { computeLabTiers, assignScenario } from '../lib/progressionEngine';

// ── Types ─────────────────────────────────────────────────────
interface Props {
  levelId: number;
  onExit: () => void;
  onComplete: (stars: number, xp: number) => void;
  onNavigateToLesson?: (levelId: number) => void;
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
  Object.values(LEVELS).forEach(level => {
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
  let txt = '============================\n  SIFTER SKILL_UP — MY STUDY EXPORT\n';
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

// ── Top bar ───────────────────────────────────────────────────
function TopBar({ progress, hearts, onExit, isBookmarked, onBookmark, onNotes, onExport }: {
  progress:number; hearts:number; onExit:()=>void;
  isBookmarked:boolean; onBookmark:()=>void; onNotes:()=>void; onExport:()=>void;
}) {
  return (
    <View style={sty.topBar}>
      <TouchableOpacity onPress={onExit} style={sty.exitBtn} hitSlop={{top:10,bottom:10,left:10,right:10}}>
        <Text style={sty.exitTxt}>✕</Text>
      </TouchableOpacity>
      <View style={sty.progressWrap}>
        <View style={sty.progressBg}><View style={[sty.progressFill,{width:`${Math.min(100,progress)}%`}]}/></View>
      </View>
      <View style={sty.topActions}>
        <TouchableOpacity onPress={onBookmark} hitSlop={{top:8,bottom:8,left:8,right:8}}>
          <Text style={{fontSize:20,color:isBookmarked?Colors.gold:Colors.textSoft}}>{isBookmarked?'🔖':'🏷️'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onNotes} hitSlop={{top:8,bottom:8,left:8,right:8}}>
          <Text style={{fontSize:20}}>📝</Text>
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
      <Text style={sty.returnTxt}>← Back to "{topic}"</Text>
    </TouchableOpacity>
  );
}

// ── Concept card with term links ──────────────────────────────
function ConceptCard({ q, onNext, levelId, onTermPress }: {
  q: Question; onNext: () => void; levelId: number; onTermPress: (link: TermLink) => void;
}) {
  const tc = q.tier === 'beginner' ? Colors.beginner : q.tier === 'intermediate' ? Colors.intermediate : Colors.pro;
  const tl = q.tier === 'beginner' ? '🟢 Beginner' : q.tier === 'intermediate' ? '🟡 Intermediate' : '🔵 Pro';
  const fullText = (q.fact || '') + ' ' + (q.plain || '');
  const termLinks = detectTermLinks(levelId, fullText);

  return (
    <ScrollView style={sty.body} contentContainerStyle={sty.bodyContent} showsVerticalScrollIndicator={false}>
      <View style={[sty.card, Shadow.md]}>
        <View style={[sty.tierBadge,{backgroundColor:tc+'20',borderColor:tc+'50'}]}>
          <Text style={[sty.tierLabel,{color:tc}]}>{tl}</Text>
        </View>
        <Text style={sty.conceptTopic}>{q.topic}</Text>
        <View style={[sty.divider,{backgroundColor:tc}]}/>
        <Text style={sty.conceptFact}>{q.fact}</Text>
        {q.plain ? (
          <View style={sty.analogy}>
            <Text style={sty.analogyLabel}>💡 THINK OF IT LIKE THIS</Text>
            <Text style={sty.analogyText}>{q.plain}</Text>
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
  const handleTap = async (i: number) => {
    if (chosen !== null) return;
    setChosen(i);
    const ok = i === q.correct;
    await Haptics.impactAsync(ok ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Heavy);
    setTimeout(() => ok ? onCorrect() : onWrong(), 800);
  };
  return (
    <View style={sty.body}>
      <View style={[sty.card, Shadow.md]}>
        {q.context ? <Text style={sty.qCtx}>{q.context}</Text> : null}
        <Text style={sty.qPrompt}>{q.prompt}</Text>
      </View>
      <View style={{marginTop:Spacing.lg,gap:Spacing.sm}}>
        {opts.map((opt,i)=>{
          const isCh=chosen===i, isOk=i===q.correct, rev=chosen!==null;
          let bg=Colors.card, bc=Colors.border, tc=Colors.text;
          if(rev&&isOk){bg=Colors.greenSoft;bc=Colors.green;}
          if(rev&&isCh&&!isOk){bg=Colors.redSoft;bc=Colors.red;tc=Colors.red;}
          return (
            <TouchableOpacity key={i} onPress={()=>handleTap(i)} disabled={chosen!==null}
              style={[sty.optBtn,{backgroundColor:bg,borderColor:bc},Shadow.sm]} activeOpacity={0.8}>
              <View style={[sty.optLetter,{backgroundColor:rev&&isOk?Colors.green:rev&&isCh?Colors.red:Colors.border}]}>
                <Text style={[sty.optLetterTxt,{color:rev&&(isOk||isCh)?'#fff':Colors.textSoft}]}>{'ABCD'[i]}</Text>
              </View>
              <Text style={[sty.optTxt,{color:tc}]}>{opt.text}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
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
        <Text style={[sty.qPrompt,{fontStyle:'italic'}]}>"{q.prompt}"</Text>
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
  const toggle=(i:number)=>setSelected(prev=>{const s=new Set(prev);s.has(i)?s.delete(i):s.add(i);return s;});
  const check=async()=>{
    const cIdx=opts.map((o,i)=>o.correct?i:-1).filter(i=>i>=0);
    const ok=cIdx.every(i=>selected.has(i))&&selected.size===cIdx.length;
    await Haptics.impactAsync(ok?Haptics.ImpactFeedbackStyle.Medium:Haptics.ImpactFeedbackStyle.Heavy);
    ok?onCorrect():onWrong();
  };
  return (
    <View style={sty.body}>
      <View style={[sty.card,Shadow.md]}><Text style={sty.qPrompt}>{q.prompt}</Text></View>
      <View style={{marginTop:Spacing.lg,gap:Spacing.sm}}>
        {opts.map((opt,i)=>{
          const sel=selected.has(i);
          return (
            <TouchableOpacity key={i} onPress={()=>toggle(i)}
              style={[sty.optBtn,{borderColor:sel?Colors.accent:Colors.border,backgroundColor:sel?Colors.accentSoft:Colors.card}]} activeOpacity={0.8}>
              <View style={[sty.checkbox,{backgroundColor:sel?Colors.accent:'transparent',borderColor:sel?Colors.accent:Colors.border}]}>
                {sel&&<Text style={{color:'#fff',fontSize:12,fontWeight:'800'}}>✓</Text>}
              </View>
              <Text style={[sty.optTxt,{color:sel?Colors.accent:Colors.text}]}>{opt.text}</Text>
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
function CompleteScreen({ stars, xp, topic, onContinue }: { stars:number; xp:number; topic:string; onContinue:()=>void }) {
  return (
    <View style={sty.fullCenter}>
      <Text style={sty.stars}>{'★'.repeat(stars)+'☆'.repeat(3-stars)}</Text>
      <Text style={sty.bigTitle}>Lesson Complete!</Text>
      <Text style={sty.subtopic}>{topic}</Text>
      <Text style={sty.xpNum}>+{xp} XP</Text>
      {stars===3&&<View style={sty.perfectBadge}><Text style={sty.perfectTxt}>⚡ Perfect!</Text></View>}
      <TouchableOpacity style={[sty.primaryBtn,{marginTop:Spacing.xxxl}]} onPress={onContinue} activeOpacity={0.85}>
        <Text style={sty.primaryBtnTxt}>Continue →</Text>
      </TouchableOpacity>
    </View>
  );
}
function FailScreen({ topic, onRetry, onQuit }: { topic:string; onRetry:()=>void; onQuit:()=>void }) {
  return (
    <View style={sty.fullCenter}>
      <Text style={{fontSize:64,marginBottom:Spacing.lg}}>💔</Text>
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
export default function LessonScreen({ levelId, onExit, onComplete, onNavigateToLesson }: Props) {
  const level = getLevel(levelId);
  const { state, startLesson, advance, answerCorrect, answerWrong, resetLesson, completeSimulator } = useLessonEngine();
  const { completeLevel } = useProgress();
  const [showFeedback, setShowFeedback]       = useState(false);
  const [isBookmarked, setIsBookmarked]       = useState(false);
  const [showNotes, setShowNotes]             = useState(false);
  const [activeLink, setActiveLink]           = useState<TermLink|null>(null);
  const [termVisible, setTermVisible]         = useState(false);
  const [returnTopic, setReturnTopic]         = useState<string|null>(null);

  // TODO: Integrate progressionEngine here. For late-tier labs (tier index >= half
  // of total tiers via computeLabTiers), show a topic picker before startLesson.
  // Use assignScenario() to get topicOptions when labTier.mode === 'user-choice',
  // then pass selectedTopicId back to assignScenario() once the user picks.

  useEffect(()=>{loadBookmarks().then(bm=>setIsBookmarked(bm.some(b=>b.levelId===levelId)));}, [levelId]);
  useEffect(()=>{ if(level) startLesson(level); }, [levelId]);
  useEffect(()=>{ if(state?.answered) setShowFeedback(true); }, [state?.answered]);

  const handleNext    = () => { setShowFeedback(false); advance(); };
  const handleFinish  = async () => {
    if(!state||!level) return;
    await completeLevel(levelId, state.xp, state.wrongCount===0);
    onComplete(state.stars, state.xp);
  };
  const handleBookmark = async () => {
    const bm = await loadBookmarks();
    if (isBookmarked) { await saveBookmarks(bm.filter(b=>b.levelId!==levelId)); setIsBookmarked(false); }
    else { if(level) { bm.unshift({levelId,topic:level.topic,fact:level.fact,savedAt:Date.now()}); await saveBookmarks(bm); } setIsBookmarked(true); }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };
  const handleTermPress = (link: TermLink) => { setActiveLink(link); setTermVisible(true); };
  const handleGoToLinked = (id: number) => {
    if(onNavigateToLesson) { if(level) setReturnTopic(level.topic); onNavigateToLesson(id); }
  };

  if (!level || !state) return null;
  const q        = state.questions[state.qIndex];
  const progress = (state.qIndex / state.questions.length) * 100;
  const isLast   = state.qIndex + 1 >= state.questions.length;

  if (state.finished) return <SafeAreaView style={sty.screen}><CompleteScreen stars={state.stars} xp={state.xp} topic={level.topic} onContinue={handleFinish}/></SafeAreaView>;
  if (state.failed)   return <SafeAreaView style={sty.screen}><FailScreen topic={level.topic} onRetry={resetLesson} onQuit={onExit}/></SafeAreaView>;

  return (
    <SafeAreaView style={sty.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg}/>
      <TopBar progress={progress} hearts={state.hearts} onExit={onExit}
        isBookmarked={isBookmarked} onBookmark={handleBookmark}
        onNotes={()=>setShowNotes(true)} onExport={exportAll}/>

      {returnTopic && <ReturnBanner topic={returnTopic} onReturn={()=>{setReturnTopic(null);onExit();}}/>}

      {q?.type==='concept_card' && <ConceptCard q={q} onNext={()=>{answerCorrect();setTimeout(advance,200);}} levelId={levelId} onTermPress={handleTermPress}/>}
      {q?.type==='simulator'    && <SimulatorCard simulatorType={q.simulatorType??''} onComplete={()=>{completeSimulator();advance();}} onSkip={()=>advance()}/>}
      {q?.type==='mcq'          && <MCQQuestion q={q} onCorrect={answerCorrect} onWrong={answerWrong}/>}
      {q?.type==='true_false'   && <TrueFalseQuestion q={q} onCorrect={answerCorrect} onWrong={answerWrong}/>}
      {q?.type==='order'        && <OrderQuestion q={q} onCorrect={answerCorrect} onWrong={answerWrong}/>}
      {q?.type==='multi_select' && <MultiSelectQuestion q={q} onCorrect={answerCorrect} onWrong={answerWrong}/>}
      {q?.type==='match_pairs'  && <MatchPairsQuestion q={q} onCorrect={answerCorrect} onWrong={answerWrong}/>}
      {q?.type==='fill_blank'   && <FillBlankQuestion q={q} onCorrect={answerCorrect} onWrong={answerWrong}/>}

      {showFeedback&&state.answered&&q?.type!=='concept_card'&&q?.type!=='simulator'&&(
        <FeedbackBar correct={state.lastCorrect??false} combo={state.combo} xp={state.xp} explanation={q?.explanation} onNext={handleNext} isLast={isLast}/>
      )}

      <TermLinkModal link={activeLink} visible={termVisible} onClose={()=>setTermVisible(false)} onGoToLesson={handleGoToLinked}/>
      <NotesPanel visible={showNotes} levelId={levelId} topic={level.topic} onClose={()=>setShowNotes(false)}/>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────
const sty = StyleSheet.create({
  screen:        {flex:1,backgroundColor:Colors.bg},
  topBar:        {flexDirection:'row',alignItems:'center',paddingHorizontal:Spacing.lg,paddingVertical:Spacing.md,backgroundColor:'#fff',borderBottomWidth:1,borderBottomColor:Colors.border,gap:Spacing.sm},
  exitBtn:       {padding:Spacing.sm},
  exitTxt:       {fontSize:18,color:Colors.textSoft},
  progressWrap:  {flex:1},
  progressBg:    {height:10,backgroundColor:Colors.border,borderRadius:99},
  progressFill:  {height:10,backgroundColor:Colors.accent,borderRadius:99},
  topActions:    {flexDirection:'row',alignItems:'center',gap:6},
  hearts:        {flexDirection:'row',gap:2},
  heart:         {fontSize:16},
  body:          {flex:1,padding:Spacing.lg},
  bodyContent:   {paddingBottom:Spacing.xxxl},
  card:          {backgroundColor:Colors.card,borderRadius:Radius.xl,borderWidth:1.5,borderColor:Colors.border,padding:Spacing.xxl},
  tierBadge:     {alignSelf:'flex-start',borderRadius:Radius.full,borderWidth:1.5,paddingHorizontal:Spacing.md,paddingVertical:3,marginBottom:Spacing.md},
  tierLabel:     {fontSize:FontSize.xs,fontWeight:'800',textTransform:'uppercase',letterSpacing:0.5},
  conceptTopic:  {fontSize:FontSize.xxl,fontWeight:'900',color:Colors.text,lineHeight:30,marginBottom:Spacing.md},
  divider:       {height:2,borderRadius:99,marginBottom:Spacing.lg,opacity:0.6},
  conceptFact:   {fontSize:FontSize.md,lineHeight:24,color:Colors.text},
  analogy:       {backgroundColor:'#f0f4ff',borderLeftWidth:4,borderLeftColor:Colors.accent,borderRadius:Radius.sm,padding:Spacing.md,marginTop:Spacing.lg},
  analogyLabel:  {fontSize:FontSize.xs,fontWeight:'800',color:Colors.accent,textTransform:'uppercase',letterSpacing:0.5,marginBottom:4},
  analogyText:   {fontSize:FontSize.sm,lineHeight:20,color:'#374151'},
  // term links
  termSection:   {marginTop:Spacing.lg,borderTopWidth:1,borderTopColor:Colors.border,paddingTop:Spacing.md},
  termSectionLabel:{fontSize:FontSize.xs,fontWeight:'800',color:Colors.textSoft,textTransform:'uppercase',letterSpacing:0.5,marginBottom:Spacing.sm},
  termRow:       {flexDirection:'row',flexWrap:'wrap',gap:Spacing.sm},
  termBadge:     {flexDirection:'row',alignItems:'center',backgroundColor:Colors.accentSoft,borderRadius:Radius.full,paddingHorizontal:Spacing.md,paddingVertical:5,borderWidth:1,borderColor:Colors.accent+'40'},
  termBadgeTxt:  {fontSize:FontSize.xs,fontWeight:'700',color:Colors.accent},
  // overlay/modal
  overlay:       {flex:1,backgroundColor:'rgba(0,0,0,0.45)',justifyContent:'center',alignItems:'center',padding:Spacing.xl},
  termModal:     {backgroundColor:Colors.card,borderRadius:Radius.xl,padding:Spacing.xxl,width:'100%',maxWidth:420},
  termModalHead: {flexDirection:'row',alignItems:'center',marginBottom:Spacing.md,gap:Spacing.sm},
  termModalIcon: {fontSize:22},
  termModalTitle:{flex:1,fontSize:FontSize.md,fontWeight:'800',color:Colors.text},
  termModalBody: {fontSize:FontSize.sm,lineHeight:21,color:Colors.textSoft,marginBottom:Spacing.lg},
  termModalBtn:  {backgroundColor:Colors.accent,borderRadius:Radius.md,paddingVertical:Spacing.md,alignItems:'center'},
  termModalBtnText:{color:'#fff',fontSize:FontSize.sm,fontWeight:'800'},
  // return banner
  returnBanner:  {backgroundColor:Colors.accentSoft,borderBottomWidth:1,borderBottomColor:Colors.accent+'40',paddingHorizontal:Spacing.lg,paddingVertical:Spacing.sm},
  returnTxt:     {fontSize:FontSize.sm,fontWeight:'700',color:Colors.accent},
  // notes panel
  notePanel:     {flex:1,backgroundColor:Colors.bg,marginTop:60},
  notePanelHead: {flexDirection:'row',alignItems:'center',padding:Spacing.lg,backgroundColor:Colors.card,borderBottomWidth:1,borderBottomColor:Colors.border},
  notePanelTitle:{fontSize:FontSize.md,fontWeight:'800',color:Colors.text},
  noteDraftRow:  {flexDirection:'row',gap:Spacing.sm,padding:Spacing.lg,backgroundColor:Colors.card,borderBottomWidth:1,borderBottomColor:Colors.border},
  noteDraftInput:{flex:1,minHeight:44,maxHeight:100,borderWidth:1.5,borderColor:Colors.border,borderRadius:Radius.md,paddingHorizontal:Spacing.md,paddingVertical:Spacing.sm,fontSize:FontSize.sm,color:Colors.text,backgroundColor:'#f8fafc'},
  noteSaveBtn:   {backgroundColor:Colors.accent,borderRadius:Radius.md,paddingHorizontal:Spacing.lg,alignItems:'center',justifyContent:'center'},
  noteSaveBtnTxt:{color:'#fff',fontSize:FontSize.sm,fontWeight:'800'},
  noteCard:      {backgroundColor:Colors.card,borderRadius:Radius.md,padding:Spacing.md,borderWidth:1,borderColor:Colors.border,marginBottom:Spacing.sm},
  noteContent:   {fontSize:FontSize.sm,lineHeight:20,color:Colors.text},
  noteFooter:    {flexDirection:'row',justifyContent:'space-between',marginTop:Spacing.sm},
  noteDate:      {fontSize:FontSize.xs,color:Colors.textMuted},
  // questions
  qCtx:          {fontSize:FontSize.xs,fontWeight:'800',color:Colors.accent,textTransform:'uppercase',letterSpacing:0.5,marginBottom:Spacing.sm},
  qPrompt:       {fontSize:FontSize.lg,fontWeight:'800',color:Colors.text,lineHeight:26},
  optBtn:        {flexDirection:'row',alignItems:'center',gap:Spacing.md,padding:Spacing.md,backgroundColor:Colors.card,borderRadius:Radius.md,borderWidth:2,borderColor:Colors.border},
  optLetter:     {width:30,height:30,borderRadius:8,backgroundColor:Colors.border,alignItems:'center',justifyContent:'center'},
  optLetterTxt:  {fontSize:FontSize.xs,fontWeight:'800'},
  optTxt:        {flex:1,fontSize:FontSize.md,fontWeight:'600',color:Colors.text,lineHeight:20},
  checkbox:      {width:24,height:24,borderRadius:6,borderWidth:2,alignItems:'center',justifyContent:'center'},
  tfRow:         {flexDirection:'row',gap:Spacing.md},
  tfBtn:         {flex:1,padding:Spacing.lg,borderRadius:Radius.md,alignItems:'center',justifyContent:'center'},
  tfTxt:         {fontSize:FontSize.md,fontWeight:'800'},
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
  feedbackBar:   {borderTopWidth:3,padding:Spacing.lg},
  feedbackRow:   {flexDirection:'row',alignItems:'flex-start',gap:Spacing.md},
  feedbackIcon:  {fontSize:24},
  feedbackTitle: {fontSize:FontSize.md,fontWeight:'800'},
  feedbackExpl:  {fontSize:FontSize.sm,color:Colors.textSoft,lineHeight:19,marginTop:2},
  xpBadge:       {backgroundColor:Colors.accentSoft,borderRadius:Radius.full,paddingHorizontal:Spacing.sm,paddingVertical:2,alignSelf:'flex-start'},
  xpBadgeTxt:    {fontSize:FontSize.xs,fontWeight:'800',color:Colors.accent},
  fullCenter:    {flex:1,alignItems:'center',justifyContent:'center',padding:Spacing.xxl},
  stars:         {fontSize:44,letterSpacing:6,color:Colors.gold,marginBottom:Spacing.lg},
  bigTitle:      {fontSize:FontSize.xxxl,fontWeight:'900',color:Colors.text},
  subtopic:      {fontSize:FontSize.md,color:Colors.textSoft,marginTop:Spacing.sm,textAlign:'center'},
  xpNum:         {fontSize:38,fontWeight:'900',color:Colors.accent,marginTop:Spacing.lg},
  perfectBadge:  {backgroundColor:Colors.gold,borderRadius:Radius.full,paddingHorizontal:Spacing.lg,paddingVertical:Spacing.sm,marginTop:Spacing.md},
  perfectTxt:    {fontSize:FontSize.sm,fontWeight:'800',color:'#fff',letterSpacing:0.5},
  primaryBtn:    {backgroundColor:Colors.accent,borderRadius:Radius.md,paddingVertical:Spacing.lg,alignItems:'center',width:'100%'},
  primaryBtnTxt: {color:'#fff',fontSize:FontSize.lg,fontWeight:'800',letterSpacing:0.3},
  ghostBtn:      {borderRadius:Radius.md,paddingVertical:Spacing.lg,alignItems:'center',borderWidth:2,borderColor:Colors.border},
  ghostTxt:      {color:Colors.textSoft,fontSize:FontSize.lg,fontWeight:'700'},
});

function shuffle<T>(arr:T[]):T[]{const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
