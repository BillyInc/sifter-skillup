/**
 * Sifter Skill_Up — Notification Settings Screen
 * Push, SMS, Email preferences + reminder time picker.
 * Accessible from Profile. Settings saved to server (queued offline).
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Switch, Platform,
} from 'react-native';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../theme';
import { requestPushPermission, scheduleDailyReminder } from '../lib/notificationEngine';
import { enqueueWrite } from '../lib/offlineStorage';
import { useAuth } from '../hooks/useAuth';
import DisclaimerFooter from '../components/DisclaimerFooter';

const HOURS = Array.from({ length: 24 }, (_, i) => ({
  value: i,
  label: i === 0 ? '12:00 AM' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM' : `${i - 12}:00 PM`,
}));

export default function NotificationSettingsScreen() {
  const { user } = useAuth();
  const [push,      setPush]      = useState(true);
  const [sms,       setSms]       = useState(false);
  const [email,     setEmail]     = useState(true);
  const [hourLocal, setHourLocal] = useState(19);
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // Schedule local push at chosen hour
    if (push && user) {
      const token = await requestPushPermission();
      if (token) {
        await scheduleDailyReminder({
          userId: user.id,
          trackId: user.current_track ?? 'default',
          userName: user.name ?? 'there',
          progress: 0,
          streak: user.streak ?? 0,
          hourLocal,
        });
        await enqueueWrite('/api/notifications/token', 'POST', { token }, 'normal');
      }
    }
    // Save prefs to server
    await enqueueWrite('/api/notifications/prefs', 'PUT', { push, sms, email, hourLocal }, 'normal');
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>🔔 Notifications</Text>
        <Text style={styles.sub}>
          We'll remind you to keep learning — personalised to your track and streak.
          Never spammy. Always opt-outable.
        </Text>

        {/* Channels */}
        <Text style={styles.sectionHead}>CHANNELS</Text>

        {[
          { key: 'push', label: 'Push Notifications', sub: 'Daily reminder on your device', value: push, set: setPush, recommended: true },
          { key: 'sms',  label: 'SMS',                sub: 'For urgent streak alerts (2+ days missed)', value: sms, set: setSms, recommended: false },
          { key: 'email',label: 'Email',              sub: 'Weekly progress + portfolio milestones', value: email, set: setEmail, recommended: true },
        ].map(ch => (
          <View key={ch.key} style={styles.channelRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.channelLabelRow}>
                <Text style={styles.channelLabel}>{ch.label}</Text>
                {ch.recommended && <View style={styles.recBadge}><Text style={styles.recText}>Recommended</Text></View>}
              </View>
              <Text style={styles.channelSub}>{ch.sub}</Text>
            </View>
            <Switch
              value={ch.value}
              onValueChange={ch.set}
              trackColor={{ false: Colors.border, true: Colors.accent }}
              thumbColor="#fff"
            />
          </View>
        ))}

        {/* Reminder time */}
        {push && (
          <>
            <Text style={styles.sectionHead}>DAILY REMINDER TIME</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeRow}>
              {[7, 8, 9, 12, 17, 18, 19, 20, 21].map(h => (
                <TouchableOpacity
                  key={h}
                  style={[styles.timeChip, hourLocal === h && styles.timeChipActive]}
                  onPress={() => setHourLocal(h)}
                >
                  <Text style={[styles.timeChipText, hourLocal === h && styles.timeChipTextActive]}>
                    {HOURS[h].label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* What they look like */}
        <Text style={styles.sectionHead}>EXAMPLE NOTIFICATIONS</Text>
        <View style={styles.exampleCard}>
          <Text style={styles.exampleTitle}>⚡ Sifter Skill_Up</Text>
          <Text style={styles.exampleBody}>
            "Supply chain analysts earn $75k+ — and you're 40% of the way there. 5 minutes. Let's go."
          </Text>
        </View>
        <View style={styles.exampleCard}>
          <Text style={styles.exampleTitle}>🚨 Come back!</Text>
          <Text style={styles.exampleBody}>
            "2 days since your last lesson. Your future employer is interviewing someone who didn't stop."
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveBtnText}>{saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Preferences'}</Text>
        </TouchableOpacity>

        <Text style={styles.optOutNote}>
          You can disable all notifications at any time from your device settings.
          SMS and email notifications respect local regulations including NDPR (Nigeria).
        </Text>
      </ScrollView>
      <DisclaimerFooter />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  body: { padding: Spacing.lg },
  title: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.text, marginBottom: Spacing.xs },
  sub: { fontSize: FontSize.sm, color: Colors.textSoft, lineHeight: 20, marginBottom: Spacing.xl },
  sectionHead: { fontSize: 10, fontWeight: '800', color: Colors.textMuted, letterSpacing: 1.2, marginBottom: Spacing.sm, marginTop: Spacing.md },
  channelRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm },
  channelLabelRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 2 },
  channelLabel: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.text },
  channelSub: { fontSize: FontSize.xs, color: Colors.textSoft },
  recBadge: { backgroundColor: Colors.greenSoft, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 },
  recText: { fontSize: 9, fontWeight: '800', color: Colors.green },
  timeRow: { marginBottom: Spacing.md },
  timeChip: { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, marginRight: Spacing.xs, backgroundColor: '#fff' },
  timeChipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  timeChipText: { fontSize: FontSize.xs, color: Colors.text, fontWeight: '600' },
  timeChipTextActive: { color: '#fff', fontWeight: '800' },
  exampleCard: { backgroundColor: Colors.navy, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm },
  exampleTitle: { fontSize: FontSize.xs, fontWeight: '800', color: Colors.gold, marginBottom: 4 },
  exampleBody: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.85)', lineHeight: 18, fontStyle: 'italic' },
  saveBtn: { backgroundColor: Colors.accent, borderRadius: Radius.lg, padding: Spacing.lg, alignItems: 'center', marginTop: Spacing.xl, marginBottom: Spacing.md },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: '#fff', fontWeight: '900', fontSize: FontSize.md },
  optOutNote: { fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'center', lineHeight: 18 },
});
