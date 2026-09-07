---
description: Work out exactly which creative assets to build for a campaign — sizes, ratios, per-placement variants and naming — from the verified platform specs.
---

Build the format matrix for: $ARGUMENTS

This is the command to run BEFORE any design work. Building the wrong sizes is the cheapest mistake to
prevent and the most expensive to discover late.

## Steps

1. Establish scope: which platforms, which placements, which regions and languages. Ask if not given —
   do not assume a platform.

2. Read the relevant files in `knowledge/platforms/`. **Check each file's `review_by` date first.**
   If it has passed, say so before presenting anything, and mark every figure from that file as
   unverified. Do not fill a gap from memory — a `TBD — unverified` stays TBD in your output.

3. Produce the matrix:

   | Platform | Placement | Ratio | Build at (px) | Max file | Safe zone | Text limits |

   Build at the platform's **recommended** resolution, not its minimum. Minimums are rejection
   thresholds, not targets.

4. Collapse duplicates. Several platforms share sizes — 1200 × 628 and 1200 × 1200 serve Google PMax
   and LinkedIn from one export. Say explicitly which assets are reusable and which must be exported
   separately, and why (file-size ceilings differ by up to 6×).

5. Flag what the scope is missing: any dominant placement ratio absent from the list, and any platform
   whose specs are gapped in the knowledge layer.

6. Apply the client profile's naming convention if one is active. Otherwise propose one and say it is a
   proposal.

## Output

The matrix, a flat build list in priority order, the reuse map, and an explicit "not verified" section.
If the knowledge layer could not answer part of the question, that is a finding — report it rather than
inventing a figure to complete the table.
