export const meta = {
  name: 'creative-gate',
  description: 'The one gate: four reviewers in parallel, quality-officer last on final state, fix and re-gate, consolidated verdict',
  whenToUse: 'Creative already exists and has not been gated — built elsewhere, built by hand, or inherited',
  phases: [
    { title: 'Gate',    detail: 'four reviewers in parallel, quality-officer last on final state' },
    { title: 'Fix',     detail: 'designer applies confirmed findings; the failed roles re-gate' },
    { title: 'Verdict', detail: 'consolidate into SHIP / COMP-APPROVED / FIX / BLOCK, plus marker and ledger' },
  ],
}

// ONE GATE. There is no `depth` argument and there will not be one.
//
// This file exists for work the chain did not produce — built by hand, built before the plugin, or
// inherited. `create-ad.js` runs this same gate inline, from the same block below, so a production run
// and a standalone review cannot disagree about what "gated" means.
//
// An earlier version offered a one-dispatch spot-check beside the real gate. It was cheaper because a
// single reviewer cannot disagree with itself, which is the entire mechanism: the worst defect ever
// found in this project was three roles independently measuring the same frame and establishing that a
// fix reported as resolved had never landed in the file. A spot-check that cannot do that is not a
// gate, and having it available meant the gate got skipped.
//
// args: {
//   targets   [{ id, name, note }]  REQUIRED  what to gate
//   date      string                REQUIRED  ISO date, supplied by the CALLER — scripts cannot read
//                                             the clock, and the marker and ledger rows are dated
//   location  string                optional  "Figma file <KEY>, page ...", "./renders/", a URL
//   context   string                optional  campaign context the reviewers should judge against
// }

// ──8<─────────────────────── SHARED GATE BLOCK v1 ───────────────────────8<──
// This region is BYTE-IDENTICAL in workflows/create-ad.js and workflows/creative-gate.js,
// and `scripts/validate.sh` fails the build if the two copies drift by one character.
//
// There is ONE gate. A production run and a standalone review must not be able to disagree
// about what "gated" means — that is the whole point of collapsing to a single process.
// Workflow scripts cannot `import`, so the single definition is enforced by tooling rather
// than by a module boundary. Edit it in one file and run ./scripts/validate.sh; it will tell
// you to copy the block across. Do not hand-edit one copy only.

// ── Model and effort per role ─────────────────────────────────────────────────
// Measured from live runs: every role cost 120-200k tokens at a single tier, and the work is
// not equally hard. Judgement and visual forensics need the top tier; reading node properties
// and comparing them to tokens does not. This is the efficiency lever that costs no standards.
const TIER = {
  'creative-director':    { effort: 'high' },
  'art-director':         { effort: 'high' },
  'designer':             { effort: 'medium' },
  'content-creator':      { effort: 'medium' },
  'design-analyst':       { model: 'sonnet', effort: 'low' },
  'quality-officer':      { effort: 'high' },
  'financial-controller': { model: 'haiku',  effort: 'low' },
}
const tier = role => TIER[role] || {}

// Agents were re-reading the repository tree on every dispatch. Naming the files is the
// largest saving available that gives up no judgement at all.
const READ_SCOPE =
  'Read ONLY: `.creative-team/active`, then that profile\'s `client.md` and `compliance.md`, and the ' +
  '`knowledge/platforms/` file for each platform in scope. Do not explore the tree, and do not re-read ' +
  'a file you have already opened. If there is no active profile, say so in your first line and review ' +
  'in reduced scope against the platform specs — do not guess a brand token.'

// Brevity is a latency lever, never a standards lever. Eval U53: a brevity instruction once
// suppressed the designer's craft self-checks and the build shipped 64% empty, unmeasured. So
// anything that must survive brevity is marked NON-OPTIONAL where it is asked for, every time.
const BREVITY =
  'Be brief: the findings and a verdict. No preamble, no restating the brief, no options you rejected. ' +
  'Brevity cuts what you WRITE, never what you CHECK — every check marked NON-OPTIONAL below runs.'

// The producing roles return a concept, a deck, a selection or a build — not findings and not a
// verdict. Telling them to return "the findings and a verdict" asks for the wrong shape in the same
// sentence that asks for brevity.
const BREVITY_BUILD =
  'Be brief: decisions, not deliberation. No preamble, no restating the brief, no options you rejected. ' +
  'Brevity cuts what you WRITE, never what you CHECK — every check marked NON-OPTIONAL below runs.'

const MAX_ROUNDS = 2

// ── The roster ────────────────────────────────────────────────────────────────
// Fixed, and every role sees every target. An earlier version asked the creative-director for a
// dispatch plan first: that cost a dispatch, introduced an INVALID PLAN failure mode of its own,
// and could only ever NARROW coverage. Full coverage is simultaneously cheaper and stricter.
//
// Each role owns a failure class traced to an eval case — if you cannot name the class a role
// owns, it is not a role. Group 1 runs in parallel; the quality-officer is alone in group 2
// because it certifies FINAL state, after every other role's fixes have landed.
const GATE_ROSTER = [
  { agent: 'art-director', group: 1, focus:
    'RENDER FORENSICS — you own whether this reads as work anyone would run.\n' +
    'Render each target at ~1300px, at ~110px, and zoom-crop every edge and every seam.\n' +
    'NON-OPTIONAL, report the answer even when it is fine:\n' +
    '  (a) At 110px, name the ONE thing that survives. If nothing does, that alone is a MAJOR.\n' +
    '  (b) MEASURE the largest empty region as a percentage of canvas and state the number. Above\n' +
    '      ~20% and open to the background on two sides is a hole, not composed space (U47).\n' +
    '  (c) Does anything in the frame read as TAPPABLE at thumbnail? A CTA is a button, not a\n' +
    '      sentence (U46).\n' +
    '  (d) Is every placed asset\'s lineage CITED — a file name or node id — rather than asserted\n' +
    '      in a layer name? An assertion is not a citation (U39).\n' +
    '  (e) PROPORTION — you own this and nobody else can. Measure and state:\n' +
    '      - the DOMINANT element and its share of the frame, and whether it is the MESSAGE or the\n' +
    '        DECORATION. If decoration outweighs message, that is a MAJOR however clean the tokens are.\n' +
    '      - total empty vertical span as a % of height. Past ~40% the frame is not composed, it is\n' +
    '        under-filled, and no per-region cap will show it because the emptiness is distributed.\n' +
    '      - the display size against the OTHER steps the profile offers. A size inside the scale is\n' +
    '        not thereby the right one; say which step this should be and why.\n' +
    '      Judge the composition ON ITS OWN MERIT, not against the directive. A directive can be\n' +
    '      wrong, and you are the only role positioned to say so.\n' +
    'Then: reference geometry, device and object realism, honest endings, and squint hierarchy.' },

  { agent: 'design-analyst', group: 1, focus:
    'MEASUREMENT — you own every number. Read node properties; do not judge taste.\n' +
    'NON-OPTIONAL, with the measured value, the expected value and the node id for each:\n' +
    '  (a) Canvas dimensions and ratio against the named placement in `knowledge/platforms/`. A\n' +
    '      master at the wrong ratio makes every derivative wrong (U38).\n' +
    '  (b) Platform safe zones CONVERTED TO PX FOR THIS CANVAS, and whether anything load-bearing\n' +
    '      sits inside one.\n' +
    '  (c) Every colour, type size, weight and margin against the profile tokens.\n' +
    '  (d) Fonts RESOLVED IN THE RENDERER, not merely installed on the machine — Figma\'s font\n' +
    '      environment is separate from the OS, and a silent substitution typesets the whole set\n' +
    '      in a face nobody approved (U40, U48).\n' +
    '  (e) Collisions: anything overlapping, clipped, or crossing a margin.\n' +
    'Product rendering baked into an approved source asset is NOT a token violation — say so\n' +
    'rather than logging it.' },

  { agent: 'content-creator', group: 1, focus:
    'COPY AUDIT — you own every word in the frame, read back off the render rather than off the deck.\n' +
    'NON-OPTIONAL:\n' +
    '  (a) Mandated legal text: present, VERBATIM, adjacent to the claim it qualifies, at the\n' +
    '      specified size and contrast.\n' +
    '  (b) Per-placement character limits for the platforms in scope.\n' +
    '  (c) Every factual claim either substantiated by the profile or listed for CLIENT-VERIFY.\n' +
    '      A claim the profile does not support is a BLOCKER, not a note.\n' +
    '  (d) ONE action per creative, and no element repeating what another already says.\n' +
    'READ-ONLY: report the fix, never rewrite the artifact.' },

  { agent: 'quality-officer', group: 2, focus:
    'FINAL GATE on FINAL state — you run last and you own the terminal verdict.\n' +
    'NON-OPTIONAL:\n' +
    '  (a) Regulation, regional rules and category restrictions from the profile\'s `compliance.md`.\n' +
    '  (b) Export weight against EACH platform\'s ceiling — they differ by up to 6x, so an export\n' +
    '      that passes one and fails another is a defect, not a detail.\n' +
    '  (c) System membership: does this belong to the brand\'s body of work, or only to this brief?\n' +
    'Separate DEFECT from ENVIRONMENT. ENVIRONMENT is a constraint outside the work that re-gating\n' +
    'cannot change — a face absent from the renderer, an asset\'s native resolution, an unanswered\n' +
    'client question. Never use it for a defect in the work (U41).\n' +
    'With no compliance layer loaded, return UNVERIFIED — never SHIP.' },
]

const FINDINGS_SCHEMA = {
  type: 'object', required: ['verdict', 'findings'],
  properties: {
    verdict: { type: 'string', enum: ['PASS', 'FAIL', 'BLOCK', 'UNVERIFIED'] },
    findings: { type: 'array', items: {
      type: 'object', required: ['severity', 'where', 'issue', 'fix'],
      properties: {
        severity: { type: 'string', enum: ['BLOCKER', 'MAJOR', 'MINOR', 'ENVIRONMENT'] },
        where: { type: 'string' }, issue: { type: 'string' }, fix: { type: 'string' },
        measured: { type: 'string' }, expected: { type: 'string' },
        // WHO can fix this. Only 'designer' findings reach the fix round; everything else goes to the
        // human with the verdict. A gate that routes another role's deliverable to the designer spends
        // a round on work she cannot do.
        owner: { type: 'string', enum: ['designer', 'content-creator', 'client', 'none'] },
        // 'flagged-forward' = about work the brief sequences for LATER (a derivative not yet built).
        // Never actionable against the artifact in front of you.
        scope: { type: 'string', enum: ['this-artifact', 'flagged-forward'] },
        // contested = it touches content the client explicitly asked to keep. Never auto-applied.
        contested: { type: 'boolean' } } } },
    // Answers to the NON-OPTIONAL checks, so a silent omission is visible rather than assumed clean.
    checks: { type: 'string' },
  },
}

const FIX_SCHEMA = {
  type: 'object', required: ['status', 'changedIds', 'applied', 'skipped'],
  properties: {
    status: { type: 'string', enum: ['DONE', 'ESCALATE'] },
    changedIds: { type: 'array', items: { type: 'string' } },
    applied: { type: 'string' }, skipped: { type: 'string' }, notes: { type: 'string' },
  },
}

// ── The gate ──────────────────────────────────────────────────────────────────
// gate → fix → re-gate (max 2 rounds) → consolidated verdict, ledger rows and a marker.
// Returns everything; writes nothing. Workflow scripts have no filesystem access and cannot
// read the clock, so the CALLER writes the marker and the ledger, and passes `date` in.
async function runGate({ targets, location, context, date, gatePhase, fixPhase, renders }) {
  const where = location ? ` They live in: ${location}.` : ''
  // A reviewer that cannot SEE the work cannot review it, and its tool access is not something this
  // script controls: a `tools:` whitelist excludes MCP tools unless each is named, and a subagent
  // launched in the background is denied them regardless of the whitelist. Both are true and neither
  // is visible from here. So the caller may export renders to disk and pass the paths; every reviewer
  // can Read a PNG even when it cannot reach the design tool. Eval U62.
  const shots = renders && renders.length
    ? `\nRENDERS ON DISK — use these, they are authoritative:\n${renders.map(r => `  ${r}`).join('\n')}\n` +
      'Read them directly. Do not skip a visual check because a design-tool call is unavailable.'
    : '\nIf you cannot reach the design tool to render a target, do NOT guess and do NOT skip the check: ' +
      'return it as a single ENVIRONMENT finding saying you could not see the work, and ask the caller ' +
      'for exported PNGs on disk. A review written without looking is worse than no review.'
  const ctx = context ? ` Campaign context: ${context}.` : ''
  const ledger = []
  const record = (agent, purpose, outcome) =>
    ledger.push({ date, agent, purpose, outcome, tokens: null, tool_uses: null, duration_ms: null })

  const dispatch = async (steps, phaseName) => {
    const out = []
    for (const g of [...new Set(steps.map(s => s.group))].sort((x, y) => x - y)) {
      const wave = steps.filter(s => s.group === g)
      const res = await parallel(wave.map(s => () => agent(
        `Gate review — READ-ONLY, never modify the artifact. Targets: ${JSON.stringify(targets)}.` +
        `${where}${ctx}${shots}\n${READ_SCOPE}\n\n${s.focus}\n\n` +
        'Severity: BLOCKER (a defect; nothing ships) / MAJOR / MINOR / ENVIRONMENT (outside the work; ' +
        're-gating will not change it). Give every finding a location and an exact fix — a px value, a ' +
        'token name, a node id.\nSet `owner` on every finding: `designer` only when a change to THIS ' +
        'artifact fixes it; `content-creator` for copy that has not been written; `client` for an ' +
        'answer or an asset only they can supply; `none` when nothing can. Set `scope` to ' +
        '`flagged-forward` when the finding is about a size or placement the brief sequences for after ' +
        'this master is approved — the absence of work nobody was told to do yet is not a defect in ' +
        'the work in front of you.\nMark a finding contested:true if it touches content the client ' +
        `explicitly asked to keep; it goes to the human as a decision, not to the designer as a task.\n` +
        `Put your answers to the NON-OPTIONAL checks in 'checks', including the ones that came back ` +
        `clean — an omitted check is indistinguishable from a failed one.\n${BREVITY}`,
        { ...tier(s.agent), agentType: s.agent, schema: FINDINGS_SCHEMA,
          phase: phaseName, label: s.agent })))
      res.forEach((r, i) => {
        record(wave[i].agent, phaseName.toLowerCase(), r ? r.verdict : 'NO RESULT')
        if (r) out.push({ agent: wave[i].agent, ...r })
      })
    }
    return out
  }

  phase(gatePhase)
  const first = await dispatch(GATE_ROSTER, gatePhase)

  // Absence of findings is not absence of defects (U14). A stalled reviewer must never be able
  // to produce a clean-looking pass.
  if (first.length === 0)
    return { decision: 'INCOMPLETE — no gate results returned; DO NOT SHIP', ledger, rounds: 0,
      note: 'Every reviewer failed or stalled. Re-run. Absence of findings is not absence of defects (U14).' }
  if (first.length < GATE_ROSTER.length)
    return { decision: 'PARTIAL — a reviewer returned nothing; DO NOT SHIP', ledger, rounds: 0,
      reviewed: first.map(r => r.agent), expected: GATE_ROSTER.map(s => s.agent) }

  const latest = new Map(first.map(r => [r.agent, r]))
  // Only what the designer can actually fix on THIS artifact reaches a fix round. Severity alone is
  // not a work order: on the first live run this routed a content-creator deliverable and a
  // not-yet-due derivative to the designer, and one of them was work the brief forbids doing yet.
  const fixable = f => !f.contested
    && (f.severity === 'BLOCKER' || f.severity === 'MAJOR')
    && (f.owner === undefined || f.owner === 'designer')
    && f.scope !== 'flagged-forward'
  const actionable = () => [...latest.values()].flatMap(r =>
    r.findings.filter(fixable).map(f => ({ agent: r.agent, ...f })))
  // Raised, real, and not the designer's to fix. These go to the human with the verdict.
  const forHuman = () => [...latest.values()].flatMap(r =>
    r.findings.filter(f => !f.contested && (f.severity === 'BLOCKER' || f.severity === 'MAJOR') && !fixable(f))
      .map(f => ({ agent: r.agent, ...f })))

  let round = 0
  let escalated = null
  while (round < MAX_ROUNDS && actionable().length > 0) {
    round++
    phase(fixPhase)
    const todo = actionable()
    log(`Fix round ${round}/${MAX_ROUNDS} — ${todo.length} actionable findings`)
    const fix = await agent(
      `Fix round ${round} of ${MAX_ROUNDS} (the 2-strike rule applies). Apply exactly these confirmed ` +
      `findings and nothing else: ${JSON.stringify(todo)}.\n${READ_SCOPE}\n` +
      'Do NOT act on anything you judge contested — list it under skipped for the human. Tokens only; ' +
      'a value not in the profile is a question, not a choice. Self-verify before returning, and ' +
      'declare any measurable departure from what you were asked to do rather than reporting it as ' +
      'compliance (U54). If it cannot be made clean, ESCALATE.',
      { ...tier('designer'), agentType: 'designer', schema: FIX_SCHEMA,
        phase: fixPhase, label: `designer-round-${round}` })
    record('designer', `fix round ${round}`, fix ? fix.status : 'NO RESULT')
    if (!fix || fix.status === 'ESCALATE') { escalated = fix || { status: 'NO RESULT' }; break }

    // Re-gate the roles whose findings were addressed, scoped to their OWN prior findings — a
    // re-gate that opens new dimensions is a new gate. The quality-officer re-gates whenever
    // ANYTHING changed, even if it raised nothing itself: it certifies final state, and the state
    // it certified no longer exists (U55).
    const touched = new Set(todo.map(f => f.agent))
    touched.add('quality-officer')
    const reSteps = GATE_ROSTER.filter(s => touched.has(s.agent)).map(s => ({
      ...s,
      focus: `RE-GATE after a fix round. ${s.agent === 'quality-officer'
        ? 'You certify FINAL state and the state has changed, so re-run your own checks on it in full.'
        : 'Scoped to YOUR OWN prior findings only — confirm they are resolved and do not open new ' +
          'dimensions.'}\nYour prior findings: ${JSON.stringify(latest.get(s.agent).findings)}\n` +
        `The designer applied: ${fix.applied}\nThe designer skipped: ${fix.skipped || 'nothing'}\n\n` +
        `Your standing checks, which still apply:\n${s.focus}`,
    }))
    const again = await dispatch(reSteps, fixPhase)
    // A re-gate that returns nothing must NOT leave the pre-fix verdict standing. Keeping the stale
    // entry is how a quality-officer PASS from before a fix survives to become a SHIP — the same
    // failure as U14, one round later and harder to see.
    const returned = new Set(again.map(r => r.agent))
    const stalled = reSteps.map(s => s.agent).filter(role => !returned.has(role))
    if (stalled.length)
      return { decision: `PARTIAL — no re-gate result from ${stalled.join(', ')} after a fix landed; ` +
                         'DO NOT SHIP', ledger, rounds: round,
        note: 'The artifact changed and these roles did not re-confirm it. Their previous verdict ' +
              'describes a state that no longer exists, so it cannot stand in (U14, U55). Re-run.' }
    again.forEach(r => latest.set(r.agent, r))
  }

  const final = [...latest.values()]
  const pick = sev => final.flatMap(r =>
    r.findings.filter(f => f.severity === sev).map(f => ({ agent: r.agent, ...f })))
  const blockers = pick('BLOCKER'), majors = pick('MAJOR')
  const environment = pick('ENVIRONMENT'), minors = pick('MINOR')
  const unverified = final.filter(r => r.verdict === 'UNVERIFIED').map(r => r.agent)

  // A gate that can only ever say "not yet" is a gate people start waiving (U41). When the work
  // itself is clean and the only thing outstanding is something re-running cannot change, that is
  // a real terminal state with a checklist — not a failure.
  const decision =
    escalated ? 'ESCALATED — the designer could not resolve it; a human decides'
    : blockers.length ? 'BLOCK'
    : majors.length ? (round >= MAX_ROUNDS ? 'ESCALATED — fix rounds exhausted' : 'FIX-THEN-REGATE')
    : unverified.length ? 'UNVERIFIED — reviewed in reduced scope; no compliance layer was loaded'
    : environment.length ? 'COMP-APPROVED — show internally and to the client; do NOT export or traffic'
    : 'SHIP'

  return {
    decision, rounds: round, escalated,
    blockers, majors, environment, minors,
    contested: final.flatMap(r => r.findings.filter(f => f.contested).map(f => ({ agent: r.agent, ...f }))),
    forHuman: forHuman(),
    checks: final.map(r => ({ agent: r.agent, checks: r.checks || null })),
    perAgent: final.map(r => ({ agent: r.agent, verdict: r.verdict, findings: r.findings.length })),
    ledger,
    marker: {
      path: `.gates/${date}-${(targets[0] && (targets[0].name || targets[0].id)) || 'set'}.md`,
      decision, rounds: round, roster: GATE_ROSTER.map(s => s.agent),
      blockers: blockers.length, majors: majors.length,
      environment: environment.length, minors: minors.length,
      openItems: blockers.concat(majors),
      clearBeforeExport: environment,
    },
  }
}
// ──8<───────────────────── END SHARED GATE BLOCK ─────────────────────8<──

// ── Preflight ─────────────────────────────────────────────────────────────────
// Guard before any dereference. `a.targets.map()` throws if targets is absent, and a crash tells the
// caller nothing about what it should have passed.
const a = (typeof args === 'string') ? { context: args } : (args || {})

const problems = []
if (!Array.isArray(a.targets) || a.targets.length === 0)
  problems.push({ arg: 'targets', needs: 'array of { id, name, note } — what to gate. Never gate ' +
                                         'state that is about to change' })
if (!a.date || String(a.date).trim() === '')
  problems.push({ arg: 'date', needs: 'ISO date, e.g. "2026-09-10". SUPPLIED BY THE CALLER, not by ' +
                                      'the user: workflow scripts cannot read the clock, and the ' +
                                      'gate marker and ledger rows are dated' })

if (problems.length) {
  problems.forEach(p => log(`missing arg: ${p.arg} — ${p.needs}`))
  return {
    decision: 'INVALID CALL — nothing dispatched, nothing charged',
    missing: problems, got: a,
    example: {
      targets: [{ id: '25:2', name: 'Spring_NotACyclist_UK_EN_1080x1350_v2' }],
      date: '2026-09-10',
      location: 'Figma file <fileKey>, page "03 Ad Kit"',
      context: 'master for approval, UK + DE, Meta Feed 4:5',
    },
  }
}

// ── Run it ────────────────────────────────────────────────────────────────────
const gate = await runGate({
  targets: a.targets,
  location: a.location,
  context: a.context,
  date: a.date,
  renders: a.renders,
  gatePhase: 'Gate',
  fixPhase: 'Fix',
})

phase('Verdict')
log(`Gate: ${gate.decision}`)

return {
  ...gate,
  // The caller writes these. Workflow scripts have no filesystem access, and a gate whose result was
  // never recorded did not happen — the Stop hook is right to keep blocking until it is (U37).
  writeThese: {
    marker: gate.marker, ledger: gate.ledger,
    how: 'Write marker.path from marker.decision, marker.rounds and marker.openItems. Append each ' +
         'ledger row to .gates/ledger.csv as date,agent,purpose,tokens,tool_uses,duration_ms,outcome, ' +
         'filling tokens/tool_uses/duration_ms from the task usage stats — the script cannot see them, ' +
         'and a null-token row is an incomplete ledger (U15).',
  },
}
