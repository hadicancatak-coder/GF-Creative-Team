# Client profile — Northwind Cycles

> ⚠️ **FICTIONAL.** Northwind Cycles does not exist. This profile is a worked example showing the shape
> and the level of specificity a real profile needs. Copy `clients/TEMPLATE/` for real work.

## Who they are
Direct-to-consumer electric bike brand, founded 2019, sells in the UK, Germany and the Netherlands.
Two products: **Drift** (commuter, step-through) and **Ridge** (trail, full-suspension).
Audience: 28–45, urban and suburban, replacing a second car — not cycling enthusiasts.
Voice: plain, confident, unhurried. Never sporty-aggressive, never eco-preachy.
Brand promise: "The ride that replaces the drive."
What they are NOT: a fitness brand, a lifestyle brand, or a budget brand.

## Design system
Figma file `NW-DS-2026` — pages: `01 Foundations` · `02 Components` · `03 Ad Kit` · `04 Photography` ·
`05 Templates`. Owned by the in-house design lead. Local mirror in `design-system/`.

## Tokens
- **Grounds:** paper `#FAF8F4` · slate `#1B2A32` · fog `#E4E9EA`
- **Ink:** heading `#1B2A32` · body `#41535C` · muted `#8CA0A9` · on-dark `#FFFFFF`
- **Accent:** signal-orange `#E4622D` — CTA and one accent word only, never a background fill
- **Reserved:** `#0F7C6B` is the *warranty seal* green — **logo and seal only**, never decoration
- **Type:** headings `Söhne` (Buch / Kräftig); body `Inter`; DE and NL use the same stack.
  Fallback `Georgia` is documented but must be flagged if it renders.
- **Ad type scale:** square headline 58–72 · story 70–82 · sub 20–28 · legal 14–16
- **Radius:** 4 / 8 / 16 — **16 is the ceiling** for rectangles; pill 9999 for buttons and chips only
- **Spacing:** 4/8/12/16/24/32/48/64/80. Margins 72 (square, landscape), 56 (story, small formats)
- **Rhythm:** eyebrow→headline 20 · headline→sub 24 · sub→CTA 32+

## Source law
**Product photography + the current site only.** Every visual element traces to a shot in
`photography/2026-approved/` or a mined node on the live site. Forbidden: third-party stock, AI-generated
bikes or riders, and the entire `photography/2023-archive/` set (pre-redesign frame geometry — the bikes
in it are not the bikes being sold). Subtraction and cropping are legal; drawing is not.

## Format matrix
1080×1080 (master, always built first) · 1080×1920 · 1200×628 · 960×1200.
Naming: `{Campaign}_{Variant}_{Region}_{Lang}_{Size}`.
Regions: UK · DE · NL. Languages: EN · DE · NL.

## Headline grammar & copy rules
Two lines. Line 1 states the situation in ink; line 2 delivers the turn in signal-orange.
Sentence case, period-terminated. Sublines carry verifiable facts only, in approved numbers.
CTA vocabulary: "Book a test ride" · "See the range" · "Find your size". Eyebrows are labels, never actions.
Banned: "eco-friendly", "game-changer", any comparative against a named competitor, any phrasing that
implies the bike is a car.

## Known hazards
- Ridge hero shots are 6000px — downscale before placing or the export stalls.
- The site's product configurator renders as a flattened raster; text inside it is not selectable and
  must not be re-typed. Use it as an image or not at all.
- `Söhne Kräftig` is not installed on the build machine. Every build using it must be flagged.
- German headlines run ~30% longer than English — re-fit, never condense the type.
