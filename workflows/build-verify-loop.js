export const meta = {
  name: 'build-verify-loop',
  description: 'Autonomous chain: AD selects an asset, Designer builds it, AD verifies, one fix round, PASS/ESCALATE',
  whenToUse: 'Any single build task where the asset choice matters and the result must be verified before a human sees it',
  phases: [
    { title: 'Select', detail: 'Art Director audits the full inventory and picks' },
    { title: 'Build',  detail: 'Designer executes the directive with the selected asset' },
    { title: 'Verify', detail: 'Art Director verifies the render; one fix round max' },
  ],
}

// args: {
//   task:          string  — what is being built, in one paragraph (the CD's directive)
//   inventoryPath: string  — folder or catalog the AD must audit IN FULL (never a pre-filtered menu)
//   selectionSpec: string  — what makes a good pick here: subject, legibility, compliance limits
//   target:        string  — where the build lands (node id, slot, file path) and its dimensions
//   constraints:   string  — OPTIONAL extra craft or compliance constraints
// }

// outcome is REQUIRED and chosenPath is NOT — the Art Director must be able to decline.
// A schema that forces a path forces the team to nominate a least-bad asset, which is
// exactly the failure law 3 (ask-the-client-first) and eval U10 exist to prevent.

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

const PICK = { type: 'object', required: ['outcome','reasoning'], properties: {
  outcome: { type: 'string', enum: ['SELECTED','ASK-CLIENT','NO-VIABLE-ASSET'] },
  chosenPath: { type: 'string' }, backupPath: { type: 'string' }, reasoning: { type: 'string' },
  clientAsk: { type: 'string' }, rejected: { type: 'string' },
  cropNotes: { type: 'string' }, complianceFlags: { type: 'string' } } }

const BUILD = { type: 'object', required: ['status','changedIds','notes'], properties: {
  status: { type: 'string', enum: ['DONE','ESCALATE'] },
  changedIds: { type: 'array', items: { type: 'string' } }, notes: { type: 'string' } } }

const VERDICT = { type: 'object', required: ['verdict','findings'], properties: {
  verdict: { type: 'string', enum: ['PASS','FAIL'] },
  findings: { type: 'array', items: { type: 'object', required: ['severity','where','issue','fix'],
    properties: { severity: { type: 'string' }, where: { type: 'string' }, issue: { type: 'string' }, fix: { type: 'string' } } } } } }

const extra = args.constraints ? ` Additional constraints: ${args.constraints}.` : ''

phase('Select')
const pick = await agent(
  `Art Director task — asset SELECTION. Load the ACTIVE CLIENT PROFILE first. ` +
  `Audit the COMPLETE inventory at: ${args.inventoryPath} (open every candidate; a pre-filtered menu is ` +
  `not an inventory). The build: ${args.task}. Target: ${args.target}. ` +
  `Selection criteria: ${args.selectionSpec}.${extra} ` +
  `Note each rejected option in one line under 'rejected'. ` +
  `Set outcome: SELECTED when an asset genuinely proves the claim; ASK-CLIENT when the client could ` +
  `supply the right asset quickly (put the exact request in clientAsk); NO-VIABLE-ASSET when neither ` +
  `applies. Declining is a legal, expected answer — never nominate a least-bad option to fill the field.`,
  { ...tier('art-director'), agentType: 'art-director', schema: PICK, phase: 'Select' })

if (!pick || pick.outcome !== 'SELECTED') {
  log(`AD declined to select: ${pick ? pick.outcome : 'NO RESULT'}`)
  return { outcome: pick ? pick.outcome : 'NO-RESULT', halted: 'Select',
    reasoning: pick && pick.reasoning, clientAsk: pick && pick.clientAsk,
    note: 'Chain halted before build. Asking beats composite surgery (law 3, eval U10).' }
}
log('AD chose: ' + pick.chosenPath)

phase('Build')
const build = await agent(
  `Production Designer task. Load the ACTIVE CLIENT PROFILE and your design-tool guidance before any write. ` +
  `Directive: ${args.task}. Target: ${args.target}. ` +
  `AD-selected asset: ${pick.chosenPath}. AD crop notes: ${pick.cropNotes || 'none'}.${extra} ` +
  `Craft laws apply — reference geometry, honest endings, invisible seams, figure-ground. ` +
  `Self-verify before returning: render at >=0.5 scale AND zoom every risky region. ` +
  `Return status DONE or ESCALATE, changedIds, notes. ` +
  `If you are blocked, ESCALATE with the exact blocker — never hand-build or invent the missing content.`,
  { ...tier('designer'), agentType: 'designer', schema: BUILD, phase: 'Build' })
if (build.status === 'ESCALATE') return { outcome: 'ESCALATED', pick, build }

phase('Verify')
let verdict = await agent(
  `Art Director task — execution VERIFY of ${args.target} after the Designer placed ${pick.chosenPath}. ` +
  `Designer notes: ${build.notes}. READ-ONLY. Render ~1300px plus zoom crops of every edge and seam. ` +
  `Check your full hunt list: reference geometry vs the source, device/object realism, figure-ground, ` +
  `clipped or leftover content, collisions and clearspace, and the squint read. ` +
  `Findings with px fixes. PASS/FAIL.`,
  { ...tier('art-director'), agentType: 'art-director', schema: VERDICT, phase: 'Verify' })

if (verdict.verdict === 'FAIL') {
  const round2 = await agent(
    `Production Designer — fix round (FINAL round, 2-strike rule applies) on ${args.target}. ` +
    `Apply exactly these AD findings: ${JSON.stringify(verdict.findings)}. ` +
    `Craft laws; self-verify; return status/changedIds/notes. If it cannot be made clean, ESCALATE.`,
    { ...tier('designer'), agentType: 'designer', schema: BUILD, phase: 'Verify', label: 'designer-fix-round' })
  if (round2.status === 'ESCALATE') return { outcome: 'ESCALATED-ROUND2', pick, verdict, round2 }
  verdict = await agent(
    `Art Director — final re-verify of ${args.target} after the fix round: ${round2.notes}. ` +
    `Same checks, scoped to the prior findings only. PASS/FAIL.`,
    { ...tier('art-director'), agentType: 'art-director', schema: VERDICT, phase: 'Verify', label: 'ad-reverify' })
}

return {
  outcome: verdict.verdict,
  pick: { path: pick.chosenPath, why: pick.reasoning, flags: pick.complianceFlags },
  buildNotes: build.notes,
  findings: verdict.findings,
}
