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

## Two roles, three dispatches

```
brief → ART DIRECTOR ──asks you the blocking questions, writes the spec
                     ↓
              DESIGNER ──builds it in Figma, owns every number
                     ↓
      check-build.mjs ──gaps, tokens, type, proportion, colour. Milliseconds. Free.
                     ↓
         ART DIRECTOR ──verifies the picture on its own merit
```

**The Art Director is the front door and owns the brief.** It interrogates what you gave it, asks the
two or three questions whose answers would change what gets built, and nothing is built until it closes.
An unfinished brief is the most expensive thing in this business, because it gets discovered in pixels
instead of in a sentence.

It separates blocking from assumable honestly. No platform named blocks — the spec decides size, safe
zones and character limits. A missing master size does not: it derives that from the platform's
**recommended** resolution and tells you which placement it took it from.

**The Designer executes and does not reinterpret.** The spec carries intent, proportion and an argued
type step — deliberately **no pixel coordinates**, because a director who specifies numerically leaves
the person who can see the composition with nothing to decide.

**Everyone else is conditional**, engaged only when the job calls for them.

## The arithmetic is not an agent

`scripts/check-build.mjs` checks gaps against the spacing scale, type against the type scale, colours
against tokens, accent-use count, reserved colours, sub-pixel geometry, message-vs-decoration share,
total empty vertical span — and whether the accent is a **generated-design tell** rather than a brand
colour.

Milliseconds. Free. It cannot disagree with itself between runs.

Run against the two real artboards this plugin built, it reproduces every arithmetic finding a
**88,000-token** reviewer dispatch produced, and catches **four it missed** — two further off-scale gaps,
and both proportion failures, which no token-comparing reviewer could fire on because the size was
inside the scale.

What stays with a role is **judgement**: whether the picture is any good. Keeping that apart from
arithmetic is what makes either affordable.

## Why it behaves that way

**Every rule in it exists because breaking it cost something first.** The eval table records its own
history — 63 cases, each naming the agent that must catch it unhinted, each marked with the outcome.

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
| **`/create-ad`** | Art Director closes the brief → Designer builds → script checks → Art Director verifies. Three dispatches. |
| **`/review-ad`** | Creative that already exists, from anywhere. Script first, then the Art Director, then the Quality Officer **only if it ships**. |
| `/new-client` · `/use-client` | Scaffold and switch client profiles. Setup, not process. |

## The roles

| Agent | Engaged | The job |
|---|---|---|
| **art-director** | **always, first and last** | Owns the brief: interrogates it, asks you the blocking questions, decides the direction, writes the spec. Verifies the build. Owns **proportion** — the one thing no measurement role can fire on |
| **designer** | **always, once** | Builds the spec in Figma. Owns every number. The only role that writes |
| creative-director | conditional | A design system to build or extend · 2+ creatives for one brand that must cohere · a tiebreak between roles |
| quality-officer | conditional | Regulated category · mandated text · a claim needing substantiation · about to be trafficked |
| content-creator | conditional | Copy is the lead deliverable, or per-placement/per-language field copy |
| design-analyst | conditional | A contested measurement, or a token-system drift audit. Routine arithmetic is the script's |
| financial-controller | conditional | Auditing a run afterwards |

## Requirements

Claude Code with the Agent tool, and **the Figma MCP** for anything that builds artwork. The review
roles work from exported PNGs on disk, so they function even where the design tool is unreachable —
which, for a restricted subagent, it usually is.

## What is proven, and what is not

**Proven by running it.** The chain builds real nodes in Figma against a brand it has never seen,
derives the master size from the platform spec rather than from memory — **1440×1800**, citing the file,
where the answer most people give is 1080×1350 — refuses to invent an asset that does not exist, and
carries mandated legal text verbatim and adjacent to the claim it qualifies. Roles disagree in the open:
the designer escalated a copy collision rather than deciding it, and the creative director struck its own
directive on two counts.

**Proven without running it.** `scripts/check-build.mjs` — **14 cases**, covering each check plus a
regression guard against the two real artboards this plugin built. `scripts/validate.sh` fails the build
if a speed switch reappears, if a non-designer role holds a write tool, if a command names a role with no
agent file, if `create-ad` stops asking the client before building, or if the installed plugin copy
differs from the working tree.

**Not proven.** **No creative has passed a review — zero, not few.** The fix→re-review loop has never
completed a round. The Quality Officer and Financial Controller have never returned a verdict on real
work. And it has never been run for a real brand.

**What a live run taught, at a cost.** The previous eight-dispatch process cost **629,267 tokens and
34.3 minutes** for one frame. It produced the smaller half of the findings, and it passed a frame that
was **50.7% empty vertical space** with the message at 10.2% of height and the decoration at 25.3% — a
failure a human named in five seconds by looking. That is eval U58, logged `MISSED`, and it is why the
Art Director now owns proportion with numbers and why the arithmetic became a script.

**An open bug, stated rather than buried.** Probed as shipped, the review roles could not reach the
design tool at all: a `tools:` whitelist excludes MCP tools unless each is named, and a background
subagent is denied them regardless. The roles now name their read tools and the process passes renders on
disk, which is a channel that cannot be lost — but the underlying restriction is an environment
constraint the plugin cannot configure away. Eval **U62**.

## Eleven lessons from building it

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
- **Conformance is not quality, and a system made only of conformance checks produces defensible work
  rather than good work.** Every rule above checks that something *matches* — the tokens, the spec, the
  directive, the mandated wording. None of them asks whether the result is any good. Name the roles that
  own judgement, give them numbers to judge with, and never let them review against the brief that
  produced the work.

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
