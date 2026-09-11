# Worked example — one gate run

> ⚠️ Uses the **fictional** `clients/example-northwind-cycles/` profile. The shape is real; the client is not.
>
> 📜 **Recorded against 2.x**, when the Creative Director wrote a dispatch plan the engine validated, and
> the gate had a cheaper single-reviewer mode. 3.0.0 has one gate with a **fixed** four-role roster, so
> there is no plan to validate and no `INVALID PLAN` outcome. The findings, severities and verdicts below
> are unchanged — and kept verbatim, because a worked example edited to match the current code is a
> brochure, not a record.

The point of this file: show what the gate actually returns, so you can judge it before installing.

---

## The input

Four built masters, first time anyone outside the team will see them.

```
/gf-creative-team:creative-gate NW_Spring_A/B/C/D — 1080x1080 masters, Meta + Google, UK + DE, range claim in the headline
```

The engine resolves `.creative-team/active` → `northwind`, loads the profile, and starts.
*(With no profile it would run anyway, in reduced scope, and say so in the first line.)*

## Phase 1 — the plan, and the engine checking it

The Creative Director does not review here. It decides who reviews what, and why *this* work is risky.

```json
{"plan": [
  {"agent": "art-director",   "targets": ["A","B","C","D"], "group": 1,
   "focus": "Hero geometry vs the source shots; set-level sameness — four masters from one template is the standing risk on this account",
   "passesIf": "no BLOCKER at full size or squint"},
  {"agent": "design-analyst", "targets": ["A","B","C","D"], "group": 1,
   "focus": "Token conformance; DE headline size vs the EN layout; reserved seal green must not reach a CTA; platform spec conformance for Meta and Google",
   "passesIf": "zero unexplained token or spec deviations"},
  {"agent": "quality-officer","targets": ["A","B","C","D"], "group": 2,
   "focus": "Range disclaimer adjacency; DE pedelec line status; throttle visibility in UK shots; asset-group completeness for PMax",
   "passesIf": "SHIP per region, or a named blocking reason"}
]}
```

**The engine validates this before running it.** The quality-officer is in the last group — it gates
final state, after group 1's fixes land — and all four targets have a reviewer. A plan failing either
test is refused with `INVALID PLAN`, not quietly executed.

## What one of these findings looks like

![Meta Stories and Reels reserved zone drawn to scale on three schematic frames](images/meta-safezone-before-after.png)

The safe-zone finding below is the one people find hardest to believe until they see it measured. The
design file looks fine at 100% zoom; the placement covers the bottom third. The frames above are
schematic on purpose — a diagram that measures a constraint, not an example of a layout.

## Phase 2 — findings

**art-director** — `FAIL`

| Severity | Where | Issue | Fix |
|---|---|---|---|
| MAJOR | C, hero | Ridge floats mid-canvas; source shot grounds the wheels at the lower third. Ratio deviation ~18% | Re-place by measured ratio; wheels at y≈0.71 |
| MAJOR | A–D, set | One layout, bike at the same 3/4 angle in all four. This is a set, not a template | Vary at least two: one profile shot, one detail crop |
| MINOR | B, lower left | Leftover 6px mask fragment from the crop | Delete node |

**design-analyst** — `FAIL`

| Severity | Where | Issue | Fix |
|---|---|---|---|
| BLOCKER | D, CTA | Fill `#0F7C6B` — reserved warranty-seal green, logo and seal only | `#E4622D` |
| BLOCKER | A–D | **Set is 1:1 only.** Meta's own feed recommendation is 4:5 (`knowledge/platforms/meta.md`) | Build 1440 × 1800; 1:1 forfeits the placement carrying most feed impressions |
| MAJOR | A–D | **No 9:16 variant.** Stories and Reels are in the media plan | Build 1440 × 2560, and see the safe zone below |
| MAJOR | B-DE, headline | 54px vs the 58–72 scale. Type condensed to fit the EN layout | Restore to 58px; re-fit — German runs ~30% longer |
| MAJOR | A–D | Exports are 8.4 MB. Meta allows 30 MB; **Google PMax allows 5 MB** | Re-export under 5120 KB for the Google set |
| MINOR | A, sub→CTA | Gap 28px, rhythm calls for 32+ | 32px |

**quality-officer** — `BLOCK` *(group 2, on final state)*

| Severity | Where | Issue | Fix |
|---|---|---|---|
| BLOCKER | B-DE, C-DE | Range claim present; DE pedelec class line still TBD with client legal | DE cannot ship with a range figure. Drop the figure or hold DE |
| BLOCKER | A-UK, hero | Visible thumb throttle. UK spec is pedal-assist only | Replace the shot |
| BLOCKER | Google set | PMax asset group has 2 headlines. **Minimum is 3** — the group will not serve | Write a third headline, ≤30 characters |
| MAJOR | A–D | Range disclaimer sits in the footer band; the claim is in the headline | Move it adjacent to the claim |

## Phase 3 — fix, then re-gate only what failed

The designer applies the confirmed BLOCKER and MAJOR findings. Contested items — anything touching
content the client explicitly asked to keep — are never auto-applied; they surface as decisions.

Then **only the failed roles re-gate, scoped to their own prior findings.** A re-gate that opens new
dimensions is a new gate. Cap is two rounds, then it escalates to a human.

Round 2 clears the design-analyst findings. The quality-officer's two regulatory blockers do not clear,
because they are not design problems.

## Phase 4 — verdict

```
decision: BLOCK
rounds:   2
blockers: 2   majors: 1   minors: 0
perAgent: art-director PASS(0) · design-analyst PASS(0) · quality-officer BLOCK(2)
```

One BLOCKER means the set does not ship. The engine will not report SHIP with a blocker outstanding, and
it will not report SHIP at all if a gate agent stalls — a partial run returns `PARTIAL — DO NOT SHIP`
rather than a clean-looking pass on two of three reviews (eval U14).

It also returns a `ledger` array and a `marker` object. Workflow scripts have no filesystem access, so
the skill writes them: `.gates/2026-04-18-NW_Spring.md` and the rows appended to `.gates/ledger.csv`.
Without that marker the Stop hook blocks the session — correctly. A gate whose result was never recorded
did not happen (eval U30).

## What this run was worth

| | |
|---|---|
| Dispatches | 8 (1 plan + 3 gates + 1 fix + 3 re-gates) |
| Confirmed BLOCKER + MAJOR | 13 |
| Shipped instead | A set that was 1:1-only with no vertical variant, 8.4 MB against a 5 MB ceiling, a PMax group that would not serve at all, a reserved brand color on a CTA, an illegal-in-UK product shot, and a German region that cannot legally carry its own headline |

Four of those are **platform-spec** findings — wrong ratio, missing vertical, oversized export, PMax
minimum. None is a matter of taste. All four would have come back a week later from a rejected upload or
a placement that cropped, after the set had been through client review, revision and scheduling.

## What happens next

1. The two regulatory blockers become client asks, not fixes. The DE masters go to HOLD.
2. The UK throttle shot needs a replacement asset — and if no compliant shot exists, the Art Director
   returns `ASK-CLIENT` rather than nominating a least-bad one.
3. Anything the client catches later that these gates missed becomes, the same day, a rule in the
   responsible agent's brief **and** a row in the client's `evals.md`.
