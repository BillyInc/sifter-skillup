/**
 * Sifter LevelUp — Challenge Engine
 * Manages challenge lifecycle: browsing, accepting invites,
 * team display, and submission flow.
 * Team assembly happens server-side — this is client-side only.
 */

import { API } from './api';
import type { Challenge, ChallengeTeam, ChallengeSubmission } from '../types/social';

export type ChallengeStatus = 'open' | 'active' | 'voting' | 'complete' | 'archived';

export const challengeEngine = {

  /** Fetch challenges for a field that are open or active. */
  async getFieldChallenges(fieldId: string): Promise<Challenge[]> {
    return API.challengesList({ fieldId, status: 'active' });
  },

  /** Get user's current challenge team. */
  async getMyTeam(challengeId: string): Promise<ChallengeTeam | null> {
    try { return await API.challengeGetTeam(challengeId); }
    catch { return null; }
  },

  /** Accept a challenge team invite. */
  async acceptInvite(challengeId: string): Promise<{ ok: boolean; roomId?: string }> {
    try {
      const result = await API.challengeAcceptInvite(challengeId, '');
      return { ok: true, roomId: result.room_id };
    } catch {
      return { ok: false };
    }
  },

  /** Submit team work for a challenge. */
  async submit(challengeId: string, submission: Omit<ChallengeSubmission, 'submitted_at' | 'submitted_by'>): Promise<boolean> {
    try {
      await API.challengeSubmit(challengeId, {
        ...submission,
        submitted_at: new Date().toISOString(),
      });
      return true;
    } catch {
      return false;
    }
  },

  /** Format deadline as human string. */
  formatDeadline(endDate: string): string {
    const end  = new Date(endDate);
    const now  = new Date();
    const diff = end.getTime() - now.getTime();
    const days = Math.floor(diff / 86400000);
    if (days < 0)  return 'Ended';
    if (days === 0) return 'Ends today';
    if (days === 1) return '1 day left';
    return `${days} days left`;
  },

  /** Get badge label for challenge stage. */
  stageLabel(stage: number): string {
    const STAGES = ['', 'Beginner', 'Junior', 'Associate', 'Specialist', 'Senior', 'Lead', 'Director', 'Expert'];
    return STAGES[stage] ?? 'Learner';
  },

  /** Check if current user needs to accept (status=open, not yet accepted). */
  needsAcceptance(team: ChallengeTeam, userId: string): boolean {
    const member = team.members.find(m => m.user_id === userId);
    return !!member && !member.accepted;
  },
};
