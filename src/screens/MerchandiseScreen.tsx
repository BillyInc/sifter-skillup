/**
 * Sifter LevelUp — Merchandise Screen
 * Credits wallet + unlock-gated apparel catalogue.
 *
 * 3 LAYOUTS:
 *   Web ≥768px  → left credits/wallet panel + right 3-column item grid
 *   Web <768px  → full-width, credits strip at top, 2-column grid
 *   Mobile      → full-width, credits strip at top, 2-column grid
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, ScrollView, TouchableOpacity,
  SafeAreaView, Platform, useWindowDimensions, Linking, Modal,
} from 'react-native';
import { useTheme, Spacing, Radius, FontSize, FontWeight, Shadow, webContainer } from '../theme';
import { useAuth } from '../hooks/useAuth';
import { rewardsEngine } from '../lib/rewardsEngine';
import { creditsToUSD } from '../theme/rewards';
import { merchandiseItems } from '../data/merchandiseItems';
import type { MerchandiseItem } from '../types/social';

const CATEGORIES = [
  { id: 'all', label: 'All' }, { id: 'hoodie', label: 'Hoodies' },
  { id: 'tee', label: 'Tees' }, { id: 'cap', label: 'Caps' },
  { id: 'footwear', label: 'Shoes' },
  { id: 'accessory', label: 'Accessories' },
];

export default function MerchandiseScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { user }   = useAuth();
  const { width }  = useWindowDimensions();
  const isWebWide  = Platform.OS === 'web' && width >= 768;
  const [category,    setCategory]    = useState('all');
  const [selected,    setSelected]    = useState<MerchandiseItem | null>(null);
  const [showDetail,  setShowDetail]  = useState(false);

  const rewardsUser = user
    ? ({
        ...user,
        completed_levels: (user.completed_levels ?? []).map(level => Number(level)),
      } as any)
    : null;

  const credits = rewardsUser ? rewardsEngine.getMerchCreditsBalance(rewardsUser) : 0;

  const items = merchandiseItems.filter(item => {
    const catMatch = category === 'all' || item.category === category;
    return catMatch;
  });

  const isUnlocked = (item: MerchandiseItem) =>
    rewardsUser ? rewardsEngine.isMerchandiseUnlocked(item, rewardsUser) : item.unlock_condition.type === 'open';

  const creditsDiscount = (item: MerchandiseItem): number => {
    const maxDiscount = item.price_usd * 0.5;              // 50% cap
    const creditsValue = creditsToUSD(Math.min(credits, item.merch_credits_cost));
    return Math.min(creditsValue, maxDiscount);
  };

  const handleShopNow = (item: MerchandiseItem) => {
    if (item.shopify_product_id) {
      Linking.openURL(`https://shop.sifter.app/products/${item.shopify_product_id}`);
    } else {
      // Pre-launch: open interest form
      Linking.openURL('https://sifter.app/merch-interest');
    }
  };

  // ── Credits wallet panel ──────────────────────────────────────────────────

  const WalletPanel = ({ vertical = false }) => (
    <View style={[
      vertical ? styles.walletVertical : styles.walletHorizontal,
      { backgroundColor: colors.card, borderColor: colors.border },
    ]}>
      <View style={[styles.walletGlow, { backgroundColor: colors.goldSoft }]}>
        <Text style={styles.walletIcon}>🪙</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.walletTitle, { color: colors.textMuted }]}>MERCH CREDITS</Text>
        <Text style={[styles.walletBalance, { color: colors.gold }]}>{credits.toLocaleString()}</Text>
        <Text style={[styles.walletValue, { color: colors.textSoft }]}>
          Approx. ${creditsToUSD(credits).toFixed(0)} toward any item
        </Text>
      </View>
      {vertical && (
        <View style={styles.walletStats}>
          <Text style={[styles.walletStatLabel, { color: colors.textMuted }]}>HOW TO EARN</Text>
          {[
            { label: 'Complete a track', credits: '+25' },
            { label: 'Master a field',   credits: '+100' },
            { label: 'Win a challenge',  credits: '+50' },
            { label: 'Complete a lab',   credits: '+1' },
          ].map(s => (
            <View key={s.label} style={styles.walletStatRow}>
              <Text style={[styles.walletStatItem, { color: colors.textSoft }]}>{s.label}</Text>
              <Text style={[styles.walletStatCredits, { color: colors.gold }]}>{s.credits}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  // ── Item card ─────────────────────────────────────────────────────────────

  const ItemCard = ({ item }: { item: MerchandiseItem }) => {
    const unlocked  = isUnlocked(item);
    const discount  = creditsDiscount(item);
    const finalPrice= Math.max(0, item.price_usd - discount);

    return (
      <TouchableOpacity
        style={[
          styles.itemCard,
          { backgroundColor: colors.card, borderColor: unlocked ? colors.border : colors.bgSecondary },
          unlocked && Shadow.sm,
        ]}
        onPress={() => { setSelected(item); setShowDetail(true); }}
        activeOpacity={0.85}
      >
        {/* Placeholder image or emoji */}
        <View style={[styles.itemImgBox, {
          backgroundColor: unlocked ? colors.goldSoft : colors.bgSecondary,
        }]}>
          <Text style={[styles.itemEmoji, { opacity: unlocked ? 1 : 0.3 }]}>
            {item.category === 'hoodie' ? '🧥'
              : item.category === 'tee'  ? '👕'
              : item.category === 'cap'  ? '🧢'
              : item.category === 'footwear' ? '👟'
              : '🎒'}
          </Text>
          {!unlocked && (
            <View style={styles.lockedOverlay}>
              <Text style={styles.lockIcon}>🔒</Text>
            </View>
          )}
          {unlocked && (
            <View style={[styles.unlockedBadge, { backgroundColor: colors.gold }]}>
              <Text style={styles.unlockedBadgeText}>UNLOCKED</Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.itemInfo}>
          <Text style={[styles.itemName, { color: unlocked ? colors.text : colors.textMuted }]} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={[styles.itemEmbedding, { color: colors.textMuted }]} numberOfLines={1}>
            {item.technical_embedding}
          </Text>

          <View style={styles.priceRow}>
            {discount > 0 ? (
              <>
                <Text style={[styles.originalPrice, { color: colors.textMuted }]}>${item.price_usd}</Text>
                <Text style={[styles.finalPrice, { color: colors.accent }]}>${finalPrice.toFixed(0)}</Text>
              </>
            ) : (
              <Text style={[styles.finalPrice, { color: unlocked ? colors.text : colors.textMuted }]}>
                ${item.price_usd}
              </Text>
            )}
          </View>

          {!unlocked && (
            <Text style={[styles.unlockHint, { color: colors.textMuted }]} numberOfLines={2}>
              Locked: {item.unlock_condition.description}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // ── Item detail modal ─────────────────────────────────────────────────────

  const DetailModal = () => {
    if (!selected) return null;
    const unlocked = isUnlocked(selected);
    const discount = creditsDiscount(selected);
    const final    = Math.max(0, selected.price_usd - discount);

    return (
      <Modal visible={showDetail} animationType="slide" transparent presentationStyle="pageSheet">
        <View style={[styles.modalBg, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
          <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={() => setShowDetail(false)} />
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <View style={[styles.modalImgBox, { backgroundColor: colors.goldSoft }]}>
              <Text style={styles.modalEmoji}>
                {selected.category === 'hoodie' ? '🧥' : selected.category === 'tee' ? '👕' : selected.category === 'footwear' ? '👟' : '🧢'}
              </Text>
            </View>

            <ScrollView contentContainerStyle={styles.modalContent}>
              <Text style={[styles.modalName, { color: colors.text }]}>{selected.name}</Text>
              <Text style={[styles.modalDesc, { color: colors.textSoft }]}>{selected.description}</Text>

              <View style={[styles.embeddingBox, { backgroundColor: colors.bgSecondary }]}>
                <Text style={[styles.embeddingLabel, { color: colors.textMuted }]}>TECHNICAL EMBEDDING</Text>
                <Text style={[styles.embeddingValue, { color: colors.accent }]}>{selected.technical_embedding}</Text>
              </View>

              {/* Price block */}
              <View style={[styles.priceBlock, { backgroundColor: colors.bgSecondary }]}>
                <View style={styles.priceBlockRow}>
                  <Text style={[styles.priceBlockLabel, { color: colors.textMuted }]}>Retail price</Text>
                  <Text style={[styles.priceBlockValue, { color: colors.text }]}>${selected.price_usd}</Text>
                </View>
                {credits > 0 && discount > 0 && (
                  <View style={styles.priceBlockRow}>
                    <Text style={[styles.priceBlockLabel, { color: colors.gold }]}>Credits discount ({credits} credits)</Text>
                    <Text style={[styles.priceBlockValue, { color: colors.gold }]}>−${discount.toFixed(0)}</Text>
                  </View>
                )}
                <View style={[styles.priceBlockRow, styles.priceBlockTotal]}>
                  <Text style={[styles.priceBlockLabel, { color: colors.text, fontWeight: FontWeight.black }]}>You pay</Text>
                  <Text style={[styles.priceBlockValue, { color: colors.accent, fontWeight: FontWeight.black, fontSize: FontSize.xl }]}>
                    ${final.toFixed(0)}
                  </Text>
                </View>
              </View>

              {/* Unlock state */}
              {!unlocked && (
                <View style={[styles.unlockBlock, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
                  <Text style={[styles.unlockBlockTitle, { color: colors.text }]}>Locked</Text>
                  <Text style={[styles.unlockBlockSub, { color: colors.textMuted }]}>
                    {selected.unlock_condition.description}
                  </Text>
                </View>
              )}

              {/* CTA */}
              <TouchableOpacity
                style={[styles.shopBtn, { backgroundColor: unlocked ? colors.accent : colors.bgSecondary }]}
                onPress={() => unlocked && handleShopNow(selected)}
                disabled={!unlocked}
              >
                <Text style={[styles.shopBtnText, { color: unlocked ? '#fff' : colors.textMuted }]}>
                  {unlocked ? 'Shop now' : 'Complete track to unlock'}
                </Text>
              </TouchableOpacity>

              <Text style={[styles.comingSoon, { color: colors.textMuted }]}>
                Sifter Apparel Store, launching 2026. Notify me when available.
              </Text>
            </ScrollView>

            <TouchableOpacity style={[styles.modalClose, { borderTopColor: colors.border }]} onPress={() => setShowDetail(false)}>
              <Text style={[styles.modalCloseText, { color: colors.textMuted }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  // ── Category chips ────────────────────────────────────────────────────────

  const CategoryChips = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}
      style={[styles.chipScroll, { borderBottomColor: colors.border }]}
      contentContainerStyle={styles.chipRow}
    >
      {CATEGORIES.map(c => {
        const isActive = category === c.id;
        return (
          <TouchableOpacity
            key={c.id}
            style={[styles.chip, { backgroundColor: isActive ? colors.gold : colors.card, borderColor: isActive ? colors.gold : colors.border }]}
            onPress={() => setCategory(c.id)}
          >
            <Text style={[styles.chipText, { color: isActive ? '#fff' : colors.textSoft }]}>{c.label}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  // ── Render ────────────────────────────────────────────────────────────────

  if (isWebWide) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
        <View style={[styles.webRoot, { backgroundColor: colors.bg }]}>
          {/* Left wallet panel */}
          <ScrollView style={[styles.webLeft, { borderRightColor: colors.border }]}>
            <WalletPanel vertical />
          </ScrollView>

          {/* Right: grid with page header */}
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ ...webContainer, paddingBottom: 18 }}>
            <View style={{ marginBottom: 14, paddingBottom: 16, position: 'relative' }}>
              <Text style={{ fontSize: 18, fontWeight: FontWeight.black, color: colors.text, letterSpacing: -0.5, marginBottom: 4 }}>Sifter Apparel</Text>
              <Text style={{ fontSize: FontSize.md, color: colors.textSoft }}>
                {credits.toLocaleString()} merch credits · Earn by completing labs
              </Text>
              <View style={{ position: 'absolute', bottom: 0, left: 0, height: 3, width: 48, borderRadius: Radius.full, backgroundColor: colors.gold }} />
            </View>
            <CategoryChips />
            <FlatList
              data={items}
              keyExtractor={i => i.id}
              numColumns={3}
              key="web3"
              columnWrapperStyle={{ gap: Spacing.md }}
              contentContainerStyle={styles.gridContent}
              renderItem={({ item }) => <View style={{ flex: 1 }}><ItemCard item={item} /></View>}
              showsVerticalScrollIndicator={false}
            />
          </ScrollView>
          <DetailModal />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Sifter Apparel</Text>
      </View>
      <WalletPanel />
      <CategoryChips />
      <FlatList
        data={items}
        keyExtractor={i => i.id}
        numColumns={2}
        columnWrapperStyle={{ gap: Spacing.sm }}
        contentContainerStyle={styles.gridContent}
        renderItem={({ item }) => <View style={{ flex: 1 }}><ItemCard item={item} /></View>}
        showsVerticalScrollIndicator={false}
      />
      <DetailModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen:           { flex: 1 },
  webRoot:          { flex: 1, flexDirection: 'row' },
  webLeft:          { width: 280, borderRightWidth: 1 },
  header:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.lg, borderBottomWidth: 1 },
  headerTitle:      { fontSize: FontSize.xl, fontWeight: FontWeight.black },
  headerSub:        { fontSize: FontSize.xs, fontWeight: FontWeight.bold },

  walletVertical:   { padding: Spacing.lg, gap: Spacing.md, borderBottomWidth: 1 },
  walletHorizontal: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md, margin: Spacing.md, borderRadius: Radius.lg, borderWidth: 1 },
  walletGlow:       { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  walletIcon:       { fontSize: 18 },
  walletTitle:      { fontSize: FontSize.xs, fontWeight: FontWeight.black, letterSpacing: 0.8 },
  walletBalance:    { fontSize: FontSize.xxl, fontWeight: FontWeight.black },
  walletValue:      { fontSize: FontSize.xs },
  walletStats:      { gap: Spacing.xs },
  walletStatLabel:  { fontSize: FontSize.xs, fontWeight: FontWeight.black, letterSpacing: 0.8 },
  walletStatRow:    { flexDirection: 'row', justifyContent: 'space-between' },
  walletStatItem:   { fontSize: FontSize.xs },
  walletStatCredits:{ fontSize: FontSize.xs, fontWeight: FontWeight.bold },

  chipScroll:       { borderBottomWidth: 1, maxHeight: 50 },
  chipRow:          { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: Spacing.xs, flexDirection: 'row', alignItems: 'center' },
  chip:             { paddingHorizontal: Spacing.md, paddingVertical: 5, borderRadius: Radius.full, borderWidth: 1 },
  chipText:         { fontSize: FontSize.xs, fontWeight: FontWeight.bold },

  gridContent:      { padding: Spacing.md, gap: Spacing.md, paddingBottom: 18 },
  itemCard:         { borderRadius: Radius.xl, borderWidth: 1, overflow: 'hidden' },
  itemImgBox:       { height: 130, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  itemEmoji:        { fontSize: 18 },
  lockedOverlay:    { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  lockIcon:         { fontSize: 18 },
  unlockedBadge:    { position: 'absolute', bottom: 6, left: 6, paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.full },
  unlockedBadgeText:{ fontSize: 9, fontWeight: FontWeight.black, color: '#fff' },
  itemInfo:         { padding: Spacing.md, gap: Spacing.xs },
  itemName:         { fontSize: FontSize.sm, fontWeight: FontWeight.black, lineHeight: 18 },
  itemEmbedding:    { fontSize: 10, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  priceRow:         { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  originalPrice:    { fontSize: FontSize.xs, textDecorationLine: 'line-through' },
  finalPrice:       { fontSize: FontSize.md, fontWeight: FontWeight.black },
  unlockHint:       { fontSize: 10, lineHeight: 14 },

  modalBg:          { flex: 1, justifyContent: 'flex-end' },
  modalCard:        { borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, overflow: 'hidden', maxHeight: '90%' },
  modalImgBox:      { height: 180, alignItems: 'center', justifyContent: 'center' },
  modalEmoji:       { fontSize: 18 },
  modalContent:     { padding: Spacing.xl, gap: Spacing.md },
  modalName:        { fontSize: FontSize.xl, fontWeight: FontWeight.black },
  modalDesc:        { fontSize: FontSize.sm, lineHeight: 22 },
  embeddingBox:     { borderRadius: Radius.md, padding: Spacing.md },
  embeddingLabel:   { fontSize: FontSize.xs, fontWeight: FontWeight.black, letterSpacing: 0.8, marginBottom: 4 },
  embeddingValue:   { fontSize: FontSize.sm, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  priceBlock:       { borderRadius: Radius.lg, padding: Spacing.md, gap: Spacing.sm },
  priceBlockRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceBlockLabel:  { fontSize: FontSize.sm },
  priceBlockValue:  { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  priceBlockTotal:  { borderTopWidth: 1, paddingTop: Spacing.sm, marginTop: Spacing.xs },
  unlockBlock:      { borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, gap: Spacing.xs },
  unlockBlockTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.black },
  unlockBlockSub:   { fontSize: FontSize.xs, lineHeight: 18 },
  shopBtn:          { borderRadius: Radius.lg, paddingVertical: Spacing.md, alignItems: 'center' },
  shopBtnText:      { fontSize: FontSize.sm, fontWeight: FontWeight.black },
  comingSoon:       { fontSize: FontSize.xs, textAlign: 'center' },
  modalClose:       { borderTopWidth: 1, paddingVertical: Spacing.md, alignItems: 'center' },
  modalCloseText:   { fontSize: FontSize.md },
});
