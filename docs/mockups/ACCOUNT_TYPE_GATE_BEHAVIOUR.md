# Account Type Gate Behaviour Mockup

Status: approved direction for the current onboarding unblock

This is a behavior and layout reference for the first decision after
authentication. The selected user type is still locked once the next flow
starts.

## Mobile and desktop first screen

```text
Choose your starting point
This decides which questions, requirements and guidance you will see next.

I am joining as
+--------------------------------------------------+
| Select your user type                         v  |
| We will tailor the next questions to your path.  |
+--------------------------------------------------+

[Continue]  disabled until one option is selected
```

The desktop version uses a constrained single-column form. It does not stretch
six persona cards across the page and does not use a student/admin dashboard
layout before the user has chosen a path.

## Selection sheet

```text
Choose your path                                  X
Select one option. The next screen will be built around it.

(map)  SS1 Student                         ( )
       School, stream and early subject guidance

(map)  SS2 Student                         ( )
       Narrow subjects before SS3 and UTME decisions

(book) SS3 Student                         ( )
       School-based final-year admission guidance

(book) JAMB Candidate                      ( )
       Tutorial centre or self-taught UTME guidance

(users) Undergraduate Student              ( )
        Start from your university and programme

(home) Educator / Institution              ( )
       Guide students from a school, university or centre
```

Six supported options are enough to show directly in the sheet. Search is not
needed for this list. Hidden product types do not appear as disabled rows.

## After selection, before Continue

```text
I am joining as
+--------------------------------------------------+
| SS2 Student                                    v |
| Narrow subjects before SS3 and UTME decisions    |
+--------------------------------------------------+

Info  Continue to lock this guidance path. A different path can only be chosen
      by returning here and starting that path again.

[Continue]
```

Selecting an option only previews it. `Continue` commits the choice and enters
the corresponding flow. The next screen does not show a generic user-type
dropdown.

## Behaviour rules

- SS1 and SS2 remain distinct choices. The stored student context uses the
  existing `senior_secondary` route plus the selected class so the product can
  keep their behavior different without inventing a new backend type.
- SS3, JAMB, undergraduate, and educator each enter their own flow.
- Back navigation inside an incomplete flow shows the existing confirmation
  guard. `Back to user selection` is an intentional correction action and clears
  dependent answers before returning to this gate.
- Refreshing a committed incomplete flow restores the saved choice and
  checkpoint. Refreshing before `Continue` does not commit a new type.
- All copy explains what the choice changes; no internal route names, database
  labels, or legacy SkillUp loading screen appears.
