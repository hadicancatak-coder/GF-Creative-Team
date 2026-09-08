# Diagram sources

Images here are generated from the `.src.html` file beside them, so every figure in them is
reproducible and checkable rather than drawn by hand.

## Regenerate

```bash
python3 -m http.server 8899 &
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --disable-gpu --hide-scrollbars \
  --screenshot="$PWD/examples/images/meta-safezone-before-after.png" \
  --window-size=990,772 --force-device-scale-factor=2 \
  "http://localhost:8899/examples/images/meta-safezone.src.html"
kill %1
```

## What these are, and are not

**Geometry diagrams, not designs.** Creative elements are drawn as plain blocks on purpose.

An earlier version of `meta-safezone-before-after.png` rendered the panels as finished-looking ads with
a headline, a CTA pill and a legal line. That was a mistake: a schematic dressed as a finished ad invites
judgement on its craft, which it cannot survive, and it did — in a repo whose whole subject is craft.
A diagram should look like a diagram.

What is real is the **geometry**: Meta's published Stories/Reels reserve, approximately 14% top,
35% bottom and 6% each side, drawn to scale on a 9:16 frame. That figure, its source URL and its
verification date live in `knowledge/platforms/meta.md`.

If that spec changes, the image is wrong. Regenerate it in the same pass that updates the knowledge file.
