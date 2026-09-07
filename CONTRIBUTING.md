# Contributing

## The most valuable contribution

**A failure this team did not catch.**

Not a feature request, not a new role — a case where a gate passed something a human then rejected.
That is the raw material this repo is made of, and it is the one thing that cannot be invented.

Open an issue with:

1. **The case input** — what the agent was given, with no hint about what was wrong.
2. **What should have been caught**, and which of the seven roles owns that failure class.
3. **Who caught it instead** — a human, a client, a platform review, a legal check.
4. **What it cost** — a revision round, a client rejection, a re-shoot. Rough is fine; the number is
   context, not a claim.

Sanitize it. Change the brand, the figures and the copy — the *failure class* is what transfers, and it
survives being anonymized. Never open an issue containing a real client's compliance text, unpublished
figures, or asset IDs.

## The loop

Every accepted failure becomes two things, in the same change:

1. a rule in the responsible agent's brief, and
2. a row in `evals/universal-cases.md` naming the agent that must catch it unhinted.

A rule without an eval case is a suggestion. An eval case without a rule is a known bug.

## Editing a role brief

Briefs are short on purpose — a brief nobody finishes reading is not enforced. Before adding to one:

- **Does it belong in `agents/` at all?** If it is only true for one engagement, it belongs in
  `clients/<name>/`. No client fact belongs in a role brief. This is the rule most likely to be broken.
- **Which failure class is it?** If it does not have one, it is a preference, not a rule.
- **Does it collide with a ranked law?** If so, say where it sits in the ranking.
- **Re-run the evals afterwards.** A brief edit that makes a previously-passing case fail is a
  regression. Note it in the PR.

## Adding a role

Hard bar, deliberately. A new role needs a failure class that no existing role owns, and at least one
real case that the current seven demonstrably missed. "It would be useful to also have…" is not enough —
every extra role costs a dispatch on every run, and the Financial Controller will eventually recommend
merging any gate that produces zero blockers or majors two audits running.

## Workflows and hooks

- Keep the ESCALATE clause in any chain you adapt. When blocked, escalating is the only legal move.
- Never let a workflow report success on missing or stalled results (eval U14).
- Domain facts belong in arguments or the client profile — if you are hardcoding a file key, node ID or
  absolute path into `workflows/`, that is the bug.

## Style

Markdown, wrapped around 100 characters. Plain language. Tables where the content is tabular.
No emoji in briefs — they cost tokens on every dispatch and add nothing an agent reads.

## Before you open a PR

- [ ] `node --check` passes on any changed workflow
- [ ] `sh -n` passes on any changed hook
- [ ] JSON manifests parse
- [ ] No absolute paths, real client names, or design-file keys anywhere in the diff
- [ ] Evals re-run if you touched a brief, with regressions noted
