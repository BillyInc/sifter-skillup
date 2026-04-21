/**
 * MascotLayer — Tool-based mascot system for Sifter Skill_Up.
 *
 * Each skill track has a mascot that IS the primary tool of that trade:
 *   Spot/Futures/Options Trading  → 📈 The Chart
 *   Quant Trading / Research      → 🐍 Python (their actual weapon)
 *   OnChain Analysis / Sleuth     → 🔍 Block Explorer
 *   Supply Chain Analyst          → 📦 The Inventory
 *   SQL / Data Analysis           → 🗄️ The Database
 *   Smart Contract Dev / Auditing → ⛓️ The Chain
 *   Bot Development               → 🤖 The Bot
 *   Memecoin Trading              → 🎯 DEXScreener
 *   Content Creation              → 🎙️ The Mic
 *
 * WHEN the mascot appears:
 *   correct_answer  → inline toast, auto-dismiss 1.8s
 *   wrong_answer    → inline toast, never shames, auto-dismiss 2.6s
 *   lab_start       → modal, fires ONCE at the start of each new Lab only
 *                     (NOT after every lesson — that's noise)
 *   level_complete  → modal
 *   boss_pass       → modal
 *   streak_milestone→ modal
 *   perfect_score   → modal
 *   daily_return    → toast
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Animated, TouchableOpacity,
  Dimensions, Modal, Platform,
} from 'react-native';
import { Colors, Spacing, Radius, FontSize } from '../theme';

const { width: W } = Dimensions.get('window');

// ── Types ─────────────────────────────────────────────────────────────────────

export type MascotEvent =
  | 'correct_answer'
  | 'wrong_answer'
  | 'lab_start'
  | 'level_complete'
  | 'boss_pass'
  | 'streak_milestone'
  | 'perfect_score'
  | 'daily_return';

interface Props {
  visible:      boolean;
  event:        MascotEvent;
  trackId:      string;
  userName?:    string;
  streakDays?:  number;
  xpEarned?:    number;
  labTitle?:    string;
  labPreview?:  string;
  onDismiss:    () => void;
}

// ── Mascot definitions ────────────────────────────────────────────────────────

interface MascotDef {
  face:  string;
  name:  string;
  color: string;
  intro: string;
}

const MASCOTS: Record<string, MascotDef> = {
  'spot-trading':          { face: '📈', name: 'The Chart',        color: '#f7931a', intro: 'Every entry and exit lives on me.' },
  'futures-trading':       { face: '📈', name: 'The Chart',        color: '#f59e0b', intro: 'Leverage makes me matter more.' },
  'options-trading':       { face: '📊', name: 'The Options Chain',color: '#8b5cf6', intro: 'I show every strike and every expiry.' },
  'memecoin-trading':      { face: '🎯', name: 'DEXScreener',      color: '#06b6d4', intro: 'I show you what\'s moving before Twitter does.' },
  'quant-trading':         { face: '🐍', name: 'Python',           color: '#3b82f6', intro: 'I\'m what separates quants from everyone else.' },
  'arbitrage-mev':         { face: '⚙️', name: 'The Bot',          color: '#1a1a2e', intro: 'I execute while you sleep.' },
  'onchain-analysis':      { face: '🔍', name: 'Block Explorer',   color: '#6366f1', intro: 'Every transaction ever made — I can show you.' },
  'onchain-sleuth':        { face: '🔍', name: 'Block Explorer',   color: '#6366f1', intro: 'The chain never lies. I help you read it.' },
  'token-research':        { face: '📋', name: 'The Research Doc', color: '#3b82f6', intro: 'I\'m what separates an investor from a gambler.' },
  'defi-research':         { face: '⟠',  name: 'The Protocol',     color: '#627eea', intro: 'I am the code that runs DeFi.' },
  'quant-research':        { face: '🐍', name: 'Python',           color: '#3b82f6', intro: 'Without me, quant research is just a spreadsheet.' },
  'data-analysis':         { face: '🗄️', name: 'The Database',     color: '#0ea5e9', intro: 'Every insight starts with me.' },
  'data-science':          { face: '🐍', name: 'Python',           color: '#3b82f6', intro: 'pandas, numpy, sklearn — I carry them all.' },
  'computational-science': { face: '🧮', name: 'The Simulation',   color: '#8b5cf6', intro: 'I model reality before it happens.' },
  'smart-contract-dev':    { face: '⛓️', name: 'Solidity',         color: '#627eea', intro: 'I\'m the language the blockchain speaks.' },
  'dapp-development':      { face: '🌐', name: 'The Browser',      color: '#10b981', intro: 'I\'m where your users live.' },
  'bot-development':       { face: '🤖', name: 'The Bot',          color: '#6366f1', intro: 'I run the logic you write.' },
  'quant-developer':       { face: '🐍', name: 'Python',           color: '#3b82f6', intro: 'I\'m how quants turn ideas into systems.' },
  'vibe-coding':           { face: '✨', name: 'The AI Assistant',  color: '#a855f7', intro: 'I write the code. You direct the thinking.' },
  'contract-auditing':     { face: '🔒', name: 'The Audit Report', color: '#ef4444', intro: 'I find what hackers look for — before they do.' },
  'bounty-hunting':        { face: '🐛', name: 'The Bug',          color: '#f59e0b', intro: 'I\'m what you\'re hunting. I\'m always hiding.' },
  'supply-chain-analyst':  { face: '📦', name: 'The Inventory',    color: '#10b981', intro: 'Too much costs money. Too little stops the line.' },
  'content-creation':      { face: '🎙️', name: 'The Mic',          color: '#ef4444', intro: 'I amplify your voice — if you know how to use me.' },
  'community-management':  { face: '💬', name: 'The Community',    color: '#f97316', intro: 'I\'m alive 24/7. You need a system to manage me.' },
  default:                 { face: '⚡', name: 'The Skill',         color: '#6366f1', intro: 'Every skill starts with one tool. This is yours.' },
};

// The ⚡ Bolt — Sifter brand mascot for milestone/global events (Duolingo owl equivalent).
// Used for: level_complete, boss_pass, streak_milestone, perfect_score, daily_return.
// Track tool mascots used for: correct_answer, wrong_answer, lab_start.
const BOLT_MASCOT: MascotDef = {
  face:  '⚡',
  name:  'Sifter',
  color: '#6366f1',
  intro: 'Skills compound. Keep building.',
};

const BOLT_EVENTS: MascotEvent[] = [
  'level_complete', 'boss_pass', 'streak_milestone', 'perfect_score', 'daily_return',
];

function getMascot(trackId: string, event: MascotEvent): MascotDef {
  if (BOLT_EVENTS.includes(event)) return BOLT_MASCOT;
  return MASCOTS[trackId] ?? MASCOTS.default;
}

// ── Speech — written in the TOOL'S voice, not a cheerleader ──────────────────

const SPEECH: Record<MascotEvent, (m: MascotDef, v: Record<string,string>) => string[]> = {
  correct_answer:   (m) => [
    `That\'s how you use ${m.name}.`,
    `Right. ${m.intro}`,
    `Correct. This is what ${m.name} does.`,
    `Yes — ${m.name} working for you.`,
  ],
  wrong_answer:     (m) => [
    `Not quite. ${m.intro} Read the explanation.`,
    `Close. The gap is smaller than you think.`,
    `${m.name} doesn\'t forgive guessing. Read carefully.`,
    `Almost. One more pass and you\'ll have it.`,
  ],
  lab_start:        (m, v) => [
    `${v.lab} — this is where ${m.name} gets real.`,
    `New lab. You\'re about to learn how to use ${m.name} for this.`,
    `${v.lab}. ${m.intro}`,
  ],
  level_complete:   (m, v) => [
    `${v.name}, you now understand ${m.name} better than most people in this field.`,
    `Level done. ${m.name} is part of your toolkit now.`,
    `${m.name} works when you know how to use it. Now you do.`,
  ],
  boss_pass:        (m) => [
    `Passed. That scenario was unseen. You handled it.`,
    `Boss defeated. ${m.name} certified.`,
    `That\'s the level. Portfolio artifact incoming.`,
  ],
  streak_milestone: (_, v) => [
    `${v.streak} days straight. Skills compound like this.`,
    `Day ${v.streak}. Consistency is the actual edge.`,
    `${v.streak}-day streak. Most people stopped long before here.`,
  ],
  perfect_score:    (m) => [
    `Every criterion. ${m.name} used correctly in every single one.`,
    `Flawless. That\'s full command of ${m.name}.`,
    `Perfect. Not a single miss.`,
  ],
  daily_return:     (m, v) => [
    `Back to it, ${v.name}. ${m.name} is ready.`,
    `Day ${v.streak}. ${m.intro}`,
    `${v.name}. ${m.name} doesn\'t build itself.`,
  ],
};

function getSpeech(event: MascotEvent, mascot: MascotDef, vars: Record<string,string>): string {
  const pool = SPEECH[event]?.(mascot, vars) ?? ['Keep going.'];
  return pool[Math.floor(Math.random() * pool.length)];
}

// ── Sizes ─────────────────────────────────────────────────────────────────────

const IS_MODAL: Record<MascotEvent, boolean> = {
  correct_answer: false, wrong_answer: false, daily_return: false,
  lab_start: true, level_complete: true, boss_pass: true,
  streak_milestone: true, perfect_score: true,
};

const AUTO_DISMISS_MS: Record<MascotEvent, number> = {
  correct_answer: 1800, wrong_answer: 2600, daily_return: 2800,
  lab_start: 0, level_complete: 0, boss_pass: 0,
  streak_milestone: 3500, perfect_score: 0,
};

// ── Bouncing tool ─────────────────────────────────────────────────────────────

function ToolChar({ face, em }: { face: string; em: number }) {
  const bounce = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(bounce, { toValue: -5, duration: 480, useNativeDriver: true }),
      Animated.timing(bounce, { toValue:  0, duration: 480, useNativeDriver: true }),
    ])).start();
  }, []);
  return <Animated.Text style={{ fontSize: em, transform: [{ translateY: bounce }] }}>{face}</Animated.Text>;
}

// ── Toast ─────────────────────────────────────────────────────────────────────

function MascotToast({ mascot, speech, event, onDismiss }: {
  mascot: MascotDef; speech: string; event: MascotEvent; onDismiss: () => void;
}) {
  const ty = useRef(new Animated.Value(70)).current;
  const op = useRef(new Animated.Value(0)).current;
  const isWrong = event === 'wrong_answer';

  useEffect(() => {
    Animated.parallel([
      Animated.spring(ty, { toValue: 0, tension: 72, friction: 11, useNativeDriver: true }),
      Animated.timing(op, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();
    const ms = AUTO_DISMISS_MS[event];
    if (ms > 0) {
      const t = setTimeout(() => {
        Animated.parallel([
          Animated.timing(ty, { toValue: 70, duration: 220, useNativeDriver: true }),
          Animated.timing(op, { toValue: 0, duration: 220, useNativeDriver: true }),
        ]).start(onDismiss);
      }, ms);
      return () => clearTimeout(t);
    }
  }, []);

  return (
    <Animated.View style={[
      ts.wrap,
      { backgroundColor: isWrong ? '#1e293b' : mascot.color },
      { transform: [{ translateY: ty }], opacity: op },
    ]}>
      <ToolChar face={mascot.face} em={34} />
      <View style={{ flex: 1 }}>
        <Text style={ts.toolName}>{mascot.name}</Text>
        <Text style={ts.speech}>{speech}</Text>
      </View>
    </Animated.View>
  );
}

const ts = StyleSheet.create({
  wrap:     { position: 'absolute', bottom: 90, left: Spacing.lg, right: Spacing.lg, borderRadius: Radius.xl, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.22, shadowRadius: 14 }, android: { elevation: 10 } }) },
  toolName: { fontSize: 10, fontWeight: '900', color: 'rgba(255,255,255,0.72)', textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 1 },
  speech:   { fontSize: FontSize.sm, fontWeight: '700', color: '#fff', lineHeight: 19 },
});

// ── Modal ─────────────────────────────────────────────────────────────────────

function MascotModal({ mascot, speech, event, xp, labTitle, labPreview, onDismiss }: {
  mascot: MascotDef; speech: string; event: MascotEvent;
  xp?: number; labTitle?: string; labPreview?: string; onDismiss: () => void;
}) {
  const scale = useRef(new Animated.Value(0.62)).current;
  const op    = useRef(new Animated.Value(0)).current;
  const isLab = event === 'lab_start';

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, tension: 56, friction: 8, useNativeDriver: true }),
      Animated.timing(op,    { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start();
    const ms = AUTO_DISMISS_MS[event];
    if (ms > 0) { const t = setTimeout(onDismiss, ms); return () => clearTimeout(t); }
  }, []);

  const btnLabel = isLab ? 'Start Lab →' : (event === 'level_complete' || event === 'boss_pass') ? 'Continue →' : 'Got it';

  return (
    <Modal transparent animationType="none" visible onRequestClose={onDismiss}>
      <TouchableOpacity style={md.backdrop} activeOpacity={1} onPress={AUTO_DISMISS_MS[event] === 0 ? undefined : onDismiss}>
        <Animated.View style={[md.card, { transform: [{ scale }], opacity: op }]}>
          <View style={[md.stripe, { backgroundColor: mascot.color }]} />

          <View style={[md.iconWrap, { backgroundColor: mascot.color + '14' }]}>
            <ToolChar face={mascot.face} em={60} />
          </View>

          <View style={[md.badge, { backgroundColor: mascot.color }]}>
            <Text style={md.badgeText}>{mascot.name}</Text>
          </View>

          <Text style={md.speech}>{speech}</Text>

          {isLab && labPreview ? (
            <View style={md.labBox}>
              {labTitle ? <Text style={md.labTitle}>{labTitle}</Text> : null}
              <Text style={md.labPreview}>{labPreview}</Text>
            </View>
          ) : null}

          {xp !== undefined && xp > 0 ? (
            <View style={[md.xpBadge, { backgroundColor: mascot.color + '18' }]}>
              <Text style={[md.xpText, { color: mascot.color }]}>+{xp} XP</Text>
            </View>
          ) : null}

          <TouchableOpacity style={[md.btn, { backgroundColor: mascot.color }]} onPress={onDismiss} activeOpacity={0.88}>
            <Text style={md.btnText}>{btnLabel}</Text>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

const md = StyleSheet.create({
  backdrop:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.56)', alignItems: 'center', justifyContent: 'center' },
  card:       { backgroundColor: '#fff', borderRadius: 24, width: W * 0.84, alignItems: 'center', overflow: 'hidden', ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.26, shadowRadius: 24 }, android: { elevation: 16 } }) },
  stripe:     { height: 6, width: '100%' },
  iconWrap:   { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginVertical: Spacing.lg },
  badge:      { borderRadius: Radius.full, paddingHorizontal: Spacing.lg, paddingVertical: 5, marginBottom: Spacing.md },
  badgeText:  { fontSize: 11, fontWeight: '900', color: '#fff', textTransform: 'uppercase', letterSpacing: 1.2 },
  speech:     { fontSize: 18, fontWeight: '800', color: '#0f172a', textAlign: 'center', paddingHorizontal: Spacing.xl, lineHeight: 27, marginBottom: Spacing.md },
  labBox:     { backgroundColor: '#f8fafc', borderRadius: Radius.lg, padding: Spacing.md, marginHorizontal: Spacing.lg, marginBottom: Spacing.md, width: W * 0.72 },
  labTitle:   { fontSize: 11, fontWeight: '800', color: Colors.textSoft, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  labPreview: { fontSize: FontSize.sm, color: '#334155', lineHeight: 20 },
  xpBadge:    { borderRadius: Radius.full, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, marginBottom: Spacing.md },
  xpText:     { fontSize: FontSize.xl, fontWeight: '900' },
  btn:        { borderRadius: Radius.lg, paddingVertical: Spacing.lg, paddingHorizontal: 40, marginBottom: Spacing.xl },
  btnText:    { color: '#fff', fontSize: FontSize.md, fontWeight: '800' },
});

// ── Main export ────────────────────────────────────────────────────────────────

export default function MascotLayer({ visible, event, trackId, userName, streakDays, xpEarned, labTitle, labPreview, onDismiss }: Props) {
  if (!visible) return null;
  const mascot = getMascot(trackId, event);
  const speech = getSpeech(event, mascot, { name: userName ?? 'You', streak: String(streakDays ?? 0), lab: labTitle ?? '' });

  if (!IS_MODAL[event]) {
    return <MascotToast mascot={mascot} speech={speech} event={event} onDismiss={onDismiss} />;
  }
  return <MascotModal mascot={mascot} speech={speech} event={event} xp={xpEarned} labTitle={labTitle} labPreview={labPreview} onDismiss={onDismiss} />;
}

// ── useMascot hook ────────────────────────────────────────────────────────────

export function useMascot() {
  const [state, setState] = useState<{ visible: boolean; event: MascotEvent; labTitle?: string; labPreview?: string; xpEarned?: number; }>({ visible: false, event: 'correct_answer' });
  const show = (event: MascotEvent, extras?: { labTitle?: string; labPreview?: string; xpEarned?: number }) =>
    setState({ visible: true, event, ...extras });
  const hide = () => setState(s => ({ ...s, visible: false }));
  return { mascotState: state, showMascot: show, hideMascot: hide };
}
