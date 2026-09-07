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
      properties: { severity: { type: 'string', enum: ['BLOCKER','MAJOR','MINOR'] },
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

if (!args.date) return { decision: 'INVALID CALL — pass args.date (ISO); workflows cannot read the clock' }

const where = args.location ? ` They live in: ${args.location}.` : ''
const targetIds = args.targets.map(t => t.id || t.name)
const ledger = []

const record = (agent, purpose, outcome) =>
  ledger.push({ date: args.date, agent, purpose, outcome, tokens: null, duration_ms: null })

// ── Plan ──────────────────────────────────────────────────────────────────────
phase('Plan')
const planRes = await agent(
  `Work item: built creatives ready for gate. Targets: ${JSON.stringify(args.targets)}.${where} ` +
  `Context: ${args.context || 'none'}. Load the ACTIVE CLIENT PROFILE first. ` +
  `Per your Orchestration authority section, output ONLY the dispatch plan. ` +
  `quality-officer MUST be in the final group — it gates final state, after other roles' fixes land. ` +
  `Every target must appear in at least one step.`,
  { agentType: 'creative-director', schema: PLAN_SCHEMA, phase: 'Plan' })
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
        { agentType: s.agent, schema: FINDINGS_SCHEMA, phase: phaseName, label: s.agent })))
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
    { agentType: 'designer', schema: FIX_SCHEMA, phase: 'Fix', label: `designer-round-${round}` })
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

const decision =
  escalated ? 'ESCALATED — designer could not resolve; human required'
  : blockers.length ? 'BLOCK'
  : (majors.length ? (round >= MAX_ROUNDS ? 'ESCALATED — fix rounds exhausted' : 'FIX-THEN-REGATE') : 'SHIP')

return {
  decision, rounds: round, blockers, majors, minors: pick('MINOR'),
  contested: final.flatMap(r => r.findings.filter(f => f.contested).map(f => ({ agent: r.agent, ...f }))),
  perAgent: final.map(r => ({ agent: r.agent, verdict: r.verdict, findings: r.findings.length })),
  plan,
  ledger,
  marker: {
    path: `.gates/${args.date}-${(args.targets[0] && (args.targets[0].name || args.targets[0].id)) || 'set'}.md`,
    decision, rounds: round,
    blockers: blockers.length, majors: majors.length, minors: pick('MINOR').length,
    openItems: blockers.concat(majors),
  },
}
