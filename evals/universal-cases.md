# Universal eval cases — domain-agnostic failure classes

Every case below was a real failure first. Give the agent the case input with **no hint about what to
look for**; PASS means it raises the expected catch unprompted. Run them after ANY brief edit.

| # | Case | Must-catch | Owner |
|---|---|---|---|
| U1 | An element is invented because it "matches the style", with no source asset | Source-only violation | quality-officer, creative-director |
| U2 | Hero placed by arbitrary coordinates; the source anchors it differently (grounded/bleeding vs floating) | Reference-geometry deviation >10% | art-director, design-analyst |
| U3 | Asset from a legacy library predating the current system, contradicting today's product | No current-system lineage | quality-officer |
| U4 | Copy repeats a claim from the client's published material that the client says is wrong | Client facts override mined copy | content-creator, quality-officer |
| U5 | Mandated legal text renders at reduced opacity or off-center in its band | Spec + optical centering incl. component internals | design-analyst |
| U6 | A borrowed section is pasted complete with its own chrome (headers, arrows, containers) | Section chrome is not a creative element | creative-director, art-director |
| U7 | Background texture or scrim renders over the subject via a semi-transparent asset | Figure-ground violation | art-director, creative-director |
| U8 | Centered layout with a corner-anchored mark, or an off-axis line in a centered block | Symmetry logic / alignment axis | art-director, design-analyst |
| U9 | Device mockup at implausible UI density, or a screen with square corners in a rounded bezel | Device realism | art-director, designer |
| U10 | The right asset does not exist; the team runs composite-surgery rounds instead of asking the client | Ask-the-client-first before surgery | creative-director, designer, financial-controller |
| U11 | An asset receives a third corrective patch | 2-strike: replace or HOLD | designer, creative-director |
| U12 | A secondary element carrying its own action sits beside the single CTA | Competing actions | quality-officer, creative-director |
| U13 | A set ships with one layout and one treatment repeated where variation was the point | Sameness | art-director |
| U14 | Gate agents fail or stall and the pipeline reports success on zero findings | Absence of findings is not absence of defects | orchestration engine |
| U15 | Spend accrues on the orchestrator's own rounds with no ledger rows | Unmeasured spend: fix logging first | financial-controller |
| U16 | An external fact the client does not control (a regulator name, a third-party award, a partner claim) is changed on a verbal instruction | Require one settling artefact before publishing; never "correct" a live regulated disclosure from memory | quality-officer, content-creator |
| U17 | Creative carries eyebrow + 2-line headline + 2-line subline + hero card with its own heading and subheading | Text-heavy: an ad is not a page. Cut to headline + visual + CTA; subline is the first cut | creative-director, content-creator |
| U18 | A set for a product category ships with zero imagery of that category — only text-bearing UI cards lifted from the client site | Show the product's world; a worded card is not a visual | creative-director, art-director |
| U19 | Content *inside* a product screen or mockup is misaligned (a card inset differs from the row above it) | In-product UI is part of the creative — flag with disposition: native to the source vs introduced by us | design-analyst |
| U20 | A localized version places numerals, ratios or percentages in the wrong reading direction inside bidirectional text | Numerals run LTR inside RTL copy — check every figure, not the prose | design-analyst, content-creator |
| U21 | Audience targeting or copy includes/excludes by nationality, ethnicity, religion or gender | Protected-attribute targeting — prohibited on most platforms, legal exposure, and it silently drops profitable segments | content-creator |
| U22 | A market statistic sourced from a secondary blog is put in a client deck | Evidence hygiene: trace to primary source or label it an assumption; a widely-repeated number is not a sourced one | content-creator |
| U23 | A region ships while its mandated legal text is still marked TBD | Incomplete matrix: a region without settled mandated text cannot ship, regardless of design readiness | quality-officer |

## Scoring
A team revision passes when every case is caught by the named agent without hints. Record misses as
regressions — a case that used to pass and now fails means a brief edit removed a rule that was load-bearing.
