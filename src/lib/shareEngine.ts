/**
 * Sifter Skill_Up — Share Engine
 *
 * Level completion → share to socials (motivational, not portfolio)
 * Portfolio artifact earned → push to primary portfolio platform
 *   THEN post link to ALL connected socials
 *
 * Uses React Native Share API for native share sheet.
 * Deep links back to the user's public Sifter profile.
 */

import { Share, Platform } from 'react-native';
import { offlineWrite } from './offlineQueue';

export interface SharePayload {
  type: 'level_complete' | 'portfolio_artifact';
  userName: string;
  trackName: string;
  levelName?: string;
  artifactName?: string;
  portfolioUrl?: string;
  verificationUrl?: string;
  xp?: number;
  userId: string;
}

const LEVEL_SHARE_MESSAGES = [
  "Just cleared {level} on @SifterSkillUp 🏆 Building real {track} skills — one level at a time. {url}",
  "⚡ {level} done on @SifterSkillUp. {track} is one of the highest-demand skills right now — and I'm building it. {url}",
  "🎯 Another level cleared. {track} skills + verified portfolio = career momentum. {url}",
];

const PORTFOLIO_SHARE_MESSAGES = [
  "🏆 Just earned a verified {track} portfolio artifact on @SifterSkillUp — scored 100% on an unseen case study, assessed against industry standards. See it here: {portfolio}",
  "⚡ New portfolio artifact: {artifact} — verified by @SifterSkillUp against APICS/CSCMP standards. Not a certificate. Actual proof. {portfolio}",
  "📊 My {track} portfolio just grew. Every artifact earned by passing, not just completing. {portfolio}",
];

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

function fill(template: string, vars: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
}

export async function shareOnLevelComplete(payload: SharePayload) {
  const profileUrl = `https://sifter.app/u/${payload.userId}`;
  const message = fill(pick(LEVEL_SHARE_MESSAGES), {
    level: payload.levelName ?? 'a level',
    track: payload.trackName,
    url: profileUrl,
  });

  try {
    await Share.share({ message, url: profileUrl });
  } catch {}

  // Log share event (queued for offline)
  await offlineWrite('/api/analytics/share', 'POST', {
    userId: payload.userId,
    type: 'level_complete',
    trackId: payload.trackName,
  }, 'normal');
}

export async function shareOnPortfolioArtifact(payload: SharePayload) {
  const portfolioUrl = payload.portfolioUrl ?? `https://sifter.app/u/${payload.userId}/portfolio`;
  const message = fill(pick(PORTFOLIO_SHARE_MESSAGES), {
    track: payload.trackName,
    artifact: payload.artifactName ?? 'Portfolio Artifact',
    portfolio: portfolioUrl,
  });

  // 1. Native share sheet — user posts to any platform they want
  try {
    await Share.share({ message, url: portfolioUrl });
  } catch {}

  // 2. Backend posts to all connected socials automatically
  await offlineWrite('/api/portfolio/social-blast', 'POST', {
    userId: payload.userId,
    artifactName: payload.artifactName,
    portfolioUrl,
    verificationUrl: payload.verificationUrl,
    message,
  }, 'high');
}
