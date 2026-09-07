# GF Creative Team

**A creative production team for Claude Code that cannot show you its work until it has reviewed it.**

Seven roles, a gate that enforces itself, verified platform specs, and 30 eval cases that record whether
a gate caught the failure or a human did.

> The team is the product; clients are configuration. Role definitions carry no client facts.

---

## What it does for you

You point it at built creative. It comes back with severity-ranked findings — location, cause, exact fix —
and one of `SHIP` / `FIX-THEN-REGATE` / `BLOCK`. It applies the confirmed fixes, re-gates only the roles
that failed, and refuses to say SHIP if any reviewer stalled.

It knows the platforms. Before design starts, `/format-matrix` tells you exactly which assets to build.
During review, it measures against sourced specs — so it catches the CTA sitting under the Instagram
Stories UI, the 4:5 variant you didn't build, the export that passes Meta's 30 MB but fails Google's 5 MB.

## Why this exists

Most agent packs are personas — a prompt that says "you are a senior designer" and hopes. This one is
built the other way round: **every rule in it exists because breaking it cost something real first.**

The eval table records its own history. `MISSED — client deleted the work` is a row in it. So is
`MISSED — client caught after ~500k tokens`. Twelve of the thirty are marked MISSED — meaning a
human found it and the gates did not. Those rows are why the rules above them are worded as they are.

Three things here are unusual enough to be the reason to look:

- **Evals with outcomes recorded.** 30 cases, each naming the agent that must catch it *unhinted*, each
  marked MISSED, CAUGHT, or explicitly *codified* where it came from a rule rather than a logged failure.
  You can tell evidence from policy at a glance.
- **A knowledge layer that knows when it's stale.** Every platform spec is traced to the platform's own
  documentation and stamped with a `review_by` date. Past that date, agents must report figures as
  expired rather than assert them. Unverifiable figures are written `TBD — unverified`, never guessed.
- **A cost metric, not a token count.** The Financial Controller computes *cost per confirmed
  BLOCKER/MAJOR*. One audit of one run gave ~33k tokens per confirmed finding through gates versus ~330k
  for an ungated set a human rejected. One data point, on one account — reported as an observation, not
  a benchmark.

**[→ A worked gate run, start to finish](examples/worked-gate-run.md)** — the fastest way to judge
whether this is worth installing.

---

## Requirements

- **Claude Code** with the Agent and Workflow tools.
- **A design tool the agents can read and write.** The `designer` role and the build hooks were built
  against the **Figma MCP** and assume it. Every *review* role — CD, AD, design-analyst, quality-officer,
  content-creator — works on rendered screenshots from any source, so the gate is usable without Figma.
  The build half is not.

## Install

```bash
/plugin marketplace add hadicancatak-coder/GF-Creative-Team
/plugin install gf-creative-team
```

Then: **[Quickstart](docs/QUICKSTART.md)** · **[The method](docs/METHOD.md)**

## Commands

| | |
|---|---|
| `/format-matrix` | Which assets to build for these platforms — sizes, ratios, safe zones, text limits. Run this before design. |
| `/creative-gate` | Review built creative. Plan → gate → fix → re-gate → verdict. |
| `/new-client` | Scaffold a client profile and seed its evals. |

---

## The roles

| Agent | Owns | Fails if |
|---|---|---|
| **creative-director** | Concept, hierarchy of intent, asset direction, the dispatch plan | The set means nothing, or the wrong reviewers were sent |
| **art-director** | Asset selection, then verification of the render — full size and at squint | A defect survives that a good eye would have caught |
| **designer** | The build. The only agent that writes to the design tool | Craft laws broken, or something was invented rather than escalated |
| **design-analyst** | Measurement: tokens, type, spacing, alignment, lineage, platform spec conformance | A deviation that was measurable went unmeasured |
| **quality-officer** | Final gate: regulation, mandated text, claims, regional rules, platform completeness | Something shipped that should not have |
| **content-creator** | Copy decks before design; copy audits after | A claim went out that the client's own facts contradict |
| **financial-controller** | The run ledger, cost per confirmed finding, waste sources | Spend happened that nobody can account for |

Each role exists because it owns a *failure class*. If you cannot name the class, it is not a role.

## The chain

```
content-creator → creative-director (concept + dispatch plan)
                        ↓
   art-director (select) → designer (build) → art-director (verify)
                        ↓
     design-analyst + quality-officer (gate; QO last, on final state)
                        ↓
                      human
```

The orchestrator dispatches and applies decisions. It does not judge, select, or place pixels — an
orchestrator that also reviews will approve its own work.

## The laws (ranked)

They are ranked because they collide, and the ranking is the point.

1. **Source-only** — every element traces to a mined source node or a client asset. Subtraction and cropping are legal; drawing is not.
2. **Client facts override mined copy** — for facts the client *owns*. External facts need a settling artefact.
3. **Ask the client first** — if they can supply the asset in minutes, asking beats hours of surgery.
4. **One CTA**; no element repeats another; mandated legal text exactly to spec.
5. **Reference geometry** — heroes placed by the source's measured ratios, never arithmetic.
6. **Device and object realism** — natural density, correct geometry, honest endings.
7. **Two strikes** on an asset, then replace or HOLD.
8. **Asset-blocked work goes to HOLD** — shipping a weak proof is worse than waiting.

## Knowledge layer

`knowledge/platforms/` — Meta, Google, TikTok, LinkedIn. Placements, ratios, pixel dimensions, safe
zones, character limits, file ceilings. Every figure traced to the platform's own documentation, dated,
with the gaps marked rather than filled.

Read [`knowledge/README.md`](knowledge/README.md) for the sourcing law and the refresh process. The
short version: a spec from a secondary source does not go in a gate, and an expired spec is reported as
expired, never asserted.

## Workflows

| | |
|---|---|
| `creative-gate.js` | Plan → **validate** → gate → fix → re-gate (max 2) → verdict. Refuses a plan that puts the quality-officer anywhere but last, or leaves a target unreviewed. Refuses to report SHIP on missing results. |
| `build-verify-loop.js` | AD selects → Designer builds → AD verifies → one fix round → PASS or ESCALATE. Declining to select is a first-class outcome: when the right asset doesn't exist, the chain halts and returns a client ask. |

Workflow scripts have no filesystem access, so the gate **returns** its ledger rows and gate marker and
the skill writes them. See [workflows/README.md](workflows/README.md).

## Enforcement

A `PostToolUse` hook logs every design-tool write. A `Stop` hook **blocks ending the session** if builds
ran today with no gate marker in `.gates/` — with an explicit human waiver hatch
(`.gates/<date>-skipped.md`). Build → gate → fix → show, enforced by the harness rather than by good intentions.

## The client layer

`clients/TEMPLATE/` — copy per engagement: `client.md` (brand system, tokens, source law, hazards) ·
`compliance.md` (regulator, mandated text, restrictions, client facts that override published material) ·
`evals.md`.

`clients/example-northwind-cycles/` is a **fictional** worked example showing the level of specificity
that produces useful gates. Agents load the active profile before any work.
**No client fact belongs in `agents/`.**

## Honesty note

Agents do not dispatch themselves. The chain runs when invoked; the workflows make invoking it one call.
The evals keep the briefs honest, the `review_by` dates keep the specs honest, the ledger keeps the costs
honest, and the human keeps the taste.

## Generalizing to another domain

Keep the skeleton: roles from failure modes, ground-truth files, ranked laws, failure-derived evals,
autonomous chains with a legal ESCALATE, a financial controller on the meter. Swap the domain facts.
The method transfers; the briefs are the domain.

## Contributing

The most valuable contribution is **a failure this team did not catch.** See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT — see [LICENSE](LICENSE).
