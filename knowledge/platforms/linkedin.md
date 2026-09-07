---
platform: LinkedIn
verified: 2026-09-07
review_by: 2026-12-07
sources:
  - https://www.linkedin.com/help/lms/answer/a426534/single-image-ads-advertising-specifications
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

## Cross-platform note

LinkedIn's 1200 × 628 (1.91:1) and 1200 × 1200 (1:1) match Google's two most common sizes exactly, and
its 5 MB ceiling matches Google's. A Google PMax landscape and square asset pair is reusable on
LinkedIn without a re-export; a Meta asset at 30 MB is not.

## Gaps — not verified

- Video ad specs — `TBD — unverified`
- Carousel ad specs — `TBD — unverified`
- Document, Conversation and Message ad specs — `TBD — unverified`
- Audience Network placement differences — `TBD — unverified`
