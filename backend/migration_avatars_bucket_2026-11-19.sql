-- PROPOSED, NOT APPLIED. Do not run from code; apply manually in the Supabase
-- SQL Editor after review.
--
-- Private Storage bucket for uploaded profile photos. The API stores
-- `users.avatar_url = 'upload:<user_id>/<uuid>.webp'` and serves short-lived
-- signed URLs to the owner only. No storage policies are created for
-- `anon`/`authenticated`: with RLS on storage.objects and no policy, only the
-- backend service role can read/write the bucket. Idempotent and additive.
--
-- Server-side limits mirror backend/avatar_storage.py (2 MB upload; the stored
-- object is a re-encoded 512x512 WebP, normally well under 100 KB).
BEGIN;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', false, 524288, ARRAY['image/webp'])
ON CONFLICT (id) DO UPDATE
   SET public = false,
       file_size_limit = EXCLUDED.file_size_limit,
       allowed_mime_types = EXCLUDED.allowed_mime_types;

COMMIT;
