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

**Constructed illustrations using the fictional `example-northwind-cycles` profile.** They are not real
client work and were not produced by a live gate run.

What is real in them is the **geometry**: `meta-safezone-before-after.png` draws Meta's published
Stories/Reels reserve — approximately 14% top, 35% bottom, 6% each side — to scale on a 9:16 frame. That
figure, its source URL and its verification date live in `knowledge/platforms/meta.md`.

If that spec changes, the image is wrong. Regenerate it in the same pass that updates the knowledge file.
