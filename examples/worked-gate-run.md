# Worked example — one gate run

> ⚠️ Uses the **fictional** `clients/example-northwind-cycles/` profile. The shape is real; the client is not.

The point of this file: show what the gate actually returns, so you can judge whether it is worth
installing before you install it.

---

## The input

Four built masters, ready to show the client for the first time.

```
/gf-creative-team:creative-gate NW_Spring_A/B/C/D — 1080x1080 masters, UK + DE, range claim in the headline
```

## Phase 1 — the Creative Director's dispatch plan

The CD does not review here. It decides who reviews what, and why *this* work is risky.

```json
{"plan": [
  {"agent": "art-director",   "targets": ["A","B","C","D"], "group": 1,
   "focus": "Hero geometry vs the source shots; set-level sameness — four masters from one template is the standing risk on this account",
   "passesIf": "no BLOCKER at full size or squint"},
  {"agent": "design-analyst", "targets": ["A","B","C","D"], "group": 1,
   "focus": "Token conformance; DE headline type size vs the EN layout; reserved seal green must not appear on a CTA",
   "passesIf": "zero unexplained token deviations"},
  {"agent": "quality-officer","targets": ["A","B","C","D"], "group": 2,
   "focus": "Range disclaimer adjacency; DE pedelec line status; throttle visibility in UK shots",
   "passesIf": "SHIP per region, or a named blocking reason"}
]}
```

Two things worth noticing. The QO is in **group 2** — it runs last, on final state, after the group-1
fixes land, because gating state that is about to change is wasted spend. And the `focus` strings are
about *this* work's actual risks, not a generic checklist.

## Phase 2 — what came back

**art-director** — `FAIL`

| Severity | Where | Issue | Fix |
|---|---|---|---|
| MAJOR | C, hero | Ridge floats mid-canvas; source shot grounds the wheels at the lower third. Ratio deviation ~18% | Re-place by the source's measured ratio; wheels at y≈0.71 of canvas |
| MAJOR | A–D, set | One layout, bike at the same 3/4 angle in all four. This is a set, not a template | Vary at least two: one profile shot, one detail crop |
| MINOR | B, lower left | Leftover mask fragment, 6px, from the crop | Delete node |

**design-analyst** — `FAIL`

| Severity | Where | Issue | Fix |
|---|---|---|---|
| BLOCKER | D, CTA | CTA fill `#0F7C6B` — reserved warranty-seal green, logo and seal only | `#E4622D` |
| MAJOR | B-DE, headline | 54px vs the 58–72 scale. Type condensed to fit the EN layout | Restore to 58px; re-fit the layout, German runs ~30% longer |
| MINOR | A, sub→CTA | Gap 28px, rhythm calls for 32+ | 32px |

**quality-officer** — `BLOCK` *(ran after the above were fixed)*

| Severity | Where | Issue | Fix |
|---|---|---|---|
| BLOCKER | B-DE, C-DE | Range claim present; DE pedelec class line still TBD with client legal | DE cannot ship with a range figure. Drop the figure or hold DE |
| BLOCKER | A-UK, hero | Visible thumb throttle on the handlebar. UK spec is pedal-assist only | Replace the shot |
| MAJOR | A–D | Range disclaimer sits in the footer band; the claim is in the headline | Move it adjacent to the claim |

## Phase 3 — the verdict

```
decision: BLOCK
blockers: 3   majors: 5   minors: 2
perAgent: art-director FAIL(3) · design-analyst FAIL(3) · quality-officer BLOCK(3)
```

One BLOCKER means the set does not ship. The engine will not report SHIP with a blocker outstanding, and
it will not report SHIP at all if a gate agent stalls — a partial run returns `PARTIAL — DO NOT SHIP`
rather than a clean-looking pass on two of three reviews (eval U14).

## What this run cost, and what it was worth

| | |
|---|---|
| Dispatches | 4 (1 plan + 3 gates) |
| Confirmed BLOCKER + MAJOR | 8 |
| Alternative | 4 masters shown to a client with a reserved brand color on a CTA, an illegal-in-UK product shot, and a German region that cannot legally carry its own headline |

That last row is the argument for the whole repo. The two findings that mattered most — the throttle and
the TBD pedelec line — are not design opinions. They are the kind of thing that comes back from a
retailer or a legal review a week later, after the set has been through client review, revision and
scheduling.

## What happens next

1. Apply BLOCKER and MAJOR fixes. Contested items go to the human as decisions, not auto-fixes.
2. Re-gate **only the failed roles**, scoped to their own findings.
3. Write `.gates/2026-04-18-NW_Spring.md` — verdicts, fixes applied, open items.
4. Log all four dispatches to `.gates/ledger.csv`.
5. The DE range-claim blocker is not a design fix. It becomes a client ask, and the DE masters go to
   HOLD until legal replies.

Anything the client catches later that these gates missed becomes, the same day, a rule in the
responsible agent's brief **and** a row in `clients/example-northwind-cycles/evals.md`.
