# Quickstart

## 1. Install

From your terminal:

```bash
claude plugin marketplace add hadicancatak-coder/GF-Creative-Team
claude plugin install gf-creative-team@gf-creative-team
```

Or, **inside Claude Code**, as slash commands (these do not work in a shell):
`/plugin marketplace add hadicancatak-coder/GF-Creative-Team` then `/plugin install gf-creative-team`.

Working on the plugin itself? Point it at a local directory:
`claude plugin marketplace add /path/to/GF-Creative-Team`

Verify with `claude plugin list` — you want `gf-creative-team@gf-creative-team` · enabled. Restart
Claude Code, then `/help` should list all five `/gf-creative-team:*` commands and the seven agents
should appear in your agent list.

**Figma MCP** must be connected for anything that builds artwork. Review roles work on screenshots
from any source; the `designer` role does not.

## 2. Create a client profile (optional — see "Running without a profile" below)

```
/gf-creative-team:new-client Northwind Cycles
```

This scaffolds the profile **in your working project**, not in the plugin:

```
.creative-team/
├── active                  # one line: the live profile name
└── clients/northwind/
    ├── client.md
    ├── compliance.md
    └── evals.md
```

It sits next to `.gates/`, and it survives `/plugin update`. Read
`clients/example-northwind-cycles/` in the plugin first — it shows the level of specificity that
actually works. Vague profiles produce vague gates.

`/use-client <name>` switches profiles; with no argument it reports which is live.

**Nothing about a client belongs in `agents/`.** If you are editing a role brief with a fact that is only
true for one engagement, it goes in the profile.

## 3. Work out what to build

Before any design work:

```
/gf-creative-team:format-matrix Meta and Google, UK + DE, spring campaign
```

You get the exact asset list — ratios, pixel dimensions, safe zones, character limits, and which assets
are reusable across platforms. Building the wrong sizes is the cheapest mistake to prevent and the most
expensive to find late.

The specs come from `knowledge/platforms/`, traced to each platform's own documentation and dated. If a
file's `review_by` has passed, the command tells you before it tells you anything else.

## 4. Make an ad

```
/gf-creative-team:create-ad Spring promo for the Drift commuter e-bike, UK + DE, Meta Feed + Stories
```

Two facts: what the ad is for, and which platforms. The master size comes from the platform spec, and
if you pass no asset folder you get a type-only build rather than an invented hero — every default taken
is reported back, not applied silently.

**One process, and the gate is inside it.** Concept → copy → asset → build → gate → verdict:
`art-director`, `design-analyst` and `content-creator` review in parallel, then the `quality-officer`
gates final state alone, with up to two fix rounds. Nothing it hands you is ungated, so there is no
second command to remember.

Pass `inventoryPath` when you have assets and `destination` when you have a Figma file in mind;
otherwise the designer creates one and returns the key.

## 5. Gate something you already built

For creative this chain did not produce — built by hand, built before you installed this, or inherited:

```
/gf-creative-team:creative-gate the four 1080x1350 masters in the Spring campaign
```

Same four reviewers, same code, consolidated **SHIP / COMP-APPROVED / UNVERIFIED / FIX-THEN-REGATE /
BLOCK**. Findings come back with severity, location and an exact fix.

For a deterministic run where every dispatch lands in the ledger, call `workflows/creative-gate.js`
through the Workflow tool.

## 6. Turn on enforcement (optional but the point)

The bundled hooks do two things:
- log every design-tool write to `.gates/builds.log`
- **block ending a session** if builds ran today with no gate marker in `.gates/`

The Stop hook has a human waiver hatch: write `.gates/<date>-skipped.md` naming who waived it and why.

The PostToolUse matcher in `hooks/hooks.json` targets the Figma MCP write tools by default. Using a
different design tool? Widen or replace that regex — it is the only tool-specific line in the repo.

## 7. Run the checks

Two layers, and they answer different questions.

```bash
./scripts/validate.sh      # the repo gate — manifests, role boundaries, spec freshness, links
node scripts/dry-run.mjs   # the orchestration — who gets dispatched, in what order, what comes out
```

`dry-run.mjs` stubs the workflow engine and asserts on the routing: the clean run is exactly eight
dispatches with no role doing two jobs, nothing runs after the quality-officer, a stalled reviewer
yields `PARTIAL` rather than a pass, an unfixable finding exhausts exactly two rounds, a contested
finding never reaches the designer. No tokens, no Figma, and CI runs it on every push.
`validate.sh` runs it too, so one command covers both.

Then the part no harness can do: `evals/universal-cases.md` holds 57 domain-agnostic failure classes with
their outcomes recorded. Give an agent a case input with **no hint**, and check whether it raises the
expected catch. Do this after any brief edit — a case that used to pass and now fails is a regression.

## Running without a profile

You do not need one to start. With no profile the gate runs in **reduced scope** — platform specs and
the universal failure classes — and names exactly which checks it skipped. The quality-officer returns
`UNVERIFIED` rather than `SHIP`.

That is a real first run: install, gate something you already built, get genuine platform findings, then
decide whether a profile is worth writing.

## What you need

- Claude Code with the Agent and Workflow tools
- A design tool your agents can read and write — the Figma MCP is what this was built against. The
  review roles (CD, AD, DA, QO, CC) work on rendered screenshots from any source; only the `designer`
  role and the build hooks assume a writable design tool.
