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
  - https://support.google.com/google-ads/answer/17090561  (responsive display specs)
  - https://support.google.com/google-ads/answer/1722096   (uploaded display ad sizes)
  - https://support.google.com/google-ads/answer/17091672  (Demand Gen specs)
  - https://support.google.com/google-ads/answer/9234183   (App campaign assets)
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

| Text asset | Limit | Count | Required |
|---|---|---|---|
| Headline | 30 | 1–5 | yes |
| Long headline | 90 | 1 | yes |
| Description | 90 | 1–5 | yes |
| Business name | 25 | 1 | yes |

| Image asset | Ratio | Recommended | Minimum | Count | Required |
|---|---|---|---|---|---|
| Horizontal | 1.91:1 | 1200 × 628 | 600 × 314 | 1–15 (5 rec.) | yes |
| Square | 1:1 | 600 × 600 | 300 × 300 | 1–15 (5 rec.) | yes |
| Logo square | 1:1 | 1200 × 1200 | 128 × 128 | 1–5 | no |
| Logo landscape | 4:1 | 1200 × 300 | 512 × 128 | 1–5 | no |

Video optional: 16:9, 1:1 and 2:3, ~30 seconds, 1–5 per ratio.
Google publishes no max file size on this page — the image asset policy's 5120 KB governs the uploads.

## Demand Gen

| Text asset | Limit | Count |
|---|---|---|
| Headline | 40 — **at least one must be ≤ 30** | 1–5 (5 rec.) |
| Description | 90 | 1–5 (3 rec.) |
| Business name | 25 | 1 |
| Final URL | 2,048 | 1 |

| Image asset | Ratio | Recommended | Minimum | Count |
|---|---|---|---|---|
| Horizontal | 1.91:1 | 1200 × 628 | 600 × 314 | 1–20 (3 rec.) |
| Square | 1:1 | 1200 × 1200 | 300 × 300 | 1–20 (3 rec.) |
| Vertical | 4:5 | 960 × 1200 | 480 × 600 | 1–20 (optional) |
| Logo | 1:1 | 1200 × 1200 | 144 × 144 | 1–5 |

**Demand Gen headlines run to 40, PMax and RSA stop at 30** — and at least one Demand Gen headline must
still be ≤ 30. Three campaign types, three headline rules.

## App campaigns

| Asset | Limit |
|---|---|
| Headline | 30 |
| Description | 90, up to 5 |
| Images | JPG or PNG, max 5 MB |
| Video | **must be hosted on YouTube**; landscape, portrait or square |

Character limits are identical across languages, but **double-width characters (Chinese, Japanese,
Korean) count as two.** A 30-character headline is 15 CJK glyphs. Localized copy decks must be counted
in the target script, not translated and hoped for.

If you supply no video, Google may generate one from your other assets and your app store listing —
which means an auto-assembled creative can serve under your brand without passing any gate you run.

## Uploaded display ads (fixed sizes)

Formats **GIF, JPG, PNG**. **Maximum 150 KB** — not 5 MB. Animation ≤ 30 seconds and slower than 5 FPS.

| Group | Sizes |
|---|---|
| Square & rectangle | 200×200 · 240×400 · 250×250 · 250×360 · 300×250 · 336×280 · 580×400 |
| Skyscraper | 120×600 · 160×600 · 300×600 · 300×1050 |
| Leaderboard | 468×60 · 728×90 · 930×180 · 970×90 · 970×250 · 980×120 |
| Mobile | 300×50 · 320×50 · 320×100 |

That 150 KB ceiling is the one that breaks builds. A 970 × 250 banner has roughly 242,500 pixels to
express in 150 KB — photography usually has to become flat colour or the ad is rejected.

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

- Demand Gen max file sizes — Google publishes none on the specs page; the image asset policy's
  5120 KB is the governing figure
