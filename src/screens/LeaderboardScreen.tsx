/**
 * Sifter Skill_Up — Leaderboard Screen (Full Rewrite)
 * 3-tier: Global · Field · Track. Weekly reset Sunday 23:59 UTC.
 *
 * 3 LAYOUTS:
 *   Web ≥768px  → left scope selector + right leaderboard table
 *   Web <768px  → tab row + scrollable list
 *   Mobile      → tab row + FlatList
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Platform, useWindowDimensions, ActivityIndicator, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, Spacing, Radius, FontSize, FontWeight } from '../theme';
import { useAuth } from '../hooks/useAuth';
import { leaderboardEngine, type LeaderboardScope } from '../lib/leaderboardEngine';
import type { Leaderboard, LeaderboardEntry } from '../types/social';

// XP stage colours reused from character system
const STAGE_COLORS = ['','#94A3B8','#3B82F6','#22C55E','#F59E0B','#EF4444','#8B5CF6','#EC4899','#F59E0B'];
const SCOPE_TABS: { scope: LeaderboardScope; label: string; emoji: string }[] = [
  { scope: 'global', label: 'Global',  emoji: '🌐' },
  { scope: 'field',  label: 'Field',   emoji: '📊' },
  { scope: 'track',  label: 'Track',   emoji: '🎯' },
];
const RANK_MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function LeaderboardScreen({ navigation: _navigation }: any) {
  const { colors } = useTheme();
  const { user }   = useAuth();
  const { width }  = useWindowDimensions();
  const isWebWide  = Platform.OS === 'web' && width >= 768;

  const [scope,   setScope]   = useState<LeaderboardScope>('global');
  const [board,   setBoard]   = useState<Leaderboard | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await leaderboardEngine.fetch(
      scope,
      scope === 'field' ? user?.active_field_id : undefined,
      scope === 'track' ? user?.current_track_id : undefined,
    );
    setBoard(data);
    setLoading(false);
  }, [scope, user?.active_field_id, user?.current_track_id]);

  useEffect(() => { load(); }, [load]);


  // ── Single row ─────────────────────────────────────────────────────────────

  const Row = ({ entry, isUser }: { entry: LeaderboardEntry; isUser: boolean }) => {
    const stageColor = STAGE_COLORS[entry.xp_stage] ?? colors.textMuted;
    const medal      = RANK_MEDALS[entry.rank];
    const delta      = entry.delta_rank ?? 0;

    return (
      <View style={[
        styles.row,
        isUser && { backgroundColor: colors.accentSoft, borderRadius: Radius.lg },
        { borderBottomColor: colors.border },
      ]}>
        {/* Rank */}
        <View style={styles.rankCell}>
          {medal
            ? <Text style={styles.medal}>{medal}</Text>
            : <Text style={[styles.rankNum, { color: isUser ? colors.accent : colors.textMuted }]}>#{entry.rank}</Text>}
          {delta !== 0 && (
            <Text style={[styles.delta, { color: leaderboardEngine.deltaColor(delta, colors) }]}>
              {leaderboardEngine.deltaLabel(delta)}
            </Text>
          )}
        </View>

        {/* Avatar + name */}
        <View style={[styles.avatarCircle, { backgroundColor: stageColor + '22' }]}>
          <Text style={[styles.avatarText, { color: stageColor }]}>{entry.avatar_emoji || '👤'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.username, { color: isUser ? colors.accent : colors.text, fontWeight: isUser ? FontWeight.black : FontWeight.semibold }]}>
            {entry.username}{isUser ? ' (You)' : ''}
          </Text>
          <Text style={[styles.stageName, { color: stageColor }]}>Stage {entry.xp_stage}</Text>
        </View>

        {/* XP */}
        <View style={styles.xpCell}>
          <Text style={[styles.weeklyXp, { color: colors.accent }]}>{entry.weekly_xp.toLocaleString()} XP</Text>
          <Text style={[styles.totalXp, { color: colors.textMuted }]}>
            {entry.total_xp.toLocaleString()} total
          </Text>
        </View>
      </View>
    );
  };

  // ── User position card (always shown if user is not top 50) ───────────────

  const UserPositionCard = () => {
    if (!board?.user_entry) return null;
    const e = board.user_entry;
    return (
      <View style={[styles.userPosCard, { backgroundColor: colors.accentSoft, borderColor: colors.accent + '40' }]}>
        <Text style={[styles.userPosTitle, { color: colors.accent }]}>YOUR POSITION</Text>
        <Text style={[styles.userPosRank, { color: colors.accent }]}>#{e.rank}</Text>
        <Text style={[styles.userPosXp, { color: colors.textSoft }]}>
          {e.weekly_xp.toLocaleString()} XP this week
        </Text>
      </View>
    );
  };

  // ── Week info ──────────────────────────────────────────────────────────────

  const WeekBanner = () => {
    if (!board) return null;
    const start = leaderboardEngine.formatWeekLabel(board.week_start);
    const end   = leaderboardEngine.formatWeekLabel(board.week_end);
    return (
      <View style={[styles.weekBanner, { backgroundColor: colors.bgSecondary }]}>
        <Text style={[styles.weekText, { color: colors.textMuted }]}>
          Week of {start} – {end} · Resets Sunday 23:59 UTC
        </Text>
        <Text style={[styles.weekReward, { color: colors.gold }]}>
          🏆 Top 3 win XP + Merch Credits + Badge
        </Text>
      </View>
    );
  };

  // ── Scope tabs ─────────────────────────────────────────────────────────────

  const ScopeTabs = () => (
    <View style={[styles.scopeTabs, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
      {SCOPE_TABS.map(t => {
        const isActive = scope === t.scope;
        return (
          <TouchableOpacity
            key={t.scope}
            style={[styles.scopeTab, isActive && { borderBottomColor: colors.accent, borderBottomWidth: 2 }]}
            onPress={() => setScope(t.scope)}
          >
            <Text style={styles.scopeTabEmoji}>{t.emoji}</Text>
            <Text style={[styles.scopeTabLabel, { color: isActive ? colors.accent : colors.textSoft, fontWeight: isActive ? FontWeight.black : FontWeight.semibold }]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  // ── List body ──────────────────────────────────────────────────────────────

  const ListBody = () => {
    if (loading) return (
      <View style={styles.centreLoad}>
        <ActivityIndicator color={colors.accent} />
        <Text style={[styles.loadText, { color: colors.textMuted }]}>Loading leaderboard…</Text>
      </View>
    );
    if (!board || board.entries.length === 0) return (
      <View style={styles.empty}>
        <Text style={styles.emptyEmoji}>🏆</Text>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>No entries yet this week</Text>
        <Text style={[styles.emptySub, { color: colors.textMuted }]}>Complete lessons to appear on the board.</Text>
      </View>
    );
    return (
      <>
        <WeekBanner />
        <FlatList
          data={board.entries}
          keyExtractor={e => e.user_id}
          renderItem={({ item }) => <Row entry={item} isUser={item.user_id === user?.id} />}
          contentContainerStyle={styles.listContent}
          ListFooterComponent={<UserPositionCard />}
          showsVerticalScrollIndicator={false}
        />
      </>
    );
  };

  // ── Scope left panel (web wide) ───────────────────────────────────────────

  const ScopePanel = () => (
    <View style={[styles.scopePanel, { backgroundColor: colors.card, borderRightColor: colors.border }]}>
      <Text style={[styles.scopePanelTitle, { color: colors.textMuted }]}>LEADERBOARD SCOPE</Text>
      {SCOPE_TABS.map(t => {
        const isActive = scope === t.scope;
        return (
          <TouchableOpacity
            key={t.scope}
            style={[styles.scopeRow, isActive && { backgroundColor: colors.accentSoft, borderRadius: Radius.md }]}
            onPress={() => setScope(t.scope)}
          >
            <Text style={styles.scopeRowEmoji}>{t.emoji}</Text>
            <Text style={[styles.scopeRowLabel, { color: isActive ? colors.accent : colors.textSoft }]}>{t.label}</Text>
          </TouchableOpacity>
        );
      })}
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <Text style={[styles.scopePanelTitle, { color: colors.textMuted }]}>TOP 3 REWARDS</Text>
      {[
        { rank: '🥇 #1', xp: '+200 XP', credits: '+20 Credits' },
        { rank: '🥈 #2', xp: '+150 XP', credits: '+10 Credits' },
        { rank: '🥉 #3', xp: '+100 XP', credits: '+5 Credits'  },
      ].map(r => (
        <View key={r.rank} style={styles.rewardRow}>
          <Text style={[styles.rewardRank, { color: colors.text }]}>{r.rank}</Text>
          <Text style={[styles.rewardDetail, { color: colors.gold }]}>{r.xp} · {r.credits}</Text>
        </View>
      ))}
    </View>
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  const Header = () => (
    <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
      <Text style={[styles.headerTitle, { color: colors.text }]}>🏆 Leaderboard</Text>
      {board && (
        <Text style={[styles.headerSub, { color: colors.accent }]}>
          {board.entries.length} players · {scope === 'global' ? 'Global' : scope === 'field' ? user?.active_field_id ?? 'Field' : user?.current_track_id ?? 'Track'}
        </Text>
      )}
    </View>
  );

  if (isWebWide) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
        <View style={[styles.webRoot, { backgroundColor: colors.bg }]}>
          <ScopePanel />
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ maxWidth: 900, alignSelf: 'center', width: '100%', paddingHorizontal: 28, paddingTop: 28, paddingBottom: 64 }}>
            <View style={{ marginBottom: 28, paddingBottom: 16, position: 'relative' }}>
              <Text style={{ fontSize: 28, fontWeight: FontWeight.black, color: colors.text, letterSpacing: -0.5, marginBottom: 4 }}>Leaderboard</Text>
              <Text style={{ fontSize: FontSize.md, color: colors.textSoft }}>Global · Field · Track · Weekly reset</Text>
              <View style={{ position: 'absolute', bottom: 0, left: 0, height: 3, width: 48, borderRadius: Radius.full, backgroundColor: colors.accent }} />
            </View>
            <Header />
            <ScopeTabs />
            <ListBody />
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      <Header />
      <ScopeTabs />
      <ListBody />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen:        { flex: 1 },
  webRoot:       { flex: 1, flexDirection: 'row' },
  scopePanel:    { width: 220, borderRightWidth: 1, padding: Spacing.lg, gap: Spacing.xs },
  scopePanelTitle:{ fontSize: FontSize.xs, fontWeight: FontWeight.black, letterSpacing: 0.8, marginTop: Spacing.sm, marginBottom: Spacing.xs },
  scopeRow:      { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.sm },
  scopeRowEmoji: { fontSize: 18 },
  scopeRowLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  divider:       { height: 1, marginVertical: Spacing.md },
  rewardRow:     { paddingVertical: Spacing.xs },
  rewardRank:    { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  rewardDetail:  { fontSize: FontSize.xs },

  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.lg, borderBottomWidth: 1 },
  headerTitle:   { fontSize: FontSize.xl, fontWeight: FontWeight.black },
  headerSub:     { fontSize: FontSize.xs, fontWeight: FontWeight.bold },

  scopeTabs:     { flexDirection: 'row', borderBottomWidth: 1 },
  scopeTab:      { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xs, paddingVertical: Spacing.md },
  scopeTabEmoji: { fontSize: 16 },
  scopeTabLabel: { fontSize: FontSize.sm },

  weekBanner:    { padding: Spacing.md, paddingHorizontal: Spacing.lg, gap: 2 },
  weekText:      { fontSize: FontSize.xs },
  weekReward:    { fontSize: FontSize.xs, fontWeight: FontWeight.bold },

  row:           { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg, borderBottomWidth: StyleSheet.hairlineWidth },
  rankCell:      { width: 42, alignItems: 'center', gap: 2 },
  medal:         { fontSize: 20 },
  rankNum:       { fontSize: FontSize.sm, fontWeight: FontWeight.black },
  delta:         { fontSize: 9, fontWeight: FontWeight.black },
  avatarCircle:  { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  avatarText:    { fontSize: 16 },
  username:      { fontSize: FontSize.sm },
  stageName:     { fontSize: FontSize.xs },
  xpCell:        { alignItems: 'flex-end', gap: 2 },
  weeklyXp:      { fontSize: FontSize.sm, fontWeight: FontWeight.black },
  totalXp:       { fontSize: FontSize.xs },

  userPosCard:   { margin: Spacing.lg, borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1, alignItems: 'center', gap: Spacing.xs },
  userPosTitle:  { fontSize: FontSize.xs, fontWeight: FontWeight.black, letterSpacing: 0.8 },
  userPosRank:   { fontSize: FontSize.xxxl, fontWeight: FontWeight.black },
  userPosXp:     { fontSize: FontSize.sm },

  listContent:   { paddingBottom: 100 },
  centreLoad:    { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, padding: Spacing.xxxl },
  loadText:      { fontSize: FontSize.sm },
  empty:         { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, padding: Spacing.xxxl },
  emptyEmoji:    { fontSize: 36 },
  emptyTitle:    { fontSize: FontSize.lg, fontWeight: FontWeight.black },
  emptySub:      { fontSize: FontSize.sm, textAlign: 'center' },
});
