---
description: Gate built creatives before anyone sees them — CD plans, role agents review in parallel, consolidated SHIP/FIX/BLOCK verdict.
---

Run the creative gate on: $ARGUMENTS

Follow the `creative-gate` skill exactly. If the targets and context are clear enough to pass as
arguments, prefer running `workflows/creative-gate.js` via the Workflow tool so the plan, the parallel
gates and the verdict are deterministic and every dispatch lands in the ledger.

If no targets were given, ask which creatives to gate — do not guess, and do not gate state that is
about to change.
