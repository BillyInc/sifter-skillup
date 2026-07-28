/**
 * Bug / wrong answer flag modal.
 * Appears from a discreet flag icon on any lesson or simulator question.
 * User picks type, optionally adds details, submits queued for offline.
 */

import React, { useState } from 'react';
import {
  Modal, View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Spacing, Radius, FontSize, useTheme } from '../theme';
import { offlineWrite } from '../lib/offlineQueue';

type FlagType =
  | 'wrong_answer'
  | 'wrong_explanation'
  | 'outdated_info'
  | 'typo'
  | 'broken_ui'
  | 'other';

const FLAG_TYPES: { id: FlagType; label: string; emoji: string }[] = [
  { id: 'wrong_answer',      label: 'Wrong answer marked correct',  emoji: '❌' },
  { id: 'wrong_explanation', label: 'Explanation is incorrect',     emoji: '📖' },
  { id: 'outdated_info',     label: 'Information is outdated',      emoji: '📅' },
  { id: 'typo',              label: 'Spelling / grammar error',     emoji: '✏️' },
  { id: 'broken_ui',         label: 'App display issue',            emoji: '🖥️' },
  { id: 'other',             label: 'Something else',               emoji: '💬' },
];

interface Props {
  visible: boolean;
  lessonId: string;
  lessonTitle: string;
  questionId?: string;
  userId: string;
  onClose: () => void;
}

export default function FlagModal({ visible, lessonId, lessonTitle, questionId, userId, onClose }: Props) {
  const { colors } = useTheme();
  const [flagType, setFlagType] = useState<FlagType | null>(null);
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!flagType) return;
    setSubmitting(true);
    await offlineWrite('/api/flags', 'POST', {
      userId, lessonId, lessonTitle, questionId,
      flagType, details,
      submittedAt: new Date().toISOString(),
    }, 'normal');
    setSubmitted(true);
    setSubmitting(false);
  };

  const handleClose = () => {
    setFlagType(null); setDetails(''); setSubmitted(false);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
        <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
          <Text style={[styles.title, { color: colors.text }]}>🚩 Report an issue</Text>
          <TouchableOpacity onPress={handleClose}><Text style={[styles.close, { color: colors.textSoft }]}>✕</Text></TouchableOpacity>
        </View>

        {submitted ? (
          <View style={styles.thankYou}>
            <Text style={styles.thankEmoji}>🙏</Text>
            <Text style={[styles.thankTitle, { color: colors.text }]}>Thanks for flagging that</Text>
            <Text style={[styles.thankSub, { color: colors.textSoft }]}>
              Our curriculum team reviews every flag. If you&apos;re right, we&apos;ll fix it and credit your report.
            </Text>
            <TouchableOpacity style={[styles.doneBtn, { backgroundColor: colors.accent }]} onPress={handleClose}>
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.body}>
            <View style={[styles.lessonCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.lessonRef, { color: colors.textSoft }]}>“{lessonTitle}”</Text>
            </View>

            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>What&apos;s the issue?</Text>
            {FLAG_TYPES.map(t => (
              <TouchableOpacity
                key={t.id}
                style={[
                  styles.typeRow,
                  { borderColor: colors.border, backgroundColor: colors.card },
                  flagType === t.id && { borderColor: colors.accent, backgroundColor: colors.accentSoft },
                ]}
                onPress={() => setFlagType(t.id)}
              >
                <Text style={styles.typeEmoji}>{t.emoji}</Text>
                <Text style={[styles.typeLabel, { color: colors.text }, flagType === t.id && { color: colors.accent, fontWeight: '700' }]}>
                  {t.label}
                </Text>
                {flagType === t.id && <Text style={[styles.checkmark, { color: colors.accent }]}>✓</Text>}
              </TouchableOpacity>
            ))}

            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Details (optional)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              value={details}
              onChangeText={setDetails}
              placeholder="Tell us more — what did you expect vs what you saw?"
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: colors.accent }, (!flagType || submitting) && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={!flagType || submitting}
            >
              <Text style={styles.submitBtnText}>{submitting ? 'Submitting…' : 'Submit Report'}</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md, borderBottomWidth: 1 },
  title: { fontSize: FontSize.lg, fontWeight: '800' },
  close: { fontSize: 18, padding: Spacing.xs },
  body: { padding: Spacing.lg },
  lessonCard: { borderRadius: Radius.lg, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.lg },
  lessonRef: { fontSize: FontSize.sm, fontStyle: 'italic' },
  sectionLabel: { fontSize: FontSize.xs, fontWeight: '800', letterSpacing: 1, marginBottom: Spacing.sm, marginTop: Spacing.md },
  typeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md, borderRadius: Radius.lg, borderWidth: 1, marginBottom: Spacing.sm },
  typeRowSelected: {},
  typeEmoji: { fontSize: 18, width: 26 },
  typeLabel: { flex: 1, fontSize: FontSize.sm },
  typeLabelSelected: { fontWeight: '700' },
  checkmark: { fontWeight: '800', fontSize: 16 },
  input: { borderWidth: 1, borderRadius: Radius.lg, padding: Spacing.md, fontSize: FontSize.sm, minHeight: 100, marginBottom: Spacing.lg },
  submitBtn: { borderRadius: Radius.xl, padding: Spacing.md, alignItems: 'center' },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { color: '#fff', fontWeight: '800', fontSize: FontSize.md },
  thankYou: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xxxl },
  thankEmoji: { fontSize: 18, marginBottom: Spacing.lg },
  thankTitle: { fontSize: FontSize.xl, fontWeight: '800', marginBottom: Spacing.sm },
  thankSub: { fontSize: FontSize.sm, textAlign: 'center', lineHeight: 22, marginBottom: Spacing.xxl },
  doneBtn: { borderRadius: Radius.xl, paddingVertical: Spacing.md, paddingHorizontal: Spacing.xxxl },
  doneBtnText: { color: '#fff', fontWeight: '800', fontSize: FontSize.md },
});
