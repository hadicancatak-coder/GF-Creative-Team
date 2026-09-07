# Universal eval cases — domain-agnostic failure classes

Give the agent the case input with **no hint about what to look for**; PASS means it raises the expected
catch unprompted. Re-run after ANY brief edit.

The **Outcome** column is the honest record. `MISSED` means a human found it and a gate did not — those
rows are why the rules above them are worded the way they are. Rows marked *codified* came from an
operating or compliance rule rather than a recorded gate failure; they are labelled so you can tell the
difference between evidence and policy.

| # | Case | Must-catch | Owner | Outcome |
|---|---|---|---|---|
| U1 | An element is invented because it "matches the style", with no source asset | Source-only violation | quality-officer, creative-director | MISSED — client deleted the work |
| U2 | Hero placed by arbitrary coordinates; the source anchors it differently (grounded/bleeding vs floating) | Reference-geometry deviation >10% | art-director, design-analyst | MISSED twice, then codified |
| U3 | Asset from a legacy library predating the current system, contradicting today's product | No current-system lineage | quality-officer | MISSED — client rejected on sight |
| U4 | Copy repeats a claim from the client's published material that the client says is wrong | Client facts override mined copy | content-creator, quality-officer | MISSED — client corrected |
| U5 | Mandated legal text renders at reduced opacity, or off-centre inside its band | Spec + optical centring incl. component internals | design-analyst | Opacity CAUGHT by gate; band centring MISSED — client caught |
| U6 | A borrowed section is pasted complete with its own chrome (headers, arrows, containers) | Section chrome is not a creative element | creative-director, art-director | CAUGHT by both gates |
| U7 | Background texture or scrim renders over the subject via a semi-transparent asset | Figure-ground violation | art-director, creative-director | CAUGHT once the rule existed |
| U8 | Centred layout with a corner-anchored mark, or an off-axis line in a centred block | Symmetry logic / alignment axis | art-director, design-analyst | CAUGHT by AD gate |
| U9 | Device mockup at implausible UI density, or a screen with square corners in a rounded bezel | Device realism | art-director, designer | MISSED — client caught both; rules added |
| U10 | The right asset does not exist; the team runs composite-surgery rounds instead of asking the client | Ask-the-client-first before surgery | creative-director, designer, financial-controller | MISSED — client caught after ~500k tokens |
| U11 | An asset receives a third corrective patch | 2-strike: replace or HOLD | designer, creative-director | Codified from an operating rule |
| U12 | A secondary element carrying its own action sits beside the single CTA | Competing actions | quality-officer, creative-director | CAUGHT by CD gate |
| U13 | A set ships with one layout and one treatment repeated where variation was the point | Sameness | art-director | Codified from an art-direction rule |
| U14 | Gate agents fail or stall and the pipeline reports success on zero findings | Absence of findings is not absence of defects | orchestration engine | MISSED — the engine reported success on zero results |
| U15 | Spend accrues on the orchestrator's own rounds with no ledger rows | Unmeasured spend: fix logging first | financial-controller | MISSED — orchestrator spend went unlogged |
| U16 | An external fact the client does not control (a regulator name, a third-party award, a partner claim) is changed on a verbal instruction | Require one settling artefact; never "correct" a live regulated disclosure from memory | quality-officer, content-creator | MISSED — a live disclosure was nearly changed on a verbal instruction |
| U17 | Creative carries eyebrow + 2-line headline + 2-line subline + hero card with its own heading and subheading | An ad is not a page. Cut to headline + visual + CTA; the subline is the first cut | creative-director, content-creator | MISSED — client called the set text-heavy |
| U18 | A set for a product category ships with zero imagery of that category — only text-bearing UI cards lifted from the client site | Show the product's world; a worded card is not a visual | creative-director, art-director | MISSED — a whole set shipped with no product in it |
| U19 | Content *inside* a product screen or mockup is misaligned (a card inset differs from the row above it) | In-product UI is part of the creative — flag with disposition: native to source vs introduced | design-analyst | MISSED — client caught; the agent had never been dispatched |
| U20 | A localized version places numerals, ratios or percentages in the wrong reading direction inside bidirectional text | Numerals run LTR inside RTL copy — check every figure, not the prose | design-analyst, content-creator | Codified from a compliance rule |
| U21 | Audience targeting or copy includes/excludes by nationality, ethnicity, religion or gender | Protected-attribute targeting — prohibited on most platforms, legal exposure, and it silently drops profitable segments | content-creator | Codified from a compliance rule |
| U22 | A market statistic sourced from a secondary blog is put in a client deck | Evidence hygiene: trace to primary source or label it an assumption | content-creator | Codified from a research rule |
| U23 | A region ships while its mandated legal text is still marked TBD | Incomplete matrix: no settled mandated text, no ship | quality-officer | Codified from a compliance rule |
| U24 | A creative is built at a size no live placement actually uses, or below a platform's stated minimum | Platform spec conformance — below minimum is a BLOCKER, not a MINOR | design-analyst | Codified from the platform knowledge layer |
| U25 | CTA or mandated legal text sits inside a vertical placement's UI-overlay safe zone | Safe-zone intrusion — on Meta 9:16 that is ~14% top and ~35% bottom | design-analyst, art-director | Codified from the platform knowledge layer |
| U26 | A set ships without the platform's dominant placement ratio (1:1 only, where the platform recommends 4:5 or 9:16) | Missing dominant ratio — the placement carrying most impressions was forfeited | quality-officer, creative-director | Codified from the platform knowledge layer |
| U27 | A spec is quoted from a knowledge file whose `review_by` date has passed, and asserted as current | Staleness — report EXPIRED, never assert. A confident stale number gets built against | design-analyst, quality-officer | Codified from the sourcing law |
| U28 | An output schema makes the escape hatch a required field, so the agent must nominate something rather than decline | A required field is a forced answer — every escalation path stays optional in the schema | orchestration engine | CAUGHT in engine audit — `PICK` required `chosenPath`, structurally forbidding "ask the client" |
| U29 | A verdict names an action the engine never performs (returns FIX-THEN-REGATE with no re-gate loop) | Documented behaviour must be implemented behaviour | orchestration engine | CAUGHT in engine audit — zero of the promised 2 rounds existed |
| U30 | A gate runs and passes, but nothing writes the marker or the ledger rows | A gate whose result was never recorded did not happen | orchestration engine, financial-controller | CAUGHT in engine audit — workflows have no filesystem access; the caller must write |
| U31 | An agent works from a client profile remembered from earlier in the session, or from a previous client, without re-reading it | A remembered profile is a fabricated one — resolve `.creative-team/active` every run, or declare reduced scope | all roles | Codified from the state model |
| U32 | A gate runs with no client profile loaded and reports SHIP | No compliance layer means UNVERIFIED, never SHIP. A reduced-scope gate presented as a full one is worse than no gate | quality-officer | Codified from the state model |

## Scoring
A team revision passes when every case is caught by the named agent without hints. A case that used to
pass and now fails is a **regression** — a brief edit removed something load-bearing. Record it.

## The metric
Track the ratio of `MISSED` to `CAUGHT` over time. Falling means the briefs are learning.
