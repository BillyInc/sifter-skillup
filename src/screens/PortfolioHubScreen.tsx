/**
 * Sifter Skill_Up — Portfolio Hub Screen
 *
 * Multi-platform portfolio hub. Replaces the single GitHub screen for
 * career tracks where GitHub is secondary (e.g. Supply Chain Analyst).
 *
 * Supply Chain Analyst platform stack (per Portfolio Platform Directory):
 *   PRIMARY:   LinkedIn, Personal Portfolio / Notion
 *   SECONDARY: GitHub (technical labs only), Tableau Public (vis labs only),
 *              Medium (on request), Upwork (senior complete)
 *
 * Architecture:
 *   - Reads earned portfolio artifacts from user progress state
 *   - Routes each artifact to the correct platform(s)
 *   - LinkedIn: OAuth 2.0 post with Sifter attribution
 *   - Personal Portfolio: generates PDF + Notion-ready markdown export
 *   - GitHub: pushes case-study.md + any technical scripts
 *   - Tableau / Medium / Upwork: generates package for manual upload
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar, Linking, ActivityIndicator, Alert,
} from 'react-native';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../theme';
import { API } from '../lib/api';
import { useAuth } from '../hooks/useAuth';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface PortfolioArtifact {
  id: string;
  labId: string;
  level: 'junior' | 'intermediate' | 'senior';
  skill: string;
  framework: string;
  badgeEarned: string;
  passedAt: string; // ISO date
  commitMessage: string;
  folderPath: string;
  platforms: {
    primary: Array<{ id: string; type: string }>;
    secondary: Array<{ id: string; type: string; condition?: string }>;
  };
  caseStudyContent: string; // interview-ready markdown
  pushedTo: string[]; // platform IDs already pushed
}

interface Phase2GateStatus {
  unlocked: boolean;
  blockers: Array<{ requirement: string; status: string; met: boolean }>;
}

interface AggSimStatus {
  total: number;
  attempted: number;
  passed: number;
  passRate: number;
  meetsThreshold: boolean;
  failedSims: Array<{ simId: string; attemptsUsed: number; endOfLevelRetryAvailable: boolean }>;
}

interface RemediationSet {
  setId: string;
  concept: string;
  scenariosPassed: number;
  totalScenarios: number;
  cleared: boolean;
}

interface PlatformStatus {
  id: string;
  name: string;
  emoji: string;
  connected: boolean;
  username?: string;
  isPrimary: boolean;
}

type HubTab = 'overview' | 'artifacts' | 'platforms' | 'credibility' | 'progression';

// ─────────────────────────────────────────────────────────────────────────────
// Platform config — Supply Chain Analyst specific
// ─────────────────────────────────────────────────────────────────────────────

const PLATFORM_CONFIG: Record<string, { name: string; emoji: string; isPrimary: boolean; description: string; action: string }> = {
  linkedin: {
    name: 'LinkedIn',
    emoji: '💼',
    isPrimary: true,
    description: 'Post certification badges, career progression, Boss Battle completions',
    action: 'Post to LinkedIn',
  },
  'personal-portfolio': {
    name: 'Personal Portfolio',
    emoji: '🗂️',
    isPrimary: true,
    description: 'Export case studies as PDF or Notion-ready markdown with numbers and frameworks',
    action: 'Export Case Study',
  },
  github: {
    name: 'GitHub',
    emoji: '🐙',
    isPrimary: false,
    description: 'Push Python/SQL scripts — technical labs only',
    action: 'Push to GitHub',
  },
  'tableau-public': {
    name: 'Tableau Public',
    emoji: '📊',
    isPrimary: false,
    description: 'Export dashboards — visualisation labs only',
    action: 'Export Dashboard',
  },
  medium: {
    name: 'Medium',
    emoji: '✍️',
    isPrimary: false,
    description: 'Generate article draft from your case studies',
    action: 'Draft Article',
  },
  upwork: {
    name: 'Upwork',
    emoji: '💰',
    isPrimary: false,
    description: 'Update profile package — senior level complete',
    action: 'Build Profile Package',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Credential integrity statement
// ─────────────────────────────────────────────────────────────────────────────

const CREDENTIAL_STATEMENT =
  'Each artifact in this portfolio was generated only after the owner met 100% ' +
  'of the scoring criteria on an unseen Boss Battle Certification Attempt, assessed ' +
  'against named industry standards (APICS, CSCMP, PMBoK, or equivalent). ' +
  'Artifacts cannot be purchased, skipped, or partially earned.';

// ─────────────────────────────────────────────────────────────────────────────
// Shared UI primitives
// ─────────────────────────────────────────────────────────────────────────────

function Card({ children, style }: { children: React.ReactNode; style?: object }) {
  return <View style={[styles.card, Shadow.sm, style]}>{children}</View>;
}

function PrimaryBtn({
  label, onPress, loading = false, icon = '', disabled = false,
}: { label: string; onPress: () => void; loading?: boolean; icon?: string; disabled?: boolean }) {
  return (
    <TouchableOpacity
      style={[styles.primaryBtn, disabled && styles.primaryBtnDisabled]}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={loading || disabled}
    >
      {loading
        ? <ActivityIndicator color="#fff" />
        : <Text style={styles.primaryBtnText}>{icon ? `${icon}  ` : ''}{label}</Text>}
    </TouchableOpacity>
  );
}

function SecondaryBtn({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.secondaryBtn}>
      <Text style={styles.secondaryBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

function Tag({ text, color = Colors.accent }: { text: string; color?: string }) {
  return (
    <View style={[styles.tag, { backgroundColor: color + '22', borderColor: color + '55' }]}>
      <Text style={[styles.tagText, { color }]}>{text}</Text>
    </View>
  );
}

function SectionLabel({ text }: { text: string }) {
  return <Text style={styles.sectionLabel}>{text}</Text>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Overview tab
// ─────────────────────────────────────────────────────────────────────────────

function OverviewTab({ artifacts, platformStatuses }: {
  artifacts: PortfolioArtifact[];
  platformStatuses: PlatformStatus[];
}) {
  const juniorCount = artifacts.filter(a => a.level === 'junior').length;
  const intermediateCount = artifacts.filter(a => a.level === 'intermediate').length;
  const seniorCount = artifacts.filter(a => a.level === 'senior').length;
  const connectedCount = platformStatuses.filter(p => p.connected).length;
  const unpushed = artifacts.filter(a => a.pushedTo.length === 0).length;

  return (
    <>
      {/* Stats row */}
      <Card>
        <SectionLabel text="PORTFOLIO SUMMARY" />
        <View style={styles.statsRow}>
          {[
            { label: 'Junior', value: juniorCount, color: '#10b981' },
            { label: 'Intermediate', value: intermediateCount, color: '#f59e0b' },
            { label: 'Senior', value: seniorCount, color: '#ef4444' },
            { label: 'Platforms', value: connectedCount, color: Colors.accent },
          ].map(s => (
            <View key={s.label} style={styles.statBox}>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
        {unpushed > 0 && (
          <View style={styles.alertBox}>
            <Text style={styles.alertText}>
              ⚡ {unpushed} artifact{unpushed > 1 ? 's' : ''} earned but not yet pushed to any platform.
            </Text>
          </View>
        )}
      </Card>

      {/* Platform priority guide */}
      <Card>
        <SectionLabel text="SUPPLY CHAIN ANALYST — PLATFORM PRIORITY" />
        <Text style={styles.body}>
          Based on how Supply Chain Analyst roles are hired, your portfolio destinations are ranked below.
          Recruiters check these platforms in this order.
        </Text>
        {Object.entries(PLATFORM_CONFIG).map(([id, cfg]) => (
          <View key={id} style={styles.platformRow}>
            <Text style={styles.platformEmoji}>{cfg.emoji}</Text>
            <View style={{ flex: 1 }}>
              <View style={styles.platformNameRow}>
                <Text style={styles.platformName}>{cfg.name}</Text>
                <Tag
                  text={cfg.isPrimary ? 'PRIMARY' : 'SECONDARY'}
                  color={cfg.isPrimary ? '#10b981' : '#6366f1'}
                />
              </View>
              <Text style={styles.platformDesc}>{cfg.description}</Text>
            </View>
          </View>
        ))}
      </Card>

      {/* Credential statement */}
      <Card style={styles.credCard}>
        <Text style={styles.credTitle}>🏆 CREDENTIAL INTEGRITY</Text>
        <Text style={styles.credText}>{CREDENTIAL_STATEMENT}</Text>
      </Card>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Artifacts tab
// ─────────────────────────────────────────────────────────────────────────────

function ArtifactCard({ artifact, onPush }: { artifact: PortfolioArtifact; onPush: (a: PortfolioArtifact, platformId: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const levelColors: Record<string, string> = { junior: '#10b981', intermediate: '#f59e0b', senior: '#ef4444' };

  return (
    <Card style={styles.artifactCard}>
      <TouchableOpacity onPress={() => setExpanded(!expanded)} activeOpacity={0.8}>
        <View style={styles.artifactHeader}>
          <View style={[styles.levelDot, { backgroundColor: levelColors[artifact.level] }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.artifactSkill}>{artifact.skill}</Text>
            <Text style={styles.artifactMeta}>
              {artifact.level.charAt(0).toUpperCase() + artifact.level.slice(1)} · {artifact.passedAt}
            </Text>
          </View>
          <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
        </View>
        <Text style={styles.artifactFramework}>⚖️ {artifact.framework}</Text>
        {artifact.pushedTo.length > 0 && (
          <View style={styles.pushedRow}>
            {artifact.pushedTo.map(p => (
              <Tag key={p} text={`✅ ${PLATFORM_CONFIG[p]?.name ?? p}`} color="#10b981" />
            ))}
          </View>
        )}
      </TouchableOpacity>

      {expanded && (
        <View style={styles.artifactDetail}>
          <Text style={styles.caseStudyPreview}>{artifact.caseStudyContent}</Text>

          <Text style={[styles.sectionLabel, { marginTop: 12 }]}>PUSH TO PLATFORMS</Text>

          {/* Primary platforms */}
          <Text style={styles.subLabel}>Primary (push first)</Text>
          {artifact.platforms.primary.map(p => {
            const cfg = PLATFORM_CONFIG[p.id];
            const alreadyPushed = artifact.pushedTo.includes(p.id);
            return (
              <View key={p.id} style={styles.pushRow}>
                <Text style={styles.pushPlatformName}>{cfg?.emoji} {cfg?.name ?? p.id}</Text>
                {alreadyPushed
                  ? <Text style={styles.pushedLabel}>✅ Pushed</Text>
                  : <SecondaryBtn label={cfg?.action ?? 'Push'} onPress={() => onPush(artifact, p.id)} />
                }
              </View>
            );
          })}

          {/* Secondary platforms */}
          <Text style={[styles.subLabel, { marginTop: 8 }]}>Secondary</Text>
          {artifact.platforms.secondary.map(p => {
            const cfg = PLATFORM_CONFIG[p.id];
            const alreadyPushed = artifact.pushedTo.includes(p.id);
            return (
              <View key={p.id} style={styles.pushRow}>
                <View>
                  <Text style={styles.pushPlatformName}>{cfg?.emoji} {cfg?.name ?? p.id}</Text>
                  {p.condition && <Text style={styles.pushCondition}>({p.condition})</Text>}
                </View>
                {alreadyPushed
                  ? <Text style={styles.pushedLabel}>✅ Done</Text>
                  : <SecondaryBtn label={cfg?.action ?? 'Export'} onPress={() => onPush(artifact, p.id)} />
                }
              </View>
            );
          })}
        </View>
      )}
    </Card>
  );
}

function ArtifactsTab({ artifacts, onPush }: {
  artifacts: PortfolioArtifact[];
  onPush: (a: PortfolioArtifact, platformId: string) => void;
}) {
  if (artifacts.length === 0) {
    return (
      <Card>
        <Text style={styles.emptyTitle}>No artifacts yet</Text>
        <Text style={styles.emptyBody}>
          Complete a Boss Battle Certification Attempt to earn your first portfolio artifact.
          Each artifact requires passing 100% of scoring criteria on an unseen scenario.
        </Text>
      </Card>
    );
  }

  const byLevel = ['junior', 'intermediate', 'senior'] as const;

  return (
    <>
      {byLevel.map(level => {
        const lvlArtifacts = artifacts.filter(a => a.level === level);
        if (lvlArtifacts.length === 0) return null;
        return (
          <View key={level}>
            <Text style={styles.levelHeader}>
              {level.charAt(0).toUpperCase() + level.slice(1)} ({lvlArtifacts.length})
            </Text>
            {lvlArtifacts.map(a => (
              <ArtifactCard key={a.id} artifact={a} onPush={onPush} />
            ))}
          </View>
        );
      })}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Platforms tab
// ─────────────────────────────────────────────────────────────────────────────

function PlatformsTab({ platformStatuses, onConnect, onDisconnect }: {
  platformStatuses: PlatformStatus[];
  onConnect: (platformId: string) => void;
  onDisconnect: (platformId: string) => void;
}) {
  const primary = platformStatuses.filter(p => p.isPrimary);
  const secondary = platformStatuses.filter(p => !p.isPrimary);

  const PlatformItem = ({ ps }: { ps: PlatformStatus }) => {
    const cfg = PLATFORM_CONFIG[ps.id];
    return (
      <View style={styles.platformItem}>
        <Text style={styles.platformItemEmoji}>{cfg?.emoji ?? '🔗'}</Text>
        <View style={{ flex: 1 }}>
          <View style={styles.platformNameRow}>
            <Text style={styles.platformName}>{ps.name}</Text>
            {ps.connected && <Tag text="Connected" color="#10b981" />}
          </View>
          {ps.connected && ps.username && (
            <Text style={styles.platformUsername}>{ps.username}</Text>
          )}
          <Text style={styles.platformDesc}>{cfg?.description}</Text>
        </View>
        <View>
          {ps.connected
            ? <SecondaryBtn label="Disconnect" onPress={() => onDisconnect(ps.id)} />
            : <PrimaryBtn label="Connect" onPress={() => onConnect(ps.id)} />
          }
        </View>
      </View>
    );
  };

  return (
    <>
      <Card>
        <SectionLabel text="PRIMARY PLATFORMS" />
        <Text style={styles.body}>
          Connect these first. Every Boss Battle artifact posts here automatically on pass.
        </Text>
        {primary.map(ps => <PlatformItem key={ps.id} ps={ps} />)}
      </Card>
      <Card>
        <SectionLabel text="SECONDARY PLATFORMS" />
        <Text style={styles.body}>
          GitHub is for technical labs only. Tableau for visualisation labs. Others on request.
        </Text>
        {secondary.map(ps => <PlatformItem key={ps.id} ps={ps} />)}
      </Card>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Credibility tab — interview prep
// ─────────────────────────────────────────────────────────────────────────────

function CredibilityTab({ artifacts }: { artifacts: PortfolioArtifact[] }) {
  return (
    <>
      <Card>
        <SectionLabel text="HOW TO USE YOUR PORTFOLIO IN INTERVIEWS" />
        <Text style={styles.body}>
          Every artifact in your portfolio is a pre-written answer to a behavioural interview question.
          You have already handled these scenarios under timed, unguided, framework-verified conditions.
        </Text>
        {[
          {
            q: '"Tell me about a time you handled a supplier failure."',
            a: 'Open your portfolio. Show the case study. Walk the interviewer through the scenario, your decision, and the framework you applied. The artifact proves it happened.',
          },
          {
            q: '"How do you approach inventory risk?"',
            a: 'Reference your Inventory Management or Supply Planning artifact. Cite the specific numbers from your scenario. Name the APICS/CSCMP standard it was assessed against.',
          },
          {
            q: '"Give me an example of stakeholder communication under pressure."',
            a: 'Your Professional Skills artifact covers exactly this. The scoring criteria you passed are the observable behaviours an interviewer is looking for.',
          },
        ].map((item, i) => (
          <View key={i} style={styles.interviewItem}>
            <Text style={styles.interviewQ}>{item.q}</Text>
            <Text style={styles.interviewA}>{item.a}</Text>
          </View>
        ))}
      </Card>

      <Card>
        <SectionLabel text="WHAT YOUR PORTFOLIO PROVES" />
        {[
          { level: 'Junior artifacts', proves: 'I can execute correctly, escalate appropriately, and report accurately under operational pressure.' },
          { level: 'Intermediate artifacts', proves: 'I can own decisions without escalating, manage teams through crises, and handle multi-variable failures.' },
          { level: 'Senior artifacts', proves: 'I can think strategically, communicate at board level, and redesign the systems that cause problems.' },
        ].map(item => (
          <View key={item.level} style={styles.proveItem}>
            <Text style={styles.proveLevel}>{item.level}</Text>
            <Text style={styles.proveText}>{item.proves}</Text>
          </View>
        ))}
      </Card>

      <Card style={styles.credCard}>
        <Text style={styles.credTitle}>🏆 CREDENTIAL STATEMENT</Text>
        <Text style={styles.credText}>{CREDENTIAL_STATEMENT}</Text>
        <SecondaryBtn
          label="Copy for CV / LinkedIn"
          onPress={() => Alert.alert('Copied', 'Credential statement copied to clipboard.')}
        />
      </Card>
    </>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// Progression tab — gate status, remediation, aggregate sims, end-of-level
// ─────────────────────────────────────────────────────────────────────────────

function RequirementRow({ label, status, met }: { label: string; status: string; met: boolean }) {
  return (
    <View style={styles.reqRow}>
      <Text style={[styles.reqIcon, { color: met ? '#10b981' : '#ef4444' }]}>{met ? '✅' : '❌'}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.reqLabel}>{label}</Text>
        <Text style={styles.reqStatus}>{status}</Text>
      </View>
    </View>
  );
}

function ProgressionTab({
  gateStatus,
  aggSimStatus,
  remediationSets,
  endOfLevelRetries,
  onSubmitEndOfLevelRetry,
}: {
  gateStatus: Phase2GateStatus | null;
  aggSimStatus: AggSimStatus | null;
  remediationSets: RemediationSet[];
  endOfLevelRetries: Array<{ simId: string; labId: string; concept: string }>;
  onSubmitEndOfLevelRetry: (simId: string) => void;
}) {
  return (
    <>
      {/* Phase 2 gate */}
      <Card>
        <SectionLabel text="PHASE 2 CERTIFICATION — GATE STATUS" />
        {gateStatus === null ? (
          <ActivityIndicator color={Colors.accent} />
        ) : gateStatus.unlocked ? (
          <View style={styles.unlockedBox}>
            <Text style={styles.unlockedText}>🏆 Phase 2 Certification Attempt is UNLOCKED</Text>
            <Text style={styles.unlockedSub}>All prerequisites met. Go to the lab Boss Battle to attempt certification.</Text>
          </View>
        ) : (
          <>
            <Text style={[styles.body, { color: '#ef4444', fontWeight: '700', marginBottom: 8 }]}>
              🔒 Phase 2 locked — requirements below must be met
            </Text>
            {gateStatus.blockers.map((b, i) => (
              <RequirementRow key={i} label={b.requirement} status={b.status} met={b.met} />
            ))}
          </>
        )}
      </Card>

      {/* Aggregate sim tracker */}
      <Card>
        <SectionLabel text="AGGREGATE SIMULATIONS — 90% REQUIRED" />
        {aggSimStatus === null ? (
          <ActivityIndicator color={Colors.accent} />
        ) : (
          <>
            <View style={styles.aggRow}>
              {[
                { label: 'Attempted', value: `${aggSimStatus.attempted}/15` },
                { label: 'Passed', value: `${aggSimStatus.passed}/15` },
                { label: 'Pass Rate', value: `${Math.round(aggSimStatus.passRate * 100)}%`, highlight: true },
              ].map(s => (
                <View key={s.label} style={styles.aggStat}>
                  <Text style={[styles.statValue, s.highlight && { color: aggSimStatus.meetsThreshold ? '#10b981' : '#ef4444' }]}>
                    {s.value}
                  </Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>
            <View style={[styles.thresholdBar, { backgroundColor: aggSimStatus.meetsThreshold ? '#d1fae5' : '#fee2e2' }]}>
              <Text style={[styles.thresholdText, { color: aggSimStatus.meetsThreshold ? '#065f46' : '#7f1d1d' }]}>
                {aggSimStatus.meetsThreshold
                  ? '✅ 90% threshold met — aggregate sim gate cleared'
                  : `❌ Need ≥14/15 passed within 2 attempts each. ${14 - aggSimStatus.passed} more needed.`}
              </Text>
            </View>

            {/* Failed sims with attempt budget */}
            {aggSimStatus.failedSims.length > 0 && (
              <>
                <Text style={[styles.subLabel, { marginTop: 10 }]}>FAILED SIMS — ATTEMPT BUDGET</Text>
                {aggSimStatus.failedSims.map(fs => (
                  <View key={fs.simId} style={styles.failedSimRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.failedSimId}>{fs.simId}</Text>
                      <Text style={styles.failedSimAttempts}>
                        {fs.attemptsUsed}/2 attempts used
                        {fs.attemptsUsed >= 2 ? ' — eligible for end-of-level retry' : ' — 1 attempt remaining'}
                      </Text>
                    </View>
                    {fs.attemptsUsed >= 2 && (
                      <Tag text="Retry at level end" color="#f59e0b" />
                    )}
                  </View>
                ))}
              </>
            )}
          </>
        )}
      </Card>

      {/* Remediation sets */}
      <Card>
        <SectionLabel text="REMEDIATION SETS" />
        <Text style={styles.body}>
          Triggered when you fail a lesson simulator. Batched here at end of lab.
          All 3 scenarios in each set must be passed before aggregate sims unlock.
        </Text>
        {remediationSets.length === 0 ? (
          <Text style={[styles.body, { color: '#10b981' }]}>✅ No remediation sets — all lesson simulators passed</Text>
        ) : (
          remediationSets.map(rs => (
            <View key={rs.setId} style={styles.remRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.remConcept}>{rs.concept}</Text>
                <Text style={styles.remProgress}>
                  {rs.scenariosPassed}/3 scenarios passed
                  {rs.cleared ? ' — ✅ Cleared' : ' — must pass all 3'}
                </Text>
              </View>
              <View style={[styles.remStatus, { backgroundColor: rs.cleared ? '#d1fae5' : '#fee2e2' }]}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: rs.cleared ? '#065f46' : '#7f1d1d' }}>
                  {rs.cleared ? 'CLEARED' : 'PENDING'}
                </Text>
              </View>
            </View>
          ))
        )}
      </Card>

      {/* End-of-level retries */}
      {endOfLevelRetries.length > 0 && (
        <Card style={{ borderWidth: 2, borderColor: '#f59e0b' }}>
          <SectionLabel text="END-OF-LEVEL RETRIES — FINAL CHANCE" />
          <Text style={styles.body}>
            These aggregate sims were failed twice during the lab. This is your one final attempt per sim.
            Fail here and Phase 2 is permanently blocked for this level.
          </Text>
          {endOfLevelRetries.map(r => (
            <View key={r.simId} style={styles.retryRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.retryConcept}>{r.concept}</Text>
                <Text style={styles.retryLab}>Lab: {r.labId}</Text>
              </View>
              <PrimaryBtn
                label="Attempt (3 of 3)"
                onPress={() => onSubmitEndOfLevelRetry(r.simId)}
                icon="⚡"
              />
            </View>
          ))}
          <View style={styles.alertBox}>
            <Text style={styles.alertText}>
              ⚠️  This is attempt 3 of 3. A fresh unseen scenario will be generated. No hints. No pointers on fail.
            </Text>
          </View>
        </Card>
      )}

      {/* How the system works */}
      <Card>
        <SectionLabel text="HOW THE GATE SYSTEM WORKS" />
        {[
          { step: '1', label: 'Complete all lessons', detail: 'Work through every lesson in the lab' },
          { step: '2', label: 'Clear remediation sets', detail: 'Any failed lesson sim triggers a 3-scenario set. All 3 must pass.' },
          { step: '3', label: 'Complete aggregate sims', detail: 'All 15 aggregate sims attempted. Max 2 attempts each.' },
          { step: '4', label: 'Pass 90% of aggregate sims', detail: '≥14/15 passed within attempt budget. Fail limit: 1.' },
          { step: '5', label: 'End-of-level retry if needed', detail: 'One final attempt for any sim failed twice. Must pass or Phase 2 blocked.' },
          { step: '6', label: 'Phase 2 Certification Attempt unlocks', detail: 'One unseen scenario. No hints. 100% criteria = portfolio push.' },
        ].map(s => (
          <View key={s.step} style={styles.stepRow}>
            <View style={styles.stepNum}>
              <Text style={styles.stepNumText}>{s.step}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.stepLabel}>{s.label}</Text>
              <Text style={styles.stepDetail}>{s.detail}</Text>
            </View>
          </View>
        ))}
      </Card>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main screen
// ─────────────────────────────────────────────────────────────────────────────

export default function PortfolioHubScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<HubTab>('overview');
  const [artifacts, setArtifacts] = useState<PortfolioArtifact[]>([]);
  const [platformStatuses, setPlatformStatuses] = useState<PlatformStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [pushing, setPushing] = useState<string | null>(null);

  // Progression state
  const [gateStatus, setGateStatus] = useState<Phase2GateStatus | null>(null);
  const [aggSimStatus, setAggSimStatus] = useState<AggSimStatus | null>(null);
  const [remediationSets, setRemediationSets] = useState<RemediationSet[]>([]);
  const [endOfLevelRetries, setEndOfLevelRetries] = useState<Array<{ simId: string; labId: string; concept: string }>>([]);

  // Load portfolio and progression data
  useEffect(() => {
    const load = async () => {
      try {
        const [arts, statuses] = await Promise.all([
          API.getPortfolioArtifacts(),
          API.getPortfolioPlatformStatuses(),
        ]);
        setArtifacts(arts);
        setPlatformStatuses(statuses);
      } catch {
        setArtifacts([]);
        setPlatformStatuses(
          Object.entries(PLATFORM_CONFIG).map(([id, cfg]) => ({
            id,
            name: cfg.name,
            emoji: cfg.emoji,
            connected: false,
            isPrimary: cfg.isPrimary,
          }))
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Load progression data when progression tab is opened
  useEffect(() => {
    if (activeTab !== 'progression') return;
    const trackId = 'supply-chain-analyst';
    const loadProgression = async () => {
      try {
        const [gate, agg, rem, retries] = await Promise.all([
          API.getPhase2GateStatus(trackId, 'current').catch(() => null),
          API.getAggregateSimStatus(trackId, 'current').catch(() => null),
          API.getRemediationSets(trackId, 'current').catch(() => []),
          API.getEndOfLevelRetries(trackId, 'junior').catch(() => []),
        ]);
        if (gate) setGateStatus(gate);
        if (agg) setAggSimStatus(agg);
        setRemediationSets(rem as RemediationSet[]);
        setEndOfLevelRetries(retries as any[]);
      } catch { /* silently handle */ }
    };
    loadProgression();
  }, [activeTab]);

  const handlePush = useCallback(async (artifact: PortfolioArtifact, platformId: string) => {
    const key = `${artifact.id}-${platformId}`;
    setPushing(key);
    try {
      await API.pushPortfolioArtifact(artifact.id, platformId);
      setArtifacts(prev =>
        prev.map(a =>
          a.id === artifact.id
            ? { ...a, pushedTo: [...a.pushedTo, platformId] }
            : a
        )
      );
      Alert.alert('✅ Pushed', `${artifact.skill} pushed to ${PLATFORM_CONFIG[platformId]?.name ?? platformId}`);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Push failed. Please try again.');
    } finally {
      setPushing(null);
    }
  }, []);

  const handleConnect = useCallback(async (platformId: string) => {
    try {
      const { url } = await API.getPlatformAuthUrl(platformId);
      await Linking.openURL(url);
    } catch (e: any) {
      Alert.alert('Error', `Could not open ${platformId} auth. Please try again.`);
    }
  }, []);

  const handleDisconnect = useCallback(async (platformId: string) => {
    try {
      await API.disconnectPlatform(platformId);
      setPlatformStatuses(prev =>
        prev.map(p => p.id === platformId ? { ...p, connected: false, username: undefined } : p)
      );
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Disconnect failed.');
    }
  }, []);

  const handleEndOfLevelRetry = useCallback(async (simId: string) => {
    try {
      const result = await API.submitEndOfLevelRetry('supply-chain-analyst', simId, '');
      if (result.passed) {
        setEndOfLevelRetries(prev => prev.filter(r => r.simId !== simId));
        Alert.alert('✅ Passed', result.phase2NowUnlocked
          ? 'Final retry passed. Phase 2 is now unlocked — go to the lab Boss Battle.'
          : 'Passed. Check gate status for remaining requirements.');
        // Refresh gate status
        API.getPhase2GateStatus('supply-chain-analyst', 'current')
          .then(setGateStatus).catch(() => {});
      } else {
        Alert.alert('❌ Not passed', 'All criteria not met. Phase 2 is permanently blocked for this level. You will need to restart the level to earn portfolio artifacts.');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Retry failed.');
    }
  }, []);

  const TABS: Array<{ id: HubTab; label: string; emoji: string }> = [
    { id: 'overview', label: 'Overview', emoji: '🗺️' },
    { id: 'artifacts', label: `Artifacts${artifacts.length > 0 ? ` (${artifacts.length})` : ''}`, emoji: '🏆' },
    { id: 'platforms', label: 'Platforms', emoji: '🔗' },
    { id: 'progression', label: 'Gate', emoji: '🔒' },
    { id: 'credibility', label: 'Interview', emoji: '🎤' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⚡ Portfolio Hub</Text>
        <Text style={styles.headerSub}>Supply Chain Analyst</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.tabActive]}
            onPress={() => setActiveTab(tab.id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
              {tab.emoji} {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={Colors.accent} size="large" />
          <Text style={styles.loadingText}>Loading your portfolio…</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          {activeTab === 'overview' && (
            <OverviewTab artifacts={artifacts} platformStatuses={platformStatuses} />
          )}
          {activeTab === 'artifacts' && (
            <ArtifactsTab artifacts={artifacts} onPush={handlePush} />
          )}
          {activeTab === 'platforms' && (
            <PlatformsTab
              platformStatuses={platformStatuses}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
            />
          )}
          {activeTab === 'credibility' && (
            <CredibilityTab artifacts={artifacts} />
          )}
          {activeTab === 'progression' && (
            <ProgressionTab
              gateStatus={gateStatus}
              aggSimStatus={aggSimStatus}
              remediationSets={remediationSets}
              endOfLevelRetries={endOfLevelRetries}
              onSubmitEndOfLevelRetry={handleEndOfLevelRetry}
            />
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: Spacing.md, paddingBottom: 48 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: FontSize.sm, color: Colors.textSoft },

  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text },
  headerSub: { fontSize: FontSize.sm, color: Colors.textSoft, marginTop: 2 },

  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: Colors.accent + '22' },
  tabText: { fontSize: 10, color: Colors.textSoft, fontWeight: '600', textAlign: 'center' },
  tabTextActive: { color: Colors.accent, fontWeight: '800' },

  card: {
    backgroundColor: '#fff',
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textSoft,
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  body: { fontSize: FontSize.sm, color: Colors.text, lineHeight: 20, marginBottom: Spacing.sm },
  subLabel: { fontSize: 10, fontWeight: '700', color: Colors.textSoft, letterSpacing: 0.5, marginBottom: 4 },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  statBox: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 28, fontWeight: '800' },
  statLabel: { fontSize: 10, color: Colors.textSoft, marginTop: 2 },

  alertBox: {
    backgroundColor: Colors.accent + '22',
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    marginTop: Spacing.sm,
  },
  alertText: { fontSize: FontSize.sm, color: Colors.accent, fontWeight: '600' },

  platformRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.sm,
  },
  platformEmoji: { fontSize: 24, width: 36, textAlign: 'center' },
  platformNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  platformName: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text },
  platformDesc: { fontSize: 12, color: Colors.textSoft, lineHeight: 16 },
  platformUsername: { fontSize: 12, color: Colors.accent, marginBottom: 2 },

  platformItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.sm,
  },
  platformItemEmoji: { fontSize: 24, width: 36, textAlign: 'center', marginTop: 2 },

  tag: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tagText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.3 },

  credCard: { backgroundColor: '#0D0D0D' },
  credTitle: { fontSize: 11, fontWeight: '800', color: Colors.accent, letterSpacing: 1, marginBottom: Spacing.sm },
  credText: { fontSize: FontSize.sm, color: '#ccc', lineHeight: 20, marginBottom: Spacing.sm },

  levelHeader: {
    fontSize: FontSize.sm,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  artifactCard: { marginBottom: Spacing.sm },
  artifactHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  levelDot: { width: 10, height: 10, borderRadius: 5 },
  artifactSkill: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text },
  artifactMeta: { fontSize: 11, color: Colors.textSoft, marginTop: 1 },
  artifactFramework: { fontSize: 11, color: Colors.textSoft, marginTop: 4 },
  chevron: { fontSize: 12, color: Colors.textSoft },
  pushedRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 },

  artifactDetail: { marginTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing.md },
  caseStudyPreview: {
    fontSize: 11,
    color: Colors.text,
    lineHeight: 16,
    fontFamily: 'Courier',
    backgroundColor: '#f7f7f7',
    borderRadius: Radius.sm,
    padding: Spacing.sm,
  },
  pushRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  pushPlatformName: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text },
  pushCondition: { fontSize: 10, color: Colors.textSoft },
  pushedLabel: { fontSize: 11, color: '#10b981', fontWeight: '700' },

  emptyTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text, marginBottom: Spacing.sm },
  emptyBody: { fontSize: FontSize.sm, color: Colors.textSoft, lineHeight: 20 },

  interviewItem: { marginBottom: Spacing.md, borderLeftWidth: 3, borderLeftColor: Colors.accent, paddingLeft: Spacing.sm },
  interviewQ: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text, marginBottom: 4, fontStyle: 'italic' },
  interviewA: { fontSize: FontSize.sm, color: Colors.textSoft, lineHeight: 20 },

  proveItem: { paddingVertical: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border },
  proveLevel: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  proveText: { fontSize: FontSize.sm, color: Colors.textSoft, lineHeight: 18 },

  primaryBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSize.sm },

  secondaryBtn: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  secondaryBtnText: { color: Colors.text, fontWeight: '600', fontSize: 12 },

  // Progression tab
  reqRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 6, borderTopWidth: 1, borderTopColor: Colors.border },
  reqIcon: { fontSize: 16, width: 20 },
  reqLabel: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text },
  reqStatus: { fontSize: 11, color: Colors.textSoft, marginTop: 1 },

  unlockedBox: { backgroundColor: '#d1fae5', borderRadius: Radius.sm, padding: Spacing.sm },
  unlockedText: { fontSize: FontSize.sm, fontWeight: '800', color: '#065f46' },
  unlockedSub: { fontSize: 11, color: '#065f46', marginTop: 4 },

  aggRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: Spacing.sm },
  aggStat: { alignItems: 'center' },
  thresholdBar: { borderRadius: Radius.sm, padding: Spacing.sm, marginBottom: Spacing.sm },
  thresholdText: { fontSize: FontSize.sm, fontWeight: '700' },

  failedSimRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, borderTopWidth: 1, borderTopColor: Colors.border, gap: 8 },
  failedSimId: { fontSize: 12, fontWeight: '700', color: Colors.text },
  failedSimAttempts: { fontSize: 11, color: Colors.textSoft },

  remRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderTopWidth: 1, borderTopColor: Colors.border, gap: 8 },
  remConcept: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text },
  remProgress: { fontSize: 11, color: Colors.textSoft, marginTop: 1 },
  remStatus: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 3 },

  retryRow: { paddingVertical: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border, gap: 6 },
  retryConcept: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text },
  retryLab: { fontSize: 11, color: Colors.textSoft },

  stepRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 6, borderTopWidth: 1, borderTopColor: Colors.border, gap: Spacing.sm },
  stepNum: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center' },
  stepNumText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  stepLabel: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text },
  stepDetail: { fontSize: 11, color: Colors.textSoft, marginTop: 1 },
});
