#!/bin/sh
# Block session stop if design builds ran today without a gate marker (or an explicit human waiver).
# Enforces the core rule: build -> gate -> fix -> show. Never show ungated work.
input=$(cat)
case "$input" in *'"stop_hook_active": true'*|*'"stop_hook_active":true'*) exit 0;; esac
d="${CLAUDE_PROJECT_DIR:-.}/.gates"
[ -f "$d/builds.log" ] || exit 0
today=$(date +%Y-%m-%d)
grep -q "^$today" "$d/builds.log" 2>/dev/null || exit 0
if ! ls "$d"/"$today"-*.md >/dev/null 2>&1; then
  printf '{"decision":"block","reason":"GATE: design builds ran today with no gate marker in .gates/. Run /gf-creative-team:creative-gate on the changed creatives and write the marker — or, if a human explicitly waived the gate, write .gates/%s-skipped.md noting who waived it and why."}\n' "$today"
  exit 0
fi
exit 0
