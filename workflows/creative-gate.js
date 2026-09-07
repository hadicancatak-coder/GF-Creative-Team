export const meta = {
  name: 'creative-gate',
  description: 'CD plans the dispatch; role agents gate in parallel per plan; consolidated verdict',
  whenToUse: 'Gate any built creative set before it is shown or shipped',
  phases: [
    { title: 'Plan', detail: 'Creative Director writes the dispatch plan' },
    { title: 'Gate', detail: 'role agents review per plan, parallel groups in order' },
    { title: 'Verdict', detail: 'consolidate findings, SHIP/FIX/ESCALATE' },
  ],
}

// args: {
//   targets:  [{ id, name, note }]   — what to gate (design-tool node ids, file paths, or URLs)
//   context:  string                 — campaign context for the CD
//   location: string                 — OPTIONAL: where the targets live, e.g. "Figma file <KEY>"
//                                      or "./renders/". Passed verbatim to the agents.
// }

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
        where: { type: 'string' }, issue: { type: 'string' }, fix: { type: 'string' } } } },
  },
}

const where = args.location ? ` They live in: ${args.location}.` : ''

phase('Plan')
const planRes = await agent(
  `Work item: built creatives ready for gate. Targets: ${JSON.stringify(args.targets)}.${where} ` +
  `Context: ${args.context || 'none'}. ` +
  `Load the ACTIVE CLIENT PROFILE first. Per your Orchestration authority section, output ONLY the ` +
  `dispatch plan for this work item.`,
  { agentType: 'creative-director', schema: PLAN_SCHEMA, phase: 'Plan' })

phase('Gate')
const groups = [...new Set(planRes.plan.map(s => s.group))].sort((a, b) => a - b)
const results = []
for (const g of groups) {
  const stage = planRes.plan.filter(s => s.group === g)
  const out = await parallel(stage.map(s => () =>
    agent(`Gate review. Targets: ${JSON.stringify(s.targets)}.${where} ` +
          `FOCUS for this run: ${s.focus}. Load the ACTIVE CLIENT PROFILE first. READ-ONLY — you never ` +
          `modify the artifact. Render each target at ~1300px and judge per your brief. ` +
          `Return verdict + findings.`,
      { agentType: s.agent, schema: FINDINGS_SCHEMA, phase: 'Gate', label: s.agent })))
  out.forEach((r, i) => { if (r) results.push({ agent: stage[i].agent, ...r }) })
}

phase('Verdict')
if (results.length === 0) {
  return { decision: 'INCOMPLETE — no gate results returned; DO NOT SHIP', plan: planRes.plan,
    note: 'All gate agents failed or stalled. Re-run; absence of findings is not absence of defects.' }
}
const expected = planRes.plan.length
const pick = sev => results.flatMap(r => r.findings.filter(f => f.severity === sev).map(f => ({ agent: r.agent, ...f })))
const blockers = pick('BLOCKER')
const majors = pick('MAJOR')
return {
  decision: results.length < expected ? 'PARTIAL — missing gate results; DO NOT SHIP'
    : (blockers.length ? 'BLOCK' : (majors.length ? 'FIX-THEN-REGATE' : 'SHIP')),
  plan: planRes.plan, blockers, majors, minors: pick('MINOR'),
  perAgent: results.map(r => ({ agent: r.agent, verdict: r.verdict, findings: r.findings.length })),
}
