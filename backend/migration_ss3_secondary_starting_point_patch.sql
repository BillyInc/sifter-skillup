-- Allow the split SS3 secondary-student onboarding type in existing projects.
-- O-level subjects do not need a new column: student_subject_choices already
-- supports choice_type = 'olevel', and raw_profile stores the full payload.

ALTER TABLE skillup_dev.student_starting_points
  DROP CONSTRAINT IF EXISTS student_starting_points_user_type_check;

ALTER TABLE skillup_dev.student_starting_points
  ADD CONSTRAINT student_starting_points_user_type_check
  CHECK (
    user_type IN (
      'senior_secondary',
      'ss3_secondary',
      'jamb',
      'student',
      'skilled_worker',
      'professional',
      'graduate'
    )
  );
