# Client profile — <CLIENT NAME>

> Copy this folder to `clients/<name>/`, fill it in, and point the team at it.
> Agents load this BEFORE any work. Mark unknowns `TBD` — never invent a value here.

## Who they are
Business, audience, product, market. Voice and tone. Brand promise. What they are NOT.

## Design system
Where it lives (file / repo / URL + IDs). Sections. Who owns it. Where the local mirror sits, if any.

## Tokens (authoritative values)
- **Colors** with roles: ground · ink · accent · reserved (e.g. logo-only colors that must never
  appear on a CTA or as decoration)
- **Typography**: families, weights, scale, fallbacks, localization fonts, and which are actually
  installed on the build machine
- **Spacing scale** and the vertical rhythm between label → headline → sub → CTA
- **Radius scale + ceiling** (the largest radius any rectangle may take)
- **Effects**, and which are forbidden

## Source law
Where visual elements may come from (the client's site, product, or supplied asset library).
What is forbidden: invention, third-party stock, legacy assets predating the current system.
Catalogs and inventories with IDs. Subtraction and cropping are legal; drawing is not.

## Format matrix
**Derive this from `knowledge/platforms/`, not from what the team built last time.** For each placement
in scope, take the platform's *recommended* resolution, not its minimum — minimums are rejection
thresholds. Run `/format-matrix` and paste the result here.

Then: naming convention (state the exact segments), and the region × language matrix.

A size that matches no live placement is wasted work, and a master at the wrong ratio makes every
derivative wrong too.

## Headline grammar & copy rules
Structure, approved factual claims with exact numbers, banned language, CTA vocabulary.

## Known hazards
Tool and file gotchas, locked assets, fonts not installed, nodes that break tooling, transport limits.
Anything that has cost the team a round before.
