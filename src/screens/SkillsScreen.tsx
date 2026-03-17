/**
 * Sifter Skill_Up — Skills & Career Explorer
 * Browse fields, search tracks, take quiz for personalised recommendations
 */

import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, FlatList, TextInput, Modal,
} from 'react-native';
import { ALL_FIELDS, type Field } from '../data/fields';
import { SKILL_TRACKS, type SkillTrack } from '../data/skills';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../theme';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import DisclaimerFooter from '../components/DisclaimerFooter';

type MainTab = 'browse' | 'search';

// ─── Field Card ───────────────────────────────────────────────────────────────
function FieldCard({ field, onPress }: { field: Field; onPress: () => void }) {
  const isLive = field.status === 'live';
  return (
    <TouchableOpacity
      style={[styles.fieldCard, { borderLeftColor: field.color, borderLeftWidth: 4 }]}
      onPress={onPress} activeOpacity={0.8}
    >
      <View style={styles.fcTop}>
        <Text style={styles.fcEmoji}>{field.emoji}</Text>
        <View style={[styles.fcPill, { backgroundColor: isLive ? Colors.greenSoft : '#f1f5f9' }]}>
          <Text style={[styles.fcPillText, { color: isLive ? Colors.green : Colors.textMuted }]}>
            {isLive ? '⚡ Live' : '🔜'}
          </Text>
        </View>
      </View>
      <Text style={styles.fcName}>{field.name}</Text>
      <Text style={styles.fcTagline} numberOfLines={1}>{field.tagline}</Text>
      <View style={styles.fcMeta}>
        <Text style={styles.fcMetaItem}>💼 {field.careerCount}</Text>
        {field.salaryRange && <Text style={styles.fcMetaItem}>💰 {field.salaryRange.mid}</Text>}
      </View>
    </TouchableOpacity>
  );
}

// ─── Field Detail Modal ────────────────────────────────────────────────────────
function FieldDetailModal({ field, onClose }: { field: Field; onClose: () => void }) {
  const [tab, setTab] = useState<'overview' | 'salary' | 'tracks'>('overview');
  const navigation = useNavigation<any>();

  const relatedTracks = SKILL_TRACKS.filter(t => {
    if (field.id === 'crypto') return ['spot-trading','memecoin-trading','futures-trading','options-trading','onchain-analysis','token-research'].includes(t.id);
    if (field.id === 'quant') return ['quant-trading','quant-research','quant-developer'].includes(t.id);
    if (field.id === 'supply-chain') return t.id.startsWith('supply');
    return false;
  });

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }}>
        <View style={[styles.dHeader, { backgroundColor: field.color }]}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.dEmoji}>{field.emoji}</Text>
          <Text style={styles.dName}>{field.name}</Text>
          <Text style={styles.dTagline}>{field.tagline}</Text>
          <View style={styles.dBadges}>
            {field.remoteWork && <View style={styles.dBadge}><Text style={styles.dBadgeText}>🏠 {field.remoteWork === 'high' ? 'Remote' : field.remoteWork === 'medium' ? 'Hybrid' : 'Office'}</Text></View>}
            {field.demandTrend && <View style={styles.dBadge}><Text style={styles.dBadgeText}>{field.demandTrend === 'rising' ? '📈 Demand rising' : '➡️ Stable'}</Text></View>}
            <View style={styles.dBadge}><Text style={styles.dBadgeText}>💼 {field.careerCount} careers</Text></View>
          </View>
        </View>

        <View style={styles.dTabBar}>
          {(['overview', 'salary', 'tracks'] as const).map(t => (
            <TouchableOpacity key={t} style={[styles.dTab, tab === t && { borderBottomWidth: 2, borderBottomColor: field.color }]} onPress={() => setTab(t)}>
              <Text style={[styles.dTabText, tab === t && { color: field.color, fontWeight: '800' }]}>
                {t === 'overview' ? '📋 Overview' : t === 'salary' ? '💰 Pay' : '🎓 Tracks'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: Spacing.lg }}>
          {tab === 'overview' && <>
            <Text style={styles.dSec}>What is this field?</Text>
            <Text style={styles.dBody}>{field.description}</Text>

            {field.whoIsItFor && <>
              <Text style={styles.dSec}>Who thrives here</Text>
              <View style={[styles.whoCard, { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }]}>
                <Text style={styles.whoIcon}>✅</Text><Text style={styles.whoText}>{field.whoIsItFor}</Text>
              </View>
            </>}
            {field.whoIsItNotFor && (
              <View style={[styles.whoCard, { backgroundColor: '#fef2f2', borderColor: '#fecaca' }]}>
                <Text style={styles.whoIcon}>⚠️</Text><Text style={styles.whoText}>{field.whoIsItNotFor}</Text>
              </View>
            )}
            {field.dayInLife && <>
              <Text style={styles.dSec}>A typical day</Text>
              <Text style={styles.dBody}>{field.dayInLife}</Text>
            </>}
            {field.pros && field.pros.length > 0 && <>
              <Text style={styles.dSec}>The upsides</Text>
              {field.pros.map((p, i) => <View key={i} style={[styles.prosRow, { backgroundColor: '#f0fdf4' }]}><Text style={styles.prosIcon}>{p.icon}</Text><Text style={styles.prosText}>{p.text}</Text></View>)}
            </>}
            {field.cons && field.cons.length > 0 && <>
              <Text style={styles.dSec}>The downsides</Text>
              {field.cons.map((c, i) => <View key={i} style={[styles.prosRow, { backgroundColor: '#fff9f0' }]}><Text style={styles.prosIcon}>{c.icon}</Text><Text style={styles.prosText}>{c.text}</Text></View>)}
            </>}
            <Text style={styles.dSec}>How hiring works</Text>
            <View style={[styles.hiringCard, { borderColor: field.color + '40', backgroundColor: field.color + '10' }]}>
              <Text style={[styles.hiringModel, { color: field.color }]}>{field.hiringModel} HIRING</Text>
              <Text style={styles.dBody}>{field.hiringModelNote}</Text>
            </View>
            <Text style={styles.dSec}>Roles in this field</Text>
            <View style={styles.rolesWrap}>
              {field.roles.map((r, i) => <View key={i} style={styles.rolePill}><Text style={styles.rolePillText}>{r.title}</Text></View>)}
            </View>
            <View style={{ height: 40 }} />
          </>}

          {tab === 'salary' && <>
            {field.salaryRange ? <>
              <Text style={styles.dSec}>Salary ranges ({field.salaryRange.currency})</Text>
              {[
                { label: '🟢 Junior (0–3 yrs)', val: field.salaryRange.junior },
                { label: '🟡 Mid-level (3–7 yrs)', val: field.salaryRange.mid },
                { label: '🔴 Senior (7+ yrs)', val: field.salaryRange.senior },
              ].map(r => (
                <View key={r.label} style={styles.salRow}>
                  <Text style={styles.salLabel}>{r.label}</Text>
                  <Text style={[styles.salVal, { color: field.color }]}>{r.val}</Text>
                </View>
              ))}
              {field.salaryRange.note && <View style={styles.salNote}><Text style={styles.salNoteText}>ℹ️ {field.salaryRange.note}</Text></View>}
            </> : <Text style={styles.dBody}>Salary data coming soon.</Text>}
            {field.timeToHireable && <>
              <Text style={styles.dSec}>Time to first job</Text>
              <View style={styles.timeCard}>
                <Text style={{ fontSize: 28 }}>⏱</Text>
                <Text style={[styles.dBody, { flex: 1, fontWeight: '700' }]}>{field.timeToHireable}</Text>
              </View>
            </>}
            <View style={{ height: 40 }} />
          </>}

          {tab === 'tracks' && <>
            {relatedTracks.length > 0 ? <>
              <Text style={styles.dSec}>Available skill tracks</Text>
              <View style={[styles.hiringCard, { borderColor: Colors.accent + '40', backgroundColor: Colors.accentSoft }]}>
                <Text style={[styles.dBody, { color: Colors.accent }]}>
                  Each track goes Junior → Intermediate → Senior. Pass a placement exam to skip levels. Complete all three for the full certification.
                </Text>
              </View>
              {relatedTracks.map(track => {
                const hasContent = !track.comingSoon;
                const labCount = hasContent && 'sections' in track ? (track as any).sections?.length ?? 0 : (track as any).modules?.length ?? 0;
                return (
                  <TouchableOpacity key={track.id} style={[styles.trackCard, { borderTopColor: field.color, borderTopWidth: 3 }]}
                    onPress={() => { onClose(); if (['quant-trading','quant-research','quant-developer'].includes(track.id)) navigation.navigate('Quant'); }}
                    activeOpacity={0.85}>
                    <View style={{ flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start', marginBottom: Spacing.sm }}>
                      <Text style={{ fontSize: 28 }}>{track.icon}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.tcName}>{track.name}</Text>
                        <Text style={styles.tcTagline}>{track.tagline}</Text>
                      </View>
                      <View style={[styles.fcPill, { backgroundColor: hasContent ? Colors.greenSoft : '#f1f5f9' }]}>
                        <Text style={[styles.fcPillText, { color: hasContent ? Colors.green : Colors.textMuted }]}>{hasContent ? '⚡ Live' : '🔜'}</Text>
                      </View>
                    </View>
                    <Text style={[styles.dBody, { marginBottom: Spacing.sm }]} numberOfLines={2}>{track.description}</Text>
                    <View style={{ flexDirection: 'row', gap: Spacing.xs, marginBottom: Spacing.sm }}>
                      {['Junior', 'Intermediate', 'Senior'].map((lvl, i) => (
                        <View key={lvl} style={[styles.lvlChip, i === 0 && hasContent && { backgroundColor: Colors.greenSoft }]}>
                          <Text style={styles.lvlChipText}>{lvl}</Text>
                        </View>
                      ))}
                    </View>
                    <View style={{ flexDirection: 'row', gap: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing.sm }}>
                      <Text style={styles.fcMetaItem}>⏱ {track.estimatedHours}h</Text>
                      <Text style={styles.fcMetaItem}>📚 {labCount} labs</Text>
                      <Text style={[styles.fcMetaItem, { color: Colors.green }]}>💰 {track.earningPotential}</Text>
                    </View>
                    {hasContent && <View style={styles.placementBanner}><Text style={styles.placementText}>🎯 Placement exam available to skip to Intermediate or Senior</Text></View>}
                  </TouchableOpacity>
                );
              })}
            </> : (
              <View style={{ alignItems: 'center', padding: Spacing.xxxl }}>
                <Text style={{ fontSize: 56 }}>{field.emoji}</Text>
                <Text style={[styles.dSec, { textAlign: 'center', marginTop: Spacing.md }]}>Tracks coming soon</Text>
                <Text style={[styles.dBody, { textAlign: 'center' }]}>We are building the {field.name} curriculum. Check back soon.</Text>
              </View>
            )}
            <View style={{ height: 40 }} />
          </>}
        </ScrollView>
        <DisclaimerFooter trackId={field.id} />
      </SafeAreaView>
    </Modal>
  );
}

// ─── Skill Quiz ───────────────────────────────────────────────────────────────
const QUIZ_QS = [
  { id: 'goal', q: 'What do you want most from a career?', opts: [
    { label: 'Maximum earnings', fields: ['quant','ai-ml','software-engineering'] },
    { label: 'Full remote freedom', fields: ['software-engineering','cybersecurity','writing-content','crypto'] },
    { label: 'Meaningful impact', fields: ['healthcare-nonclinical','supply-chain','renewable-energy'] },
    { label: 'Frontier / cutting-edge work', fields: ['crypto','ai-ml','quant','fintech-blockchain'] },
  ]},
  { id: 'strength', q: 'What are you naturally best at?', opts: [
    { label: 'Numbers and analysis', fields: ['quant','supply-chain','data-science','data-analysis-bi'] },
    { label: 'Building and coding', fields: ['software-engineering','ai-ml','cybersecurity'] },
    { label: 'Writing and communication', fields: ['writing-content','token-research','digital-marketing'] },
    { label: 'Research and investigation', fields: ['cybersecurity','onchain-analysis','quant'] },
  ]},
  { id: 'time', q: 'How much time can you study weekly?', opts: [
    { label: '1–3 hours (light)', fields: ['crypto','digital-marketing','writing-content'] },
    { label: '4–8 hours (serious)', fields: ['supply-chain','data-analysis-bi','cybersecurity'] },
    { label: '10+ hours (committed)', fields: ['ai-ml','software-engineering','quant'] },
  ]},
  { id: 'env', q: 'Where do you want to work?', opts: [
    { label: 'Fully remote', fields: ['software-engineering','cybersecurity','writing-content','crypto'] },
    { label: 'Office with a strong team', fields: ['quant','supply-chain','fintech-blockchain'] },
    { label: 'Hybrid / flexible', fields: ['ai-ml','data-science','product-design'] },
  ]},
  { id: 'start', q: 'What is your starting point?', opts: [
    { label: 'Complete beginner', fields: ['crypto','supply-chain','digital-marketing'] },
    { label: 'Some technical skills', fields: ['data-analysis-bi','cybersecurity','software-engineering'] },
    { label: 'Strong maths/science', fields: ['quant','ai-ml','data-science'] },
    { label: 'Non-technical professional', fields: ['supply-chain','project-management','human-resources'] },
  ]},
];

function SkillQuiz({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [results, setResults] = useState<Field[] | null>(null);
  const [selected, setSelected] = useState<Field | null>(null);

  const pick = (fields: string[]) => {
    const newVotes = { ...votes };
    fields.forEach(f => { newVotes[f] = (newVotes[f] ?? 0) + 1; });
    if (step < QUIZ_QS.length - 1) {
      setVotes(newVotes);
      setStep(s => s + 1);
    } else {
      const ranked = ALL_FIELDS
        .filter(f => newVotes[f.id] > 0)
        .sort((a, b) => (newVotes[b.id] ?? 0) - (newVotes[a.id] ?? 0))
        .slice(0, 5);
      setResults(ranked.length > 0 ? ranked : ALL_FIELDS.slice(0, 3));
    }
  };

  if (selected) return <FieldDetailModal field={selected} onClose={() => setSelected(null)} />;

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: '#fff' }}>
          <TouchableOpacity onPress={onClose}><Text style={{ fontSize: 24 }}>✕</Text></TouchableOpacity>
          <Text style={{ fontSize: FontSize.lg, fontWeight: '900', color: Colors.text }}>🎯 Find Your Path</Text>
          <View style={{ width: 24 }} />
        </View>

        {!results ? (
          <View style={{ flex: 1, padding: Spacing.xl }}>
            <View style={{ flexDirection: 'row', gap: Spacing.xs, marginBottom: Spacing.xxl, justifyContent: 'center' }}>
              {QUIZ_QS.map((_, i) => <View key={i} style={[styles.qDot, i <= step && { backgroundColor: Colors.accent }]} />)}
            </View>
            <Text style={{ fontSize: FontSize.xl, fontWeight: '900', color: Colors.text, marginBottom: Spacing.xl, lineHeight: 28 }}>{QUIZ_QS[step].q}</Text>
            <View style={{ gap: Spacing.md }}>
              {QUIZ_QS[step].opts.map(opt => (
                <TouchableOpacity key={opt.label} style={{ backgroundColor: '#fff', borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 2, borderColor: Colors.border, ...Shadow.sm }} onPress={() => pick(opt.fields)} activeOpacity={0.8}>
                  <Text style={{ fontSize: FontSize.md, fontWeight: '700', color: Colors.text }}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={{ textAlign: 'center', color: Colors.textMuted, fontSize: FontSize.sm, marginTop: Spacing.xl }}>{step + 1} of {QUIZ_QS.length}</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={{ padding: Spacing.lg }}>
            <Text style={{ fontSize: FontSize.xxl, fontWeight: '900', color: Colors.text, marginBottom: 6 }}>Your best matches</Text>
            <Text style={{ fontSize: FontSize.sm, color: Colors.textSoft, marginBottom: Spacing.xl, lineHeight: 18 }}>Based on your answers. Tap any to explore salary, pros/cons and available tracks.</Text>
            {results.map((f, i) => (
              <TouchableOpacity key={f.id} style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: '#fff', borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: Spacing.md, borderWidth: 1.5, borderColor: Colors.border, ...Shadow.sm }} onPress={() => setSelected(f)} activeOpacity={0.85}>
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: FontSize.xs, fontWeight: '900', color: Colors.accent }}>#{i + 1}</Text>
                </View>
                <Text style={{ fontSize: 32 }}>{f.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: FontSize.md, fontWeight: '900', color: Colors.text }}>{f.name}</Text>
                  <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft, marginTop: 2 }}>{f.tagline}</Text>
                  {f.salaryRange && <Text style={{ fontSize: FontSize.xs, color: Colors.green, fontWeight: '700', marginTop: 2 }}>Mid: {f.salaryRange.mid}</Text>}
                </View>
                <Text style={{ fontSize: 20, color: Colors.textMuted }}>›</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={{ alignItems: 'center', padding: Spacing.lg }} onPress={() => { setStep(0); setVotes({}); setResults(null); }}>
              <Text style={{ fontSize: FontSize.sm, color: Colors.accent, fontWeight: '800', textDecorationLine: 'underline' }}>Retake quiz</Text>
            </TouchableOpacity>
            <View style={{ height: 40 }} />
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function SkillsScreen() {
  const [tab, setTab] = useState<MainTab>('browse');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Field | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);

  const searchResults = useMemo(() => {
    if (!search.trim()) return { fields: [], tracks: [] };
    const q = search.toLowerCase();
    return {
      fields: ALL_FIELDS.filter(f => f.name.toLowerCase().includes(q) || f.tagline.toLowerCase().includes(q) || f.roles.some(r => r.title.toLowerCase().includes(q))),
      tracks: SKILL_TRACKS.filter(t => t.name.toLowerCase().includes(q) || t.tagline.toLowerCase().includes(q)),
    };
  }, [search]);

  const live = ALL_FIELDS.filter(f => f.status === 'live');
  const soon = ALL_FIELDS.filter(f => f.status !== 'live');

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>🎓 Skill Explorer</Text>
          <Text style={styles.headerSub}>{ALL_FIELDS.length} fields · {SKILL_TRACKS.length} tracks</Text>
        </View>
        <TouchableOpacity style={styles.quizBtn} onPress={() => setShowQuiz(true)}>
          <Text style={styles.quizBtnText}>🎯 Find my path</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        {(['browse', 'search'] as MainTab[]).map(t => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'browse' ? '🗂 Browse' : '🔍 Search'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'search' ? (
        <View style={{ flex: 1 }}>
          <View style={styles.searchBar}>
            <Text style={{ fontSize: 18 }}>🔍</Text>
            <TextInput style={styles.searchInput} placeholder="Field, track, or job title..." placeholderTextColor={Colors.textMuted} value={search} onChangeText={setSearch} autoFocus />
            {search.length > 0 && <TouchableOpacity onPress={() => setSearch('')}><Text style={{ fontSize: 16, color: Colors.textMuted, fontWeight: '700', padding: 4 }}>✕</Text></TouchableOpacity>}
          </View>
          {search.trim() === '' ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xxxl }}>
              <Text style={{ fontSize: 48, marginBottom: Spacing.md }}>🔍</Text>
              <Text style={{ fontSize: FontSize.lg, fontWeight: '900', color: Colors.text, marginBottom: Spacing.sm }}>Search anything</Text>
              <Text style={{ fontSize: FontSize.sm, color: Colors.textSoft, textAlign: 'center', lineHeight: 18 }}>Try "supply chain", "quant", "Python", "procurement", "remote work"</Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={{ padding: Spacing.md }}>
              {searchResults.fields.length > 0 && <>
                <Text style={styles.srSec}>Fields</Text>
                {searchResults.fields.map(f => (
                  <TouchableOpacity key={f.id} style={styles.srRow} onPress={() => setSelected(f)}>
                    <Text style={{ fontSize: 28 }}>{f.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: FontSize.md, fontWeight: '800', color: Colors.text }}>{f.name}</Text>
                      <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft }}>{f.careerCount} careers · {f.tagline}</Text>
                    </View>
                    <Text style={{ fontSize: 18, color: Colors.textMuted }}>›</Text>
                  </TouchableOpacity>
                ))}
              </>}
              {searchResults.tracks.length > 0 && <>
                <Text style={styles.srSec}>Tracks</Text>
                {searchResults.tracks.map(t => (
                  <View key={t.id} style={styles.srRow}>
                    <Text style={{ fontSize: 28 }}>{t.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: FontSize.md, fontWeight: '800', color: Colors.text }}>{t.name}</Text>
                      <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft }}>{t.tagline}</Text>
                    </View>
                    <View style={[styles.fcPill, { backgroundColor: t.comingSoon ? '#f1f5f9' : Colors.greenSoft }]}>
                      <Text style={[styles.fcPillText, { color: t.comingSoon ? Colors.textMuted : Colors.green }]}>{t.comingSoon ? 'Soon' : 'Live'}</Text>
                    </View>
                  </View>
                ))}
              </>}
              {searchResults.fields.length === 0 && searchResults.tracks.length === 0 && (
                <View style={{ alignItems: 'center', padding: Spacing.xxxl }}>
                  <Text style={{ fontSize: FontSize.lg, fontWeight: '800', color: Colors.text }}>No results for "{search}"</Text>
                  <Text style={{ fontSize: FontSize.sm, color: Colors.textSoft, marginTop: Spacing.sm, textAlign: 'center' }}>Try a different term, or browse all fields.</Text>
                </View>
              )}
              <View style={{ height: 40 }} />
            </ScrollView>
          )}
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ backgroundColor: Colors.accent, padding: Spacing.xl }}>
            <Text style={{ fontSize: FontSize.xxl, fontWeight: '900', color: '#fff', marginBottom: 6 }}>Every skill. One platform.</Text>
            <Text style={{ fontSize: FontSize.sm, color: 'rgba(255,255,255,0.85)', lineHeight: 18, marginBottom: Spacing.md }}>Browse 29 career fields. Tap any to see salary, pros/cons, and tracks. Not sure where to start?</Text>
            <TouchableOpacity style={{ backgroundColor: '#fff', borderRadius: Radius.full, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, alignSelf: 'flex-start' }} onPress={() => setShowQuiz(true)}>
              <Text style={{ fontSize: FontSize.sm, fontWeight: '800', color: Colors.accent }}>🎯 Help me choose →</Text>
            </TouchableOpacity>
          </View>

          {live.length > 0 && <>
            <Text style={styles.browseSection}>⚡ Available now</Text>
            <View style={styles.fieldGrid}>{live.map(f => <FieldCard key={f.id} field={f} onPress={() => setSelected(f)} />)}</View>
          </>}

          <Text style={styles.browseSection}>🔜 Coming soon</Text>
          <View style={styles.fieldGrid}>{soon.map(f => <FieldCard key={f.id} field={f} onPress={() => setSelected(f)} />)}</View>

          <View style={{ height: 32 }} />
          <DisclaimerFooter />
        </ScrollView>
      )}

      {selected && <FieldDetailModal field={selected} onClose={() => setSelected(null)} />}
      {showQuiz && <SkillQuiz onClose={() => setShowQuiz(false)} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.text },
  headerSub: { fontSize: FontSize.xs, color: Colors.textSoft, marginTop: 2 },
  quizBtn: { backgroundColor: Colors.accentSoft, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: 6, borderWidth: 1.5, borderColor: Colors.accent },
  quizBtnText: { fontSize: FontSize.xs, fontWeight: '800', color: Colors.accent },
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Colors.border },
  tab: { flex: 1, paddingVertical: Spacing.sm, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: Colors.accent },
  tabText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textSoft },
  tabTextActive: { color: Colors.accent, fontWeight: '900' },
  browseSection: { fontSize: FontSize.md, fontWeight: '900', color: Colors.text, paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.sm },
  fieldGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.md, gap: Spacing.sm },
  fieldCard: { width: '47%', backgroundColor: '#fff', borderRadius: Radius.lg, padding: Spacing.md, ...Shadow.sm },
  fcTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  fcEmoji: { fontSize: 28 },
  fcPill: { borderRadius: Radius.full, paddingHorizontal: 6, paddingVertical: 2 },
  fcPillText: { fontSize: 10, fontWeight: '700' },
  fcName: { fontSize: FontSize.sm, fontWeight: '900', color: Colors.text, marginBottom: 2 },
  fcTagline: { fontSize: 10, color: Colors.textSoft, marginBottom: Spacing.sm },
  fcMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  fcMetaItem: { fontSize: 10, color: Colors.textMuted, fontWeight: '600' },
  // Detail
  dHeader: { paddingTop: 48, paddingBottom: Spacing.xl, paddingHorizontal: Spacing.lg, alignItems: 'center' },
  closeBtn: { position: 'absolute', top: Spacing.lg, right: Spacing.lg, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  dEmoji: { fontSize: 52, marginBottom: Spacing.sm },
  dName: { fontSize: FontSize.xxl, fontWeight: '900', color: '#fff', textAlign: 'center' },
  dTagline: { fontSize: FontSize.md, color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginTop: 4, marginBottom: Spacing.md },
  dBadges: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, justifyContent: 'center' },
  dBadge: { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 3 },
  dBadgeText: { fontSize: 10, color: '#fff', fontWeight: '700' },
  dTabBar: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Colors.border },
  dTab: { flex: 1, paddingVertical: Spacing.sm, alignItems: 'center' },
  dTabText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textSoft },
  dSec: { fontSize: FontSize.md, fontWeight: '900', color: Colors.text, marginBottom: Spacing.sm, marginTop: Spacing.lg },
  dBody: { fontSize: FontSize.sm, color: Colors.textSoft, lineHeight: 20 },
  whoCard: { flexDirection: 'row', gap: Spacing.sm, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1 },
  whoIcon: { fontSize: 20 },
  whoText: { flex: 1, fontSize: FontSize.sm, color: Colors.text, lineHeight: 18 },
  prosRow: { flexDirection: 'row', gap: Spacing.sm, borderRadius: Radius.sm, padding: Spacing.md, marginBottom: Spacing.xs },
  prosIcon: { fontSize: 20 },
  prosText: { flex: 1, fontSize: FontSize.sm, color: Colors.text, lineHeight: 18 },
  hiringCard: { borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, marginBottom: Spacing.sm },
  hiringModel: { fontSize: FontSize.xs, fontWeight: '900', marginBottom: 4, letterSpacing: 1 },
  rolesWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  rolePill: { backgroundColor: Colors.bg, borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 4, borderWidth: 1, borderColor: Colors.border },
  rolePillText: { fontSize: FontSize.xs, color: Colors.textSoft, fontWeight: '600' },
  salRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  salLabel: { fontSize: FontSize.sm, color: Colors.text, fontWeight: '700' },
  salVal: { fontSize: FontSize.md, fontWeight: '900' },
  salNote: { backgroundColor: '#fffbeb', borderRadius: Radius.md, padding: Spacing.md, marginTop: Spacing.md, borderWidth: 1, borderColor: '#fde68a' },
  salNoteText: { fontSize: FontSize.xs, color: '#92400e', lineHeight: 16 },
  timeCard: { flexDirection: 'row', gap: Spacing.md, backgroundColor: Colors.accentSoft, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center' },
  trackCard: { backgroundColor: '#fff', borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md, ...Shadow.sm },
  tcName: { fontSize: FontSize.md, fontWeight: '900', color: Colors.text },
  tcTagline: { fontSize: FontSize.xs, color: Colors.textSoft, marginTop: 2 },
  lvlChip: { borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 3, backgroundColor: '#f1f5f9' },
  lvlChipText: { fontSize: 10, fontWeight: '700', color: Colors.textSoft },
  placementBanner: { backgroundColor: '#fffbeb', borderRadius: Radius.sm, padding: Spacing.sm, marginTop: Spacing.sm },
  placementText: { fontSize: 10, color: '#92400e', fontWeight: '600' },
  // Search
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', margin: Spacing.md, borderRadius: Radius.lg, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderWidth: 1.5, borderColor: Colors.border, gap: Spacing.sm, ...Shadow.sm },
  searchInput: { flex: 1, fontSize: FontSize.md, color: Colors.text, paddingVertical: 4 },
  srSec: { fontSize: FontSize.sm, fontWeight: '900', color: Colors.textMuted, marginBottom: Spacing.sm, marginTop: Spacing.md, letterSpacing: 0.5 },
  srRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: '#fff', borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.xs, borderWidth: 1, borderColor: Colors.border },
  // Quiz
  qDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.border },
});
