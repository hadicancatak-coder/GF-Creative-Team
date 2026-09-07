---
platform: Google Ads
verified: 2026-09-07
review_by: 2026-12-07
sources:
  - https://developers.google.com/google-ads/api/performance-max/asset-requirements
  - https://support.google.com/google-ads/answer/13676244
  - https://support.google.com/google-ads/answer/7684791   (responsive search ads)
  - https://support.google.com/google-ads/answer/9050310   (responsive display ads)
  - https://support.google.com/adspolicy/answer/10347108   (image asset policy)
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

## Responsive Search Ads

| Asset | Char limit | Min | Max |
|---|---|---|---|
| Headline | 30 | 3 | 15 |
| Description | 90 | 2 | **4** |
| Display path | 15 each | — | 2 |

Note the difference from Performance Max: RSA allows **4** descriptions, PMax **5**. Copy decks are not
interchangeable between the two.

**Pinning:** assets pinned to headline 1, headline 2 or description 1 always show. Positions 3 and
description 2 are not guaranteed. Google's own guidance is that pinning "is not recommended for most
advertisers" — it shrinks the match pool and lowers Ad Strength.

## Responsive Display Ads

| Asset | Limit |
|---|---|
| Marketing images | up to 15 |
| Logos | up to 5 — supply **both** 1:1 and 4:1 |
| Short headline | up to 5, 30 characters each |
| Long headline | 1, 90 characters |
| Description | up to 5, 90 characters each |

Google's help page does not publish pixel dimensions or file ceilings for RDA specifically; use the image
asset policy figures below, which govern the same uploads.

## Image asset policy (governs uploads across campaign types)

| Ratio | Status | Minimum | Recommended |
|---|---|---|---|
| 1:1 square | **Required** | 300 × 300 | 1200 × 1200 |
| 1.91:1 landscape | Optional, recommended | 600 × 314 | 1200 × 628 |

Formats **PNG, JPG**. Max **5120 KB**.

### Google's safe zone
> "Place the most important content in the center 80% of the image."

Google crops images per surface. That centre-80% rule is the Google equivalent of Meta's percentage safe
zone — a logo or claim in the outer 10% on any edge is at risk. It is looser than Meta's, and differently
shaped: Meta reserves top and bottom asymmetrically for UI chrome; Google trims all four edges for
placement fitting.

## Gaps — not verified

Google publishes several spec sheets **as images with no text equivalent**, so these could not be
extracted from the source and are deliberately not transcribed from memory:

- Demand Gen asset specs — `TBD — unverified`
- App campaign asset specs — `TBD — unverified`
- Fixed-size Display banner inventory (300×250, 728×90 etc.) — `TBD — unverified`
- Responsive Display pixel dimensions specific to RDA — Google publishes none separately
