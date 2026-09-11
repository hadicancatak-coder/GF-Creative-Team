---
description: Review built ad creative — arithmetic by script, judgement by the Art Director, compliance only when it ships. For work built anywhere, by anyone.
---

Review: $ARGUMENTS

**Arithmetic is free. Judgement costs a dispatch. Compliance costs one more, and only when it ships.**

```
renders + tokens → check-build.mjs ──gaps, type, colour, proportion. Milliseconds.
                                   ↓
                    ART DIRECTOR ──the picture: thumbnail, hierarchy, craft
                                   ↓
                 quality-officer ──ONLY if regulated or about to be trafficked
```

One dispatch for most reviews. Two when it ships.

## 1. Get the renders onto disk — first, always

The reviewers often cannot reach the design tool: a subagent's `tools:` list excludes MCP tools unless
each is named, and a background subagent is denied them regardless. **A PNG on disk is the channel that
always works.**

Export each target at **≥1300px** and again at **~110px**. If you cannot export them yourself, ask the
designer — it is unrestricted and it can. **Never accept a review from a role that could not see the
target** (U62). A review written without looking is worse than no review: it is a clean-looking pass over
work nobody examined.

## 2. Run the arithmetic before you spend a dispatch on it

```bash
node scripts/check-build.mjs build.json tokens.json
```

`build.json` is the node geometry — id, name, x, y, w, h, and optionally `fill`, `fontSize`, and a
`role` of `message` / `decoration` / `legal` / `cta` / `brand`. `tokens.json` is the profile's scales
and colours. The designer can dump both straight out of Figma.

It checks: every vertical gap against the spacing scale · type sizes against the type scale · whether the
top display step was left unspent · colours against the token set · accent-use count · reserved colours ·
sub-pixel geometry · message-vs-decoration share · total empty vertical span · and whether the accent is
a **generated-design tell** rather than a brand colour.

It exits non-zero on any BLOCKER or MAJOR. **Do not dispatch an agent to do this.**

## 3. Art Director — the half a script cannot do

Dispatch `art-director` with the render paths and the script output. It answers its non-optional checks
**with numbers**:

- At 110px, the ONE thing that survives — and whether that is the **message** or the **decoration**.
- Proportion: the dominant element and its share of frame; total empty span as a % of height.
- The largest single empty region as a % of canvas.
- Does anything read as tappable at thumbnail?
- Is every placed asset's lineage **cited**, not asserted?

Then it judges the picture **on its own merit** — not against the spec that produced it, because a spec
can be wrong and the AD is the only role positioned to say so.

## 4. Quality Officer — only when it ships

Engage `quality-officer` when the category is **regulated**, mandated text applies, a claim needs
substantiation, or the work is about to be **trafficked**. It runs **last, on final state**, and it
**re-runs after any change** — the state it signed off on stops existing the moment a fix lands (U55).

An unregulated internal comp does not need it. Say so rather than dispatching it out of habit.

## Findings

Severity `BLOCKER` / `MAJOR` / `MINOR` / `ENVIRONMENT` (outside the work; re-running cannot change it).

Every finding carries an **owner** — `designer` / `content-creator` / `client` / `none` — and a **scope**
— `this-artifact` / `flagged-forward`. **Severity is not a work order.** Only what the designer can fix
on this artifact goes back to the designer; another role's deliverable, a client ask, and work the brief
sequences for later all go to the human with the verdict (U60).

Findings marked `contested` — touching content the client explicitly asked to keep — are never
auto-applied. They are decisions, not defects.

## Fix and re-review

Two rounds maximum, then a human decides. The designer **duplicates the artboard and builds `_v<n>`
alongside**, so the previous version survives as the comparison and an interrupted run cannot leave the
original half-modified.

Re-run `check-build.mjs` on every round — it is free. Re-dispatch the Art Director only when the fix
touched something a number cannot see.

## Before anything ships

Write the gate marker to `.gates/<date>-<name>.md` with the decision and the open items, and append the
ledger rows. **A gate whose result was never recorded did not happen** — the Stop hook is right to keep
blocking until it is written, and the waiver is a human's to give, not yours.

## Verdicts

| | |
|---|---|
| `SHIP` | clean |
| `COMP-APPROVED` | no defects left; only environment items outstanding. Show it; do not traffic it until they clear |
| `UNVERIFIED` | reviewed in reduced scope — no compliance layer was loaded. Say so in your first line; never treat it as a pass |
| `FIX` | majors remain and rounds are left |
| `BLOCK` | a defect blocker stands |
| `ESCALATED` | rounds exhausted, or the designer could not resolve it |
