---
name: creative-gate
description: Run the mandatory creative review gate on one or more finished creatives BEFORE showing them to anyone. Dispatches the Creative Director, Art Director and Quality Officer agents in parallel on the given targets, waits for verdicts, applies confirmed fixes, re-renders, and writes a gate marker. Use whenever a creative build round completes; a build without a gate marker is not done.
---

# Creative Gate

The rule this skill exists for: **build → gate → fix → show. Never show ungated work.**

## Inputs
The targets to gate — design-tool node IDs, file paths, or rendered screenshots — plus the campaign context.

## Steps

0. **Orchestration.** Get the dispatch plan from the `creative-director` agent (its *Orchestration
   authority* section defines the decision table and the plan format) — or run `workflows/creative-gate.js`
   via the Workflow tool, which does plan + gates + consolidated verdict deterministically. The CD's plan
   overrides the default dispatch below.

1. **Default dispatch** (when no plan). One message, multiple Agent calls, IN PARALLEL. Each agent reads
   its own brief and the active client profile first:
   - `creative-director` — concept, hierarchy of intent, asset lineage
   - `art-director` — full-size + squint render review, reference geometry, device realism
   - `quality-officer` — compliance, region rules, facts, system membership

   Add `design-analyst` for token-level measurement passes. Run `content-creator` on copy decks *before*
   build, not after.

2. Reviewers are **READ-ONLY** on the artifact. They return severity-ranked findings.

3. Apply BLOCKER and MAJOR fixes. Note contested findings for the human instead of acting unilaterally —
   anything touching content the client explicitly told you to keep is a decision, not a defect.

4. Re-render at ≥0.5 scale and re-check the specific findings. Scope the re-gate to the failed roles only.

5. Write the gate marker: `.gates/<ISO-date>-<target>.md` in the project root — verdicts, fixes applied,
   open items. The Stop hook checks builds against these markers.

6. **Log every dispatch** to `.gates/ledger.csv`
   (`date,agent,purpose,tokens,tool_uses,duration_ms,outcome`) from the task usage stats. The Financial
   Controller audits this ledger; unlogged spend is a defect in itself (eval U15).

7. Only now present the work.

## Non-negotiables
- A definition is not a gate run. Agents only work when dispatched — this skill is the dispatch.
- One BLOCKER = the set does not ship.
- Never gate state that is about to change. Never skip the quality gate on shippable work.
- Cap at 2 fix→re-gate rounds, then escalate to the human.
- Every failure found by a human and not by a gate becomes, the same day: (a) a rule in the responsible
  agent's brief, and (b) an eval case in `evals/`.
