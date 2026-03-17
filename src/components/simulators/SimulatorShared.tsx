/**
 * SimulatorShared — Shared UI primitives for all Sifter simulator renderers.
 * Import from here instead of redefining in each renderer.
 */

import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Animated, Platform,
} from 'react-native';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../../theme';

// ── Shell ─────────────────────────────────────────────────────────────────────

export function SimShell({
  title, subtitle, icon, label, children,
}: {
  title: string; subtitle: string; icon: string;
  label?: string; children: React.ReactNode;
}) {
  return (
    <ScrollView
      style={sh.wrap}
      contentContainerStyle={sh.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={sh.header}>
        <Text style={sh.icon}>{icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={sh.label}>{label ?? '⚡ SIFTER SKILL_UP'}</Text>
          <Text style={sh.title}>{title}</Text>
          <Text style={sh.subtitle}>{subtitle}</Text>
        </View>
      </View>
      {children}
    </ScrollView>
  );
}

const sh = StyleSheet.create({
  wrap:     { flex: 1 },
  content:  { padding: Spacing.lg, paddingBottom: 80, gap: Spacing.md },
  header:   {
    flexDirection: 'row', gap: Spacing.md,
    backgroundColor: '#f0f4ff', borderRadius: Radius.lg,
    padding: Spacing.md, alignItems: 'flex-start',
  },
  icon:     { fontSize: 36, lineHeight: 44 },
  label:    {
    fontSize: FontSize.xs, fontWeight: '800', color: Colors.accent,
    textTransform: 'uppercase', letterSpacing: 0.8,
  },
  title:    { fontSize: FontSize.lg, fontWeight: '900', color: Colors.text, lineHeight: 24, marginTop: 2 },
  subtitle: { fontSize: FontSize.sm, color: Colors.textSoft, lineHeight: 18, marginTop: 2 },
});

// ── Buttons ───────────────────────────────────────────────────────────────────

export function PrimaryBtn({
  label, onPress, disabled = false, color,
}: { label: string; onPress: () => void; disabled?: boolean; color?: string }) {
  return (
    <TouchableOpacity
      onPress={onPress} disabled={disabled} activeOpacity={0.85}
      style={[btn.primary, disabled && btn.disabled, color ? { backgroundColor: color } : {}]}
    >
      <Text style={btn.primaryText}>{label}</Text>
    </TouchableOpacity>
  );
}

export function GhostBtn({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={btn.ghost}>
      <Text style={btn.ghostText}>{label}</Text>
    </TouchableOpacity>
  );
}

const btn = StyleSheet.create({
  primary:     {
    backgroundColor: Colors.accent, borderRadius: Radius.md,
    paddingVertical: Spacing.lg, alignItems: 'center', width: '100%', marginTop: 4,
  },
  disabled:    { opacity: 0.4 },
  primaryText: { color: '#fff', fontSize: FontSize.lg, fontWeight: '800' },
  ghost:       { paddingVertical: Spacing.md, alignItems: 'center', marginTop: 4 },
  ghostText:   { color: Colors.textSoft, fontSize: FontSize.sm },
});

// ── Cards ─────────────────────────────────────────────────────────────────────

export function Card({ children, style }: { children: React.ReactNode; style?: object }) {
  return <View style={[card.box, Shadow.sm, style]}>{children}</View>;
}

const card = StyleSheet.create({
  box: {
    backgroundColor: Colors.card, borderRadius: Radius.lg,
    borderWidth: 1.5, borderColor: Colors.border, padding: Spacing.lg,
  },
});

// ── Result box ────────────────────────────────────────────────────────────────

export function ResultBox({ correct, message }: { correct: boolean; message: string }) {
  return (
    <View style={[res.box, { backgroundColor: correct ? '#d1fae5' : '#fee2e2', borderColor: correct ? Colors.green : Colors.red }]}>
      <Text style={res.icon}>{correct ? '✅' : '❌'}</Text>
      <Text style={[res.msg, { color: correct ? '#065f46' : '#7f1d1d' }]}>{message}</Text>
    </View>
  );
}

const res = StyleSheet.create({
  box:  { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1.5 },
  icon: { fontSize: 18, marginTop: 1 },
  msg:  { flex: 1, fontSize: FontSize.sm, fontWeight: '600', lineHeight: 19 },
});

// ── Section label ─────────────────────────────────────────────────────────────

export function SectionLabel({ text, color }: { text: string; color?: string }) {
  return (
    <Text style={[sec.label, color ? { color } : {}]}>{text}</Text>
  );
}

const sec = StyleSheet.create({
  label: {
    fontSize: FontSize.xs, fontWeight: '800', color: Colors.accent,
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: Spacing.sm,
  },
});

// ── Score screen ──────────────────────────────────────────────────────────────

export function ScoreScreen({
  score, total, xp, overallFeedback, onComplete,
}: {
  score: number; total: number; xp?: number;
  overallFeedback?: string; onComplete: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  const pct = score / total;
  const emoji = pct === 1 ? '🏆' : pct >= 0.8 ? '⭐' : pct >= 0.6 ? '📈' : '🔄';
  const label = pct === 1 ? 'Perfect' : pct >= 0.8 ? 'Strong' : pct >= 0.6 ? 'Developing' : 'Review Needed';
  const color = pct === 1 ? Colors.gold : pct >= 0.8 ? Colors.accent : pct >= 0.6 ? Colors.green : Colors.textSoft;

  return (
    <Animated.View style={[sc.wrap, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
      <Text style={sc.emoji}>{emoji}</Text>
      <Text style={[sc.fraction, { color }]}>{score}/{total} criteria met</Text>
      <Text style={sc.label}>{label}</Text>
      {xp !== undefined && xp > 0 && (
        <View style={[sc.xpBadge, { backgroundColor: color + '22' }]}>
          <Text style={[sc.xpText, { color }]}>+{xp} XP</Text>
        </View>
      )}
      {overallFeedback ? (
        <View style={sc.feedbackBox}>
          <Text style={sc.feedbackText}>{overallFeedback}</Text>
        </View>
      ) : null}
      <PrimaryBtn label="Complete ✓" onPress={onComplete} color={color !== Colors.textSoft ? color : undefined} />
    </Animated.View>
  );
}

const sc = StyleSheet.create({
  wrap:        { alignItems: 'center', padding: Spacing.xl, gap: Spacing.md },
  emoji:       { fontSize: 56 },
  fraction:    { fontSize: 28, fontWeight: '900' },
  label:       { fontSize: FontSize.md, color: Colors.textSoft, fontWeight: '600' },
  xpBadge:    { borderRadius: Radius.full, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm },
  xpText:     { fontSize: FontSize.xl, fontWeight: '900' },
  feedbackBox: {
    backgroundColor: '#f8fafc', borderRadius: Radius.md,
    padding: Spacing.md, width: '100%', borderWidth: 1, borderColor: Colors.border,
  },
  feedbackText: { fontSize: FontSize.sm, color: Colors.text, lineHeight: 20 },
});

// ── Criterion row (for AI-scored results) ──────────────────────────────────────

export function CriterionRow({
  criterion, passed, feedback, delay = 0,
}: { criterion: string; passed: boolean; feedback: string; delay?: number }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(-12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 280, delay, useNativeDriver: true }),
      Animated.spring(translateX, { toValue: 0, tension: 80, friction: 10, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[cr.row, passed ? cr.pass : cr.fail, { opacity, transform: [{ translateX }] }]}>
      <Text style={[cr.icon, { color: passed ? '#10b981' : '#ef4444' }]}>
        {passed ? '✓' : '✗'}
      </Text>
      <View style={{ flex: 1 }}>
        <Text style={cr.criterion}>{criterion}</Text>
        <Text style={[cr.feedback, { color: passed ? '#065f46' : '#7f1d1d' }]}>{feedback}</Text>
      </View>
    </Animated.View>
  );
}

const cr = StyleSheet.create({
  row:       {
    flexDirection: 'row', gap: 10, padding: Spacing.md,
    borderRadius: Radius.md, marginBottom: 8, borderWidth: 1,
  },
  pass:      { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
  fail:      { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
  icon:      { fontSize: 15, fontWeight: '900', marginTop: 1, width: 16 },
  criterion: { fontSize: 13, fontWeight: '700', color: '#0f172a', lineHeight: 18, marginBottom: 2 },
  feedback:  { fontSize: 12, lineHeight: 17 },
});

// ── Typing indicator ──────────────────────────────────────────────────────────

export function TypingIndicator({ label = 'Evaluating your response…' }: { label?: string }) {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.3, duration: 300, useNativeDriver: true }),
        ])
      ).start();

    animate(dot1, 0);
    animate(dot2, 200);
    animate(dot3, 400);
  }, []);

  return (
    <View style={ty.wrap}>
      {[dot1, dot2, dot3].map((dot, i) => (
        <Animated.View key={i} style={[ty.dot, { opacity: dot }]} />
      ))}
      <Text style={ty.label}>{label}</Text>
    </View>
  );
}

const ty = StyleSheet.create({
  wrap:  { flexDirection: 'row', alignItems: 'center', gap: 6, padding: Spacing.md },
  dot:   { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.accent },
  label: { fontSize: FontSize.sm, color: Colors.textSoft, fontWeight: '600' },
});

// ── Shared types ──────────────────────────────────────────────────────────────

export interface SimBaseProps {
  onComplete: () => void;
  onSkip: () => void;
}

export interface ScoringResult {
  criteriaResults: Array<{ criterion: string; passed: boolean; feedback: string }>;
  overallFeedback: string;
  score: number;
  total: number;
  xpEarned: number;
}

// ── Claude scoring helper ─────────────────────────────────────────────────────

const SCORE_SYSTEM = `You are a professional skills evaluator for Sifter Skill_Up. Be direct, specific, and demanding — this builds real-world competence.

Respond ONLY with valid JSON. No preamble, no markdown fences. Exactly this shape:
{"criteriaResults":[{"criterion":"exact text copied verbatim","passed":true,"feedback":"one specific sentence"}],"overallFeedback":"2-3 direct, actionable sentences referencing the actual response.","score":4,"total":6,"xpEarned":100}

Rules: Each criterion is binary. Vague answers do not pass. xpEarned = round((score/total)*150/10)*10, cap 150.`;

/**
 * SECURITY NOTE: All AI scoring goes through the Sifter backend at /api/ai/score.
 * The Anthropic API key lives only on the server — never in client code.
 * The backend validates the auth token, rate-limits requests, and calls Anthropic.
 *
 * Backend contract (FastAPI):
 *   POST /api/ai/score
 *   Body: { scenario, criteria, userResponse, context? }
 *   Returns: ScoringResult JSON
 *   The backend uses the SCORE_SYSTEM prompt (stored server-side) to call Claude.
 */
export async function scoreWithClaude(
  scenario: string,
  criteria: string[],
  userResponse: string,
  context?: string,
): Promise<ScoringResult> {
  // Input validation — prevent prompt injection via oversized payloads
  const MAX_SCENARIO  = 4000;
  const MAX_RESPONSE  = 3000;
  const MAX_CRITERION = 300;
  const MAX_CRITERIA  = 20;

  const safeScenario  = scenario.slice(0, MAX_SCENARIO);
  const safeResponse  = userResponse.slice(0, MAX_RESPONSE);
  const safeCriteria  = criteria.slice(0, MAX_CRITERIA).map(c => c.slice(0, MAX_CRITERION));

  const { API } = await import('../../lib/api');
  const result = await API.scoreSimulator({
    scenario:     safeScenario,
    criteria:     safeCriteria,
    userResponse: safeResponse,
    context:      context?.slice(0, 500),
  });

  // Validate response shape before returning
  if (!result.criteriaResults || typeof result.score !== 'number') {
    throw new Error('Invalid scoring response from server');
  }
  return result;
}
