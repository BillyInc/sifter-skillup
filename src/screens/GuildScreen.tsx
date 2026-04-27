/**
 * GuildScreen — replaces CommunityScreen
 * Shows user's current guild, leaderboard, chat, and guild selection.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, RefreshControl, TextInput, KeyboardAvoidingView,
  Platform, ActivityIndicator, Alert,
} from 'react-native';
import { useTheme, Spacing, Radius, FontSize, Shadow } from '../theme';
import { useAuth } from '../hooks/useAuth';
import { API, API_BASE } from '../lib/api';
import { streakEngine, type StreakStatus } from '../lib/StreakEngine';
import { resolveTrackContext } from '../lib/trackContext';
import {
  WebShell, WebPageHeader, WebRow, WebCol, WebCard, useIsWebWide,
} from '../components/web/WebGrid';

interface GuildDef {
  id: string; name: string; description: string; icon: string;
  accent: string; tier: string; member_count: number; pool_xp: number;
  track_focus?: string;
}
interface GuildMember {
  id: string; username: string; points: number; streak: number;
  starknet_address?: string; rank?: number; is_current_user?: boolean;
}
interface ChatMsg {
  id: string; content: string; username: string; created_at: string; user_id: string;
}

async function apiGet(path: string) {
  const tok = await API.getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Authorization': `Bearer ${tok}` },
  });
  const d = await res.json();
  return d.data;
}

async function apiPost(path: string, body: any) {
  const tok = await API.getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tok}` },
    body: JSON.stringify(body),
  });
  return res.json();
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function TierBadge({ tier, accent }: { tier: string; accent: string }) {
  const label = tier === 'gold' ? '🥇 Gold' : tier === 'silver' ? '🥈 Silver' : '🥉 Bronze';
  return (
    <View style={{ backgroundColor: `${accent}20`, borderRadius: Radius.sm,
      paddingHorizontal: 8, paddingVertical: 2 }}>
      <Text style={{ color: accent, fontSize: 10, fontWeight: '800' }}>{label}</Text>
    </View>
  );
}

function GuildCard({ guild, onJoin, joined }: {
  guild: GuildDef; onJoin: () => void; joined: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View style={[gc.card, { backgroundColor: colors.card, borderColor: `${guild.accent}30` }]}>
      <View style={gc.row}>
        <Text style={{ fontSize: 18 }}>{guild.icon}</Text>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={[gc.name, { color: colors.text }]}>{guild.name}</Text>
            <TierBadge tier={guild.tier} accent={guild.accent} />
          </View>
          <Text style={[gc.desc, { color: colors.textSoft }]}>{guild.description}</Text>
        </View>
      </View>
      <View style={gc.stats}>
        <Text style={[gc.stat, { color: colors.textMuted }]}>👥 {guild.member_count} members</Text>
        <Text style={[gc.stat, { color: colors.textMuted }]}>⚡ {guild.pool_xp.toLocaleString()} XP pooled</Text>
      </View>
      <TouchableOpacity
        style={[gc.btn, { backgroundColor: joined ? '#10B981' : guild.accent }]}
        onPress={onJoin}
        disabled={joined}
        activeOpacity={0.85}
      >
        <Text style={gc.btnTxt}>{joined ? '✓ Joined' : `Join ${guild.name}`}</Text>
      </TouchableOpacity>
    </View>
  );
}

const gc = StyleSheet.create({
  card:  { borderRadius: 11, borderWidth: 1, padding: Platform.OS === 'web' ? 14 : 12, gap: Spacing.sm, ...Shadow.sm },
  row:   { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  name:  { fontSize: FontSize.md, fontWeight: '900' },
  desc:  { fontSize: FontSize.sm, lineHeight: 18, marginTop: 2 },
  stats: { flexDirection: 'row', gap: Spacing.lg },
  stat:  { fontSize: 11, fontWeight: '600' },
  btn:   { borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14, alignItems: 'center' },
  btnTxt:{ color: '#fff', fontWeight: '700', fontSize: 11 },
});

// ── Main Screen ────────────────────────────────────────────────────────────────

type Tab = 'my-guild' | 'browse' | 'leaderboard' | 'chat';

export default function GuildScreen() {
  const { colors } = useTheme();
  const { user, refreshUser } = useAuth();
  const trackContext = React.useMemo(() => resolveTrackContext(user), [user]);
  const isWebWide = useIsWebWide();
  const [tab, setTab] = useState<Tab>('my-guild');
  const [guilds, setGuilds] = useState<GuildDef[]>([]);
  const [myGuild, setMyGuild] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<GuildMember[]>([]);
  const [globalLb, setGlobalLb] = useState<GuildDef[]>([]);
  const [chat, setChat] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  const [streak, setStreak] = useState<StreakStatus | null>(null);

  const userGuildId = user?.guild_id;

  const loadData = useCallback(async () => {
    try {
      const [guildList, globalData, streakData] = await Promise.all([
        apiGet('/api/guilds'),
        apiGet('/api/guilds/leaderboard/global'),
        streakEngine.status(),
      ]);
      setGuilds(guildList || []);
      setGlobalLb(globalData || []);
      setStreak(streakData);

      if (userGuildId) {
        const [myData, lbData, chatData] = await Promise.all([
          apiGet('/api/guilds/my'),
          apiGet(`/api/guilds/${userGuildId}/leaderboard`),
          apiGet(`/api/guilds/${userGuildId}/chat`),
        ]);
        setMyGuild(myData);
        setLeaderboard(lbData || []);
        setChat(chatData || []);
      }
    } catch (e) {
      console.warn('Guild load error:', e);
    } finally {
      setLoading(false);
    }
  }, [userGuildId]);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  async function handleJoin(guildId: string) {
    try {
      await apiPost(`/api/guilds/${guildId}/join`, {});
      await refreshUser();
      await loadData();
    } catch {
      Alert.alert('Error', 'Could not join guild. Try again.');
    }
  }

  async function handleLeave() {
    Alert.alert('Leave Guild', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Leave', style: 'destructive', onPress: async () => {
        await apiPost('/api/guilds/leave', {});
        await refreshUser();
        await loadData();
      }},
    ]);
  }

  async function sendChat() {
    if (!chatInput.trim() || sending) return;
    setSending(true);
    try {
      await apiPost(`/api/guilds/${userGuildId}/chat`, { content: chatInput.trim() });
      setChatInput('');
      const updated = await apiGet(`/api/guilds/${userGuildId}/chat`);
      setChat(updated || []);
    } finally {
      setSending(false);
    }
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: 'my-guild', label: userGuildId ? 'My Guild' : 'Overview' },
    { id: 'browse', label: 'Browse' },
    { id: 'leaderboard', label: 'Rankings' },
    { id: 'chat', label: 'Chat' },
  ];

  if (loading) {
    return (
      <SafeAreaView style={[s.screen, { backgroundColor: colors.bg }]}>
        <ActivityIndicator color={colors.accent} size="large" style={{ marginTop: 80 }} />
      </SafeAreaView>
    );
  }

  const featuredGuilds = guilds.slice(0, 4);
  const sideLeaders = (leaderboard.length > 0 ? leaderboard : (myGuild?.top_members || [])).slice(0, 5);

  if (isWebWide) {
    return (
      <SafeAreaView style={[s.screen, { backgroundColor: colors.bg }]}>
        <WebShell>
          <WebPageHeader
            title="Guilds"
            subtitle={trackContext.mode === 'track'
              ? `${trackContext.trackName} workspace · compete, collaborate, and stay accountable`
              : 'Compete, collaborate, and stay accountable'}
            accentColor={colors.accent}
            right={
              <View style={s.webTabRow}>
                {TABS.map(t => {
                  const active = tab === t.id;
                  return (
                    <TouchableOpacity
                      key={t.id}
                      onPress={() => setTab(t.id)}
                      activeOpacity={0.8}
                      style={[
                        s.webTab,
                        {
                          backgroundColor: active ? colors.text : colors.card,
                          borderColor: active ? colors.text : colors.border,
                        },
                      ]}
                    >
                      <Text style={{ color: active ? '#fff' : colors.textSoft, fontSize: 12, fontWeight: '700' }}>
                        {t.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            }
          />

          <WebRow>
            <WebCol weight={2}>
              {tab === 'my-guild' && (
                userGuildId && myGuild ? (
                  <>
                    <WebCard accentBar accentColor={myGuild.accent}>
                      <View style={s.webGuildHero}>
                        <View style={[s.webGuildBadge, { backgroundColor: `${myGuild.accent}18`, borderColor: `${myGuild.accent}40` }]}>
                          <Text style={s.webGuildBadgeIcon}>{myGuild.icon}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <View style={s.webGuildTitleRow}>
                            <Text style={[s.webGuildName, { color: colors.text }]}>{myGuild.name}</Text>
                            <TierBadge tier={myGuild.tier} accent={myGuild.accent} />
                          </View>
                          <Text style={[s.webGuildDesc, { color: colors.textSoft }]}>{myGuild.description}</Text>
                          <View style={s.webMetaRow}>
                            <Text style={[s.webMetaText, { color: colors.textMuted }]}>Members: {myGuild.member_count}</Text>
                            <Text style={[s.webMetaText, { color: colors.textMuted }]}>Pool XP: {myGuild.pool_xp?.toLocaleString()}</Text>
                            <Text style={[s.webMetaText, { color: colors.textMuted }]}>Your Rank: #{myGuild.user_rank ?? '-'}</Text>
                          </View>
                        </View>
                        <TouchableOpacity
                          style={[gc.btn, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, paddingHorizontal: Spacing.lg }]}
                          onPress={handleLeave}
                        >
                          <Text style={[gc.btnTxt, { color: colors.text }]}>Leave</Text>
                        </TouchableOpacity>
                      </View>
                    </WebCard>

                    <WebCard title="Top Members" accentBar accentColor={myGuild.accent} style={{ marginTop: 20 }}>
                      {(myGuild.top_members || []).slice(0, 5).map((m: GuildMember, i: number) => (
                        <View
                          key={m.id}
                          style={[
                            s.memberRow,
                            {
                              backgroundColor: colors.card,
                              borderBottomWidth: i < 4 ? 1 : 0,
                              borderBottomColor: colors.border,
                              borderRadius: 0,
                              paddingHorizontal: 0,
                            },
                          ]}
                        >
                          <Text style={[s.rank, { color: i < 3 ? myGuild.accent : colors.textMuted }]}>#{i + 1}</Text>
                          <View style={{ flex: 1 }}>
                            <Text style={[s.memberName, { color: colors.text }]}>{m.username}{m.id === user?.id ? ' (You)' : ''}</Text>
                            <Text style={{ color: colors.textMuted, fontSize: 11 }}>Streak {m.streak}d</Text>
                          </View>
                          <Text style={[s.pts, { color: colors.textSoft }]}>{m.points?.toLocaleString()} XP</Text>
                        </View>
                      ))}
                    </WebCard>
                  </>
                ) : (
                  <WebCard accentBar accentColor={colors.accent}>
                    <View style={s.emptyState}>
                      <Text style={{ fontSize: 18 }}>Guilds</Text>
                      <Text style={[s.emptyTitle, { color: colors.text }]}>Join a Guild</Text>
                      <Text style={[s.emptySub, { color: colors.textSoft, maxWidth: 520 }]}>
                        Guilds keep your workspace social with shared XP, rankings, and team accountability.
                      </Text>
                      <TouchableOpacity style={[s.browseCta, { backgroundColor: colors.accent }]} onPress={() => setTab('browse')}>
                        <Text style={{ color: '#fff', fontWeight: '800', fontSize: FontSize.md }}>Browse Guilds</Text>
                      </TouchableOpacity>
                    </View>
                  </WebCard>
                )
              )}

              {tab === 'browse' && (
                <WebCard title="Guild Directory" accentBar accentColor={colors.accent}>
                  <View style={s.webGuildGrid}>
                    {featuredGuilds.map(g => (
                      <GuildCard key={g.id} guild={g} joined={userGuildId === g.id} onJoin={() => handleJoin(g.id)} />
                    ))}
                  </View>
                </WebCard>
              )}

              {tab === 'leaderboard' && (
                <WebCard title="Global Guild Rankings" accentBar accentColor={colors.gold}>
                  {globalLb.map((g, i) => (
                    <View key={g.id} style={[s.lbRow, { backgroundColor: colors.card, borderColor: i < 3 ? `${g.accent}40` : colors.border, marginBottom: Spacing.sm }]}>
                      <Text style={[s.lbRank, { color: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : colors.textMuted }]}>
                        {i === 0 ? '1' : i === 1 ? '2' : i === 2 ? '3' : `${i + 1}`}
                      </Text>
                      <Text style={{ fontSize: 18 }}>{g.icon}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={[s.lbName, { color: colors.text }]}>{g.name}</Text>
                        <Text style={{ color: colors.textMuted, fontSize: 11 }}>{g.member_count} members</Text>
                      </View>
                      <Text style={[s.lbXP, { color: g.accent }]}>{g.pool_xp?.toLocaleString()} XP</Text>
                    </View>
                  ))}
                </WebCard>
              )}

              {tab === 'chat' && (
                <WebCard title="Guild Chat" accentBar accentColor={colors.accent}>
                  {userGuildId ? (
                    <>
                      <View style={s.chatMessages}>
                        {chat.length === 0 ? (
                          <Text style={{ color: colors.textMuted, textAlign: 'center', padding: Spacing.xl }}>
                            No messages yet. Start the workspace conversation.
                          </Text>
                        ) : (
                          chat.map(msg => (
                            <View key={msg.id} style={[s.bubble, {
                              backgroundColor: msg.user_id === user?.id ? `${colors.accent}20` : colors.card,
                              alignSelf: msg.user_id === user?.id ? 'flex-end' : 'flex-start',
                              borderColor: msg.user_id === user?.id ? `${colors.accent}40` : colors.border,
                            }]}>
                              <Text style={{ color: colors.accent, fontSize: 10, fontWeight: '800', marginBottom: 2 }}>{msg.username}</Text>
                              <Text style={{ color: colors.text, fontSize: FontSize.sm, lineHeight: 18 }}>{msg.content}</Text>
                            </View>
                          ))
                        )}
                      </View>
                      <View style={[s.chatInput, { backgroundColor: colors.card, borderColor: colors.border, marginTop: Spacing.md }]}>
                        <TextInput
                          style={[s.input, { color: colors.text }]}
                          placeholder="Message your guild..."
                          placeholderTextColor={colors.textMuted}
                          value={chatInput}
                          onChangeText={setChatInput}
                          maxLength={500}
                          multiline
                        />
                        <TouchableOpacity
                          style={[s.sendBtn, { backgroundColor: colors.accent, opacity: chatInput.trim() ? 1 : 0.4 }]}
                          onPress={sendChat}
                          disabled={!chatInput.trim() || sending}
                        >
                          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 13 }}>{sending ? '...' : '>'}</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : (
                    <Text style={{ color: colors.textMuted, textAlign: 'center', padding: Spacing.xl }}>
                      Join a guild to unlock guild chat.
                    </Text>
                  )}
                </WebCard>
              )}
            </WebCol>

            <WebCol weight={1}>
              <WebCard title="Leaderboard" accentBar accentColor={colors.accent} style={{ marginBottom: 20 }}>
                {sideLeaders.map((m: GuildMember, i: number) => (
                  <View key={m.id ?? `${m.username}-${i}`} style={[s.webLeaderboardRow, { borderBottomColor: colors.border }]}>
                    <View style={[s.webRankDot, { backgroundColor: i < 3 ? ['#FFD700', '#C0C0C0', '#CD7F32'][i] : colors.bgSecondary }]}>
                      <Text style={{ color: i < 3 ? '#fff' : colors.textMuted, fontSize: 10, fontWeight: '800' }}>{m.rank ?? i + 1}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: m.is_current_user ? colors.accent : colors.text, fontSize: 12, fontWeight: m.is_current_user ? '800' : '700' }}>
                        {m.username}{m.is_current_user ? ' (You)' : ''}
                      </Text>
                      <Text style={{ color: colors.textMuted, fontSize: 10 }}>{m.points?.toLocaleString()} XP · Streak {m.streak}d</Text>
                    </View>
                  </View>
                ))}
              </WebCard>

              <WebCard accentBar accentColor={colors.green}>
                <Text style={[s.webStreakLabel, { color: colors.green }]}>Your Streak</Text>
                <Text style={[s.webStreakNumber, { color: colors.green }]}>{streak?.streak ?? 0} Days</Text>
                <Text style={[s.webStreakSub, { color: colors.textSoft }]}>
                  {streak?.completedToday ? 'Lesson completed today.' : `${Math.max(0, Math.floor(streak?.hoursLeft ?? 0))} hours left to protect it.`}
                </Text>
              </WebCard>
            </WebCol>
          </WebRow>
        </WebShell>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[s.screen, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={[s.header, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
        <View>
          <Text style={[s.eyebrow, { color: colors.textMuted }]}>GUILDS</Text>
          <Text style={[s.title, { color: colors.text }]}>Guilds</Text>
        </View>
        {userGuildId && myGuild && (
          <View style={[s.guildChip, { backgroundColor: `${myGuild.accent}20`, borderColor: `${myGuild.accent}40` }]}>
            <Text style={{ color: myGuild.accent, fontWeight: '800', fontSize: 12 }}>
              {myGuild.icon} {myGuild.name}
            </Text>
          </View>
        )}
      </View>

      {/* Tab bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[s.tabBar, { borderBottomColor: colors.border }]}>
        {TABS.map(t => (
          <TouchableOpacity key={t.id} style={[s.tab, tab === t.id && { borderBottomColor: colors.accent, borderBottomWidth: 2 }]}
            onPress={() => setTab(t.id)}>
            <Text style={[s.tabTxt, { color: tab === t.id ? colors.accent : colors.textMuted }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={s.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* MY GUILD TAB */}
          {tab === 'my-guild' && (
            userGuildId && myGuild ? (
              <>
                <View style={[s.card, { backgroundColor: `${myGuild.accent}10`, borderColor: `${myGuild.accent}30` }]}>
                  <Text style={{ fontSize: 18 }}>{myGuild.icon}</Text>
                  <Text style={[s.guildName, { color: colors.text }]}>{myGuild.name}</Text>
                  <Text style={[s.guildDesc, { color: colors.textSoft }]}>{myGuild.description}</Text>
                  <View style={s.statsRow}>
                    <View style={s.statBox}>
                      <Text style={[s.statVal, { color: myGuild.accent }]}>{myGuild.member_count}</Text>
                      <Text style={[s.statLbl, { color: colors.textMuted }]}>Members</Text>
                    </View>
                    <View style={s.statBox}>
                      <Text style={[s.statVal, { color: myGuild.accent }]}>{myGuild.pool_xp?.toLocaleString()}</Text>
                      <Text style={[s.statLbl, { color: colors.textMuted }]}>Pool XP</Text>
                    </View>
                    <View style={s.statBox}>
                      <Text style={[s.statVal, { color: myGuild.accent }]}>#{myGuild.user_rank ?? '—'}</Text>
                      <Text style={[s.statLbl, { color: colors.textMuted }]}>Your Rank</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={[s.leaveBtn, { borderColor: colors.border }]} onPress={handleLeave}>
                    <Text style={[s.leaveTxt, { color: colors.textMuted }]}>Leave Guild</Text>
                  </TouchableOpacity>
                </View>

                <Text style={[s.section, { color: colors.text }]}>TOP MEMBERS</Text>
                {(myGuild.top_members || []).slice(0, 5).map((m: GuildMember, i: number) => (
                  <View key={m.id} style={[s.memberRow, { backgroundColor: colors.card }]}>
                    <Text style={[s.rank, { color: i < 3 ? myGuild.accent : colors.textMuted }]}>#{i + 1}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.memberName, { color: colors.text }]}>
                        {m.username}{m.id === user?.id ? ' (You)' : ''}
                      </Text>
                      {m.starknet_address && (
                        <Text style={{ color: colors.textMuted, fontSize: 10, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' }}>
                          {m.starknet_address.slice(0, 10)}…
                        </Text>
                      )}
                    </View>
                    <Text style={[s.pts, { color: colors.textSoft }]}>{m.points?.toLocaleString()} XP</Text>
                  </View>
                ))}
              </>
            ) : (
              <View style={s.emptyState}>
                <Text style={{ fontSize: 18 }}>⚔️</Text>
                <Text style={[s.emptyTitle, { color: colors.text }]}>Join a Guild</Text>
                <Text style={[s.emptySub, { color: colors.textSoft }]}>
                  Guilds keep your workspace social with shared XP, rankings, and team accountability.
                </Text>
                <TouchableOpacity style={[s.browseCta, { backgroundColor: colors.accent }]}
                  onPress={() => setTab('browse')}>
                  <Text style={{ color: '#fff', fontWeight: '800', fontSize: FontSize.md }}>Browse Guilds</Text>
                </TouchableOpacity>
              </View>
            )
          )}

          {/* BROWSE TAB */}
          {tab === 'browse' && guilds.map(g => (
            <GuildCard key={g.id} guild={g} joined={userGuildId === g.id}
              onJoin={() => handleJoin(g.id)} />
          ))}

          {/* LEADERBOARD TAB */}
          {tab === 'leaderboard' && (
            <>
              <Text style={[s.section, { color: colors.text }]}>GLOBAL GUILD RANKINGS</Text>
              {globalLb.map((g, i) => (
                <View key={g.id} style={[s.lbRow, { backgroundColor: colors.card, borderColor: i < 3 ? `${g.accent}40` : colors.border }]}>
                  <Text style={[s.lbRank, { color: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : colors.textMuted }]}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                  </Text>
                  <Text style={{ fontSize: 18 }}>{g.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.lbName, { color: colors.text }]}>{g.name}</Text>
                    <Text style={{ color: colors.textMuted, fontSize: 11 }}>{g.member_count} members</Text>
                  </View>
                  <Text style={[s.lbXP, { color: g.accent }]}>{g.pool_xp?.toLocaleString()} XP</Text>
                </View>
              ))}

              {userGuildId && leaderboard.length > 0 && (
                <>
                  <Text style={[s.section, { color: colors.text, marginTop: Spacing.lg }]}>YOUR GUILD MEMBERS</Text>
                  {leaderboard.slice(0, 10).map(m => (
                    <View key={m.id} style={[s.lbRow, { backgroundColor: colors.card, borderColor: m.is_current_user ? colors.accent : colors.border }]}>
                      <Text style={[s.lbRank, { color: m.rank && m.rank <= 3 ? '#FFD700' : colors.textMuted }]}>#{m.rank}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={[s.lbName, { color: m.is_current_user ? colors.accent : colors.text }]}>
                          {m.username}{m.is_current_user ? ' ← You' : ''}
                        </Text>
                        <Text style={{ color: colors.textMuted, fontSize: 11 }}>
                          🔥 {m.streak} day streak · {(m as any).levels_completed ?? 0} levels
                        </Text>
                      </View>
                      <Text style={[s.lbXP, { color: colors.textSoft }]}>{m.points?.toLocaleString()} XP</Text>
                    </View>
                  ))}
                </>
              )}
            </>
          )}

          {/* CHAT TAB */}
          {tab === 'chat' && (
            userGuildId ? (
              <>
                <View style={s.chatMessages}>
                  {chat.length === 0 ? (
                    <Text style={{ color: colors.textMuted, textAlign: 'center', padding: Spacing.xl }}>
                      No messages yet. Start the workspace conversation.
                    </Text>
                  ) : (
                    chat.map(msg => (
                      <View key={msg.id} style={[s.bubble, {
                        backgroundColor: msg.user_id === user?.id ? `${colors.accent}20` : colors.card,
                        alignSelf: msg.user_id === user?.id ? 'flex-end' : 'flex-start',
                        borderColor: msg.user_id === user?.id ? `${colors.accent}40` : colors.border,
                      }]}>
                        <Text style={{ color: colors.accent, fontSize: 10, fontWeight: '800', marginBottom: 2 }}>{msg.username}</Text>
                        <Text style={{ color: colors.text, fontSize: FontSize.sm, lineHeight: 18 }}>{msg.content}</Text>
                      </View>
                    ))
                  )}
                </View>
                <View style={[s.chatInput, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <TextInput
                    style={[s.input, { color: colors.text }]}
                    placeholder="Message your guild…"
                    placeholderTextColor={colors.textMuted}
                    value={chatInput}
                    onChangeText={setChatInput}
                    maxLength={500}
                    multiline
                  />
                  <TouchableOpacity
                    style={[s.sendBtn, { backgroundColor: colors.accent, opacity: chatInput.trim() ? 1 : 0.4 }]}
                    onPress={sendChat}
                    disabled={!chatInput.trim() || sending}
                  >
                    <Text style={{ color: '#fff', fontWeight: '800', fontSize: 13 }}>
                      {sending ? '…' : '→'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <Text style={{ color: colors.textMuted, textAlign: 'center', padding: Spacing.xl }}>
                Join a guild to unlock guild chat.
              </Text>
            )
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen:      { flex: 1 },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                 paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderBottomWidth: 1 },
  eyebrow:     { fontSize: 10, fontWeight: '900', letterSpacing: 0.8, marginBottom: 2 },
  title:       { fontSize: 20, fontWeight: '900' },
  guildChip:   { borderRadius: 5, borderWidth: 1, paddingHorizontal: 7, paddingVertical: 3 },
  webTabRow:   { flexDirection: 'row', gap: Spacing.xs, flexWrap: 'wrap', justifyContent: 'flex-end' },
  webTab:      { borderRadius: 8, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8 },
  webGuildHero:{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  webGuildBadge:{ width: 56, height: 56, borderRadius: 16, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  webGuildBadgeIcon:{ fontSize: 18 },
  webGuildTitleRow:{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 4, flexWrap: 'wrap' },
  webGuildName:{ fontSize: FontSize.lg, fontWeight: '900' },
  webGuildDesc:{ fontSize: FontSize.sm, lineHeight: 20 },
  webMetaRow:  { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.sm, flexWrap: 'wrap' },
  webMetaText: { fontSize: 11, fontWeight: '600' },
  webGuildGrid:{ gap: Spacing.md },
  webLeaderboardRow:{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 10, borderBottomWidth: 1 },
  webRankDot:  { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  webStreakLabel:{ fontSize: 12, fontWeight: '800', marginBottom: 4 },
  webStreakNumber:{ fontSize: 18, fontWeight: '800' },
  webStreakSub:{ fontSize: 11, marginTop: 4, lineHeight: 17 },
  tabBar:      { borderBottomWidth: 1, maxHeight: 44 },
  tab:         { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  tabTxt:      { fontSize: 12, fontWeight: '700' },
  content:     { padding: Spacing.md, gap: Spacing.md, paddingBottom: 18 },
  card:        { borderRadius: 11, borderWidth: 1, padding: Platform.OS === 'web' ? 14 : 12,
                 alignItems: 'center', gap: Spacing.sm },
  guildName:   { fontSize: FontSize.lg, fontWeight: '900', textAlign: 'center' },
  guildDesc:   { fontSize: FontSize.sm, textAlign: 'center', lineHeight: 20 },
  statsRow:    { flexDirection: 'row', gap: Spacing.xl, marginTop: Spacing.sm },
  statBox:     { alignItems: 'center' },
  statVal:     { fontSize: 20, fontWeight: '800' },
  statLbl:     { fontSize: 10, fontWeight: '600', marginTop: 2 },
  leaveBtn:    { borderWidth: 1, borderRadius: 8, paddingHorizontal: 14,
                 paddingVertical: 8, marginTop: Spacing.sm },
  leaveTxt:    { fontSize: 11, fontWeight: '700' },
  section:     { fontSize: 13, fontWeight: '800', letterSpacing: 0.8, marginBottom: 10 },
  memberRow:   { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
                 borderRadius: 11, borderWidth: 1, padding: Platform.OS === 'web' ? 14 : 12 },
  rank:        { width: 28, fontSize: 13, fontWeight: '800', textAlign: 'center' },
  memberName:  { fontSize: FontSize.sm, fontWeight: '700' },
  pts:         { fontSize: 12, fontWeight: '700' },
  lbRow:       { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
                 borderRadius: 11, borderWidth: 1, padding: Platform.OS === 'web' ? 14 : 12 },
  lbRank:      { width: 32, fontSize: 18, textAlign: 'center' },
  lbName:      { fontSize: FontSize.sm, fontWeight: '800' },
  lbXP:        { fontSize: 13, fontWeight: '800' },
  emptyState:  { alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.xxxl },
  emptyTitle:  { fontSize: FontSize.xl, fontWeight: '900' },
  emptySub:    { fontSize: FontSize.sm, textAlign: 'center', lineHeight: 22 },
  browseCta:   { borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14,
                 marginTop: Spacing.sm },
  chatMessages:{ gap: Spacing.sm, paddingBottom: Spacing.md },
  bubble:      { maxWidth: '80%', borderRadius: Radius.lg, borderWidth: 1, padding: Spacing.sm },
  chatInput:   { flexDirection: 'row', borderRadius: 11, borderWidth: 1,
                 padding: Platform.OS === 'web' ? 14 : 12, gap: Spacing.sm, alignItems: 'flex-end' },
  input:       { flex: 1, fontSize: FontSize.sm, lineHeight: 20, maxHeight: 80, padding: 4 },
  sendBtn:     { borderRadius: Radius.full, width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
});
