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
for f in scripts/*.mjs; do
  node --check "$f" 2>/dev/null && ok "$f" || err "$f fails node --check"
done
for f in hooks/*.sh scripts/*.sh; do
  sh -n "$f" 2>/dev/null && ok "$f" || err "$f fails sh -n"
done
[ -x scripts/check-build.mjs ] || err "scripts/check-build.mjs is not executable"
for f in hooks/*.sh; do [ -x "$f" ] || err "$f is not executable"; done
for f in .claude-plugin/*.json hooks/hooks.json; do
  python3 -c "import json;json.load(open('$f'))" 2>/dev/null && ok "$f" || err "$f is not valid JSON"
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

head_ "two commands, one process"
# The process is create-ad and review-ad. new-client/use-client are setup, not process.
for c in create-ad review-ad; do
  [ -f "commands/$c.md" ] && ok "commands/$c.md" || err "missing the $c command"
done
for gone in creative-gate format-matrix; do
  [ -f "commands/$gone.md" ] && err "commands/$gone.md is back — it was folded into the two-command process" \
    || ok "no $gone command (folded in)"
done
[ -d workflows ] && err "workflows/ is back — the process needs a human answer mid-flight, which a workflow script cannot pause for" \
  || ok "no workflows/ — the commands are the orchestration"
# A depth/speed switch is how the two-speed design came back last time.
SPEED='a\.depth|args\.depth|\bDEPTH\b|depth: *["'"'"']|depth:"|Two speeds|Two depths|Two modes'
if grep -rnE "$SPEED" commands/ skills/ agents/ docs/ README.md 2>/dev/null | grep -q .; then
  grep -rnE "$SPEED" commands/ skills/ agents/ docs/ README.md 2>/dev/null | while read -r l; do echo "       $l"; done
  err "a depth/speed switch reappeared — there is one process"
else
  ok "no depth or speed switch anywhere"
fi

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
    elif echo "$line" | grep -qE 'Write|Edit|NotebookEdit|use_figma|create_new_file|upload_assets|create_shader|update_shader'; then
      err "$n holds a WRITE tool — only the designer may change the artifact"
    else
      ok "$n cannot build"
    fi
    case "$n" in
      art-director|quality-officer|content-creator|design-analyst)
        echo "$line" | grep -q 'mcp__Figma__' \
          && ok "$n names design-tool read access" \
          || warn "$n reviews work but names no design-tool read access — renders must be passed on disk (U62)" ;;
    esac
  fi
done

head_ "agent wiring"
# Every role a command or skill names must exist as an agent file.
for a in $(grep -ohE '`(art-director|designer|creative-director|quality-officer|content-creator|design-analyst|financial-controller)`' \
           commands/*.md skills/*/SKILL.md 2>/dev/null | tr -d '`' | sort -u); do
  [ -f "agents/$a.md" ] && ok "role $a exists" || err "a command names a role with no agent file: $a"
done
# The Art Director is the front door and must be the one that closes the brief.
grep -q 'art-director' commands/create-ad.md && ok "create-ad routes through the art-director" \
  || err "create-ad does not dispatch the art-director — it is the front door"
grep -qi 'ask' commands/create-ad.md && ok "create-ad asks the client before building" \
  || err "create-ad never asks the client — an unclosed brief is discovered in pixels"

head_ "deterministic build check"
if node scripts/check-build.mjs --selftest >/dev/null 2>&1; then
  ok "scripts/check-build.mjs --selftest passes"
else
  err "scripts/check-build.mjs --selftest FAILED"
  node scripts/check-build.mjs --selftest 2>&1 | sed 's/^/       /'
fi

head_ "installed copy (U51)"
CACHE=$(ls -d "$HOME"/.claude/plugins/cache/*/gf-creative-team 2>/dev/null | head -1)
if [ -z "$CACHE" ]; then
  warn "no installed copy found — nothing to compare (fine in CI)"
else
  PJV=$(python3 -c "import json;print(json.load(open('.claude-plugin/plugin.json'))['version'])" 2>/dev/null)
  DRIFT=0
  for f in agents/*.md commands/*.md skills/*/SKILL.md scripts/check-build.mjs; do
    inst="$CACHE/$PJV/$f"
    [ -f "$inst" ] || { warn "not installed at $PJV: $f"; DRIFT=1; continue; }
    cmp -s "$f" "$inst" || { warn "INSTALLED COPY DIFFERS: $f"; DRIFT=1; }
  done
  [ "$DRIFT" -eq 0 ] && ok "installed copy at $PJV matches the working tree" \
    || warn "reinstall: claude plugin marketplace update gf-creative-team && claude plugin install gf-creative-team@gf-creative-team"
fi

head_ "knowledge layer"
for f in knowledge/platforms/*.md; do
  for k in platform verified review_by sources; do
    grep -q "^$k:" "$f" || err "$f missing frontmatter key: $k"
  done
  rb=$(grep '^review_by:' "$f" | head -1 | sed 's/review_by: *//')
  today=$(date +%Y-%m-%d)
  if [ -n "$rb" ]; then
    [ "$rb" \< "$today" ] && err "$f is EXPIRED (review_by $rb)" || ok "$f fresh until $rb"
  fi
  grep -q 'https\?://' "$f" || err "$f cites no source URLs"
done

head_ "changelog"
TOPV=$(grep -oE '^## \[[0-9]+\.[0-9]+\.[0-9]+\]' CHANGELOG.md | head -1 | tr -d '#[] ')
PJV=$(python3 -c "import json;print(json.load(open('.claude-plugin/plugin.json'))['version'])" 2>/dev/null)
[ "$TOPV" = "$PJV" ] && ok "CHANGELOG matches plugin.json ($PJV)" \
  || err "CHANGELOG top entry is $TOPV but plugin.json is $PJV"

head_ "claim cross-check"
CASES=$(grep -c '^| U' evals/universal-cases.md)
grep -qE "$CASES (eval )?cases" README.md && ok "README case count matches ($CASES)" \
  || err "README states no eval-case count matching evals/universal-cases.md ($CASES actual)"
ok "MISSED rows: $(grep -c '| MISSED' evals/universal-cases.md)"

head_ "links"
BROKEN=0
for f in $(find . -name '*.md' -not -path './.git/*' | sort); do
  d=$(dirname "$f")
  for p in $(grep -oE '\]\(([A-Za-z0-9_./#-]+)\)' "$f" 2>/dev/null \
             | sed -E 's/^\]\(//;s/\)$//' | grep -v '^http' | grep -v '^#' | sed 's/#.*//' | sort -u); do
    [ -z "$p" ] && continue
    [ -e "$d/$p" ] || { err "broken link in $f: $p"; BROKEN=1; }
  done
done
[ "$BROKEN" -eq 0 ] && ok "internal links resolved"
for f in $(find . -name '*.md' -not -path './.git/*' | sort); do
  d=$(dirname "$f")
  for p in $(grep -oE '!\[[^]]*\]\(([A-Za-z0-9_./-]+)\)' "$f" 2>/dev/null \
             | sed -E 's/^!\[[^]]*\]\(//;s/\)$//' | grep -v '^http' | sort -u); do
    [ -s "$d/$p" ] && ok "image $p" || err "missing or empty image in $f: $p"
  done
done

head_ "hygiene"
CLIENT_PAT='cfi[^a-z]|cfifinancial|cfi\.trade|MbsNhfIq'
if grep -rliE "$CLIENT_PAT" --include='*.md' --include='*.mjs' --include='*.sh' --include='*.json' \
     --exclude='validate.sh' . 2>/dev/null | grep -q .; then
  err "real-client reference found — this repo is public"
else
  ok "no real-client references"
fi
if grep -rlE '/Users/|/home/[a-z]' --include='*.md' --include='*.mjs' --include='*.sh' --include='*.json' \
     --exclude='validate.sh' . 2>/dev/null | grep -q .; then
  grep -rlE '/Users/|/home/[a-z]' --include='*.md' --include='*.mjs' --include='*.sh' --include='*.json' \
    --exclude='validate.sh' . 2>/dev/null | while read -r f; do echo "       $f"; done
  err "absolute path found — domain facts belong in a client profile or call arguments"
else
  ok "no absolute paths"
fi
grep -rqn 'Copy `clients/TEMPLATE/` to `clients/' commands/ docs/ 2>/dev/null \
  && err "docs tell the user to write into the plugin directory" \
  || ok "no writes promised into the plugin directory"

printf '\n%s errors, %s warnings\n' "$ERR" "$WARN"
[ "$ERR" -eq 0 ] || exit 1
