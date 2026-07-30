/**
 * Sifter LevelUp — Referral Screen
 *
 * Direct referral:    user A refers user B → A earns points when B signs up
 * Indirect referral:  user B refers user C → A earns a smaller bonus too
 *
 * Referral points convert to:
 *   - XP boosts
 *   - Access to premium content early
 *   - Real-money credit toward paid tiers (shown in profile)
 */

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Share, ActivityIndicator,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, Spacing, Radius, FontSize, FontWeight, webContainer } from '@/theme';
import { CompassFonts } from '@/theme';
import { API } from '@/lib/api';
import { offlineRead } from '@/lib/offlineQueue';

interface ReferralStats {
  referralCode: string;
  referralUrl: string;
  directReferrals: number;
  indirectReferrals: number;
  totalPoints: number;
  pendingPoints: number;
  recentReferrals: Array<{
    username: string;
    type: 'direct' | 'indirect';
    pointsEarned: number;
    joinedAt: string;
  }>;
}

const REWARD_TIERS = [
  { points: 100,  reward: '⚡ 500 XP Boost',                desc: 'Applied to your account immediately' },
  { points: 500,  reward: '🎯 1 Month Premium',            desc: 'All premium content unlocked for 30 days' },
  { points: 1000, reward: '💰 $10 account credit',         desc: 'Redeemable toward any paid plan' },
  { points: 2500, reward: '🏆 Lifetime discount 20%',      desc: 'Applied permanently to your account' },
  { points: 5000, reward: '⭐ Sifter Ambassador status',    desc: 'Early access + special badge + recognition' },
];

export default function ReferralScreen() {
  const [stats,   setStats]   = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied,  setCopied]  = useState(false);
  const { colors } = useTheme();

  useEffect(() => {
    offlineRead('referral_stats', () => API.getReferralStats(), 5 * 60 * 1000)
      .then(data => setStats(data as ReferralStats))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleShare = async () => {
    if (!stats) return;
    await Share.share({
      message: `I'm building real career skills on Sifter LevelUp — supply chain, quant, data science, and more. Use my link to join free: ${stats.referralUrl}`,
      url: stats.referralUrl,
    });
  };

  const handleCopy = async () => {
    if (!stats) return;
    await Clipboard.setStringAsync(stats.referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color={colors.accentRole.action} />;

  const totalProgress = (stats?.totalPoints ?? 0);
  const nextTier = REWARD_TIERS.find(t => t.points > totalProgress);
  const nextTierProgress = nextTier ? Math.min(100, (totalProgress / nextTier.points) * 100) : 100;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.surface.base }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>🎁</Text>
          <Text style={[styles.heroTitle, { color: colors.textRole.primary }, CompassFonts.displayBold]}>Refer & Earn</Text>
          <Text style={[styles.heroSub, { color: colors.textRole.secondary }]}>
            Earn points for every person who joins through your link — and for everyone they refer too.
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
            <Text style={[styles.statNum, { color: colors.textRole.primary }]}>{stats?.directReferrals ?? 0}</Text>
            <Text style={[styles.statLabel, { color: colors.textRole.secondary }]}>Direct</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
            <Text style={[styles.statNum, { color: colors.textRole.primary }]}>{stats?.indirectReferrals ?? 0}</Text>
            <Text style={[styles.statLabel, { color: colors.textRole.secondary }]}>Indirect</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.accentRole.action }]}>
            <Text style={[styles.statNum, { color: colors.surface.inverse }]}>{stats?.totalPoints ?? 0}</Text>
            <Text style={[styles.statLabel, { color: 'rgba(255,255,255,0.8)' }]}>Points</Text>
          </View>
        </View>

        {/* Progress to next reward */}
        {nextTier && (
          <View style={[styles.progressSection, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
            <Text style={[styles.progressLabel, { color: colors.textRole.secondary }]}>
              {totalProgress} / {nextTier.points} points → {nextTier.reward}
            </Text>
            <View style={[styles.progressTrack, { backgroundColor: colors.borderRole.subtle }]}>
              <View style={[styles.progressFill, { backgroundColor: colors.accentRole.action, width: `${nextTierProgress}%` }]} />
            </View>
          </View>
        )}

        {/* Share link */}
        <View style={[styles.linkCard, { backgroundColor: `${colors.accentRole.action}14`, borderColor: colors.accentRole.action }]}>
          <Text style={[styles.linkLabel, { color: colors.accentRole.action }]}>YOUR REFERRAL LINK</Text>
          <Text style={[styles.linkUrl, { color: colors.textRole.primary }]} numberOfLines={1}>{stats?.referralUrl}</Text>
          <View style={styles.linkBtns}>
            <TouchableOpacity style={[styles.copyBtn, { backgroundColor: colors.surface.raised, borderColor: colors.accentRole.action }]} onPress={handleCopy}>
              <Text style={[styles.copyBtnText, { color: colors.accentRole.action }]}>{copied ? '✓ Copied' : '📋 Copy'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.shareBtn, { backgroundColor: colors.accentRole.action }]} onPress={handleShare}>
              <Text style={[styles.shareBtnText, { color: colors.surface.inverse }]}>Share →</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* How it works */}
        <Text style={[styles.sectionHead, { color: colors.textRole.primary }, CompassFonts.bodyBold]}>How it works</Text>
        <View style={[styles.howCard, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
          {[
            { icon: '1️⃣', text: 'Share your link with anyone who wants to build real career skills' },
            { icon: '2️⃣', text: 'They sign up free — you earn 50 points per direct referral' },
            { icon: '3️⃣', text: 'When they refer someone, you earn 10 points (indirect referral)' },
            { icon: '4️⃣', text: 'Points never expire. Redeem for XP, premium access, or account credit' },
          ].map((step, i) => (
            <View key={i} style={styles.howRow}>
              <Text style={styles.howIcon}>{step.icon}</Text>
              <Text style={[styles.howText, { color: colors.textRole.primary }]}>{step.text}</Text>
            </View>
          ))}
        </View>

        {/* Reward tiers */}
        <Text style={[styles.sectionHead, { color: colors.textRole.primary }, CompassFonts.bodyBold]}>Reward Tiers</Text>
        {REWARD_TIERS.map((tier, i) => (
          <View key={i} style={[styles.tierCard, { backgroundColor: totalProgress >= tier.points ? colors.successSoft : colors.surface.raised, borderColor: totalProgress >= tier.points ? colors.accentRole.success : colors.borderRole.subtle }]}>
            <View style={styles.tierPoints}>
              <Text style={[styles.tierPointsNum, { color: totalProgress >= tier.points ? colors.accentRole.success : colors.textRole.primary }]}>
                {tier.points}
              </Text>
              <Text style={[styles.tierPointsLabel, { color: colors.textRole.muted }]}>pts</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.tierReward, { color: colors.textRole.primary }]}>{tier.reward}</Text>
              <Text style={[styles.tierDesc, { color: colors.textRole.secondary }]}>{tier.desc}</Text>
            </View>
            {totalProgress >= tier.points && <Text style={[styles.tierEarned, { color: colors.accentRole.success }]}>✓</Text>}
          </View>
        ))}

        {/* Recent referrals */}
        {(stats?.recentReferrals?.length ?? 0) > 0 && (
          <>
            <Text style={[styles.sectionHead, { color: colors.textRole.primary }, CompassFonts.bodyBold]}>Recent Activity</Text>
            {stats!.recentReferrals.map((r, i) => (
              <View key={i} style={[styles.referralRow, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.referralName, { color: colors.textRole.primary }]}>{r.username}</Text>
                  <Text style={[styles.referralType, { color: colors.textRole.secondary }]}>{r.type === 'direct' ? 'Direct referral' : 'Indirect referral'}</Text>
                </View>
                <Text style={[styles.referralPoints, { color: colors.accentRole.success }]}>+{r.pointsEarned} pts</Text>
              </View>
            ))}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { ...webContainer },
  hero: { alignItems: 'center', marginBottom: Spacing.xl },
  heroEmoji: { fontSize: 18, marginBottom: Spacing.md },
  heroTitle: { fontSize: FontSize.xxl, fontWeight: '900', marginBottom: Spacing.sm },
  heroSub: { fontSize: FontSize.sm, textAlign: 'center', lineHeight: 20 },

  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  statCard: { flex: 1, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center', borderWidth: 1 },
  statNum: { fontSize: FontSize.xxl, fontWeight: '800' },
  statLabel: { fontSize: FontSize.xs },

  progressSection: { borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.lg, borderWidth: 1 },
  progressLabel: { fontSize: FontSize.xs, marginBottom: Spacing.sm },
  progressTrack: { height: 8, borderRadius: 4 },
  progressFill: { height: 8, borderRadius: 4 },

  linkCard: { borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.lg, borderWidth: 2 },
  linkLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  linkUrl: { fontSize: FontSize.sm, fontWeight: '600', marginBottom: Spacing.md },
  linkBtns: { flexDirection: 'row', gap: Spacing.sm },
  copyBtn: { flex: 1, borderRadius: Radius.sm, padding: Spacing.sm, alignItems: 'center', borderWidth: 1 },
  copyBtnText: { fontSize: FontSize.sm, fontWeight: '800' },
  shareBtn: { flex: 1, borderRadius: Radius.sm, padding: Spacing.sm, alignItems: 'center' },
  shareBtnText: { fontSize: FontSize.sm, fontWeight: '800' },

  sectionHead: { fontSize: FontSize.md, fontWeight: '800', marginBottom: Spacing.sm, marginTop: Spacing.md },
  howCard: { borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 1 },
  howRow: { flexDirection: 'row', gap: Spacing.sm, paddingVertical: Spacing.xs },
  howIcon: { fontSize: 18, width: 26 },
  howText: { flex: 1, fontSize: FontSize.sm, lineHeight: 20 },

  tierCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1 },
  tierPoints: { width: 48, alignItems: 'center' },
  tierPointsNum: { fontSize: FontSize.md, fontWeight: '800' },
  tierPointsLabel: { fontSize: 10 },
  tierReward: { fontSize: FontSize.sm, fontWeight: '800' },
  tierDesc: { fontSize: FontSize.xs },
  tierEarned: { fontSize: 20, fontWeight: '800' },

  referralRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, borderRadius: Radius.md, marginBottom: Spacing.sm, borderWidth: 1 },
  referralName: { fontSize: FontSize.sm, fontWeight: '800' },
  referralType: { fontSize: FontSize.xs },
  referralPoints: { fontSize: FontSize.md, fontWeight: '800' },
});
