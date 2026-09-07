---
platform: Meta (Facebook + Instagram)
verified: 2026-09-07
review_by: 2026-12-07
locale_read: ar (pages geo-rendered; figures are language-independent)
sources:
  - https://www.facebook.com/business/ads-guide/update/image
  - https://www.facebook.com/business/ads-guide/update/image/instagram-reels
  - https://www.facebook.com/business/ads-guide/update/image/instagram-story
  - https://www.facebook.com/business/help/980593475366490/
---

# Meta — image ad specs

## Placements

| Placement | Ratio | Tolerance | Recommended px | Minimum px | Format | Max file |
|---|---|---|---|---|---|---|
| Facebook Feed | 4:5 | 3% | 1440 × 1800 | 600 × 750 | JPG, PNG | 30 MB |
| Instagram Reels | 9:16 | 1% | 1440 × 2560 | width ≥ 500 | JPG, PNG | 30 MB |
| Instagram Stories | 9:16 | 1% | 1440 × 2560 | width ≥ 500 | JPG, PNG | 30 MB |

**Build 4:5 for feed, not 1:1.** Meta's own recommended feed resolution is 4:5. A 1:1 master is legal
but forfeits vertical screen area in the placement that carries most feed impressions.

## Safe zone — Stories and Reels

Keep text, logos and key creative elements out of:

| Edge | Reserve |
|---|---|
| Top | ~14% |
| Bottom | ~35% |
| Each side | ~6% |

Bottom is the big one: the CTA button and profile chrome sit there. **On a 1440 × 2560 asset that is
roughly 358px at the top and 896px at the bottom.** A legal line or CTA pinned to the bottom edge — the
default position in most ad templates — lands underneath Meta's own UI.

This is the single most common spec defect in vertical creative, and it is eval U25.

## Character limits

| Surface | Limit |
|---|---|
| Facebook Feed — primary text | 50–150 recommended |
| Facebook Feed — headline | 27 |
| Instagram Stories — primary text | 125 |
| Instagram Reels — primary text | 44 |

**Reels truncates at 44 characters** — roughly a third of what Stories allows. Copy written once for
"vertical" and reused across both will be cut in Reels.

## Gaps — not verified

- Video ad specs (duration, bitrate, captions) — `TBD — unverified`
- Carousel and Collection specs — `TBD — unverified`
- Description field limits per placement — `TBD — unverified`
- Audience Network and Messenger placements — `TBD — unverified`
