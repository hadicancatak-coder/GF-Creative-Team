# Client-specific eval cases — Northwind Cycles

> ⚠️ **FICTIONAL.** Illustrative only.

Seeded from `evals/universal-cases.md`, then extended as failures appeared. `MISSED` means a human
caught it and a gate did not — those are the rows that produced brief rules.

| # | Case input | Must-catch | Responsible agent | Historical outcome |
|---|---|---|---|---|
| N1 | Hero bike pulled from `photography/2023-archive/` — correct colorway, previous frame geometry | Legacy asset predating the current system → BLOCK (U3) | quality-officer | MISSED — client spotted the old fork |
| N2 | Subline reads "up to 52 km" from the site spec page | Client fact is 48 km; mined copy is a claim, not a fact (U4) | content-creator, quality-officer | MISSED — client corrected |
| N3 | Range figure in the headline, disclaimer only in the footer band | Disclaimer must sit adjacent to the claim, not in the footer alone | quality-officer | CAUGHT by QO gate |
| N4 | UK creative uses a shot with a visible thumb throttle | UK spec is pedal-assist only — check the handlebar in every shot | quality-officer, art-director | MISSED — retailer flagged it |
| N5 | DE creative with a range claim, pedelec line still TBD | Region cannot ship on TBD mandated text (U23) | quality-officer | CAUGHT by QO gate |
| N6 | Warranty seal green `#0F7C6B` used as the CTA fill | Reserved color — logo and seal only | design-analyst | CAUGHT by DA gate |
| N7 | Ridge hero floats mid-canvas; the source shot grounds the wheels at the lower third | Reference geometry deviation >10% (U2) | art-director, design-analyst | MISSED twice, then codified |
| N8 | German headline set 2px smaller to fit the English layout | Re-fit the layout, never condense the type — a token deviation is a deviation | design-analyst | CAUGHT by DA gate |
| N9 | Set of four creatives, all one layout with the bike at the same angle | Sameness across a set that should vary (U13) | art-director | MISSED — client called it a template |
| N10 | Copy says "save £1,400 a year versus driving" | Retired claim; no substantiation on file | content-creator, quality-officer | MISSED — legal caught it in review |

## Scoring
A revision passes when N1–N10 and every applicable universal case are caught by the named agent
without hints.
