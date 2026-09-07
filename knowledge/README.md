# Knowledge layer

Platform specifications the review agents check creative against.

## The sourcing law

**Every figure in `platforms/` traces to the platform's own published documentation.** Not a blog, not
an agency cheat-sheet, not a model's memory. This is the repo's own eval U22 applied to itself: a
statistic from a secondary source does not go in a client deck, and a spec from a secondary source does
not go in a gate.

A figure that could not be verified is written `TBD — unverified`. It is never filled in with a
plausible number. **An unverified spec must be reported as unverified, never asserted.**

## The staleness rule

Every file carries frontmatter:

```yaml
platform: Meta (Facebook + Instagram)
verified: 2026-09-07     # the date a human or agent read the source pages
review_by: 2026-12-07    # 90 days later
sources: [ ... ]         # the exact URLs read
```

**Once `review_by` has passed, agents must flag the spec as expired rather than assert it.** Ad platforms
change specs without notice. A confidently-stated stale number is worse than no number — it gets built
against, and the error is not discovered until a platform rejects the asset or a placement crops it.

This is eval U27. It is the difference between this layer and the hundreds of undated spec gists on
GitHub that quietly rotted.

## Refreshing

1. Open every URL in the file's `sources`.
2. Correct what changed. Add what is new. Mark what disappeared as `TBD — unverified`.
3. Bump `verified` and `review_by`.
4. If a spec changed, add an eval case if the change could have shipped a defect.

Specs render differently by region — several platforms geo-localize their help pages. The figures are
language-independent, but note the locale you read from if it was not `en`.

## What is deliberately NOT here

- **Bidding, budget and targeting mechanics.** This layer is creative specs only.
- **Policy and content rules.** Those are client-specific and belong in `clients/<name>/compliance.md`.
- **Anything a platform publishes only as an image.** Google, in particular, ships several spec sheets
  as graphics with no text equivalent. Those are recorded as gaps, not transcribed from a screenshot.
