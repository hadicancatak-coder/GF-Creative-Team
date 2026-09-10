export const meta = {
  name: 'create-ad',
  description: 'The one process: brief to built, gated ad creative in Figma — concept, copy, asset, build, gate, verdict',
  whenToUse: 'There is a brief and no artwork yet. This is the whole pipeline; there is no faster variant',
  phases: [
    { title: 'Concept', detail: 'creative-director sets the one idea and the directive' },
    { title: 'Copy',    detail: 'content-creator writes the deck to that idea' },
    { title: 'Select',  detail: 'art-director picks the hero from the full inventory' },
    { title: 'Build',   detail: 'designer builds the master artboard in Figma' },
    { title: 'Gate',    detail: 'four reviewers in parallel, quality-officer last on final state' },
    { title: 'Fix',     detail: 'designer applies confirmed findings; the failed roles re-gate' },
    { title: 'Verdict', detail: 'consolidate into SHIP / COMP-APPROVED / FIX / BLOCK, plus marker and ledger' },
  ],
}

// ONE PROCESS. There is no `depth` argument and there will not be one.
//
// Two earlier versions offered a cheap mode beside this chain. Every defect it ever produced was
// unique to it: a merged dispatch whose schema could not hold its own prompt (U52), speed tuning that
// silently suppressed the craft self-checks (U53), and a build that reported a departure from the
// directive as compliance (U54). The cheap mode was also, by construction, the one that shipped
// ungated work. Collapsing to one process deletes that defect class outright.
//
// The answer to cost is not a weaker second pipeline — it is making the correct one affordable:
// per-role model and effort tiering, scoped reading, review fanned out in parallel rather than run
// serially, and no dispatch that re-measures what another role already measured.
//
// args: {
//   brief          string  REQUIRED  what the ad is for — audience, the offer, the claim to prove
//   platforms      string  REQUIRED  e.g. "Meta Feed 4:5 + Stories 9:16". Never guessed
//   date           string  REQUIRED  ISO date, supplied by the CALLER, not by the user — workflow
//                                    scripts cannot read the clock, and the gate marker needs it
//   masterSize     string  optional  e.g. "1080x1350". Derived from the placement spec when absent
//   inventoryPath  string  optional  the COMPLETE asset folder. Absent ⇒ declared type-only route
//   destination    string  optional  Figma file key and page. Absent ⇒ the designer creates the file
//   constraints    string  optional  extra compliance or craft constraints
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
async function runGate({ targets, location, context, date, gatePhase, fixPhase }) {
  const where = location ? ` They live in: ${location}.` : ''
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
        `${where}${ctx}\n${READ_SCOPE}\n\n${s.focus}\n\n` +
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

// ── File-local schemas ────────────────────────────────────────────────────────
const CONCEPT = { type: 'object', required: ['subject', 'directive', 'proportions'], properties: {
  subject: { type: 'string' },        // the ONE thing that owns the frame at 0.5s
  directive: { type: 'string' },      // INTENT and hierarchy. Never absolute pixel coordinates.
  // Proportion is the concept's business; the NUMBERS that deliver it are the designer's. Splitting
  // them this way is the whole point: a director who writes y-coordinates has done the designer's job,
  // and the designer then has nothing left to decide but typing. See U59.
  proportions: { type: 'string' },    // dominant element + its share of frame + why; message vs decoration
  typeStep: { type: 'string' },       // which step of the display scale, ARGUED against the others
  masterSize: { type: 'string' },     // confirmed, or derived from the placement spec
  sizeBasis: { type: 'string' },      // which named placement the size came from, and the file
  heroCriteria: { type: 'string' }, risks: { type: 'string' } } }

const DECK = { type: 'object', required: ['headline', 'cta', 'proof'], properties: {
  eyebrow: { type: 'string' }, headline: { type: 'string' }, accentLine: { type: 'string' },
  subline: { type: 'string' }, cta: { type: 'string' },
  proof: { type: 'string' },          // the visual the copy requires in order to be true
  clientVerify: { type: 'string' },   // claims the profile could not substantiate
  charNotes: { type: 'string' } } }

// `outcome` is required and `chosenPath` is NOT. A schema that demands a path forces the
// art-director to nominate a least-bad asset, which is exactly the failure law 3 and eval U10
// exist to prevent. Keep every escape hatch optional: a required field is a forced answer.
const PICK = { type: 'object', required: ['outcome', 'reasoning'], properties: {
  outcome: { type: 'string', enum: ['SELECTED', 'SELECTED-WITH-RESERVATIONS', 'ASK-CLIENT', 'NO-VIABLE-ASSET'] },
  reservations: { type: 'string' },   // travels to the gate as a known issue
  chosenPath: { type: 'string' }, reasoning: { type: 'string' },
  clientAsk: { type: 'string' }, cropNotes: { type: 'string' }, complianceFlags: { type: 'string' } } }

const BUILD = { type: 'object', required: ['status', 'changedIds', 'notes'], properties: {
  status: { type: 'string', enum: ['DONE', 'ESCALATE'] },
  changedIds: { type: 'array', items: { type: 'string' } }, notes: { type: 'string' },
  location: { type: 'string' },       // where it actually landed, if the designer created the file
  artboardIds: { type: 'array', items: { type: 'string' } },  // the CREATIVES — what the gate reviews
  emptiestRegion: { type: 'string' }, // the measured number, not an adjective
  deviations: { type: 'string' },      // every measurable departure from the directive
  conflict: { type: 'string' },        // routed to the CD for a ruling, never decided silently
  layoutSystem: { type: 'string' } } }

const RULING = { type: 'object', required: ['ruling', 'rationale'], properties: {
  ruling: { type: 'string' }, rationale: { type: 'string' }, setAside: { type: 'string' } } }

// ── Preflight ─────────────────────────────────────────────────────────────────
// A bare string is the brief: `/create-ad give me a trading ad` sends a string, not an object,
// and without this every prompt below interpolates the word "undefined".
const a = (typeof args === 'string') ? { brief: args } : (args || {})

// Only three arguments are required, and the user types two of them. Everything else resolves to
// a DECLARED default that is reported back in the result — an earlier version demanded five and
// refused a one-line brief, which is not a pipeline people can actually use.
const REQUIRED = [
  ['brief',     'what the ad is for — the audience, the offer, and the claim the creative must prove'],
  ['platforms', 'e.g. "Meta Feed 4:5 + Stories 9:16". A platform is never guessed: its spec decides ' +
                'the size, the safe zones and the character limits'],
  ['date',      'ISO date, e.g. "2026-09-10". SUPPLIED BY THE CALLER, not by the user: workflow ' +
                'scripts cannot read the clock, and the gate marker and ledger rows are dated'],
]
const missing = REQUIRED.filter(([k]) => !a[k] || String(a[k]).trim() === '')

if (missing.length) {
  missing.forEach(([k, why]) => log(`missing arg: ${k} — ${why}`))
  return {
    outcome: 'INVALID CALL — nothing dispatched, nothing charged',
    missing: missing.map(([k, why]) => ({ arg: k, needs: why })),
    got: a,
    why: 'Every agent prompt is built from these. Running without them spends the whole chain on the ' +
         'word "undefined".',
    example: {
      brief: 'Spring promo for the Drift commuter e-bike. Audience 28-45 replacing a second car. ' +
             'Claim to prove: it is not a sports object.',
      platforms: 'Meta Feed 4:5 + Stories 9:16',
      date: '2026-09-10',
      masterSize: '1080x1350  (optional — derived from the placement spec when omitted)',
      inventoryPath: './photography/2026-approved/  (optional — omit for a type-only build)',
      destination: 'Figma file <fileKey>, page "03 Ad Kit"  (optional — the designer creates one)',
    },
  }
}

// ── Declared defaults ─────────────────────────────────────────────────────────
// Each of these is a real decision. Defaulting silently is how a team ends up building a square for
// a 4:5 placement, so every default taken here is named in the result the caller reads.
const defaults = []
if (!a.masterSize) defaults.push(
  'masterSize: not given — derived from the primary placement in knowledge/platforms/, and the ' +
  'basis is reported in sizeBasis. Nothing else is built until the master is approved.')
if (!a.inventoryPath) defaults.push(
  'inventoryPath: not given — TYPE-ONLY build. No hero asset is selected and none is invented; ' +
  'source law forbids drawing one. Pass an inventory folder to get a photographic or illustrated ' +
  'hero instead.')
if (!a.destination) defaults.push(
  'destination: not given — the designer creates a new Figma file and returns its key in location.')
defaults.forEach(d => log(`default: ${d}`))

const profile =
  'Load the ACTIVE CLIENT PROFILE from `.creative-team/` first. If there is none, say so in your ' +
  'first line and work in reduced scope — brand tokens, source law and compliance go unchecked, and ' +
  'that is a caveat on the output, not a reason to invent values. '
const extra = a.constraints ? ` Constraints: ${a.constraints}.` : ''
const sizeRule = a.masterSize
  ? `Master size: ${a.masterSize}.`
  : 'No master size was given. DERIVE it from the primary placement named in the platform spec — ' +
    'build at the platform\'s RECOMMENDED resolution, never its minimum, and state in sizeBasis ' +
    'which placement and which file the figure came from. Do not fill a gap from memory.'
const target = a.destination
  ? `Build into: ${a.destination}.`
  : 'No destination was given. CREATE a new Figma file named for the campaign, build into it, and ' +
    'return the file key and page in the location field.'

// ── Concept ───────────────────────────────────────────────────────────────────
// The idea precedes the words. Written the other way round the copywriter invents an implicit
// concept and the headline comes out as a specification rather than a hook (U45).
phase('Concept')
const concept = await agent(
  `${profile}Direct the concept. Brief: ${a.brief}. Platforms: ${a.platforms}. ${sizeRule}${extra}\n` +
  `${READ_SCOPE}\n` +
  'Name the ONE subject that owns the frame at half a second, and the hero that PROVES the ' +
  'headline — a generic product shot under any claim is lazy. An ad is not a page: the fewest ' +
  'elements that carry the idea.\n' +
  'DO NOT WRITE PIXEL COORDINATES. No x=, no y=, no "top y=192". The moment you specify the layout ' +
  'numerically you have done the production designer\'s job, and she is left typing rather than ' +
  'composing — which is how a frame ends up token-clean and badly proportioned (U59). Direct INTENT ' +
  'and HIERARCHY; she owns every number.\n' +
  'In `proportions`, state: which element DOMINATES and roughly what share of the frame it should ' +
  'take, and whether that element is the MESSAGE or the DECORATION. If decoration outweighs message ' +
  'you have to justify it or change it. Give the intended ratio of occupied to empty space as a rough ' +
  'target, not a coordinate.\n' +
  'In `typeStep`, name which step of the profile\'s display scale the headline takes AND why, against ' +
  'the other steps it offers. A size inside the scale is not thereby the right one — the biggest step ' +
  'exists to be spent, and an ad whose proposition is verbal usually should spend it.\n' +
  (a.inventoryPath
    ? `State heroCriteria precisely enough for the art-director to select against from the inventory ` +
      `at ${a.inventoryPath}.`
    : 'There is NO asset inventory, so direct a TYPE-ONLY composition: typography, rule, field and ' +
      'negative space are the subject. Do not direct a photographic hero that does not exist, and ' +
      'do not direct anyone to draw one — say so in risks if the claim genuinely needs an image.') +
  `\nState the directive as intent: the layout system, where the subject sits relative to the frame, ` +
  `where the eye enters and where it rests. Say "the lower third stays empty" and let her measure it; ` +
  `do not say "y=927 to y=1287".\n${BREVITY_BUILD}`,
  { ...tier('creative-director'), agentType: 'creative-director', schema: CONCEPT, phase: 'Concept' })
if (!concept) return { outcome: 'NO-RESULT', halted: 'Concept', defaults }
const masterSize = a.masterSize || concept.masterSize
if (!masterSize) return {
  outcome: 'HALTED — no master size',
  halted: 'Concept', concept, defaults,
  why: 'No master size was given and the creative-director could not derive one from the platform ' +
       'spec. Building at a guessed ratio makes every derivative wrong (U38). Pass masterSize, or ' +
       'run /format-matrix first and pass what it returns.' }
log(`Subject: ${concept.subject}`)
log(`Master: ${masterSize}${concept.sizeBasis ? ` (${concept.sizeBasis})` : ''}`)

// ── Copy ──────────────────────────────────────────────────────────────────────
phase('Copy')
const deck = await agent(
  `${profile}Write the copy deck. Brief: ${a.brief}. Platforms: ${a.platforms}. Master: ${masterSize}.\n` +
  `${READ_SCOPE}\n` +
  'THE CONCEPT IS ALREADY SET — write to it, do not invent a different one:\n' +
  `  subject: ${concept.subject}\n  directive: ${concept.directive}\n` +
  'Your headline must earn attention in three words. A specification is not a hook: a spec tells ' +
  'someone who already wants the product which one to buy, and does nothing for the 99% scrolling ' +
  'past. Read your first three words — would a stranger stop?\n' +
  'Write INSIDE the character limits for these placements and note in charNotes where a limit forced ' +
  `a choice. The CTA comes from the approved vocabulary.${extra}\n` +
  'Assert no factual claim the profile does not substantiate; everything unconfirmed goes to ' +
  `clientVerify rather than into the frame.\n${BREVITY_BUILD}`,
  { ...tier('content-creator'), agentType: 'content-creator', schema: DECK, phase: 'Copy' })
if (!deck) return { outcome: 'NO-RESULT', halted: 'Copy', concept, defaults }
log(`Headline: ${deck.headline}`)

// ── Select ────────────────────────────────────────────────────────────────────
// Skipped entirely when there is no inventory: there is nothing to select from, and inventing a
// hero is forbidden by source law. The route is declared in the result rather than implied.
let pick = null
if (a.inventoryPath) {
  phase('Select')
  pick = await agent(
    `${profile}Select the hero. Audit the COMPLETE inventory at: ${a.inventoryPath} — open every ` +
    'candidate; a shortlist someone else made is a decision already taken. ' +
    `Criteria: ${concept.heroCriteria || concept.directive}. It must prove: "${deck.headline}". ` +
    `Target ${masterSize}, and it must read at small size.${extra}\n` +
    'DEFAULT TO BUILDING. SELECTED when an asset proves the claim cleanly. ' +
    'SELECTED-WITH-RESERVATIONS — naming the best available asset anyway — when it is imperfect but ' +
    'usable; put the compromises in reservations and they travel to the gate as known issues. ' +
    'Reserve ASK-CLIENT and NO-VIABLE-ASSET for work that would be harmful, illegal, off-brand ' +
    'beyond repair, or actively misleading. "Weaker than I would like" is a reservation, not a ' +
    `refusal: a client who asked for an ad expects an ad, with your objections attached (U43).\n${BREVITY_BUILD}`,
    { ...tier('art-director'), agentType: 'art-director', schema: PICK, phase: 'Select' })

  const PROCEED = ['SELECTED', 'SELECTED-WITH-RESERVATIONS']
  if (!pick || !PROCEED.includes(pick.outcome)) {
    log(`Art director declined: ${pick ? pick.outcome : 'NO RESULT'}`)
    return {
      outcome: pick ? pick.outcome : 'NO-RESULT', halted: 'Select',
      concept, deck, defaults,
      clientAsk: pick && pick.clientAsk, reasoning: pick && pick.reasoning,
      note: 'Stopped before the build. This outcome is reserved for work that would be harmful, ' +
            'illegal or actively misleading — an asset that is merely imperfect should have produced ' +
            'SELECTED-WITH-RESERVATIONS and a build.',
    }
  }
  log(`Hero: ${pick.chosenPath || '(none named)'} — ${pick.outcome}`)
}

// ── Build ─────────────────────────────────────────────────────────────────────
phase('Build')
const build = await agent(
  `${profile}Build the master creative at ${masterSize}. ${target}\n${READ_SCOPE}\n` +
  `Directive: ${concept.directive}\nCopy: ${JSON.stringify(deck)}\n` +
  (pick
    ? `Hero: ${pick.chosenPath} (crop notes: ${pick.cropNotes || 'none'})` +
      (pick.reservations ? `\nKnown reservations on this asset, which travel to the gate: ${pick.reservations}` : '')
    : 'TYPE-ONLY build: there is no asset inventory. Typography, rule, field and negative space are ' +
      'the composition. Never invent, draw or generate a hero to fill the gap — source law forbids ' +
      'it, and an empty frame with a reason beats a fabricated one.') + `${extra}\n` +
  'Follow your "Building from zero" order: artboard from the format matrix, frame and margins, ' +
  'safe-zone guides converted to px from `knowledge/platforms/` BEFORE placing anything, then the ' +
  'subject by measured ratio, then type from the profile scale, then the mandated legal line to spec. ' +
  'Tokens only — a value not in the profile is a question, not a choice. The CTA is a BUTTON with a ' +
  'fill, never bare text (U46). Integer coordinates. Cite sources in layer names: an assertion is ' +
  'not a citation (U39).\n' +
  'YOU own every number. The directive gives intent and proportion; the coordinates, the spacing and ' +
  'the type size are yours to derive from the profile scale — and to argue with if the intent cannot ' +
  'be hit on-scale. Return the top-level artboard id(s) in artboardIds.\n' +
  'Choose a layout system and name it in layoutSystem. Decide the eye path.\n' +
  'NON-OPTIONAL before you return, however brief you are being:\n' +
  '  (a) MEASURE the largest empty region as a percentage of canvas and report the number in ' +
  'emptiestRegion. Above ~20% and open to the background on two sides is a hole, not composed ' +
  'space — fix it first, and report the number either way. Never describe emptiness as "composed" ' +
  'without the measurement (U47, U53).\n' +
  '  (b) Put EVERY measurable departure from the directive in deviations — a different crop, more ' +
  'empty space than directed, altered copy. A departure reported as compliance makes the whole ' +
  'hand-off untrustworthy and the next role has no reason to re-measure (U54).\n' +
  '  (c) If a required face is absent from the RENDERER — not merely from the machine — that is a ' +
  'BLOCKING flag at the top of your notes, never a footnote. Do not substitute silently (U40, U48).\n' +
  'If you disagree with the direction, put it in conflict; do not decide silently. ESCALATE rather ' +
  `than invent or guess.\n${BREVITY_BUILD}`,
  { ...tier('designer'), agentType: 'designer', schema: BUILD, phase: 'Build' })
if (!build || build.status === 'ESCALATE')
  return { outcome: 'ESCALATED', halted: 'Build', concept, deck, pick, build, defaults }
// DONE with nothing changed is not a build. Left unguarded it hands the gate an EMPTY target list,
// four reviewers find nothing in nothing, and the run returns SHIP on an artifact that does not
// exist. Absence of findings is not absence of defects (U14), and absence of nodes is not a build.
if (!Array.isArray(build.changedIds) || build.changedIds.length === 0)
  return {
    outcome: 'ESCALATED — build reported DONE and changed no nodes',
    halted: 'Build', concept, deck, pick, build, defaults,
    why: 'There is nothing to gate. A gate over an empty target set returns SHIP on an artifact that ' +
         'was never made, which is worse than a failed build because it looks like a pass.',
  }
const location = build.location || a.destination || null
log(`Built: ${build.changedIds.join(', ')}${location ? ` in ${location}` : ''}`)
if (build.emptiestRegion) log(`Largest empty region: ${build.emptiestRegion}`)
if (build.deviations) log(`Declared deviations: ${build.deviations}`)

// A flagged disagreement goes to the creative-director, who owns the tiebreak. Conditional, so a
// clean build never pays for it.
let ruling = null
if (build.conflict && build.conflict.trim()) {
  log('Conflict raised — routing to the creative-director for a ruling')
  ruling = await agent(
    `${profile}The designer escalated a disagreement on this build rather than deciding it. Rule on ` +
    `it — you own the tiebreak.\n\nCONFLICT: ${build.conflict}\n` +
    `Layout system chosen: ${build.layoutSystem || 'not stated'}\nBuild notes: ${build.notes}\n` +
    `Your directive was: ${concept.directive}\n\n` +
    'Rule on the OBJECTIVE, not the measurement — a role can be measurably right about the wrong ' +
    `question. Say concretely what happens, and name whose reasoning you are setting aside.\n${BREVITY_BUILD}`,
    { ...tier('creative-director'), agentType: 'creative-director', schema: RULING,
      phase: 'Build', label: 'cd-ruling' })
  if (ruling) log(`Ruling: ${ruling.ruling}`)
}

// ── Gate ──────────────────────────────────────────────────────────────────────
// No separate art-director verify pass runs before this. It used to, and it measured the same frame
// the gate's art-director measures — one serial dispatch to pre-empt a review that runs anyway, in
// parallel, alongside three other roles. The gate IS the verify.
// The gate gets the BRIEF and the ARTIFACT. Nothing else.
//
// It used to also receive the designer's declared deviations and the creative-director's ruling. That
// anchors it: on the first live run the art-director wrote "per the ruling I am not proposing to
// shorten it" about the one element it was there to contest. A reviewer handed the defence before the
// evidence is reviewing the defence. Deviations and rulings travel to the HUMAN, in the result.
//
// Targets are the ARTBOARD(S), not every touched node. `changedIds` is the record of what was built;
// on the first live run it made 38 targets, thirty of them 3x120px rectangles, each of which four
// roles were told to render at 1300px and zoom-crop. The gate's unit is the creative.
// Guessing here is worse than the bug it replaced. Reviewing all 38 nodes was noisy and obvious;
// reviewing the WRONG single node is silent and looks like a pass. So guess only when there is
// nothing to guess between.
let artboards
if (build.artboardIds && build.artboardIds.length) {
  artboards = build.artboardIds
} else if (build.changedIds.length === 1) {
  artboards = build.changedIds            // unambiguous: one node, and it is the creative
  log('artboardIds not returned; one node changed, so it is the target')
} else {
  return {
    outcome: 'ESCALATED — build did not say which nodes are the creatives',
    halted: 'Build', concept, deck, pick, build, ruling, location, defaults,
    why: `The designer returned ${build.changedIds.length} changed nodes and no artboardIds, so the ` +
         'gate cannot tell a creative from a rectangle inside one. Picking the first id is a ' +
         'convention, not a guarantee: get it wrong and four reviewers gate a 3px rule and report ' +
         'it clean. Re-run the build asking for artboardIds, or gate the artboard directly with ' +
         '/creative-gate.',
  }
}
const gate = await runGate({
  targets: artboards.map(id => ({ id, note: 'master built this run' })),
  location,
  context: `${a.brief} — master ${masterSize} for ${a.platforms}.`,
  date: a.date,
  gatePhase: 'Gate',
  fixPhase: 'Fix',
})

phase('Verdict')
log(`Gate: ${gate.decision}`)

return {
  outcome: gate.decision,
  masterSize, sizeBasis: concept.sizeBasis || 'given by the caller',
  location,
  route: a.inventoryPath ? 'hero selected from inventory' : 'type-only (no inventory given)',
  defaults,
  concept, deck,
  hero: pick ? { path: pick.chosenPath, why: pick.reasoning, flags: pick.complianceFlags,
                 reservations: pick.reservations || null } : null,
  built: build.changedIds,
  layoutSystem: build.layoutSystem,
  emptiestRegion: build.emptiestRegion || null,
  deviations: build.deviations || null,
  ruling,
  gate,
  // Raised by the gate, real, and NOT the designer's to fix — another role's deliverable, a client
  // ask, or work the brief sequences for later. These are yours, not hers.
  forHuman: gate.forHuman || [],
  declaredDeviations: build.deviations || null,
  clientVerify: deck.clientVerify || null,
  // The caller writes these. Workflow scripts have no filesystem access, and a gate whose result
  // was never recorded did not happen — the Stop hook is right to keep blocking until it is (U37).
  writeThese: {
    marker: gate.marker, ledger: gate.ledger,
    how: 'Write marker.path from marker.decision, marker.rounds and marker.openItems. Append each ' +
         'ledger row to .gates/ledger.csv as date,agent,purpose,tokens,tool_uses,duration_ms,outcome, ' +
         'filling tokens/tool_uses/duration_ms from the task usage stats — the script cannot see them, ' +
         'and a null-token row is an incomplete ledger (U15).',
  },
  next: 'This is the master only, and it is gated. Derive the remaining sizes from the format matrix ' +
        'once the master is approved — never build ten sizes of an idea nobody has approved.',
}
