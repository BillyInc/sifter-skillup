/**
 * In-app review modal. Shown after level complete or on explicit tap.
 * 5-star rating + optional written review.
 * Routes 4-5 stars toward App Store / Play Store review.
 * Routes 1-3 stars to internal feedback (never to public store).
 */

import React, { useState } from 'react';
import {
  Modal, View, Text, StyleSheet, TouchableOpacity,
  TextInput, Linking,
} from 'react-native';
import { Colors, Spacing, Radius, FontSize } from '../theme';
import { offlineWrite } from '../lib/offlineQueue';

interface Props {
  visible: boolean;
  userId: string;
  context: string; // e.g. "after level 12 complete"
  onClose: () => void;
}

const APP_STORE_URL  = 'https://apps.apple.com/app/sifter-levelup/id0000000000';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.sifter.skillup';

export default function ReviewModal({ visible, userId, context, onClose }: Props) {
  const [rating, setRating]     = useState(0);
  const [review, setReview]     = useState('');
  const [phase, setPhase]       = useState<'rating' | 'feedback' | 'store' | 'done'>('rating');

  const handleRating = (r: number) => {
    setRating(r);
    if (r >= 4) setPhase('store');
    else setPhase('feedback');
  };

  const handleStoreRedirect = async () => {
    const url = /iphone|ipad|ipod/i.test(navigator?.userAgent ?? '') ? APP_STORE_URL : PLAY_STORE_URL;
    await Linking.openURL(url).catch(() => {});
    await offlineWrite('/api/reviews', 'POST', { userId, rating, context, redirectedToStore: true }, 'normal');
    setPhase('done');
  };

  const handleSubmitFeedback = async () => {
    await offlineWrite('/api/reviews', 'POST', { userId, rating, review, context, redirectedToStore: false }, 'normal');
    // Also route written feedback to the Sifter team so it is triaged
    // alongside bug/idea/content reports (Phase 12; outbound-only per §6A.1 —
    // this is not an inbox any institution admin can read).
    await offlineWrite(
      '/api/feedback',
      'POST',
      {
        type: 'review',
        rating,
        message: review,
        entityType: 'app',
        entityId: context,
        // Required for student submissions (§6A.3/§6A.4). This flow IS the
        // app-rating channel — the spec's own wording for the category is
        // "App rating / general praise" — so it maps here regardless of star
        // count; the star rating carries the sentiment, the category carries
        // the topic. Without this the submission is refused.
        studentCategory: 'praise',
      },
      'normal',
    );
    setPhase('done');
  };

  const handleClose = () => {
    setRating(0); setReview(''); setPhase('rating');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={handleClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {phase === 'rating' && (
            <>
              <Text style={styles.emoji}>⚡</Text>
              <Text style={styles.title}>How are we doing?</Text>
              <Text style={styles.sub}>Your feedback makes Sifter better for every student.</Text>
              <View style={styles.stars}>
                {[1,2,3,4,5].map(s => (
                  <TouchableOpacity key={s} onPress={() => handleRating(s)}>
                    <Text style={[styles.star, s <= rating && styles.starFilled]}>
                      {s <= rating ? '★' : '☆'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity onPress={handleClose} style={styles.skipBtn}>
                <Text style={styles.skipText}>Not now</Text>
              </TouchableOpacity>
            </>
          )}

          {phase === 'feedback' && (
            <>
              <Text style={styles.title}>Tell us what to improve</Text>
              <Text style={styles.sub}>We read every message. This goes directly to our product team.</Text>
              <Text style={styles.notice}>
                Please do not include student IDs, grades, guardian details, health information, or other sensitive personal data.
              </Text>
              <TextInput
                style={styles.input}
                value={review}
                onChangeText={setReview}
                placeholder="What would make Sifter better for you?"
                placeholderTextColor={Colors.textMuted}
                multiline numberOfLines={4} textAlignVertical="top"
              />
              <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitFeedback}>
                <Text style={styles.submitText}>Send Feedback</Text>
              </TouchableOpacity>
            </>
          )}

          {phase === 'store' && (
            <>
              <Text style={styles.emoji}>🙏</Text>
              <Text style={styles.title}>Thanks! Would you rate us?</Text>
              <Text style={styles.sub}>
                A store rating takes 10 seconds and helps other students find us — especially in low-income regions where word-of-mouth matters most.
              </Text>
              <TouchableOpacity style={styles.submitBtn} onPress={handleStoreRedirect}>
                <Text style={styles.submitText}>Rate Sifter LevelUp ★★★★★</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleClose} style={styles.skipBtn}>
                <Text style={styles.skipText}>No thanks</Text>
              </TouchableOpacity>
            </>
          )}

          {phase === 'done' && (
            <>
              <Text style={styles.emoji}>💚</Text>
              <Text style={styles.title}>Thank you!</Text>
              <Text style={styles.sub}>Your feedback helps us build a better learning experience for everyone.</Text>
              <TouchableOpacity style={styles.submitBtn} onPress={handleClose}>
                <Text style={styles.submitText}>Continue</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  card: { backgroundColor: '#fff', borderRadius: Radius.xl, padding: Spacing.xxl, width: '100%', alignItems: 'center' },
  emoji: { fontSize: 18, marginBottom: Spacing.md },
  title: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text, textAlign: 'center', marginBottom: Spacing.sm },
  sub: { fontSize: FontSize.sm, color: Colors.textSoft, textAlign: 'center', lineHeight: 20, marginBottom: Spacing.lg },
  notice: { width: '100%', fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'center', lineHeight: 17, marginBottom: Spacing.md },
  stars: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  star: { fontSize: 18, color: Colors.border },
  starFilled: { color: Colors.gold },
  input: { width: '100%', borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, padding: Spacing.md, fontSize: FontSize.sm, color: Colors.text, minHeight: 100, marginBottom: Spacing.md, textAlignVertical: 'top' },
  submitBtn: { backgroundColor: Colors.accent, borderRadius: Radius.lg, padding: Spacing.md, width: '100%', alignItems: 'center', marginBottom: Spacing.sm },
  submitText: { color: '#fff', fontWeight: '800', fontSize: FontSize.md },
  skipBtn: { padding: Spacing.md },
  skipText: { fontSize: FontSize.sm, color: Colors.textMuted },
});
