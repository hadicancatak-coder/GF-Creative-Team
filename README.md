# GF Creative Team

**An agent team that designs your ad creative in Figma — and reviews it before you see it.**

Seven roles: copywriter, creative director, art director, production designer, design analyst, quality
officer, financial controller. You give them a brief; they give you built, checked artwork.

<sub>GF is **Growth Fabric**. The team is the product; clients are configuration — role definitions carry
no client facts, so it works for any brand you point it at.</sub>

```bash
claude plugin marketplace add hadicancatak-coder/GF-Creative-Team
claude plugin install gf-creative-team@gf-creative-team
```

```
/create-ad  Spring campaign for the Drift commuter e-bike, UK + DE, Meta Feed and Stories
```

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

## Two speeds

```
/create-ad  ...                    ~5 min · 2 agents · a first look
/create-ad ... depth:"full"        ~20 min · 5 agents · work that ships
/creative-gate ...                 the review — and this half runs in parallel
```

The production chain cannot be parallelised: concept feeds copy, copy feeds selection, selection feeds
the build. So the only lever on wall-clock is fewer dispatches, which is a real quality trade — fast
gives up independent asset selection and the second opinion. **Produce fast, review in parallel.**

## Why it behaves that way

**Every rule in it exists because breaking it cost something first.** The eval table records its own
history — 49 cases, each naming the agent that must catch it unhinted, each marked with the outcome.

**Twelve are marked MISSED.** A human found those, the gates did not. `MISSED — client deleted the
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
| **`/create-ad`** | Brief to built artwork. Copy → concept → asset selection → build in Figma → verify. |
| `/creative-gate` | Review built creative. Plan → gate → fix → re-gate → verdict. |
| `/format-matrix` | What to build for these platforms. **Works with no setup at all.** |
| `/new-client` · `/use-client` | Scaffold and switch client profiles. |

## The roles

| Agent | The job | What you get back |
|---|---|---|
| **creative-director** | Concept, meaning, who reviews what | Verdict, ≤5 notes, the set's biggest weakness |
| **art-director** | Picks the asset, verifies the render | A selection — **or a refusal and a client ask** |
| **designer** | Builds. The only one that writes to Figma | Changed node IDs, measured deviations |
| **design-analyst** | Measures against tokens and platform specs | Property, measured, expected, node ID, fix |
| **quality-officer** | Last gate: regulation, claims, regional rules | SHIP / COMP-APPROVED / BLOCK |
| **content-creator** | Copy before design, audits after | Deck + a CLIENT-VERIFY list |
| **financial-controller** | Reads the run ledger | Cost per confirmed finding, waste sources |

**Hire them separately.** A copy deck is one agent. A second pair of eyes on a finished set is two.

## Requirements

Claude Code with the Agent and Workflow tools. **The Figma MCP** for anything that builds artwork —
every review role works on rendered screenshots from any source, the `designer` role does not.

## What is proven, and what is not

**Proven, by running it.** Five orchestration runs, zero agent errors, no prompting from me:
the workflow dispatches its own roles, finds the active client profile on its own, carries context
between agents through schemas, and **the designer builds real nodes in Figma** with geometry verified
by pixel measurement rather than assertion — margins and rhythm hit to the exact token, seams sampled
across five points to confirm no discontinuity.

Role boundaries are enforced by tooling, not asked for: only the designer holds a write tool, and CI
fails if that changes.

**Not proven.** No creative has passed a gate. The quality-officer and financial-controller have never
been dispatched; no gate marker and no ledger row has ever been written. And it has never been run on a
real brand — every run so far used a fictional profile and a single house illustration.

The runs are written up in [examples/first-live-run.md](examples/first-live-run.md), including what they
cost, what they refused to do, and the bugs they found in this plugin — a copywriter that built the
artwork itself, a command that would have spent 600k tokens on the word `undefined`, and a gate that
fired on work that did not exist.

## Nine lessons from building it

Each bought by a failure during development, each recorded as an eval case, and each more likely to
transfer than anything in the briefs — [the full list is in METHOD.md](docs/METHOD.md):

- **Role separation must be enforced by tooling, not asked for in prose.** All seven agents had
  unrestricted tools; the copywriter rendered the artwork itself.
- **Every escape hatch pointing at "stop" produces a team that never ships.** Three clean runs, three
  refusals, no work.
- **A gate that can only say "not yet" is a gate people start waiving.**
- **"Verified" means nothing unless verified where it matters** — a font present on the machine and
  absent from the renderer.
- **Speed is a correctness property.** A pipeline nobody runs is worth nothing.

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
