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

## Process and hooks

- **Two commands: `create-ad` and `review-ad`.** Do not add a third process command, and do not add a
  `depth`, `mode`, `quick` or `fast` switch — `validate.sh` fails on both. A cheap second path was tried
  twice and was the only source of a whole defect class (U56).
- **No workflow scripts.** The Art Director asks the client blocking questions mid-flight, and a workflow
  script cannot pause for a human answer. The commands are the orchestration.
- **Arithmetic goes in `scripts/check-build.mjs`, never in a role.** If a check can be written as a
  comparison between two numbers, it is not a dispatch. Add a case to its selftest for anything you add.
- Keep every escape hatch **optional in the schema**. A required field is a forced answer (U10).
- Domain facts belong in the client profile or the call arguments, never in a role brief.

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

**`./scripts/validate.sh` now checks this for you** — it compares every installed workflow, agent,
command and skill against your working tree and warns per file when they differ. It caught the repo's own
maintainer shipping 3.1.0 while running 3.0.0, three hours after writing the eval about it.

## Before you open a PR

Run the validator. CI runs the same script, so this is the whole gate:

```bash
./scripts/validate.sh
```

It checks workflow and hook syntax, executable bits, JSON manifests, the plugin manifest via
`claude plugin validate`, frontmatter on every agent/command/skill, that no workflow references an agent
that does not exist, that no speed switch has reappeared, that the shared gate block is byte-identical
across both workflows, that every knowledge file carries its frontmatter and cites sources, that README
counts match the eval table, that internal links resolve, that no absolute path leaked, and that no doc
tells a user to write into the plugin directory.

**It also runs the build checker**, which you can run on its own while iterating:

```bash
node scripts/check-build.mjs --selftest
node scripts/check-build.mjs build.json tokens.json
```

14 cases covering each check, plus a regression guard against the two real artboards this plugin built.
No tokens, no Figma, no network — so there is no excuse for an unchecked change to the rules.

Then, by hand:

- [ ] Evals re-run if you touched a brief, with any regressions noted in the PR
- [ ] A selftest case added if you changed or added a check
- [ ] No real client names, compliance text, or design-file keys in the diff

## Why CI fails on a green codebase

The validator **fails when a knowledge file's `review_by` date has passed**, and a weekly scheduled run
means it will eventually fail on its own with no code change at all. That is the feature, not a bug — it
is eval U27 enforced by the harness. Ad platforms change specs without notice, and a confidently-stated
stale number is worse than no number because it gets built against.

When it fires: open the file's `sources`, re-verify each figure, correct what changed, mark what vanished
`TBD — unverified`, and bump `verified` and `review_by`. Do not bump the dates without re-reading the
sources — that converts an honest expiry into a false claim of freshness.
