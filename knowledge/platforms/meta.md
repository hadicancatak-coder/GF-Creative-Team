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
  - https://www.facebook.com/business/ads-guide/update/video
  - https://www.facebook.com/business/ads-guide/update/carousel
  - https://www.facebook.com/business/ads-guide/update/collection
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

## Video — Facebook Feed

| Property | Value |
|---|---|
| Ratio | 4:5 |
| Resolution | ≥ 1440 × 1800; absolute minimum 120 × 120 |
| Formats | MP4, MOV, GIF |
| Max file | 4 GB |
| Duration | 1 second – 241 minutes |
| Encoding | H.264, square pixels, constant frame rate, progressive scan; stereo AAC ≥ 128 kbps |
| Primary text | 50–150 recommended |
| Headline | 27 |

**The ad footer disappears on mobile.** For awareness objectives — and when optimizing for reach, video
views, impressions or engagement — the headline, description and CTA button do **not** render in the
mobile Facebook feed. Anything load-bearing must be inside the video frame, not in the footer fields.

## Carousel

| Property | Value |
|---|---|
| Cards | 2 – 10 |
| Image resolution | ≥ 1080 × 1080 |
| Ratio | 1:1, 3% tolerance |
| Image formats / max | JPG, PNG / 30 MB per card |
| Video formats / max | MP4, MOV, GIF / 4 GB, 1s – 240 min |

| Text per card | Limit |
|---|---|
| Primary text | 80 |
| Headline | 20 |
| Description | 18 |

**Carousel copy is far tighter than single-image copy** — 80/20/18 against 150/27. A headline written for
a single image will not survive being reused on a carousel card.

## Collection

| Property | Value |
|---|---|
| Cover image / video | ≥ 1080 × 1080, ratio 1.91:1 to 1:1 |
| Image formats / max | JPG, PNG / 30 MB |
| Video formats / max | MP4, MOV, GIF / 4 GB |
| Structure | cover asset + 3 product images |
| Primary text | 125 |
| Headline | 40 |

An **Instant Experience page is mandatory** for Collection. It is not a creative you can hand over as
four flat files.

## Text limits differ per format — check before writing

| Format | Primary text | Headline | Description |
|---|---|---|---|
| Single image / video, Feed | 50–150 rec. | 27 | — |
| Stories | 125 | — | — |
| Reels | 44 | — | — |
| Carousel (per card) | 80 | 20 | 18 |
| Collection | 125 | 40 | — |

Five Meta surfaces, five different limits. A headline written for Feed at 27 characters overruns
Carousel's 20; copy written for Stories at 125 is cut to 44 in Reels. This table is the reason the
content-creator runs before design, not after.

## Gaps — not verified

- Audience Network and Messenger placement differences — `TBD — unverified`
- Description field for single-image Feed — Meta does not publish one for this placement
