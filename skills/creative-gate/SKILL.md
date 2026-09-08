---
name: creative-gate
description: Run the mandatory creative review gate on one or more finished creatives BEFORE showing them to anyone. Dispatches the Creative Director, Art Director and Quality Officer agents in parallel on the given targets, waits for verdicts, applies confirmed fixes, re-renders, and writes a gate marker. Use whenever a creative build round completes; a build without a gate marker is not done.
---

# Creative Gate

The rule this skill exists for: **build → gate → fix → show. Never show ungated work.**

## Inputs
The targets to gate — design-tool node IDs, file paths, or rendered screenshots — plus the campaign context.

## Steps

0. **Resolve the active client profile.** Read `.creative-team/active` in the working project, then
   load `.creative-team/clients/<name>/`. Never use a profile remembered from earlier in the session.

   **No profile? Run anyway, in reduced scope.** Gate against `knowledge/platforms/` and the universal
   failure classes, and open your report with exactly which checks were skipped — brand system, tokens,
   source law and compliance. The quality-officer returns `UNVERIFIED`, never `SHIP`, without a
   compliance layer. A reduced-scope gate is useful; a reduced-scope gate presented as a full one is not.

1. **Orchestration.** Get the dispatch plan from the `creative-director` agent (its *Orchestration
   authority* section defines the decision table and the plan format) — or run `workflows/creative-gate.js`
   via the Workflow tool, which does plan + gates + consolidated verdict deterministically. The CD's plan
   overrides the default dispatch below.

2. **Default dispatch** (when no plan). One message, multiple Agent calls, IN PARALLEL. Each agent reads
   its own brief and the active client profile first:
   - `creative-director` — concept, hierarchy of intent, asset lineage
   - `art-director` — full-size + squint render review, reference geometry, device realism
   - `quality-officer` — compliance, region rules, facts, system membership

   Add `design-analyst` for token-level measurement passes. Run `content-creator` on copy decks *before*
   build, not after.

3. Reviewers are **READ-ONLY** on the artifact. They return severity-ranked findings.

4. Apply BLOCKER and MAJOR fixes. Note contested findings for the human instead of acting unilaterally —
   anything touching content the client explicitly told you to keep is a decision, not a defect.

5. Re-render at ≥0.5 scale and re-check the specific findings. Scope the re-gate to the failed roles
   only, and to their own prior findings — a re-gate that opens new dimensions is a new gate.
   Cap at 2 fix→re-gate rounds, then escalate to the human.

6. **Write what the workflow returned.** `workflows/creative-gate.js` returns a `marker` object and a
   `ledger` array but cannot write them — workflow scripts have no filesystem access and cannot read the
   clock (pass the date in as `args.date`). So the caller writes:
   - `marker.path` → the gate marker file, from `marker.decision`, `marker.rounds` and `marker.openItems`
   - each `ledger` row appended to `.gates/ledger.csv`
     (`date,agent,purpose,tokens,tool_uses,duration_ms,outcome`)

   The workflow fills `date`, `agent`, `purpose` and `outcome`. **You fill `tokens`, `tool_uses` and
   `duration_ms` from the task usage stats** — the script cannot see them. Rows with null tokens are
   incomplete, and the Financial Controller will report the gap rather than the cost (eval U15).

   Without the marker, the Stop hook blocks the session even though the gate passed. That is the hook
   working correctly: a gate whose result was never recorded did not happen.

7. Surface `contested` findings to the human as decisions. Never auto-apply them.

8. **Only now present the work.** If the gate ran in reduced scope, say so in the first line of
   what you present — not in a footnote.

## The verdicts

| Verdict | Means | What you may do |
|---|---|---|
| `SHIP` | Clean | Export and traffic it |
| `COMP-APPROVED` | No defects left; only environment items outstanding | Show internally and to the client. **Do not export or traffic** until the listed items clear |
| `FIX-THEN-REGATE` | Majors remain, rounds left | Fix, re-gate the failed roles only |
| `BLOCK` | A defect blocker stands | Nothing ships |
| `ESCALATED` | Rounds exhausted, or the designer could not resolve | A human decides |
| `PARTIAL` / `INCOMPLETE` | A gate agent stalled | Re-run. Absence of findings is not absence of defects |
| `INVALID PLAN` | The dispatch plan failed validation | Re-plan |

**`COMP-APPROVED` is a real terminal state, not a soft failure.** A gate that can only ever say "not
yet" is a gate people start waiving. Write the marker for it exactly as you would for a SHIP, with
`clearBeforeExport` as a checklist and an owner against each item.

## Non-negotiables
- A definition is not a gate run. Agents only work when dispatched — this skill is the dispatch.
- One BLOCKER = the set does not ship.
- Never gate state that is about to change. Never skip the quality gate on shippable work.
- Cap at 2 fix→re-gate rounds, then escalate to the human.
- Every failure found by a human and not by a gate becomes, the same day: (a) a rule in the responsible
  agent's brief, and (b) an eval case in `evals/`.
