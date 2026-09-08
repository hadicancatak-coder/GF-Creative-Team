# The first live run

On 2026-09-07 the chain was run end to end for the first time — real agent dispatches against the real
briefs, on the fictional `example-northwind-cycles` profile, with a real Figma file and four real image
files as the asset inventory.

It did not produce an ad. **It refused to.** That is the run's most useful result, and this page records
it honestly, including what it cost and the bug it found in this plugin.

## Setup

A test project with the Northwind profile at `.creative-team/`, an empty Figma file, and four PNGs as
the complete asset inventory. The assets were built by hand for the test — and, as it turned out,
carelessly.

## What each role did

**content-creator** produced four concepts. Unprompted, it:
- refused to write a German variant of the range concept, because the profile records the DE pedelec
  class line as `TBD` with client legal — a region with unsettled mandated text cannot ship (U23)
- dropped the retired "£1,400/year vs driving" claim, which the profile marks retired rather than
  merely unpublished
- flagged that the site footer still says a 2-year warranty while the profile says 3, so running the
  warranty concept would create a live public contradiction
- cut the subline from every concept — "an ad is not a page"
- caught that the CTA "See the range" would collide with the range claim's own meaning
- did character arithmetic against the profile's actual type scale and margins, and noted that a line
  fitting the square would overrun Stories

**creative-director** opened all four assets, picked one concept and put two on HOLD with a client ask
rather than building a weak proof. It **overruled the copywriter**: the concept did not need a rider,
because the proof of "it doesn't ask you to be a cyclist" is the absent crossbar, and a rider would drag
in the DE/NL helmet rule for no gain. It banned the throttle asset from UK creative and noted that the
banned file was sitting unlabelled in the same folder as the approved ones.

**art-director** returned **`NO-VIABLE-ASSET`** and refused to select a hero.

## What the Art Director found

Every one of these was a genuine defect in the test assets, and none was known to the person who made them:

| Finding | How it was proved |
|---|---|
| The bikes have a **crossbar**, but the profile specifies the Drift as a **step-through** — so the concept's subject, "the gap where a crossbar would be", did not exist in any asset | Row scan: unbroken ink run x494→732 at y=352 |
| Two files were **99.91% identical** — the same drawing with a handlebar added and the ground line removed. Either layered from one master, or the handlebar was *drawn in*, which source law forbids | 31,152 matching ink pixels against 29 mismatching |
| **No provenance** on any asset | Walked the PNG chunks: every file IHDR/IDAT/IEND only, no `tEXt`/`iTXt`/`zTXt` |
| A **thumb throttle** in the handlebar asset — prohibited on UK pedal-assist spec | Located at `#D5342B`, x644–681, y431–469 |
| The ground band was drawn **across** the tyres rather than behind them, 3px short | Tyre ink to y=677, band ends y=674 |

It declined rather than nominating a least-bad option. That behaviour is the fix from v2.0.0 firing
correctly: before it, the output schema *required* a chosen path, so the role could not decline
(eval U28).

## What it cost

| Role | Tokens | Tool calls | Duration |
|---|---|---|---|
| content-creator | 123,112 | 5 | 3m 30s |
| creative-director | 123,716 | 9 | 2m 57s |
| art-director | 135,250 | 13 | 4m 10s |
| **Total** | **382,078** | 27 | ~11 min |

Roughly **127k tokens per role dispatch**, and about **48k per confirmed blocking finding**. This is a
real cost. Budget for it, and use the Financial Controller.

## The bug it found in this plugin

The Stop hook blocked the session, demanding a gate — but nothing had been built. The PostToolUse
matcher counted `create_new_file` as a build, and that tool produces an **empty** file. Thirteen "build"
entries were logged for a session in which no creative ever existed.

A gate that fires on work that does not exist teaches people to waive gates. Fixed in v2.0.1: the
matcher now covers only tools that change a design, and is anchored. Recorded as eval **U33**.

## What happened next — five runs

The first run halted at Select. So did the next three, each for a different and progressively more
legitimate reason, and each exposed a defect that got fixed:

| Run | Outcome | What it exposed |
|---|---|---|
| 1 | `ASK-CLIENT` at Select | Forged provenance — a manifest logged an illustration as a photograph |
| 2 | `ASK-CLIENT` at Select | Both font premises in the brief were false; the AD verified rather than complied |
| 3 | `ASK-CLIENT` at Select | The concept's subject was topologically incapable of being a subject, proved by flood-fill |
| 4 | `ASK-CLIENT` at Select | **The copywriter built the artwork itself** — role separation was prose, not policy |
| 5 | `ESCALATED`, **built in Figma** | The chain completed. The designer produced 8 nodes and flagged a HOLD on the canvas |

Run 4 is the important one. The chain had officially halted, and a PNG appeared anyway — rendered
locally with PIL by an agent that had no business building. A creative made outside the design tool is
invisible to the gate, the build log and the ledger: it was a route around every safeguard here at once,
taken by an agent trying to be helpful. Every non-designer role now lacks a write tool, and `validate.sh`
fails if that ever changes.

Run 5 produced the first artwork this system has built through its own chain. It is not gate-passed and
the designer said so — in the file, as a HOLD notice parked outside the artboard so nobody could mistake
it for approved.

## What is still unproven

**No creative has passed a gate.** The quality-officer and the financial-controller have never been
dispatched. No gate marker and no ledger row has ever been written. And nothing here has been run
against a real brand.
