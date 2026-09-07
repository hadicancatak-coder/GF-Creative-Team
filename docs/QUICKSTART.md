# Quickstart

## 1. Install

```bash
/plugin marketplace add hadicancatak-coder/GF-Creative-Team
/plugin install gf-creative-team
```

Or clone it and point Claude Code at the directory as a local marketplace.

Verify: `/help` should list `/gf-creative-team:creative-gate` and `/gf-creative-team:new-client`,
and the seven agents should appear in your agent list.

## 2. Create a client profile

```
/gf-creative-team:new-client Northwind Cycles
```

This scaffolds `clients/<name>/` from `clients/TEMPLATE/` and interviews you for what it needs.
Read `clients/example-northwind-cycles/` first — it shows the level of specificity that actually works.
Vague profiles produce vague gates.

**Nothing about a client belongs in `agents/`.** If you are editing a role brief with a fact that is only
true for one engagement, it goes in the profile.

## 3. Gate something

After any build round:

```
/gf-creative-team:creative-gate the four 1080x1080 masters in the Spring campaign
```

The Creative Director writes a dispatch plan, the role agents review in parallel, and you get a
consolidated **SHIP / FIX-THEN-REGATE / BLOCK**. Findings come back with severity, location and an exact fix.

For a deterministic run with a schema-checked plan, call `workflows/creative-gate.js` through the
Workflow tool instead.

## 4. Turn on enforcement (optional but the point)

The bundled hooks do two things:
- log every design-tool write to `.gates/builds.log`
- **block ending a session** if builds ran today with no gate marker in `.gates/`

The Stop hook has a human waiver hatch: write `.gates/<date>-skipped.md` naming who waived it and why.

The PostToolUse matcher in `hooks/hooks.json` targets the Figma MCP write tools by default. Using a
different design tool? Widen or replace that regex — it is the only tool-specific line in the repo.

## 5. Run the evals

`evals/universal-cases.md` holds 23 domain-agnostic failure classes. Give an agent a case input with
**no hint**, and check whether it raises the expected catch. Do this after any brief edit.

## What you need

- Claude Code with the Agent and Workflow tools
- A design tool your agents can read and write — the Figma MCP is what this was built against. The
  review roles (CD, AD, DA, QO, CC) work on rendered screenshots from any source; only the `designer`
  role and the build hooks assume a writable design tool.
