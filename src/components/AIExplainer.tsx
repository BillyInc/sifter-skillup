/**
 * Sifter Skill_Up — AI Explainer
 * Bottom sheet that explains a concept using claude-sonnet-4-20250514.
 * Rate-limited: 3 per lesson session. Blocked on portfolio/simulator screens.
 *
 * Works identically on mobile, web narrow, and web wide.
 * On web: renders as a centered modal overlay (not slide-up sheet).
 *
 * Usage:
 *   <AIExplainer
 *     conceptText="The AMM constant product formula x·y = k..."
 *     lessonId={42}
 *     trackId="defi-research-analyst"
 *     isBlocked={isSimulatorScreen || isPortfolioContext}
 *     onClose={() => setShowExplainer(false)}
 *   />
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Animated, Platform, useWindowDimensions,
  KeyboardAvoidingView,
} from 'react-native';
import { useTheme, Spacing, Radius, FontSize, FontWeight, Shadow } from '../theme';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface AIExplainerProps {
  conceptText:    string;
  lessonId:       number;
  trackId:        string;
  trackName?:     string;
  isBlocked?:     boolean;      // true on portfolio/simulator/challenge screens
  sessionUsed?:   number;       // how many explainer calls used this session (max 3)
  onClose:        () => void;
  onUsed?:        () => void;   // called each time an explanation is fetched
}

interface ExplainerResult {
  explanation:       string;
  analogy?:          string;
  key_terms:         string[];
  follow_up_questions: string[];
}

const MAX_PER_SESSION = 3;

const BLOCKED_MESSAGE =
  "AI can help you learn — but your portfolio and challenge work must be genuinely yours.\nYour work is what employers see.";

// ─── Component ────────────────────────────────────────────────────────────────

export default function AIExplainer({
  conceptText,
  lessonId,
  trackId,
  trackName = 'this track',
  isBlocked = false,
  sessionUsed = 0,
  onClose,
  onUsed,
}: AIExplainerProps) {
  const { colors }     = useTheme();
  const { width }      = useWindowDimensions();
  const isWebWide      = Platform.OS === 'web' && width >= 768;

  const [question, setQuestion] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState<ExplainerResult | null>(null);
  const [error,    setError]    = useState<string | null>(null);

  // Slide-up animation (mobile/web narrow only)
  const slideAnim  = useRef(new Animated.Value(isWebWide ? 1 : 0)).current;
  const backdropOp = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 1, useNativeDriver: true, damping: 20, stiffness: 250 }),
      Animated.timing(backdropOp, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  }, []);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(backdropOp, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(onClose);
  };

  const handleExplain = async () => {
    if (sessionUsed >= MAX_PER_SESSION) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model:      'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: `You are a patient, expert tutor on Sifter Skill_Up, a professional career learning platform.
The user is studying ${trackName} and has encountered a concept they don't understand.
Break it down simply. Use a real-world analogy. Keep your explanation under 200 words.
Never give answers to exercises or portfolio tasks — only explain the underlying concept.
Respond ONLY with a JSON object — no markdown, no preamble — in this exact shape:
{
  "explanation": "string",
  "analogy": "string or null",
  "key_terms": ["term1","term2"],
  "follow_up_questions": ["question1","question2"]
}`,
          messages: [{
            role: 'user',
            content: `Concept: ${conceptText}\n${question ? `\nMy question: ${question}` : ''}`,
          }],
        }),
      });
      const data = await res.json();
      const raw  = data?.content?.[0]?.text ?? '{}';
      const parsed: ExplainerResult = JSON.parse(raw.replace(/```json|```/g, '').trim());
      setResult(parsed);
      onUsed?.();
    } catch (e) {
      setError("Couldn't get an explanation right now. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const remaining = MAX_PER_SESSION - sessionUsed;

  // ── Blocked state ─────────────────────────────────────────────────────────

  if (isBlocked) {
    return (
      <Animated.View style={[styles.backdrop, { opacity: backdropOp }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={dismiss} activeOpacity={1} />
        <View style={[
          isWebWide ? styles.webModal : styles.sheet,
          { backgroundColor: colors.card },
        ]}>
          <Text style={[styles.blockedIcon]}>🔒</Text>
          <Text style={[styles.blockedTitle, { color: colors.text }]}>AI Help Unavailable Here</Text>
          <Text style={[styles.blockedMsg, { color: colors.textSoft }]}>{BLOCKED_MESSAGE}</Text>
          <TouchableOpacity style={[styles.closeBtn, { backgroundColor: colors.accent }]} onPress={dismiss}>
            <Text style={styles.closeBtnText}>Got it</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  }

  // ── Sheet transform ───────────────────────────────────────────────────────

  const sheetTransform = isWebWide
    ? [{ scale: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) }]
    : [{ translateY: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [500, 0] }) }];

  // ── Main render ───────────────────────────────────────────────────────────

  return (
    <Animated.View style={[styles.backdrop, { opacity: backdropOp }]}>
      <TouchableOpacity style={StyleSheet.absoluteFill} onPress={dismiss} activeOpacity={1} />

      <Animated.View
        style={[
          isWebWide ? styles.webModal : styles.sheet,
          { backgroundColor: colors.card, transform: sheetTransform },
        ]}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.sheetHeader}>
              <Text style={styles.lightbulb}>💡</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.sheetTitle, { color: colors.text }]}>Explain this to me</Text>
                <Text style={[styles.rateBadge, { color: colors.textMuted }]}>
                  {remaining > 0 ? `${remaining} explanation${remaining !== 1 ? 's' : ''} left this lesson` : 'No explanations left this lesson'}
                </Text>
              </View>
              <TouchableOpacity onPress={dismiss} style={styles.xBtn}>
                <Text style={[styles.xBtnText, { color: colors.textMuted }]}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Concept preview */}
            <View style={[styles.conceptBox, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
              <Text style={[styles.conceptLabel, { color: colors.accent }]}>CONCEPT</Text>
              <Text style={[styles.conceptText, { color: colors.textSoft }]} numberOfLines={4}>
                {conceptText}
              </Text>
            </View>

            {/* Optional question */}
            {!result && (
              <>
                <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Have a specific question? (optional)</Text>
                <TextInput
                  style={[styles.questionInput, { backgroundColor: colors.bgSecondary, borderColor: colors.border, color: colors.text }]}
                  placeholder="e.g. How does this differ from Uniswap v2?"
                  placeholderTextColor={colors.textMuted}
                  value={question}
                  onChangeText={setQuestion}
                  multiline
                  maxLength={200}
                  editable={remaining > 0}
                />
              </>
            )}

            {/* Error */}
            {error && (
              <Text style={[styles.errorText, { color: colors.red }]}>{error}</Text>
            )}

            {/* Loading */}
            {loading && (
              <View style={styles.loadingRow}>
                <Text style={styles.boltSpin}>⚡</Text>
                <Text style={[styles.loadingText, { color: colors.textMuted }]}>Thinking…</Text>
              </View>
            )}

            {/* Result */}
            {result && !loading && (
              <View style={styles.resultBlock}>
                <Text style={[styles.explanationText, { color: colors.text }]}>
                  {result.explanation}
                </Text>

                {result.analogy && (
                  <View style={[styles.analogyBox, { backgroundColor: colors.accentSoft, borderColor: colors.accent + '30' }]}>
                    <Text style={[styles.analogyLabel, { color: colors.accent }]}>ANALOGY</Text>
                    <Text style={[styles.analogyText, { color: colors.text }]}>{result.analogy}</Text>
                  </View>
                )}

                {result.key_terms.length > 0 && (
                  <View style={styles.termsBlock}>
                    <Text style={[styles.termsLabel, { color: colors.textMuted }]}>KEY TERMS</Text>
                    <View style={styles.termsList}>
                      {result.key_terms.map(t => (
                        <View key={t} style={[styles.termChip, { backgroundColor: colors.bgSecondary }]}>
                          <Text style={[styles.termText, { color: colors.textSoft }]}>{t}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {result.follow_up_questions.length > 0 && (
                  <View style={styles.followBlock}>
                    <Text style={[styles.followLabel, { color: colors.textMuted }]}>EXPLORE FURTHER</Text>
                    {result.follow_up_questions.map((q, i) => (
                      <Text key={i} style={[styles.followQ, { color: colors.textSoft }]}>→ {q}</Text>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* CTA buttons */}
            <View style={styles.btnRow}>
              {!result && !loading && (
                <TouchableOpacity
                  style={[
                    styles.explainBtn,
                    { backgroundColor: remaining > 0 ? colors.accent : colors.bgSecondary },
                  ]}
                  onPress={handleExplain}
                  disabled={remaining <= 0 || loading}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.explainBtnText, { color: remaining > 0 ? '#fff' : colors.textMuted }]}>
                    {remaining > 0 ? 'Explain →' : 'No more explanations'}
                  </Text>
                </TouchableOpacity>
              )}
              {result && (
                <TouchableOpacity
                  style={[styles.gotItBtn, { backgroundColor: colors.accent }]}
                  onPress={dismiss}
                >
                  <Text style={styles.gotItText}>Got it ✓</Text>
                </TouchableOpacity>
              )}
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>
    </Animated.View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop:         { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.55)', zIndex: 999, justifyContent: 'flex-end', alignItems: 'center' },
  sheet:            { width: '100%', maxHeight: '85%', borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, overflow: 'hidden' },
  webModal:         { width: 560, maxHeight: '80%', borderRadius: Radius.xl, marginBottom: 'auto' as any, marginTop: 'auto' as any, ...Shadow.lg },
  scrollContent:    { padding: Spacing.xl, gap: Spacing.md },
  sheetHeader:      { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  lightbulb:        { fontSize: 26 },
  sheetTitle:       { fontSize: FontSize.lg, fontWeight: FontWeight.black },
  rateBadge:        { fontSize: FontSize.xs, marginTop: 2 },
  xBtn:             { padding: Spacing.xs },
  xBtnText:         { fontSize: 18 },

  conceptBox:       { borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1 },
  conceptLabel:     { fontSize: FontSize.xs, fontWeight: FontWeight.black, letterSpacing: 0.8, marginBottom: 4 },
  conceptText:      { fontSize: FontSize.sm, lineHeight: 20 },

  inputLabel:       { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  questionInput:    { borderRadius: Radius.md, borderWidth: 1, padding: Spacing.md, fontSize: FontSize.sm, minHeight: 56, textAlignVertical: 'top' },

  errorText:        { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  loadingRow:       { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md },
  boltSpin:         { fontSize: 20 },
  loadingText:      { fontSize: FontSize.sm },

  resultBlock:      { gap: Spacing.md },
  explanationText:  { fontSize: FontSize.sm, lineHeight: 22 },
  analogyBox:       { borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, gap: Spacing.xs },
  analogyLabel:     { fontSize: FontSize.xs, fontWeight: FontWeight.black, letterSpacing: 0.8 },
  analogyText:      { fontSize: FontSize.sm, lineHeight: 20 },
  termsBlock:       { gap: Spacing.xs },
  termsLabel:       { fontSize: FontSize.xs, fontWeight: FontWeight.black, letterSpacing: 0.8 },
  termsList:        { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  termChip:         { paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: Radius.full },
  termText:         { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  followBlock:      { gap: Spacing.xs },
  followLabel:      { fontSize: FontSize.xs, fontWeight: FontWeight.black, letterSpacing: 0.8 },
  followQ:          { fontSize: FontSize.sm, lineHeight: 20 },

  btnRow:           { gap: Spacing.sm },
  explainBtn:       { borderRadius: Radius.lg, paddingVertical: Spacing.md, alignItems: 'center' },
  explainBtnText:   { fontSize: FontSize.sm, fontWeight: FontWeight.black },
  gotItBtn:         { borderRadius: Radius.lg, paddingVertical: Spacing.md, alignItems: 'center' },
  gotItText:        { fontSize: FontSize.sm, fontWeight: FontWeight.black, color: '#fff' },

  blockedIcon:      { fontSize: 36, textAlign: 'center' },
  blockedTitle:     { fontSize: FontSize.lg, fontWeight: FontWeight.black, textAlign: 'center' },
  blockedMsg:       { fontSize: FontSize.sm, lineHeight: 20, textAlign: 'center' },
  closeBtn:         { borderRadius: Radius.lg, paddingVertical: Spacing.md, alignItems: 'center' },
  closeBtnText:     { fontSize: FontSize.sm, fontWeight: FontWeight.black, color: '#fff' },
});
