# Changelog

All notable changes to this project are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/);
this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] — 2026-09-07

First public release.

### Added
- Seven role agents: creative-director, art-director, designer, design-analyst, quality-officer,
  content-creator, financial-controller.
- `creative-gate` skill and `/creative-gate` command — the mandatory review gate.
- `/new-client` command — scaffolds a client profile and seeds its evals.
- Two deterministic workflows: `creative-gate.js` (plan → parallel gates → consolidated verdict) and
  `build-verify-loop.js` (select → build → verify → one fix round → PASS/ESCALATE).
- Enforcement hooks: build logging on design-tool writes, and a Stop hook that blocks ending a session
  with ungated builds (with a human waiver hatch).
- 23 domain-agnostic eval cases in `evals/universal-cases.md`, each naming the responsible agent.
- Client layer: `clients/TEMPLATE/` plus a fictional worked example, `clients/example-northwind-cycles/`.
- `docs/METHOD.md`, `docs/QUICKSTART.md`, and `examples/worked-gate-run.md`.

### Notes
This release is a clean extraction of a private, single-client tool. The role briefs, laws and eval
cases are unchanged in substance — every client-specific fact was moved into the client layer, and the
originating client's profile is not part of this repository.

## [1.1.0] — 2026-09-07

### Added
- **Knowledge layer** — `knowledge/platforms/` for Meta, Google, TikTok and LinkedIn. Placements,
  ratios, pixel dimensions, safe zones, character limits and file ceilings, every figure traced to the
  platform's own documentation with `verified` / `review_by` dates. Unverifiable figures are marked
  `TBD — unverified` rather than guessed.
- `/format-matrix` command — the asset list to build for a given set of platforms, before design starts.
- Platform-spec duties for design-analyst (conformance, safe-zone intrusion, file weight),
  quality-officer (required asset counts, character limits, dominant placement, staleness) and
  creative-director (format matrix at concept time).
- Seven eval cases: U24 wrong-size build · U25 safe-zone intrusion · U26 missing dominant ratio ·
  U27 stale spec asserted as current · U28 escalation blocked by schema · U29 verdict names an action
  nothing performs · U30 gate ran but nothing recorded it.
- Outcome column on every universal eval case — MISSED, CAUGHT, or explicitly codified.

### Fixed
- **`build-verify-loop.js` structurally forbade escalation.** `PICK` required `chosenPath`, forcing the
  Art Director to nominate a least-bad asset instead of asking the client — guaranteeing the failure
  law 3 and eval U10 exist to prevent. `outcome` (SELECTED / ASK-CLIENT / NO-VIABLE-ASSET) is now
  required and `chosenPath` is optional; the chain halts and returns a client ask.
- **`creative-gate.js` never re-gated.** It returned `FIX-THEN-REGATE` and stopped, while the briefs
  promised up to 2 fix→re-gate rounds. A real loop now dispatches the designer on confirmed findings and
  re-gates only the failed roles, scoped to their own prior findings.
- **Nothing recorded a gate run.** Workflow scripts have no filesystem access, so the gate now returns
  `ledger` rows and a `marker` object for the calling skill to write. Without the marker the Stop hook
  blocked the session even after a passing gate.
- **The dispatch plan was trusted, not checked.** The engine now refuses a plan that places the
  quality-officer anywhere but the final group, or that leaves any target unreviewed.
- Findings can be marked `contested` and are never auto-applied.
- README and METHOD claims corrected to match what the repo actually contains.

## [1.2.0] — 2026-09-07

### Fixed
- **Client profiles were being written into the plugin directory**, where `/plugin update` would destroy
  them. Profiles now live in the working project at `.creative-team/clients/<name>/`, alongside the
  `.gates/` directory the hooks already use. The plugin's `clients/TEMPLATE/` is read-only source.
- **Five of seven agents said "load the active client profile" without saying where it was**, and the
  one that did named two conflicting paths. All seven now carry the same resolution rule:
  `.creative-team/active` → `.creative-team/clients/<name>/` → declare reduced scope. Resolved every
  run, never from memory.
- Restored the final step of the gate skill ("only now present the work"), dropped by an earlier edit.

### Added
- **Reduced-scope mode.** With no client profile the gate still runs platform and universal checks and
  opens its report with what it skipped. The quality-officer returns `UNVERIFIED`, never `SHIP`. This
  makes the first run useful before any setup.
- `/use-client` — switch the active profile, or report which is live and what is therefore unchecked.
- README: "How it works", "What people use it for", and where a user's data lives.
- U31 (agent works from a remembered profile) and U32 (reduced-scope gate reported as SHIP).

## [1.3.0] — 2026-09-07

### Added
- `scripts/validate.sh` — one command that checks workflow and hook syntax, executable bits, JSON and
  plugin manifests, frontmatter on every agent/command/skill, that no workflow references a missing
  agent, that knowledge files carry frontmatter and cite sources, that README counts match the eval
  table, that links resolve, and that no absolute path or plugin-directory write leaked into the docs.
- GitHub Actions running the validator on push, PR, and **weekly** — so a knowledge file passing its
  `review_by` date fails CI with no code change. Eval U27, enforced by the harness.
- Issue templates: a failure the team did not catch, and a platform spec correction (which requires a
  primary source, per U22).
- `metadata.description` on the marketplace manifest.

### Changed
- Worked example rewritten against the current pipeline: plan validation, platform-spec findings
  (wrong ratio, missing vertical, file-size ceiling, PMax asset-group minimum), the real fix→re-gate
  loop, and the ledger/marker handoff.

### Verified
- Full install tested end to end: `claude plugin validate` clean, marketplace added, plugin installed
  and enabled at the reported version, with all 4 commands, 7 agents, the skill, the knowledge layer
  and both hooks present and executable in the install cache.

## [1.4.0] — 2026-09-07

### Added
- **Knowledge gaps filled: 16 → 10 remaining.** All from primary sources, dated.
  - Meta: Feed video (4:5, ≥1440×1800, 4 GB, H.264/AAC) and Carousel (2–10 cards, 80/20/18 text limits —
    far tighter than single image). Plus the rule that the ad footer does not render on mobile Feed for
    awareness objectives.
  - Google: Responsive Search Ads (3–15 headlines @30, 2–**4** descriptions @90 — RSA differs from PMax),
    pinning guidance, Responsive Display asset counts, and the image asset policy including Google's own
    safe-zone equivalent: "place the most important content in the center 80% of the image".
  - TikTok: image ad specs, and the character rules that reject uploads (no emoji in names; no emoji,
    `{`, `}` or `#` in descriptions).
  - LinkedIn: video (4 ratios, 3s–30min, 75 KB–500 MB, <30 FPS) and carousel — including that cards
    render at 312 × 312, so type legible in the file is not legible in the feed.
- **First diagram**, generated from checked-in HTML source so it is reproducible:
  `examples/images/meta-safezone-before-after.png`. Same creative before and after, with Meta's published
  Stories/Reels reserve drawn to scale. Labelled a constructed illustration on the fictional profile —
  not real client work, not the output of a live gate run.

### Fixed
- The validator resolved markdown links from the repo root, so a link relative to its own file could
  break undetected. It now resolves per-file and also verifies every referenced image exists and is
  non-empty.

## [1.5.0] — 2026-09-07

### Added
- **`docs/THE-TEAM.md`** — a job description per role: what you give it, what you get back, when to call
  it, an illustrative sample of its output, and what it will not do. Plus how the seven work together
  and how to hire one without the others. The README's role table described ownership, not jobs.

### Knowledge — gaps 16 → 4, all remaining ones are reservation formats
- **Google is now complete (0 gaps):** Responsive Display full asset table, Demand Gen (headlines run to
  40 where PMax and RSA stop at 30 — and one must still be ≤30), App campaigns (CJK characters count
  double, and Google may auto-generate a video that serves under your brand without passing your gate),
  and the full uploaded-display size list with its **150 KB** ceiling.
- **Meta:** Collection ads, plus a per-format text-limit table — five surfaces, five different limits.
  Feed 150/27, Stories 125, Reels 44, Carousel 80/20/18, Collection 125/40.
- **TikTok:** carousel — 2–35 images uploaded but only 20 ever displayed, at **100 KB per image**, the
  tightest ceiling of any platform here.
- **LinkedIn:** document ads (flatten layers, normalise page sizes — both silently break the upload) and
  message ads (subject 60, body 1,500, CTA 20; the "Not Interested" button is added automatically).

## [2.0.0] — 2026-09-07

The team could review creative. It could not make any. This adds the missing half.

### Added
- **`/create-ad`** — brief to built artwork, the main entry point. Copy deck → concept → asset
  selection → build in Figma → verify, with one fix round. Halts and returns a client ask if nothing in
  the inventory proves the headline.
- **`workflows/create-ad.js`** — the same chain, deterministic and schema-checked end to end.
- **Designer: "Building from zero."** Every build path previously assumed an artboard and a slot already
  existed. Now: artboards from the format matrix, master size first, frame and margins, safe-zone guides
  converted to px *before* anything is placed, then hero by measured ratio, type from the scale, legal
  line last and to spec. Tokens only — a value not in the profile is a question, not a choice.

### Changed
- README leads with making the ad rather than gating it. Four of the five commands were review, planning
  or setup; nothing made anything.

## [2.0.1] — 2026-09-08

First live run of the chain. It found a bug in this plugin, so the run is documented in
`examples/first-live-run.md` — including what it cost and what it refused to do.

### Fixed
- **The gate fired on work that did not exist.** The PostToolUse matcher counted `create_new_file` as a
  build, but that tool produces an *empty* file. A session that created a blank Figma file and built
  nothing logged 13 "builds" and was then blocked by the Stop hook with nothing to review. The matcher
  now covers only tools that change a design (`use_figma`, `update_shader`, `create_shader`), is
  anchored so a name merely containing a substring cannot match, and excludes `upload_assets` — putting
  a file in the library is not a creative until something places it.
  A gate that fires on phantom work teaches people to waive gates. Recorded as eval **U33**.
- **The cost claim in the README was from a different setup.** Replaced with measured figures from the
  live run: ~127k tokens per role dispatch, ~48k per confirmed blocking finding, across three roles.

### Added
- `examples/first-live-run.md` — the first end-to-end run. Three roles produced genuine unprompted
  findings; the art-director returned `NO-VIABLE-ASSET` and refused to select a hero, proving the
  v2.0.0 escalation fix. It states plainly that the build step remains unproven.
- Eval U33.

## [2.0.2] — 2026-09-08

### Fixed
- **The install instructions did not work in a terminal.** The README showed `/plugin marketplace add …`
  in a ```bash fence — but those are in-Claude slash commands, so anyone pasting them into a shell got
  `command not found`. Both README and Quickstart now give the real terminal commands
  (`claude plugin marketplace add …`), the slash-command alternative clearly labelled as in-Claude only,
  a `claude plugin list` verification step, and the Figma MCP requirement stated at install time rather
  than further down the page.

## [2.0.3] — 2026-09-08

Found by the first real invocation of `/create-ad` by a user rather than a hand-driven test.

### Fixed
- **`create-ad.js` dispatched on invalid input.** The workflow reads five fields off `args`, and the
  command form sends a bare string. `args.brief` was `undefined`, so every one of the five agent prompts
  would have been built around the word "undefined" — roughly 600k tokens spent producing nonsense, with
  no error. There was no guard of any kind.
  Now: a bare string is normalised to the brief, and a preflight names every missing field with what it
  is for and an example call. **Nothing is dispatched until the inputs are valid.** Recorded as U34.
- `/create-ad` now gathers the five inputs up front and tells the user to stop and ask when given only a
  sentence, instead of guessing.

### Known, not fixed
- The role briefs carry **74 prohibitions and 1 composition rule** between them. No agent is taught how
  to make something good — only how to avoid being wrong. This is why a built creative is correct and
  boring, and it is the next thing to fix.
- The art-director and designer can disagree with no route to a ruling. The creative-director owns that
  authority in its brief; nothing calls it.

## [2.1.0] — 2026-09-08

The first built creative was correct and boring. The cause was measurable: across the seven briefs there
were **74 prohibitions and 1 composition rule**. No role had ever been taught how to make something
good — only how to avoid being wrong.

### Added — craft
Every role that *makes* something now carries generative guidance alongside its prohibitions.

- **designer** — layout systems to choose from and commit to (hero-dominant, type-dominant, split,
  full-bleed editorial, framed); weight distribution, with the rule that an empty rectangle over ~25% of
  the canvas and unbounded on two sides is a hole rather than composed space; the eye path
  (entry → subject → action); scale contrast in tiers, judged by area of ink; optical over mathematical
  alignment; display-type craft (tracking tightens with size, line height compresses, break on meaning);
  colour weight when the product itself carries the accent. Plus five questions to answer before returning.
- **creative-director** — finding the tension, the turn, leaving the viewer one unit of work,
  specificity over scale, directing treatment rather than a parts list.
- **art-director** — the thumbnail test first rather than last, shaped vs leftover emptiness, scale
  contrast, eye order, whether the crop has a reason, and selecting for the asset that makes the idea
  inevitable rather than the one with fewest defects.
- **content-creator** — rhythm read aloud, the turn, concrete over abstract, cutting the warm-up line,
  verbs over adjectives, writing to the real type band, leaving one thing unsaid.

The quality-officer and financial-controller stay prohibition-led on purpose; a compliance gate and a
cost auditor are meant to be.

### Added — conflicts now resolve
The designer's output carries a structured `conflict` field. When set, the engine routes it to the
creative-director for an explicit ruling *before* verification, and the ruling is carried into the
art-director's check. The CD's brief now states it rules on the objective rather than the measurement —
a role can be measurably right about the wrong question. Evals **U35** and **U36**.

### Added — public-repo safety
`validate.sh` now fails on any former-client name, domain or file key. Verified clean across the working
tree and the entire git history.

## [2.1.1] — 2026-09-08

### Fixed
- **`creative-gate.js` carried the same unguarded-args bug as `create-ad.js`.** `args.targets.map()`
  dereferences before any check, so a call missing `targets` throws instead of explaining itself. The
  existing `date` guard only caught a bare string by luck. Now both workflows preflight their inputs,
  name every missing field with what it is for, give an example call, and dispatch nothing until valid.

### Added
- Eval **U37** — a gate that passes but records nothing has no provable review status, and the
  enforcement hook keeps blocking. The marker and the ledger rows *are* the pass. Workflow scripts have
  no filesystem access, so the caller must write them; that path existed in the skill and had never once
  been exercised.

## [2.2.0] — 2026-09-08

The measurement gate ran on a real build for the first time and returned FAIL with three blockers. Every
one of them was a defect in this repo, not in that particular artboard.

### Fixed
- **The example profile taught the wrong sizes.** Its format matrix listed 1080×1080 as the master for a
  Meta Feed plan. Meta's own spec says build 4:5 — a 1:1 square is 25% off against a 3% tolerance, and
  the matrix had no 9:16 entry at all. Now derived from `knowledge/platforms/` with the recommended
  resolutions (1440×1800 feed, 1440×2560 stories) and a note on why a square is not a Meta master.
- **`clients/TEMPLATE/` now tells you to derive the matrix from the platform specs** rather than from
  what the team built last time, and to take recommended resolutions rather than minimums.
- **designer — "Hand-off hygiene"**: integer coordinates (sub-pixel geometry resamples on export); cite
  the source file in the layer name, because an assertion is not a citation; bleed properly or land on
  the spacing scale, never 23px short of an edge; set container fills to a token rather than leaving
  them black for the next line to inherit; follow the naming convention exactly, no `_v2` segments;
  never invent a typographic value when the profile has no token for it; and treat a missing font plus
  missing fallback as a blocking flag raised at the top, not a footnote.

### Added
- Evals **U38** (master built at a size matching no live placement), **U39** (provenance asserted rather
  than cited), **U40** (silent font substitution).

## [2.3.0] — 2026-09-08

Three build rounds could not terminate. The licensed font was never going to be installed on that
machine, so every gate correctly returned a permanent failure and the loop had no reachable exit. That
is a product gap, not a build problem: **a gate that can only ever say "not yet" is a gate people start
waiving.**

### Added
- **`ENVIRONMENT` severity.** A constraint outside the work that re-gating cannot change — a font absent
  from the build machine, an asset whose native resolution cannot carry the crop, a client answer
  outstanding, a knowledge file past `review_by`, mandated text still TBD. Distinct from `BLOCKER`,
  which is a defect the team can fix.
- **`COMP-APPROVED` verdict.** No defect blockers remain; only environment items do. Means: approved as
  a comp — show it internally and to the client — but do not export or traffic it until the listed items
  clear. The marker carries `clearBeforeExport` as a checklist rather than a vague "not passed".
- A verdict table in the gate skill, and guidance in the quality-officer and art-director briefs on
  telling the two apart — including the warning not to park a defect under ENVIRONMENT to avoid
  arguing about it.
- Eval **U41**.
