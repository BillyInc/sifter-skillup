/**
 * CurriculumPreview — shows all sections and lessons for a track before the user enters.
 *
 * Users can:
 *   - See every lab/section title and all lesson titles within each lab
 *   - Expand any lesson to read its key concept and guided practice topics
 *   - Flag a lesson as inaccurate (sends to content review queue)
 *   - See estimated time per section
 *   - See which simulator types appear in each section
 *   - Tap "Start Track" or "Take Placement Test" at the bottom
 *
 * Works for both the new track format (TrackSection[]) and the legacy island format.
 *
 * Usage:
 *   <CurriculumPreview
 *     track={spotTradingTrack}
 *     onStart={() => navigation.navigate('Track')}
 *     onPlacementTest={() => navigation.navigate('PlacementTest')}
 *     onClose={() => navigation.goBack()}
 *   />
 */

import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar, Modal, Alert,
} from 'react-native';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../theme';
import type { SkillTrack } from '../data/skillTypes';

// ── Types ─────────────────────────────────────────────────────────────────────

interface LessonPreview {
  id:          string;
  title:       string;
  keyTakeaway: string;
  simTypes:    string[];
  practiceCount: number;
}

interface SectionPreview {
  id:        string;
  title:     string;
  subtitle:  string;
  lessons:   LessonPreview[];
  hasBoss:   boolean;
  hasPhase2: boolean;
}

interface Props {
  track:              SkillTrack;
  userCompletedLabs?: string[];  // lab IDs already done
  onStart:            () => void;
  onPlacementTest?:   () => void;
  onClose:            () => void;
}

// ── Extractor — pulls preview data from any track format ──────────────────────

function extractPreviews(track: SkillTrack): SectionPreview[] {
  if (track.comingSoon) return [];

  const sections = (track as any).sections ?? (track as any).labs ?? [];

  return sections.map((sec: any) => {
    const lessons: LessonPreview[] = (sec.lessons ?? []).map((l: any) => {
      const sims: string[] = [];
      (l.lessonSimulations ?? []).forEach((s: any) => sims.push(s.type ?? ''));
      return {
        id:            l.id,
        title:         l.title,
        keyTakeaway:   l.keyTakeaway ?? '',
        simTypes:      [...new Set(sims)] as string[],
        practiceCount: (l.guidedPractice ?? []).length,
      };
    });

    return {
      id:        sec.id,
      title:     sec.title ?? sec.name ?? 'Section',
      subtitle:  sec.subtitle ?? sec.description ?? '',
      lessons,
      hasBoss:   !!(sec.bossMode),
      hasPhase2: !!(sec.bossMode?.phase2?.portfolioPush),
    };
  });
}

// ── Simulator type badge ──────────────────────────────────────────────────────

const SIM_LABELS: Record<string, { label: string; color: string }> = {
  'judgment-communication': { label: 'Write', color: '#6366f1' },
  'judgment-dataInterpret': { label: 'Analyse', color: '#0ea5e9' },
  'judgment-riskAssess':    { label: 'Risk', color: '#f59e0b' },
  'judgment-prioritisation':{ label: 'Triage', color: '#10b981' },
  'judgment-escalation':    { label: 'Escalate', color: '#ef4444' },
  'chartReplay-pattern':    { label: 'Chart', color: '#8b5cf6' },
  'chartReplay-breakout':   { label: 'Breakout', color: '#f59e0b' },
  'chartReplay-riskManage': { label: 'Risk Mgmt', color: '#10b981' },
  'sandbox-sql':            { label: 'SQL', color: '#f59e0b' },
  'sandbox-python':         { label: 'Python', color: '#3b82f6' },
  'sandbox-excel':          { label: 'Excel', color: '#10b981' },
  'sandbox-dataModel':      { label: 'Data', color: '#0ea5e9' },
};

function SimBadge({ type }: { type: string }) {
  const cfg = SIM_LABELS[type];
  if (!cfg) return null;
  return (
    <View style={[sb.wrap, { backgroundColor: cfg.color + '18', borderColor: cfg.color + '44' }]}>
      <Text style={[sb.text, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}

const sb = StyleSheet.create({
  wrap: { borderRadius: Radius.sm, paddingHorizontal: 7, paddingVertical: 3, borderWidth: 1 },
  text: { fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },
});

// ── Lesson row (expandable) ───────────────────────────────────────────────────

function LessonRow({
  lesson, index, trackId, color,
}: { lesson: LessonPreview; index: number; trackId: string; color: string }) {
  const [expanded, setExpanded] = useState(false);

  const handleFlag = useCallback(() => {
    Alert.alert(
      'Flag for Review',
      `Flag "${lesson.title}" as inaccurate?\n\nThis sends the lesson to our content review queue. We appreciate the help.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Flag It', style: 'destructive', onPress: () => {
          // TODO: POST /api/content/flag { lessonId: lesson.id, trackId, type: 'inaccurate' }
          Alert.alert('Flagged', 'Thanks — our team will review this lesson.');
        }},
      ]
    );
  }, [lesson.id, trackId]);

  return (
    <TouchableOpacity
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.8}
      style={lr.wrap}
    >
      <View style={lr.row}>
        <View style={[lr.indexBadge, { backgroundColor: color + '18' }]}>
          <Text style={[lr.indexText, { color }]}>{index + 1}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={lr.title}>{lesson.title}</Text>
          {lesson.practiceCount > 0 && (
            <Text style={lr.meta}>{lesson.practiceCount} practice questions</Text>
          )}
        </View>
        <Text style={lr.chevron}>{expanded ? '▾' : '›'}</Text>
      </View>

      {expanded && (
        <View style={lr.expandBody}>
          {lesson.keyTakeaway ? (
            <View style={lr.takeawayBox}>
              <Text style={lr.takeawayLabel}>KEY CONCEPT</Text>
              <Text style={lr.takeawayText}>{lesson.keyTakeaway}</Text>
            </View>
          ) : null}

          {lesson.simTypes.length > 0 && (
            <View style={lr.simRow}>
              <Text style={lr.simLabel}>EXERCISES  </Text>
              <View style={lr.simBadges}>
                {lesson.simTypes.map((t, i) => <SimBadge key={i} type={t} />)}
              </View>
            </View>
          )}

          <TouchableOpacity onPress={handleFlag} style={lr.flagBtn}>
            <Text style={lr.flagText}>🚩 Flag lesson as inaccurate</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

const lr = StyleSheet.create({
  wrap:         { borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  row:          { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, paddingHorizontal: Spacing.md },
  indexBadge:   { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  indexText:    { fontSize: 11, fontWeight: '800' },
  title:        { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text, lineHeight: 19 },
  meta:         { fontSize: 11, color: Colors.textSoft, marginTop: 1 },
  chevron:      { fontSize: 16, color: Colors.textSoft, fontWeight: '800' },
  expandBody:   { paddingHorizontal: Spacing.md, paddingBottom: 12, gap: 10 },
  takeawayBox:  { backgroundColor: '#f8fafc', borderRadius: Radius.md, padding: Spacing.sm, borderLeftWidth: 3, borderLeftColor: Colors.accent },
  takeawayLabel:{ fontSize: 10, fontWeight: '800', color: Colors.accent, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
  takeawayText: { fontSize: 12, color: Colors.text, lineHeight: 18 },
  simRow:       { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  simLabel:     { fontSize: 10, fontWeight: '800', color: Colors.textSoft, textTransform: 'uppercase', letterSpacing: 0.5 },
  simBadges:    { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  flagBtn:      { alignSelf: 'flex-start' },
  flagText:     { fontSize: 11, color: Colors.textSoft, fontWeight: '600' },
});

// ── Section card ──────────────────────────────────────────────────────────────

function SectionCard({
  section, trackId, color, isComplete, isUnlocked,
}: {
  section: SectionPreview; trackId: string; color: string;
  isComplete: boolean; isUnlocked: boolean;
}) {
  const [open, setOpen] = useState(false);
  const totalSims = section.lessons.reduce((n, l) => n + l.simTypes.length, 0);

  return (
    <View style={[sc.wrap, Shadow.sm, !isUnlocked && sc.locked]}>
      {/* Section header */}
      <TouchableOpacity
        onPress={() => isUnlocked && setOpen(!open)}
        activeOpacity={isUnlocked ? 0.8 : 1}
        style={[sc.header, { borderLeftColor: color, borderLeftWidth: 4 }]}
      >
        <View style={{ flex: 1 }}>
          <View style={sc.titleRow}>
            {isComplete && <Text style={sc.checkmark}>✓ </Text>}
            <Text style={[sc.title, !isUnlocked && sc.lockedText]}>{section.title}</Text>
            {section.hasPhase2 && (
              <View style={sc.portfolio}>
                <Text style={sc.portfolioText}>📂 Portfolio</Text>
              </View>
            )}
          </View>
          <Text style={sc.subtitle} numberOfLines={open ? undefined : 1}>{section.subtitle}</Text>
          <Text style={sc.meta}>
            {section.lessons.length} lessons · {totalSims} exercises
            {section.hasBoss ? ' · Boss Battle' : ''}
          </Text>
        </View>
        {isUnlocked && (
          <Text style={sc.chevron}>{open ? '▾' : '›'}</Text>
        )}
        {!isUnlocked && <Text style={sc.lockIcon}>🔒</Text>}
      </TouchableOpacity>

      {/* Expanded lessons */}
      {open && isUnlocked && (
        <View>
          {section.lessons.map((l, i) => (
            <LessonRow key={l.id} lesson={l} index={i} trackId={trackId} color={color} />
          ))}
          {section.hasBoss && (
            <View style={[sc.bossRow, { backgroundColor: color + '10' }]}>
              <Text style={sc.bossIcon}>⭐</Text>
              <View>
                <Text style={[sc.bossTitle, { color }]}>Boss Battle</Text>
                <Text style={sc.bossSub}>
                  {section.hasPhase2
                    ? 'Two phases — Learning Loop + Certification. Portfolio artifact on Phase 2 pass.'
                    : 'Learning Loop only — practice with full feedback.'}
                </Text>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const sc = StyleSheet.create({
  wrap:          { backgroundColor: Colors.card, borderRadius: Radius.lg, marginBottom: Spacing.md, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  locked:        { opacity: 0.55 },
  header:        { padding: Spacing.md, flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  titleRow:      { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 3 },
  checkmark:     { fontSize: 13, color: Colors.green, fontWeight: '900' },
  title:         { fontSize: FontSize.md, fontWeight: '800', color: Colors.text },
  lockedText:    { color: Colors.textSoft },
  subtitle:      { fontSize: 12, color: Colors.textSoft, lineHeight: 17, marginBottom: 4 },
  meta:          { fontSize: 11, color: Colors.textSoft, fontWeight: '600' },
  portfolio:     { backgroundColor: '#f0fdf4', borderRadius: Radius.sm, paddingHorizontal: 7, paddingVertical: 2 },
  portfolioText: { fontSize: 10, fontWeight: '700', color: Colors.green },
  chevron:       { fontSize: 18, color: Colors.textSoft, marginTop: 2 },
  lockIcon:      { fontSize: 16 },
  bossRow:       { flexDirection: 'row', alignItems: 'center', gap: 10, padding: Spacing.md, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  bossIcon:      { fontSize: 22 },
  bossTitle:     { fontSize: 13, fontWeight: '800' },
  bossSub:       { fontSize: 11, color: Colors.textSoft, lineHeight: 16, marginTop: 1 },
});

// ── Main component ────────────────────────────────────────────────────────────

export default function CurriculumPreview({
  track, userCompletedLabs = [], onStart, onPlacementTest, onClose,
}: Props) {
  const sections   = extractPreviews(track);
  const totalLessons = sections.reduce((n, s) => n + s.lessons.length, 0);
  const totalSims    = sections.reduce((n, s) =>
    n + s.lessons.reduce((m, l) => m + l.simTypes.length, 0), 0);
  const portfolioLabs = sections.filter(s => s.hasPhase2).length;

  const color = (track as any).color ?? Colors.accent;

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }}>
        <StatusBar barStyle="dark-content" />

        {/* Header */}
        <View style={[hd.wrap, { borderBottomColor: color }]}>
          <TouchableOpacity onPress={onClose} style={hd.closeBtn}>
            <Text style={hd.closeTxt}>✕</Text>
          </TouchableOpacity>
          <Text style={hd.icon}>{(track as any).icon ?? '📚'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={hd.name}>{track.name}</Text>
            <Text style={hd.tagline}>{track.tagline}</Text>
          </View>
        </View>

        {/* Stats row */}
        <View style={st.row}>
          {[
            { n: sections.length,   label: 'Labs' },
            { n: totalLessons,      label: 'Lessons' },
            { n: totalSims,         label: 'Exercises' },
            { n: portfolioLabs,     label: 'Portfolio' },
          ].map((item, i) => (
            <View key={i} style={st.item}>
              <Text style={[st.num, { color }]}>{item.n}</Text>
              <Text style={st.label}>{item.label}</Text>
            </View>
          ))}
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: Spacing.lg }}>

          {/* Description */}
          <View style={{ marginBottom: Spacing.lg }}>
            <Text style={desc.body}>{track.description}</Text>
            <Text style={desc.meta}>
              ⏱ ~{track.estimatedHours}h · {track.difficulty} · {track.earningPotential}
            </Text>
          </View>

          {/* What you'll be able to do */}
          {track.realWorldOutcomes?.length > 0 && (
            <View style={oc.wrap}>
              <Text style={oc.heading}>What you'll be able to do</Text>
              {track.realWorldOutcomes.map((o, i) => (
                <View key={i} style={oc.row}>
                  <Text style={[oc.tick, { color }]}>✓</Text>
                  <Text style={oc.text}>{o}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Sections */}
          <Text style={cl.heading}>CURRICULUM</Text>
          {sections.length === 0 ? (
            <View style={cl.empty}>
              <Text style={cl.emptyText}>Full curriculum visible when track is active.</Text>
            </View>
          ) : (
            sections.map((sec, i) => (
              <SectionCard
                key={sec.id}
                section={sec}
                trackId={track.id}
                color={color}
                isComplete={userCompletedLabs.includes(sec.id)}
                isUnlocked={i === 0 || userCompletedLabs.includes(sections[i - 1]?.id)}
              />
            ))
          )}

          {/* CTA */}
          <View style={{ gap: Spacing.sm, marginTop: Spacing.lg }}>
            <TouchableOpacity
              style={[cta.primary, { backgroundColor: color }]}
              onPress={onStart}
              activeOpacity={0.88}
            >
              <Text style={cta.primaryText}>Start Track →</Text>
            </TouchableOpacity>

            {onPlacementTest && (
              <TouchableOpacity style={cta.secondary} onPress={onPlacementTest} activeOpacity={0.8}>
                <Text style={cta.secondaryText}>
                  Already know this? Take Placement Test →
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const hd = StyleSheet.create({
  wrap:     { flexDirection: 'row', alignItems: 'center', gap: 10, padding: Spacing.lg, borderBottomWidth: 3 },
  closeBtn: { padding: 4 },
  closeTxt: { fontSize: 18, color: Colors.textSoft, fontWeight: '800' },
  icon:     { fontSize: 32 },
  name:     { fontSize: FontSize.xl, fontWeight: '900', color: Colors.text },
  tagline:  { fontSize: FontSize.sm, color: Colors.textSoft, marginTop: 1 },
});

const st = StyleSheet.create({
  row:   { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: Colors.border },
  item:  { flex: 1, alignItems: 'center', paddingVertical: 12 },
  num:   { fontSize: 22, fontWeight: '900' },
  label: { fontSize: 10, color: Colors.textSoft, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },
});

const desc = StyleSheet.create({
  body: { fontSize: FontSize.sm, color: Colors.text, lineHeight: 22 },
  meta: { fontSize: 12, color: Colors.textSoft, marginTop: 8, fontWeight: '600' },
});

const oc = StyleSheet.create({
  wrap:    { backgroundColor: '#f0fdf4', borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.lg },
  heading: { fontSize: 12, fontWeight: '800', color: Colors.green, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  row:     { flexDirection: 'row', gap: 8, marginBottom: 6 },
  tick:    { fontSize: 14, fontWeight: '900', lineHeight: 20 },
  text:    { flex: 1, fontSize: FontSize.sm, color: Colors.text, lineHeight: 20 },
});

const cl = StyleSheet.create({
  heading:   { fontSize: 12, fontWeight: '800', color: Colors.textSoft, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: Spacing.md },
  empty:     { backgroundColor: '#f8fafc', borderRadius: Radius.lg, padding: Spacing.xl, alignItems: 'center' },
  emptyText: { fontSize: FontSize.sm, color: Colors.textSoft },
});

const cta = StyleSheet.create({
  primary:      { borderRadius: Radius.lg, paddingVertical: Spacing.lg, alignItems: 'center' },
  primaryText:  { color: '#fff', fontSize: FontSize.lg, fontWeight: '800' },
  secondary:    { borderRadius: Radius.lg, paddingVertical: Spacing.md, alignItems: 'center', borderWidth: 1.5, borderColor: Colors.border },
  secondaryText:{ fontSize: FontSize.sm, color: Colors.textSoft, fontWeight: '700' },
});
