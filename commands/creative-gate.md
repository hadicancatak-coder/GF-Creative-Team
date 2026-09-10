---
description: Gate built creatives before anyone sees them — CD plans, role agents review in parallel, consolidated SHIP/FIX/BLOCK verdict.
---

Run the creative gate on: $ARGUMENTS

**Two depths. Quick is the default.**

| Depth | Dispatches | Measured | Use it when |
|---|---|---|---|
| **`quick`** (default) | **1** | target ~100k tokens, ~3–5 min | Spot-check. One reviewer, fixed checklist, two renders. Reports; does not fix. |
| `full` | up to 14 | **1.7M tokens, 60 min** (measured) | The work ships to a client. Four roles cross-checking, up to 2 fix rounds. |

The full gate's cost is not waste — it is what caught the worst defect found in this project: three roles
independently measuring the same frame and establishing that a claimed fix had never landed in the file.
**One reviewer cannot disagree with itself.** That is exactly what quick gives up.

Default to quick. Escalate to full before anything reaches a client.

Follow the `creative-gate` skill exactly. If the targets and context are clear enough to pass as
arguments, prefer running `workflows/creative-gate.js` via the Workflow tool so the plan, the parallel
gates and the verdict are deterministic and every dispatch lands in the ledger.

If no targets were given, ask which creatives to gate — do not guess, and do not gate state that is
about to change.
