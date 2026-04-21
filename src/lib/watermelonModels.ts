/**
 * Sifter Skill_Up — WatermelonDB Models
 * One class per table in watermelonSchema.ts
 */

import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, json, nochange } from '@nozbe/watermelondb/decorators';

// ── LocalProgress ─────────────────────────────────────────────
export class LocalProgressModel extends Model {
  static table = 'local_progress';

  @field('user_id')            userId!: string;
  @field('completed_levels')   _completedLevels!: string;
  @field('perfect_levels')     _perfectLevels!: string;
  @field('current_track')      currentTrack!: string;
  @field('current_track_name') currentTrackName!: string;
  @field('current_level_num')  currentLevelNum!: number;
  @field('xp')                 xp!: number;
  @field('streak')             streak!: number;
  @field('last_active_date')   lastActiveDate!: string;
  @field('achievements')       _achievements!: string;
  @field('active_field_id')    activeFieldId!: string;
  @field('updated_at')         updatedAt!: number;

  get completedLevels(): string[]  { try { return JSON.parse(this._completedLevels);  } catch { return []; } }
  get perfectLevels():   string[]  { try { return JSON.parse(this._perfectLevels);    } catch { return []; } }
  get achievements():    string[]  { try { return JSON.parse(this._achievements);      } catch { return []; } }
}

// ── LastPosition ──────────────────────────────────────────────
export class LastPositionModel extends Model {
  static table = 'last_position';

  @field('track_id')        trackId!: string;
  @field('track_name')      trackName!: string;
  @field('level')           level!: string;
  @field('lab_id')          labId!: string;
  @field('lab_title')       labTitle!: string;
  @field('lesson_id')       lessonId!: string;
  @field('lesson_title')    lessonTitle!: string;
  @field('lesson_index')    lessonIndex!: number;
  @field('lab_index')       labIndex!: number;
  @field('simulator_state') _simulatorState!: string;
  @field('saved_at')        savedAt!: number;

  get simulatorState() {
    try { return this._simulatorState ? JSON.parse(this._simulatorState) : null; }
    catch { return null; }
  }
}

// ── SyncQueue ─────────────────────────────────────────────────
export class SyncQueueModel extends Model {
  static table = 'sync_queue';

  @field('item_id')    itemId!: string;
  @field('priority')   priority!: string;
  @field('endpoint')   endpoint!: string;
  @field('method')     method!: string;
  @field('body')       _body!: string;
  @field('created_at') createdAt!: number;
  @field('attempts')   attempts!: number;
  @field('status')     status!: string;

  get body() { try { return JSON.parse(this._body); } catch { return {}; } }
}

// ── ContentManifest ───────────────────────────────────────────
export class ContentManifestModel extends Model {
  static table = 'content_manifest';

  @field('track_id')      trackId!: string;
  @field('version')       version!: number;
  @field('downloaded_at') downloadedAt!: number;
  @field('size_kb')       sizeKb!: number;
}

// ── CachedContent ─────────────────────────────────────────────
export class CachedContentModel extends Model {
  static table = 'cached_content';

  @field('track_id') trackId!: string;
  @field('content')  _content!: string;
  @field('version')  version!: number;
  @field('saved_at') savedAt!: number;

  get content() { try { return JSON.parse(this._content); } catch { return null; } }
}

// ── LevelScore ────────────────────────────────────────────────
export class LevelScoreModel extends Model {
  static table = 'level_scores';

  @field('level_id')     levelId!: number;
  @field('track_id')     trackId!: string;
  @field('score')        score!: number;
  @field('stars')        stars!: number;
  @field('is_perfect')   isPerfect!: boolean;
  @field('completed_at') completedAt!: number;
  @field('synced')       synced!: boolean;
}

// ── Bookmark ─────────────────────────────────────────────────
export class BookmarkModel extends Model {
  static table = 'bookmarks';

  @field('level_id') levelId!: number;
  @field('topic')    topic!: string;
  @field('fact')     fact!: string;
  @field('saved_at') savedAt!: number;
}

// ── Note ─────────────────────────────────────────────────────
export class NoteModel extends Model {
  static table = 'notes';

  @field('level_id')   levelId!: number;
  @field('topic')      topic!: string;
  @field('content')    content!: string;
  @field('created_at') createdAt!: number;
}

// ── StarknetTransaction ───────────────────────────────────────
export class StarknetTransactionModel extends Model {
  static table = 'starknet_transactions';

  @field('tx_hash')      txHash!: string;
  @field('network')      network!: string;
  @field('tx_type')      txType!: string;
  @field('lesson_id')    lessonId!: string;
  @field('lab_id')       labId!: string;
  @field('amount')       amount!: string;
  @field('token')        token!: string;
  @field('explorer_url') explorerUrl!: string;
  @field('created_at')   createdAt!: number;
  @field('synced')       synced!: boolean;
}
