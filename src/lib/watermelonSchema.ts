/**
 * Sifter Skill_Up — WatermelonDB Schema
 *
 * Defines every table the local database holds.
 * Maps 1:1 to what lives in Supabase, but only the columns
 * the app actually reads offline. Server columns not needed
 * offline (e.g. guild_role, withdrawals) are omitted.
 *
 * Install:
 *   npx expo install @nozbe/watermelondb
 *   npx expo install @nozbe/with-observables
 *
 * Also add to babel.config.js plugins:
 *   ['@babel/plugin-proposal-decorators', { legacy: true }]
 */

import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [

    // ── User progress (single row per install) ───────────────
    tableSchema({
      name: 'local_progress',
      columns: [
        { name: 'user_id',            type: 'string' },
        { name: 'completed_levels',   type: 'string' },  // JSON array string
        { name: 'perfect_levels',     type: 'string' },  // JSON array string
        { name: 'current_track',      type: 'string' },
        { name: 'current_track_name', type: 'string', isOptional: true },
        { name: 'current_level_num',  type: 'number' },
        { name: 'xp',                 type: 'number' },
        { name: 'streak',             type: 'number' },
        { name: 'last_active_date',   type: 'string' },
        { name: 'achievements',       type: 'string' },  // JSON array string
        { name: 'active_field_id',    type: 'string', isOptional: true },
        { name: 'updated_at',         type: 'number' },  // Unix ms
      ],
    }),

    // ── Last position (resume exactly where stopped) ─────────
    tableSchema({
      name: 'last_position',
      columns: [
        { name: 'track_id',        type: 'string' },
        { name: 'track_name',      type: 'string' },
        { name: 'level',           type: 'string' },   // junior|intermediate|senior
        { name: 'lab_id',          type: 'string' },
        { name: 'lab_title',       type: 'string' },
        { name: 'lesson_id',       type: 'string' },
        { name: 'lesson_title',    type: 'string' },
        { name: 'lesson_index',    type: 'number' },
        { name: 'lab_index',       type: 'number' },
        { name: 'simulator_state', type: 'string', isOptional: true }, // JSON
        { name: 'saved_at',        type: 'number' },   // Unix ms
      ],
    }),

    // ── Offline sync queue ────────────────────────────────────
    // Survives app kills. Drained to /api/sync/drain on reconnect.
    tableSchema({
      name: 'sync_queue',
      columns: [
        { name: 'item_id',    type: 'string' },         // client UUID (idempotency key)
        { name: 'priority',   type: 'string' },         // critical|high|normal
        { name: 'endpoint',   type: 'string' },
        { name: 'method',     type: 'string' },
        { name: 'body',       type: 'string' },         // JSON string
        { name: 'created_at', type: 'number' },         // Unix ms
        { name: 'attempts',   type: 'number' },
        { name: 'status',     type: 'string' },         // pending|failed
      ],
    }),

    // ── Content manifest (what track content is downloaded) ──
    tableSchema({
      name: 'content_manifest',
      columns: [
        { name: 'track_id',      type: 'string' },
        { name: 'version',       type: 'number' },
        { name: 'downloaded_at', type: 'number' },      // Unix ms
        { name: 'size_kb',       type: 'number' },
      ],
    }),

    // ── Cached lesson content (downloaded per track) ─────────
    // Stores the full lesson data blob so lessons work offline.
    tableSchema({
      name: 'cached_content',
      columns: [
        { name: 'track_id',   type: 'string' },
        { name: 'content',    type: 'string' },         // JSON blob
        { name: 'version',    type: 'number' },
        { name: 'saved_at',   type: 'number' },         // Unix ms
      ],
    }),

    // ── Level scores (local copy, synced to server) ──────────
    tableSchema({
      name: 'level_scores',
      columns: [
        { name: 'level_id',     type: 'number' },
        { name: 'track_id',     type: 'string' },
        { name: 'score',        type: 'number' },
        { name: 'stars',        type: 'number' },
        { name: 'is_perfect',   type: 'boolean' },
        { name: 'completed_at', type: 'number' },       // Unix ms
        { name: 'synced',       type: 'boolean' },
      ],
    }),

    // ── Bookmarks ────────────────────────────────────────────
    tableSchema({
      name: 'bookmarks',
      columns: [
        { name: 'level_id',  type: 'number' },
        { name: 'topic',     type: 'string' },
        { name: 'fact',      type: 'string' },
        { name: 'saved_at',  type: 'number' },          // Unix ms
      ],
    }),

    // ── Notes ────────────────────────────────────────────────
    tableSchema({
      name: 'notes',
      columns: [
        { name: 'level_id',   type: 'number' },
        { name: 'topic',      type: 'string' },
        { name: 'content',    type: 'string' },
        { name: 'created_at', type: 'number' },         // Unix ms
      ],
    }),

    // ── Starknet transactions (offline-logged, synced later) ─
    tableSchema({
      name: 'starknet_transactions',
      columns: [
        { name: 'tx_hash',      type: 'string' },
        { name: 'network',      type: 'string' },
        { name: 'tx_type',      type: 'string' },
        { name: 'lesson_id',    type: 'string', isOptional: true },
        { name: 'lab_id',       type: 'string', isOptional: true },
        { name: 'amount',       type: 'string', isOptional: true },
        { name: 'token',        type: 'string', isOptional: true },
        { name: 'explorer_url', type: 'string', isOptional: true },
        { name: 'created_at',   type: 'number' },       // Unix ms
        { name: 'synced',       type: 'boolean' },
      ],
    }),

  ],
});
