/**
 * CommunityScreen — Sifter Skill_Up social layer.
 *
 * Tabs: Following · Discover · Search · Notifications · DMs
 *
 * Features:
 *  - Realtime feed (Supabase channels) — new posts, live reaction counts
 *  - Cursor-based infinite scroll — scales to millions
 *  - Following feed + Discover (trending by field/track)
 *  - @mentions, #hashtags with coloured highlights
 *  - 6 reaction types (not just a single like)
 *  - Polls with live vote counts
 *  - Image attachments (portfolio artifacts auto-attach)
 *  - Quote posts
 *  - Bookmark with folders
 *  - Report / Block / Mute
 *  - Private accounts — follow request gated
 *  - DM inbox: YOU open it. Others cannot initiate contact with you.
 *  - Search posts and hashtags
 *  - Trending topics by field
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput,
  SafeAreaView, KeyboardAvoidingView, Platform, Modal, Share,
  ActivityIndicator, ScrollView, Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../theme';
import {
  useCommunity, useDMs,
  REACTIONS, highlightContent, parseContent,
  type Post, type Comment, type ReactionType, type Notification, type Author,
} from '../hooks/useCommunity';
import { useAuth } from '../hooks/useAuth';
import DisclaimerFooter from '../components/DisclaimerFooter';

type MainTab = 'feed' | 'discover' | 'search' | 'notifications' | 'dms';

// ── Highlighted text (mentions / hashtags) ────────────────────────────────────

function RichText({ text, style }: { text: string; style?: object }) {
  const parts = highlightContent(text);
  return (
    <Text style={style}>
      {parts.map((p, i) => (
        <Text key={i} style={
          p.type === 'mention' ? rt.mention :
          p.type === 'hashtag' ? rt.hashtag : undefined
        }>{p.text}</Text>
      ))}
    </Text>
  );
}
const rt = StyleSheet.create({
  mention: { color: '#6366f1', fontWeight: '700' },
  hashtag: { color: '#0ea5e9', fontWeight: '600' },
});

// ── Reaction bar ──────────────────────────────────────────────────────────────

function ReactionBar({ reactions, myReaction, onReact }: {
  reactions: Partial<Record<ReactionType, number>>;
  myReaction?: ReactionType;
  onReact: (r: ReactionType) => void;
}) {
  const [showPicker, setShowPicker] = useState(false);
  const total = Object.values(reactions).reduce((a, b) => a + (b ?? 0), 0);
  const topReaction = Object.entries(reactions).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))[0];

  return (
    <View style={rb.row}>
      <TouchableOpacity
        style={[rb.reactBtn, myReaction && { backgroundColor: Colors.accent + '18' }]}
        onPress={() => setShowPicker(!showPicker)}
        onLongPress={() => setShowPicker(true)}
      >
        <Text style={rb.reactIcon}>{myReaction ?? '🤍'}</Text>
        {total > 0 && <Text style={rb.reactCount}>{total}</Text>}
        {topReaction && !myReaction && total > 0 && (
          <Text style={rb.topReaction}>{topReaction[0]}</Text>
        )}
      </TouchableOpacity>

      {showPicker && (
        <View style={rb.picker}>
          {REACTIONS.map(r => (
            <TouchableOpacity key={r} style={rb.pickerBtn} onPress={() => { onReact(r); setShowPicker(false); }}>
              <Text style={[rb.pickerIcon, myReaction === r && rb.pickerIconActive]}>{r}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const rb = StyleSheet.create({
  row:            { flexDirection: 'row', alignItems: 'center', gap: 4, position: 'relative' },
  reactBtn:       { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: Colors.border },
  reactIcon:      { fontSize: 14 },
  reactCount:     { fontSize: 12, color: Colors.textSoft, fontWeight: '700' },
  topReaction:    { fontSize: 12 },
  picker:         { position: 'absolute', bottom: 36, left: 0, flexDirection: 'row', backgroundColor: '#fff', borderRadius: 28, padding: 6, gap: 2, borderWidth: 1, borderColor: Colors.border, zIndex: 99, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12 }, android: { elevation: 8 } }) },
  pickerBtn:      { padding: 6 },
  pickerIcon:     { fontSize: 22 },
  pickerIconActive: { transform: [{ scale: 1.3 }] },
});

// ── Poll block ────────────────────────────────────────────────────────────────

function PollBlock({ poll, onVote }: { poll: NonNullable<Post['poll']>; onVote: (optionId: string) => void }) {
  const hasVoted = !!poll.votedId;
  return (
    <View style={pb.wrap}>
      <Text style={pb.question}>{poll.question}</Text>
      {poll.options.map(opt => {
        const pct = poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0;
        const isVoted = poll.votedId === opt.id;
        return (
          <TouchableOpacity key={opt.id} onPress={() => !hasVoted && onVote(opt.id)} activeOpacity={hasVoted ? 1 : 0.8}
            style={[pb.option, isVoted && pb.optionVoted]}>
            {hasVoted && <View style={[pb.bar, { width: `${pct}%` as any }]} />}
            <Text style={[pb.optText, isVoted && { fontWeight: '800' }]}>{opt.text}</Text>
            {hasVoted && <Text style={pb.pct}>{pct}%</Text>}
          </TouchableOpacity>
        );
      })}
      <Text style={pb.total}>{poll.totalVotes} votes</Text>
    </View>
  );
}
const pb = StyleSheet.create({
  wrap:        { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.lg, padding: Spacing.md, gap: 8 },
  question:    { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  option:      { position: 'relative', borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md, padding: 10, overflow: 'hidden', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  optionVoted: { borderColor: Colors.accent },
  bar:         { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: Colors.accent + '22' },
  optText:     { fontSize: 13, color: Colors.text },
  pct:         { fontSize: 12, color: Colors.accent, fontWeight: '700' },
  total:       { fontSize: 11, color: Colors.textSoft, fontWeight: '600' },
});

// ── Post card ─────────────────────────────────────────────────────────────────

function PostCard({ post, onReact, onComment, onQuote, onBookmark, onShare, onAuthorPress, onVote, onReport, onBlock, onMute }: {
  post: Post;
  onReact: (id: string, r: ReactionType) => void;
  onComment: (post: Post) => void;
  onQuote: (post: Post) => void;
  onBookmark: (id: string) => void;
  onShare: (post: Post) => void;
  onAuthorPress: (author: Author) => void;
  onVote: (postId: string, optionId: string) => void;
  onReport: (id: string) => void;
  onBlock: (userId: string) => void;
  onMute: (userId: string) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const totalReactions = Object.values(post.reactions).reduce((a, b) => a + (b ?? 0), 0);

  return (
    <View style={pc.card}>
      {post.isPinned && <View style={pc.pinnedBar}><Text style={pc.pinnedText}>📌 Pinned</Text></View>}

      {/* Author row */}
      <TouchableOpacity style={pc.authorRow} onPress={() => onAuthorPress(post.author)}>
        <View style={pc.avatar}><Text style={pc.avatarText}>{post.author.avatar}</Text></View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={pc.name}>{post.author.name}</Text>
            {post.author.isPrivate && <Text style={{ fontSize: 10 }}>🔒</Text>}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {post.author.track && <Text style={pc.trackPill}>{post.author.track}</Text>}
            <Text style={pc.time}>{formatTime(post.createdAt)}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => setShowMenu(!showMenu)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={pc.menuDot}>···</Text>
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Context menu */}
      {showMenu && (
        <View style={pc.menu}>
          {[
            { label: '🚩 Report', action: () => { onReport(post.id); setShowMenu(false); } },
            { label: '🔇 Mute @' + post.author.name, action: () => { onMute(post.author.id); setShowMenu(false); } },
            { label: '🚫 Block @' + post.author.name, action: () => { onBlock(post.author.id); setShowMenu(false); } },
            { label: '✕ Close', action: () => setShowMenu(false) },
          ].map((item, i) => (
            <TouchableOpacity key={i} style={pc.menuItem} onPress={item.action}>
              <Text style={[pc.menuItemText, item.label.includes('Block') && { color: '#ef4444' }]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Quoted post */}
      {post.quotedPost && (
        <View style={pc.quoted}>
          <Text style={pc.quotedAuthor}>{post.quotedPost.author.avatar} {post.quotedPost.author.name}</Text>
          <Text style={pc.quotedContent} numberOfLines={2}>{post.quotedPost.content}</Text>
        </View>
      )}

      {/* Content */}
      <RichText text={post.content} style={pc.content} />

      {/* Image attachment */}
      {post.attachments?.filter(a => a.type === 'image').map((att, i) => (
        <View key={i} style={pc.imageBox}>
          <Text style={{ fontSize: 40 }}>🖼️</Text>
        </View>
      ))}

      {/* Portfolio artifact */}
      {post.attachments?.filter(a => a.type === 'portfolio').map((att, i) => (
        <View key={i} style={pc.artifactCard}>
          <Text style={pc.artifactIcon}>🏆</Text>
          <View style={{ flex: 1 }}>
            <Text style={pc.artifactTitle}>{att.title}</Text>
            {att.badgeEarned && <Text style={pc.artifactBadge}>{att.badgeEarned}</Text>}
            {att.trackName && <Text style={pc.artifactTrack}>{att.trackName}</Text>}
          </View>
          <Text style={pc.artifactVerified}>✓ Verified</Text>
        </View>
      ))}

      {/* Poll */}
      {post.poll && <PollBlock poll={post.poll} onVote={optId => onVote(post.id, optId)} />}

      {/* Hashtags */}
      {post.hashtags.length > 0 && (
        <View style={pc.tagsRow}>
          {post.hashtags.slice(0, 4).map(h => (
            <Text key={h} style={pc.tag}>#{h}</Text>
          ))}
        </View>
      )}

      {/* Action bar */}
      <View style={pc.actions}>
        <ReactionBar reactions={post.reactions} myReaction={post.myReaction} onReact={r => onReact(post.id, r)} />

        <TouchableOpacity style={pc.action} onPress={() => onComment(post)}>
          <Text style={pc.actionIcon}>💬</Text>
          {post.comments > 0 && <Text style={pc.actionCount}>{post.comments}</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={pc.action} onPress={() => onQuote(post)}>
          <Text style={pc.actionIcon}>🔁</Text>
          {post.quotes > 0 && <Text style={pc.actionCount}>{post.quotes}</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={pc.action} onPress={() => onBookmark(post.id)}>
          <Text style={pc.actionIcon}>{post.isBookmarked ? '🔖' : '📎'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={pc.action} onPress={() => onShare(post)}>
          <Text style={pc.actionIcon}>↗</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const pc = StyleSheet.create({
  card:          { backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  pinnedBar:     { backgroundColor: '#f0f4ff', borderRadius: Radius.sm, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 8 },
  pinnedText:    { fontSize: 11, color: Colors.accent, fontWeight: '700' },
  authorRow:     { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  avatar:        { width: 38, height: 38, borderRadius: 19, backgroundColor: '#f0f4ff', alignItems: 'center', justifyContent: 'center' },
  avatarText:    { fontSize: 20 },
  name:          { fontSize: FontSize.sm, fontWeight: '800', color: Colors.text },
  trackPill:     { fontSize: 10, color: Colors.accent, fontWeight: '700', backgroundColor: Colors.accent + '15', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  time:          { fontSize: 11, color: Colors.textSoft },
  menuDot:       { fontSize: 18, color: Colors.textSoft, letterSpacing: 1 },
  menu:          { position: 'absolute', right: Spacing.lg, top: 48, backgroundColor: '#fff', borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, zIndex: 99, minWidth: 180, ...Shadow.md },
  menuItem:      { paddingHorizontal: Spacing.md, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  menuItemText:  { fontSize: FontSize.sm, color: Colors.text, fontWeight: '600' },
  quoted:        { borderLeftWidth: 3, borderLeftColor: Colors.border, paddingLeft: 12, marginBottom: 8, backgroundColor: '#f8fafc', borderRadius: Radius.sm, padding: 8 },
  quotedAuthor:  { fontSize: 12, fontWeight: '700', color: Colors.textSoft, marginBottom: 2 },
  quotedContent: { fontSize: 12, color: Colors.textSoft },
  content:       { fontSize: FontSize.sm, color: Colors.text, lineHeight: 22, marginBottom: 8 },
  imageBox:      { height: 200, backgroundColor: '#f1f5f9', borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  artifactCard:  { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#f0fdf4', borderRadius: Radius.md, padding: 10, borderWidth: 1, borderColor: '#bbf7d0', marginBottom: 8 },
  artifactIcon:  { fontSize: 24 },
  artifactTitle: { fontSize: 13, fontWeight: '700', color: Colors.text },
  artifactBadge: { fontSize: 11, color: Colors.green, fontWeight: '600' },
  artifactTrack: { fontSize: 11, color: Colors.textSoft },
  artifactVerified: { fontSize: 10, color: Colors.green, fontWeight: '800' },
  tagsRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  tag:           { fontSize: 12, color: '#0ea5e9', fontWeight: '600' },
  actions:       { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 4 },
  action:        { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionIcon:    { fontSize: 16, color: Colors.textSoft },
  actionCount:   { fontSize: 12, color: Colors.textSoft, fontWeight: '700' },
});

// ── Compose sheet ─────────────────────────────────────────────────────────────

function ComposeSheet({ onClose, onPost, quotedPost }: {
  onClose: () => void;
  onPost: (params: { content: string; quotedPostId?: string; poll?: any }) => void;
  quotedPost?: Post;
}) {
  const [text, setText] = useState('');
  const [showPoll, setShowPoll] = useState(false);
  const [pollQ, setPollQ] = useState('');
  const [pollOpts, setPollOpts] = useState(['', '']);
  const chars = text.length;
  const MAX = 280;

  const submit = () => {
    if (!text.trim()) return;
    const poll = showPoll && pollQ.trim() && pollOpts.filter(o => o.trim()).length >= 2
      ? { question: pollQ, options: pollOpts.filter(o => o.trim()) }
      : undefined;
    onPost({ content: text.trim(), quotedPostId: quotedPost?.id, poll });
    onClose();
  };

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={cs.header}>
            <TouchableOpacity onPress={onClose}><Text style={cs.cancel}>Cancel</Text></TouchableOpacity>
            <Text style={cs.title}>{quotedPost ? 'Quote Post' : 'New Post'}</Text>
            <TouchableOpacity onPress={submit} disabled={!text.trim() || chars > MAX} style={[cs.postBtn, (!text.trim() || chars > MAX) && { opacity: 0.4 }]}>
              <Text style={cs.postBtnText}>Post</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: Spacing.lg }}>
            <TextInput
              style={cs.input}
              value={text} onChangeText={setText}
              placeholder="Share a win, ask a question, or start a discussion... Use @name or #topic"
              placeholderTextColor={Colors.textSoft}
              multiline autoFocus
            />

            {quotedPost && (
              <View style={pc.quoted}>
                <Text style={pc.quotedAuthor}>{quotedPost.author.avatar} {quotedPost.author.name}</Text>
                <Text style={pc.quotedContent} numberOfLines={2}>{quotedPost.content}</Text>
              </View>
            )}

            {showPoll && (
              <View style={cs.pollBox}>
                <TextInput style={cs.pollInput} value={pollQ} onChangeText={setPollQ}
                  placeholder="Poll question..." placeholderTextColor={Colors.textSoft} />
                {pollOpts.map((opt, i) => (
                  <TextInput key={i} style={cs.pollOptInput} value={opt}
                    onChangeText={v => { const a = [...pollOpts]; a[i] = v; setPollOpts(a); }}
                    placeholder={`Option ${i + 1}...`} placeholderTextColor={Colors.textSoft} />
                ))}
                {pollOpts.length < 4 && (
                  <TouchableOpacity onPress={() => setPollOpts(prev => [...prev, ''])}>
                    <Text style={cs.addOpt}>+ Add option</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            <View style={cs.toolbar}>
              <TouchableOpacity onPress={() => setShowPoll(!showPoll)} style={[cs.toolBtn, showPoll && cs.toolBtnActive]}>
                <Text style={cs.toolIcon}>📊</Text>
              </TouchableOpacity>
              <View style={{ flex: 1 }} />
              <Text style={[cs.charCount, chars > MAX && { color: '#ef4444' }]}>{MAX - chars}</Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const cs = StyleSheet.create({
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  cancel:      { fontSize: FontSize.sm, color: Colors.textSoft, fontWeight: '600' },
  title:       { fontSize: FontSize.sm, fontWeight: '800', color: Colors.text },
  postBtn:     { backgroundColor: Colors.accent, borderRadius: Radius.full, paddingHorizontal: 16, paddingVertical: 7 },
  postBtnText: { color: '#fff', fontSize: FontSize.sm, fontWeight: '800' },
  input:       { fontSize: FontSize.md, color: Colors.text, lineHeight: 24, minHeight: 100 },
  pollBox:     { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.lg, padding: Spacing.md, gap: 8 },
  pollInput:   { fontSize: FontSize.sm, color: Colors.text, fontWeight: '700', paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: Colors.border },
  pollOptInput:{ fontSize: FontSize.sm, color: Colors.text, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, padding: 8 },
  addOpt:      { fontSize: 13, color: Colors.accent, fontWeight: '700' },
  toolbar:     { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.md, gap: 12 },
  toolBtn:     { padding: 8, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border },
  toolBtnActive: { backgroundColor: Colors.accent + '15', borderColor: Colors.accent },
  toolIcon:    { fontSize: 18 },
  charCount:   { fontSize: 12, color: Colors.textSoft, fontWeight: '700' },
});

// ── Comment sheet ─────────────────────────────────────────────────────────────

function CommentSheet({ post, onClose }: { post: Post; onClose: () => void }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!text.trim()) return;
    const c: Comment = {
      id: `c_${Date.now()}`, author: { id: 'me', name: 'You', avatar: '⚡' },
      content: text.trim(), reactions: {}, createdAt: new Date().toISOString(),
    };
    setComments(prev => [c, ...prev]);
    setText('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }}>
        <View style={cs.header}>
          <TouchableOpacity onPress={onClose}><Text style={cs.cancel}>✕</Text></TouchableOpacity>
          <Text style={cs.title}>Comments</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={cmt.originalBox}>
          <Text style={cmt.originalAuthor}>{post.author.avatar} {post.author.name}</Text>
          <Text style={cmt.originalContent} numberOfLines={2}>{post.content}</Text>
        </View>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <FlatList
            data={comments}
            keyExtractor={c => c.id}
            contentContainerStyle={{ padding: Spacing.md, paddingBottom: 20 }}
            renderItem={({ item: c }) => (
              <View style={cmt.row}>
                <View style={pc.avatar}><Text style={pc.avatarText}>{c.author.avatar}</Text></View>
                <View style={cmt.bubble}>
                  <Text style={cmt.author}>{c.author.name}</Text>
                  <RichText text={c.content} style={cmt.content} />
                  <Text style={cmt.time}>{formatTime(c.createdAt)}</Text>
                </View>
              </View>
            )}
            ListEmptyComponent={<Text style={{ color: Colors.textSoft, textAlign: 'center', marginTop: 40 }}>No comments yet. Be the first.</Text>}
          />
          <View style={cmt.inputRow}>
            <TextInput style={cmt.input} value={text} onChangeText={setText}
              placeholder="Write a comment... @mention or #topic"
              placeholderTextColor={Colors.textSoft} multiline />
            <TouchableOpacity style={[cmt.sendBtn, !text.trim() && { opacity: 0.4 }]} onPress={submit} disabled={!text.trim()}>
              <Text style={cmt.sendText}>↑</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const cmt = StyleSheet.create({
  originalBox:    { padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', backgroundColor: '#f8fafc' },
  originalAuthor: { fontSize: 12, fontWeight: '700', color: Colors.textSoft, marginBottom: 2 },
  originalContent:{ fontSize: FontSize.sm, color: Colors.text },
  row:            { flexDirection: 'row', gap: 10, marginBottom: 14 },
  bubble:         { flex: 1, backgroundColor: '#f8fafc', borderRadius: Radius.lg, padding: Spacing.md },
  author:         { fontSize: 12, fontWeight: '800', color: Colors.text, marginBottom: 2 },
  content:        { fontSize: FontSize.sm, color: Colors.text, lineHeight: 20 },
  time:           { fontSize: 10, color: Colors.textSoft, marginTop: 4 },
  inputRow:       { flexDirection: 'row', alignItems: 'flex-end', gap: 8, padding: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.border },
  input:          { flex: 1, backgroundColor: '#f8fafc', borderRadius: Radius.xl, paddingHorizontal: 14, paddingVertical: 10, fontSize: FontSize.sm, color: Colors.text, maxHeight: 100 },
  sendBtn:        { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center' },
  sendText:       { color: '#fff', fontSize: 16, fontWeight: '900' },
});

// ── Trending & Discover tab ───────────────────────────────────────────────────

function DiscoverTab({ trending, feedPosts, onReact, onComment, onQuote, onBookmark, onShare, onVote, onReport, onBlock, onMute }: any) {
  return (
    <FlatList
      data={feedPosts}
      keyExtractor={p => p.id}
      ListHeaderComponent={
        trending.length > 0 ? (
          <View style={dt.trendingBox}>
            <Text style={dt.trendingTitle}>Trending now</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 8, paddingRight: Spacing.md }}>
                {trending.map((t: any) => (
                  <TouchableOpacity key={t.tag} style={dt.trendPill}>
                    <Text style={dt.trendTag}>#{t.tag}</Text>
                    <Text style={dt.trendCount}>{t.postCount} posts</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        ) : null
      }
      renderItem={({ item }) => (
        <PostCard post={item} onReact={onReact} onComment={onComment} onQuote={onQuote}
          onBookmark={onBookmark} onShare={onShare} onAuthorPress={() => {}} onVote={onVote}
          onReport={onReport} onBlock={onBlock} onMute={onMute} />
      )}
    />
  );
}

const dt = StyleSheet.create({
  trendingBox:  { padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  trendingTitle:{ fontSize: FontSize.sm, fontWeight: '900', color: Colors.text, marginBottom: 10 },
  trendPill:    { backgroundColor: '#f8fafc', borderRadius: Radius.lg, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: Colors.border },
  trendTag:     { fontSize: 13, color: '#0ea5e9', fontWeight: '700' },
  trendCount:   { fontSize: 10, color: Colors.textSoft, marginTop: 1 },
});

// ── Notifications tab ─────────────────────────────────────────────────────────

function NotifTab({ notifications, onRead }: { notifications: any[]; onRead: () => void }) {
  useEffect(() => { onRead(); }, []);
  const icon = (type: string) => ({ reaction: '❤️', comment: '💬', quote: '🔁', follow: '👤', follow_request: '👤🔒', mention: '@', poll_ended: '📊', guild_invite: '🏰' }[type] ?? '🔔');

  return (
    <FlatList
      data={notifications}
      keyExtractor={n => n.id}
      contentContainerStyle={{ paddingBottom: 40 }}
      renderItem={({ item: n }) => (
        <View style={[nt.row, !n.isRead && nt.rowUnread]}>
          <Text style={nt.icon}>{icon(n.type)}</Text>
          <View style={{ flex: 1 }}>
            <Text style={nt.text}>
              <Text style={{ fontWeight: '800' }}>{n.actor.name}</Text>
              {n.type === 'reaction' && ` reacted ${n.reaction} to your post`}
              {n.type === 'comment' && ' commented on your post'}
              {n.type === 'quote' && ' quoted your post'}
              {n.type === 'follow' && ' followed you'}
              {n.type === 'follow_request' && ' wants to follow you'}
              {n.type === 'mention' && ' mentioned you in a post'}
              {n.type === 'guild_invite' && ' invited you to a guild'}
            </Text>
            {n.postSnippet && <Text style={nt.snippet} numberOfLines={1}>"{n.postSnippet}"</Text>}
            <Text style={nt.time}>{formatTime(n.createdAt)}</Text>
          </View>
          {!n.isRead && <View style={nt.dot} />}
        </View>
      )}
      ListEmptyComponent={<Text style={{ color: Colors.textSoft, textAlign: 'center', marginTop: 60, fontSize: FontSize.sm }}>No notifications yet.</Text>}
    />
  );
}

const nt = StyleSheet.create({
  row:        { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
  rowUnread:  { backgroundColor: '#f0f4ff' },
  icon:       { fontSize: 22, width: 30, textAlign: 'center' },
  text:       { fontSize: FontSize.sm, color: Colors.text, lineHeight: 20 },
  snippet:    { fontSize: 12, color: Colors.textSoft, marginTop: 2 },
  time:       { fontSize: 11, color: Colors.textSoft, marginTop: 3 },
  dot:        { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.accent, marginTop: 6 },
});

// ── DM tab ────────────────────────────────────────────────────────────────────

function DMTab({ threads, onOpenThread, onNewDM }: { threads: any[]; onOpenThread: (t: any) => void; onNewDM: () => void }) {
  return (
    <View style={{ flex: 1 }}>
      <View style={dm.header}>
        <Text style={dm.headerTitle}>Messages</Text>
        <Text style={dm.headerSub}>Your inbox. Only you can start a conversation.</Text>
      </View>
      <FlatList
        data={threads}
        keyExtractor={t => t.id}
        renderItem={({ item: t }) => (
          <TouchableOpacity style={dm.thread} onPress={() => onOpenThread(t)}>
            <View style={pc.avatar}><Text style={pc.avatarText}>{t.participant.avatar}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={dm.threadName}>{t.participant.name}</Text>
              <Text style={dm.threadLast} numberOfLines={1}>{t.lastMessage}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 4 }}>
              <Text style={dm.threadTime}>{formatTime(t.lastAt)}</Text>
              {t.unread > 0 && <View style={dm.unread}><Text style={dm.unreadText}>{t.unread}</Text></View>}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', padding: Spacing.xxxl }}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>💬</Text>
            <Text style={{ fontSize: FontSize.md, fontWeight: '800', color: Colors.text, marginBottom: 6 }}>No messages yet</Text>
            <Text style={{ fontSize: FontSize.sm, color: Colors.textSoft, textAlign: 'center', lineHeight: 20 }}>
              Visit someone's profile to start a conversation.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const dm = StyleSheet.create({
  header:      { padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontSize: FontSize.lg, fontWeight: '900', color: Colors.text },
  headerSub:   { fontSize: 12, color: Colors.textSoft, marginTop: 2 },
  thread:      { flexDirection: 'row', alignItems: 'center', gap: 12, padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
  threadName:  { fontSize: FontSize.sm, fontWeight: '800', color: Colors.text },
  threadLast:  { fontSize: 12, color: Colors.textSoft, marginTop: 1 },
  threadTime:  { fontSize: 10, color: Colors.textSoft },
  unread:      { backgroundColor: Colors.accent, borderRadius: 10, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  unreadText:  { fontSize: 10, color: '#fff', fontWeight: '900' },
});

// ── Search tab ────────────────────────────────────────────────────────────────

function SearchTab({ query, setQuery, results, loading, onSearch, onReact, onComment, onQuote, onBookmark, onShare, onVote, onReport, onBlock, onMute }: any) {
  return (
    <View style={{ flex: 1 }}>
      <View style={sr.searchBox}>
        <Text style={sr.searchIcon}>🔍</Text>
        <TextInput
          style={sr.searchInput}
          value={query}
          onChangeText={q => { setQuery(q); if (q.length > 1) onSearch(q); }}
          placeholder="Search posts, #topics, @people..."
          placeholderTextColor={Colors.textSoft}
          returnKeyType="search"
          onSubmitEditing={() => onSearch(query)}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => { setQuery(''); }}>
            <Text style={{ color: Colors.textSoft, fontSize: 16 }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
      {loading && <ActivityIndicator color={Colors.accent} style={{ marginTop: 40 }} />}
      <FlatList
        data={results}
        keyExtractor={p => p.id}
        renderItem={({ item }) => (
          <PostCard post={item} onReact={onReact} onComment={onComment} onQuote={onQuote}
            onBookmark={onBookmark} onShare={onShare} onAuthorPress={() => {}} onVote={onVote}
            onReport={onReport} onBlock={onBlock} onMute={onMute} />
        )}
        ListEmptyComponent={!loading && query.length > 1 ? (
          <Text style={{ color: Colors.textSoft, textAlign: 'center', marginTop: 60 }}>No results for "{query}"</Text>
        ) : null}
      />
    </View>
  );
}

const sr = StyleSheet.create({
  searchBox:   { flexDirection: 'row', alignItems: 'center', gap: 10, margin: Spacing.md, backgroundColor: '#f1f5f9', borderRadius: Radius.xl, paddingHorizontal: 14, paddingVertical: 10 },
  searchIcon:  { fontSize: 16 },
  searchInput: { flex: 1, fontSize: FontSize.sm, color: Colors.text },
});

// ── Main screen ───────────────────────────────────────────────────────────────

export default function CommunityScreen() {
  const { user } = useAuth();
  const userId = user?.id ?? 'guest';
  const userTrack = user?.currentTrack;

  const {
    feed, feedMode, setFeedMode, loadMore, refresh,
    react, submitPost, votePoll, bookmark,
    reportPost, blockUser, muteUser,
    notifications, unreadCount, markNotificationsRead,
    trending,
    searchQuery, setSearchQuery, search, searchResults, searchLoading,
  } = useCommunity(userId, userTrack);

  const { threads, loadThreads } = useDMs(userId);

  const [tab, setTab] = useState<MainTab>('feed');
  const [commentTarget, setCommentTarget] = useState<Post | null>(null);
  const [quoteTarget, setQuoteTarget] = useState<Post | null>(null);
  const [showCompose, setShowCompose] = useState(false);

  useEffect(() => { if (tab === 'dms') loadThreads(); }, [tab]);

  const handleShare = useCallback(async (post: Post) => {
    try {
      await Share.share({
        message: `${post.author.name} on Sifter Skill_Up:\n\n"${post.content}"\n\nhttps://sifter.app`,
      });
    } catch {}
  }, []);

  const handleReport = useCallback((postId: string) => {
    Alert.alert('Report Post', 'Why are you reporting this?', [
      { text: 'Spam', onPress: () => reportPost(postId, 'spam') },
      { text: 'Misleading', onPress: () => reportPost(postId, 'misleading') },
      { text: 'Harmful content', onPress: () => reportPost(postId, 'harmful') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [reportPost]);

  const handleBlock = useCallback((userId: string) => {
    Alert.alert('Block User', 'They won\'t be able to see your posts or find your profile.', [
      { text: 'Block', style: 'destructive', onPress: () => blockUser(userId) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [blockUser]);

  const TABS: { key: MainTab; label: string; badge?: number }[] = [
    { key: 'feed',          label: '🏠 Home' },
    { key: 'discover',      label: '🔭 Discover' },
    { key: 'search',        label: '🔍 Search' },
    { key: 'notifications', label: '🔔', badge: unreadCount },
    { key: 'dms',           label: '💬' },
  ];

  const postCardProps = {
    onReact: react, onComment: setCommentTarget, onQuote: setQuoteTarget,
    onBookmark: bookmark, onShare: handleShare, onAuthorPress: () => {},
    onVote: votePoll, onReport: handleReport, onBlock: handleBlock, onMute: muteUser,
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Community</Text>
        <TouchableOpacity style={s.composeBtn} onPress={() => setShowCompose(true)}>
          <Text style={s.composeBtnText}>✏️ Post</Text>
        </TouchableOpacity>
      </View>

      {/* Tab bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabBar} contentContainerStyle={s.tabContent}>
        {TABS.map(t => (
          <TouchableOpacity key={t.key} style={[s.tab, tab === t.key && s.tabActive]} onPress={() => setTab(t.key)}>
            <Text style={[s.tabLabel, tab === t.key && s.tabLabelActive]}>{t.label}</Text>
            {(t.badge ?? 0) > 0 && <View style={s.badge}><Text style={s.badgeText}>{t.badge}</Text></View>}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Feed mode toggle (only on feed + discover tabs) */}
      {(tab === 'feed' || tab === 'discover') && (
        <View style={s.modeRow}>
          {(['following', 'discover'] as const).map(m => (
            <TouchableOpacity key={m} style={[s.modeBtn, feedMode === m && s.modeBtnActive]} onPress={() => setFeedMode(m)}>
              <Text style={[s.modeBtnText, feedMode === m && s.modeBtnTextActive]}>
                {m === 'following' ? '👥 Following' : '✨ Discover'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Content */}
      {tab === 'feed' && (
        <FlatList
          data={feed.posts}
          keyExtractor={p => p.id}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          onRefresh={refresh}
          refreshing={feed.refreshing}
          ListHeaderComponent={
            <TouchableOpacity style={s.composeBar} onPress={() => setShowCompose(true)}>
              <Text style={s.composeBarAvatar}>⚡</Text>
              <Text style={s.composeBarPlaceholder}>Share a win, ask a question...</Text>
            </TouchableOpacity>
          }
          ListFooterComponent={feed.loading && !feed.refreshing ? <ActivityIndicator color={Colors.accent} style={{ padding: 20 }} /> : null}
          renderItem={({ item }) => <PostCard post={item} {...postCardProps} />}
        />
      )}

      {tab === 'discover' && (
        <DiscoverTab trending={trending} feedPosts={feed.posts} {...postCardProps} />
      )}

      {tab === 'search' && (
        <SearchTab
          query={searchQuery} setQuery={setSearchQuery}
          results={searchResults} loading={searchLoading} onSearch={search}
          {...postCardProps}
        />
      )}

      {tab === 'notifications' && (
        <NotifTab notifications={notifications} onRead={markNotificationsRead} />
      )}

      {tab === 'dms' && (
        <DMTab threads={threads} onOpenThread={() => {}} onNewDM={() => {}} />
      )}

      {/* Modals */}
      {commentTarget && <CommentSheet post={commentTarget} onClose={() => setCommentTarget(null)} />}
      {quoteTarget && (
        <ComposeSheet
          quotedPost={quoteTarget}
          onClose={() => setQuoteTarget(null)}
          onPost={params => submitPost({ ...params, quotedPostId: quoteTarget.id })}
        />
      )}
      {showCompose && (
        <ComposeSheet onClose={() => setShowCompose(false)} onPost={submitPost} />
      )}
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe:               { flex: 1, backgroundColor: Colors.bg },
  header:             { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  headerTitle:        { fontSize: FontSize.xl, fontWeight: '900', color: Colors.text },
  composeBtn:         { backgroundColor: Colors.accent, borderRadius: Radius.full, paddingHorizontal: 14, paddingVertical: 7 },
  composeBtnText:     { color: '#fff', fontSize: FontSize.sm, fontWeight: '800' },
  tabBar:             { maxHeight: 44, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  tabContent:         { paddingHorizontal: Spacing.md, gap: 4, alignItems: 'center' },
  tab:                { paddingHorizontal: 14, paddingVertical: 10, position: 'relative' },
  tabActive:          { borderBottomWidth: 2, borderBottomColor: Colors.accent },
  tabLabel:           { fontSize: 13, color: Colors.textSoft, fontWeight: '600' },
  tabLabelActive:     { color: Colors.accent, fontWeight: '800' },
  badge:              { position: 'absolute', top: 6, right: 4, backgroundColor: '#ef4444', borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  badgeText:          { fontSize: 9, color: '#fff', fontWeight: '900' },
  modeRow:            { flexDirection: 'row', padding: Spacing.sm, gap: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  modeBtn:            { flex: 1, paddingVertical: 7, borderRadius: Radius.md, alignItems: 'center', backgroundColor: '#f8fafc' },
  modeBtnActive:      { backgroundColor: Colors.accent + '15' },
  modeBtnText:        { fontSize: 13, color: Colors.textSoft, fontWeight: '600' },
  modeBtnTextActive:  { color: Colors.accent, fontWeight: '800' },
  composeBar:         { flexDirection: 'row', alignItems: 'center', gap: 10, padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  composeBarAvatar:   { fontSize: 24, width: 38, height: 38, textAlign: 'center', lineHeight: 38 },
  composeBarPlaceholder: { flex: 1, fontSize: FontSize.sm, color: Colors.textSoft, backgroundColor: '#f8fafc', borderRadius: Radius.xl, paddingHorizontal: 14, paddingVertical: 10 },
});

function formatTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}
