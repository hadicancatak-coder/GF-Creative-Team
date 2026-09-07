# Workflows

Two deterministic orchestrations. Both are plain JavaScript run by the Workflow tool — the engine
dispatches, applies decisions, and consolidates. It never judges, selects, or places pixels.

## `creative-gate.js`
The Creative Director writes a schema-enforced dispatch plan; role agents gate in parallel groups in
order; the engine consolidates into SHIP / FIX-THEN-REGATE / BLOCK.

```
targets   [{ id, name, note }]   what to gate
context   string                 campaign context for the CD
location  string (optional)      where the targets live — "Figma file <KEY>", "./renders/", a URL
```

**It refuses to report SHIP on missing results.** If agents stall, the verdict is `PARTIAL` or
`INCOMPLETE`, never success. Absence of findings is not absence of defects (eval U14).

## `build-verify-loop.js`
The autonomous task chain: AD selects from the full inventory → Designer builds → AD verifies →
at most one fix round → PASS or ESCALATE.

```
task           string  the directive, in one paragraph
inventoryPath  string  folder or catalog the AD must audit IN FULL
selectionSpec  string  what makes a good pick: subject, legibility, compliance limits
target         string  where the build lands (node id, slot, path) and its dimensions
constraints    string (optional)
```

Agents hand off via schema-checked outputs. **Keep the ESCALATE clause when you adapt the prompts** —
when the chain is blocked, escalating is the only legal move. Invention never is.

## Adapting them
Both take their domain facts from arguments and from the active client profile, so neither should need
editing per engagement. If you find yourself hardcoding a file key, a node id, or an absolute path into
these files, that fact belongs in `clients/<name>/` or in the call arguments instead.
