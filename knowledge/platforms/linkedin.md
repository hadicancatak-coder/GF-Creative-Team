---
platform: LinkedIn
verified: 2026-09-07
review_by: 2026-12-07
sources:
  - https://www.linkedin.com/help/lms/answer/a426534/single-image-ads-advertising-specifications
  - https://www.linkedin.com/help/lms/answer/a424737   (video ads)
  - https://www.linkedin.com/help/linkedin/answer/a427022   (carousel ads)
  - https://www.linkedin.com/help/lms/answer/a493903   (document ads)
  - https://www.linkedin.com/help/lms/answer/a425533   (message ads)
---

# LinkedIn — single image ad specs

## Image

| Ratio | Recommended px | Min px | Max px |
|---|---|---|---|
| 1.91:1 landscape | 1200 × 628 | 640 × 360 | 7680 × 4320 |
| 1:1 square | 1200 × 1200 | 360 × 360 | 4320 × 4320 |
| 4:5 vertical | 720 × 900 | 360 × 640 | 2430 × 4320 |

| Property | Value |
|---|---|
| Formats | JPG, PNG, GIF (animated GIF max 250 frames) |
| Max file size | 5 MB |
| Max dimensions | 7680 × 4320 |

**4:5 is LinkedIn's own recommendation for mobile rendering.** Older 1:1.91 vertical assets still serve
but get borders added — if a set only has landscape, it is losing mobile area.

## Character limits

| Field | Recommended | Maximum |
|---|---|---|
| Introductory text | 150 | 3,000 |
| Headline | 70 | 200 |
| Description | 100 | 300 |
| Ad name (internal) | — | 255 |

The gap between recommended and maximum matters: the recommended figure is where LinkedIn stops
truncating in-feed. Writing to the maximum produces copy that is legal and invisible.

## Video

| Ratio | Recommended | Range |
|---|---|---|
| 16:9 landscape | 1920 × 1080 or 1200 × 675 | 640 × 360 – 1920 × 1080 |
| 1:1 square | — | 360 × 360 – 1920 × 1920 |
| 4:5 vertical | 720 × 900 | 360 × 450 – 1080 × 1350 |
| 9:16 vertical | 720 × 1280 | 360 × 640 – 1080 × 1920 |

| Property | Value |
|---|---|
| Duration | 3 seconds – 30 minutes; **15–30s recommended** |
| File size | 75 KB – 500 MB |
| Format / codec | MP4 / H.264 or VP8 |
| Frame rate | under 30 FPS |
| Audio | AAC or MPEG4 |

## Carousel

| Property | Value |
|---|---|
| Cards | 2 – 10 |
| Recommended image | 1080 × 1080, 1:1 |
| Maximum | 4320 × 4320 |
| Rendered at | 312 × 312 |
| Max file | 10 MB per card |
| Formats | JPG, PNG, non-animated GIF |
| Intro text | 150 recommended, 255 max |
| CTA text | 45 characters |

**Cards render at 312 × 312.** A 1080px card is displayed at under a third of its size — type that is
legible in the design file will not be legible in the feed. Check every carousel at 312px.

## Document ads

| Property | Value |
|---|---|
| Formats | PDF, DOC, DOCX, PPT, PPTX |
| Max file | 100 MB |
| Pages | **under 10 recommended**; 300 pages or 1 million words maximum |
| Ratios | vertical, horizontal, square |

Multi-layer PDFs **must be flattened**, and a PDF whose pages differ in size must be normalised to one
page size. Both are export settings, not design decisions — and both silently break the upload.

## Message ads

| Field | Limit |
|---|---|
| Subject line | 60 |
| Message body | 1,500 (up to 10 emoji, rich text supported) |
| CTA text | 20 |

Optional banner: **300 × 250 max**, JPG / PNG / non-animated GIF, 2 MB, **desktop only**.
A "Not Interested" button is added automatically alongside your CTA — you cannot remove it, and it is
part of the layout the reader sees.

## Cross-platform note

LinkedIn's 1200 × 628 (1.91:1) and 1200 × 1200 (1:1) match Google's two most common sizes exactly, and
its 5 MB ceiling matches Google's. A Google PMax landscape and square asset pair is reusable on
LinkedIn without a re-export; a Meta asset at 30 MB is not.

## Gaps — not verified

- Conversation ad specs — `TBD — unverified`
- Audience Network placement differences — `TBD — unverified`
