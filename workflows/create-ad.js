export const meta = {
  name: 'create-ad',
  description: 'Brief to built, verified ad creative: copy, concept, asset selection, build, verify',
  whenToUse: 'There is a brief and no artwork yet — the main production chain',
  phases: [
    { title: 'Copy',    detail: 'content-creator writes the deck' },
    { title: 'Concept', detail: 'creative-director sets the idea and the directive' },
    { title: 'Select',  detail: 'art-director picks the hero from the full inventory' },
    { title: 'Build',   detail: 'designer builds the master artboard' },
    { title: 'Verify',  detail: 'art-director verifies the render; one fix round' },
  ],
}

// args: {
//   brief:         string  what the ad is for — audience, offer, the claim to prove
//   platforms:     string  e.g. "Meta Feed + Stories, Google PMax"
//   masterSize:    string  e.g. "1080x1080" — build ONE size first, derive the rest after approval
//   inventoryPath: string  the COMPLETE asset folder or catalog
//   destination:   string  where to build — Figma file key and page
//   constraints:   string  OPTIONAL compliance or craft constraints
// }

const DECK = { type: 'object', required: ['headline','cta','proof'], properties: {
  eyebrow: { type: 'string' }, headline: { type: 'string' }, accentLine: { type: 'string' },
  subline: { type: 'string' }, cta: { type: 'string' },
  proof: { type: 'string' },            // the visual the copy requires
  clientVerify: { type: 'string' },     // claims that could not be confirmed
  charNotes: { type: 'string' } } }

const CONCEPT = { type: 'object', required: ['subject','directive'], properties: {
  subject: { type: 'string' },          // the ONE thing that owns the frame
  directive: { type: 'string' },        // what the designer builds
  heroCriteria: { type: 'string' }, risks: { type: 'string' } } }

const PICK = { type: 'object', required: ['outcome','reasoning'], properties: {
  outcome: { type: 'string', enum: ['SELECTED','ASK-CLIENT','NO-VIABLE-ASSET'] },
  chosenPath: { type: 'string' }, reasoning: { type: 'string' },
  clientAsk: { type: 'string' }, cropNotes: { type: 'string' }, complianceFlags: { type: 'string' } } }

const BUILD = { type: 'object', required: ['status','changedIds','notes'], properties: {
  status: { type: 'string', enum: ['DONE','ESCALATE'] },
  changedIds: { type: 'array', items: { type: 'string' } }, notes: { type: 'string' } } }

const VERDICT = { type: 'object', required: ['verdict','findings'], properties: {
  verdict: { type: 'string', enum: ['PASS','FAIL'] },
  findings: { type: 'array', items: { type: 'object', required: ['severity','where','issue','fix'],
    properties: { severity: { type: 'string' }, where: { type: 'string' },
      issue: { type: 'string' }, fix: { type: 'string' } } } } } }

const profile = 'Load the ACTIVE CLIENT PROFILE from `.creative-team/` first; if there is none, say so and work in reduced scope. '
const extra = args.constraints ? ` Constraints: ${args.constraints}.` : ''

phase('Copy')
const deck = await agent(
  `${profile}Write the copy deck for this brief: ${args.brief}. Platforms: ${args.platforms}. ` +
  `Read the relevant files in knowledge/platforms/ and write INSIDE the character limits for these ` +
  `placements — note in charNotes where a limit forced a choice.${extra} ` +
  `Assert no factual claim the profile does not substantiate; everything unconfirmed goes to clientVerify.`,
  { agentType: 'content-creator', schema: DECK, phase: 'Copy' })
log(`Headline: ${deck.headline}`)

phase('Concept')
const concept = await agent(
  `${profile}Direct the concept. Brief: ${args.brief}. Copy deck: ${JSON.stringify(deck)}. ` +
  `Master size: ${args.masterSize}. Platforms: ${args.platforms}.${extra} ` +
  `Name the ONE subject that owns the frame at 0.5s, and the hero that PROVES the headline — a generic ` +
  `product shot under any claim is lazy. State heroCriteria precisely enough for the art-director to ` +
  `select against. Remember an ad is not a page: fewest elements that carry the idea.`,
  { agentType: 'creative-director', schema: CONCEPT, phase: 'Concept' })
log(`Subject: ${concept.subject}`)

phase('Select')
const pick = await agent(
  `${profile}Select the hero. Audit the COMPLETE inventory at: ${args.inventoryPath} — open every ` +
  `candidate; a shortlist someone else made is a decision already taken. Criteria: ${concept.heroCriteria}. ` +
  `It must prove: "${deck.headline}". Target ${args.masterSize}, and it must read at small size.${extra} ` +
  `Set outcome SELECTED only if an asset genuinely proves the claim. If the client could supply the right ` +
  `asset quickly, return ASK-CLIENT with the exact request in clientAsk. Declining is expected, not a failure.`,
  { agentType: 'art-director', schema: PICK, phase: 'Select' })

if (!pick || pick.outcome !== 'SELECTED') {
  log(`AD declined: ${pick ? pick.outcome : 'NO RESULT'}`)
  return { outcome: pick ? pick.outcome : 'NO-RESULT', halted: 'Select', deck, concept,
    clientAsk: pick && pick.clientAsk, reasoning: pick && pick.reasoning,
    note: 'Stopped before build. Asking for the right asset beats hours of composite surgery (law 3).' }
}

phase('Build')
const build = await agent(
  `${profile}Build the master creative at ${args.masterSize} in: ${args.destination}. ` +
  `Directive: ${concept.directive}. Copy: ${JSON.stringify(deck)}. Hero: ${pick.chosenPath} ` +
  `(crop notes: ${pick.cropNotes || 'none'}).${extra} ` +
  `Follow your "Building from zero" order: artboard from the format matrix, frame and margins, ` +
  `safe-zone guides converted to px from knowledge/platforms/ BEFORE placing anything, then hero by ` +
  `measured ratio, then type from the profile's scale, then the mandated legal line to spec. ` +
  `Tokens only — a value not in the profile is a question, not a choice. Self-verify at zoom before ` +
  `returning. ESCALATE rather than invent or guess.`,
  { agentType: 'designer', schema: BUILD, phase: 'Build' })
if (!build || build.status === 'ESCALATE') return { outcome: 'ESCALATED', deck, concept, pick, build }

phase('Verify')
let verdict = await agent(
  `${profile}Verify the built creative in ${args.destination}. Designer notes: ${build.notes}. ` +
  `READ-ONLY. Render ~1300px plus zoom crops of every edge and seam. Full hunt list, plus: does the ` +
  `hero prove "${deck.headline}", and is anything load-bearing inside the platform safe zone? ` +
  `Judge at full size AND at squint. Findings with px fixes. PASS/FAIL.`,
  { agentType: 'art-director', schema: VERDICT, phase: 'Verify' })

if (verdict && verdict.verdict === 'FAIL') {
  const fix = await agent(
    `${profile}Fix round (FINAL — 2-strike applies) on ${args.destination}. ` +
    `Apply exactly: ${JSON.stringify(verdict.findings)}. Self-verify. ESCALATE if it cannot be clean.`,
    { agentType: 'designer', schema: BUILD, phase: 'Verify', label: 'designer-fix' })
  if (!fix || fix.status === 'ESCALATE') return { outcome: 'ESCALATED-AFTER-VERIFY', deck, concept, pick, verdict, fix }
  verdict = await agent(
    `${profile}Final re-verify of ${args.destination} after: ${fix.notes}. Scoped to the prior findings only. PASS/FAIL.`,
    { agentType: 'art-director', schema: VERDICT, phase: 'Verify', label: 'ad-reverify' })
}

return {
  outcome: verdict ? verdict.verdict : 'NO-VERDICT',
  deck, concept,
  hero: { path: pick.chosenPath, why: pick.reasoning, flags: pick.complianceFlags },
  built: build.changedIds,
  findings: verdict ? verdict.findings : [],
  clientVerify: deck.clientVerify,
  next: 'Master only. Run /creative-gate before showing it, and derive the other sizes only after it passes.',
}
