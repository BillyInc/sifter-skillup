/**
 * Sifter Skill_Up — Leaderboard Screen
 *
 * Three rankings:
 *   Global  — all users, all fields, by XP
 *   Field   — all users in the same field (e.g. Supply Chain)
 *   Skill   — all users in the same sub-track (e.g. Junior Supply Chain Analyst)
 *
 * Monthly celebration:
 *   - Top 3 per category get a celebration banner in-app
 *   - Backend webhook fires to post to all Sifter social handles
 *
 * Data is cached offline — shows last known standings when offline.
 */

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, ActivityIndicator,
} from 'react-native';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../theme';
import { offlineRead } from '../lib/offlineQueue';
import { API } from '../lib/api';
import DisclaimerFooter from '../components/DisclaimerFooter';

type LeaderboardType = 'global' | 'field' | 'skill';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatarEmoji: string;
  xp: number;
  streak: number;
  level: string;
  isCurrentUser: boolean;
  monthlyWinner?: boolean;
}

interface MonthlyWinner {
  category: string;
  username: string;
  avatarEmoji: string;
  xp: number;
  celebrationMessage: string;
}

const RANK_COLORS: Record<number, string> = {
  1: '#FFD700', 2: '#C0C0C0', 3: '#CD7F32',
};

function RankBadge({ rank }: { rank: number }) {
  const color = RANK_COLORS[rank];
  if (rank <= 3) return (
    <View style={[styles.rankTop, { backgroundColor: color + '33', borderColor: color }]}>
      <Text style={[styles.rankTopText, { color }]}>
        {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
      </Text>
    </View>
  );
  return <Text style={styles.rankNum}>#{rank}</Text>;
}

function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
  return (
    <View style={[styles.row, entry.isCurrentUser && styles.rowHighlight]}>
      <View style={styles.rankCell}>
        <RankBadge rank={entry.rank} />
      </View>
      <Text style={styles.avatar}>{entry.avatarEmoji}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[styles.username, entry.isCurrentUser && { color: Colors.accent }]}>
          {entry.username}{entry.isCurrentUser ? ' (you)' : ''}
        </Text>
        <Text style={styles.level}>{entry.level}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.xp}>⚡ {entry.xp.toLocaleString()}</Text>
        <Text style={styles.streak}>🔥 {entry.streak}</Text>
      </View>
    </View>
  );
}

function MonthlyWinnerCard({ winner }: { winner: MonthlyWinner }) {
  return (
    <View style={styles.winnerCard}>
      <Text style={styles.winnerEmoji}>{winner.avatarEmoji}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.winnerCategory}>{winner.category.toUpperCase()}</Text>
        <Text style={styles.winnerName}>{winner.username}</Text>
        <Text style={styles.winnerMsg}>{winner.celebrationMessage}</Text>
      </View>
      <Text style={styles.winnerXp}>⚡ {winner.xp.toLocaleString()}</Text>
    </View>
  );
}

export default function LeaderboardScreen() {
  const [type, setType] = useState<LeaderboardType>('global');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [monthlyWinners, setMonthlyWinners] = useState<MonthlyWinner[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);

  useEffect(() => { load(); }, [type]);

  const load = async () => {
    setLoading(true);
    try {
      const [board, winners] = await Promise.all([
        offlineRead(`leaderboard_${type}`, () => API.getLeaderboard(type), 5 * 60 * 1000),
        offlineRead('monthly_winners', () => API.getMonthlyWinners(), 60 * 60 * 1000),
      ]);
      setEntries(board?.entries ?? []);
      setUserRank(board?.currentUser ?? null);
      setMonthlyWinners(winners ?? []);
    } catch {} finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏆 Leaderboard</Text>
        <Text style={styles.headerSub}>Updated every hour</Text>
      </View>

      {/* Monthly winners banner */}
      {monthlyWinners.length > 0 && (
        <View style={styles.monthlySection}>
          <Text style={styles.monthlyTitle}>🎉 Last Month's Champions</Text>
          <Text style={styles.monthlySub}>Celebrated on all Sifter social channels</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {monthlyWinners.map((w, i) => (
              <MonthlyWinnerCard key={i} winner={w} />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Tab selector */}
      <View style={styles.typeRow}>
        {(['global', 'field', 'skill'] as LeaderboardType[]).map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.typeBtn, type === t && styles.typeBtnActive]}
            onPress={() => setType(t)}
          >
            <Text style={[styles.typeLabel, type === t && styles.typeLabelActive]}>
              {t === 'global' ? '🌍 Global' : t === 'field' ? '📊 Field' : '⚡ Skill'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* User's own rank pinned */}
      {userRank && !entries.slice(0, 50).find(e => e.isCurrentUser) && (
        <View style={styles.pinnedRow}>
          <Text style={styles.pinnedLabel}>YOUR RANK</Text>
          <LeaderboardRow entry={userRank} />
        </View>
      )}

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={Colors.accent} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {entries.map(entry => <LeaderboardRow key={entry.userId} entry={entry} />)}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
      <DisclaimerFooter />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: '#fff' },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.text },
  headerSub: { fontSize: FontSize.xs, color: Colors.textSoft },

  monthlySection: { backgroundColor: Colors.navy, padding: Spacing.md },
  monthlyTitle: { fontSize: FontSize.md, fontWeight: '900', color: '#fff', marginBottom: 2 },
  monthlySub: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.6)', marginBottom: Spacing.md },
  winnerCard: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: Radius.md, padding: Spacing.md, marginRight: Spacing.sm, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, minWidth: 240 },
  winnerEmoji: { fontSize: 32 },
  winnerCategory: { fontSize: 9, color: Colors.gold, fontWeight: '800', letterSpacing: 1 },
  winnerName: { fontSize: FontSize.sm, fontWeight: '800', color: '#fff' },
  winnerMsg: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  winnerXp: { fontSize: FontSize.xs, color: Colors.gold, fontWeight: '700' },

  typeRow: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Colors.border },
  typeBtn: { flex: 1, paddingVertical: Spacing.sm, alignItems: 'center' },
  typeBtnActive: { borderBottomWidth: 2, borderBottomColor: Colors.accent },
  typeLabel: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.textSoft },
  typeLabelActive: { color: Colors.accent, fontWeight: '800' },

  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: '#fff' },
  rowHighlight: { backgroundColor: Colors.accentSoft },
  rankCell: { width: 40, alignItems: 'center' },
  rankTop: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  rankTopText: { fontSize: 16 },
  rankNum: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.textMuted },
  avatar: { fontSize: 28 },
  username: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.text },
  level: { fontSize: FontSize.xs, color: Colors.textSoft },
  xp: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.text },
  streak: { fontSize: FontSize.xs, color: Colors.textSoft },

  pinnedRow: { backgroundColor: Colors.accentSoft, borderBottomWidth: 2, borderBottomColor: Colors.accent },
  pinnedLabel: { fontSize: 9, fontWeight: '800', color: Colors.accent, letterSpacing: 1, paddingHorizontal: Spacing.md, paddingTop: Spacing.sm },
});
