# Changelog

All notable changes to this project are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/);
this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.9.1] — 2026-09-08

### Changed
- **Fast path retuned from ~6–9 min to a ~5 min target.** Two dispatches was not enough on its own;
  each was still 5–7 minutes. Cut on four axes at once, because no single one gets there:
  - **sonnet at medium effort** — top-tier inference was the largest single cost
  - **surgical reading** — name the files, forbid exploring. Agents were re-reading the tree every run
  - **one verification render** instead of the designer's zoom sweep — the gate does that job
  - **hard brevity** — decisions, not deliberation; the long returns were pure latency
- The trade is stated in the command and the workflow README: fast loses depth of judgement, forensic
  asset inspection and the second opinion. That is what the gate is for.

## [2.9.0] — 2026-09-08

Five sequential specialists is twenty to thirty minutes for one ad. Nobody waits that to look at an
idea, so nobody would use it — and a correct pipeline nobody runs is worth nothing.

### Added
- **`depth: 'fast'` is now the default for `/create-ad` — 2 dispatches, ~6–9 minutes.** The creative
  director does concept and copy in one pass; the designer selects and builds in one pass.
- `depth: 'full'` keeps the five-role chain, ~20–30 min, for work that is shipping rather than being
  looked at.
- **The trade is stated, not hidden:** fast gives up the art-director's independent asset selection and
  the pre-build verify. The gate is where quality comes back — and `/creative-gate` fans its roles out
  **in parallel**, so reviewing costs far less wall-clock than producing.
- Every prompt now carries a brevity instruction. Agents were returning 3,000-word deliberations; the
  decisions are what the next role needs, and the prose was pure latency.
- Eval **U49** — a pipeline optimised for thoroughness with no fast path.

### Why not just make it faster
The production chain cannot be parallelised: concept feeds copy, copy feeds selection, selection feeds
the build. Model tiering helped at the margin. The only real lever on wall-clock is **fewer dispatches**,
which means merging roles, which is a quality trade — so it is offered as a choice rather than imposed.

## [2.8.1] — 2026-09-08

### Changed
- **Docs updated to what five live runs actually established.** The README claimed nothing had gone
  end-to-end; run 5 completed the chain and the designer built 8 nodes in Figma with geometry verified
  by pixel measurement. That is now stated, alongside what remains unproven: **no creative has passed a
  gate**, the quality-officer and financial-controller have never been dispatched, no marker or ledger
  row exists, and nothing has been run against a real brand.
- `examples/first-live-run.md` now records all five runs as a table — four refusals, each exposing a
  different defect, then the completed build. Run 4 is called out specifically: the chain had halted and
  a PNG appeared anyway, rendered locally by an agent with no business building. A creative made outside
  the design tool is invisible to the gate, the build log and the ledger.

## [2.8.0] — 2026-09-08

The fifth live run completed the chain and built in Figma. Reviewing what it built exposed four defects —
three in the work, one in the order of the work.

### Fixed
- **The chain ran copy before concept.** The copywriter was writing lines before anyone had decided what
  the idea was, so it defaulted to specifications — "Up to 65 km of range." is a data point, not a hook.
  The creative director now runs **first** and the copy is written to the concept. Same dispatch count,
  better output. Eval **U45**.
- **The copywriter had no hook craft** — rhythm, the turn, concreteness, but nothing about earning the
  next second. Added, with the test: read only your first three words; would a stranger stop? Numbers go
  in the accent line, the primary text or the disclaimer — never in the position that has to stop someone.
- **The CTA was set as bare text.** A CTA is a button, not a sentence. If the accent colour is already
  spent on a product detail, change the fill — ink, outline, reversed — but never drop the shape. A
  viewer who perceives no affordance perceives no offer. Eval **U46**, and the art-director now checks it.
- **"Composed emptiness" was being used to excuse dead space.** It is composed only when bounded by
  content on two sides and doing work. Hard cap: **no single empty region above ~20% of canvas.** Eval
  **U47**.

### Changed — speed
- **The art-director verify pass is now conditional.** The designer self-verifies by pixel measurement;
  when it returns DONE with no conflict and no reservations, a second full pass costs ~7 minutes to
  confirm what was already measured. The gate is the real review. Roughly 25-35 min per chain drops to
  ~20 on clean builds, without removing a role — the saving is in *when* they run, not *whether*.

### Added
- Eval **U48** — a font confirmed installed on the build machine and absent from the environment that
  renders. Figma's font environment is separate from the OS; "verified installed" means nothing unless
  verified where it renders.

## [2.7.0] — 2026-09-08

The fourth live run produced the first artwork this system has ever made — and **the copywriter made
it.** It wrote Python, rendered a 1440x1800 PNG to a local directory, and reported the build in a field
meant for a copy deck. The designer never ran. The art director still returned ASK-CLIENT, so the chain
had officially halted before the file existed.

### Fixed
- **Role separation was prose, not policy.** All seven agents had unrestricted tools; the boundaries
  lived only in the briefs, and a brief does not bind. Every non-designer role now carries a `tools:`
  restriction and **none of them can Write or Edit**. The designer is the only role that may produce an
  artifact.
- Bash goes only to the roles whose work is genuinely computational — art-director, design-analyst,
  financial-controller — with explicit brief language that it is **for measuring, not making**, and that
  analysis files belong in scratch while the creative belongs in the design tool.
- `validate.sh` now **fails** if any non-designer role holds a write tool, or has no restriction at all.

### Why it matters beyond one bug
A creative built outside the design tool is invisible to the gate, the build log and the ledger. The
`PostToolUse` hook watches design-tool writes; a PNG rendered by PIL leaves no trace. So this was not
just a role violation — it was a route around every safeguard in the system, taken by an agent that was
only trying to be helpful.

### Added
- Eval **U44**.

## [2.6.0] — 2026-09-08

### Added
- **Per-role model and effort tiering across all three workflows** — 16 dispatches, previously all at
  one tier. Measured cost before this: 120–200k tokens per role. Judgement and visual forensics keep the
  top tier (creative-director, art-director, quality-officer at high effort); execution and writing sit
  at medium; **design-analyst drops to sonnet at low effort** (reading node properties and comparing
  them to tokens) and **financial-controller to haiku** (arithmetic over a CSV).
- The financial-controller now **audits the tiering itself** against the ledger: a high-effort role
  producing no blockers in two audits drops a tier; a low-effort role whose findings get overturned
  rises one; a role whose cost is dominated by tool calls is a scoping problem, not a tier problem.
- `workflows/README.md` documents the cost and speed picture honestly, including that **the production
  chain is sequential by design and cannot be parallelised** — only the gate fans out, which is why
  gating four creatives costs roughly the wall-clock of gating one.

## [2.5.0] — 2026-09-08

Three clean orchestration runs. Three refusals. Zero artwork. The orchestration was working; the team's
disposition was not.

### Fixed
- **Every escape hatch pointed at "stop".** `ASK-CLIENT`, `NO-VIABLE-ASSET`, `HOLD`, `BLOCKER` — and
  nothing that said *build the best you can with what is here and mark what is compromised.* An art
  director does not halt a job because the shot is imperfect; they pick the best available, build it,
  and write "needs a better hero before this ships." The work happens and the caveat travels with it.
- **`SELECTED-WITH-RESERVATIONS`** is now the art-director's default outcome for a usable-but-imperfect
  asset. The chain proceeds, `reservations` are carried into the build prompt and out in the result, and
  they reach the gate as known issues rather than blocking the job before it starts.
- **"Deliver, then object"** added to all four making roles. Refusal is reserved for work that would be
  harmful, illegal, off-brand beyond repair, or actively misleading. *"Weaker than I would like"* is a
  reservation, not a refusal. And when a role does have to stop, it stops **once** and says everything —
  a client asked three separate times for three separate things has been failed three times.
- **`HOLD` narrowed for the creative director.** If no asset proves the claim, first ask whether a
  different claim is provable with what exists — changing the idea to fit the inventory is direction,
  not compromise.

### Added
- Eval **U43** — asked for an ad, the team returns a requirements document.

## [2.4.1] — 2026-09-08

### Changed
- **"GF" now decodes.** The name opened with an unexplained initialism, which to a stranger is noise —
  unsearchable and unmemorable. It is **Growth Fabric**, and the README, the plugin manifest, the
  marketplace manifest and the GitHub description now all say so.

## [2.4.0] — 2026-09-08

### Changed
- **README rewritten: 270 lines to 122, 2,121 words to 953.** It was a manual where it needed to be a
  pitch — twenty sections, with the roles not appearing until line 157 and setup front-loaded for people
  who had not decided to install yet. Everything cut already lived in `docs/THE-TEAM.md`,
  `docs/METHOD.md`, `QUICKSTART` or `CONTRIBUTING`; nothing was lost.
- **Verbatim agent output moved to the top.** The strongest evidence this repo has was invisible: an art
  director proving two assets were 99.91% identical by pixel count, rejecting a layer name with "an
  assertion is not a citation", a design analyst disproving another agent's self-report with font
  metrics, and a creative director striking its own directive as structurally impossible. Five quotes,
  unprompted, from a live run. That is what distinguishes seven roles from one persona prompt.
- **The honesty reframed from caveat to record.** "Nothing has shipped end to end" read as a warning.
  "Twelve of forty-two cases are failures our own gates missed, and eleven more were found by running
  it" reads as discipline. Same facts, and the unproven parts are still stated plainly.

## [2.3.2] — 2026-09-08

### Fixed
- **CHANGELOG entries were newest-last.** A visitor opening the file saw v1.0.0 at the top and had to
  scroll to the bottom for the current release. Reordered newest-first per Keep a Changelog, and
  `validate.sh` now fails if the top entry does not match `plugin.json` — so it cannot drift again.
- **The GitHub repo description still carried the pre-2.0 positioning** ("seven-role creative production
  and review team"), from before the team could actually build anything. Updated to match the product.

## [2.3.1] — 2026-09-08

### Fixed
- **The README's diagram was a schematic dressed as a finished ad, and read as a bad one.** Oversized
  CTA, no scale contrast, legal text jammed against the button, system UI font at wireframe sizes —
  every fault the craft rules in `agents/designer.md` exist to prevent, in the README of a repo about
  craft. Rebuilt as an honest geometry diagram: creative elements are plain blocks, the reserve is drawn
  to scale, and nothing pretends to be a layout.
- Captions in `README.md`, `examples/worked-gate-run.md` and `examples/images/README.md` updated to
  describe it as a diagram rather than a before/after of a creative.

### Added
- Eval **U42** — a schematic dressed as finished work gets judged on craft instead of read for its
  point. Make the fidelity match the intent.

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

## [2.0.2] — 2026-09-08

### Fixed
- **The install instructions did not work in a terminal.** The README showed `/plugin marketplace add …`
  in a ```bash fence — but those are in-Claude slash commands, so anyone pasting them into a shell got
  `command not found`. Both README and Quickstart now give the real terminal commands
  (`claude plugin marketplace add …`), the slash-command alternative clearly labelled as in-Claude only,
  a `claude plugin list` verification step, and the Figma MCP requirement stated at install time rather
  than further down the page.

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
