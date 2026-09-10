# Workflows

Two deterministic orchestrations, run by the Workflow tool. The engine dispatches, validates and
consolidates. It never judges, selects, or places pixels.

## Hard constraint: no filesystem, no clock

Workflow scripts have **no filesystem access** and **cannot call `new Date()` or `Date.now()`**.

So neither workflow writes the gate marker or the ledger. `creative-gate.js` **returns** `marker` and
`ledger`, and the calling skill writes them. The date comes in as `args.date`.

Do not add `fs` calls here. They will not run.

## `creative-gate.js`

```
targets   [{ id, name, note }]   what to gate
context   string                 campaign context for the CD
location  string (optional)      "Figma file <KEY>", "./renders/", a URL
date      string  REQUIRED       ISO date — the script cannot read the clock
```

**Plan → validate → gate → fix → re-gate → verdict.**

- The CD's plan is **validated before execution**: `quality-officer` must be in the final group (it
  gates final state), and every target must have a reviewer. A plan failing either is refused with
  `INVALID PLAN`, not silently run.
- Gates run in parallel within a group, groups in sequence. The barrier is real: group 2 needs group 1's
  fixes landed.
- Up to **2 fix→re-gate rounds**. The designer applies confirmed BLOCKER and MAJOR findings; only the
  **failed roles** re-gate, scoped to their **own prior findings**.
- Findings marked `contested` are never auto-applied — they go to the human as decisions.
- Returns `SHIP` · `FIX-THEN-REGATE` · `BLOCK` · `ESCALATED` · `PARTIAL` · `INCOMPLETE` · `INVALID PLAN`.

**It refuses to report SHIP on missing results.** Stalled agents produce `PARTIAL` or `INCOMPLETE`,
never a clean-looking pass (eval U14).

## `build-verify-loop.js`

```
task           string  the directive, in one paragraph
inventoryPath  string  folder or catalog the AD must audit IN FULL
selectionSpec  string  what makes a good pick
target         string  where the build lands, and its dimensions
constraints    string (optional)
```

AD selects → Designer builds → AD verifies → at most one fix round → PASS or ESCALATE.

**Declining to select is a first-class outcome.** `PICK` requires `outcome`
(`SELECTED` | `ASK-CLIENT` | `NO-VIABLE-ASSET`) and does **not** require `chosenPath`. When the right
asset does not exist, the AD returns a client ask and the chain halts before any build.

That asymmetry is deliberate. An earlier version required `chosenPath`, which forced the AD to nominate
a least-bad asset — structurally guaranteeing the failure that law 3 and eval U10 exist to prevent.
If you adapt these prompts, **keep every escape hatch optional in the schema.** A required field is a
forced answer.

## Two speeds

`create-ad.js` takes `depth`:

- **`fast`** (default) — **2 dispatches, ~5 minutes TARGET. Not yet measured** — the one timed run was killed at 11 minutes without completing. The creative director does concept and copy in
  one pass; the designer selects and builds in one pass. No independent asset selection, no pre-build
  verify. Ungated by design: run `/creative-gate` after, where the review roles fan out **in parallel**.
- **`full`** — 5 dispatches, **~60 minutes and ~1M tokens, measured**. The whole chain with independent selection and a verify
  pass before anyone sees the work.

Fast hits five minutes by cutting on four axes at once, because no single one gets there:
**sonnet at medium effort** (top-tier inference is the largest single cost), **surgical reading** (name
the files, forbid exploring — agents were re-reading the tree every run), **one verification render**
instead of the designer's usual zoom sweep, and **hard brevity** (3,000-word returns were pure latency).

The production chain cannot be parallelised — each role needs the last one's output — so the only real
lever on wall-clock is **fewer dispatches**, not faster ones. Merging roles is a genuine quality trade
and it is stated rather than hidden: fast mode gives up the second opinion on asset choice.

## Cost and speed

Measured on live runs, before tiering: **120–200k tokens per role dispatch**, and a full
brief-to-verified chain around **20 minutes**. Every agent ran at the same tier, which was the waste.

Each dispatch now carries a tier chosen for the task:

| Role | Tier | Why |
|---|---|---|
| creative-director | high effort | concept and tiebreak rulings — the hardest reasoning in the chain |
| art-director | high effort | pixel forensics and squint judgement; the quality backbone |
| quality-officer | high effort | a compliance miss is the most expensive error in a set |
| designer | medium effort | execution against a directive — craft matters, novelty does not |
| content-creator | medium effort | writing inside known constraints |
| design-analyst | **sonnet**, low effort | reading node properties and comparing them to tokens |
| financial-controller | **haiku**, low effort | arithmetic over a CSV |

**On wall-clock: the production chain is sequential by design and cannot be parallelised.** The creative
director needs the copy deck, the art director needs the concept, the designer needs the selection. Only
the *gate* fans out — `creative-gate.js` runs its group-1 roles concurrently, which is why gating four
creatives costs about the same wall-clock as gating one.

Twenty minutes for brief → built → verified is the realistic floor. Judge it against the half-day it
replaces, not against a single prompt.

## Adapting them

Both take their domain facts from arguments and the active client profile. If you find yourself
hardcoding a file key, node id or absolute path into these files, that fact belongs in
`clients/<name>/` or in the call arguments instead.
