// @ts-nocheck
/**
 * Sifter Skill_Up — WatermelonDB Models
 * One class per table in watermelonSchema.ts
 *
 * ts-nocheck: WatermelonDB decorators (@field, @date, etc.) are processed by
 * Babel at runtime. TypeScript strict mode doesn't support legacy/experimental
 * decorators without emitDecoratorMetadata, and enabling that would conflict
 * with Expo's Babel pipeline. This is the standard approach for WatermelonDB
 * + TypeScript projects.
 */

import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, json, nochange } from '@nozbe/watermelondb/decorators';

// ── LocalProgress ─────────────────────────────────────────────
export class LocalProgressModel extends Model {
  static table = 'local_progress';

  @field('user_id')            declare userId: string;
  @field('completed_levels')   declare _completedLevels: string;
  @field('perfect_levels')     declare _perfectLevels: string;
  @field('current_track')      declare currentTrack: string;
  @field('current_track_name') declare currentTrackName: string;
  @field('current_level_num')  declare currentLevelNum: number;
  @field('xp')                 declare xp: number;
  @field('streak')             declare streak: number;
  @field('last_active_date')   declare lastActiveDate: string;
  @field('achievements')       declare _achievements: string;
  @field('active_field_id')    declare activeFieldId: string;
  @field('updated_at')         declare updatedAt: number;

  get completedLevels(): string[]  { try { return JSON.parse(this._completedLevels);  } catch { return []; } }
  get perfectLevels():   string[]  { try { return JSON.parse(this._perfectLevels);    } catch { return []; } }
  get achievements():    string[]  { try { return JSON.parse(this._achievements);      } catch { return []; } }
}

// ── LastPosition ──────────────────────────────────────────────
export class LastPositionModel extends Model {
  static table = 'last_position';

  @field('track_id')        declare trackId: string;
  @field('track_name')      declare trackName: string;
  @field('level')           declare level: string;
  @field('lab_id')          declare labId: string;
  @field('lab_title')       declare labTitle: string;
  @field('lesson_id')       declare lessonId: string;
  @field('lesson_title')    declare lessonTitle: string;
  @field('lesson_index')    declare lessonIndex: number;
  @field('lab_index')       declare labIndex: number;
  @field('simulator_state') declare _simulatorState: string;
  @field('saved_at')        declare savedAt: number;

  get simulatorState() {
    try { return this._simulatorState ? JSON.parse(this._simulatorState) : null; }
    catch { return null; }
  }
}

// ── SyncQueue ─────────────────────────────────────────────────
export class SyncQueueModel extends Model {
  static table = 'sync_queue';

  @field('item_id')    declare itemId: string;
  @field('priority')   declare priority: string;
  @field('endpoint')   declare endpoint: string;
  @field('method')     declare method: string;
  @field('body')       declare _body: string;
  @field('created_at') declare createdAt: number;
  @field('attempts')   declare attempts: number;
  @field('status')     declare status: string;

  get body() { try { return JSON.parse(this._body); } catch { return {}; } }
}

// ── ContentManifest ───────────────────────────────────────────
export class ContentManifestModel extends Model {
  static table = 'content_manifest';

  @field('track_id')      declare trackId: string;
  @field('version')       declare version: number;
  @field('downloaded_at') declare downloadedAt: number;
  @field('size_kb')       declare sizeKb: number;
}

// ── CachedContent ─────────────────────────────────────────────
export class CachedContentModel extends Model {
  static table = 'cached_content';

  @field('track_id') declare trackId: string;
  @field('content')  declare _content: string;
  @field('version')  declare version: number;
  @field('saved_at') declare savedAt: number;

  get content() { try { return JSON.parse(this._content); } catch { return null; } }
}

// ── LevelScore ────────────────────────────────────────────────
export class LevelScoreModel extends Model {
  static table = 'level_scores';

  @field('level_id')     declare levelId: number;
  @field('track_id')     declare trackId: string;
  @field('score')        declare score: number;
  @field('stars')        declare stars: number;
  @field('is_perfect')   declare isPerfect: boolean;
  @field('completed_at') declare completedAt: number;
  @field('synced')       declare synced: boolean;
}

// ── Bookmark ─────────────────────────────────────────────────
export class BookmarkModel extends Model {
  static table = 'bookmarks';

  @field('level_id') declare levelId: number;
  @field('topic')    declare topic: string;
  @field('fact')     declare fact: string;
  @field('saved_at') declare savedAt: number;
}

// ── Note ─────────────────────────────────────────────────────
export class NoteModel extends Model {
  static table = 'notes';

  @field('level_id')   declare levelId: number;
  @field('topic')      declare topic: string;
  @field('content')    declare content: string;
  @field('created_at') declare createdAt: number;
}

// ── StarknetTransaction ───────────────────────────────────────
export class StarknetTransactionModel extends Model {
  static table = 'starknet_transactions';

  @field('tx_hash')      declare txHash: string;
  @field('network')      declare network: string;
  @field('tx_type')      declare txType: string;
  @field('lesson_id')    declare lessonId: string;
  @field('lab_id')       declare labId: string;
  @field('amount')       declare amount: string;
  @field('token')        declare token: string;
  @field('explorer_url') declare explorerUrl: string;
  @field('created_at')   declare createdAt: number;
  @field('synced')       declare synced: boolean;
}
