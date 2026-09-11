# Colour

## Roles, not a palette
A palette is a list. A system assigns **roles**, and roles are what stop drift:

- **ground** — the surface. One per context.
- **ink** — primary content on that ground.
- **ink-muted** — secondary and legal. Must still clear contrast minimums.
- **accent** — the one saturated thing. Usually the CTA fill.
- **reserved** — colours that must never appear in a given context (packaging foil, a sub-brand, a
  partner mark). A colour with no stated role is a colour that ends up on a CTA.

A value not assigned a role will be misused. That is not a discipline problem; it is a specification gap.

## The accent is a budget, not a colour
**One saturated element per frame** unless the brand says otherwise. Two amber things read as a sale.
Three read as a template.

The accent should be the **rest** of the eye path, not its entry. If the only saturated object is the
button, the viewer reaches the ask before the case.

## Contrast is arithmetic — do it
- Body: **4.5:1**. Large text (≥24px, or ≥19px bold): **3:1**. Non-text UI boundaries: **3:1**.
- The failure is almost always **knockout on the accent**. Light ink on a mid-tone accent commonly lands
  at 2.5–3:1 and fails. Test both the brand's ink and its ground against the accent and pick the passing
  one — and if neither passes, that is a finding for the brand lead, not a value to invent.

## Grounds
- **Dark grounds** make saturated accents sing and make photography harder — cut-outs show their edges.
- **Light grounds** are safer with photography, and harder to make distinctive.
- **A ground assigned to one context does not travel.** Retail ground on paid social is a common,
  invisible drift — invisible because every individual value is legal.

## The generated-design clusters
These appear regardless of subject, which is what makes them defaults rather than choices. Measure, do
not squint. **Euclidean distance:** `sqrt((R1-R2)² + (G1-G2)² + (B1-B2)²)`. Under 20 is the same colour.

1. **Cream + high-contrast serif + terracotta.** Ground near `#F4F1EA`, accent near `#D97757`.
2. **Near-black ground + one acid-green or vermilion accent.** Tinted near-blacks: `#0B0B0B`, `#111`.
3. **Broadsheet** — hairline rules, zero radius, dense columns.
4. **The SaaS-card kit** — identical rounded cards, one radius everywhere, the same soft grey shadow
   under each, gradient washes as decoration.

**Where the client's system pins a value, the system wins outright** — a brand that owns a terracotta
owns it. What you must not do is *reach* for one of these on an axis the brief left free.

## Building a palette that is a choice
- Start from the **subject's own world** — its materials, its industry, its vernacular. A toy for
  8-year-olds and a dashboard for analysts should not be able to swap palettes.
- **Restrict hard.** Four to six values with roles beats twelve without. Every additional colour is a
  future inconsistency.
- **Decide the temperature deliberately.** Warm and cool are the loudest signal a palette sends and the
  one most often left to accident.
- **Check your accent against cluster 1 numerically before you commit.** The most common way a
  "distinctive" palette turns out to be a default is a warm-clay accent nobody measured.

## Flat by default
Shadows, gradients, glows and blurs are decisions, not defaults. Most ads need none of them. If a
gradient is doing work, name the work.
