/**
 * Bug / wrong answer flag modal.
 * Appears from a discreet flag icon on any lesson or simulator question.
 * User picks type, optionally adds details, submits queued for offline.
 */

import React, { useState } from 'react';
import {
  Modal, View, Text, StyleSheet, TouchableOpacity,
  TextInput, SafeAreaView, ScrollView,
} from 'react-native';
import { Colors, Spacing, Radius, FontSize } from '../theme';
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
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>🚩 Report an issue</Text>
          <TouchableOpacity onPress={handleClose}><Text style={styles.close}>✕</Text></TouchableOpacity>
        </View>

        {submitted ? (
          <View style={styles.thankYou}>
            <Text style={styles.thankEmoji}>🙏</Text>
            <Text style={styles.thankTitle}>Thanks for flagging that</Text>
            <Text style={styles.thankSub}>
              Our curriculum team reviews every flag. If you're right, we'll fix it and credit your report.
            </Text>
            <TouchableOpacity style={styles.doneBtn} onPress={handleClose}>
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.body}>
            <Text style={styles.lessonRef}>"{lessonTitle}"</Text>

            <Text style={styles.sectionLabel}>What's the issue?</Text>
            {FLAG_TYPES.map(t => (
              <TouchableOpacity
                key={t.id}
                style={[styles.typeRow, flagType === t.id && styles.typeRowSelected]}
                onPress={() => setFlagType(t.id)}
              >
                <Text style={styles.typeEmoji}>{t.emoji}</Text>
                <Text style={[styles.typeLabel, flagType === t.id && styles.typeLabelSelected]}>
                  {t.label}
                </Text>
                {flagType === t.id && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            ))}

            <Text style={styles.sectionLabel}>Details (optional)</Text>
            <TextInput
              style={styles.input}
              value={details}
              onChangeText={setDetails}
              placeholder="Tell us more — what did you expect vs what you saw?"
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[styles.submitBtn, (!flagType || submitting) && styles.submitBtnDisabled]}
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
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border },
  title: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.text },
  close: { fontSize: 18, color: Colors.textSoft, padding: Spacing.xs },
  body: { padding: Spacing.lg },
  lessonRef: { fontSize: FontSize.sm, color: Colors.textSoft, fontStyle: 'italic', marginBottom: Spacing.lg },
  sectionLabel: { fontSize: FontSize.xs, fontWeight: '800', color: Colors.textMuted, letterSpacing: 1, marginBottom: Spacing.sm, marginTop: Spacing.md },
  typeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.sm, backgroundColor: '#fff' },
  typeRowSelected: { borderColor: Colors.accent, backgroundColor: Colors.accentSoft },
  typeEmoji: { fontSize: 18, width: 26 },
  typeLabel: { flex: 1, fontSize: FontSize.sm, color: Colors.text },
  typeLabelSelected: { color: Colors.accent, fontWeight: '700' },
  checkmark: { color: Colors.accent, fontWeight: '800', fontSize: 16 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, padding: Spacing.md, fontSize: FontSize.sm, color: Colors.text, minHeight: 100, marginBottom: Spacing.lg },
  submitBtn: { backgroundColor: Colors.accent, borderRadius: Radius.lg, padding: Spacing.lg, alignItems: 'center' },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { color: '#fff', fontWeight: '800', fontSize: FontSize.md },
  thankYou: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xxxl },
  thankEmoji: { fontSize: 56, marginBottom: Spacing.lg },
  thankTitle: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text, marginBottom: Spacing.sm },
  thankSub: { fontSize: FontSize.sm, color: Colors.textSoft, textAlign: 'center', lineHeight: 22, marginBottom: Spacing.xxl },
  doneBtn: { backgroundColor: Colors.accent, borderRadius: Radius.lg, paddingVertical: Spacing.md, paddingHorizontal: Spacing.xxxl },
  doneBtnText: { color: '#fff', fontWeight: '800', fontSize: FontSize.md },
});
