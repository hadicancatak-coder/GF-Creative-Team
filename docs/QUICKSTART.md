# Quickstart

## 1. Install

```bash
/plugin marketplace add hadicancatak-coder/GF-Creative-Team
/plugin install gf-creative-team
```

Or clone it and point Claude Code at the directory as a local marketplace.

Verify: `/help` should list `/gf-creative-team:creative-gate` and `/gf-creative-team:new-client`,
and the seven agents should appear in your agent list.

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

## 4. Gate something

After any build round:

```
/gf-creative-team:creative-gate the four 1080x1080 masters in the Spring campaign
```

The Creative Director writes a dispatch plan, the role agents review in parallel, and you get a
consolidated **SHIP / FIX-THEN-REGATE / BLOCK**. Findings come back with severity, location and an exact fix.

For a deterministic run with a schema-checked plan, call `workflows/creative-gate.js` through the
Workflow tool instead.

## 5. Turn on enforcement (optional but the point)

The bundled hooks do two things:
- log every design-tool write to `.gates/builds.log`
- **block ending a session** if builds ran today with no gate marker in `.gates/`

The Stop hook has a human waiver hatch: write `.gates/<date>-skipped.md` naming who waived it and why.

The PostToolUse matcher in `hooks/hooks.json` targets the Figma MCP write tools by default. Using a
different design tool? Widen or replace that regex — it is the only tool-specific line in the repo.

## 6. Run the evals

`evals/universal-cases.md` holds 32 domain-agnostic failure classes with their outcomes recorded. Give
an agent a case input with **no hint**, and check whether it raises the expected catch. Do this after any
brief edit — a case that used to pass and now fails is a regression.

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
