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

## Reinstall before you test

**Editing this repo does not change what runs.** Workflows and agents execute from the installed copy in
the plugin cache, not from your working tree. After any change:

```bash
claude plugin marketplace update gf-creative-team
claude plugin install gf-creative-team@gf-creative-team
claude plugin list          # confirm the version matches plugin.json
```

Skipping this produces the worst kind of test result: a run that appears to exercise your change,
succeeds or fails for unrelated reasons, and gives you a confident wrong conclusion. Three versions of
performance work in this repo were measured against an installed copy four versions behind. Eval U51.

## Before you open a PR

Run the validator. CI runs the same script, so this is the whole gate:

```bash
./scripts/validate.sh
```

It checks workflow and hook syntax, executable bits, JSON manifests, the plugin manifest via
`claude plugin validate`, frontmatter on every agent/command/skill, that no workflow references an agent
that does not exist, that every knowledge file carries its frontmatter and cites sources, that README
counts match the eval table, that internal links resolve, that no absolute path leaked, and that no doc
tells a user to write into the plugin directory.

Then, by hand:

- [ ] Evals re-run if you touched a brief, with any regressions noted in the PR
- [ ] No real client names, compliance text, or design-file keys in the diff

## Why CI fails on a green codebase

The validator **fails when a knowledge file's `review_by` date has passed**, and a weekly scheduled run
means it will eventually fail on its own with no code change at all. That is the feature, not a bug — it
is eval U27 enforced by the harness. Ad platforms change specs without notice, and a confidently-stated
stale number is worse than no number because it gets built against.

When it fires: open the file's `sources`, re-verify each figure, correct what changed, mark what vanished
`TBD — unverified`, and bump `verified` and `review_by`. Do not bump the dates without re-reading the
sources — that converts an honest expiry into a false claim of freshness.
