/**
 * Sifter Skill_Up — Referral Screen
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
  SafeAreaView, Share, Clipboard, ActivityIndicator,
} from 'react-native';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../theme';
import { useAuth } from '../hooks/useAuth';
import { API } from '../lib/api';
import { offlineRead } from '../lib/offlineQueue';

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
  const { user } = useAuth();
  const [stats,   setStats]   = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied,  setCopied]  = useState(false);

  useEffect(() => {
    offlineRead('referral_stats', () => API.getReferralStats(), 5 * 60 * 1000)
      .then(data => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleShare = async () => {
    if (!stats) return;
    await Share.share({
      message: `I'm building real career skills on Sifter Skill_Up — supply chain, quant, data science, and more. Use my link to join free: ${stats.referralUrl}`,
      url: stats.referralUrl,
    });
  };

  const handleCopy = async () => {
    if (!stats) return;
    Clipboard.setString(stats.referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color={Colors.accent} />;

  const totalProgress = (stats?.totalPoints ?? 0);
  const nextTier = REWARD_TIERS.find(t => t.points > totalProgress);
  const nextTierProgress = nextTier ? Math.min(100, (totalProgress / nextTier.points) * 100) : 100;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>🎁</Text>
          <Text style={styles.heroTitle}>Refer & Earn</Text>
          <Text style={styles.heroSub}>
            Earn points for every person who joins through your link — and for everyone they refer too.
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{stats?.directReferrals ?? 0}</Text>
            <Text style={styles.statLabel}>Direct</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{stats?.indirectReferrals ?? 0}</Text>
            <Text style={styles.statLabel}>Indirect</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: Colors.accent }]}>
            <Text style={[styles.statNum, { color: '#fff' }]}>{stats?.totalPoints ?? 0}</Text>
            <Text style={[styles.statLabel, { color: 'rgba(255,255,255,0.8)' }]}>Points</Text>
          </View>
        </View>

        {/* Progress to next reward */}
        {nextTier && (
          <View style={styles.progressSection}>
            <Text style={styles.progressLabel}>
              {totalProgress} / {nextTier.points} points → {nextTier.reward}
            </Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${nextTierProgress}%` }]} />
            </View>
          </View>
        )}

        {/* Share link */}
        <View style={styles.linkCard}>
          <Text style={styles.linkLabel}>YOUR REFERRAL LINK</Text>
          <Text style={styles.linkUrl} numberOfLines={1}>{stats?.referralUrl}</Text>
          <View style={styles.linkBtns}>
            <TouchableOpacity style={styles.copyBtn} onPress={handleCopy}>
              <Text style={styles.copyBtnText}>{copied ? '✓ Copied' : '📋 Copy'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
              <Text style={styles.shareBtnText}>Share →</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* How it works */}
        <Text style={styles.sectionHead}>How it works</Text>
        <View style={styles.howCard}>
          {[
            { icon: '1️⃣', text: 'Share your link with anyone who wants to build real career skills' },
            { icon: '2️⃣', text: 'They sign up free — you earn 50 points per direct referral' },
            { icon: '3️⃣', text: 'When they refer someone, you earn 10 points (indirect referral)' },
            { icon: '4️⃣', text: 'Points never expire. Redeem for XP, premium access, or account credit' },
          ].map((step, i) => (
            <View key={i} style={styles.howRow}>
              <Text style={styles.howIcon}>{step.icon}</Text>
              <Text style={styles.howText}>{step.text}</Text>
            </View>
          ))}
        </View>

        {/* Reward tiers */}
        <Text style={styles.sectionHead}>Reward Tiers</Text>
        {REWARD_TIERS.map((tier, i) => (
          <View key={i} style={[styles.tierCard, totalProgress >= tier.points && styles.tierCardEarned]}>
            <View style={styles.tierPoints}>
              <Text style={[styles.tierPointsNum, totalProgress >= tier.points && { color: Colors.green }]}>
                {tier.points}
              </Text>
              <Text style={styles.tierPointsLabel}>pts</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.tierReward}>{tier.reward}</Text>
              <Text style={styles.tierDesc}>{tier.desc}</Text>
            </View>
            {totalProgress >= tier.points && <Text style={styles.tierEarned}>✓</Text>}
          </View>
        ))}

        {/* Recent referrals */}
        {(stats?.recentReferrals?.length ?? 0) > 0 && (
          <>
            <Text style={styles.sectionHead}>Recent Activity</Text>
            {stats!.recentReferrals.map((r, i) => (
              <View key={i} style={styles.referralRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.referralName}>{r.username}</Text>
                  <Text style={styles.referralType}>{r.type === 'direct' ? 'Direct referral' : 'Indirect referral'}</Text>
                </View>
                <Text style={styles.referralPoints}>+{r.pointsEarned} pts</Text>
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
  safe: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.lg },
  hero: { alignItems: 'center', marginBottom: Spacing.xl },
  heroEmoji: { fontSize: 52, marginBottom: Spacing.md },
  heroTitle: { fontSize: FontSize.xxl, fontWeight: '900', color: Colors.text, marginBottom: Spacing.sm },
  heroSub: { fontSize: FontSize.sm, color: Colors.textSoft, textAlign: 'center', lineHeight: 20 },

  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  statNum: { fontSize: FontSize.xxl, fontWeight: '900', color: Colors.text },
  statLabel: { fontSize: FontSize.xs, color: Colors.textSoft },

  progressSection: { backgroundColor: '#fff', borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  progressLabel: { fontSize: FontSize.xs, color: Colors.textSoft, marginBottom: Spacing.sm },
  progressTrack: { height: 8, backgroundColor: Colors.border, borderRadius: 4 },
  progressFill: { height: 8, backgroundColor: Colors.accent, borderRadius: 4 },

  linkCard: { backgroundColor: Colors.accentSoft, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.lg, borderWidth: 2, borderColor: Colors.accent },
  linkLabel: { fontSize: 9, fontWeight: '800', color: Colors.accent, letterSpacing: 1, marginBottom: 4 },
  linkUrl: { fontSize: FontSize.sm, color: Colors.navy, fontWeight: '600', marginBottom: Spacing.md },
  linkBtns: { flexDirection: 'row', gap: Spacing.sm },
  copyBtn: { flex: 1, backgroundColor: '#fff', borderRadius: Radius.sm, padding: Spacing.sm, alignItems: 'center', borderWidth: 1, borderColor: Colors.accent },
  copyBtnText: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.accent },
  shareBtn: { flex: 1, backgroundColor: Colors.accent, borderRadius: Radius.sm, padding: Spacing.sm, alignItems: 'center' },
  shareBtnText: { fontSize: FontSize.sm, fontWeight: '800', color: '#fff' },

  sectionHead: { fontSize: FontSize.md, fontWeight: '800', color: Colors.text, marginBottom: Spacing.sm, marginTop: Spacing.md },
  howCard: { backgroundColor: '#fff', borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  howRow: { flexDirection: 'row', gap: Spacing.sm, paddingVertical: Spacing.xs },
  howIcon: { fontSize: 18, width: 26 },
  howText: { flex: 1, fontSize: FontSize.sm, color: Colors.text, lineHeight: 20 },

  tierCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: '#fff', borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  tierCardEarned: { borderColor: Colors.green, backgroundColor: Colors.greenSoft },
  tierPoints: { width: 48, alignItems: 'center' },
  tierPointsNum: { fontSize: FontSize.md, fontWeight: '900', color: Colors.text },
  tierPointsLabel: { fontSize: 10, color: Colors.textMuted },
  tierReward: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.text },
  tierDesc: { fontSize: FontSize.xs, color: Colors.textSoft },
  tierEarned: { fontSize: 20, color: Colors.green, fontWeight: '800' },

  referralRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, backgroundColor: '#fff', borderRadius: Radius.md, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  referralName: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.text },
  referralType: { fontSize: FontSize.xs, color: Colors.textSoft },
  referralPoints: { fontSize: FontSize.md, fontWeight: '900', color: Colors.green },
});
