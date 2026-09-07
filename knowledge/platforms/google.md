---
platform: Google Ads
verified: 2026-09-07
review_by: 2026-12-07
sources:
  - https://developers.google.com/google-ads/api/performance-max/asset-requirements
  - https://support.google.com/google-ads/answer/13676244
---

# Google Ads — asset specs

The Performance Max table below comes from the Google Ads API reference, which publishes exact
min/max counts per asset group. It is the most precise creative spec Google publishes anywhere.

## Performance Max — text assets

| Asset | Char limit | Min per group | Max per group |
|---|---|---|---|
| Headline | 30 | 3 | 15 |
| Long headline | 90 | 1 | 5 |
| Description | 90 | 2 | 5 |
| Business name | 25 | 1 | 1 |

**The minimums are hard requirements, not suggestions.** An asset group with two headlines will not
serve. Copy decks for PMax must therefore be written to a count, not to a concept — three headlines
minimum, fifteen maximum, all within 30 characters.

## Performance Max — image assets

| Asset | Ratio | Recommended px | Minimum px | Max file | Min | Max |
|---|---|---|---|---|---|---|
| Marketing image | 1.91:1 | 1200 × 628 | 600 × 314 | 5120 KB | 1 | 20 |
| Square marketing image | 1:1 | 1200 × 1200 | 300 × 300 | 5120 KB | 1 | 20 |
| Portrait marketing image | 4:5 | 960 × 1200 | 480 × 600 | 5120 KB | 0 | 20 |
| Logo (square) | 1:1 | 1200 × 1200 | 128 × 128 | 5120 KB | 1 | 5 |
| Landscape logo | 4:1 | 1200 × 300 | 512 × 128 | 5120 KB | 0 | 20 |

File types: **GIF, JPG, PNG**. Max **5120 KB (5 MB)** — note this is six times tighter than Meta's 30 MB.
An export that passes Meta will often fail Google.

Portrait (4:5) is optional but is the only vertical image asset PMax accepts.

## Performance Max — video

| Asset | Requirement | Max per group |
|---|---|---|
| YouTube video | 16:9, 1:1 or 9:16; ≥ 10 seconds | 15 |
| Media bundle | < 150 KB | 1 |

Note the 150 KB media bundle ceiling — HTML5 bundles are effectively capped at a size most designers
would consider impossible without deliberate optimization.

## Most common image sizes across placements

Google's own specs page names **1200 × 628 (1.91:1)** and **1200 × 1200 (1:1)** as the two sizes used
across most placements. Build those first.

## Gaps — not verified

Google publishes several spec sheets **as images with no text equivalent**, so these could not be
extracted from the source and are deliberately not transcribed from memory:

- Responsive Display Ad sizes and limits — `TBD — unverified`
- Demand Gen asset specs — `TBD — unverified`
- Responsive Search Ad character limits — `TBD — unverified`
- App campaign asset specs — `TBD — unverified`
- Fixed-size Display banner inventory (300×250, 728×90 etc.) — `TBD — unverified`
