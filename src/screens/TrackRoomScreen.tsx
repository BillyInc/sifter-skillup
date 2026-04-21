/**
 * Sifter Skill_Up — Track Room Screen
 * Always-on discussion room per track. Polls every 10s for new messages.
 *
 * 3 LAYOUTS:
 *   Web ≥768px  → left sidebar (room list) + right message area + top bar
 *   Web <768px  → full-width message area (header + messages + input)
 *   Mobile      → same as web narrow but SafeAreaView + native keyboard
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  SafeAreaView, KeyboardAvoidingView, Platform, useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { useTheme, Spacing, Radius, FontSize, FontWeight, Shadow } from '../theme';
import { useAuth } from '../hooks/useAuth';
import RoomMessage, { QuickReactBar } from '../components/RoomMessage';
import { API } from '../lib/api';
import type { RoomMessage as Msg, Room } from '../types/social';

const POLL_MS = 10000;

interface TrackRoomScreenProps {
  route?: { params?: { trackId?: string; trackName?: string; roomId?: string } };
  navigation?: any;
}

export default function TrackRoomScreen({ route, navigation }: TrackRoomScreenProps) {
  const { colors }  = useTheme();
  const { user }    = useAuth();
  const { width }   = useWindowDimensions();
  const isWebWide   = Platform.OS === 'web' && width >= 768;

  const trackId   = route?.params?.trackId   ?? 'defi-research-analyst';
  const trackName = route?.params?.trackName ?? 'Track';
  const roomId    = route?.params?.roomId;

  const [messages,    setMessages]    = useState<Msg[]>([]);
  const [inputText,   setInputText]   = useState('');
  const [loading,     setLoading]     = useState(true);
  const [sending,     setSending]     = useState(false);
  const [reactTarget, setReactTarget] = useState<string | null>(null);
  const flatRef = useRef<FlatList>(null);
  const pollRef = useRef<ReturnType<typeof setInterval>>();

  const fetchMessages = useCallback(async () => {
    if (!roomId) { setLoading(false); return; }
    try {
      const data = await API.roomGetMessages(roomId, 50);
      setMessages(data);
    } catch {}
    setLoading(false);
  }, [roomId]);

  useEffect(() => {
    fetchMessages();
    pollRef.current = setInterval(fetchMessages, POLL_MS);
    return () => clearInterval(pollRef.current);
  }, [fetchMessages]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || sending || !roomId) return;
    setSending(true);
    setInputText('');
    try {
      await API.roomPostMessage(roomId, {
        content:      text,
        message_type: 'text',
        author_id:    user?.id ?? 'anon',
        author_username: user?.username ?? 'You',
        author_stage: user?.xp_stage ?? 1,
      });
      await fetchMessages();
    } catch {}
    setSending(false);
  };

  const handleReact = async (messageId: string, emoji: string) => {
    setReactTarget(null);
    try { await API.roomReactToMessage(messageId, emoji); await fetchMessages(); } catch {}
  };

  // ── Message area (shared across all layouts) ──────────────────────────────

  const MessageArea = () => (
    <View style={{ flex: 1 }}>
      {loading ? (
        <View style={styles.centreLoad}>
          <ActivityIndicator color={colors.accent} />
          <Text style={[styles.loadText, { color: colors.textMuted }]}>Loading room…</Text>
        </View>
      ) : !roomId ? (
        <View style={styles.centreLoad}>
          <Text style={styles.noRoomEmoji}>💬</Text>
          <Text style={[styles.noRoomTitle, { color: colors.text }]}>Room not available yet</Text>
          <Text style={[styles.noRoomSub, { color: colors.textMuted }]}>Complete a lesson in this track to unlock the room.</Text>
        </View>
      ) : (
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={m => m.id}
          renderItem={({ item }) => (
            <RoomMessage
              message={item}
              isOwn={item.author_id === user?.id}
              onReact={handleReact}
              onLessonTap={lessonId => navigation?.navigate('Lesson', { lessonId })}
            />
          )}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyRoom}>
              <Text style={styles.emptyRoomEmoji}>🌱</Text>
              <Text style={[styles.emptyRoomText, { color: colors.textMuted }]}>
                Be the first to post in the {trackName} room.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );

  // ── Input bar ─────────────────────────────────────────────────────────────

  const InputBar = () => (
    <View style={[styles.inputBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
      <TextInput
        style={[styles.input, { backgroundColor: colors.bgSecondary, color: colors.text, borderColor: colors.border }]}
        placeholder={roomId ? `Message ${trackName} room…` : 'Unlock room to post'}
        placeholderTextColor={colors.textMuted}
        value={inputText}
        onChangeText={setInputText}
        onSubmitEditing={handleSend}
        returnKeyType="send"
        editable={!!roomId && !sending}
        multiline={false}
      />
      <TouchableOpacity
        style={[styles.sendBtn, { backgroundColor: inputText.trim() ? colors.accent : colors.bgSecondary }]}
        onPress={handleSend}
        disabled={!inputText.trim() || sending || !roomId}
      >
        <Text style={[styles.sendBtnText, { color: inputText.trim() ? '#fff' : colors.textMuted }]}>↑</Text>
      </TouchableOpacity>
    </View>
  );

  // ── Room header ───────────────────────────────────────────────────────────

  const RoomHeader = () => (
    <View style={[styles.roomHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
      {navigation && !isWebWide && (
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backBtnText, { color: colors.accent }]}>←</Text>
        </TouchableOpacity>
      )}
      <View>
        <Text style={[styles.roomTitle, { color: colors.text }]}>💬 {trackName}</Text>
        <Text style={[styles.roomSub, { color: colors.textMuted }]}>Track Discussion · {messages.length} messages</Text>
      </View>
      <View style={[styles.liveTag, { backgroundColor: colors.greenSoft }]}>
        <Text style={[styles.liveTagText, { color: colors.green }]}>● Live</Text>
      </View>
    </View>
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  if (isWebWide) {
    return (
      <View style={[styles.webRoot, { backgroundColor: colors.bg }]}>
        {/* Left: room info panel */}
        <View style={[styles.webLeft, { backgroundColor: colors.card, borderRightColor: colors.border }]}>
          <Text style={[styles.webLeftTitle, { color: colors.text }]}>💬 {trackName}</Text>
          <Text style={[styles.webLeftSub, { color: colors.textMuted }]}>Track Discussion Room</Text>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Text style={[styles.webLeftSectionLabel, { color: colors.textMuted }]}>GUIDELINES</Text>
          {['Share lessons you\'re stuck on', 'Ask questions — no silly ones', 'Help others in your field', 'No spam or self-promotion'].map(g => (
            <Text key={g} style={[styles.webLeftGuideline, { color: colors.textSoft }]}>· {g}</Text>
          ))}
          <View style={{ flex: 1 }} />
          <View style={[styles.memberCount, { backgroundColor: colors.bgSecondary }]}>
            <Text style={[styles.memberCountText, { color: colors.textMuted }]}>
              {Math.floor(Math.random() * 80) + 20} members
            </Text>
          </View>
        </View>

        {/* Right: messages + input */}
        <View style={{ flex: 1, flexDirection: 'column' }}>
          <RoomHeader />
          <MessageArea />
          <InputBar />
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        <RoomHeader />
        <MessageArea />
        <InputBar />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen:          { flex: 1 },
  webRoot:         { flex: 1, flexDirection: 'row' },
  webLeft:         { width: 240, borderRightWidth: 1, padding: Spacing.lg, gap: Spacing.sm },
  webLeftTitle:    { fontSize: FontSize.lg, fontWeight: FontWeight.black },
  webLeftSub:      { fontSize: FontSize.xs, color: '#94a3b8' },
  divider:         { height: 1, marginVertical: Spacing.sm },
  webLeftSectionLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.black, letterSpacing: 0.8 },
  webLeftGuideline:{ fontSize: FontSize.xs, lineHeight: 20 },
  memberCount:     { padding: Spacing.sm, borderRadius: Radius.md, alignItems: 'center' },
  memberCountText: { fontSize: FontSize.xs },

  roomHeader:      { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md, borderBottomWidth: 1 },
  backBtn:         { padding: Spacing.xs },
  backBtnText:     { fontSize: FontSize.lg, fontWeight: FontWeight.black },
  roomTitle:       { fontSize: FontSize.md, fontWeight: FontWeight.black },
  roomSub:         { fontSize: FontSize.xs },
  liveTag:         { marginLeft: 'auto', paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: Radius.full },
  liveTagText:     { fontSize: 10, fontWeight: FontWeight.black },

  messageList:     { paddingVertical: Spacing.md, gap: 2 },
  centreLoad:      { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  loadText:        { fontSize: FontSize.sm },
  noRoomEmoji:     { fontSize: 36 },
  noRoomTitle:     { fontSize: FontSize.lg, fontWeight: FontWeight.black },
  noRoomSub:       { fontSize: FontSize.sm, textAlign: 'center', maxWidth: 280 },
  emptyRoom:       { padding: Spacing.xxxl, alignItems: 'center', gap: Spacing.sm },
  emptyRoomEmoji:  { fontSize: 36 },
  emptyRoomText:   { fontSize: FontSize.sm, textAlign: 'center', maxWidth: 240 },

  inputBar:        { flexDirection: 'row', gap: Spacing.sm, padding: Spacing.md, borderTopWidth: 1 },
  input:           { flex: 1, borderRadius: Radius.full, borderWidth: 1, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, fontSize: FontSize.sm },
  sendBtn:         { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  sendBtnText:     { fontSize: FontSize.lg, fontWeight: FontWeight.black },
});
