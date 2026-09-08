# GF Creative Team

**Seven agents that design your ad creative in Figma — and review it before you see it.**

A copywriter, a creative director, an art director, a production designer, a design analyst, a quality
officer and a financial controller. You give them a brief; they give you built, checked artwork.

> The team is the product; clients are configuration. Role definitions carry no client facts.

---

## What it does for you

```
/create-ad  Spring campaign for the Drift commuter e-bike, UK + DE, Meta Feed and Stories
```

The copywriter writes to the real character limits. The creative director picks the one idea and the
hero that proves it. The art director chooses the shot from your whole asset folder — or tells you the
right shot doesn't exist and asks for it. The designer builds it in Figma: artboard, safe-zone guides,
hero placed by measured ratio, type from your token scale, legal line to spec. Then the art director
verifies the render before you ever see it.

Then `/creative-gate` runs the review roles over it — and it knows the platforms, so it catches the CTA
sitting under the Instagram Stories UI, the 4:5 variant you didn't build, and the export that passes
Meta's 30 MB but fails Google's 5 MB.

## Why this exists

Most agent packs are personas — a prompt that says "you are a senior designer" and hopes. This one is
built the other way round: **every rule in it exists because breaking it cost something real first.**

The eval table records its own history. `MISSED — client deleted the work` is a row in it. So is
`MISSED — client caught after ~500k tokens`. Twelve of the thirty-three are marked MISSED — meaning a
human found it and the gates did not. Those rows are why the rules above them are worded as they are.

Three things here are unusual enough to be the reason to look:

- **Evals with outcomes recorded.** 33 cases, each naming the agent that must catch it *unhinted*, each
  marked MISSED, CAUGHT, or explicitly *codified* where it came from a rule rather than a logged failure.
  You can tell evidence from policy at a glance.
- **A knowledge layer that knows when it's stale.** Every platform spec is traced to the platform's own
  documentation and stamped with a `review_by` date. Past that date, agents must report figures as
  expired rather than assert them. Unverifiable figures are written `TBD — unverified`, never guessed.
- **A cost metric, not a token count.** The Financial Controller computes *cost per confirmed
  BLOCKER/MAJOR* rather than raw spend. Measured on the [first live run](examples/first-live-run.md):
  **~127k tokens per role dispatch**, three roles, eight confirmed blocking findings — roughly 48k per
  finding. Budget for it: a full chain is a meaningful spend, and the Financial Controller exists
  precisely because that needs watching.

![Meta Stories and Reels safe zone: the same creative before and after, with Meta's published reserve drawn to scale](examples/images/meta-safezone-before-after.png)

*Constructed illustration on the fictional example profile — not real client work, and not the output of
a live gate run. The geometry is real: those bands are Meta's published Stories/Reels reserve, drawn to
scale, sourced and dated in [`knowledge/platforms/meta.md`](knowledge/platforms/meta.md).*

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

Then: **[Quickstart](docs/QUICKSTART.md)** · **[The team](docs/THE-TEAM.md)** · **[The method](docs/METHOD.md)**

## Commands

| | |
|---|---|
| **`/create-ad`** | **Brief to built artwork.** Copy → concept → asset selection → build in Figma → verify. The main one. |
| `/format-matrix` | Which assets to build for these platforms — sizes, ratios, safe zones, text limits. |
| `/creative-gate` | Review built creative. Plan → gate → fix → re-gate → verdict. |
| `/new-client` | Scaffold a client profile in your project and seed its evals. |
| `/use-client` | Switch the active profile, or show which one is live. |

---

## How it works

**Nothing runs on its own.** The commands are the entry points; they dispatch the agents.

| Day-one, no setup | `/format-matrix Meta and Google, UK + DE` → the exact asset list. No profile, no design tool, no config. |
|---|---|
| **Then, optionally** | `/new-client Acme` → scaffolds a profile in **your project** at `.creative-team/`, and interviews you for what it needs. |
| **After a build round** | `/creative-gate the four square masters` → CD plans, reviewers run in parallel, designer applies confirmed fixes, failed roles re-gate, you get a verdict. |
| **Switching accounts** | `/use-client acme` — agents re-read the active profile every run, never from memory. |

### Without a client profile

The gate still runs, in **reduced scope**: platform specs plus the universal failure classes. It opens
its report by naming what it skipped — brand system, tokens, source law, compliance — and the
quality-officer returns `UNVERIFIED`, never `SHIP`. A reduced-scope gate is useful. A reduced-scope gate
presented as a full one is not, which is eval U32.

### Where your data lives

```
your-project/
├── .creative-team/
│   ├── active              # which profile is live
│   └── clients/<name>/     # client.md · compliance.md · evals.md
└── .gates/                 # gate markers + ledger.csv, written by the hooks
```

**In your project, never in the plugin directory** — so `/plugin update` cannot destroy your profiles.

## What people use it for

| Moment | What you run | Who |
|---|---|---|
| Before the brief — what do we even build? | `/format-matrix` | Anyone running paid social |
| Before design — copy that fits the real limits | `content-creator` | Performance marketer, copywriter |
| After a build round — did we ship a defect? | `/creative-gate` | Creative lead, agency PM |
| Before ship — region and compliance sweep | `quality-officer` | Regulated advertisers, multi-market teams |
| Every ~10 dispatches — what is this costing? | `financial-controller` | Anyone paying for tokens |

The sharpest one: **six built creatives, a client call in an hour.** One command, and you know which
three have blockers and exactly why.

---

## The roles

Seven agents, each owning a failure class. **[→ Full job descriptions: what each does, what you give it,
what you get back](docs/THE-TEAM.md)**

| Agent | The job | You get back |
|---|---|---|
| **creative-director** | Judges concept and meaning; decides who reviews what | Verdict + max 5 notes + the set's biggest weakness; a dispatch plan |
| **art-director** | Picks the asset, then verifies the render at full size and at squint | A selection with reasoning — or a refusal and a client ask; findings with pixel fixes |
| **designer** | Builds. The only agent that writes to the design tool | Changed node IDs, measured deviations, its own verification |
| **design-analyst** | Measures: tokens, spacing, alignment, lineage, platform spec conformance | A violation table — measured vs expected, with node IDs. Numbers only |
| **quality-officer** | The last gate: regulation, mandated text, claims, regional rules | SHIP or BLOCK, numbered findings, region-matrix status |
| **content-creator** | Copy decks before design; copy audits after | Deck per concept + a CLIENT-VERIFY list of what it could not confirm |
| **financial-controller** | Audits the ledger | Cost per confirmed finding, top waste sources, optimizations with expected savings |

**They can be hired separately.** A copy deck is one agent. A second pair of eyes on a finished set is
two. The full chain is for producing and shipping a set.

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
| `create-ad.js` | Copy → concept → select → build → verify, with one fix round. Halts and returns a client ask if no available asset proves the headline. |
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

## Validation

```bash
./scripts/validate.sh
```

Checks syntax, manifests, frontmatter, agent registry, knowledge-file sourcing, README counts against the
eval table, link resolution, and that nothing leaked an absolute path. CI runs the same script.

It also **fails when a knowledge file's `review_by` date passes** — on a weekly schedule, with no code
change. That is deliberate: it is eval U27 enforced by the harness, so the specs cannot rot quietly.

## Contributing

The most valuable contribution is **a failure this team did not catch.** See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT — see [LICENSE](LICENSE).
