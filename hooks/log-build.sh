#!/bin/sh
# Record that a design-tool write happened this session (gate accounting).
d="${CLAUDE_PROJECT_DIR:-.}/.gates"
mkdir -p "$d"
date +%Y-%m-%dT%H:%M:%S >> "$d/builds.log"
exit 0
