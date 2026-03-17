/**
 * Sifter Skill_Up — Learn More Screen
 * 
 * Surfaced from the onboarding disclaimer and the footer on every screen.
 * Converts the legal disclaimer into genuine user value:
 *   - Why we say this (honesty)
 *   - How to use Sifter most effectively
 *   - Curated external resources per track
 *   - What we don't guarantee (plain English)
 *   - Full Terms summary with link
 */

import React, { useState } from 'react';
import {
  View, Modal, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Linking,
} from 'react-native';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../theme';
import TermsScreen from './TermsScreen';
import PrivacyScreen from './PrivacyScreen';
import {
  getResourcesForTrack, RESOURCE_TYPE_LABELS,
  ExternalResource,
} from '../data/externalResources';

interface Props {
  trackId?: string;
  onClose?: () => void;
}

type Tab = 'about' | 'resources' | 'terms';

function ResourceCard({ resource }: { resource: ExternalResource }) {
  return (
    <TouchableOpacity
      style={styles.resourceCard}
      onPress={() => Linking.openURL(resource.url).catch(() => {})}
      activeOpacity={0.75}
    >
      <View style={styles.resourceHeader}>
        <Text style={styles.resourceType}>{RESOURCE_TYPE_LABELS[resource.type]}</Text>
        {resource.free && (
          <View style={styles.freeBadge}><Text style={styles.freeBadgeText}>FREE</Text></View>
        )}
      </View>
      <Text style={styles.resourceTitle}>{resource.title}</Text>
      <Text style={styles.resourceDesc}>{resource.description}</Text>
      <Text style={styles.resourceLink}>Open ↗</Text>
    </TouchableOpacity>
  );
}

export default function LearnMoreScreen({ trackId = 'supply-chain-analyst', onClose }: Props) {
  const [tab, setTab] = useState<Tab>('about');
  const [showFullTerms, setShowFullTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const resources = getResourcesForTrack(trackId);

  const groupedResources = resources.reduce((acc, r) => {
    if (!acc[r.type]) acc[r.type] = [];
    acc[r.type].push(r);
    return acc;
  }, {} as Record<string, ExternalResource[]>);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>📖 Learn More</Text>
          <Text style={styles.headerSub}>How to get the most from Sifter</Text>
        </View>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.tabBar}>
        {(['about', 'resources', 'terms'] as Tab[]).map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabLabel, tab === t && styles.tabLabelActive]}>
              {t === 'about' ? 'About' : t === 'resources' ? 'Resources' : 'Terms'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>

        {/* ── ABOUT TAB ── */}
        {tab === 'about' && (
          <>
            <View style={styles.heroCard}>
              <Text style={styles.heroEmoji}>🚀</Text>
              <Text style={styles.heroTitle}>We're your launchpad, not your only source.</Text>
              <Text style={styles.heroBody}>
                Sifter Skill_Up is built to give you the foundation, practice, and verified portfolio
                artifacts that real employers look for. But the best professionals combine multiple
                sources — books, mentors, communities, real projects, and experience.
                {'\n\n'}
                We'll help you build the skills. You take them into the world.
              </Text>
            </View>

            <Text style={styles.sectionHead}>HOW TO GET THE MOST FROM SIFTER</Text>
            {[
              { icon: '📋', title: 'Complete paths in order', body: 'Foundation → Intermediate → Senior. Each level builds on the last. Skipping levels means missing context that the next level assumes.' },
              { icon: '🏗️', title: 'Build real projects outside the app', body: 'Our simulators are practice. Real projects — even small ones — are what interviewers ask about. Use what you learn here to build something real.' },
              { icon: '👥', title: 'Join communities in your field', body: 'Reddit, Discord, LinkedIn groups. Real practitioners share what interviews are actually like, what tools teams actually use, and where jobs actually are.' },
              { icon: '🧑‍🏫', title: 'Find a mentor', body: 'ADPList offers free 1:1 mentorship from senior professionals. A 30-minute call with someone in your target role is worth weeks of solo study.' },
              { icon: '📚', title: 'Read at least one book in your field', body: 'Books go deeper than any app. The resources tab has our pick for your career path.' },
            ].map((item, i) => (
              <View key={i} style={styles.tipCard}>
                <Text style={styles.tipIcon}>{item.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.tipTitle}>{item.title}</Text>
                  <Text style={styles.tipBody}>{item.body}</Text>
                </View>
              </View>
            ))}

            <View style={styles.honestBox}>
              <Text style={styles.honestTitle}>What we don't guarantee</Text>
              <Text style={styles.honestBody}>
                We can't promise you'll get a job. We can promise you'll build real, verifiable skills
                that make you a stronger candidate.{'\n\n'}
                Your success depends on your effort, your network, local market conditions, and factors
                outside anyone's control. We're honest about that because we respect you.
              </Text>
            </View>
          </>
        )}

        {/* ── RESOURCES TAB ── */}
        {tab === 'resources' && (
          <>
            <Text style={styles.resourcesIntro}>
              These are resources we genuinely recommend — not sponsored, not affiliate-linked.
              Combine them with Sifter for the strongest possible foundation.
            </Text>
            {Object.entries(groupedResources).map(([type, items]) => (
              <View key={type}>
                <Text style={styles.resourceGroupLabel}>{RESOURCE_TYPE_LABELS[type as any]}</Text>
                {items.map((r, i) => <ResourceCard key={i} resource={r} />)}
              </View>
            ))}
            <View style={styles.noEndorseNote}>
              <Text style={styles.noEndorseText}>
                🔗 These links open external sites. Sifter Skill_Up is not affiliated with or
                endorsed by any of these platforms. We link to them because they're genuinely useful.
              </Text>
            </View>
          </>
        )}

        {/* ── TERMS TAB ── */}
        {tab === 'terms' && (
          <>
            <Text style={styles.termsIntro}>
              We've written this in plain English. A lawyer reviewed it.
              Full legal text is at sifter.app/terms — this is the human version.
            </Text>

            {[
              {
                title: 'What Sifter Skill_Up is',
                body: 'An educational platform. We teach career skills through lessons, simulations, and portfolio projects. We are not a recruitment agency, career counsellor, or job placement service.',
              },
              {
                title: 'No job guarantee',
                body: 'Completing any career path on Sifter does not guarantee job placement, interview opportunities, or any specific career outcome. We can\'t promise the market will hire you — we can promise the skills you\'re building are real and verifiable.',
              },
              {
                title: 'Interview Mode is practice',
                body: 'Our Interview Mode simulates common industry interview patterns. It is practice only. We do not have access to actual questions from any employer. Real interviews may differ significantly.',
              },
              {
                title: 'Your portfolio content is yours',
                body: 'You own everything you create on Sifter. We license it only to display it in-app and to power the portfolio push feature you initiate. We will never sell your work or use it to train AI models without your explicit permission.',
              },
              {
                title: 'Profile push and third-party platforms',
                body: 'When you push your portfolio to LinkedIn, GitHub, or other platforms, you authorise us to act as your limited agent for that specific action. You are responsible for maintaining those accounts and complying with their terms. We are not responsible for third-party platform decisions.',
              },
              {
                title: 'OAuth and account security',
                body: 'We never store your passwords. We use OAuth tokens — temporary access keys granted by the platform with your permission. You can revoke access at any time from your connected accounts settings or directly on the third-party platform.',
              },
              {
                title: 'We can terminate access',
                body: 'If you abuse the platform, post harmful content in guilds, or violate these terms, we may terminate your access. We\'ll try to give you notice unless the violation is serious.',
              },
              {
                title: 'Data and privacy',
                body: 'Your diary is encrypted and never leaves your device. Your progress data is stored on our servers to enable multi-device access and restore after phone changes. We don\'t sell your data. Full privacy policy at sifter.app/privacy.',
              },
              {
                title: 'Governing law',
                body: 'These terms are governed by the laws of the Federal Republic of Nigeria. Disputes are subject to Nigerian jurisdiction unless required otherwise by applicable law in your country.',
              },
              {
                title: 'Get a lawyer',
                body: 'If you have specific legal concerns about your use of the platform, consult a qualified legal professional in your jurisdiction. We\'re educators, not lawyers.',
              },
            ].map((section, i) => (
              <View key={i} style={styles.termsSection}>
                <Text style={styles.termsSectionTitle}>{section.title}</Text>
                <Text style={styles.termsSectionBody}>{section.body}</Text>
              </View>
            ))}

            <TouchableOpacity
              style={styles.fullTermsBtn}
              onPress={() => setShowFullTerms(true)}
            >
              <Text style={styles.fullTermsBtnText}>Read full legal terms at sifter.app/terms ↗</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal visible={showFullTerms} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowFullTerms(false)}>
        <TermsScreen onClose={() => setShowFullTerms(false)} />
      </Modal>
      <Modal visible={showPrivacy} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowPrivacy(false)}>
        <PrivacyScreen onClose={() => setShowPrivacy(false)} />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border,
    backgroundColor: '#fff',
  },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.text },
  headerSub: { fontSize: FontSize.xs, color: Colors.textSoft, marginTop: 2 },
  closeBtn: { padding: Spacing.xs },
  closeBtnText: { fontSize: 18, color: Colors.textSoft },

  tabBar: {
    flexDirection: 'row', backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  tabBtn: { flex: 1, paddingVertical: Spacing.sm, alignItems: 'center' },
  tabBtnActive: { borderBottomWidth: 2, borderBottomColor: Colors.accent },
  tabLabel: { fontSize: 12, fontWeight: '600', color: Colors.textSoft },
  tabLabelActive: { color: Colors.accent, fontWeight: '800' },

  body: { padding: Spacing.lg },

  // About tab
  heroCard: {
    backgroundColor: Colors.navy, borderRadius: Radius.xl,
    padding: Spacing.xl, alignItems: 'center', marginBottom: Spacing.xl,
  },
  heroEmoji: { fontSize: 40, marginBottom: Spacing.md },
  heroTitle: {
    fontSize: FontSize.lg, fontWeight: '900', color: '#fff',
    textAlign: 'center', marginBottom: Spacing.md,
  },
  heroBody: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.8)', lineHeight: 22, textAlign: 'center' },

  sectionHead: {
    fontSize: 10, fontWeight: '800', color: Colors.textMuted,
    letterSpacing: 1.2, marginBottom: Spacing.md,
  },
  tipCard: {
    flexDirection: 'row', gap: Spacing.sm, backgroundColor: '#fff',
    borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border, ...Shadow.sm,
  },
  tipIcon: { fontSize: 22, width: 30 },
  tipTitle: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  tipBody: { fontSize: FontSize.xs, color: Colors.textSoft, lineHeight: 18 },

  honestBox: {
    backgroundColor: Colors.accentSoft, borderRadius: Radius.md,
    padding: Spacing.lg, marginTop: Spacing.lg,
    borderLeftWidth: 3, borderLeftColor: Colors.accent,
  },
  honestTitle: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.accent, marginBottom: Spacing.sm },
  honestBody: { fontSize: FontSize.sm, color: Colors.text, lineHeight: 20 },

  // Resources tab
  resourcesIntro: {
    fontSize: FontSize.sm, color: Colors.textSoft, lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  resourceGroupLabel: {
    fontSize: 10, fontWeight: '800', color: Colors.textMuted,
    letterSpacing: 1.2, marginBottom: Spacing.sm, marginTop: Spacing.md,
  },
  resourceCard: {
    backgroundColor: '#fff', borderRadius: Radius.md, padding: Spacing.md,
    marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm,
  },
  resourceHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  resourceType: { fontSize: 11, color: Colors.accent, fontWeight: '700' },
  freeBadge: {
    backgroundColor: Colors.greenSoft, borderRadius: 4,
    paddingHorizontal: 6, paddingVertical: 1,
  },
  freeBadgeText: { fontSize: 9, fontWeight: '800', color: Colors.green },
  resourceTitle: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  resourceDesc: { fontSize: FontSize.xs, color: Colors.textSoft, lineHeight: 16, marginBottom: 6 },
  resourceLink: { fontSize: FontSize.xs, color: Colors.accent, fontWeight: '700', alignSelf: 'flex-end' },

  noEndorseNote: {
    backgroundColor: Colors.bg, borderRadius: Radius.md, padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.border, marginTop: Spacing.md,
  },
  noEndorseText: { fontSize: FontSize.xs, color: Colors.textMuted, lineHeight: 16 },

  // Terms tab
  termsIntro: {
    fontSize: FontSize.sm, color: Colors.textSoft, lineHeight: 20,
    marginBottom: Spacing.xl, fontStyle: 'italic',
  },
  termsSection: {
    backgroundColor: '#fff', borderRadius: Radius.md, padding: Spacing.md,
    marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border,
  },
  termsSectionTitle: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.text, marginBottom: 6 },
  termsSectionBody: { fontSize: FontSize.xs, color: Colors.textSoft, lineHeight: 18 },
  fullTermsBtn: {
    borderWidth: 1, borderColor: Colors.accent, borderRadius: Radius.md,
    padding: Spacing.md, alignItems: 'center', marginTop: Spacing.md,
  },
  fullTermsBtnText: { fontSize: FontSize.sm, color: Colors.accent, fontWeight: '700' },
});
