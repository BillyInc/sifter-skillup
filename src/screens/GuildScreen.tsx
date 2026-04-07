/**
 * Sifter Skill_Up — Guild & Community Screen
 *
 * - Join or create field-based guilds (e.g. "Supply Chain Analysts")
 * - Follow other learners
 * - Discussions: ask questions, share wins, get help
 * - Group Projects: collaborate on mini-projects, push to portfolio as a team
 * - Competition mode: guild vs guild on XP per week
 */

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, FlatList, TextInput, ActivityIndicator,
  Platform, useWindowDimensions,
} from 'react-native';
import { Colors, Spacing, Radius, FontSize, Shadow, useTheme } from '../theme';
import { API } from '../lib/api';
import { offlineRead, offlineWrite } from '../lib/offlineQueue';
import DisclaimerFooter from '../components/DisclaimerFooter';
import {
  WebShell, WebPageHeader, WebRow, WebCol, WebCard,
  WebSectionLabel, WebStatTile, WebListRow, WebDivider, useIsWebWide,
} from '../components/web/WebGrid';

type GuildTab = 'my-guild' | 'discover' | 'projects' | 'members';

interface Guild {
  id: string;
  name: string;
  field: string;
  emoji: string;
  memberCount: number;
  weeklyXp: number;
  rank: number;
  description: string;
  isJoined: boolean;
}

interface GroupProject {
  id: string;
  title: string;
  description: string;
  field: string;
  level: string;
  memberCount: number;
  maxMembers: number;
  status: 'open' | 'in-progress' | 'complete';
  dueDate: string;
  portfolioPush: boolean;
  isJoined: boolean;
}

interface Post {
  id: string;
  author: string;
  avatarEmoji: string;
  content: string;
  likes: number;
  replies: number;
  createdAt: string;
  field: string;
  isLiked: boolean;
}

function GuildCard({ guild, onJoin }: { guild: Guild; onJoin: (id: string) => void }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.guildCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.guildHeader}>
        <Text style={styles.guildEmoji}>{guild.emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.guildName, { color: colors.text }]}>{guild.name}</Text>
          <Text style={styles.guildField}>{guild.field}</Text>
        </View>
        <View style={styles.guildRankBadge}>
          <Text style={styles.guildRankText}>#{guild.rank}</Text>
        </View>
      </View>
      <Text style={[styles.guildDesc, { color: colors.textSoft as string }]} numberOfLines={2}>{guild.description}</Text>
      <View style={styles.guildStats}>
        <Text style={styles.guildStat}>👥 {guild.memberCount} members</Text>
        <Text style={styles.guildStat}>⚡ {guild.weeklyXp.toLocaleString()} XP this week</Text>
      </View>
      <TouchableOpacity
        style={[styles.joinBtn, guild.isJoined && styles.joinBtnJoined]}
        onPress={() => !guild.isJoined && onJoin(guild.id)}
      >
        <Text style={[styles.joinBtnText, guild.isJoined && styles.joinBtnTextJoined]}>
          {guild.isJoined ? '✓ Joined' : 'Join Guild'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function ProjectCard({ project, onJoin }: { project: GroupProject; onJoin: (id: string) => void }) {
  const { colors } = useTheme();
  const statusColor = { open: Colors.green, 'in-progress': Colors.gold, complete: Colors.textMuted }[project.status];
  const spots = project.maxMembers - project.memberCount;
  return (
    <View style={[styles.projectCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.projectHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.projectTitle}>{project.title}</Text>
          <Text style={styles.projectField}>{project.field} · {project.level}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '22' }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{project.status.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.projectDesc} numberOfLines={3}>{project.description}</Text>
      <View style={styles.projectMeta}>
        <Text style={styles.projectMetaText}>👥 {project.memberCount}/{project.maxMembers} members</Text>
        {project.portfolioPush && <Text style={styles.portfolioBadge}>🏆 Portfolio push on complete</Text>}
      </View>
      {project.status === 'open' && spots > 0 && !project.isJoined && (
        <TouchableOpacity style={styles.joinBtn} onPress={() => onJoin(project.id)}>
          <Text style={styles.joinBtnText}>Join Project ({spots} spots left)</Text>
        </TouchableOpacity>
      )}
      {project.isJoined && (
        <View style={[styles.joinBtn, styles.joinBtnJoined]}>
          <Text style={styles.joinBtnTextJoined}>✓ You're in this project</Text>
        </View>
      )}
    </View>
  );
}

function PostCard({ post, onLike }: { post: Post; onLike: (id: string) => void }) {
  return (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Text style={styles.postAvatar}>{post.avatarEmoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.postAuthor}>{post.author}</Text>
          <Text style={styles.postTime}>{new Date(post.createdAt).toLocaleDateString()}</Text>
        </View>
        <View style={styles.fieldPill}>
          <Text style={styles.fieldPillText}>{post.field}</Text>
        </View>
      </View>
      <Text style={styles.postContent}>{post.content}</Text>
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.postAction} onPress={() => onLike(post.id)}>
          <Text style={[styles.postActionText, post.isLiked && { color: Colors.red }]}>
            {post.isLiked ? '❤️' : '🤍'} {post.likes}
          </Text>
        </TouchableOpacity>
        <Text style={styles.postAction}>
          <Text style={styles.postActionText}>💬 {post.replies}</Text>
        </Text>
      </View>
    </View>
  );
}

export default function GuildScreen() {
  const { colors, isDark } = useTheme();
  const isWebWide = useIsWebWide();
  const [tab, setTab] = useState<GuildTab>('my-guild');
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [projects, setProjects] = useState<GroupProject[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, [tab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (tab === 'discover' || tab === 'my-guild') {
        const data = await offlineRead('guilds', () => API.getGuilds(), 30 * 60 * 1000);
        setGuilds(data ?? []);
        const postData = await offlineRead('guild_posts', () => Promise.resolve([]), 5 * 60 * 1000);
        setPosts(postData as Post[] ?? []);
      }
      if (tab === 'projects') {
        const data = await offlineRead('group_projects', () => Promise.resolve([]), 10 * 60 * 1000);
        setProjects(data as GroupProject[] ?? []);
      }
    } catch { /* offline — show cached */ } finally { setLoading(false); }
  };

  const joinGuild = async (id: string) => {
    setGuilds(prev => prev.map(g => g.id === id ? { ...g, isJoined: true, memberCount: g.memberCount + 1 } : g));
    await offlineWrite('/api/guilds/join', 'POST', { guildId: id }, 'high');
  };

  const joinProject = async (id: string) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, isJoined: true, memberCount: p.memberCount + 1 } : p));
    await offlineWrite('/api/projects/join', 'POST', { projectId: id }, 'high');
  };

  const likePost = async (id: string) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 } : p));
    await offlineWrite('/api/posts/like', 'POST', { postId: id }, 'normal');
  };

  const submitPost = async () => {
    if (!newPost.trim()) return;
    const optimistic: Post = {
      id: `post_${Date.now()}`,
      author: 'You',
      avatarEmoji: '⚡',
      content: newPost.trim(),
      likes: 0, replies: 0,
      createdAt: new Date().toISOString(),
      field: 'general',
      isLiked: false,
    };
    setPosts(prev => [optimistic, ...prev]);
    setNewPost('');
    await offlineWrite('/api/posts', 'POST', { content: optimistic.content }, 'normal');
  };

  const myGuild    = guilds.find(g => g.isJoined);
  const otherGuilds = guilds.filter(g => !g.isJoined);

  // ── WEB LAYOUT ──────────────────────────────────────────────────────────────
  if (isWebWide) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
        <WebShell>
          <WebPageHeader
            title="👥 Community"
            subtitle="Guilds · Group Projects · Discussions"
            accentColor={colors.accent}
          />

          <WebRow>
            {/* Left: My Guild panel */}
            <WebCol weight={1}>
              <WebCard title="My Guild" accentBar accentColor={colors.accent}>
                {myGuild ? (
                  <>
                    <View style={{ alignItems: 'center', paddingVertical: 12 }}>
                      <Text style={{ fontSize: 40 }}>{myGuild.emoji}</Text>
                      <Text style={[styles.myGuildName, { color: colors.text, textAlign: 'center', marginTop: 8 }]}>{myGuild.name}</Text>
                      <Text style={[styles.myGuildRank, { color: colors.textMuted, textAlign: 'center' }]}>
                        Global #{myGuild.rank} · {myGuild.weeklyXp.toLocaleString()} XP this week
                      </Text>
                    </View>
                    <WebDivider />
                    <WebStatTile emoji="👥" label="Members" value={`${myGuild.memberCount}`} color={colors.accent} />
                    <WebStatTile emoji="⚡" label="Weekly XP" value={myGuild.weeklyXp.toLocaleString()} color={colors.xpGreen} />
                    <WebStatTile emoji="🏆" label="Global Rank" value={`#${myGuild.rank}`} color={colors.gold} />
                  </>
                ) : (
                  <View style={{ alignItems: 'center', paddingVertical: 24, gap: 12 }}>
                    <Text style={{ fontSize: 36 }}>🛡️</Text>
                    <Text style={{ color: colors.textSoft, fontSize: 14, textAlign: 'center' }}>
                      You haven't joined a guild yet.
                    </Text>
                    <TouchableOpacity
                      style={[{ backgroundColor: colors.accent, borderRadius: 20, paddingHorizontal: 20, paddingVertical: 10 }]}
                      onPress={() => setTab('discover')}
                    >
                      <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 13 }}>Find Your Guild →</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </WebCard>

              {/* Post composer */}
              <WebCard title="Share With Guild" accentBar accentColor={colors.green} style={{ marginTop: 20 }}>
                <TextInput
                  style={[styles.postInput, {
                    backgroundColor: colors.bgSecondary,
                    color: colors.text,
                    borderColor: colors.border,
                    borderWidth: 1,
                    borderRadius: Radius.md,
                    padding: 12,
                    minHeight: 80,
                    fontSize: FontSize.sm,
                  }]}
                  value={newPost}
                  onChangeText={setNewPost}
                  placeholder="Share a win, ask a question…"
                  placeholderTextColor={colors.textMuted}
                  multiline
                />
                <TouchableOpacity
                  style={[{
                    backgroundColor: newPost.trim() ? colors.accent : colors.bgSecondary,
                    borderRadius: Radius.md,
                    padding: 12,
                    marginTop: 10,
                    alignItems: 'center',
                  }]}
                  onPress={submitPost}
                  disabled={!newPost.trim()}
                >
                  <Text style={{ color: newPost.trim() ? '#FFF' : colors.textMuted, fontWeight: '700', fontSize: 13 }}>Post</Text>
                </TouchableOpacity>
              </WebCard>
            </WebCol>

            {/* Right: Content area */}
            <WebCol weight={2}>
              {/* Sub-tabs */}
              <View style={[styles.tabBar, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: Radius.lg, marginBottom: 20 }]}>
                {(['my-guild', 'discover', 'projects', 'members'] as GuildTab[]).map(t => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.tabBtn, tab === t && { backgroundColor: colors.accent, borderRadius: Radius.md }]}
                    onPress={() => setTab(t)}
                  >
                    <Text style={[styles.tabLabel, { color: tab === t ? '#FFF' : colors.textSoft }]}>
                      {t === 'my-guild' ? 'Feed' : t === 'discover' ? 'Discover' : t === 'projects' ? 'Projects' : 'Members'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {loading ? (
                <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                  <ActivityIndicator color={colors.accent} />
                </View>
              ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                  {tab === 'my-guild' && (
                    <>
                      {posts.length === 0 ? (
                        <WebCard>
                          <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                            <Text style={{ fontSize: 32 }}>💬</Text>
                            <Text style={{ color: colors.textSoft, marginTop: 8 }}>No posts yet. Start the conversation.</Text>
                          </View>
                        </WebCard>
                      ) : (
                        posts.map(post => <PostCard key={post.id} post={post} onLike={likePost} />)
                      )}
                    </>
                  )}
                  {tab === 'discover' && (
                    <>
                      <WebSectionLabel label="Top Guilds This Week" />
                      {otherGuilds.map(g => <GuildCard key={g.id} guild={g} onJoin={joinGuild} />)}
                    </>
                  )}
                  {tab === 'projects' && (
                    <>
                      <WebSectionLabel label="Group Projects" action="Browse All" />
                      {projects.map(p => <ProjectCard key={p.id} project={p} onJoin={joinProject} />)}
                    </>
                  )}
                  {tab === 'members' && (
                    <WebCard>
                      <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                        <Text style={{ fontSize: 32 }}>👥</Text>
                        <Text style={{ color: colors.textSoft, marginTop: 8 }}>Join a guild to see members.</Text>
                      </View>
                    </WebCard>
                  )}
                  <View style={{ height: 40 }} />
                </ScrollView>
              )}
            </WebCol>
          </WebRow>
        </WebShell>
      </SafeAreaView>
    );
  }

  // ── MOBILE LAYOUT ────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={styles.headerTitle}>👥 Community</Text>
        <Text style={styles.headerSub}>Learn with others. Compete. Collaborate.</Text>
      </View>

      <View style={[styles.tabBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {(['my-guild', 'discover', 'projects', 'members'] as GuildTab[]).map(t => (
          <TouchableOpacity key={t} style={[styles.tabBtn, tab === t && styles.tabBtnActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabLabel, tab === t && styles.tabLabelActive]}>
              {t === 'my-guild' ? 'My Guild' : t === 'discover' ? 'Discover' : t === 'projects' ? 'Projects' : 'Members'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingView}><ActivityIndicator color={Colors.accent} /></View>
      ) : (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

          {tab === 'my-guild' && (
            <>
              {myGuild ? (
                <View style={styles.myGuildHero}>
                  <Text style={styles.myGuildEmoji}>{myGuild.emoji}</Text>
                  <Text style={styles.myGuildName}>{myGuild.name}</Text>
                  <Text style={styles.myGuildRank}>Global rank #{myGuild.rank} · {myGuild.weeklyXp.toLocaleString()} XP this week</Text>
                </View>
              ) : (
                <View style={styles.noGuildBanner}>
                  <Text style={styles.noGuildText}>You haven't joined a guild yet.</Text>
                  <TouchableOpacity onPress={() => setTab('discover')}>
                    <Text style={styles.noGuildCta}>Find your guild →</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.postComposer}>
                <TextInput
                  style={styles.postInput}
                  value={newPost}
                  onChangeText={setNewPost}
                  placeholder="Share a win, ask a question, or start a discussion..."
                  placeholderTextColor={Colors.textMuted}
                  multiline
                />
                <TouchableOpacity
                  style={[styles.postBtn, !newPost.trim() && styles.postBtnDisabled]}
                  onPress={submitPost}
                  disabled={!newPost.trim()}
                >
                  <Text style={styles.postBtnText}>Post</Text>
                </TouchableOpacity>
              </View>

              {posts.map(post => <PostCard key={post.id} post={post} onLike={likePost} />)}
            </>
          )}

          {tab === 'discover' && (
            <>
              <Text style={styles.sectionHead}>Top Guilds This Week</Text>
              {otherGuilds.map(g => <GuildCard key={g.id} guild={g} onJoin={joinGuild} />)}
            </>
          )}

          {tab === 'projects' && (
            <>
              <Text style={styles.sectionHead}>Open Group Projects</Text>
              <Text style={styles.sectionSub}>
                Work together on real projects. Complete them to push to your portfolio as a team.
              </Text>
              {projects.map(p => <ProjectCard key={p.id} project={p} onJoin={joinProject} />)}
            </>
          )}

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
  headerSub: { fontSize: FontSize.xs, color: Colors.textSoft, marginTop: 2 },
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Colors.border },
  tabBtn: { flex: 1, paddingVertical: Spacing.sm, alignItems: 'center' },
  tabBtnActive: { borderBottomWidth: 2, borderBottomColor: Colors.accent },
  tabLabel: { fontSize: 11, fontWeight: '600', color: Colors.textSoft },
  tabLabelActive: { color: Colors.accent, fontWeight: '800' },
  scroll: { flex: 1 },
  loadingView: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  myGuildHero: { backgroundColor: Colors.accent, padding: Spacing.xl, alignItems: 'center' },
  myGuildEmoji: { fontSize: 40, marginBottom: Spacing.sm },
  myGuildName: { fontSize: FontSize.xl, fontWeight: '900', color: '#fff', marginBottom: 4 },
  myGuildRank: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.8)' },
  noGuildBanner: { padding: Spacing.xl, alignItems: 'center', backgroundColor: Colors.accentSoft, margin: Spacing.md, borderRadius: Radius.md },
  noGuildText: { fontSize: FontSize.sm, color: Colors.text, marginBottom: Spacing.sm },
  noGuildCta: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.accent },

  postComposer: { margin: Spacing.md, backgroundColor: '#fff', borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm },
  postInput: { fontSize: FontSize.sm, color: Colors.text, minHeight: 60, marginBottom: Spacing.sm },
  postBtn: { backgroundColor: Colors.accent, borderRadius: Radius.sm, padding: Spacing.sm, alignSelf: 'flex-end', paddingHorizontal: Spacing.lg },
  postBtnDisabled: { opacity: 0.4 },
  postBtnText: { color: '#fff', fontWeight: '800', fontSize: FontSize.sm },

  postCard: { backgroundColor: '#fff', marginHorizontal: Spacing.md, marginBottom: Spacing.sm, borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  postHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  postAvatar: { fontSize: 28 },
  postAuthor: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.text },
  postTime: { fontSize: FontSize.xs, color: Colors.textMuted },
  fieldPill: { backgroundColor: Colors.accentSoft, borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 2 },
  fieldPillText: { fontSize: 10, color: Colors.accent, fontWeight: '700' },
  postContent: { fontSize: FontSize.sm, color: Colors.text, lineHeight: 20, marginBottom: Spacing.sm },
  postActions: { flexDirection: 'row', gap: Spacing.lg },
  postAction: {},
  postActionText: { fontSize: FontSize.sm, color: Colors.textSoft },

  sectionHead: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.text, padding: Spacing.lg, paddingBottom: Spacing.sm },
  sectionSub: { fontSize: FontSize.sm, color: Colors.textSoft, paddingHorizontal: Spacing.lg, marginBottom: Spacing.md, lineHeight: 20 },

  guildCard: { backgroundColor: '#fff', margin: Spacing.md, marginTop: 0, borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm },
  guildHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  guildEmoji: { fontSize: 32 },
  guildName: { fontSize: FontSize.md, fontWeight: '800', color: Colors.text },
  guildField: { fontSize: FontSize.xs, color: Colors.textSoft },
  guildRankBadge: { backgroundColor: Colors.goldSoft, borderRadius: Radius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 2 },
  guildRankText: { fontSize: FontSize.xs, fontWeight: '800', color: Colors.gold },
  guildDesc: { fontSize: FontSize.sm, color: Colors.textSoft, lineHeight: 18, marginBottom: Spacing.sm },
  guildStats: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  guildStat: { fontSize: FontSize.xs, color: Colors.textSoft },
  joinBtn: { backgroundColor: Colors.accent, borderRadius: Radius.md, padding: Spacing.sm, alignItems: 'center' },
  joinBtnJoined: { backgroundColor: Colors.greenSoft, borderWidth: 1, borderColor: Colors.green },
  joinBtnText: { color: '#fff', fontWeight: '800', fontSize: FontSize.sm },
  joinBtnTextJoined: { color: Colors.green, fontWeight: '800', fontSize: FontSize.sm },

  projectCard: { backgroundColor: '#fff', margin: Spacing.md, marginTop: 0, borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm },
  projectHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginBottom: Spacing.sm },
  projectTitle: { fontSize: FontSize.md, fontWeight: '800', color: Colors.text },
  projectField: { fontSize: FontSize.xs, color: Colors.textSoft },
  statusBadge: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  statusText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  projectDesc: { fontSize: FontSize.sm, color: Colors.textSoft, lineHeight: 18, marginBottom: Spacing.sm },
  projectMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  projectMetaText: { fontSize: FontSize.xs, color: Colors.textSoft },
  portfolioBadge: { fontSize: FontSize.xs, color: Colors.gold, fontWeight: '700' },
});
