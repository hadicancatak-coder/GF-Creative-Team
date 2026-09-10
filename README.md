# GF Creative Team

**An agent team that designs your ad creative in Figma — and reviews it before you see it.**

Seven roles: copywriter, creative director, art director, production designer, design analyst, quality
officer, financial controller. You give them a brief; they give you built artwork that four of them have
already reviewed.

**One process, and the gate is inside it.** Concept → copy → asset → build → gate → verdict, in one
command. There is no fast mode; the reasons are below, and they are all failures this repo logged.

<sub>GF is **Growth Fabric**. The team is the product; clients are configuration — role definitions carry
no client facts, so it works for any brand you point it at.</sub>

```bash
claude plugin marketplace add hadicancatak-coder/GF-Creative-Team
claude plugin install gf-creative-team@gf-creative-team
```

```
/create-ad  Spring campaign for the Drift commuter e-bike, UK + DE, Meta Feed and Stories
```

Two facts from you — what the ad is for, and which platforms. Everything else is derived from the
verified platform specs and reported back: the master size, whether there are assets to work from,
where in Figma it lands.

---

## What the team actually says

Not a pitch — verbatim output from a live run. Nothing here was prompted for.

> **Art director**, refusing to select a hero:
> *"`drift-three-quarter.png` is not a different angle. Across the frame region the two files share
> **31,152 matching ink pixels against 29 mismatching** — 0.09% deviation. It is the same profile
> drawing with a handlebar added and the ground line removed."*

> **Art director**, on a layer named "keyed, source-only":
> *"An assertion is not a citation."* — BLOCK under source law.

> **Design analyst**, disproving the designer's own self-report on optical centring:
> *"The true value is 0.01 or 3.38 depending on whether the descender of 'y' counts as optical mass.
> **2px is neither.**"*

> **Creative director**, striking its own directive:
> *"The gap loses at squint because it is **open to the background**. An unenclosed absence is not a
> figure and cannot become one at any crop or any scale. I specified a subject that is structurally
> incapable of being a subject. That is my error, not the designer's and not the AD's."*

> **Design analyst**, blocking the master size against a sourced spec:
> *"1080×1080 conforms to neither named Meta placement — **25.0% off Feed's 4:5 against a 3%
> tolerance**, and no 9:16 asset exists."*

That is what separates seven roles from one prompt that says "you are a senior designer": they check
each other, and they are allowed to refuse.

## One process

```
concept → copy → select → build → [ AD ‖ DA ‖ CC ] → fix → quality-officer → verdict
                                   └── in parallel ──┘        └── final state, last ──┘
```

Eight dispatches on a clean run, six of them serial. **The production chain cannot be parallelised** —
concept feeds copy, copy feeds selection, selection feeds the build. **The review can**, so it does:
four reviewers cost roughly the wall-clock of one, which is what makes a real gate affordable enough to
be mandatory instead of optional.

This plugin shipped a second, faster path twice, and both times it was the wrong answer:

- **Every defect unique to the fast path came from merging two roles into one dispatch** — a merged call
  whose schema could not hold its own prompt and burned its retry cap (`U52`, 114k tokens to find),
  speed tuning that silently suppressed the craft self-checks so a frame shipped **64% empty and
  unmeasured** (`U53`), and a departure from the directive reported as compliance (`U54`).
- It was also, by construction, the path that produced **ungated** work.
- The cheap *gate* had the mirror flaw: it was cheap because one reviewer cannot disagree with itself —
  and that disagreement is the entire mechanism. The worst defect ever found here was three roles
  independently measuring the same frame and establishing that a fix reported as resolved had never
  landed in the file.

So the cost came out of what an agent *writes*, never out of who checks: per-role model and effort
tiering, naming the files instead of letting agents explore, the review fanned out, and every dispatch
that re-measured another role's work deleted. `./scripts/validate.sh` fails the build if a `depth`
switch ever comes back.

## Why it behaves that way

**Every rule in it exists because breaking it cost something first.** The eval table records its own
history — 61 cases, each naming the agent that must catch it unhinted, each marked with the outcome.

**Fourteen are marked MISSED.** A human found those, the gates did not. `MISSED — client deleted the
work` is a row in this repo. So is `MISSED — client caught after ~500k tokens`. Eleven more were found
by running the thing during its own development, including a command that would have spent 600k tokens
on the word `undefined`.

Most repos publish their wins. The misses are the reason the rules above them are worded the way they are.

## What it knows

Platform specs for **Meta, Google, TikTok and LinkedIn** — every figure traced to the platform's own
documentation, dated, with a `review_by` that **fails CI when it expires**. Unverifiable figures are
marked `TBD — unverified`, never guessed.

So it catches the CTA sitting under the Instagram Stories UI, the 4:5 variant you didn't build, the
export that passes Meta's 30 MB and fails Google's 5 MB, the PMax asset group with two headlines that
will not serve, and the TikTok carousel image over 100 KB.

![Meta Stories and Reels reserved zone drawn to scale on three schematic frames](examples/images/meta-safezone-before-after.png)

*A geometry diagram, not a design — blocks stand for creative elements so the measurement is the only
thing you judge. Sourced and dated in [`knowledge/platforms/meta.md`](knowledge/platforms/meta.md).*

## Commands

| | |
|---|---|
| **`/create-ad`** | **The one process.** Brief to built, gated artwork: concept → copy → asset → build → gate → verdict. Two arguments from you; the rest is derived from the platform specs and reported back. Nothing it hands you is ungated. |
| `/creative-gate` | The **same gate**, on creative the chain did not produce — built by hand, built before you installed this, or inherited. Four reviewers in parallel, quality-officer last on final state. |
| `/format-matrix` | What to build for these platforms. **Works with no setup at all.** |
| `/new-client` · `/use-client` | Scaffold and switch client profiles. |

The order matters: **concept comes before copy.** Written the other way round, the copywriter invents an
implicit idea and the headline comes out as a specification rather than a hook — that was a real defect,
and it is eval U45.

## The roles

| Agent | The job | What you get back |
|---|---|---|
| **creative-director** | Concept, the directive, and the tiebreak when two roles disagree | The one subject, the build directive, a ruling |
| **art-director** | Picks the asset, verifies the render | A selection — **or a refusal and a client ask** |
| **designer** | Builds. The only one that writes to Figma | Changed node IDs, measured deviations |
| **design-analyst** | Measures against tokens and platform specs | Property, measured, expected, node ID, fix |
| **quality-officer** | Last gate: regulation, claims, regional rules | SHIP / COMP-APPROVED / BLOCK |
| **content-creator** | Copy before design, audits after | Deck + a CLIENT-VERIFY list |
| **financial-controller** | Reads the run ledger | Cost per confirmed finding, waste sources |

**Hire them separately.** A copy deck is one agent. A second pair of eyes on a finished set is
`/creative-gate`.

Each gate role owns a failure class, and the roster is fixed — every reviewer sees every target. An
earlier version asked the creative director which roles to dispatch; that cost a dispatch, added a way
for the plan itself to be invalid, and could only ever *narrow* coverage.

## Requirements

Claude Code with the Agent and Workflow tools. **The Figma MCP** for anything that builds artwork —
every review role works on rendered screenshots from any source, the `designer` role does not.

## What is proven, and what is not

**Proven, by running it.** Six orchestration runs, zero agent errors, no prompting from me:
the workflow dispatches its own roles, finds the active client profile on its own, carries context
between agents through schemas, and **the designer builds real nodes in Figma** with geometry verified
by pixel measurement rather than assertion — margins and rhythm hit to the exact token, seams sampled
across five points to confirm no discontinuity.

**Proven, without running it.** The orchestration itself is now tested. `scripts/dry-run.mjs` stubs the
engine and asserts on the routing — the clean run is exactly eight dispatches in order with no role
doing two jobs, nothing is dispatched after the quality-officer, a stalled reviewer yields `PARTIAL`
rather than a clean-looking pass, an unfixable finding exhausts exactly two rounds, a contested finding
never reaches the designer, and every schema's required fields exist. It runs in CI on every push and
costs nothing. Every orchestration bug in this repo's history was this shape, and every one of them was
previously found by a live run that burned real tokens.

Role boundaries are enforced by tooling, not asked for: only the designer holds a write tool, and CI
fails if that changes. So is the single process: CI fails if a `depth` switch reappears, and it sha256s
the shared gate block in both workflows to fail if the two copies ever drift apart.

**Not proven.** No creative has passed a gate. The quality-officer and financial-controller have never
been dispatched; no gate marker and no ledger row has ever been written. And it has never been run on a
real brand — every run so far used a fictional profile and a single house illustration.

**And the one process has not been run end to end.** Its per-dispatch costs are measured; its
wall-clock is not, and **no figure for it appears anywhere in these docs.** This repo has published an
unmeasured timing before and had to retract it from four places. The next honest number comes from a
live run, not from arithmetic.

The runs are written up in [examples/first-live-run.md](examples/first-live-run.md), including what they
cost, what they refused to do, and the bugs they found in this plugin — a copywriter that built the
artwork itself, a command that would have spent 600k tokens on the word `undefined`, and a gate that
fired on work that did not exist.

## Ten lessons from building it

Each bought by a failure during development, each recorded as an eval case, and each more likely to
transfer than anything in the briefs — [the full list is in METHOD.md](docs/METHOD.md):

- **Role separation must be enforced by tooling, not asked for in prose.** All seven agents had
  unrestricted tools; the copywriter rendered the artwork itself.
- **Every escape hatch pointing at "stop" produces a team that never ships.** Three clean runs, three
  refusals, no work.
- **A gate that can only say "not yet" is a gate people start waiving.**
- **"Verified" means nothing unless verified where it matters** — a font present on the machine and
  absent from the renderer.
- **Speed is a correctness property — and a second, weaker pipeline is the wrong way to buy it.** This
  is the one we got wrong twice. The fast path worked, and it became the only source of a whole defect
  class. Make the correct process affordable instead: cut what an agent writes, never who checks.
- **A test that needs a model is a test you will not run.** Half of an agent system is deterministic
  routing. Stub the engine and put that half in CI; keep the evals for the half that isn't.

The thread through all of them: *the system does what it is built to do, not what the documentation
says it should.*

## Read next

**[The team](docs/THE-TEAM.md)** — a job description per role · **[Quickstart](docs/QUICKSTART.md)** ·
**[The method](docs/METHOD.md)** — what transfers to any domain ·
**[A worked gate run](examples/worked-gate-run.md)**

## Contributing

The most valuable contribution is **a failure this team did not catch.** See
[CONTRIBUTING.md](CONTRIBUTING.md). `./scripts/validate.sh` is the whole gate; CI runs the same script.

MIT — see [LICENSE](LICENSE).
