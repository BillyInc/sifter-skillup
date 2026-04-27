import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  SafeAreaView, KeyboardAvoidingView, Platform, useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { useTheme, Spacing, Radius, FontSize, FontWeight } from '../theme';
import { useAuth } from '../hooks/useAuth';
import RoomMessage from '../components/RoomMessage';
import { API } from '../lib/api';
import type { RoomMessage as Msg } from '../types/social';

const POLL_MS = 10000;

interface TrackRoomScreenProps {
  route?: { params?: { trackId?: string; trackName?: string; roomId?: string } };
  navigation?: any;
}

export default function TrackRoomScreen({ route, navigation }: TrackRoomScreenProps) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const isWebWide = Platform.OS === 'web' && width >= 768;

  const trackName = route?.params?.trackName ?? 'Track';
  const roomId = route?.params?.roomId;

  const [messages, setMessages] = useState<Msg[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatRef = useRef<FlatList>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!roomId) { setLoading(false); return; }
    try {
      const data = await API.roomGetMessages(roomId, 50);
      setMessages(data);
    } catch {
      // Best effort only.
    }
    setLoading(false);
  }, [roomId]);

  useEffect(() => {
    void fetchMessages();
    pollRef.current = setInterval(() => {
      void fetchMessages();
    }, POLL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
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
        content: text,
        message_type: 'text',
        author_id: user?.id ?? 'anon',
        author_username: user?.username ?? 'You',
        author_stage: user?.xp_stage ?? 1,
      });
      await fetchMessages();
    } catch {
      // Best effort only.
    }
    setSending(false);
  };

  const handleReact = async (messageId: string, emoji: string) => {
    try {
      await API.roomReactToMessage(messageId, emoji);
      await fetchMessages();
    } catch {
      // Best effort only.
    }
  };

  const MessageArea = () => (
    <View style={styles.messageArea}>
      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator color={colors.accent} />
          <Text style={[styles.stateText, { color: colors.textMuted }]}>Loading workspace room...</Text>
        </View>
      ) : !roomId ? (
        <View style={styles.centerState}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Room locked</Text>
          <Text style={[styles.emptyCopy, { color: colors.textMuted }]}>Complete a lesson in this track to unlock discussion.</Text>
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
          ListEmptyComponent={(
            <View style={styles.emptyRoom}>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Start the room</Text>
              <Text style={[styles.emptyCopy, { color: colors.textMuted }]}>Be the first to post in the {trackName} workspace.</Text>
            </View>
          )}
        />
      )}
    </View>
  );

  const InputBar = () => (
    <View style={[styles.inputBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
      <TextInput
        style={[styles.input, { backgroundColor: colors.bgSecondary, color: colors.text, borderColor: colors.border }]}
        placeholder={roomId ? `Message ${trackName} room...` : 'Unlock room to post'}
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
        <Text style={[styles.sendBtnText, { color: inputText.trim() ? '#fff' : colors.textMuted }]}>Send</Text>
      </TouchableOpacity>
    </View>
  );

  const RoomHeader = () => (
    <View style={[styles.roomHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
      {navigation && !isWebWide ? (
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: colors.bgSecondary }]}>
          <Text style={[styles.backBtnText, { color: colors.text }]}>{'<'}</Text>
        </TouchableOpacity>
      ) : null}
      <View style={styles.roomHeaderCopy}>
        <Text style={[styles.roomEyebrow, { color: colors.textMuted }]}>Track Workspace</Text>
        <Text style={[styles.roomTitle, { color: colors.text }]}>{trackName}</Text>
        <Text style={[styles.roomSub, { color: colors.textMuted }]}>Discussion room · {messages.length} messages</Text>
      </View>
      <View style={[styles.liveTag, { backgroundColor: colors.greenSoft }]}>
        <Text style={[styles.liveTagText, { color: colors.green }]}>{roomId ? 'Live' : 'Locked'}</Text>
      </View>
    </View>
  );

  if (isWebWide) {
    return (
      <View style={[styles.webRoot, { backgroundColor: colors.bg }]}>
        <View style={[styles.webLeft, { backgroundColor: colors.card, borderRightColor: colors.border }]}>
          <Text style={[styles.sidebarEyebrow, { color: colors.textMuted }]}>Workspace Room</Text>
          <Text style={[styles.sidebarTitle, { color: colors.text }]}>{trackName}</Text>
          <Text style={[styles.sidebarCopy, { color: colors.textSoft }]}>Ask for help, post progress, and keep track-specific discussion attached to the right workspace.</Text>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Text style={[styles.guidelineLabel, { color: colors.textMuted }]}>Guidelines</Text>
          {[
            'Share the lesson or lab you are working on.',
            'Ask clear questions when blocked.',
            'Help other learners with context, not just answers.',
            'Keep the room free of spam.',
          ].map(g => (
            <Text key={g} style={[styles.guidelineText, { color: colors.textSoft }]}>{g}</Text>
          ))}
          <View style={{ flex: 1 }} />
          <View style={[styles.memberCount, { backgroundColor: colors.bgSecondary }]}>
            <Text style={[styles.memberCountText, { color: colors.textMuted }]}>
              {Math.floor(Math.random() * 80) + 20} active members
            </Text>
          </View>
        </View>

        <View style={styles.webRight}>
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
        style={styles.keyboardWrap}
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
  screen: { flex: 1 },
  keyboardWrap: { flex: 1 },
  webRoot: { flex: 1, flexDirection: 'row' },
  webLeft: { width: 280, borderRightWidth: 1, padding: Spacing.lg, gap: Spacing.sm },
  webRight: { flex: 1, flexDirection: 'column' },
  sidebarEyebrow: { fontSize: 10, fontWeight: FontWeight.black, letterSpacing: 1, textTransform: 'uppercase' },
  sidebarTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.black },
  sidebarCopy: { fontSize: FontSize.sm, lineHeight: 20 },
  divider: { height: 1, marginVertical: Spacing.sm },
  guidelineLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.black, letterSpacing: 0.8, textTransform: 'uppercase' },
  guidelineText: { fontSize: FontSize.xs, lineHeight: 20 },
  memberCount: { padding: Spacing.sm, borderRadius: Radius.md, alignItems: 'center' },
  memberCountText: { fontSize: FontSize.xs },
  roomHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md, borderBottomWidth: 1 },
  roomHeaderCopy: { flex: 1 },
  backBtn: { width: 36, height: 36, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  backBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.black },
  roomEyebrow: { fontSize: 10, fontWeight: FontWeight.black, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 },
  roomTitle: { fontSize: FontSize.md, fontWeight: FontWeight.black },
  roomSub: { fontSize: FontSize.xs },
  liveTag: { marginLeft: 'auto', paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: Radius.full },
  liveTagText: { fontSize: 10, fontWeight: FontWeight.black },
  messageArea: { flex: 1 },
  messageList: { paddingVertical: Spacing.md, gap: 2 },
  centerState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, padding: Spacing.lg },
  stateText: { fontSize: FontSize.sm },
  emptyRoom: { padding: Spacing.xxxl, alignItems: 'center', gap: Spacing.sm },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.black, textAlign: 'center' },
  emptyCopy: { fontSize: FontSize.sm, textAlign: 'center', maxWidth: 280 },
  inputBar: { flexDirection: 'row', gap: Spacing.sm, padding: Spacing.md, borderTopWidth: 1 },
  input: { flex: 1, borderRadius: Radius.full, borderWidth: 1, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, fontSize: FontSize.sm },
  sendBtn: { minWidth: 68, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 },
  sendBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.black },
});
