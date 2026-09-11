---
name: review-ad
description: Review built ad creative before anyone sees it — run the deterministic build check, then dispatch the Art Director for the judgement a script cannot make, and the Quality Officer only when the work is regulated or about to be trafficked. Use whenever a build round completes, or when creative arrives from anywhere and has not been reviewed. A build with no recorded review is not done.
---

# Review Ad

**Arithmetic is free. Judgement costs a dispatch. Compliance costs one more, and only when it ships.**

Most reviews are one dispatch. Two when it traffics.

## 0. Resolve the profile
`.creative-team/active` → `.creative-team/clients/<name>/`, then `client.md` and `compliance.md`. Never
carry a profile over from a previous session — a remembered profile is a fabricated one (U31).

**No profile? Review anyway, in reduced scope.** Judge against `knowledge/platforms/` and craft, and open
your report with exactly which checks were skipped: brand tokens, source law, compliance. The
quality-officer returns `UNVERIFIED`, never `SHIP`, without a compliance layer. A reduced-scope review is
useful; a reduced-scope review presented as a full one is not.

## 1. Renders on disk, before anything else
Export every target at **≥1300px** and **~110px** and keep the paths.

A subagent's `tools:` list excludes MCP tools unless each is named, and a background subagent is denied
them regardless — so a reviewer very often cannot reach the design tool. The designer is unrestricted and
can export. **Never accept a review from a role that could not see the target** (U62).

## 2. `node scripts/check-build.mjs build.json tokens.json`
Gaps against the spacing scale · type against the type scale · the top display step left unspent ·
colours against tokens · accent-use count · reserved colours · sub-pixel geometry ·
message-vs-decoration share · total empty vertical span · accent-as-generated-design-tell.

Milliseconds, free, and it cannot disagree with itself between runs. **Never dispatch an agent to do
arithmetic** — a role doing this cost ~88,000 tokens per run and caught less than the script does.

## 3. Art Director — the half a script cannot do
One dispatch, with the render paths and the script output. It returns its non-optional checks **with
numbers** (thumbnail survivor and whether that is message or decoration; proportion; largest empty
region; affordance; cited lineage), then judges the picture **on its own merit rather than against the
spec that produced it** — a spec can be wrong and this is the only role positioned to say so.

READ-ONLY. Only the designer changes the artifact.

## 4. Quality Officer — only when it ships
Regulated category · mandated text · a claim needing substantiation · about to be trafficked. Runs
**last, on final state**, and **re-runs after any change**, because the state it certified stops existing
the moment a fix lands (U55). An unregulated internal comp does not need it — say so rather than
dispatching out of habit.

## 5. Route the findings by owner, not by severity
Every finding carries an **owner** (`designer` / `content-creator` / `client` / `none`) and a **scope**
(`this-artifact` / `flagged-forward`).

Only what the designer can fix **on this artifact** goes back to the designer. Another role's
undelivered deliverable, a client ask, and anything the brief sequences for later go to the human with
the verdict (U60). `contested` findings — content the client explicitly asked to keep — are decisions,
never auto-applied. `ENVIRONMENT` findings never consume a fix round; re-running cannot change them.

## 6. Fix, then re-review
Two rounds maximum, then a human decides. The designer **duplicates the artboard and builds `_v<n>`**,
leaving the previous version intact as the comparison. Re-run the script every round — it is free.
Re-dispatch the Art Director only when the fix touched something a number cannot see.

## 7. Record it, or it did not happen
Write `.gates/<date>-<name>.md` with the decision, the rounds, and the open items. Append ledger rows to
`.gates/ledger.csv` as `date,agent,purpose,tokens,tool_uses,duration_ms,outcome`, filling the usage
figures from the task stats — a null-token row is an incomplete ledger (U15).

The Stop hook blocks a session that built without recording a review. That is the hook working. **The
waiver is a human's to give**, written to `.gates/<date>-skipped.md` naming who waived it and why —
never yours.

## Verdicts
`SHIP` · `COMP-APPROVED` (no defects; environment items outstanding — show, do not traffic) ·
`UNVERIFIED` (reduced scope; never a pass) · `FIX` · `BLOCK` · `ESCALATED`.

**`COMP-APPROVED` is a real terminal state, not a soft failure.** A review that can only ever say "not
yet" is one people start waiving.

## Non-negotiables
- A definition is not a review. Agents only work when dispatched.
- One BLOCKER = it does not ship.
- Never review state that is about to change.
- Every failure a human catches and the review did not becomes, the same day, a rule in the responsible
  role's brief and an eval case in `evals/`.
