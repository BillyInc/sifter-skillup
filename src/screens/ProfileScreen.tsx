import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Linking } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { API } from '../lib/api';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../theme';
import DisclaimerFooter from '../components/DisclaimerFooter';

const CHARACTER_STAGES = ['🥚','🐣','📚','🔑','🌱','📈','🔬','🏗️','⚡'];
const CHARACTER_NAMES  = ['Egg','Hatchling','Learner','Keeper','Farmer','Trader','Analyst','Architect','Legend'];
const NEXT_STAGE_AT    = [0, 15, 30, 60, 90, 120, 150, 180, 210];

function GitHubProfileCard() {
  const [status, setStatus] = useState<{ connected: boolean; username: string | null } | null>(null);

  useEffect(() => {
    API.githubStatus().then(setStatus).catch(() => {});
  }, []);

  if (!status) return null;

  return (
    <View style={styles.ghCard}>
      <View style={styles.ghRow}>
        <Text style={styles.ghIcon}>🐙</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.ghTitle}>GitHub Portfolio</Text>
          {status.connected
            ? <Text style={styles.ghSub}>Connected · github.com/{status.username}</Text>
            : <Text style={[styles.ghSub, { color: Colors.textSoft }]}>Not connected yet</Text>
          }
        </View>
        {status.connected
          ? <TouchableOpacity onPress={() => Linking.openURL(`https://github.com/${status.username}`)}>
              <Text style={styles.ghAction}>View →</Text>
            </TouchableOpacity>
          : null
        }
      </View>
      {!status.connected && (
        <Text style={styles.ghHint}>
          Connect GitHub in the 🐙 GitHub tab to publish your quant portfolio and earn +500 XP.
        </Text>
      )}
    </View>
  );
}

// ── Privacy Settings Card ─────────────────────────────────────────────────────

function PrivacySettingsCard() {
  const { user } = useAuth();
  const [isPrivate, setIsPrivate] = React.useState(false);
  const [followRequests, setFollowRequests] = React.useState(0);

  React.useEffect(() => {
    // Load current privacy setting
    if (user?.id) {
      fetch(`${process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000'}/api/users/privacy?userId=${user.id}`)
        .then(r => r.json())
        .then(d => { setIsPrivate(d.isPrivate ?? false); setFollowRequests(d.pendingFollowRequests ?? 0); })
        .catch(() => {});
    }
  }, [user?.id]);

  const toggle = async () => {
    const next = !isPrivate;
    setIsPrivate(next);
    try {
      await fetch(`${process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000'}/api/users/privacy`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, isPrivate: next }),
      });
    } catch { setIsPrivate(!next); } // revert on fail
  };

  return (
    <View style={privStyles.card}>
      <Text style={privStyles.title}>Privacy & Safety</Text>

      {/* Private account toggle */}
      <View style={privStyles.row}>
        <View style={{ flex: 1 }}>
          <Text style={privStyles.rowLabel}>🔒 Private account</Text>
          <Text style={privStyles.rowSub}>
            Only approved followers see your posts and progress. Others must request to follow you.
          </Text>
        </View>
        <TouchableOpacity onPress={toggle} style={[privStyles.toggle, isPrivate && privStyles.toggleOn]}>
          <View style={[privStyles.thumb, isPrivate && privStyles.thumbOn]} />
        </TouchableOpacity>
      </View>

      {/* Follow requests (only shown if private + has pending) */}
      {isPrivate && followRequests > 0 && (
        <TouchableOpacity style={privStyles.requestsRow}>
          <Text style={privStyles.requestsText}>👤 {followRequests} follow request{followRequests > 1 ? 's' : ''} pending</Text>
          <Text style={privStyles.requestsAction}>Review →</Text>
        </TouchableOpacity>
      )}

      {/* DM note */}
      <View style={privStyles.dmNote}>
        <Text style={privStyles.dmNoteText}>
          💬 <Text style={{ fontWeight: '700' }}>Messages:</Text> Only you can start a conversation. 
          Other users cannot message you unless you reach out first.
        </Text>
      </View>

      {/* Blocked users */}
      <TouchableOpacity style={privStyles.linkRow}>
        <Text style={privStyles.linkText}>🚫 Blocked accounts</Text>
        <Text style={privStyles.linkArrow}>›</Text>
      </TouchableOpacity>

      {/* Muted users */}
      <TouchableOpacity style={privStyles.linkRow}>
        <Text style={privStyles.linkText}>🔇 Muted accounts</Text>
        <Text style={privStyles.linkArrow}>›</Text>
      </TouchableOpacity>
    </View>
  );
}

const privStyles = StyleSheet.create({
  card:         { backgroundColor: Colors.card, borderRadius: Radius.xl, padding: Spacing.lg, borderWidth: 1.5, borderColor: Colors.border, gap: Spacing.md },
  title:        { fontSize: FontSize.lg, fontWeight: '900', color: Colors.text },
  row:          { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  rowLabel:     { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  rowSub:       { fontSize: 12, color: Colors.textSoft, lineHeight: 17 },
  toggle:       { width: 50, height: 28, borderRadius: 14, backgroundColor: '#e2e8f0', padding: 2, justifyContent: 'center' },
  toggleOn:     { backgroundColor: Colors.accent },
  thumb:        { width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff', alignSelf: 'flex-start' },
  thumbOn:      { alignSelf: 'flex-end' },
  requestsRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f0f4ff', borderRadius: Radius.md, padding: Spacing.md },
  requestsText: { fontSize: FontSize.sm, color: Colors.text, fontWeight: '600' },
  requestsAction: { fontSize: FontSize.sm, color: Colors.accent, fontWeight: '800' },
  dmNote:       { backgroundColor: '#f8fafc', borderRadius: Radius.md, padding: Spacing.md },
  dmNoteText:   { fontSize: 12, color: Colors.textSoft, lineHeight: 18 },
  linkRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  linkText:     { fontSize: FontSize.sm, color: Colors.text, fontWeight: '600' },
  linkArrow:    { fontSize: 18, color: Colors.textSoft },
});

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  if (!user) return null;

  const stage    = Math.min(user.character_stage ?? 0, 8);
  const nextAt   = NEXT_STAGE_AT[Math.min(stage + 1, 8)];
  const progress = nextAt ? Math.min(100, Math.round((user.completed_levels?.length ?? 0) / nextAt * 100)) : 100;

  const stats = [
    { label: 'Levels Done',  value: user.completed_levels?.length ?? 0 },
    { label: 'XP',           value: user.points?.toLocaleString() ?? 0 },
    { label: 'Day Streak',   value: user.streak ?? 0 },
    { label: 'Character',    value: CHARACTER_NAMES[stage] },
  ];

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Character */}
        <View style={[styles.characterCard, Shadow.md]}>
          <Text style={styles.characterEmoji}>{CHARACTER_STAGES[stage]}</Text>
          <Text style={styles.characterName}>{CHARACTER_NAMES[stage]}</Text>
          <Text style={styles.characterUsername}>{user.username}</Text>
          <View style={styles.charProgress}>
            <View style={[styles.charProgressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.charProgressLabel}>
            {stage < 8 ? `${user.completed_levels?.length ?? 0} / ${nextAt} levels to evolve` : 'Max stage reached!'}
          </Text>
        </View>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          {stats.map(s => (
            <View key={s.label} style={[styles.statCard, Shadow.sm]}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Tier progress */}
        <View style={[styles.tierCard, Shadow.sm]}>
          <Text style={styles.sectionTitle}>Learning Path</Text>
          {[
            { label: '🟢 Beginner',     range: '1–45',   total: 45,  color: Colors.beginner },
            { label: '🟡 Intermediate', range: '46–120',  total: 75,  color: Colors.intermediate },
            { label: '🔵 Pro',          range: '121–270', total: 150, color: Colors.pro },
          ].map(tier => {
            const done = (user.completed_levels ?? []).filter(l => {
              const n = parseInt(tier.range.split('–')[0]);
              const m = parseInt(tier.range.split('–')[1]);
              return l >= n && l <= m;
            }).length;
            const pct = Math.round((done / tier.total) * 100);
            return (
              <View key={tier.label} style={styles.tierRow}>
                <Text style={styles.tierRowLabel}>{tier.label}</Text>
                <View style={styles.tierBarBg}>
                  <View style={[styles.tierBarFill, { width: `${pct}%`, backgroundColor: tier.color }]} />
                </View>
                <Text style={styles.tierPct}>{done}/{tier.total}</Text>
              </View>
            );
          })}
        </View>

        {/* GitHub card */}
        <GitHubProfileCard />

        {/* Privacy Settings */}
        <PrivacySettingsCard />

        {/* Sign out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={signOut} activeOpacity={0.8}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
          <DisclaimerFooter />
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen:             { flex: 1, backgroundColor: Colors.bg },
  content:            { padding: Spacing.lg, gap: Spacing.lg, paddingBottom: 60 },
  characterCard:      { backgroundColor: Colors.card, borderRadius: Radius.xl, padding: Spacing.xxl, alignItems: 'center', borderWidth: 1.5, borderColor: Colors.border },
  characterEmoji:     { fontSize: 72, marginBottom: Spacing.sm },
  characterName:      { fontSize: FontSize.xxl, fontWeight: '900', color: Colors.text },
  characterUsername:  { fontSize: FontSize.md, color: Colors.textSoft, marginBottom: Spacing.lg },
  charProgress:       { width: '100%', height: 10, backgroundColor: Colors.border, borderRadius: 99, overflow: 'hidden' },
  charProgressFill:   { height: 10, backgroundColor: Colors.accent, borderRadius: 99 },
  charProgressLabel:  { fontSize: FontSize.sm, color: Colors.textSoft, marginTop: Spacing.sm },
  statsGrid:          { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  statCard:           { flex: 1, minWidth: '45%', backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.lg, alignItems: 'center', borderWidth: 1.5, borderColor: Colors.border },
  statValue:          { fontSize: FontSize.xxl, fontWeight: '900', color: Colors.accent },
  statLabel:          { fontSize: FontSize.xs, color: Colors.textSoft, fontWeight: '700', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  tierCard:           { backgroundColor: Colors.card, borderRadius: Radius.xl, padding: Spacing.lg, borderWidth: 1.5, borderColor: Colors.border, gap: Spacing.md },
  sectionTitle:       { fontSize: FontSize.lg, fontWeight: '900', color: Colors.text, marginBottom: Spacing.sm },
  tierRow:            { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  tierRowLabel:       { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text, width: 110 },
  tierBarBg:          { flex: 1, height: 8, backgroundColor: Colors.border, borderRadius: 99, overflow: 'hidden' },
  tierBarFill:        { height: 8, borderRadius: 99 },
  tierPct:            { fontSize: FontSize.xs, color: Colors.textSoft, fontWeight: '600', width: 44, textAlign: 'right' },
  signOutBtn:         { borderRadius: Radius.md, padding: Spacing.lg, alignItems: 'center', borderWidth: 2, borderColor: Colors.border },
  signOutText:        { fontSize: FontSize.md, color: Colors.textSoft, fontWeight: '700' },
  ghCard:    { backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1.5, borderColor: Colors.border, padding: Spacing.lg, gap: Spacing.sm },
  ghRow:     { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ghIcon:    { fontSize: 28 },
  ghTitle:   { fontSize: FontSize.sm, fontWeight: '800', color: Colors.text },
  ghSub:     { fontSize: FontSize.xs, color: '#16a34a', marginTop: 2 },
  ghAction:  { fontSize: FontSize.sm, color: Colors.accent, fontWeight: '700' },
  ghHint:    { fontSize: FontSize.xs, color: Colors.textSoft, lineHeight: 17 },
});