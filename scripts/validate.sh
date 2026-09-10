#!/bin/sh
# Validate the plugin before commit or release.
#   ./scripts/validate.sh          # full check
#   ./scripts/validate.sh --quiet  # errors only
# Exit 0 clean, 1 on any ERROR. WARNs do not fail the build.
set -u
cd "$(dirname "$0")/.." || exit 1
ERR=0; WARN=0
Q="${1:-}"
ok()   { [ "$Q" = "--quiet" ] || printf '  ok   %s\n' "$1"; }
err()  { printf '  ERR  %s\n' "$1"; ERR=$((ERR+1)); }
warn() { printf '  WARN %s\n' "$1"; WARN=$((WARN+1)); }
head_() { [ "$Q" = "--quiet" ] || printf '\n== %s ==\n' "$1"; }

head_ "syntax"
for f in workflows/*.js; do
  node --check "$f" 2>/dev/null && ok "$f" || err "$f fails node --check"
done
node --check scripts/dry-run.mjs 2>/dev/null && ok "scripts/dry-run.mjs" || err "scripts/dry-run.mjs fails node --check"
for f in hooks/*.sh; do
  sh -n "$f" 2>/dev/null && ok "$f" || err "$f fails sh -n"
  [ -x "$f" ] || err "$f is not executable"
done
for f in .claude-plugin/*.json hooks/hooks.json; do
  python3 -c "import json,sys;json.load(open('$f'))" 2>/dev/null && ok "$f" || err "$f is not valid JSON"
done

head_ "plugin manifest"
if command -v claude >/dev/null 2>&1; then
  claude plugin validate . >/dev/null 2>&1 && ok "claude plugin validate" || err "claude plugin validate failed"
else
  warn "claude CLI not found — skipped manifest validation"
fi

head_ "frontmatter"
for f in agents/*.md skills/*/SKILL.md; do
  { [ "$(head -1 "$f")" = "---" ] && grep -q '^name:' "$f" && grep -q '^description:' "$f"; } \
    && ok "$f" || err "$f missing --- / name: / description:"
done
for f in commands/*.md; do
  { [ "$(head -1 "$f")" = "---" ] && grep -q '^description:' "$f"; } \
    && ok "$f" || err "$f missing --- / description:"
done

head_ "role boundaries"
for f in agents/*.md; do
  n=$(basename "$f" .md)
  line=$(grep -m1 '^tools:' "$f" || true)
  if [ "$n" = "designer" ]; then
    [ -z "$line" ] && ok "designer unrestricted (the only builder)" \
      || err "designer should be unrestricted — it is the only role that builds"
  else
    if [ -z "$line" ]; then
      err "$n has no tools: restriction — every non-designer role must be unable to build"
    elif echo "$line" | grep -qE 'Write|Edit|NotebookEdit'; then
      err "$n holds a write tool — only the designer may produce an artifact"
    else
      ok "$n cannot build"
    fi
  fi
done

head_ "agent registry"
# every agentType referenced by a workflow must exist as an agent file
for a in $(grep -ohE "agentType: '[a-z-]+'" workflows/*.js | sed "s/.*'\(.*\)'/\1/" | sort -u); do
  [ -f "agents/$a.md" ] && ok "agentType $a" || err "workflow references unknown agent: $a"
done
# every role named in the fixed gate roster must exist as an agent file
for a in $(grep -ohE "^  \{ agent: '[a-z-]+'" workflows/*.js | sed "s/.*'\(.*\)'/\1/" | sort -u); do
  [ -f "agents/$a.md" ] && ok "gate roster $a" || err "gate roster names missing agent: $a"
done

head_ "one process"
# There is ONE production chain and ONE gate. A `depth` argument is how the two-speed design came
# back last time, and every defect unique to the cheap path (U52, U53, U54) came with it.
# Match the MECHANISM, not the word: a read of args.depth, a DEPTH constant, a depth: literal, or a
# heading offering a choice of speeds. Prose explaining why there is no such switch is fine.
SPEED_PAT='a\.depth|args\.depth|\bDEPTH\b|depth: *["'"'"']|depth:"|Two speeds|Two depths|Two modes'
if grep -rnE "$SPEED_PAT" workflows/ commands/ skills/ docs/ README.md 2>/dev/null | grep -q .; then
  grep -rnE "$SPEED_PAT" workflows/ commands/ skills/ docs/ README.md 2>/dev/null \
    | while read -r l; do echo "       $l"; done
  err "a depth/speed switch has reappeared — there is one process, and the cheap path was the only one that shipped ungated work"
else
  ok "no depth or speed switch in workflows, commands, skills or docs"
fi
# Only the designer may hold the write role in a gate dispatch.
if grep -nE "agentType: '(art-director|design-analyst|quality-officer|content-creator|creative-director)'" \
     workflows/*.js | grep -q 'FIX_SCHEMA'; then
  err "a non-designer role was dispatched with the fix schema"
else
  ok "only the designer is dispatched to change the artifact"
fi

head_ "one gate"
# The gate is defined once and pasted into both workflows, because workflow scripts cannot import.
# Byte-identity is therefore the only thing standing between "one gate" and two that drift apart.
BLOCK_FILES="workflows/create-ad.js workflows/creative-gate.js"
SUMS=""
for f in $BLOCK_FILES; do
  n=$(awk '/SHARED GATE BLOCK v1/,/END SHARED GATE BLOCK/' "$f" | wc -l | tr -d ' ')
  if [ "$n" -lt 50 ]; then
    err "$f has no SHARED GATE BLOCK (found $n lines between the markers)"
  else
    SUMS="$SUMS $(awk '/SHARED GATE BLOCK v1/,/END SHARED GATE BLOCK/' "$f" | sha256sum | cut -d' ' -f1)"
  fi
done
UNIQ=$(printf '%s\n' $SUMS | sort -u | wc -l | tr -d ' ')
if [ "$UNIQ" = "1" ]; then
  ok "the shared gate block is byte-identical across $BLOCK_FILES"
else
  err "the shared gate block has DRIFTED between workflows — a production run and a standalone review would disagree about what 'gated' means. Copy the block from one file to the other."
fi

head_ "orchestration dry run"
# Stubs the engine and asserts the routing: who is dispatched, in what order, and what verdict
# comes out. No tokens, no Figma. Every orchestration bug in this repo's history was this shape.
if node scripts/dry-run.mjs --quiet; then
  ok "scripts/dry-run.mjs — all scenarios pass"
else
  err "scripts/dry-run.mjs failed — the orchestration is mis-wired (see output above)"
fi

head_ "installed copy (U51)"
# Editing this repo does not change what RUNS. Workflows execute from the plugin cache, and three
# versions of perf work were once measured against a copy four versions behind. CI has no install, so
# this is a WARN there and a real signal locally.
CACHE=$(ls -d "$HOME"/.claude/plugins/cache/*/gf-creative-team 2>/dev/null | head -1)
if [ -z "$CACHE" ]; then
  warn "no installed copy found — nothing to compare (fine in CI)"
else
  PJV=$(python3 -c "import json;print(json.load(open('.claude-plugin/plugin.json'))['version'])" 2>/dev/null)
  DRIFT=0
  for f in workflows/*.js agents/*.md commands/*.md skills/*/SKILL.md; do
    inst="$CACHE/$PJV/$f"
    [ -f "$inst" ] || { warn "not installed at $PJV: $f"; DRIFT=1; continue; }
    if ! cmp -s "$f" "$inst"; then warn "INSTALLED COPY DIFFERS: $f"; DRIFT=1; fi
  done
  [ "$DRIFT" -eq 0 ] && ok "installed copy at $PJV matches the working tree — runs exercise your changes" \
    || warn "reinstall before testing: claude plugin marketplace update gf-creative-team && claude plugin install gf-creative-team@gf-creative-team"
fi

head_ "knowledge layer"
for f in knowledge/platforms/*.md; do
  for k in platform verified review_by sources; do
    grep -q "^$k:" "$f" || err "$f missing frontmatter key: $k"
  done
  rb=$(grep '^review_by:' "$f" | head -1 | sed 's/review_by: *//')
  today=$(date +%Y-%m-%d)
  if [ -n "$rb" ]; then
    if [ "$rb" \< "$today" ]; then
      err "$f is EXPIRED (review_by $rb) — re-verify against its sources or agents must report it stale"
    else
      ok "$f fresh until $rb"
    fi
  fi
  grep -q 'https\?://' "$f" || err "$f cites no source URLs"
done

head_ "changelog"
TOPV=$(grep -oE '^## \[[0-9]+\.[0-9]+\.[0-9]+\]' CHANGELOG.md | head -1 | tr -d '#[] ')
PJV=$(python3 -c "import json;print(json.load(open('.claude-plugin/plugin.json'))['version'])" 2>/dev/null)
if [ "$TOPV" = "$PJV" ]; then
  ok "CHANGELOG newest-first and matches plugin.json ($PJV)"
else
  err "CHANGELOG top entry is $TOPV but plugin.json is $PJV — entries must be newest-first and current"
fi

head_ "claim cross-check"
CASES=$(grep -c '^| U' evals/universal-cases.md)
if grep -qE "$CASES (eval )?cases" README.md; then
  ok "README case count matches ($CASES)"
else
  err "README states no eval-case count matching evals/universal-cases.md ($CASES actual)"
fi
MISSED=$(grep -c '| MISSED' evals/universal-cases.md)
[ -n "$MISSED" ] && ok "MISSED rows: $MISSED (check README wording if this changed)"

head_ "links"
# Links resolve RELATIVE TO THE FILE THEY APPEAR IN, not the repo root.
BROKEN=0
for f in $(find . -name '*.md' -not -path './.git/*' | sort); do
  d=$(dirname "$f")
  for p in $(grep -oE '\]\(([A-Za-z0-9_./#-]+)\)' "$f" 2>/dev/null \
             | sed -E 's/^\]\(//;s/\)$//' | grep -v '^http' | grep -v '^#' | sed 's/#.*//' | sort -u); do
    [ -z "$p" ] && continue
    [ -e "$d/$p" ] || { err "broken link in $f: $p"; BROKEN=1; }
  done
done
[ "$BROKEN" -eq 0 ] && ok "internal links resolved (relative to each file)"

# Every referenced image must exist and be non-empty
for f in $(find . -name '*.md' -not -path './.git/*' | sort); do
  d=$(dirname "$f")
  for p in $(grep -oE '!\[[^]]*\]\(([A-Za-z0-9_./-]+)\)' "$f" 2>/dev/null \
             | sed -E 's/^!\[[^]]*\]\(//;s/\)$//' | grep -v '^http' | sort -u); do
    if [ -s "$d/$p" ]; then ok "image $p"; else err "missing or empty image in $f: $p"; fi
  done
done

head_ "hygiene"
# Real-client leakage. This repo is public: no former client's name, domain, file key or
# personal path may ever appear. Extend CLIENT_PAT when you take on a named engagement.
CLIENT_PAT='cfi[^a-z]|cfifinancial|cfi\.trade|MbsNhfIq'
if grep -rliE "$CLIENT_PAT" --include='*.md' --include='*.js' --include='*.sh' --include='*.json' \
     --exclude='validate.sh' . 2>/dev/null | grep -q .; then
  grep -rliE "$CLIENT_PAT" --include='*.md' --include='*.js' --include='*.json' \
    --exclude='validate.sh' . 2>/dev/null | while read -r f; do echo "       $f"; done
  err "real-client reference found — this repo is public"
else
  ok "no real-client references"
fi

if grep -rlE '/Users/|/home/[a-z]' --include='*.md' --include='*.js' --include='*.sh' --include='*.json' \
     --exclude='validate.sh' . 2>/dev/null | grep -q .; then
  grep -rlE '/Users/|/home/[a-z]' --include='*.md' --include='*.js' --include='*.sh' --include='*.json' \
    --exclude='validate.sh' . 2>/dev/null | while read -r f; do echo "       $f"; done
  err "absolute path found — domain facts belong in a client profile or call arguments"
else
  ok "no absolute paths"
fi
grep -rqn 'Copy `clients/TEMPLATE/` to `clients/' commands/ docs/ 2>/dev/null \
  && err "docs tell the user to write into the plugin directory — /plugin update destroys that" \
  || ok "no writes promised into the plugin directory"

printf '\n%s errors, %s warnings\n' "$ERR" "$WARN"
[ "$ERR" -eq 0 ] || exit 1
