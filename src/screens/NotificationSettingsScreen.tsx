import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Radius, Shadow, Spacing, FontSize, FontWeight, useTheme } from '../theme';
import { requestPushPermission, scheduleDailyReminder } from '../lib/notificationEngine';
import { enqueueWrite } from '../lib/offlineStorage';
import { useAuth } from '../hooks/useAuth';
import DisclaimerFooter from '../components/DisclaimerFooter';
import { resolveTrackContext } from '../lib/trackContext';

const HOURS = Array.from({ length: 24 }, (_, i) => ({
  value: i,
  label: i === 0 ? '12:00 AM' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM' : `${i - 12}:00 PM`,
}));

function SettingsCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, Shadow.sm]}>
      <Text style={[styles.cardTitle, { color: colors.textMuted }]}>{title}</Text>
      {children}
    </View>
  );
}

export default function NotificationSettingsScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const trackContext = useMemo(() => resolveTrackContext(user), [user]);
  const [push, setPush] = useState(true);
  const [sms, setSms] = useState(false);
  const [email, setEmail] = useState(true);
  const [hourLocal, setHourLocal] = useState(19);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const workspaceLabel = trackContext.mode === 'track' ? trackContext.trackName : 'your active workspace';
  const reminderPreview = push
    ? `Daily reminder at ${HOURS[hourLocal].label}`
    : 'No scheduled daily reminder';

  const handleSave = async () => {
    setSaving(true);

    if (push && user) {
      const token = await requestPushPermission();
      if (token) {
        await scheduleDailyReminder({
          userId: user.id,
          trackId: user.current_track_id ?? 'default',
          userName: user.username ?? 'there',
          progress: 0,
          streak: user.streak ?? 0,
          hourLocal,
        });
        await enqueueWrite('/api/notifications/token', 'POST', { token }, 'normal');
      }
    }

    await enqueueWrite('/api/notifications/prefs', 'PUT', { push, sms, email, hourLocal }, 'normal');
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const channels = [
    {
      key: 'push',
      label: 'Push reminders',
      sub: `The main daily nudge for ${workspaceLabel}.`,
      value: push,
      set: setPush,
      recommended: true,
    },
    {
      key: 'sms',
      label: 'SMS alerts',
      sub: 'Reserved for high-risk streak recovery moments.',
      value: sms,
      set: setSms,
      recommended: false,
    },
    {
      key: 'email',
      label: 'Email digests',
      sub: 'Weekly progress, artifact milestones, and recap messages.',
      value: email,
      set: setEmail,
      recommended: true,
    },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { backgroundColor: colors.card, borderColor: colors.border }, Shadow.sm]}>
          <Text style={[styles.heroEyebrow, { color: colors.textMuted }]}>Notifications</Text>
          <Text style={[styles.heroTitle, { color: colors.text }]}>Keep the reminders useful, not noisy.</Text>
          <Text style={[styles.heroBody, { color: colors.textSoft }]}>
            Delivery is tuned around {workspaceLabel}, your streak timing, and the channels you actually want to hear from.
          </Text>
        </View>

        <SettingsCard title="DELIVERY CHANNELS">
          {channels.map((channel, index) => (
            <View
              key={channel.key}
              style={[
                styles.channelRow,
                { borderTopColor: index === 0 ? 'transparent' : colors.border },
              ]}
            >
              <View style={styles.channelCopy}>
                <View style={styles.channelLabelRow}>
                  <Text style={[styles.channelLabel, { color: colors.text }]}>{channel.label}</Text>
                  {channel.recommended ? (
                    <View style={[styles.recBadge, { backgroundColor: colors.accentSoft }]}>
                      <Text style={[styles.recText, { color: colors.accent }]}>Recommended</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={[styles.channelSub, { color: colors.textSoft }]}>{channel.sub}</Text>
              </View>

              <Switch
                value={channel.value}
                onValueChange={channel.set}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor="#fff"
              />
            </View>
          ))}
        </SettingsCard>

        <SettingsCard title="REMINDER TIMING">
          <Text style={[styles.cardHeadline, { color: colors.text }]}>Daily rhythm</Text>
          <Text style={[styles.cardBody, { color: colors.textSoft }]}>
            {reminderPreview}. Choose the time you are most likely to protect your streak and continue your workspace.
          </Text>

          {push ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.timeRow}
            >
              {[7, 8, 9, 12, 17, 18, 19, 20, 21].map(hour => {
                const active = hourLocal === hour;
                return (
                  <TouchableOpacity
                    key={hour}
                    activeOpacity={0.85}
                    onPress={() => setHourLocal(hour)}
                    style={[
                      styles.timeChip,
                      {
                        backgroundColor: active ? colors.accent : colors.bgSecondary,
                        borderColor: active ? colors.accent : colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.timeChipText, { color: active ? '#fff' : colors.text }]}>
                      {HOURS[hour].label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          ) : (
            <View style={[styles.infoPanel, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
              <Text style={[styles.infoPanelText, { color: colors.textSoft }]}>
                Turn push reminders back on if you want a scheduled daily reminder time.
              </Text>
            </View>
          )}
        </SettingsCard>

        <SettingsCard title="PREVIEW">
          <View style={[styles.previewCard, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
            <Text style={[styles.previewTitle, { color: colors.text }]}>Daily reminder</Text>
            <Text style={[styles.previewBody, { color: colors.textSoft }]}>
              You still have time to make progress in {workspaceLabel}. A quick session today keeps your streak moving.
            </Text>
          </View>
          <View style={[styles.previewCard, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
            <Text style={[styles.previewTitle, { color: colors.text }]}>Recovery alert</Text>
            <Text style={[styles.previewBody, { color: colors.textSoft }]}>
              Your streak needs attention. Re-open your workspace today to avoid losing momentum.
            </Text>
          </View>
        </SettingsCard>

        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.saveBtn, { backgroundColor: colors.accent }, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveBtnText}>
            {saving ? 'Saving...' : saved ? 'Saved' : 'Save Preferences'}
          </Text>
        </TouchableOpacity>

        <Text style={[styles.optOutNote, { color: colors.textMuted }]}>
          You can disable all notifications from device settings at any time. SMS and email preferences still follow local privacy and delivery rules.
        </Text>
      </ScrollView>
      <DisclaimerFooter />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  body: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.md,
  },
  hero: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  heroEyebrow: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.black,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.black,
  },
  heroBody: {
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  card: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  cardTitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.black,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  cardHeadline: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.black,
  },
  cardBody: {
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
  },
  channelCopy: {
    flex: 1,
    gap: 3,
  },
  channelLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  channelLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.black,
  },
  channelSub: {
    fontSize: FontSize.xs,
    lineHeight: 18,
  },
  recBadge: {
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  recText: {
    fontSize: 10,
    fontWeight: FontWeight.black,
  },
  timeRow: {
    paddingTop: Spacing.xs,
    gap: Spacing.xs,
  },
  timeChip: {
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    marginRight: Spacing.xs,
  },
  timeChipText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  infoPanel: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  infoPanelText: {
    fontSize: FontSize.xs,
    lineHeight: 18,
  },
  previewCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    gap: 4,
  },
  previewTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.black,
  },
  previewBody: {
    fontSize: FontSize.xs,
    lineHeight: 18,
  },
  saveBtn: {
    borderRadius: Radius.xl,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: FontSize.md,
    fontWeight: FontWeight.black,
  },
  optOutNote: {
    fontSize: FontSize.xs,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: Spacing.sm,
  },
});
