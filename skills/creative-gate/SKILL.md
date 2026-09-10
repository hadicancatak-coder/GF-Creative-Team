---
name: creative-gate
description: Run the mandatory creative review gate on one or more finished creatives BEFORE showing them to anyone. Dispatches four role agents — art-director, design-analyst and content-creator in parallel, then quality-officer alone on final state — waits for verdicts, applies confirmed fixes, re-gates, and writes a gate marker and ledger rows. Use whenever a creative build round completes; a build without a gate marker is not done.
---

# Creative Gate

The rule this skill exists for: **build → gate → fix → show. Never show ungated work.**

**One gate.** There is no spot-check variant, and `scripts/validate.sh` fails the build if one
reappears. The cheaper gate this plugin used to offer was cheap precisely because a single reviewer
cannot disagree with itself — and that disagreement is the entire mechanism. The worst defect found in
this project was three roles independently measuring the same frame and establishing that a fix reported
as resolved had never landed in the file.

`/create-ad` runs this same gate inline, from the same code. Use this skill for creative the chain did
not produce: built by hand, built before the plugin, or inherited.

## Inputs
The targets — design-tool node IDs, file paths, or rendered screenshots — plus where they live and what
the campaign is. **You** supply the date (`date -u +%F`); it is not the user's job, and the workflow
cannot read the clock.

## Steps

0. **Resolve the active client profile.** Read `.creative-team/active` in the working project, then load
   `.creative-team/clients/<name>/`. Never use a profile remembered from earlier in the session.

   **No profile? Run anyway, in reduced scope.** Gate against `knowledge/platforms/` and the universal
   failure classes, and open your report with exactly which checks were skipped — brand system, tokens,
   source law and compliance. The quality-officer returns `UNVERIFIED`, never `SHIP`, without a
   compliance layer. A reduced-scope gate is useful; a reduced-scope gate presented as a full one is not.

1. **Run `workflows/creative-gate.js` through the Workflow tool.** It does the dispatch, the fix rounds
   and the consolidated verdict deterministically, and every dispatch lands in the ledger. Pass
   `targets`, `date`, and `location` and `context` when you have them.

2. **If the Workflow tool is unavailable**, dispatch the roster by hand: **one message, multiple Agent
   calls** for the first three, then the fourth on its own once any fixes have landed.

   | Role | Owns | Group |
   |---|---|---|
   | `art-director` | render forensics **and proportion** — thumbnail survival at ~110px, the **measured** largest empty region as a % of canvas, the dominant element's share of frame and whether it is message or decoration, total empty vertical span as a % of height, the display size argued against the other steps in the scale, CTA affordance, cited asset lineage, reference geometry. Judges the composition **on its own merit, not against the directive** | 1 |
   | `design-analyst` | every number — dimensions and ratio against the named placement, safe zones **converted to px for this canvas**, tokens, fonts resolved **in the renderer** rather than on the machine, collisions | 1 |
   | `content-creator` | every word in the frame, read off the render — mandated legal text verbatim and adjacent to its claim, per-placement character limits, claims the profile does not substantiate | 1 |
   | `quality-officer` | **final state, last** — regulation and regional rules, export weight against each platform's ceiling, system membership, and the terminal verdict | 2 |

   The roster is fixed and every role sees every target. Do not ask an agent which roles to dispatch:
   that costs a dispatch, and it can only narrow coverage.

2a. **Make sure the reviewers can SEE the work.** This is the single most likely reason a gate returns
   nothing useful. A subagent's `tools:` list is a strict allowlist that excludes MCP tools unless each
   is named, and a subagent launched in the background is denied them regardless. Before dispatching:
   **export each target to PNG (≥1300px, plus a ~110px thumbnail) and pass the file paths** — as
   `renders` to `workflows/creative-gate.js`, or in the prompt when dispatching by hand. Every role can
   `Read` a file even when it cannot reach the design tool.

   A reviewer that cannot see a target must return a single **ENVIRONMENT** finding saying so and ask
   for the renders. It must never write a review it could not perform. **A review written without
   looking is worse than no review** — it is a clean-looking pass over work nobody examined. Eval U62.

3. Reviewers are **READ-ONLY** on the artifact. They return severity-ranked findings with a location and
   an exact fix, plus their answers to the non-optional checks — including the ones that came back clean,
   because an omitted check is indistinguishable from a failed one.

   **Give them the brief and the artifact. Nothing else.** Not the producer's declared deviations, not a
   director's ruling. A reviewer handed the defence before the evidence reviews the defence — on the
   first live run the art-director wrote *"per the ruling I am not proposing to shorten it"* about the
   one element it existed to contest. Deviations and rulings go to the human, with the verdict. *(U60)*

   Every finding carries an **owner** (designer / content-creator / client / none) and a **scope**
   (this-artifact / flagged-forward). Severity is not a work order.

4. Apply BLOCKER and MAJOR fixes **that the designer owns and that concern this artifact.** Everything
   else goes to the human: another role's undelivered deliverable, a client ask, and anything the brief
   sequences for later. On the first live run the fix round was handed a copywriter's field copy and a
   derivative the brief forbids building until the master is approved. **Note contested findings for the
   human instead of acting unilaterally** — anything touching content the client explicitly told you to
   keep is a decision, not a defect. **ENVIRONMENT findings never get a fix round**; re-running cannot
   change them.

5. Re-gate the roles whose findings were addressed, **scoped to their own prior findings** — a re-gate
   that opens new dimensions is a new gate. The `quality-officer` re-gates whenever **anything** changed,
   even having raised nothing itself: it certifies final state, and the state it certified no longer
   exists. Cap at 2 fix → re-gate rounds, then escalate to the human.

6. **Write what the workflow returned.** It returns `writeThese.marker` and `writeThese.ledger` and
   cannot write them — workflow scripts have no filesystem access. So the caller writes:
   - `marker.path` → the gate marker file, from `marker.decision`, `marker.rounds` and `marker.openItems`
   - each `ledger` row appended to `.gates/ledger.csv`
     (`date,agent,purpose,tokens,tool_uses,duration_ms,outcome`)

   The workflow fills `date`, `agent`, `purpose` and `outcome`. **You fill `tokens`, `tool_uses` and
   `duration_ms` from the task usage stats** — the script cannot see them. Rows with null tokens are
   incomplete, and the Financial Controller will report the gap rather than the cost (eval U15).

   Without the marker, the Stop hook blocks the session even though the gate passed. That is the hook
   working correctly: a gate whose result was never recorded did not happen.

7. Surface `contested` findings to the human as decisions. Never auto-apply them.

8. **Only now present the work.** If the gate ran in reduced scope, say so in the first line of what you
   present — not in a footnote.

## The verdicts

| Verdict | Means | What you may do |
|---|---|---|
| `SHIP` | Clean | Export and traffic it |
| `COMP-APPROVED` | No defects left; only environment items outstanding | Show internally and to the client. **Do not export or traffic** until the listed items clear |
| `UNVERIFIED` | Reviewed in reduced scope; no compliance layer was loaded | Say so in your first line. Never treat it as a pass |
| `FIX-THEN-REGATE` | Majors remain, rounds left | Fix, re-gate the failed roles only |
| `BLOCK` | A defect blocker stands | Nothing ships |
| `ESCALATED` | Rounds exhausted, or the designer could not resolve it | A human decides |
| `PARTIAL` / `INCOMPLETE` | A reviewer stalled | Re-run. Absence of findings is not absence of defects |

**`COMP-APPROVED` is a real terminal state, not a soft failure.** A gate that can only ever say "not
yet" is a gate people start waiving. Write the marker for it exactly as you would for a SHIP, with
`clearBeforeExport` as a checklist and an owner against each item.

## Non-negotiables
- A definition is not a gate run. Agents only work when dispatched — this skill is the dispatch.
- One BLOCKER = the set does not ship.
- Never gate state that is about to change. Never skip the gate on shippable work.
- Cap at 2 fix → re-gate rounds, then escalate to the human.
- Every failure found by a human and not by a gate becomes, the same day: (a) a rule in the responsible
  agent's brief, and (b) an eval case in `evals/`.
