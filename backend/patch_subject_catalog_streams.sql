-- Corrective patch: subject availability and user-facing subject tags are
-- separate concerns. This does not delete, archive, or remove any subject.
-- Keep Auto Mechanics in the catalog and restore its existing science stream
-- visibility. The UI should not render stream_tags as chips under subject names.
UPDATE skillup_dev.subject_catalog
SET stream_tags = ARRAY['science']
WHERE code = 'AUTO';

-- Technical/vocational is a selectable school stream, not merely a subject
-- category. Preserve every existing cross-stream tag and add Technical to
-- technical-category rows and the core subjects.
UPDATE skillup_dev.subject_catalog
SET stream_tags = CASE
  WHEN 'technical' = ANY(stream_tags) THEN stream_tags
  ELSE array_append(stream_tags, 'technical')
END
WHERE category = 'technical' OR code IN ('ENG', 'MATH', 'CIV');
