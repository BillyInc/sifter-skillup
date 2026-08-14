/**
 * Sifter LevelUp — CommentSheet
 * Threaded comments with image upload via expo-image-picker.
 * Full-screen modal on mobile, slide-up panel pattern.
 */

import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Modal, FlatList, Image, KeyboardAvoidingView, Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import {
  useTheme, Spacing, Radius, FontSize, FontWeight,
} from '../theme';
import type { FeedItem, Comment } from '../types/feed';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface CommentSheetProps {
  item: FeedItem;
  comments: Comment[];
  loading?: boolean;
  onClose: () => void;
  onSubmit: (content: string, parentId: string | null, imageUrl?: string) => void;
}

// ─── Single comment row ───────────────────────────────────────────────────────

function CommentRow({
  comment,
  depth,
  onReply,
}: {
  comment: Comment;
  depth: number;
  onReply: (comment: Comment) => void;
}) {
  const { colors } = useTheme();
  const isNested   = depth > 0;

  return (
    <View style={[styles.commentItem, isNested && { marginLeft: depth * 20, paddingLeft: Spacing.md, borderLeftWidth: 2, borderLeftColor: colors.border }]}>
      <View style={styles.commentHeader}>
        <Text style={styles.commentAvatar}>{comment.author.avatar || '👤'}</Text>
        <View style={{ flex: 1 }}>
          <View style={styles.commentMeta}>
            <Text style={[styles.commentAuthor, { color: colors.text }]}>{comment.author.name}</Text>
            {comment.author.trackId && (
              <Text style={[styles.commentTrack, { color: colors.textMuted }]}>· {comment.author.trackId}</Text>
            )}
          </View>
          <Text style={[styles.commentTime, { color: colors.textMuted }]}>
            {Math.floor((Date.now() - new Date(comment.createdAt).getTime()) / 3600000)}h ago
          </Text>
        </View>
      </View>

      <Text style={[styles.commentBody, { color: colors.textSoft }]}>{comment.content}</Text>

      {comment.imageUrl && (
        <Image source={{ uri: comment.imageUrl }} style={styles.commentImage} resizeMode="cover" />
      )}

      <View style={styles.commentActions}>
        <TouchableOpacity style={styles.commentAction}>
          <Text style={[styles.commentActionText, { color: comment.myUpvote ? colors.accent : colors.textMuted }]}>
            ▲ {comment.upvotes}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.commentAction} onPress={() => onReply(comment)}>
          <Text style={[styles.commentActionText, { color: colors.textMuted }]}>Reply</Text>
        </TouchableOpacity>
      </View>

      {/* Nested replies */}
      {comment.replies?.map(reply => (
        <CommentRow key={reply.id} comment={reply} depth={depth + 1} onReply={onReply} />
      ))}
    </View>
  );
}

// ─── Comment sheet ─────────────────────────────────────────────────────────────

export function CommentSheet({
  item, comments, loading = false, onClose, onSubmit,
}: CommentSheetProps) {
  const { colors }     = useTheme();
  const [text, setText]             = useState('');
  const [replyTo, setReplyTo]       = useState<Comment | null>(null);
  const [image, setImage]           = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const pickImage = useCallback(async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!text.trim() && !image) return;
    setSubmitting(true);
    try {
      onSubmit(text.trim(), replyTo?.id ?? null, image ?? undefined);
      setText('');
      setImage(null);
      setReplyTo(null);
    } finally {
      setSubmitting(false);
    }
  }, [text, image, replyTo, onSubmit]);

  const canSubmit = (text.trim().length > 0 || !!image) && !submitting;

  return (
    <Modal
      visible
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.sheet, { backgroundColor: colors.bg }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          {/* Header */}
          <View style={[styles.sheetHeader, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={[styles.closeBtnText, { color: colors.textMuted }]}>✕</Text>
            </TouchableOpacity>
            <Text style={[styles.sheetTitle, { color: colors.text }]}>
              Comments ({comments.length})
            </Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Original post preview */}
          <View style={[styles.postPreview, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <Text style={[styles.previewSource, { color: colors.accent }]}>{item.source}</Text>
            <Text style={[styles.previewTitle, { color: colors.text }]} numberOfLines={2}>{item.title}</Text>
          </View>

          {/* Comments list */}
          {loading ? (
            <View style={styles.loadingCenter}>
              <ActivityIndicator color={colors.accent} />
            </View>
          ) : (
            <FlatList
              data={comments}
              keyExtractor={c => c.id}
              contentContainerStyle={styles.commentsList}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                  No comments yet. Start the discussion.
                </Text>
              }
              renderItem={({ item: comment }) => (
                <CommentRow
                  comment={comment}
                  depth={0}
                  onReply={setReplyTo}
                />
              )}
            />
          )}

          {/* Input area */}
          <View style={[styles.inputArea, { borderTopColor: colors.border, backgroundColor: colors.card }]}>
            <Text style={[styles.privacyNotice, { color: colors.textMuted }]}>Comments and images may be visible to other users. Do not post student IDs, grades, guardian information, health details, or other sensitive personal data.</Text>
            {/* Reply indicator */}
            {replyTo && (
              <View style={[styles.replyIndicator, { backgroundColor: colors.accentSoft }]}>
                <Text style={[styles.replyIndicatorText, { color: colors.accent }]}>
                  Replying to {replyTo.author.name}
                </Text>
                <TouchableOpacity onPress={() => setReplyTo(null)}>
                  <Text style={[styles.replyDismiss, { color: colors.accent }]}>✕</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Image preview */}
            {image && (
              <View style={styles.imagePreview}>
                <Image source={{ uri: image }} style={styles.imageThumb} />
                <TouchableOpacity onPress={() => setImage(null)} style={styles.removeImage}>
                  <Text style={{ color: colors.textMuted, fontSize: 16 }}>✕</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Input row */}
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.textInput, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.inputBorder }]}
                value={text}
                onChangeText={setText}
                placeholder={replyTo ? `Reply to ${replyTo.author.name}…` : 'Add a comment…'}
                placeholderTextColor={colors.textMuted}
                multiline
                maxLength={1000}
              />
              <TouchableOpacity style={styles.imagePickerBtn} onPress={pickImage}>
                <Text style={{ fontSize: 20 }}>📷</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.sendBtn,
                  { backgroundColor: canSubmit ? colors.accent : colors.bgTertiary },
                ]}
                onPress={handleSubmit}
                disabled={!canSubmit}
              >
                {submitting
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={styles.sendBtnText}>↑</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  sheet:           { flex: 1 },

  sheetHeader:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderBottomWidth: 1 },
  closeBtn:        { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  closeBtnText:    { fontSize: 18, fontWeight: FontWeight.bold },
  sheetTitle:      { fontSize: FontSize.md, fontWeight: FontWeight.black },

  postPreview:     { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderBottomWidth: 1 },
  previewSource:   { fontSize: 11, fontWeight: FontWeight.black, textTransform: 'uppercase' as any, letterSpacing: 0.4, marginBottom: 4 },
  previewTitle:    { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, lineHeight: 19 },

  loadingCenter:   { flex: 1, alignItems: 'center', justifyContent: 'center' },
  commentsList:    { padding: Spacing.md, gap: Spacing.sm },
  emptyText:       { textAlign: 'center', marginTop: Spacing.xxl, fontSize: FontSize.md },

  commentItem:     { gap: Spacing.xs, marginBottom: Spacing.md },
  commentHeader:   { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  commentAvatar:   { fontSize: 18 },
  commentMeta:     { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  commentAuthor:   { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  commentTrack:    { fontSize: FontSize.xs },
  commentTime:     { fontSize: 11, marginTop: 2 },
  commentBody:     { fontSize: FontSize.sm, lineHeight: 19 },
  commentImage:    { width: '100%', height: 180, borderRadius: Radius.md, marginTop: Spacing.xs },
  commentActions:  { flexDirection: 'row', gap: Spacing.lg, marginTop: Spacing.xs },
  commentAction:   { paddingVertical: 4 },
  commentActionText:{ fontSize: FontSize.xs, fontWeight: FontWeight.semibold },

  inputArea:       { borderTopWidth: 1, padding: Spacing.sm, gap: Spacing.sm },
  privacyNotice:   { fontSize: FontSize.xs, lineHeight: 16 },
  replyIndicator:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.sm, borderRadius: Radius.lg },
  replyIndicatorText:{ fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  replyDismiss:    { fontSize: 16, fontWeight: FontWeight.bold, padding: 4 },
  imagePreview:    { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  imageThumb:      { width: 56, height: 56, borderRadius: Radius.md },
  removeImage:     { padding: Spacing.xs },
  inputRow:        { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm },
  textInput:       { flex: 1, borderRadius: Radius.xl, borderWidth: 1.5, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, fontSize: FontSize.sm, maxHeight: 120, minHeight: 42 },
  imagePickerBtn:  { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  sendBtn:         { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  sendBtnText:     { color: '#fff', fontSize: 18, fontWeight: FontWeight.black },
});
