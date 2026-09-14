# Sifter LevelUp product-wide mockup direction

This is the visual review spec for the first product-wide mockup pass. It is
intentionally separate from the live feature routes: the existing application
and data model remain the source of truth while the direction is reviewed.

## Reference intent

The supplied Level Up references establish the visual language:

- stacked breadcrumb context at the top of every screen;
- one confident page title followed by a short explanation;
- friendly grouped cards with a clear section question;
- soft colour families for different concepts, restrained borders and shadows;
- a single, obvious next action;
- progressive disclosure instead of dense portal-style tables.

The Sifter implementation keeps its own product palette and content rules:
orange action, dark navy/charcoal text, green positive states, blue information,
amber warning, red error, Inter typography, and real catalogue/account values
only. Catalogue examples from screenshots are not copied into product data.

## Preview surfaces

The mockup studio previews these surface families for both web and mobile:

| Family | Preview purpose | Honest unavailable state |
| --- | --- | --- |
| Home | starting point, current guidance, next action | no saved path yet |
| Explore | search-first programme/domain/role discovery | no live results yet |
| My World | saved careers, bookmarks, notes | nothing saved yet |
| Profile | account and preference entry points | profile data follows account |
| Auth | sign in, create account, guest entry | validation/error slots |
| Intro | explain the connected guidance journey | skip/continue states |
| Terms | consent and document reading | continue disabled until consent |
| Skill matcher | subject/goal selection | no match shown until real input |
| Programme intelligence | requirements, schools, pathways | source-backed data states |
| Market intelligence | opportunity/market context | live snapshot unavailable |
| Admin | overview, guidance, verification, market | permission/empty/locked states |

## Shared interaction contract

The mockup controls are representative of the intended behavior:

- mode switch changes the complete surface between light and dark tokens;
- web/mobile switch changes navigation chrome and content density;
- surface selection changes the breadcrumb, title, components and next action;
- every empty/locked state explains what happened and gives the next safe action;
- transitions are short fade/slide-up reveals, with reduced-motion fallback;
- the logo is isolated behind the existing `LevelUpLogo` component so it can be
  replaced without changing the product shell.

## Responsive direction

Web uses persistent navigation, a wider information canvas and contextual
secondary panels. Mobile uses a compact header, horizontally scrollable
breadcrumbs, stacked content and a five-destination bottom navigation. The
same hierarchy is preserved, but mobile is not a shrunken desktop.

## Content integrity

This mockup pass uses labels and flows already present in the repository such as
Explore, Opportunities, My World, Profile, programme/domain/role discovery,
guidance and admin verification. It deliberately does not add universities,
programmes, cut-offs, scores, market figures, salaries, opportunities or match
percentages. When a live source is unavailable, the mockup shows an empty,
locked or source-pending state instead.

## Next implementation phase

After visual review, the shared tokens and shell patterns can be promoted into
the live routes in this order:

1. shell, breadcrumbs and navigation;
2. auth and intro/terms;
3. Home, Explore and My World;
4. programme intelligence and skill matcher;
5. opportunities and market intelligence;
6. profile/settings and admin workspace;
7. edge states, accessibility and motion refinement.
