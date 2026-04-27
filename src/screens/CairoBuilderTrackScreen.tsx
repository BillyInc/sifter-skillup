/**
 * Cairo Builder Track Screen
 * Developer track: Write, test, deploy Cairo smart contracts.
 * Accent: #F97316 (orange)
 * Boss IDs: 5001–5020
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, RefreshControl, Linking, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme, Spacing, Radius, FontSize, Shadow } from '../theme';
import { useAuth } from '../hooks/useAuth';
import { API } from '../lib/api';
import { getStarknetLabs } from '../data/tracks/starknet_ecosystem/starknetLessonRegistry';

const ACCENT = '#F97316';

interface LabDef {
  id: string;
  number: number;
  title: string;
  description: string;
  bossLevelId: number;
  tags: string[];
  lessonCount: number;
}

const CAIRO_LAB_UI: Record<number, Omit<LabDef, 'id' | 'number' | 'bossLevelId' | 'lessonCount'>> = {
  0: { title:'Setup & Scarb', description:'Install Scarb, create your first Cairo project, run `scarb build`.', tags:['Tooling','Scarb','Setup'] },
  1: { title:'Cairo Basics & ERC-20', description:'Felt252 types, storage variables, events. Deploy a full ERC-20 to Sepolia.', tags:['Cairo','ERC-20','Sepolia'] },
  2: { title:'Account Abstraction', description:'Custom account contracts, ECDSA signatures, multi-sig patterns.', tags:['AA','Signatures','Multi-sig'] },
  3: { title:'snforge Testing', description:'Write contract tests with snforge_std and a local Starknet test harness.', tags:['Testing','snforge','TDD'] },
  4: { title:'Starkzap SDK Integration', description:'Connect your Cairo contract to the Starkzap SDK for front-end interaction.', tags:['Starkzap','SDK','Integration'] },
  5: { title:'DeFi Primitives: Vault & AMM', description:'Build lending and AMM primitives with Cairo state machines and tests.', tags:['DeFi','Vault','AMM'] },
  6: { title:'Perpetuals Exchange', description:'Model a perpetuals venue with order logic, margin rules, and Sepolia deployment.', tags:['Perps','Advanced','Deploy'] },
  7: { title:'Cairo Architecture Patterns', description:'Dispatcher pattern, component libraries, and upgrade-safe contract structure.', tags:['Architecture','Patterns'] },
  8: { title:'Full Stack: Apibara + FastAPI', description:'Index Starknet events with Apibara and expose them through a FastAPI service.', tags:['Indexer','Apibara','API'] },
  9: { title:'LendingPool Full Stack', description:'Ship an end-to-end lending protocol with contracts, indexing, and UI.', tags:['Full Stack','Lending'] },
  10: { title:'Security Audit I', description:'Use STRIDE and code review to identify concrete vulnerabilities in Cairo systems.', tags:['Security','STRIDE','Audit'] },
  11: { title:'Security Audit II + Fork Tests', description:'Audit a live-style deployment path and validate assumptions with fork-style tests.', tags:['Fork Tests','Advanced Audit'] },
  12: { title:'Final Boss: Reverse Engineer', description:'Reverse engineer, audit, and package a complete Starknet protocol case study.', tags:['Final Boss','GitHub','Certification'] },
};

const CAIRO_LABS: LabDef[] = getStarknetLabs('cairo-builder').map((lab) => {
  const ui = CAIRO_LAB_UI[lab.labNumber];

  return {
    id: lab.labId,
    number: lab.labNumber,
    title: ui?.title ?? `Lab ${lab.labNumber}`,
    description: ui?.description ?? `Complete ${lab.lessons.length} lessons and the boss for Lab ${lab.labNumber}.`,
    bossLevelId: lab.bossLevelId,
    tags: ui?.tags ?? ['Cairo'],
    lessonCount: lab.lessons.length,
  };
});

function LabCard({ lab, unlocked, completed, onPress }: {
  lab: LabDef; unlocked: boolean; completed: boolean; onPress: () => void;
}) {
  const { colors } = useTheme();
  const alpha = unlocked ? 1 : 0.45;

  return (
    <TouchableOpacity
      style={[lc.card, {
        backgroundColor: colors.card ?? '#1A1A2E',
        borderColor: completed ? `${ACCENT}80` : unlocked ? `${ACCENT}30` : colors.border,
        opacity: alpha,
      }]}
      onPress={onPress}
      disabled={!unlocked}
      activeOpacity={0.8}
    >
      <View style={lc.row}>
        <View style={[lc.numBadge, { backgroundColor: completed ? ACCENT : `${ACCENT}20` }]}>
          <Text style={[lc.num, { color: completed ? '#fff' : ACCENT }]}>
            {completed ? '✓' : lab.number === 0 ? '0' : lab.number}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[lc.title, { color: colors.text }]}>{lab.title}</Text>
          <Text style={[lc.desc, { color: colors.textSoft }]} numberOfLines={2}>{lab.description}</Text>
        </View>
        {!unlocked && <Text style={lc.lock}>🔒</Text>}
      </View>
      <View style={lc.tags}>
        {lab.tags.map(t => (
          <View key={t} style={[lc.tag, { backgroundColor: `${ACCENT}15` }]}>
            <Text style={[lc.tagTxt, { color: ACCENT }]}>{t}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}

const lc = StyleSheet.create({
  card:    { borderRadius: Radius.lg, borderWidth: 1.5, padding: Spacing.md, gap: Spacing.sm, ...Shadow.sm },
  row:     { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  numBadge:{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  num:     { fontWeight: '900', fontSize: FontSize.md },
  title:   { fontWeight: '800', fontSize: FontSize.md },
  desc:    { fontSize: FontSize.sm, lineHeight: 18, marginTop: 2 },
  lock:    { fontSize: 18, alignSelf: 'center' },
  tags:    { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  tag:     { borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 2 },
  tagTxt:  { fontSize: 9, fontWeight: '700' },
});

export default function CairoBuilderTrackScreen() {
  const router    = useRouter();
  const { user, updateActiveField }  = useAuth();
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [sepoliaBlock, setSepoliaBlock] = useState<string | null>(null);

  const completedLevels: string[] = (user?.completed_levels ?? user?.completedLevels ?? []).map(String);

  // Lab N is unlocked if the previous registry-backed lab boss is completed (or it's lab 0).
  function isLabUnlocked(lab: LabDef): boolean {
    if (lab.number === 0) return true;
    const previousLab = CAIRO_LABS.find((candidate) => candidate.number === lab.number - 1);
    return previousLab ? completedLevels.includes(String(previousLab.bossLevelId)) : false;
  }
  function isLabCompleted(lab: LabDef): boolean {
    return completedLevels.includes(String(lab.bossLevelId));
  }

  // Fetch live Sepolia block number on mount (proves RPC is live)
  useEffect(() => {
    fetch('https://starknet-sepolia.public.blastapi.io/rpc/v0_7', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'starknet_blockNumber', params: [] }),
    })
      .then(r => r.json())
      .then(d => { if (d.result) setSepoliaBlock(`#${d.result}`); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!user?.id || user.currentTrackId === 'cairo-builder') {
      return;
    }

    void updateActiveField(
      'starknet',
      '#EC4899',
      'cairo-builder',
      'Cairo Builder',
    ).catch(() => {});
  }, [updateActiveField, user?.currentTrackId, user?.id]);

  function handleLabPress(lab: LabDef) {
    router.push({
      pathname: '/world' as any,
      params: {
        worldId: 'cairo-realm',
        trackId: 'cairo-builder',
        trackName: 'Cairo Builder',
        labId: String(lab.number),
        labNumber: String(lab.number),
      },
    });
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const completedCount = CAIRO_LABS.filter(isLabCompleted).length;

  return (
    <SafeAreaView style={[s.screen, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={[s.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.back}>
          <Text style={{ color: ACCENT, fontSize: 16, fontWeight: '700' }}>← Back</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ fontSize: 22, fontWeight: '900', color: colors.text }}>🏗️ Cairo Builder</Text>
          <Text style={{ fontSize: 11, color: colors.textSoft, marginTop: 1 }}>Developer Track</Text>
        </View>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT} />}
      >
        {/* Sepolia live indicator */}
        <View style={[s.sepoliaBanner, { backgroundColor: '#0A2A1A', borderColor: '#00FF8830' }]}>
          <Text style={{ fontSize: 16 }}>⚡</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#00FF88', fontWeight: '800', fontSize: 11 }}>
              STARKNET SEPOLIA {sepoliaBlock ? `LIVE — Block ${sepoliaBlock}` : 'CONNECTING...'}
            </Text>
            <Text style={{ color: '#888', fontSize: 10, marginTop: 1 }}>
              All deployments verified on-chain · snforge tests run locally
            </Text>
          </View>
        </View>

        {/* Progress */}
        <View style={[s.progressCard, { backgroundColor: `${ACCENT}10`, borderColor: `${ACCENT}30` }]}>
          <Text style={{ color: ACCENT, fontWeight: '800', fontSize: 12 }}>PROGRESS</Text>
          <Text style={{ color: colors.text, fontSize: 28, fontWeight: '900', marginTop: 4 }}>
            {completedCount}/{CAIRO_LABS.length}
          </Text>
          <Text style={{ color: colors.textSoft, fontSize: 12 }}>labs completed</Text>
          <View style={[s.bar, { backgroundColor: colors.border }]}>
            <View style={[s.barFill, { backgroundColor: ACCENT, width: `${(completedCount / CAIRO_LABS.length) * 100}%` }]} />
          </View>
        </View>

        {/* Quick links */}
        <View style={s.links}>
          <TouchableOpacity style={[s.link, { borderColor: ACCENT }]}
            onPress={() => Linking.openURL('https://book.cairo-lang.org')}>
            <Text style={{ color: ACCENT, fontWeight: '700', fontSize: 12 }}>📖 Cairo Book</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.link, { borderColor: ACCENT }]}
            onPress={() => Linking.openURL('https://docs.swmansion.com/scarb/')}>
            <Text style={{ color: ACCENT, fontWeight: '700', fontSize: 12 }}>🔨 Scarb Docs</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.link, { borderColor: ACCENT }]}
            onPress={() => Linking.openURL('https://foundry-rs.github.io/starknet-foundry/')}>
            <Text style={{ color: ACCENT, fontWeight: '700', fontSize: 12 }}>🧪 snforge Docs</Text>
          </TouchableOpacity>
        </View>

        {/* Lab list */}
        <Text style={[s.sectionTitle, { color: colors.text }]}>LABS</Text>
        {CAIRO_LABS.map(lab => (
          <LabCard
            key={lab.id}
            lab={lab}
            unlocked={isLabUnlocked(lab)}
            completed={isLabCompleted(lab)}
            onPress={() => handleLabPress(lab)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen:       { flex: 1 },
  header:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md,
                  paddingVertical: Spacing.sm, borderBottomWidth: 1 },
  back:         { width: 60 },
  scroll:       { padding: Spacing.md, gap: Spacing.md, paddingBottom: 60 },
  sepoliaBanner:{ flexDirection: 'row', gap: Spacing.sm, alignItems: 'center',
                  borderRadius: Radius.md, borderWidth: 1, padding: Spacing.sm },
  progressCard: { borderRadius: Radius.lg, borderWidth: 1, padding: Spacing.lg },
  bar:          { height: 6, borderRadius: 3, marginTop: Spacing.sm, overflow: 'hidden' },
  barFill:      { height: '100%', borderRadius: 3 },
  links:        { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  link:         { borderRadius: Radius.full, borderWidth: 1.5, paddingHorizontal: Spacing.md,
                  paddingVertical: 6 },
  sectionTitle: { fontSize: 11, fontWeight: '900', letterSpacing: 0.8 },
});
