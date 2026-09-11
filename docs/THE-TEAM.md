# The team

Seven roles. This is what each one actually does — what you give it, what you get back, and when you
would call it. Read it the way you would read seven job descriptions before hiring.

Example outputs below are illustrative, on the fictional `example-northwind-cycles` profile.

**They do not run on their own.** You call a command; the command dispatches them. Nothing happens in
the background, nothing watches your files. The only automatic behaviour in the whole plugin is the
Stop hook that refuses to let a session end on an ungated build.

---

## 1. Creative Director — *directs, and rules when roles disagree*

**Give it:** the campaign context and the built work, or a concept before it is built.
**You get:** the ONE subject that owns the frame, a directive of INTENT — never pixel coordinates, which
are the designer's to derive — plus the intended proportions and which step of the type scale to spend, a verdict
(APPROVE / REVISE / REJECT) with at most 5 notes and the set's single biggest weakness — and, when the
designer escalates a disagreement instead of deciding it, a ruling naming whose reasoning it sets aside.

**Call it when:** a concept is formed but not built, and again as the sign-off on any finished set.

It judges *meaning*, not pixels. Its core question is whether a creative declares one subject that owns
the frame at half a second. It also owns the **full-inventory rule** — it refuses to direct from a
pre-filtered menu of assets, because a shortlist someone else made is a decision already taken.

> **Sample:** `REVISE` — "Hero proves nothing. The claim is about replacing a car journey; the shot is a
> bike on white. Either the hero shows the journey or the headline changes. Set's biggest weakness:
> four masters, one idea."

**It will not:** measure tokens, write copy, or touch the file.

---

## 2. Art Director — *picks the asset, verifies the render, and owns proportion*

**Give it:** the complete asset inventory and a directive; later, the built render.
**You get:** a selection with reasoning and one line per rejected option — or a decision **not** to
select. Then, on verification: findings with severity, location and a fix in pixels.

**It also owns PROPORTION, and it is the only role that can.** The design-analyst compares values to
tokens, so a display size inside the scale passes; the content-creator owns words; the quality-officer
owns compliance. None of them can fire on "this is badly proportioned." So the Art Director reports, with
numbers: the dominant element and its share of the frame, whether that element is the **message** or the
**decoration**, the total empty vertical span as a % of height, and which step of the type scale the
headline should have taken and why. It judges the composition **on its own merit, not against the
directive** — a directive can be wrong, and this is the only role positioned to say so. *(U58)*

**Call it:** twice per creative. Once before the build to choose, once after to check.

It judges at full size **and** at squint distance, because a creative that only works at 100% zoom does
not work in a feed. It hunts reference geometry against the source, device realism, figure-ground
violations, and sameness across a set.

The important part: **declining is a legal answer.** If nothing in the inventory proves the claim, it
returns `ASK-CLIENT` with the exact request rather than nominating the least-bad option. That behaviour
exists because the opposite cost roughly 500k tokens of composite surgery before a human asked the
obvious question.

> **Sample:** `MAJOR` — "C, hero. Ridge floats mid-canvas; the source shot grounds the wheels at the
> lower third. Ratio deviation ~18%. Fix: re-place by measured ratio, wheels at y≈0.71."

**It will not:** modify the artifact. It is read-only, always.

---

## 3. Production Designer — *the only one that builds*

**Give it:** the directive, the selected asset with IDs, and the target's current state.
**You get:** changed node IDs, what it did, measured deviations, and its own verification assessment.

**Call it:** for every build and every fix round.

Seven craft laws govern it — reference geometry over arithmetic placement, objects that end honestly
rather than fading into slabs, seams removed by slicing rather than covered with bands, figure-ground
handled inside the asset instead of with canvas-wide washes, self-escalation on a third corrective
patch, self-verification at zoom before returning, and **never invent**.

That last one is absolute. Composing, cropping, slicing and subtracting are legal. Drawing new content
is not. When it is blocked, it escalates — invention is never the fallback.

**It will not:** decide what to build, choose the asset, or proceed without a source law telling it what
may be used. No client profile, no build.

---

## 4. Design Analyst — *the ruler, not the eye*

**Give it:** the built target and the active profile.
**You get:** a violation table — property, measured value, expected token, node ID, fix. Numbers only.

**Call it:** after the Art Director, on every set.

Every judgment cites a token or a number. It reads node properties programmatically rather than
eyeballing anything measurable. Since v1.1 it also checks **platform spec conformance** — dimensions
against the placement minimum, safe-zone intrusion converted to pixels for that canvas, and file weight
against the platform ceiling.

> **Sample:** `BLOCKER` — "D, CTA fill `#0F7C6B`. Reserved warranty-seal green, logo and seal only.
> Expected `#E4622D`." · `BLOCKER` — "A–D at 8.4 MB. Google PMax ceiling is 5120 KB."

**It will not:** have opinions about composition. If it cannot be measured, it is not its job.

---

## 5. Quality Officer — *the last gate before spend*

**Give it:** the final state, per region.
**You get:** `SHIP` or `BLOCK`, numbered findings (rule, where, required change), and the region-matrix
status.

**Call it:** last, always, on final state. Never on work that is about to change.

It re-reads the compliance layer **every run**, never from memory, because rules change and memory does
not. It checks mandated disclaimer text verbatim, single call to action, claims and substantiation,
regional restrictions including content inside screenshots, placeholder data, and whether every element
traces to a current approved source.

It also enforces the rule that stops the worst class of error: **the client's own facts override their
published material — but only for facts the client owns.** A regulator's name, a third-party award, a
partner's claim: those need a settling artefact before anyone changes them.

Without a compliance layer loaded it returns `UNVERIFIED`, never `SHIP`.

**It will not:** soften. One BLOCKER means the set does not ship.

---

## 6. Content Creator — *copy that fits the limits and the law*

**Give it:** the audience, the concept, and the platforms in scope.
**You get:** a copy deck per concept — line 1, accent line 2, subline, CTA, eyebrow, localized mirror,
the visual proof it requires, compliance notes — plus a CLIENT-VERIFY list of everything it could not
confirm.

**Call it:** *before* design, not after. Copy that does not fit drives layout changes late.

It writes capability and conditions, never outcomes. Auto-fail language: outcome promises, urgency-FOMO,
unsubstantiated superlatives, competing action verbs, a headline duplicating the CTA.

Two rules earn their place. **An ad is not a page** — a feed creative gets about a second, so the
default is eyebrow plus two-line headline plus one CTA, and the subline is usually the first thing to
cut. And a **targeting boundary**: audiences are built on income, profession, residency, life-stage and
behaviour, never on nationality, ethnicity, religion or gender — prohibited on most platforms for
regulated categories, and it drops profitable segments by accident.

**It will not:** assert a factual claim the profile does not substantiate. Unverified figures go on the
CLIENT-VERIFY list.

---

## 7. Financial Controller — *is any of this paying for itself?*

**Give it:** nothing. It reads `.gates/ledger.csv` and the gate markers.
**You get:** spend by agent and purpose, **cost per confirmed BLOCKER/MAJOR**, the top three waste
sources with numbers, three optimizations with expected savings, and the trend against the last audit.

**Call it:** at milestones. Never in the per-item loop — it would cost
more than it saves.

If ledger rows are missing, its first recommendation is always to fix logging. Unmeasured spend cannot
be managed, and the orchestrator's own rounds count.

Its hard boundary: it optimizes **how** gates run, never **whether**. It may not recommend skipping a
quality or compliance gate on shippable work.

**It needs no client profile.** Its inputs are the ledger and the markers.

---

## The default path is two roles

```
brief → ART DIRECTOR ──asks the blocking questions, writes the spec
                     ↓
              DESIGNER ──builds it, owns every number
                     ↓
      check-build.mjs ──arithmetic: gaps, tokens, type, proportion, colour. Free.
                     ↓
         ART DIRECTOR ──verifies the picture on its own merit
```

**Three dispatches for one ad.** The Art Director is the front door and owns the brief end to end;
nothing is built until it closes. The Designer executes and does not reinterpret. Everyone below is
engaged only when the job calls for them:

| Role | Engage when |
|---|---|
| `creative-director` | a design system must be built or extended · 2+ creatives for one brand must cohere · the designer and AD disagree |
| `quality-officer` | regulated category · mandated text · a claim needs substantiation · anything about to be trafficked |
| `content-creator` | copy is the lead deliverable, or per-placement/per-language field copy is needed |
| `design-analyst` | a measurement is contested, or the token system needs a drift audit. Routine arithmetic is the script's |
| `financial-controller` | auditing a run afterwards |

**Why the arithmetic moved to a script.** The design-analyst dispatch cost ~88,000 tokens and minutes to
compare numbers to numbers. `scripts/check-build.mjs` does it in milliseconds, never disagrees with
itself between runs, and catches three findings that dispatch missed. What stays with a role is
judgement: whether the picture is any good. Keeping the two apart is what makes either affordable.

## Hiring one without the others

You can. They are separate agents.

- Just want to know what to build? Ask the Art Director — deriving the format matrix from the
  verified platform specs is part of closing the brief.
- Just want a copy deck? Call `content-creator` alone.
- Just want a second pair of eyes on a finished set? `art-director` plus `quality-officer` is a real
  review and takes two dispatches.

The full chain is for when you are producing a set and shipping it. The individual roles are useful on
their own, and the Financial Controller will tell you if a gate you are running has stopped earning its
place — it recommends merging any gate that produces zero blockers or majors two audits running.
