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
