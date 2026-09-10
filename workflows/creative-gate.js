export const meta = {
  name: 'creative-gate',
  description: 'CD plans the dispatch; role agents gate in parallel; designer fixes; re-gate up to 2 rounds; consolidated verdict',
  whenToUse: 'Gate any built creative set before it is shown or shipped',
  phases: [
    { title: 'Plan',    detail: 'Creative Director writes the dispatch plan; the engine validates it' },
    { title: 'Gate',    detail: 'role agents review per plan, parallel groups in order' },
    { title: 'Fix',     detail: 'designer applies confirmed findings; only failed roles re-gate' },
    { title: 'Verdict', detail: 'consolidate, emit ledger rows and the gate marker' },
  ],
}

// args: {
//   targets:  [{ id, name, note }]   what to gate
//   context:  string                 campaign context for the CD
//   location: string (optional)      where the targets live
//   date:     string  REQUIRED       ISO date, e.g. "2026-09-07"
//
// NOTE: workflow scripts have NO filesystem access and cannot call new Date().
// This workflow therefore RETURNS the ledger rows and the gate marker; the calling
// skill writes them to .gates/. Do not add fs calls here — they will not run.


// ── Model and effort tiering ──────────────────────────────────────────────────
// Measured from live runs: every role was costing 120-200k tokens at one tier.
// The work is not equally hard. Judgement and visual forensics need the top tier;
// measurement and arithmetic do not.
//
//   role                 tier            why
//   creative-director    high effort     concept, tiebreak rulings — the hardest reasoning
//   art-director         high effort     pixel forensics, squint judgement, the quality backbone
//   designer             medium effort   execution against a directive; craft matters, novelty does not
//   content-creator      medium effort   writing inside known constraints
//   design-analyst       sonnet, low     reading node properties and comparing them to tokens
//   quality-officer      high effort     a compliance miss is the most expensive error in the set
//   financial-controller haiku,  low     arithmetic over a CSV
//
// Override per call, never globally — a role's tier belongs to the task, not the roster.
const TIER = {
  'creative-director':    { effort: 'high' },
  'art-director':         { effort: 'high' },
  'designer':             { effort: 'medium' },
  'content-creator':      { effort: 'medium' },
  'design-analyst':       { model: 'sonnet', effort: 'low' },
  'quality-officer':      { effort: 'high' },
  'financial-controller': { model: 'haiku',  effort: 'low' },
}
const tier = a => TIER[a] || {}

const MAX_ROUNDS = 2

const PLAN_SCHEMA = {
  type: 'object', required: ['plan'],
  properties: { plan: { type: 'array', items: {
    type: 'object', required: ['agent', 'targets', 'focus', 'group'],
    properties: {
      agent: { type: 'string', enum: ['art-director','design-analyst','quality-officer','content-creator'] },
      targets: { type: 'array', items: { type: 'string' } },
      focus: { type: 'string' }, group: { type: 'integer' }, passesIf: { type: 'string' },
    } } } },
}

const FINDINGS_SCHEMA = {
  type: 'object', required: ['verdict', 'findings'],
  properties: {
    verdict: { type: 'string', enum: ['PASS','FAIL','BLOCK'] },
    findings: { type: 'array', items: { type: 'object', required: ['severity','where','issue','fix'],
      properties: { // ENVIRONMENT = a constraint OUTSIDE the work that the team cannot fix and re-gating
      // will not change: a font not installed, an asset's native resolution, a client answer
      // outstanding, a knowledge file past review_by. Never use it for a defect in the work.
      severity: { type: 'string', enum: ['BLOCKER','MAJOR','MINOR','ENVIRONMENT'] },
        where: { type: 'string' }, issue: { type: 'string' }, fix: { type: 'string' },
        contested: { type: 'boolean' } } } },
  },
}

const FIX_SCHEMA = {
  type: 'object', required: ['status','changedIds','applied','skipped'],
  properties: {
    status: { type: 'string', enum: ['DONE','ESCALATE'] },
    changedIds: { type: 'array', items: { type: 'string' } },
    applied: { type: 'string' }, skipped: { type: 'string' }, notes: { type: 'string' },
  },
}

// ── Preflight ─────────────────────────────────────────────────────────────────
// Guard before any dereference. a.targets.map() throws if targets is absent, and a
// crash tells the caller nothing about what it should have passed.
const a = (typeof args === 'string') ? { context: args } : (args || {})

const problemsIn = []
if (!Array.isArray(a.targets) || a.targets.length === 0)
  problemsIn.push({ arg: 'targets', needs: 'array of { id, name, note } — what to gate' })
if (!a.date)
  problemsIn.push({ arg: 'date', needs: 'ISO date, e.g. "2026-09-08" — workflows cannot read the clock' })

if (problemsIn.length) {
  problemsIn.forEach(p => log(`missing arg: ${p.arg} — ${p.needs}`))
  return {
    decision: 'INVALID CALL — nothing dispatched', missing: problemsIn, got: a,
    example: { targets: [{ id: '25:2', name: 'Spring_NotACyclist_UK_EN_1080x1080_v2' }],
               date: '2026-09-08', location: 'Figma file <fileKey>, page "03 Ad Kit"',
               context: 'master for approval, UK + DE' },
  }
}

const where = a.location ? ` They live in: ${a.location}.` : ''
const targetIds = a.targets.map(t => t.id || t.name)
const ledger = []

const record = (agent, purpose, outcome) =>
  ledger.push({ date: a.date, agent, purpose, outcome, tokens: null, duration_ms: null })


// ── Depth ─────────────────────────────────────────────────────────────────────
// The full gate is 4 roles plus up to 2 fix rounds re-gating the failures: 14 dispatches,
// ~1.7M tokens, ~60 minutes. That is a shipping gate for regulated work, and it is far too
// expensive to be the only option.
//
//   quick (DEFAULT) — ONE dispatch, ~100k tokens, ~3-5 min. A single reviewer against a
//     fixed checklist on two renders. No fix rounds, no re-gate: it reports, it does not repair.
//     What you lose is the thing that caught the worst bug found so far — three roles
//     independently measuring the same frame and disagreeing with a claimed fix. One reviewer
//     cannot cross-check itself.
//
//   full — the 4-role gate with fix rounds. For work that actually ships.
const DEPTH = (a.depth || 'quick').toLowerCase()

if (DEPTH === 'quick') {
  phase('Gate')
  const res = await agent(
    `Single-pass creative gate. Targets: ${JSON.stringify(a.targets)}.${where}\n` +
    `Load ONLY: .creative-team/active, that profile's client.md and compliance.md, and ` +
    `knowledge/platforms/ for the platforms in scope. Do not explore the tree.\n` +
    `Render each target ONCE at ~1300px and ONCE at ~110px. Do not zoom-sweep.\n\n` +
    `Check exactly this list, in order, and stop:\n` +
    `1. THUMBNAIL — at 110px, name the one thing that survives. If nothing does, that alone is a MAJOR.\n` +
    `2. PLATFORM SPEC — dimensions and ratio against the placement; safe-zone intrusion converted to ` +
    `px for this canvas; file weight against the ceiling.\n` +
    `3. TOKENS — every colour, type size and margin against the profile. Product rendering baked into ` +
    `an approved asset is NOT a token violation; say so rather than logging it.\n` +
    `4. MANDATED TEXT — present, verbatim, adjacent to its claim, at spec.\n` +
    `5. COLLISIONS — anything overlapping, clipped, or crossing a margin.\n` +
    `6. CTA — does anything read as tappable at thumbnail?\n\n` +
    `Severity: BLOCKER (defect, must fix) · MAJOR · MINOR · ENVIRONMENT (outside the work — a missing ` +
    `font, a baked-in asset value — re-gating will not change it).\n` +
    `Be brief: the findings table and a verdict. No deliberation, no preamble.`,
    { model: 'sonnet', effort: 'medium', agentType: 'quality-officer',
      schema: FINDINGS_SCHEMA, phase: 'Gate', label: 'quick-gate' })

  if (!res) return { decision: 'INCOMPLETE — reviewer returned nothing; DO NOT SHIP', depth: 'quick' }
  const by = s => res.findings.filter(f => f.severity === s)
  const blockers = by('BLOCKER'), majors = by('MAJOR'), env = by('ENVIRONMENT')
  const decision = blockers.length ? 'BLOCK'
    : majors.length ? 'FIX-THEN-REGATE'
    : env.length ? 'COMP-APPROVED — show internally; do NOT export or traffic'
    : 'SHIP'
  return {
    decision, depth: 'quick', blockers, majors, environment: env, minors: by('MINOR'),
    perAgent: [{ agent: 'quality-officer', verdict: res.verdict, findings: res.findings.length }],
    ledger: [{ date: a.date, agent: 'quality-officer', purpose: 'quick gate', outcome: res.verdict,
               tokens: null, duration_ms: null }],
    marker: {
      path: `.gates/${a.date}-${(a.targets[0] && (a.targets[0].name || a.targets[0].id)) || 'set'}.md`,
      decision, depth: 'quick', blockers: blockers.length, majors: majors.length,
      environment: env.length, minors: by('MINOR').length,
      openItems: blockers.concat(majors), clearBeforeExport: env,
    },
    caveat: 'ONE reviewer, no cross-check, no fix rounds. A single agent cannot disagree with itself — ' +
            'run depth:"full" before anything ships to a client.',
  }
}

// ── Plan ──────────────────────────────────────────────────────────────────────
phase('Plan')
const planRes = await agent(
  `Work item: built creatives ready for gate. Targets: ${JSON.stringify(a.targets)}.${where} ` +
  `Context: ${a.context || 'none'}. Load the ACTIVE CLIENT PROFILE first. ` +
  `Per your Orchestration authority section, output ONLY the dispatch plan. ` +
  `quality-officer MUST be in the final group — it gates final state, after other roles' fixes land. ` +
  `Every target must appear in at least one step.`,
  { ...tier('creative-director'), agentType: 'creative-director', schema: PLAN_SCHEMA, phase: 'Plan' })
record('creative-director', 'dispatch plan', 'plan')

const plan = planRes.plan
const problems = []
const maxGroup = Math.max(...plan.map(s => s.group))
if (plan.some(s => s.agent === 'quality-officer' && s.group < maxGroup))
  problems.push('quality-officer is not in the final group — it must gate final state (law: QO last)')
const covered = new Set(plan.flatMap(s => s.targets))
const uncovered = targetIds.filter(t => !covered.has(t))
if (uncovered.length) problems.push(`targets with no reviewer assigned: ${uncovered.join(', ')}`)

if (problems.length) {
  problems.forEach(p => log('INVALID PLAN: ' + p))
  return { decision: 'INVALID PLAN — DO NOT SHIP', problems, plan, ledger }
}

// ── Gate ──────────────────────────────────────────────────────────────────────
const runGates = async (steps, phaseName) => {
  const out = []
  for (const g of [...new Set(steps.map(s => s.group))].sort((a, b) => a - b)) {
    const wave = steps.filter(s => s.group === g)
    const res = await parallel(wave.map(s => () =>
      agent(`Gate review. Targets: ${JSON.stringify(s.targets)}.${where} FOCUS: ${s.focus}. ` +
            `Load the ACTIVE CLIENT PROFILE and any relevant knowledge/platforms/ file first. ` +
            `READ-ONLY — never modify the artifact. Render each target at ~1300px and judge per your brief. ` +
            `Mark a finding contested:true if it touches content the client explicitly asked to keep.`,
        { ...tier(s.agent), agentType: s.agent, schema: FINDINGS_SCHEMA, phase: phaseName, label: s.agent })))
    res.forEach((r, i) => {
      record(wave[i].agent, phaseName.toLowerCase(), r ? r.verdict : 'NO RESULT')
      if (r) out.push({ agent: wave[i].agent, ...r })
    })
  }
  return out
}

phase('Gate')
let results = await runGates(plan, 'Gate')

if (results.length === 0)
  return { decision: 'INCOMPLETE — no gate results returned; DO NOT SHIP', plan, ledger,
    note: 'All gate agents failed or stalled. Absence of findings is not absence of defects (U14).' }
if (results.length < plan.length)
  return { decision: 'PARTIAL — missing gate results; DO NOT SHIP', plan, ledger,
    reviewed: results.map(r => r.agent), expected: plan.map(s => s.agent) }

// ── Fix → re-gate ─────────────────────────────────────────────────────────────
const latest = new Map(results.map(r => [r.agent, r]))
const actionable = () => [...latest.values()].flatMap(r =>
  r.findings.filter(f => !f.contested && (f.severity === 'BLOCKER' || f.severity === 'MAJOR'))
            .map(f => ({ agent: r.agent, ...f })))

let round = 0
let escalated = null
while (round < MAX_ROUNDS && actionable().length > 0) {
  round++
  phase('Fix')
  log(`Fix round ${round}/${MAX_ROUNDS} — ${actionable().length} actionable findings`)
  const fix = await agent(
    `Production Designer — fix round ${round} of ${MAX_ROUNDS} (2-strike rule applies). ` +
    `Apply these confirmed findings: ${JSON.stringify(actionable())}. ` +
    `Do NOT act on anything you judge contested — list it under skipped for the human instead. ` +
    `Craft laws apply; self-verify before returning. If it cannot be made clean, ESCALATE.`,
    { ...tier('designer'), agentType: 'designer', schema: FIX_SCHEMA, phase: 'Fix', label: `designer-round-${round}` })
  record('designer', `fix round ${round}`, fix ? fix.status : 'NO RESULT')
  if (!fix || fix.status === 'ESCALATE') { escalated = fix; break }

  const failedAgents = new Set(actionable().map(f => f.agent))
  const reSteps = plan.filter(s => failedAgents.has(s.agent)).map(s => ({
    ...s,
    focus: `RE-GATE, scoped to your own prior findings only: ` +
      `${JSON.stringify([...latest.get(s.agent).findings])}. Designer applied: ${fix.applied}. ` +
      `Do not open new dimensions; confirm these are resolved.`,
  }))
  const reRes = await runGates(reSteps, 'Fix')
  reRes.forEach(r => latest.set(r.agent, r))
}

// ── Verdict ───────────────────────────────────────────────────────────────────
phase('Verdict')
const final = [...latest.values()]
const pick = sev => final.flatMap(r => r.findings.filter(f => f.severity === sev).map(f => ({ agent: r.agent, ...f })))
const blockers = pick('BLOCKER')
const majors = pick('MAJOR')
const environment = pick('ENVIRONMENT')

// A gate that can only ever say "not yet" is one people start waiving. When the work itself
// is clean and the only thing outstanding is something the team cannot fix by re-running,
// that is a real, terminal state — not a failure.
const decision =
  escalated ? 'ESCALATED — designer could not resolve; human required'
  : blockers.length ? 'BLOCK'
  : majors.length ? (round >= MAX_ROUNDS ? 'ESCALATED — fix rounds exhausted' : 'FIX-THEN-REGATE')
  : environment.length ? 'COMP-APPROVED — show internally and to the client; do NOT export or traffic'
  : 'SHIP'

return {
  decision, rounds: round, blockers, majors, environment, minors: pick('MINOR'),
  contested: final.flatMap(r => r.findings.filter(f => f.contested).map(f => ({ agent: r.agent, ...f }))),
  perAgent: final.map(r => ({ agent: r.agent, verdict: r.verdict, findings: r.findings.length })),
  plan,
  ledger,
  marker: {
    path: `.gates/${a.date}-${(a.targets[0] && (a.targets[0].name || a.targets[0].id)) || 'set'}.md`,
    decision, rounds: round,
    blockers: blockers.length, majors: majors.length,
    environment: environment.length, minors: pick('MINOR').length,
    openItems: blockers.concat(majors),
    // Actionable checklist with owners, not a vague "not passed"
    clearBeforeExport: environment,
  },
}
