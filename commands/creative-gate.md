---
description: Gate built creative before anyone sees it — four reviewers in parallel, quality-officer last on final state, consolidated SHIP/FIX/BLOCK verdict.
---

Run the creative gate on: $ARGUMENTS

**One gate.** Four reviewers, each owning a failure class, running in parallel; the `quality-officer`
alone in the final group because it certifies **final** state, after the other roles' fixes have landed.
Up to 2 fix → re-gate rounds, then a human decides.

There is no spot-check variant. The cheaper one this plugin used to offer was cheaper precisely because
a single reviewer cannot disagree with itself — and that disagreement is the entire mechanism. The worst
defect ever found in this project was three roles independently measuring the same frame and
establishing that a fix reported as resolved had never landed in the file.

**`/create-ad` runs this same gate inline**, from the same code. Use this command for creative the chain
did not produce: built by hand, built before you installed this, or inherited.

## The roster

| Role | Owns |
|---|---|
| `art-director` | render forensics — thumbnail survival, the measured empty region, CTA affordance, cited asset lineage, reference geometry |
| `design-analyst` | every number — dimensions and ratio against the placement, safe zones converted to px for this canvas, tokens, fonts resolved **in the renderer**, collisions |
| `content-creator` | every word in the frame, read off the render — mandated legal text verbatim and adjacent to its claim, character limits, unsubstantiated claims |
| `quality-officer` | **last, on final state** — regulation and regional rules, export weight against each platform's ceiling, system membership, and the terminal verdict |

Reviewers are **READ-ONLY**. Only the designer changes the artifact, and only findings that are neither
contested nor ENVIRONMENT reach it.

## How to run it

Prefer `workflows/creative-gate.js` through the Workflow tool:

```
targets   [{ id, name, note }]   REQUIRED   what to gate
date      string                 REQUIRED   run `date -u +%F` — you supply this, not the user
location  string                 optional   "Figma file <KEY>, page ...", "./renders/", a URL
context   string                 optional   what the work is for, and any known reservations
```

If no targets were given, ask which creatives to gate — do not guess, and **never gate state that is
about to change.** Otherwise follow the `creative-gate` skill, which covers the profile resolution, the
verdict table and the marker and ledger you must write afterwards.

## The verdicts

| Verdict | Means | What you may do |
|---|---|---|
| `SHIP` | Clean | Export and traffic it |
| `COMP-APPROVED` | No defects left; only environment items outstanding | Show internally and to the client. **Do not export or traffic** until the listed items clear |
| `UNVERIFIED` | Reviewed in reduced scope — no compliance layer was loaded | Say so in the first line of what you present. Never treat it as a pass |
| `FIX-THEN-REGATE` | Majors remain and rounds are left | Fix, re-gate the failed roles |
| `BLOCK` | A defect blocker stands | Nothing ships |
| `ESCALATED` | Rounds exhausted, or the designer could not resolve it | A human decides |
| `PARTIAL` / `INCOMPLETE` | A reviewer stalled | Re-run. Absence of findings is not absence of defects |
