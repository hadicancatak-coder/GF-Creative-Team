# Evals

Two layers:

- **`universal-cases.md`** — failure classes that recur in ANY creative production team. Ships with the product.
- **`clients/<client>/evals.md`** — cases specific to one engagement (their brand rules, compliance, assets).

## The loop that makes a team improve

Every failure a **human** catches instead of a gate becomes, the same day:

1. a rule in the responsible agent's brief, and
2. an eval case naming the agent that must catch it unhinted.

After ANY brief edit, re-run the cases. A team you have not evaluated is a team you are hoping about.

## The metric

Track the ratio of **human-caught to gate-caught** findings. That ratio IS the team's maturity.

- Falling → the briefs are learning.
- Flat → you are adding rules that don't bind.
- Rising → a brief edit removed something load-bearing; check for regressions.

## Running them

There is no test runner here on purpose — these are judgment cases, not assertions. Give an agent the
case input verbatim, with no hint, and record whether it raised the expected catch. `claude plugin eval`
can automate the harness once you have written expectations for your own client layer.
