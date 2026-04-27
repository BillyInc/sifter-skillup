/**
 * Sifter Skill_Up - Skills & Career Explorer
 */

import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ALL_FIELDS, type Field } from '../data/fields';
import { SKILL_TRACKS } from '../data/skills';
import {
  Colors, Spacing, Radius, FontSize, Shadow, FontWeight, useTheme,
} from '../theme';
import DisclaimerFooter from '../components/DisclaimerFooter';
import { SifterButton, SifterCard } from '../components/ui';

type MainTab = 'browse' | 'search';

const QUIZ_QS = [
  { id: 'goal', q: 'What do you want most from a career?', opts: [
    { label: 'Maximum earnings', fields: ['quant', 'ai-ml', 'software-engineering'] },
    { label: 'Full remote freedom', fields: ['software-engineering', 'cybersecurity', 'writing-content', 'crypto'] },
    { label: 'Meaningful impact', fields: ['healthcare-nonclinical', 'supply-chain', 'renewable-energy'] },
    { label: 'Frontier or cutting-edge work', fields: ['crypto', 'ai-ml', 'quant', 'fintech-blockchain'] },
  ] },
  { id: 'strength', q: 'What are you naturally best at?', opts: [
    { label: 'Numbers and analysis', fields: ['quant', 'supply-chain', 'data-science', 'data-analysis-bi'] },
    { label: 'Building and coding', fields: ['software-engineering', 'ai-ml', 'cybersecurity'] },
    { label: 'Writing and communication', fields: ['writing-content', 'token-research', 'digital-marketing'] },
    { label: 'Research and investigation', fields: ['cybersecurity', 'onchain-analysis', 'quant'] },
  ] },
  { id: 'time', q: 'How much time can you study weekly?', opts: [
    { label: '1 to 3 hours', fields: ['crypto', 'digital-marketing', 'writing-content'] },
    { label: '4 to 8 hours', fields: ['supply-chain', 'data-analysis-bi', 'cybersecurity'] },
    { label: '10+ hours', fields: ['ai-ml', 'software-engineering', 'quant'] },
  ] },
  { id: 'env', q: 'Where do you want to work?', opts: [
    { label: 'Fully remote', fields: ['software-engineering', 'cybersecurity', 'writing-content', 'crypto'] },
    { label: 'Office with a strong team', fields: ['quant', 'supply-chain', 'fintech-blockchain'] },
    { label: 'Hybrid or flexible', fields: ['ai-ml', 'data-science', 'product-design'] },
  ] },
  { id: 'start', q: 'What is your starting point?', opts: [
    { label: 'Complete beginner', fields: ['crypto', 'supply-chain', 'digital-marketing'] },
    { label: 'Some technical skills', fields: ['data-analysis-bi', 'cybersecurity', 'software-engineering'] },
    { label: 'Strong maths or science background', fields: ['quant', 'ai-ml', 'data-science'] },
    { label: 'Non-technical professional', fields: ['supply-chain', 'project-management', 'human-resources'] },
  ] },
];

function getRelatedTracks(field: Field) {
  return SKILL_TRACKS.filter((track) => {
    if (field.id === 'crypto') {
      return ['spot-trading', 'memecoin-trading', 'futures-trading', 'options-trading', 'onchain-analysis', 'token-research'].includes(track.id);
    }
    if (field.id === 'quant') {
      return ['quant-trading', 'quant-research', 'quant-developer'].includes(track.id);
    }
    if (field.id === 'supply-chain') {
      return track.id.startsWith('supply');
    }
    return false;
  });
}

function FieldCard({ field, onPress }: { field: Field; onPress: () => void }) {
  const { colors } = useTheme();
  const isLive = field.status === 'live';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      style={[
        styles.fieldCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderLeftColor: field.color,
        },
        Shadow.sm,
      ]}
    >
      <View style={styles.fieldCardTop}>
        <Text style={styles.fieldEmoji}>{field.emoji}</Text>
        <View style={[styles.statusPill, { backgroundColor: isLive ? colors.greenSoft : colors.bgSecondary }]}>
          <Text style={[styles.statusPillText, { color: isLive ? colors.green : colors.textMuted }]}>{isLive ? 'Live' : 'Soon'}</Text>
        </View>
      </View>
      <Text style={[styles.fieldName, { color: colors.text }]} numberOfLines={2}>{field.name}</Text>
      <Text style={[styles.fieldTagline, { color: colors.textSoft }]} numberOfLines={2}>{field.tagline}</Text>
      <View style={styles.fieldMetaRow}>
        <Text style={[styles.fieldMeta, { color: colors.textMuted }]}>{field.careerCount} careers</Text>
        {field.salaryRange ? <Text style={[styles.fieldMeta, { color: colors.textMuted }]}>{field.salaryRange.mid}</Text> : null}
      </View>
    </TouchableOpacity>
  );
}

function FieldDetailModal({ field, onClose }: { field: Field; onClose: () => void }) {
  const { colors } = useTheme();
  const router = useRouter();
  const [tab, setTab] = useState<'overview' | 'salary' | 'tracks'>('overview');
  const relatedTracks = getRelatedTracks(field);

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
        <View style={[styles.modalHero, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity style={[styles.closeButton, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]} onPress={onClose}>
            <Text style={[styles.closeButtonText, { color: colors.text }]}>×</Text>
          </TouchableOpacity>
          <View style={[styles.modalEmojiWrap, { backgroundColor: `${field.color}16` }]}>
            <Text style={styles.modalEmoji}>{field.emoji}</Text>
          </View>
          <Text style={[styles.modalTitle, { color: colors.text }]}>{field.name}</Text>
          <Text style={[styles.modalSub, { color: colors.textSoft }]}>{field.tagline}</Text>
          <View style={styles.modalBadgeRow}>
            <View style={[styles.modalBadge, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
              <Text style={[styles.modalBadgeText, { color: colors.textSoft }]}>{field.careerCount} careers</Text>
            </View>
            {field.salaryRange ? (
              <View style={[styles.modalBadge, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
                <Text style={[styles.modalBadgeText, { color: colors.textSoft }]}>Mid: {field.salaryRange.mid}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={[styles.tabBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          {(['overview', 'salary', 'tracks'] as const).map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => setTab(item)}
              style={[styles.tab, tab === item && { borderBottomColor: field.color, borderBottomWidth: 2 }]}
            >
              <Text style={[styles.tabText, { color: tab === item ? field.color : colors.textSoft }]}>
                {item === 'overview' ? 'Overview' : item === 'salary' ? 'Pay' : 'Tracks'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.modalBody}>
          {tab === 'overview' ? (
            <>
              <SifterCard style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>What this field is</Text>
                <Text style={[styles.bodyText, { color: colors.textSoft }]}>{field.description}</Text>
              </SifterCard>

              {field.whoIsItFor ? (
                <SifterCard style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Who tends to thrive here</Text>
                  <Text style={[styles.bodyText, { color: colors.textSoft }]}>{field.whoIsItFor}</Text>
                </SifterCard>
              ) : null}

              {field.whoIsItNotFor ? (
                <SifterCard style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Who may dislike it</Text>
                  <Text style={[styles.bodyText, { color: colors.textSoft }]}>{field.whoIsItNotFor}</Text>
                </SifterCard>
              ) : null}

              <SifterCard style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Roles in this field</Text>
                <View style={styles.pillWrap}>
                  {field.roles.map((role) => (
                    <View key={role.title} style={[styles.rolePill, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
                      <Text style={[styles.rolePillText, { color: colors.textSoft }]}>{role.title}</Text>
                    </View>
                  ))}
                </View>
              </SifterCard>
            </>
          ) : null}

          {tab === 'salary' ? (
            <SifterCard style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Salary ranges</Text>
              {field.salaryRange ? (
                <>
                  {[
                    { label: 'Junior', value: field.salaryRange.junior },
                    { label: 'Mid-level', value: field.salaryRange.mid },
                    { label: 'Senior', value: field.salaryRange.senior },
                  ].map((row) => (
                    <View key={row.label} style={[styles.salaryRow, { borderBottomColor: colors.border }]}>
                      <Text style={[styles.salaryLabel, { color: colors.text }]}>{row.label}</Text>
                      <Text style={[styles.salaryValue, { color: field.color }]}>{row.value}</Text>
                    </View>
                  ))}
                  {field.salaryRange.note ? (
                    <Text style={[styles.salaryNote, { color: colors.textSoft }]}>{field.salaryRange.note}</Text>
                  ) : null}
                </>
              ) : (
                <Text style={[styles.bodyText, { color: colors.textSoft }]}>Salary data is not available yet for this field.</Text>
              )}
            </SifterCard>
          ) : null}

          {tab === 'tracks' ? (
            <>
              {relatedTracks.length ? relatedTracks.map((track) => {
                const hasContent = !track.comingSoon;
                const labCount = hasContent && 'sections' in track ? (track as any).sections?.length ?? 0 : (track as any).modules?.length ?? 0;

                return (
                  <TouchableOpacity
                    key={track.id}
                    activeOpacity={0.88}
                    onPress={() => {
                      onClose();
                      if (['quant-trading', 'quant-research', 'quant-developer'].includes(track.id)) {
                        router.push('/skills/quant-map');
                      }
                    }}
                    style={[
                      styles.trackCard,
                      { backgroundColor: colors.card, borderColor: colors.border, borderTopColor: field.color },
                      Shadow.sm,
                    ]}
                  >
                    <View style={styles.trackHeader}>
                      <Text style={styles.trackEmoji}>{track.icon}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.trackName, { color: colors.text }]}>{track.name}</Text>
                        <Text style={[styles.trackTagline, { color: colors.textSoft }]}>{track.tagline}</Text>
                      </View>
                      <View style={[styles.statusPill, { backgroundColor: hasContent ? colors.greenSoft : colors.bgSecondary }]}>
                        <Text style={[styles.statusPillText, { color: hasContent ? colors.green : colors.textMuted }]}>{hasContent ? 'Live' : 'Soon'}</Text>
                      </View>
                    </View>

                    <Text style={[styles.bodyText, { color: colors.textSoft }]} numberOfLines={2}>{track.description}</Text>
                    <View style={styles.trackMetaRow}>
                      <Text style={[styles.trackMeta, { color: colors.textMuted }]}>{track.estimatedHours}h</Text>
                      <Text style={[styles.trackMeta, { color: colors.textMuted }]}>{labCount} labs</Text>
                      <Text style={[styles.trackMeta, { color: colors.textMuted }]}>{track.earningPotential}</Text>
                    </View>
                  </TouchableOpacity>
                );
              }) : (
                <SifterCard style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Tracks coming soon</Text>
                  <Text style={[styles.bodyText, { color: colors.textSoft }]}>We are still building the dedicated curriculum for this field.</Text>
                </SifterCard>
              )}
            </>
          ) : null}
        </ScrollView>
        <DisclaimerFooter trackId={field.id} />
      </SafeAreaView>
    </Modal>
  );
}

function SkillQuiz({ onClose }: { onClose: () => void }) {
  const { colors } = useTheme();
  const [step, setStep] = useState(0);
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [results, setResults] = useState<Field[] | null>(null);
  const [selected, setSelected] = useState<Field | null>(null);

  const pick = (fields: string[]) => {
    const nextVotes = { ...votes };
    fields.forEach((field) => {
      nextVotes[field] = (nextVotes[field] ?? 0) + 1;
    });

    if (step < QUIZ_QS.length - 1) {
      setVotes(nextVotes);
      setStep(prev => prev + 1);
      return;
    }

    const ranked = ALL_FIELDS
      .filter(field => nextVotes[field.id] > 0)
      .sort((a, b) => (nextVotes[b.id] ?? 0) - (nextVotes[a.id] ?? 0))
      .slice(0, 5);

    setResults(ranked.length ? ranked : ALL_FIELDS.slice(0, 3));
  };

  if (selected) {
    return <FieldDetailModal field={selected} onClose={() => setSelected(null)} />;
  }

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
        <View style={[styles.quizHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.closeButtonText, { color: colors.text }]}>×</Text>
          </TouchableOpacity>
          <Text style={[styles.quizTitle, { color: colors.text }]}>Find your path</Text>
          <View style={{ width: 20 }} />
        </View>

        {!results ? (
          <View style={styles.quizBody}>
            <View style={styles.dotRow}>
              {QUIZ_QS.map((_, index) => (
                <View key={index} style={[styles.dot, { backgroundColor: index <= step ? colors.accent : colors.border }]} />
              ))}
            </View>
            <SifterCard style={[styles.quizCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.quizQuestionTitle, { color: colors.text }]}>{QUIZ_QS[step].q}</Text>
              {QUIZ_QS[step].opts.map((opt) => (
                <TouchableOpacity
                  key={opt.label}
                  onPress={() => pick(opt.fields)}
                  activeOpacity={0.88}
                  style={[styles.quizOption, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}
                >
                  <Text style={[styles.quizOptionText, { color: colors.text }]}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </SifterCard>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.resultsBody}>
            <SifterCard style={[styles.quizCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.quizQuestionTitle, { color: colors.text }]}>Your best matches</Text>
              <Text style={[styles.bodyText, { color: colors.textSoft }]}>
                Based on your answers. Tap any result to inspect salary, fit, and available tracks.
              </Text>
            </SifterCard>
            {results.map((field, index) => (
              <TouchableOpacity
                key={field.id}
                onPress={() => setSelected(field)}
                activeOpacity={0.88}
                style={[styles.resultRow, { backgroundColor: colors.card, borderColor: colors.border }, Shadow.sm]}
              >
                <View style={[styles.rankBadge, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
                  <Text style={[styles.rankText, { color: colors.text }]}>#{index + 1}</Text>
                </View>
                <Text style={styles.resultRowEmoji}>{field.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.resultRowTitle, { color: colors.text }]}>{field.name}</Text>
                  <Text style={[styles.resultRowSub, { color: colors.textSoft }]}>{field.tagline}</Text>
                </View>
                <Text style={[styles.resultRowArrow, { color: colors.textMuted }]}>›</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
}

export default function SkillsScreen() {
  const { colors } = useTheme();
  const [tab, setTab] = useState<MainTab>('browse');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Field | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);

  const searchResults = useMemo(() => {
    if (!search.trim()) {
      return { fields: [], tracks: [] };
    }

    const query = search.toLowerCase();
    return {
      fields: ALL_FIELDS.filter((field) => field.name.toLowerCase().includes(query)
        || field.tagline.toLowerCase().includes(query)
        || field.roles.some(role => role.title.toLowerCase().includes(query))),
      tracks: SKILL_TRACKS.filter((track) => track.name.toLowerCase().includes(query) || track.tagline.toLowerCase().includes(query)),
    };
  }, [search]);

  const live = ALL_FIELDS.filter(field => field.status === 'live');
  const soon = ALL_FIELDS.filter(field => field.status !== 'live');

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      <View style={[styles.topBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.topBarTitle, { color: colors.text }]}>Skill Explorer</Text>
          <Text style={[styles.topBarSub, { color: colors.textSoft }]}>{ALL_FIELDS.length} fields • {SKILL_TRACKS.length} tracks</Text>
        </View>
        <TouchableOpacity style={[styles.findPathButton, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]} onPress={() => setShowQuiz(true)}>
          <Text style={[styles.findPathButtonText, { color: colors.text }]}>Find my path</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.tabBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {(['browse', 'search'] as MainTab[]).map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => setTab(item)}
            style={[styles.tab, tab === item && { borderBottomColor: colors.accent, borderBottomWidth: 2 }]}
          >
            <Text style={[styles.tabText, { color: tab === item ? colors.accent : colors.textSoft }]}>
              {item === 'browse' ? 'Browse' : 'Search'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'browse' ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.pagePad}>
            <SifterCard style={[styles.heroPanel, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.heroLabel, { color: colors.textMuted }]}>DISCOVERY</Text>
              <Text style={[styles.heroPanelTitle, { color: colors.text }]}>Explore tracks with less noise</Text>
              <Text style={[styles.heroPanelText, { color: colors.textSoft }]}>
                Browse live fields, inspect salary and track details, or use the guided quiz if you want help choosing.
              </Text>
              <SifterButton label="Use guided quiz" onPress={() => setShowQuiz(true)} variant="ghost" />
            </SifterCard>

            <Text style={[styles.sectionHeader, { color: colors.text }]}>Available now</Text>
            <View style={styles.grid}>
              {live.map(field => <FieldCard key={field.id} field={field} onPress={() => setSelected(field)} />)}
            </View>

            <Text style={[styles.sectionHeader, { color: colors.text }]}>Coming soon</Text>
            <View style={styles.grid}>
              {soon.map(field => <FieldCard key={field.id} field={field} onPress={() => setSelected(field)} />)}
            </View>
          </View>
          <DisclaimerFooter />
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>
          <View style={styles.pagePad}>
            <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.searchIcon, { color: colors.textMuted }]}>⌕</Text>
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Field, track, or job title"
                placeholderTextColor={colors.textMuted}
                value={search}
                onChangeText={setSearch}
                autoFocus
              />
              {search.length ? (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Text style={[styles.searchClear, { color: colors.textMuted }]}>×</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {search.trim() ? (
            <ScrollView contentContainerStyle={styles.pagePad}>
              {searchResults.fields.length ? (
                <>
                  <Text style={[styles.resultSectionLabel, { color: colors.textMuted }]}>Fields</Text>
                  {searchResults.fields.map((field) => (
                    <TouchableOpacity
                      key={field.id}
                      onPress={() => setSelected(field)}
                      activeOpacity={0.88}
                      style={[styles.searchRow, { backgroundColor: colors.card, borderColor: colors.border }]}
                    >
                      <Text style={styles.searchRowEmoji}>{field.emoji}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.searchRowTitle, { color: colors.text }]}>{field.name}</Text>
                        <Text style={[styles.searchRowSub, { color: colors.textSoft }]}>{field.careerCount} careers • {field.tagline}</Text>
                      </View>
                      <Text style={[styles.resultRowArrow, { color: colors.textMuted }]}>›</Text>
                    </TouchableOpacity>
                  ))}
                </>
              ) : null}

              {searchResults.tracks.length ? (
                <>
                  <Text style={[styles.resultSectionLabel, { color: colors.textMuted }]}>Tracks</Text>
                  {searchResults.tracks.map((track) => (
                    <View key={track.id} style={[styles.searchRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                      <Text style={styles.searchRowEmoji}>{track.icon}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.searchRowTitle, { color: colors.text }]}>{track.name}</Text>
                        <Text style={[styles.searchRowSub, { color: colors.textSoft }]}>{track.tagline}</Text>
                      </View>
                      <View style={[styles.statusPill, { backgroundColor: track.comingSoon ? colors.bgSecondary : colors.greenSoft }]}>
                        <Text style={[styles.statusPillText, { color: track.comingSoon ? colors.textMuted : colors.green }]}>{track.comingSoon ? 'Soon' : 'Live'}</Text>
                      </View>
                    </View>
                  ))}
                </>
              ) : null}

              {!searchResults.fields.length && !searchResults.tracks.length ? (
                <SifterCard style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>No results</Text>
                  <Text style={[styles.bodyText, { color: colors.textSoft }]}>Try a different search term or switch back to browsing.</Text>
                </SifterCard>
              ) : null}
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyStateTitle, { color: colors.text }]}>Search anything</Text>
              <Text style={[styles.emptyStateText, { color: colors.textSoft }]}>Try “supply chain”, “quant”, “Python”, or a job title.</Text>
            </View>
          )}
        </View>
      )}

      {selected ? <FieldDetailModal field={selected} onClose={() => setSelected(null)} /> : null}
      {showQuiz ? <SkillQuiz onClose={() => setShowQuiz(false)} /> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  topBarTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.black },
  topBarSub: { fontSize: FontSize.xs, marginTop: 2 },
  findPathButton: {
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
  },
  findPathButtonText: { fontSize: FontSize.xs, fontWeight: FontWeight.heavy },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: Spacing.sm },
  tabText: { fontSize: FontSize.sm, fontWeight: FontWeight.heavy },
  pagePad: { padding: Spacing.lg },
  heroPanel: { marginBottom: Spacing.lg },
  heroLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, letterSpacing: 1, marginBottom: Spacing.xs },
  heroPanelTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.black, marginBottom: Spacing.sm },
  heroPanelText: { fontSize: FontSize.sm, lineHeight: 20, marginBottom: Spacing.md },
  sectionHeader: { fontSize: FontSize.md, fontWeight: FontWeight.black, marginBottom: Spacing.sm, marginTop: Spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  fieldCard: {
    width: '47%',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderLeftWidth: 3,
    padding: Spacing.md,
  },
  fieldCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  fieldEmoji: { fontSize: 18 },
  statusPill: { borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 4 },
  statusPillText: { fontSize: 10, fontWeight: FontWeight.heavy },
  fieldName: { fontSize: FontSize.sm, fontWeight: FontWeight.black, marginBottom: 4 },
  fieldTagline: { fontSize: FontSize.xs, lineHeight: 16, marginBottom: Spacing.sm },
  fieldMetaRow: { gap: 4 },
  fieldMeta: { fontSize: 10, fontWeight: FontWeight.medium },
  modalHero: { padding: Spacing.lg, alignItems: 'center', borderBottomWidth: 1 },
  closeButton: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.lg,
    width: 34,
    height: 34,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: { fontSize: 18, fontWeight: FontWeight.medium, lineHeight: 24 },
  modalEmojiWrap: { width: 72, height: 72, borderRadius: Radius.xl, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  modalEmoji: { fontSize: 18 },
  modalTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.black, textAlign: 'center' },
  modalSub: { fontSize: FontSize.sm, textAlign: 'center', marginTop: 4 },
  modalBadgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginTop: Spacing.md, justifyContent: 'center' },
  modalBadge: { borderRadius: Radius.full, borderWidth: 1, paddingHorizontal: Spacing.sm, paddingVertical: 6 },
  modalBadgeText: { fontSize: 11, fontWeight: FontWeight.medium },
  modalBody: { padding: Spacing.lg, paddingBottom: Spacing.xxxl },
  sectionCard: { marginBottom: Spacing.md },
  sectionTitle: { fontSize: FontSize.md, fontWeight: FontWeight.black, marginBottom: Spacing.sm },
  bodyText: { fontSize: FontSize.sm, lineHeight: 20 },
  pillWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  rolePill: { borderRadius: Radius.full, borderWidth: 1, paddingHorizontal: Spacing.sm, paddingVertical: 6 },
  rolePillText: { fontSize: FontSize.xs, fontWeight: FontWeight.medium },
  salaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.md, borderBottomWidth: 1 },
  salaryLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  salaryValue: { fontSize: FontSize.md, fontWeight: FontWeight.black },
  salaryNote: { fontSize: FontSize.xs, lineHeight: 18, marginTop: Spacing.md },
  trackCard: { borderWidth: 1, borderTopWidth: 3, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md },
  trackHeader: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center', marginBottom: Spacing.sm },
  trackEmoji: { fontSize: 18 },
  trackName: { fontSize: FontSize.md, fontWeight: FontWeight.black },
  trackTagline: { fontSize: FontSize.xs, marginTop: 2 },
  trackMetaRow: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.sm },
  trackMeta: { fontSize: FontSize.xs, fontWeight: FontWeight.medium },
  quizHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  quizTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.black },
  quizBody: { flex: 1, padding: Spacing.lg },
  dotRow: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.xs, marginBottom: Spacing.lg },
  dot: { width: 8, height: 8, borderRadius: 4 },
  quizCard: { marginBottom: Spacing.md },
  quizQuestionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.black, marginBottom: Spacing.md, lineHeight: 24 },
  quizOption: { borderRadius: Radius.lg, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.sm },
  quizOptionText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  resultsBody: { padding: Spacing.lg, paddingBottom: Spacing.xxxl },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: { fontSize: FontSize.xs, fontWeight: FontWeight.black },
  resultRowEmoji: { fontSize: 18 },
  resultRowTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.black, marginBottom: 2 },
  resultRowSub: { fontSize: FontSize.xs },
  resultRowArrow: { fontSize: 20, fontWeight: FontWeight.medium },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  searchIcon: { fontSize: 18 },
  searchInput: { flex: 1, fontSize: FontSize.md, paddingVertical: Spacing.md },
  searchClear: { fontSize: 20 },
  resultSectionLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, letterSpacing: 1, marginBottom: Spacing.sm, marginTop: Spacing.md },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  searchRowEmoji: { fontSize: 18 },
  searchRowTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.black, marginBottom: 2 },
  searchRowSub: { fontSize: FontSize.xs },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xxxl },
  emptyStateTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.black, marginBottom: Spacing.sm },
  emptyStateText: { fontSize: FontSize.sm, textAlign: 'center', lineHeight: 20 },
});
