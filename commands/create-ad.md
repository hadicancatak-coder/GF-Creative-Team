---
description: Make an ad creative end to end — brief to built, gated artwork in Figma. One process, and the main entry point.
---

Create ad creative for: $ARGUMENTS

**One process. There is no fast mode, and that is deliberate** — the cheap path this plugin used to
offer was the only one that shipped ungated work, and every defect unique to it (evals U52, U53, U54)
came from merging two roles into one dispatch. Concept → copy → asset → build → **gate** → verdict, in
one run. What used to be a second command you had to remember now happens before you see the work.

## Two things from the user, everything else derived

```
/create-ad Spring promo for the Drift commuter e-bike, UK + DE, Meta Feed + Stories
```

That is enough. The chain needs exactly two facts from the person asking:

| | |
|---|---|
| **brief** | the audience, the offer, and the claim the creative must prove |
| **platforms** | e.g. "Meta Feed + Stories". **Never guessed** — the platform spec decides the size, the safe zones and the character limits |

If either is missing, ask for that one thing in one short message. Do not ask for a list of five
arguments; three of them have real defaults and the workflow reports back which it took:

| Optional | Left out ⇒ |
|---|---|
| `masterSize` | derived from the primary placement in `knowledge/platforms/`, at the platform's **recommended** resolution — and the basis is reported, not assumed |
| `inventoryPath` | **type-only build.** No hero is selected and none is invented; source law forbids drawing one. Pass an asset folder to get a photographic or illustrated hero instead |
| `destination` | the designer creates a new Figma file and returns its key |

**You supply `date` yourself** — run `date -u +%F`. It is not the user's job, and the workflow cannot
read the clock: the gate marker and every ledger row are dated.

## How to run it

Prefer `workflows/create-ad.js` through the Workflow tool, so the dispatch, the gate and the verdict are
deterministic and every role lands in the ledger:

```
brief, platforms, date           (required)
masterSize, inventoryPath, destination, constraints   (optional)
```

## Before dispatching

1. Resolve the active client profile (`.creative-team/active`). **No profile? Say so in one line and run
   anyway** — brand tokens, source law and compliance go unchecked, the quality-officer returns
   `UNVERIFIED` rather than `SHIP`, and that is a caveat on the output, not a reason to stop.
2. Confirm the **Figma MCP is connected.** The build needs it. If it is not there, say so — do not
   describe an ad you cannot build.
3. Build the **master size only.** Derive the rest after a human approves it; never build ten sizes of
   an idea nobody has approved.

## What the run does

| | Role | |
|---|---|---|
| 1 | `creative-director` | the concept — the ONE subject that owns the frame at half a second, and the directive to build from. **Concept comes before copy**: written the other way round the copywriter invents an implicit idea and the headline comes out as a specification rather than a hook (U45) |
| 2 | `content-creator` | the copy deck, written to that concept, inside the per-placement character limits, with everything unsubstantiated sent to CLIENT-VERIFY rather than into the frame |
| 3 | `art-director` | the hero, audited across the **complete** inventory. Skipped entirely when there is no inventory — there is nothing to select from, and inventing a hero is forbidden |
| 4 | `designer` | the build. The only role that writes to Figma. Measures its largest empty region and declares every departure from the directive, however brief the run |
| 5 | **the gate** | `art-director` + `design-analyst` + `content-creator` **in parallel**, then `quality-officer` alone on final state. Up to 2 fix → re-gate rounds |

Eight dispatches on a clean run. The review fans out, so four reviewers cost roughly the wall-clock of
one — which is why the gate is affordable enough to be mandatory rather than optional.

## Afterwards — write what the workflow returned

The workflow returns `writeThese.marker` and `writeThese.ledger` and **cannot write them**: workflow
scripts have no filesystem access. You write them, in the working project:

- `marker.path` → the gate marker, from `marker.decision`, `marker.rounds` and `marker.openItems`
- each ledger row appended to `.gates/ledger.csv` as
  `date,agent,purpose,tokens,tool_uses,duration_ms,outcome`

Fill `tokens`, `tool_uses` and `duration_ms` from the task usage stats — the script cannot see them, and
a null-token row is an incomplete ledger (U15). Without the marker the Stop hook keeps blocking the
session even though the gate passed. That is the hook working correctly: a gate whose result was never
recorded did not happen.

## Rules that make this work

- **Never invent a visual element.** Compose, crop, slice and subtract from real assets. Drawing new
  content is not a fallback; when blocked, escalate.
- **Never guess a token, a claim figure or a mandated legal line.** Ask.
- **Deliver, then object.** An imperfect asset produces a build with the objection attached, not a
  refusal. Refusal is for work that would be harmful, illegal or actively misleading (U43).
- **Two fix rounds maximum**, then it goes to a human.
- **Present nothing ungated** — and with the gate inside this command, nothing you present is.
