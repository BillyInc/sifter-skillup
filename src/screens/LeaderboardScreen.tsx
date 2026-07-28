/**
 * Sifter LevelUp — Leaderboard Screen (Full Rewrite)
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
import { useTheme, Spacing, Radius, FontSize, FontWeight, webContainer } from '../theme';
import { CompassFonts } from '../theme';
import { useAuth } from '../hooks/useAuth';
import { leaderboardEngine, type LeaderboardScope } from '../lib/leaderboardEngine';
import type { Leaderboard, LeaderboardEntry } from '../types/social';
import { resolveTrackContext } from '../lib/trackContext';

// XP stage colours reused from character system
const STAGE_COLORS = ['','#94A3B8','#3B82F6','#22C55E','#F59E0B','#EF4444','#8B5CF6','#FBBF24','#F59E0B'];
const SCOPE_TABS: { scope: LeaderboardScope; label: string; emoji: string }[] = [
  { scope: 'global', label: 'Global',  emoji: '🌐' },
  { scope: 'field',  label: 'Field',   emoji: '📊' },
  { scope: 'track',  label: 'Workspace',   emoji: '🎯' },
];
const RANK_MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function LeaderboardScreen({ navigation: _navigation }: any) {
  const { colors } = useTheme();
  const { user }   = useAuth();
  const trackContext = React.useMemo(() => resolveTrackContext(user), [user]);
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
    const stageColor = STAGE_COLORS[entry.xp_stage] ?? colors.textRole.muted;
    const medal      = RANK_MEDALS[entry.rank];
    const delta      = entry.delta_rank ?? 0;

    return (
      <View style={[
        styles.row,
        isUser && { backgroundColor: `${colors.accentRole.action}14`, borderRadius: Radius.lg },
        { borderBottomColor: colors.borderRole.subtle },
      ]}>
        {/* Rank */}
        <View style={styles.rankCell}>
          {medal
            ? <Text style={styles.medal}>{medal}</Text>
            : <Text style={[styles.rankNum, { color: isUser ? colors.accentRole.action : colors.textRole.muted }]}>#{entry.rank}</Text>}
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
          <Text style={[styles.username, { color: isUser ? colors.accentRole.action : colors.textRole.primary, fontWeight: isUser ? FontWeight.black : FontWeight.semibold }]}>
            {entry.username}{isUser ? ' (You)' : ''}
          </Text>
          <Text style={[styles.stageName, { color: stageColor }]}>Stage {entry.xp_stage}</Text>
        </View>

        {/* XP */}
        <View style={styles.xpCell}>
          <Text style={[styles.weeklyXp, { color: colors.accentRole.action }]}>{entry.weekly_xp.toLocaleString()} XP</Text>
          <Text style={[styles.totalXp, { color: colors.textRole.muted }]}>
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
      <View style={[styles.userPosCard, { backgroundColor: `${colors.accentRole.action}14`, borderColor: colors.accentRole.action + '40' }]}>
        <Text style={[styles.userPosTitle, { color: colors.accentRole.action }, CompassFonts.bodyBold]}>YOUR POSITION</Text>
        <Text style={[styles.userPosRank, { color: colors.accentRole.action }]}>#{e.rank}</Text>
        <Text style={[styles.userPosXp, { color: colors.textRole.secondary }]}>
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
      <View style={[styles.weekBanner, { backgroundColor: colors.surface.subtle }]}>
        <Text style={[styles.weekText, { color: colors.textRole.muted }]}>
          Week of {start} – {end} · Resets Sunday 23:59 UTC
        </Text>
        <Text style={[styles.weekReward, { color: colors.accentRole.status }]}>
          Top 3 earn bonus XP, merch credits, and leaderboard badges.
        </Text>
      </View>
    );
  };

  // ── Scope tabs ─────────────────────────────────────────────────────────────

  const ScopeTabs = () => (
    <View style={[styles.scopeTabs, { backgroundColor: colors.surface.raised, borderBottomColor: colors.borderRole.subtle }]}>
      {SCOPE_TABS.map(t => {
        const isActive = scope === t.scope;
        return (
          <TouchableOpacity
            key={t.scope}
            style={[styles.scopeTab, isActive && { borderBottomColor: colors.accentRole.action, borderBottomWidth: 2 }]}
            onPress={() => setScope(t.scope)}
          >
            <Text style={styles.scopeTabEmoji}>{t.emoji}</Text>
            <Text style={[styles.scopeTabLabel, { color: isActive ? colors.accentRole.action : colors.textRole.secondary, fontWeight: isActive ? FontWeight.black : FontWeight.semibold }]}>
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
        <ActivityIndicator color={colors.accentRole.action} />
        <Text style={[styles.loadText, { color: colors.textRole.muted }]}>Loading leaderboard…</Text>
      </View>
    );
    if (!board || board.entries.length === 0) return (
      <View style={styles.empty}>
        <Text style={styles.emptyEmoji}>🏆</Text>
        <Text style={[styles.emptyTitle, { color: colors.textRole.primary }, CompassFonts.bodyBold]}>No entries yet this week</Text>
        <Text style={[styles.emptySub, { color: colors.textRole.muted }]}>Complete workspace activity to appear on the board.</Text>
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
    <View style={[styles.scopePanel, { backgroundColor: colors.surface.raised, borderRightColor: colors.borderRole.subtle }]}>
      <Text style={[styles.scopePanelTitle, { color: colors.textRole.muted }, CompassFonts.bodyBold]}>LEADERBOARD SCOPE</Text>
      {SCOPE_TABS.map(t => {
        const isActive = scope === t.scope;
        return (
          <TouchableOpacity
            key={t.scope}
            style={[styles.scopeRow, isActive && { backgroundColor: `${colors.accentRole.action}14`, borderRadius: Radius.md }]}
            onPress={() => setScope(t.scope)}
          >
            <Text style={styles.scopeRowEmoji}>{t.emoji}</Text>
            <Text style={[styles.scopeRowLabel, { color: isActive ? colors.accentRole.action : colors.textRole.secondary }]}>{t.label}</Text>
          </TouchableOpacity>
        );
      })}
      <View style={[styles.divider, { backgroundColor: colors.borderRole.subtle }]} />
      <Text style={[styles.scopePanelTitle, { color: colors.textRole.muted }, CompassFonts.bodyBold]}>TOP 3 REWARDS</Text>
      {[
        { rank: '🥇 #1', xp: '+200 XP', credits: '+20 Credits' },
        { rank: '🥈 #2', xp: '+150 XP', credits: '+10 Credits' },
        { rank: '🥉 #3', xp: '+100 XP', credits: '+5 Credits'  },
      ].map(r => (
        <View key={r.rank} style={styles.rewardRow}>
          <Text style={[styles.rewardRank, { color: colors.textRole.primary }]}>{r.rank}</Text>
          <Text style={[styles.rewardDetail, { color: colors.accentRole.status }]}>{r.xp} · {r.credits}</Text>
        </View>
      ))}
    </View>
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  const Header = () => (
    <View style={[styles.header, { backgroundColor: colors.surface.raised, borderBottomColor: colors.borderRole.subtle }]}>
      <Text style={[styles.headerTitle, { color: colors.textRole.primary }, CompassFonts.displayBold]}>Leaderboard</Text>
      {board && (
        <Text style={[styles.headerSub, { color: colors.accentRole.action }]}>
          {board.entries.length} players · {scope === 'global'
            ? 'Global'
            : scope === 'field'
              ? (trackContext.fieldId ?? user?.active_field_id ?? 'Field')
              : (trackContext.mode === 'track' ? trackContext.trackName : user?.current_track_id ?? 'Workspace')}
        </Text>
      )}
    </View>
  );

  if (isWebWide) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.surface.base }]}>
        <View style={[styles.webRoot, { backgroundColor: colors.surface.base }]}>
          <ScopePanel />
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ ...webContainer, paddingBottom: 18 }}>
            <View style={{ marginBottom: 14, paddingBottom: 16, position: 'relative' }}>
              <Text style={{ fontSize: 18, fontWeight: FontWeight.black, color: colors.textRole.primary, letterSpacing: -0.5, marginBottom: 4 }}>Leaderboard</Text>
              <Text style={{ fontSize: FontSize.md, color: colors.textRole.secondary }}>
                Global, field, and workspace competition with a weekly reset.
              </Text>
              <View style={{ position: 'absolute', bottom: 0, left: 0, height: 3, width: 48, borderRadius: Radius.full, backgroundColor: colors.accentRole.action }} />
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
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.surface.base }]}>
      <Header />
      <ScopeTabs />
      <ListBody />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen:        { flex: 1 },
  webRoot:       { flex: 1, flexDirection: 'row' },
  scopePanel:    { width: 232, borderRightWidth: 1, padding: Spacing.lg, gap: Spacing.sm },
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

  weekBanner:    { padding: Spacing.lg, paddingHorizontal: Spacing.lg, gap: 4 },
  weekText:      { fontSize: FontSize.xs },
  weekReward:    { fontSize: FontSize.xs, fontWeight: FontWeight.bold },

  row:           { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg, borderBottomWidth: StyleSheet.hairlineWidth },
  rankCell:      { width: 42, alignItems: 'center', gap: 2 },
  medal:         { fontSize: 20 },
  rankNum:       { fontSize: FontSize.sm, fontWeight: FontWeight.black },
  delta:         { fontSize: 9, fontWeight: FontWeight.black },
  avatarCircle:  { width: 36, height: 36, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  avatarText:    { fontSize: 16 },
  username:      { fontSize: FontSize.sm },
  stageName:     { fontSize: FontSize.xs },
  xpCell:        { alignItems: 'flex-end', gap: 2 },
  weeklyXp:      { fontSize: FontSize.sm, fontWeight: FontWeight.black },
  totalXp:       { fontSize: FontSize.xs },

  userPosCard:   { margin: Spacing.lg, borderRadius: Radius.xl, padding: Spacing.xl, borderWidth: 1, alignItems: 'center', gap: Spacing.sm },
  userPosTitle:  { fontSize: FontSize.xs, fontWeight: FontWeight.black, letterSpacing: 0.8 },
  userPosRank:   { fontSize: FontSize.xxxl, fontWeight: FontWeight.black },
  userPosXp:     { fontSize: FontSize.sm },

  listContent:   { paddingBottom: Spacing.xl },
  centreLoad:    { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, padding: Spacing.xxxl },
  loadText:      { fontSize: FontSize.sm },
  empty:         { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, padding: Spacing.xxxl },
  emptyEmoji:    { fontSize: 18 },
  emptyTitle:    { fontSize: FontSize.lg, fontWeight: FontWeight.black },
  emptySub:      { fontSize: FontSize.sm, textAlign: 'center' },
});
