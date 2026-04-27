import React, { useMemo, useState } from 'react';
import {
  View, Modal, Text, StyleSheet, ScrollView, TouchableOpacity, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, Spacing, Radius, FontSize, Shadow, webContainer } from '../theme';
import TermsScreen from './TermsScreen';
import PrivacyScreen from './PrivacyScreen';
import {
  getResourcesForTrack, RESOURCE_TYPE_LABELS, ExternalResource,
} from '../data/externalResources';

interface Props {
  trackId?: string;
  onClose?: () => void;
}

type Tab = 'about' | 'resources' | 'terms';

function ResourceCard({ resource }: { resource: ExternalResource }) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.resourceCard, Shadow.sm, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => Linking.openURL(resource.url).catch(() => {})}
      activeOpacity={0.8}
    >
      <View style={styles.resourceHeader}>
        <Text style={[styles.resourceType, { color: colors.accent }]}>{RESOURCE_TYPE_LABELS[resource.type]}</Text>
        {resource.free ? (
          <View style={[styles.freeBadge, { backgroundColor: colors.greenSoft }]}>
            <Text style={[styles.freeBadgeText, { color: colors.green }]}>FREE</Text>
          </View>
        ) : null}
      </View>
      <Text style={[styles.resourceTitle, { color: colors.text }]}>{resource.title}</Text>
      <Text style={[styles.resourceDesc, { color: colors.textSoft }]}>{resource.description}</Text>
      <Text style={[styles.resourceLink, { color: colors.accent }]}>Open resource</Text>
    </TouchableOpacity>
  );
}

export default function LearnMoreScreen({ trackId = 'supply-chain-analyst', onClose }: Props) {
  const { colors } = useTheme();
  const [tab, setTab] = useState<Tab>('about');
  const [showFullTerms, setShowFullTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const resources = getResourcesForTrack(trackId);

  const groupedResources = useMemo(() => resources.reduce((acc, resource) => {
    if (!acc[resource.type]) acc[resource.type] = [];
    acc[resource.type].push(resource);
    return acc;
  }, {} as Record<string, ExternalResource[]>), [resources]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerEyebrow, { color: colors.textMuted }]}>GUIDE</Text>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Learn more about Sifter</Text>
          <Text style={[styles.headerSub, { color: colors.textSoft }]}>
            How the platform works, where to go deeper, and what we do not overpromise.
          </Text>
        </View>
        {onClose ? (
          <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { borderColor: colors.border, backgroundColor: colors.bgSecondary }]}>
            <Text style={[styles.closeBtnText, { color: colors.textSoft }]}>Close</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={[styles.tabBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {(['about', 'resources', 'terms'] as Tab[]).map((item) => {
          const active = tab === item;
          return (
            <TouchableOpacity
              key={item}
              style={[
                styles.tabBtn,
                {
                  backgroundColor: active ? colors.accentSoft : 'transparent',
                  borderColor: active ? `${colors.accent}35` : 'transparent',
                },
              ]}
              onPress={() => setTab(item)}
            >
              <Text style={[styles.tabLabel, { color: active ? colors.accent : colors.textSoft }]}>
                {item === 'about' ? 'About' : item === 'resources' ? 'Resources' : 'Terms'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {tab === 'about' ? (
          <>
            <View style={[styles.heroCard, { backgroundColor: colors.text }]}>
              <Text style={styles.heroTitle}>Use Sifter as a launchpad, not your only source.</Text>
              <Text style={styles.heroBody}>
                We help you build skills, complete simulations, and earn artifacts you can actually talk about.
                The strongest learners still combine this with books, mentors, communities, and real project work.
              </Text>
            </View>

            <Text style={[styles.sectionHead, { color: colors.textMuted }]}>HOW TO GET THE MOST VALUE</Text>
            {[
              ['Complete paths in order', 'Foundations make the later labs and boss gates make sense.'],
              ['Build outside the app', 'Use Sifter work as a springboard for portfolio projects you can show anywhere.'],
              ['Join your field communities', 'Discord, Reddit, and LinkedIn groups help you learn current tools and real hiring signals.'],
              ['Find a mentor', 'A short call with someone already doing the work can save you weeks of guessing.'],
              ['Read one serious book', 'Deep reference material still compounds better than fragments.'],
            ].map(([title, body]) => (
              <View key={title} style={[styles.tipCard, Shadow.sm, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.tipTitle, { color: colors.text }]}>{title}</Text>
                <Text style={[styles.tipBody, { color: colors.textSoft }]}>{body}</Text>
              </View>
            ))}

            <View style={[styles.honestBox, { backgroundColor: colors.accentSoft, borderLeftColor: colors.accent }]}>
              <Text style={[styles.honestTitle, { color: colors.accent }]}>What we do not guarantee</Text>
              <Text style={[styles.honestBody, { color: colors.text }]}>
                We do not promise a job, an interview, or an income outcome. We do aim to help you build clearer proof of skill,
                stronger practice habits, and better material to bring into the real market.
              </Text>
            </View>
          </>
        ) : null}

        {tab === 'resources' ? (
          <>
            <Text style={[styles.resourcesIntro, { color: colors.textSoft }]}>
              These are useful external resources to pair with your active path. They are here because they help, not because they are sponsored.
            </Text>
            {Object.entries(groupedResources).map(([type, items]) => (
              <View key={type}>
                <Text style={[styles.resourceGroupLabel, { color: colors.textMuted }]}>
                  {RESOURCE_TYPE_LABELS[type as keyof typeof RESOURCE_TYPE_LABELS]}
                </Text>
                {items.map((resource) => <ResourceCard key={resource.url} resource={resource} />)}
              </View>
            ))}
            <TouchableOpacity
              style={[styles.secondaryAction, { borderColor: colors.border, backgroundColor: colors.card }]}
              onPress={() => setShowPrivacy(true)}
            >
              <Text style={[styles.secondaryActionText, { color: colors.text }]}>Open privacy policy</Text>
            </TouchableOpacity>
          </>
        ) : null}

        {tab === 'terms' ? (
          <>
            <Text style={[styles.termsIntro, { color: colors.textSoft }]}>
              Plain-English summary first. Full legal and privacy screens are still available below.
            </Text>
            {[
              ['What Sifter is', 'An educational platform for skill-building, simulations, artifacts, and guided practice.'],
              ['No guaranteed outcome', 'Completing a path does not guarantee employment, interviews, or specific income.'],
              ['Interview mode', 'It is practice, not a feed of real employer questions.'],
              ['Your work stays yours', 'We only use your artifacts to show them in-app or push them where you authorize us to.'],
              ['Third-party platforms', 'When you connect LinkedIn, GitHub, and similar platforms, their policies still apply.'],
              ['Privacy stance', 'Your diary stays local, and we do not sell your data.'],
            ].map(([title, body]) => (
              <View key={title} style={[styles.termsSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.termsSectionTitle, { color: colors.text }]}>{title}</Text>
                <Text style={[styles.termsSectionBody, { color: colors.textSoft }]}>{body}</Text>
              </View>
            ))}

            <TouchableOpacity
              style={[styles.primaryAction, { backgroundColor: colors.text }]}
              onPress={() => setShowFullTerms(true)}
            >
              <Text style={styles.primaryActionText}>Read full terms</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.secondaryAction, { borderColor: colors.border, backgroundColor: colors.card }]}
              onPress={() => setShowPrivacy(true)}
            >
              <Text style={[styles.secondaryActionText, { color: colors.text }]}>Open privacy policy</Text>
            </TouchableOpacity>
          </>
        ) : null}

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
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderBottomWidth: 1,
  },
  headerEyebrow: {
    fontSize: FontSize.xs,
    fontWeight: '800',
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: '900',
  },
  headerSub: {
    fontSize: FontSize.sm,
    lineHeight: 19,
    marginTop: 4,
  },
  closeBtn: {
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
  },
  closeBtnText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  tabBar: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  tabBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  tabLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  body: {
    ...webContainer,
    paddingBottom: Spacing.xxxl,
  },
  heroCard: {
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  heroTitle: {
    color: '#fff',
    fontSize: FontSize.lg,
    fontWeight: '900',
    marginBottom: Spacing.sm,
  },
  heroBody: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: FontSize.sm,
    lineHeight: 21,
  },
  sectionHead: {
    fontSize: FontSize.xs,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  tipCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  tipTitle: {
    fontSize: FontSize.sm,
    fontWeight: '800',
    marginBottom: 4,
  },
  tipBody: {
    fontSize: FontSize.xs,
    lineHeight: 18,
  },
  honestBox: {
    borderRadius: Radius.lg,
    borderLeftWidth: 3,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
  },
  honestTitle: {
    fontSize: FontSize.sm,
    fontWeight: '800',
    marginBottom: Spacing.sm,
  },
  honestBody: {
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  resourcesIntro: {
    fontSize: FontSize.sm,
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  resourceGroupLabel: {
    fontSize: FontSize.xs,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  resourceCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  resourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  resourceType: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  freeBadge: {
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  freeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  resourceTitle: {
    fontSize: FontSize.sm,
    fontWeight: '800',
    marginBottom: 4,
  },
  resourceDesc: {
    fontSize: FontSize.xs,
    lineHeight: 17,
  },
  resourceLink: {
    marginTop: Spacing.sm,
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  termsIntro: {
    fontSize: FontSize.sm,
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  termsSection: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  termsSectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: '800',
    marginBottom: 4,
  },
  termsSectionBody: {
    fontSize: FontSize.xs,
    lineHeight: 18,
  },
  primaryAction: {
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  primaryActionText: {
    color: '#fff',
    fontSize: FontSize.sm,
    fontWeight: '800',
  },
  secondaryAction: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  secondaryActionText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
});
