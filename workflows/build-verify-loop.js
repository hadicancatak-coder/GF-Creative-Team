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

const PICK = { type: 'object', required: ['chosenPath','reasoning'], properties: {
  chosenPath: { type: 'string' }, backupPath: { type: 'string' }, reasoning: { type: 'string' },
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
  `Note each rejected option in one line. If nothing in the inventory can prove the claim, say so and ` +
  `return an ask for the client rather than nominating the least-bad option. ` +
  `Return chosenPath (absolute), backupPath, reasoning, cropNotes, complianceFlags.`,
  { agentType: 'art-director', schema: PICK, phase: 'Select' })
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
  { agentType: 'designer', schema: BUILD, phase: 'Build' })
if (build.status === 'ESCALATE') return { outcome: 'ESCALATED', pick, build }

phase('Verify')
let verdict = await agent(
  `Art Director task — execution VERIFY of ${args.target} after the Designer placed ${pick.chosenPath}. ` +
  `Designer notes: ${build.notes}. READ-ONLY. Render ~1300px plus zoom crops of every edge and seam. ` +
  `Check your full hunt list: reference geometry vs the source, device/object realism, figure-ground, ` +
  `clipped or leftover content, collisions and clearspace, and the squint read. ` +
  `Findings with px fixes. PASS/FAIL.`,
  { agentType: 'art-director', schema: VERDICT, phase: 'Verify' })

if (verdict.verdict === 'FAIL') {
  const round2 = await agent(
    `Production Designer — fix round (FINAL round, 2-strike rule applies) on ${args.target}. ` +
    `Apply exactly these AD findings: ${JSON.stringify(verdict.findings)}. ` +
    `Craft laws; self-verify; return status/changedIds/notes. If it cannot be made clean, ESCALATE.`,
    { agentType: 'designer', schema: BUILD, phase: 'Verify', label: 'designer-fix-round' })
  if (round2.status === 'ESCALATE') return { outcome: 'ESCALATED-ROUND2', pick, verdict, round2 }
  verdict = await agent(
    `Art Director — final re-verify of ${args.target} after the fix round: ${round2.notes}. ` +
    `Same checks, scoped to the prior findings only. PASS/FAIL.`,
    { agentType: 'art-director', schema: VERDICT, phase: 'Verify', label: 'ad-reverify' })
}

return {
  outcome: verdict.verdict,
  pick: { path: pick.chosenPath, why: pick.reasoning, flags: pick.complianceFlags },
  buildNotes: build.notes,
  findings: verdict.findings,
}
