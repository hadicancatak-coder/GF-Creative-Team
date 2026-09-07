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

head_ "agent registry"
# every agentType referenced by a workflow must exist as an agent file
for a in $(grep -ohE "agentType: '[a-z-]+'" workflows/*.js | sed "s/.*'\(.*\)'/\1/" | sort -u); do
  [ -f "agents/$a.md" ] && ok "agentType $a" || err "workflow references unknown agent: $a"
done
for a in $(grep -oE "'[a-z-]+'" workflows/creative-gate.js | sed "s/'//g" | sort -u); do
  case "$a" in art-director|design-analyst|quality-officer|content-creator|designer|creative-director)
    [ -f "agents/$a.md" ] || err "plan enum names missing agent: $a";; esac
done

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

head_ "claim cross-check"
CASES=$(grep -c '^| U' evals/universal-cases.md)
grep -q "$CASES eval cases" README.md && ok "README case count matches ($CASES)" \
  || err "README case count disagrees with evals/universal-cases.md ($CASES actual)"
MISSED=$(grep -c '| MISSED' evals/universal-cases.md)
[ -n "$MISSED" ] && ok "MISSED rows: $MISSED (check README wording if this changed)"

head_ "links"
BROKEN=0
for p in $(grep -rhoE '\]\(([A-Za-z0-9_./-]+)\)' README.md docs/*.md knowledge/README.md 2>/dev/null \
           | sed -E 's/^\]\(//;s/\)$//' | grep -v '^http' | sort -u); do
  [ -e "$p" ] || { err "broken link: $p"; BROKEN=1; }
done
[ "$BROKEN" -eq 0 ] && ok "internal links resolved"

head_ "hygiene"
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
