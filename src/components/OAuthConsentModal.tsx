/**
 * Pre-connection disclosure modal.
 * Shown before any OAuth connection to GitHub, LinkedIn, Upwork, etc.
 * Required by the authorized agent clause in the Terms.
 * User must explicitly tap "I understand, connect" — no implicit consent.
 */

import React from 'react';
import {
  Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView,
} from 'react-native';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../theme';

interface Props {
  visible: boolean;
  platform: string;
  platformEmoji: string;
  permissions: string[];
  onAccept: () => void;
  onDecline: () => void;
}

export default function OAuthConsentModal({
  visible, platform, platformEmoji, permissions, onAccept, onDecline
}: Props) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onDecline}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.body}>
          <Text style={styles.emoji}>{platformEmoji}</Text>
          <Text style={styles.title}>Connect to {platform}</Text>
          <Text style={styles.sub}>
            Before you connect, here's exactly what Sifter Skill_Up will and won't do with your {platform} account.
          </Text>

          <Text style={styles.sectionLabel}>✅ WE WILL:</Text>
          {permissions.map((p, i) => (
            <View key={i} style={styles.permRow}>
              <Text style={styles.permIcon}>✓</Text>
              <Text style={styles.permText}>{p}</Text>
            </View>
          ))}

          <Text style={[styles.sectionLabel, { marginTop: Spacing.lg }]}>✗ WE WILL NEVER:</Text>
          {[
            'Store your password',
            'Post, push, or update anything without your review and approval',
            'Access more permissions than those listed above',
            'Share your account data with third parties',
            'Continue accessing your account after you revoke access',
          ].map((item, i) => (
            <View key={i} style={styles.permRow}>
              <Text style={[styles.permIcon, { color: Colors.red }]}>✗</Text>
              <Text style={styles.permText}>{item}</Text>
            </View>
          ))}

          <View style={styles.revokeNote}>
            <Text style={styles.revokeText}>
              🔒 You can revoke access at any time from your Sifter account settings
              or directly from {platform}'s connected apps settings. We use OAuth — no passwords stored.
            </Text>
          </View>

          <View style={styles.agentNote}>
            <Text style={styles.agentText}>
              By tapping "Connect", you authorise Sifter Skill_Up to act as your limited agent
              for the specific actions listed above on {platform}, as described in our{' '}
              <Text style={styles.agentLink}>Terms of Service</Text>.
            </Text>
          </View>

          <TouchableOpacity style={styles.acceptBtn} onPress={onAccept}>
            <Text style={styles.acceptBtnText}>I understand — Connect to {platform}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.declineBtn} onPress={onDecline}>
            <Text style={styles.declineBtnText}>Not now</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// Platform-specific permission lists
export const PLATFORM_PERMISSIONS: Record<string, string[]> = {
  LinkedIn: [
    'Read your basic profile (name, headline, photo)',
    'Update your profile with portfolio projects you approve',
    'Post portfolio artifacts to your feed when you initiate it',
  ],
  GitHub: [
    'Create repositories for your portfolio projects (with your approval)',
    'Push code and README files you\'ve completed in Sifter',
    'Read your public profile information',
  ],
  Upwork: [
    'Help you create or update your Upwork profile',
    'Submit portfolio work you approve to your profile',
    'Read your profile to check what\'s already there',
  ],
  Fiverr: [
    'Assist with profile creation using your completed portfolio work',
    'Update your portfolio section with projects you approve',
  ],
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  body: { padding: Spacing.xl, alignItems: 'center' },
  emoji: { fontSize: 48, marginBottom: Spacing.md, marginTop: Spacing.lg },
  title: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.text, marginBottom: Spacing.sm, textAlign: 'center' },
  sub: { fontSize: FontSize.sm, color: Colors.textSoft, textAlign: 'center', lineHeight: 20, marginBottom: Spacing.xl },
  sectionLabel: { fontSize: 10, fontWeight: '800', color: Colors.textMuted, letterSpacing: 1.2, alignSelf: 'flex-start', marginBottom: Spacing.sm },
  permRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, alignSelf: 'stretch', marginBottom: Spacing.xs },
  permIcon: { fontSize: 14, color: Colors.green, fontWeight: '800', width: 16 },
  permText: { flex: 1, fontSize: FontSize.sm, color: Colors.text, lineHeight: 20 },
  revokeNote: { backgroundColor: Colors.greenSoft, borderRadius: Radius.md, padding: Spacing.md, marginTop: Spacing.lg, width: '100%' },
  revokeText: { fontSize: FontSize.xs, color: Colors.green, lineHeight: 18 },
  agentNote: { backgroundColor: Colors.accentSoft, borderRadius: Radius.md, padding: Spacing.md, marginTop: Spacing.sm, width: '100%', borderLeftWidth: 3, borderLeftColor: Colors.accent },
  agentText: { fontSize: FontSize.xs, color: Colors.text, lineHeight: 18 },
  agentLink: { color: Colors.accent, fontWeight: '700', textDecorationLine: 'underline' },
  acceptBtn: { backgroundColor: Colors.accent, borderRadius: Radius.lg, padding: Spacing.lg, width: '100%', alignItems: 'center', marginTop: Spacing.xl },
  acceptBtnText: { color: '#fff', fontWeight: '900', fontSize: FontSize.sm },
  declineBtn: { padding: Spacing.lg, alignItems: 'center' },
  declineBtnText: { fontSize: FontSize.sm, color: Colors.textMuted },
});
