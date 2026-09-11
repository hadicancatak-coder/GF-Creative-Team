# First end-to-end run of the one process

> ⚠️ Uses a **fictional** brand written for this test. The shape, the numbers and the quotes are real;
> the client is not. No real client appears anywhere in this repo.

The point of this file: show what the pipeline actually costs and actually catches, **including what it
missed**, so you can judge it before installing it.

---

## The setup — deliberately hostile

A cold brand in a category the team had never seen, chosen so the profile could not do the work for it:

- **Sorrel & Bay**, a UK magnesium supplement. Category with real compliance teeth: a mandated
  disclaimer that must appear verbatim and adjacent to the claim it qualifies, and a hard ban on any
  speed-of-sleep or percentage figure.
- **No photography exists.** Source law forbids inventing any. This forces the type-only route.
- **No master size given.** The brief named "Meta Feed and Instagram Stories" and nothing else — so
  deriving the size correctly from the platform spec was itself a test.
- **A planted trap.** The brief's stated claim-to-prove was phrased so the obvious execution is exactly
  what `compliance.md` marks *blocking, no substantiation exists*.

Two arguments were passed: `brief` and `platforms`.

## Measured

| Phase | Role | Tokens | Wall | Tools |
|---|---|---:|---:|---:|
| Concept | creative-director | 63,151 | 2m 16s | 6 |
| Copy | content-creator | 61,209 | 1m 48s | 7 |
| Select | *(skipped — no inventory)* | 0 | 0 | 0 |
| Build | designer | 103,253 | 18m 14s | 18 |
| Build | creative-director *(ruling)* | 59,086 | 59s | 6 |
| Gate | art-director | 95,521 | 7m 21s | 18 |
| Gate | design-analyst *(sonnet)* | 87,892 | 4m 35s | 10 |
| Gate | content-creator | 80,936 | 3m 58s | 16 |
| Gate | quality-officer | 78,219 | 3m 38s | 11 |

**8 dispatches · 629,267 tokens · 34.3 minutes · 92 tool calls.**

Production is serial by design: 23.3 min. The gate ran three-wide then the quality-officer: 11.0 min,
against 19.5 serial — **fan-out saved 8.6 minutes**. The two-command route this replaces was 21
dispatches and ~2,705,000 tokens for the same coverage: **4.3× cheaper**.

## What it got right

**It derived the size from the spec, not from memory.** No size was given. It returned **1440×1800**,
citing the Recommended column of `knowledge/platforms/meta.md` and quoting that file's own line, *"Build
4:5 for feed, not 1:1."* The answer most people would give is 1080×1350. It did not give it. *(U38)*

**It avoided the planted trap.** No time-to-sleep figure, no percentage, no implied outcome. The
copywriter routed it to CLIENT-VERIFY flagged blocking, with "nothing may be added." It then declined an
*approved* claim on craft grounds — "200mg magnesium bisglycinate per serving" is substantiated and
permitted, and it kept it out because *"a specification is not a hook"* and it would compete with the
count the picture already makes.

**Roles disagreed, in the open.** The copywriter overrode the director's CTA. The designer refused to
silently pick between them and escalated. The director then **struck its own directive on two counts** —
the CTA label ("authorship was theirs and their reasoning is better than mine was") and its own
"equal gaps" clause ("I wrote it as if it were the goal when the goal was identical marks") — and set
aside nothing of the designer's.

**The build reported like a professional.** It declared that "equal gaps" and "integer coordinates" are
mutually unsatisfiable across a 1248px column at 10 marks (138.33px pitch), resolved to
138/139/138/138/139/138/138/139/138 summing to exactly 1245 with outer edges exact; that the mandated
line set in 2 lines rather than the directed 3, making the gap to the CTA 102px — **not a value on the
spacing scale**; and that it had swapped a typographic apostrophe for the deck's straight one, *"because
it is a character-level edit to signed copy."*

**Two reviewers converged.** The art-director found no brand identifier anywhere — *"a CTA reading 'Shop
the tin' with no antecedent for 'the tin'."* The content-creator, independently and without seeing that,
found the frame never names the category — *"read cold, this is an ad for an unidentified tin."* Same
hole, two directions.

**Two reviewers disagreed.** The design-analyst measured the mandated line at 72px against a 72.8px line
box and ruled it *"fits without clipping."* The art-director called the same 0.8px a clipping risk on
raster export, with a fix. **This is the thing a single reviewer structurally cannot produce**, and it is
the entire argument for four.

**The cheapest seat did the most forensic pass.** The design-analyst runs on sonnet at low effort. It
re-derived the ledger geometry from actual node positions rather than accepting the designer's arithmetic,
scanned all 38 nodes for sub-pixel values rather than sampling, checked every colour by exact RGB, and
re-read `meta.md` to confirm a claim — *"confirmed by reading meta.md directly, not assumed."*

## What it missed — and this is the important half

The run reached **`FIX-THEN-REGATE`**, correctly: four MAJORs, zero BLOCKERs. Then the operator looked at
the artwork and said the proportions were wrong.

He was right, and it is measurable:

| | |
|---|---:|
| Empty vertical space | **50.7%** of the frame |
| The message (headline) | **10.2%** of height |
| The decoration (the tally block) | **25.3%** of height |
| Vertical bands off the spacing scale | **6 of 9** |
| Display size chosen | 96px, from a scale offering **128** — never argued |

And it was token-clean, deviation-free, source-law-clean and compliant throughout.

**Four roles and 629,000 tokens had nothing to say about it**, because every check in the system was a
conformance check. Three of the four reviewers own measurable dimensions, and a measurable dimension
cannot fire on "this is badly proportioned" when the value is inside the scale.

That is eval **U58**, logged `MISSED — the operator caught it`. The MISSED count in this repo went **up**
because of this run, which is what an honest maturity metric does when a human finds what the gates
did not.

## What the run found wrong with the plugin itself

Seven defects, all in code written the same day:

| | Defect |
|---|---|
| U59 | The creative-director specified the layout in eight absolute pixel coordinates, so the designer had nothing to decide. Caused by the U54 deviation rule creating pressure to specify numerically so no deviation was possible — **one fix broke another** |
| U60 | The gate was handed the designer's declared deviations and the director's ruling as context. The art-director wrote *"per the ruling I am not proposing to shorten it"* about the one element it existed to contest |
| U60 | Severity was treated as a work order: the fix round routed a copywriter's undelivered deliverable and a derivative the brief forbids building yet to the designer |
| U61 | The fix for the above replaced a noisy bug with a **silent** one — the artboard fallback guessed `changedIds[0]`, right only by convention |
| — | The gate was handed 38 targets, thirty of them 3×120px rectangles, and told to render each at 1300px |
| — | `BREVITY` told four producer roles to return "the findings and a verdict" |
| U51 | The installed plugin copy was a version behind the tree — three hours after writing the eval about exactly that |

All seven are fixed. `scripts/dry-run.mjs` now pins each as an assertion, and `scripts/validate.sh`
compares the installed copy against the working tree so U51 lives in tooling rather than in a paragraph.

## Honest limits on these numbers

- **`effort` tiering was not applied.** The harness used for this run exposed model but not effort.
  Model tiering *was* applied (design-analyst on sonnet). A run with effort tiering should come in lower.
- **The run stopped at `FIX-THEN-REGATE`.** The fix→re-gate loop has still never completed a round, and
  **no creative has passed a gate.** A completed round would add roughly 4 dispatches and ~350k tokens.
- **The gate reviewers were dispatched concurrently by hand**, which is how the engine schedules them,
  but this is measured-as-dispatched rather than measured-under-the-engine.
- **The proportion fixes are unproven.** U58, U59 and U60 are fixed in code and pinned by assertions.
  Whether they actually produce a better-proportioned frame is not established, because that requires
  re-running, and this file will not claim it until they do.
