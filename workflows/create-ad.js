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
  // SELECTED-WITH-RESERVATIONS is the DEFAULT when an asset is imperfect but usable.
  // Refusing outright is for work that would be harmful, illegal or actively misleading —
  // not for work that would merely be weaker than you'd like. Build it and flag it.
  outcome: { type: 'string', enum: ['SELECTED','SELECTED-WITH-RESERVATIONS','ASK-CLIENT','NO-VIABLE-ASSET'] },
  reservations: { type: 'string' },
  chosenPath: { type: 'string' }, reasoning: { type: 'string' },
  clientAsk: { type: 'string' }, cropNotes: { type: 'string' }, complianceFlags: { type: 'string' } } }

const BUILD = { type: 'object', required: ['status','changedIds','notes'], properties: {
  status: { type: 'string', enum: ['DONE','ESCALATE'] },
  changedIds: { type: 'array', items: { type: 'string' } }, notes: { type: 'string' },
  // A disagreement with the art-director is structured, not buried in prose — the engine
  // routes it to the creative-director for a ruling instead of letting it ship unresolved.
  conflict: { type: 'string' }, layoutSystem: { type: 'string' } } }

const RULING = { type: 'object', required: ['ruling','rationale'], properties: {
  ruling: { type: 'string' },        // what is to happen, concretely
  rationale: { type: 'string' },     // which role's reasoning is set aside, and why
  setAside: { type: 'string' } } }

const VERDICT = { type: 'object', required: ['verdict','findings'], properties: {
  verdict: { type: 'string', enum: ['PASS','FAIL'] },
  findings: { type: 'array', items: { type: 'object', required: ['severity','where','issue','fix'],
    properties: { severity: { type: 'string' }, where: { type: 'string' },
      issue: { type: 'string' }, fix: { type: 'string' } } } } } }

// ── Preflight ─────────────────────────────────────────────────────────────────
// Normalise: a bare string is the brief. `/create-ad give me a trading ad` sends a
// string, not an object, and without this every prompt below reads "undefined".
const a = (typeof args === 'string') ? { brief: args } : (args || {})

const REQUIRED = [
  ['brief',         'what the ad is for — audience, the offer, the claim to prove'],
  ['platforms',     'e.g. "Meta Feed + Stories" or "Google PMax"'],
  ['masterSize',    'e.g. "1080x1080" — one size first, derive the rest after approval'],
  ['inventoryPath', 'folder or catalog holding the COMPLETE asset inventory'],
  ['destination',   'where to build — a Figma file key, and the page'],
]
const missing = REQUIRED.filter(([k]) => !a[k] || String(a[k]).trim() === '')

if (missing.length) {
  missing.forEach(([k, why]) => log(`missing arg: ${k} — ${why}`))
  return {
    outcome: 'INVALID CALL — nothing dispatched',
    missing: missing.map(([k, why]) => ({ arg: k, needs: why })),
    got: a,
    why: 'Every agent prompt is built from these. Running without them spends five dispatches ' +
         'on the word "undefined". Nothing was dispatched and nothing was charged.',
    example: {
      brief: 'Spring promo for the Drift commuter e-bike. Audience 28-45 replacing a second car. ' +
             'Claim to prove: it is not a sports object.',
      platforms: 'Meta Feed 4:5 + Stories 9:16',
      masterSize: '1080x1080',
      inventoryPath: './photography/2026-approved/',
      destination: 'Figma file <fileKey>, page "03 Ad Kit"',
    },
    note: 'No client profile? The chain still runs, but tokens, source law and compliance go ' +
          'unchecked — set one up with /new-client first if this is real work.',
  }
}


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

const profile = 'Load the ACTIVE CLIENT PROFILE from `.creative-team/` first; if there is none, say so and work in reduced scope. '
const extra = a.constraints ? ` Constraints: ${a.constraints}.` : ''

phase('Copy')
const deck = await agent(
  `${profile}Write the copy deck for this brief: ${a.brief}. Platforms: ${a.platforms}. ` +
  `Read the relevant files in knowledge/platforms/ and write INSIDE the character limits for these ` +
  `placements — note in charNotes where a limit forced a choice.${extra} ` +
  `Assert no factual claim the profile does not substantiate; everything unconfirmed goes to clientVerify.`,
  { ...tier('content-creator'), agentType: 'content-creator', schema: DECK, phase: 'Copy' })
log(`Headline: ${deck.headline}`)

phase('Concept')
const concept = await agent(
  `${profile}Direct the concept. Brief: ${a.brief}. Copy deck: ${JSON.stringify(deck)}. ` +
  `Master size: ${a.masterSize}. Platforms: ${a.platforms}.${extra} ` +
  `Name the ONE subject that owns the frame at 0.5s, and the hero that PROVES the headline — a generic ` +
  `product shot under any claim is lazy. State heroCriteria precisely enough for the art-director to ` +
  `select against. Remember an ad is not a page: fewest elements that carry the idea.`,
  { ...tier('creative-director'), agentType: 'creative-director', schema: CONCEPT, phase: 'Concept' })
log(`Subject: ${concept.subject}`)

phase('Select')
const pick = await agent(
  `${profile}Select the hero. Audit the COMPLETE inventory at: ${a.inventoryPath} — open every ` +
  `candidate; a shortlist someone else made is a decision already taken. Criteria: ${concept.heroCriteria}. ` +
  `It must prove: "${deck.headline}". Target ${a.masterSize}, and it must read at small size.${extra} ` +
  `DEFAULT TO BUILDING. Set SELECTED when an asset proves the claim cleanly. Set ` +
  `SELECTED-WITH-RESERVATIONS — and name the best available asset anyway — when it is imperfect but ` +
  `usable; put the compromises in 'reservations' and they travel to the gate as known issues. ` +
  `Reserve ASK-CLIENT and NO-VIABLE-ASSET for work that would be harmful, illegal, off-brand beyond ` +
  `repair, or actively misleading. "Weaker than I would like" is a reservation, not a refusal — a ` +
  `client who asked for an ad expects an ad, with your objections attached.`,
  { ...tier('art-director'), agentType: 'art-director', schema: PICK, phase: 'Select' })

const PROCEED = ['SELECTED', 'SELECTED-WITH-RESERVATIONS']
if (!pick || !PROCEED.includes(pick.outcome)) {
  log(`AD declined: ${pick ? pick.outcome : 'NO RESULT'}`)
  return { outcome: pick ? pick.outcome : 'NO-RESULT', halted: 'Select', deck, concept,
    clientAsk: pick && pick.clientAsk, reasoning: pick && pick.reasoning,
    note: 'Stopped before build. Reserved for harmful, illegal or actively misleading work — ' +
          'an imperfect asset should have produced SELECTED-WITH-RESERVATIONS instead.' }
}

phase('Build')
const build = await agent(
  `${profile}Build the master creative at ${a.masterSize} in: ${a.destination}. ` +
  `Directive: ${concept.directive}. Copy: ${JSON.stringify(deck)}. Hero: ${pick.chosenPath} ` +
  `(crop notes: ${pick.cropNotes || 'none'}).${extra} ` +
  `Follow your "Building from zero" order: artboard from the format matrix, frame and margins, ` +
  `safe-zone guides converted to px from knowledge/platforms/ BEFORE placing anything, then hero by ` +
  `measured ratio, then type from the profile's scale, then the mandated legal line to spec. ` +
  `Tokens only — a value not in the profile is a question, not a choice. ` +
  `Apply your Craft section: choose a layout system and name it in layoutSystem, decide the eye path, ` +
  `and make sure your largest empty area is shaped rather than leftover. ` +
  `If you disagree with the art-director's direction, put it in the conflict field — do not decide silently. ` +
  `Self-verify at zoom before returning. ESCALATE rather than invent or guess.`,
  { ...tier('designer'), agentType: 'designer', schema: BUILD, phase: 'Build' })
if (!build || build.status === 'ESCALATE') return { outcome: 'ESCALATED', deck, concept, pick, build }

// A flagged disagreement goes to the creative-director, who owns the tiebreak.
let ruling = null
if (build.conflict && build.conflict.trim()) {
  phase('Build')
  log('Conflict raised — routing to the creative-director for a ruling')
  ruling = await agent(
    `${profile}The designer and the art-director disagree on this build and the designer escalated ` +
    `rather than deciding. Rule on it — you own the tiebreak.\n\nCONFLICT: ${build.conflict}\n` +
    `Layout system the designer chose: ${build.layoutSystem || 'not stated'}\n` +
    `Build notes: ${build.notes}\nTarget: ${a.destination}. Directive was: ${concept.directive}\n\n` +
    `Rule on the OBJECTIVE, not the measurement — a role can be measurably right about the wrong ` +
    `question. Say concretely what should happen, and name whose reasoning you are setting aside.`,
    { ...tier('creative-director'), agentType: 'creative-director', schema: RULING, phase: 'Build', label: 'cd-ruling' })
  if (ruling) log(`CD ruling: ${ruling.ruling}`)
}

phase('Verify')
let verdict = await agent(
  `${profile}Verify the built creative in ${a.destination}. Designer notes: ${build.notes}. ` +
  `READ-ONLY. Render ~1300px plus zoom crops of every edge and seam. Full hunt list, plus: does the ` +
  `hero prove "${deck.headline}", and is anything load-bearing inside the platform safe zone? ` +
  `Judge at full size AND at squint. Findings with px fixes. PASS/FAIL.`,
  { ...tier('art-director'), agentType: 'art-director', schema: VERDICT, phase: 'Verify' })

if (verdict && verdict.verdict === 'FAIL') {
  const fix = await agent(
    `${profile}Fix round (FINAL — 2-strike applies) on ${a.destination}. ` +
    `Apply exactly: ${JSON.stringify(verdict.findings)}. Self-verify. ESCALATE if it cannot be clean.`,
    { ...tier('designer'), agentType: 'designer', schema: BUILD, phase: 'Verify', label: 'designer-fix' })
  if (!fix || fix.status === 'ESCALATE') return { outcome: 'ESCALATED-AFTER-VERIFY', deck, concept, pick, verdict, fix }
  verdict = await agent(
    `${profile}Final re-verify of ${a.destination} after: ${fix.notes}. Scoped to the prior findings only. PASS/FAIL.`,
    { ...tier('art-director'), agentType: 'art-director', schema: VERDICT, phase: 'Verify', label: 'ad-reverify' })
}

return {
  outcome: verdict ? verdict.verdict : 'NO-VERDICT',
  deck, concept,
  hero: { path: pick.chosenPath, why: pick.reasoning, flags: pick.complianceFlags },
  reservations: pick.reservations || null,
  built: build.changedIds,
  findings: verdict ? verdict.findings : [],
  ruling,
  layoutSystem: build.layoutSystem,
  clientVerify: deck.clientVerify,
  next: 'Master only. Run /creative-gate before showing it, and derive the other sizes only after it passes.',
}
