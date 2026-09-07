---
description: Make an ad creative end to end — brief to built, reviewed artwork in Figma. The main entry point.
---

Create ad creative for: $ARGUMENTS

This is the full chain. Use it when there is a brief and no artwork yet.

## Before anything
1. Resolve the active client profile (`.creative-team/active`). No profile? Say so — you can still build,
   but tokens, source law and compliance will be unchecked, and say that up front.
2. Confirm the **design tool is connected**. The build steps need the Figma MCP. If it is not available,
   stop and say so — do not describe an ad you cannot build.
3. Run the format matrix for the platforms in scope. **Build the master size first.** Never build ten
   sizes of an idea nobody has approved.

## The chain
Dispatch in this order. Each step's output is the next step's input.

1. **`content-creator`** — the copy deck. Headline, accent line, CTA, eyebrow, the visual proof the copy
   requires, and a CLIENT-VERIFY list. Copy first: copy that does not fit drives layout changes late,
   and per-format limits differ sharply (see `knowledge/platforms/`).
2. **`creative-director`** — the concept. One subject that owns the frame at half a second, the hero
   that proves the headline, and the directive for the build. It works from the COMPLETE asset
   inventory, so give it the whole folder, not a shortlist.
3. **`art-director`** — the asset selection. If nothing available proves the claim it returns
   ASK-CLIENT with the exact request. **That is a valid outcome — take it to the human, do not
   substitute a weaker asset.**
4. **`designer`** — the build. Artboards, frame, safe-zone guides, hero, type, legal line. Tokens only.
5. **`art-director`** again — verifies the render before any human sees it.
6. **Gate it** — run `/creative-gate` on the result. A build that has not been gated is not finished.

Only derive the remaining sizes after the master passes.

## Rules that make this work
- Never invent a visual element. Compose, crop, slice and subtract from real assets — drawing new
  content is not a fallback, and when blocked the answer is to escalate.
- Never guess a token, a claim figure or a mandated legal line. Ask.
- Two fix rounds maximum, then bring it to the human.
- Present nothing ungated.
