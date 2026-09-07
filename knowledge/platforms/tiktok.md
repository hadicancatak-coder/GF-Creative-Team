---
platform: TikTok
verified: 2026-09-07
review_by: 2026-12-07
sources:
  - https://ads.tiktok.com/help/article/tiktok-auction-in-feed-ads
  - https://ads.tiktok.com/help/article/image-ads-specification
---

# TikTok — in-feed ad specs

## Video (non-Spark auction in-feed)

| Ratio | Minimum resolution |
|---|---|
| 9:16 — **recommended** | ≥ 540 × 960 |
| 16:9 | ≥ 960 × 540 |
| 1:1 | ≥ 640 × 640 |

| Property | Value |
|---|---|
| Formats | .mp4, .mov, .mpeg, .3gp, .avi |
| Max file size | 500 MB |
| Minimum bitrate | 516 kbps |
| Duration | up to 10 minutes |

**Spark Ads** (promoting an organic post) inherit the source video's format and have no duration
restriction. Captions are extracted from the organic post — a maximum of 4 lines — and cannot be
rewritten in the ad.

## Profile image

| Property | Value |
|---|---|
| Dimensions | 98 × 98 px, 1:1 |
| Safe area | centre **66 × 66 px** |
| Formats | .jpg, .jpeg, .png |
| Max file size | 50 KB |

Keep the identifying element inside the centre 66 × 66 or it will be cropped.

## Ad captions

Captions render in white, in a fixed font that cannot be customized. **No clickable links, no `@`
mentions, no hashtags.** Keep captions within roughly 100 characters (50 for CN/JP/KR) or the tail is
hidden behind "See more".

Account name: 20 characters, or 10 for Chinese, Japanese and Korean.

## Image ads

| Ratio | Minimum resolution |
|---|---|
| 9:16 — **recommended** | ≥ 720 × 1280 |
| 16:9 | ≥ 1280 × 720 |
| 1:1 | ≥ 640 × 640 |

| Property | Value |
|---|---|
| Formats | JPG, JPEG, PNG |
| Max file | 100 MB |
| Ad description | 1–100 Latin characters (1–50 Asian) |
| App name | 4–40 Latin (2–20 Asian) |
| Brand name | 2–20 Latin (1–10 Asian) |

**Character rules that reject uploads:** no emoji in app or brand names; descriptions cannot contain
emoji or the characters `{`, `}`, `#`. Punctuation and spaces count toward the totals.

## ⚠️ The safe zone is not a fixed number

TikTok does **not** publish a single safe-zone measurement. Per their own documentation the safe area
"is determined by the dimension, the ad caption length and any interactive add-on usage — the longer the
caption, the smaller the safe zone."

**Consequence for review:** you cannot check a TikTok creative against a percentage the way you can with
Meta. The check is procedural instead:

1. Download TikTok's own safe-zone template files for the exact format being built.
2. Verify against the template for the **actual** caption length and add-ons in use, not a generic one.
3. A longer caption shrinks the safe zone — so a copy change after the design is approved invalidates
   the previous safe-zone check and requires a re-gate.

Point 3 is the trap: on TikTok, editing copy is a design change.

## Gaps — not verified

- Exact safe-zone template dimensions per format — TikTok ships these as downloadable files, not as
  published figures. Not transcribable.
- TopView, Branded Effect and reservation formats — `TBD — unverified`
- Carousel specs — `TBD — unverified`
