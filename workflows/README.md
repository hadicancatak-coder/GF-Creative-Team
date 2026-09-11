# Workflows

> ⚠️ **`create-ad.js` is superseded by the 3.2.0 role restructure and has not been rewritten yet.**
> The current process is three dispatches — art-director closes the brief, designer builds, art-director
> verifies — with arithmetic in `scripts/check-build.mjs` and every other role conditional. See
> `commands/create-ad.md`. The gate in `creative-gate.js` is still valid for work that must be formally
> gated before trafficking; it is no longer the default path for making one ad.


Two deterministic orchestrations, run by the Workflow tool. The engine dispatches, validates and
consolidates. It never judges, selects, or places pixels.

## One process

`create-ad.js` is the whole pipeline: **concept → copy → select → build → gate → verdict**, in one run.
`creative-gate.js` is the same gate on its own, for creative the chain did not produce.

Neither takes a `depth` argument, and `scripts/validate.sh` fails the build if one reappears. Two
earlier versions offered a cheap mode beside each chain, and the evidence against that design is in
this repo's own eval table:

- Every defect unique to the cheap build path came from merging two roles into one dispatch — a merged
  dispatch whose schema could not hold its own prompt (**U52**, 114k tokens to discover), speed tuning
  that silently suppressed the craft self-checks (**U53**, a frame shipped 64% empty), and a departure
  from the directive reported as compliance (**U54**).
- The cheap path was also, by construction, the one that produced **ungated** work.
- The cheap gate was cheap because one reviewer cannot disagree with itself — which is the entire
  mechanism. The worst defect found in this project was three roles independently measuring the same
  frame and establishing that a fix reported as resolved had never landed in the file.

The answer to cost is not a weaker second pipeline. It is making the correct one affordable.

## Hard constraint: no filesystem, no clock

Workflow scripts have **no filesystem access**, **cannot call `new Date()`**, and **cannot `import`**.

So neither workflow writes the gate marker or the ledger: both **return** `writeThese.marker` and
`writeThese.ledger`, and the caller writes them. The date comes in as `args.date`, supplied by the
calling command rather than by the user.

Do not add `fs` calls here. They will not run.

## The shared gate block

Because scripts cannot `import`, the gate is defined once and **pasted byte-identically** into both
files, between `SHARED GATE BLOCK v1` markers. `scripts/validate.sh` sha256s both regions and fails if
they differ by one character — so "there is one gate" is enforced by tooling rather than asked for in
prose. Edit one copy, run validate, copy it across.

It holds the role tiering, the read-scope and brevity rules, the fixed roster, the findings and fix
schemas, and `runGate()`.

## `create-ad.js`

```
brief          string  REQUIRED  audience, the offer, the claim to prove
platforms      string  REQUIRED  e.g. "Meta Feed 4:5 + Stories 9:16" — never guessed
date           string  REQUIRED  ISO date, supplied by the CALLER, not the user
masterSize     string  optional  derived from the placement spec when absent
inventoryPath  string  optional  absent ⇒ declared type-only build
destination    string  optional  absent ⇒ the designer creates the Figma file
constraints    string  optional
```

Only two of those come from the person asking. Each default taken is reported back in `defaults`, never
applied silently — a silent default is how a team ends up building a square for a 4:5 placement (U38).

**Declining is a first-class outcome.** `PICK` requires `outcome` and does **not** require `chosenPath`.
An earlier version required the path, which forced the art-director to nominate a least-bad asset —
structurally guaranteeing the failure law 3 and eval U10 exist to prevent. If you adapt these prompts,
**keep every escape hatch optional in the schema.** A required field is a forced answer.

Equally, declining is not the *default*: `SELECTED-WITH-RESERVATIONS` exists so an imperfect asset
produces a build with the objection attached. `ASK-CLIENT` and `NO-VIABLE-ASSET` are for work that would
be harmful, illegal or actively misleading (U43).

## `creative-gate.js`

```
targets   [{ id, name, note }]  REQUIRED  what to gate
date      string                REQUIRED  ISO date, supplied by the CALLER
location  string                optional
context   string                optional
```

**Gate → fix → re-gate → verdict.** Four reviewers, each owning a failure class traced to an eval:

| Role | Owns | Tier |
|---|---|---|
| `art-director` | render forensics AND **proportion** — thumbnail survival, the measured empty region (U47), CTA affordance (U46), cited lineage (U39), and the dominant element's share of frame, message vs decoration, total empty span, the display size argued against the scale (U58). Judges the composition **on its own merit, not against the directive** | high effort |
| `design-analyst` | every number: ratio against the placement (U38), safe zones in px, tokens, fonts resolved in the renderer (U40, U48), collisions | **sonnet**, low |
| `content-creator` | every word in the frame: mandated text verbatim and adjacent to its claim, character limits, unsubstantiated claims | medium effort |
| `quality-officer` | **final state, last**: regulation, export weight per platform, system membership, the terminal verdict | high effort |

- The roster is **fixed, and every role sees every target.** An earlier version asked the
  creative-director for a dispatch plan first: that cost a dispatch, added an `INVALID PLAN` failure
  mode, and could only ever *narrow* coverage. Full coverage is simultaneously cheaper and stricter.
- Group 1 runs **in parallel**; the `quality-officer` is alone in group 2 because it certifies final
  state. The barrier is real.
- Up to **2 fix → re-gate rounds.** The designer applies confirmed BLOCKER and MAJOR findings. The roles
  whose findings were addressed re-gate **scoped to their own prior findings** — a re-gate that opens new
  dimensions is a new gate. The `quality-officer` re-gates whenever **anything** changed, even having
  raised nothing itself: the state it certified no longer exists (U55).
- Findings marked `contested` are never auto-applied — they go to the human as decisions.
- `ENVIRONMENT` findings never consume a fix round. Re-running cannot change them.
- Returns `SHIP` · `COMP-APPROVED` · `UNVERIFIED` · `FIX-THEN-REGATE` · `BLOCK` · `ESCALATED` ·
  `PARTIAL` · `INCOMPLETE`.

**It refuses to report SHIP on missing results.** A stalled reviewer produces `PARTIAL` or `INCOMPLETE`,
never a clean-looking pass (U14).

## Testing them: `scripts/dry-run.mjs`

Every orchestration bug in this repo's history was found by a live run that burned real tokens — a
preflight that interpolated `undefined` into five prompts, a schema that could not hold its own prompt
(U52, 114k tokens), a gate that could pass on stalled agents (U14). All of them are control-flow and
schema bugs. **None of them needed a model to find.**

So the harness substitutes the engine: `agent`, `parallel`, `phase` and `log` become stubs that record
every dispatch and return whatever a scenario says a role returned. Then it asserts on the routing.

```bash
node scripts/dry-run.mjs          # every scenario
node scripts/dry-run.mjs --quiet  # failures only
```

**51 assertions across 21 scenarios.** Among them: the clean run is exactly 8 dispatches in order with
no role doing two jobs; concept precedes copy; nothing is dispatched after the quality-officer; a bare
one-line brief is refused *before* any dispatch; `brief` + `platforms` alone produces a gated build; no
inventory means Select is never dispatched and the designer is forbidden to invent a hero; `ASK-CLIENT`
halts before the build; a stalled reviewer yields `PARTIAL`; an unfixable MAJOR exhausts exactly 2
rounds; a contested finding never reaches the designer; `ENVIRONMENT`-only yields `COMP-APPROVED` with a
clear-before-export checklist; a build that changed no nodes never reaches the gate; a stalled re-gate
yields `PARTIAL` rather than letting the pre-fix verdict stand; **the gate is handed the artboard and not
every changed node**; **no deviation or ruling text reaches a reviewer**; **the creative-director is
forbidden absolute coordinates**; **a MAJOR owned by another role never becomes a designer dispatch**;
**a flagged-forward MAJOR never consumes a fix round**; **an ambiguous artboard escalates rather than
being guessed**; and every schema's `required` keys exist as properties (the static form of U52).

Two real defects in the 3.0.0 gate were found by writing these scenarios, before either had run against
a model: a re-gate that returned nothing left the pre-fix verdict in place, and a build reporting `DONE`
with no changed nodes handed the gate an empty target set and came back `SHIP`.

It runs in CI on every push. **What it cannot check is whether an agent is any good** — that is what
`evals/` is for. This checks that the machine around the agents is wired correctly, which is the half
that is deterministic.

## Cost

Measured on live runs, before tiering: **120–200k tokens per role dispatch**. Every agent ran at the
same tier, which was the waste. Each dispatch now carries a tier chosen for the task — judgement and
visual forensics at the top tier, reading node properties and comparing them to tokens at sonnet/low.

The other levers, all of which cut what an agent *writes* and never what it *checks*:

- **Scoped reading.** Name the files, forbid exploring. Agents were re-reading the tree every run.
- **Review fanned out.** Four reviewers in two waves cost roughly the wall-clock of one.
- **No duplicate measurement.** There used to be a serial art-director verify pass before the gate,
  measuring the frame the gate's art-director measures anyway. The gate *is* the verify.
- **No planning dispatch.** See the roster note above.
- **Brevity with named exceptions.** The checks marked NON-OPTIONAL survive every optimisation, because
  once they did not and the build shipped 64% empty (U53).

**On wall-clock: the production chain is sequential by design and cannot be parallelised.** The copy
needs the concept, the selection needs the copy, the build needs the selection. Only the gate fans out.

A clean run is **8 dispatches, 6 of them serial.** Measured on the first live end-to-end run:

| | Dispatches | Tokens | Wall-clock |
|---|---:|---:|---:|
| Production (serial) | 4 | 286,699 | 23.3 min |
| Gate (3 parallel, then the QO) | 4 | 342,568 | 11.0 min |
| **Total** | **8** | **629,267** | **34.3 min** |

The gate would have been 19.5 minutes run serially, so **fan-out saved 8.6 minutes**. The old
`full` + `full` route was 21 dispatches and ~2,705,000 tokens for the same coverage: **4.3x cheaper**.

Two caveats kept on the number: `effort` tiering was not applied in that run (the harness exposed model,
not effort), and the run stopped at `FIX-THEN-REGATE`, so the fix→re-gate rounds are not in the total.
Full write-up in [`examples/sorrel-bay-run.md`](../examples/sorrel-bay-run.md).

## Adapting them

Both take their domain facts from arguments and the active client profile. If you find yourself
hardcoding a file key, node id or absolute path into these files, that fact belongs in
`clients/<name>/` or in the call arguments instead.
