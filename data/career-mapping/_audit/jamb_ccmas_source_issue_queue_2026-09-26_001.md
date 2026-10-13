# JAMB–CCMAS source issue queue — 2026-09-26 (001)

Status: **open source phase**. This append-only checkpoint covers all 420 JAMB identities and the current 237-package CCMAS anomaly queue. It does not edit shared source/mapping files or downstream taxonomy data.

## Scope

- `canonical_jamb_identities`: **420**
- `ccmas_programme_packages`: **237**
- `ccmas_course_records`: **9854**
- `identity_rows_with_open_issues`: **420**
- `identity_rows_without_current_issue_detected`: **0**

## Issue counts

- identity `candidate`: **44**
- identity `confirmed_gap`: **1249**
- catalogue `candidate`: **1102**
- catalogue `classified_source_repeat_no_repair`: **3**

The JSON queue contains evidence URL, locator, access date, affected course locators, confirmed-gap versus candidate state, and repair recommendation for each recorded issue. Existing closed local repairs are listed but not reopened.

## Source-phase closure rule

No identity closes until its exact JAMB offering context, every substantive title component, selected course/outcome fidelity, item-level source URL/locator/access date, and student-facing status are all verified. Candidate anomaly queues are not proof of defects. Downstream domain/subgroup/role audit remains deferred.

Downstream domain, subgroup, role, and role-naming audits remain deferred.
