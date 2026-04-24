-- ============================================================
-- Sifter SkillUp — privy_did column migration
-- Schema: skillup_dev
--
-- Adds a nullable `privy_did` column to skillup_dev.users so the
-- Starknet/Privy auth handler can key the user upsert by Privy
-- Decentralized Identifier (DID) instead of email. Uses a partial
-- UNIQUE index so pre-existing rows with NULL privy_did don't
-- collide. Run in Supabase SQL Editor.
-- Depends on: existing skillup_dev.users table
-- ============================================================

ALTER TABLE skillup_dev.users
  ADD COLUMN IF NOT EXISTS privy_did TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS users_privy_did_unique
  ON skillup_dev.users(privy_did)
  WHERE privy_did IS NOT NULL;
