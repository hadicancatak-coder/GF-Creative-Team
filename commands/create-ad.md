---
description: Make an ad creative. Art Director closes the brief, one designer builds it, Art Director verifies. Everything else is conditional.
---

Create ad creative for: $ARGUMENTS

**Two roles on the default path. That is the whole team for one ad.**

```
brief → ART DIRECTOR ──asks the blocking questions · THREE routes · specs its pick
                     ↓
                  YOU ──pick a route
                     ↓
              DESIGNER ──builds it in Figma, owns every number
                     ↓
        check-build.mjs ──arithmetic, free, instant
                     ↓
        ART DIRECTOR ──verifies the picture
```

Three dispatches. Everyone else is engaged only when the job actually calls for them.

## 1. Art Director — closes the brief

Dispatch `art-director` **first, always**. It loads the client profile, works out what is missing, and
**asks you the blocking questions in one message.** Answer them; it does not proceed without you.

It separates blocking from assumable honestly — a missing platform blocks, a missing master size does
not (it derives that from the platform's recommended resolution and tells you which placement it used).
Expect one round of questions. A second round means it did not think hard enough.

It returns **three routes** — three different structural patterns, not three dressings of one idea —
each as a pattern, a one-line idea, the actual headline written out, and what it costs. One of them will
be uncomfortable; that is deliberate, and it is what makes the other two choices rather than defaults.
It names a recommendation and specs **that one only**.

**Pick a route.** If you take the recommendation, nothing more is needed. If you take another, speccing
it is one cheap dispatch.

The spec carries: canvas, proportion, which step of the type scale and why, colour roles and accent
budget, elements in reading order with copy verbatim, the eye path, and the one thing that must survive
at thumbnail. **No pixel coordinates** — those belong to the designer.

## 2. Designer — builds it

Dispatch `designer` once, with the spec. It derives every number from the token system by rule, builds,
self-measures, and reports its deviations. It is the only role that writes to Figma.

Ask it to **export the artboard to PNG on disk** and return `artboardIds` and the render paths. The
reviewers frequently cannot reach the design tool; a file always works.

When fixing existing work it duplicates the artboard and builds `_v<n>` alongside, so the previous
version survives as the comparison.

## 3. Run the arithmetic — before you spend a dispatch on it

```bash
node scripts/check-build.mjs build.json tokens.json
```

Gaps against the spacing scale, type against the type scale, colours against tokens, accent-use count,
reserved colours, sub-pixel geometry, message-vs-decoration share, total empty span, and whether the
accent is a generated-design tell. **Milliseconds, free, and it never disagrees with itself.**

Do not dispatch an agent to do arithmetic.

## 4. Art Director — verifies

Dispatch `art-director` again with the renders. It answers its non-optional checks with numbers —
thumbnail survivor, proportion, emptiness, affordance, lineage — and judges the picture **on its own
merit, not against its own spec**, because a spec can be wrong.

## Engage the others only when the job calls for it

| Role | Engage when |
|---|---|
| `creative-director` | a **design system** must be created or extended, or **2+ creatives for one brand** must cohere as a set. Also rules when the designer and AD disagree. **Not for one ad against an existing profile.** |
| `quality-officer` | the category is **regulated**, mandated text applies, a claim needs substantiation, or anything is about to be **trafficked**. Runs last, on final state, and re-runs after any change. |
| `content-creator` | copy is the **lead deliverable**, a standalone deck is wanted, or per-placement/per-language field copy is needed. |
| `design-analyst` | a measurement is **contested**, or the token system itself needs a drift audit. Routine arithmetic is the script's job. |
| `financial-controller` | auditing a run afterwards. |

## Before dispatching anything

1. Resolve `.creative-team/active`. No profile? Say so in one line and run in reduced scope — tokens,
   source law and compliance go unchecked, and that is a caveat, not a blocker.
2. Confirm the **Figma MCP is connected.** Do not describe an ad you cannot build.
3. Build the **master size only.** Derive other placements after a human approves it, and build each
   natively against its own safe zones — a derivative is not a rescale.

## Rules that do not bend

- **Never invent a visual element.** Compose, crop and subtract from real assets. No inventory means a
  type-only build; an empty frame with a reason beats a fabricated one.
- **Never guess a token, a claim figure or a mandated line.** Ask.
- **Deliver, then object.** An imperfect asset produces a build with the objection attached.
- **Two fix rounds maximum**, then a human decides.
- Anything trafficked needs the quality-officer and a gate marker in `.gates/`. The Stop hook enforces
  it, and the waiver is a human's to give — not yours.
