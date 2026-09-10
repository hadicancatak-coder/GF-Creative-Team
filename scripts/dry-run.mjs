#!/usr/bin/env node
// Dry-run the orchestrations against a stubbed engine.
//
//   node scripts/dry-run.mjs          # run every scenario
//   node scripts/dry-run.mjs --quiet  # failures only
//
// Why this exists. Every orchestration bug in this repo's history was found by a live run that
// burned real tokens: a preflight that interpolated "undefined" into five prompts, a merged
// dispatch whose schema could not hold its own prompt (U52, 114k tokens to discover), a gate that
// could report a clean pass on stalled agents (U14). All of them are control-flow and schema bugs,
// and none of them needed a model to find.
//
// So: substitute the engine. `agent`, `parallel`, `phase` and `log` become stubs that record what
// was dispatched and return whatever the scenario says a role returned. Then assert on the routing
// — who was dispatched, in what order, with what schema, and what verdict came out. No tokens, no
// Figma, no network, and it runs in CI on every push.
//
// What it cannot check: whether an agent is any GOOD. That is what evals/ is for. This checks that
// the machine around the agents is wired correctly, which is the half that is deterministic.

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const QUIET = process.argv.includes('--quiet')
let ERR = 0
const ok = m => { if (!QUIET) console.log(`  ok   ${m}`) }
const err = m => { console.log(`  ERR  ${m}`); ERR++ }
const head = m => { if (!QUIET) console.log(`\n== ${m} ==`) }

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor

// ── The stubbed engine ────────────────────────────────────────────────────────
// `respond(opts, prompt, nth)` is the scenario: it plays every role. Returning null or undefined
// simulates an agent that stalled, which is a case the gate must handle rather than pass.
async function run (workflow, args, respond) {
  const src = readFileSync(join(ROOT, 'workflows', workflow), 'utf8')
  const body = src.replace(/^export const meta/m, 'globalThis.__meta')

  const calls = []
  const phases = []
  const logs = []
  const counts = {}

  const agent = async (prompt, opts = {}) => {
    const key = `${opts.agentType}:${opts.phase}`
    counts[key] = (counts[key] || 0) + 1
    const call = { prompt, opts, agentType: opts.agentType, phase: opts.phase,
                   label: opts.label, schema: opts.schema, nth: counts[key] }
    calls.push(call)
    call.returned = await respond(opts, prompt, counts[key])
    return call.returned
  }
  // The real engine runs these concurrently; concurrency is not what is under test here, the
  // grouping is. Running them in order keeps the recorded call sequence deterministic.
  const parallel = async fns => { const out = []; for (const f of fns) out.push(await f()); return out }
  const pipeline = async () => { throw new Error('pipeline() is not used by these workflows') }

  const fn = new AsyncFunction('args', 'agent', 'parallel', 'pipeline', 'phase', 'log', body)
  const result = await fn(args, agent, parallel, pipeline, p => phases.push(p), m => logs.push(String(m)))
  return { result, calls, phases, logs, meta: globalThis.__meta }
}

const dispatched = (r, agentType, phase) =>
  r.calls.filter(c => c.agentType === agentType && (!phase || c.phase === phase))

// ── Structural checks, run against every workflow ─────────────────────────────
function checkStructure (name, r) {
  const titles = new Set((r.meta.phases || []).map(p => p.title))
  // The Workflow tool matches phase() titles to meta.phases EXACTLY. A typo means a phase that
  // never renders, and nothing else complains about it.
  for (const p of new Set(r.phases)) {
    if (titles.has(p)) ok(`${name}: phase('${p}') declared in meta`)
    else err(`${name}: phase('${p}') is not in meta.phases — titles must match exactly`)
  }
  for (const c of r.calls) {
    const s = c.schema
    if (!s || s.type !== 'object' || !s.properties) {
      err(`${name}: ${c.agentType} in ${c.phase} was dispatched without an object schema`)
      continue
    }
    // U52: a prompt asking for fields the schema cannot hold is unsatisfiable, and the agent burns
    // its retry cap trying to obey both. A required key with no property is that bug, statically.
    const orphan = (s.required || []).filter(k => !(k in s.properties))
    if (orphan.length) err(`${name}: ${c.agentType}/${c.phase} schema requires ${orphan.join(', ')} with no such property (U52)`)
    // And the scenario's own answer must satisfy the schema it is answering, or the test is lying.
    if (c.returned) {
      const absent = (s.required || []).filter(k => c.returned[k] === undefined)
      if (absent.length) err(`${name}: stub reply for ${c.agentType}/${c.phase} omits required ${absent.join(', ')}`)
    }
  }
  if (!r.calls.some(c => !c.schema)) ok(`${name}: every dispatch carries a schema whose required fields exist`)
}

// ── Scenario vocabulary ───────────────────────────────────────────────────────
const CONCEPT = { subject: 'the commute, not the bike', directive: 'hero lower-right, empty lower third',
                  proportions: 'hero dominates ~45% of frame; message beats decoration',
                  typeStep: '128 — the top step, because the proposition is verbal',
                  masterSize: '1080x1350', sizeBasis: 'Meta Feed 4:5, knowledge/platforms/meta.md',
                  heroCriteria: 'a bike being used, not posed' }
const DECK = { headline: 'Traffic is optional.', cta: 'Book a test ride', proof: 'a bike in real traffic',
               clientVerify: 'range figure unconfirmed' }
const PICK = { outcome: 'SELECTED', reasoning: 'the only frame with a rider in motion',
               chosenPath: './photography/2026-approved/drift-commute-03.jpg' }
const BUILT = { status: 'DONE', changedIds: ['25:2', '25:3', '25:4'], artboardIds: ['25:2'],
                notes: 'built to directive',
                emptiestRegion: '12% upper-left, bounded on two sides', deviations: 'none' }
const CLEAN = { verdict: 'PASS', findings: [], checks: 'all non-optional checks answered' }
const finding = (severity, over = {}) => ({
  severity, where: '25:2', issue: `${severity} issue`, fix: 'do the thing', ...over })

// The production half of create-ad, played straight. Gate answers come from `gateReply`.
const production = gateReply => (opts, _prompt, nth) => {
  const { agentType, phase } = opts
  if (phase === 'Concept') return CONCEPT
  if (phase === 'Copy') return DECK
  if (phase === 'Select') return PICK
  if (phase === 'Build' && agentType === 'designer') return BUILT
  if (phase === 'Build' && agentType === 'creative-director') return { ruling: 'AD wins', rationale: 'x' }
  if (phase === 'Fix' && agentType === 'designer')
    return { status: 'DONE', changedIds: ['25:2'], applied: 'the findings', skipped: 'nothing' }
  return gateReply(opts, _prompt, nth)
}
const GATE_ARGS = { targets: [{ id: '25:2', name: 'master' }], date: '2026-09-10',
                    location: 'Figma file ABC, page "03 Ad Kit"', context: 'master for approval' }
const AD_ARGS = { brief: 'spring promo', platforms: 'Meta Feed 4:5', date: '2026-09-10',
                  inventoryPath: './photography/2026-approved/', destination: 'Figma file ABC' }

// ── create-ad ─────────────────────────────────────────────────────────────────
head('create-ad — the one process')
{
  const r = await run('create-ad.js', AD_ARGS, production(() => CLEAN))
  checkStructure('create-ad', r)
  const seq = r.calls.map(c => `${c.phase}/${c.agentType}`)
  r.result.outcome === 'SHIP'
    ? ok('clean run returns SHIP')
    : err(`clean run returned ${r.result.outcome}, expected SHIP`)
  // Production is sequential and single-purpose: one role, one job. Merging any two of these is
  // what produced U52, U53 and U54, all three of which existed only in the mode that merged them.
  // The gate reviews the ARTBOARD, not all three touched nodes.
  const gateTargets = JSON.parse(dispatched(r, 'art-director', 'Gate')[0].prompt.match(/Targets: (\[.*?\])\./s)[1])
  gateTargets.length === 1 && gateTargets[0].id === '25:2'
    ? ok('the gate is handed the artboard, not every changed node')
    : err(`gate received ${gateTargets.length} targets: ${JSON.stringify(gateTargets)}`)
  // The reviewers must not be handed the designer's defence or the CD's ruling before they look.
  const gatePrompts = r.calls.filter(c => c.phase === 'Gate').map(c => c.prompt).join('\n')
  const unanchored = !/deviation|ruling/i.test(gatePrompts)
  unanchored
    ? ok('no designer deviations and no CD ruling leak into the gate context')
    : err('the gate context contains the deviations or the ruling — the reviewers are anchored')
  const expected = ['Concept/creative-director', 'Copy/content-creator', 'Select/art-director',
                    'Build/designer', 'Gate/art-director', 'Gate/design-analyst',
                    'Gate/content-creator', 'Gate/quality-officer']
  JSON.stringify(seq) === JSON.stringify(expected)
    ? ok(`clean run is exactly ${expected.length} dispatches, in order, no role doing two jobs`)
    : err(`dispatch sequence was ${JSON.stringify(seq)}, expected ${JSON.stringify(expected)}`)
  // U45: the idea precedes the words.
  seq.indexOf('Concept/creative-director') < seq.indexOf('Copy/content-creator')
    ? ok('concept precedes copy (U45)') : err('copy ran before concept (U45)')
  // The quality-officer certifies final state, so nothing may be dispatched after it.
  seq[seq.length - 1] === 'Gate/quality-officer'
    ? ok('quality-officer is the last dispatch — it gates final state')
    : err('something was dispatched after the quality-officer')
  r.result.gate && r.result.gate.marker && r.result.gate.marker.path.startsWith('.gates/2026-09-10-')
    ? ok('returns a dated gate marker for the caller to write (U37)')
    : err('no dated gate marker returned')
  r.result.writeThese && Array.isArray(r.result.writeThese.ledger) && r.result.writeThese.ledger.length
    ? ok(`returns ${r.result.writeThese.ledger.length} ledger rows for the caller to write`)
    : err('no ledger rows returned')
  // The whole reason the two-speed design was removed: the cheap path shipped ungated work.
  if (/depth/i.test(JSON.stringify(r.result))) err('the result mentions depth — there is one process')
  else ok('no depth anywhere in the result')
}
{
  const r = await run('create-ad.js', { brief: 'give me a trading ad' }, () => { throw new Error('dispatched!') })
  r.calls.length === 0 && String(r.result.outcome).startsWith('INVALID CALL')
    ? ok('a bare one-line brief is refused before any dispatch, not after five')
    : err(`bare brief dispatched ${r.calls.length} agents / returned ${r.result.outcome}`)
  const named = r.result.missing.map(m => m.arg).sort().join(',')
  named === 'date,platforms'
    ? ok('names exactly what is missing: platforms and the caller-supplied date')
    : err(`reported missing = ${named}, expected date,platforms`)
}
{
  // Ease of use: two user-typed arguments must be enough to get artwork.
  const r = await run('create-ad.js', { brief: 'spring promo', platforms: 'Meta Feed 4:5', date: '2026-09-10' },
                      production(() => CLEAN))
  r.result.outcome === 'SHIP'
    ? ok('brief + platforms alone produces a gated build — no size, no inventory, no destination')
    : err(`minimal call returned ${r.result.outcome}`)
  r.result.defaults.length === 3
    ? ok('all three defaults taken are declared back to the caller, not applied silently')
    : err(`declared ${r.result.defaults.length} defaults, expected 3`)
  dispatched(r, 'art-director', 'Select').length === 0
    ? ok('no inventory ⇒ Select is not dispatched; there is nothing to select from')
    : err('Select ran with no inventory')
  const cdPrompt = dispatched(r, 'creative-director', 'Concept')[0].prompt
  const noCoords = /DO NOT WRITE PIXEL COORDINATES/.test(cdPrompt)
  noCoords
    ? ok('the creative-director is forbidden absolute coordinates (U59)')
    : err('the creative-director may still write the layout in pixels')
  const build = dispatched(r, 'designer', 'Build')[0]
  const typeOnly = /TYPE-ONLY/.test(build.prompt) && /[Nn]ever invent/.test(build.prompt)
  typeOnly
    ? ok('no inventory ⇒ the designer is told type-only and forbidden to invent a hero (source law)')
    : err('type-only route does not forbid inventing a hero')
  r.result.route === 'type-only (no inventory given)'
    ? ok('the route taken is reported in the result') : err('route not reported')
}
{
  const r = await run('create-ad.js', AD_ARGS, (opts, p, n) =>
    opts.phase === 'Select' ? { outcome: 'ASK-CLIENT', reasoning: 'nothing proves the claim',
                                clientAsk: 'a photograph of the bike in traffic' }
                            : production(() => CLEAN)(opts, p, n))
  r.result.outcome === 'ASK-CLIENT' && dispatched(r, 'designer').length === 0
    ? ok('ASK-CLIENT halts before the build — no artwork is made from a least-bad asset (U10)')
    : err('ASK-CLIENT did not halt the chain before the build')
}
{
  const r = await run('create-ad.js', AD_ARGS, (opts, p, n) =>
    opts.phase === 'Build' && opts.agentType === 'designer'
      ? { ...BUILT, conflict: 'the directive puts the CTA inside the Stories safe zone' }
      : production(() => CLEAN)(opts, p, n))
  dispatched(r, 'creative-director', 'Build').length === 1 && r.result.ruling
    ? ok('a declared conflict is routed to the creative-director for a ruling, not decided silently')
    : err('a declared conflict was not routed for a ruling')
}

// ── creative-gate ─────────────────────────────────────────────────────────────
head('creative-gate — the one gate')
{
  const r = await run('creative-gate.js', GATE_ARGS, () => CLEAN)
  checkStructure('creative-gate', r)
  r.result.decision === 'SHIP' ? ok('clean gate returns SHIP') : err(`clean gate returned ${r.result.decision}`)
  r.calls.length === 4
    ? ok('4 dispatches — no planning dispatch, and coverage cannot be narrowed')
    : err(`gate used ${r.calls.length} dispatches, expected 4`)
  const roles = r.calls.map(c => c.agentType)
  new Set(roles).size === 4 && roles[3] === 'quality-officer'
    ? ok('four distinct reviewers, quality-officer last (it gates final state)')
    : err(`roster was ${roles.join(', ')}`)
  r.calls.every(c => /READ-ONLY/.test(c.prompt))
    ? ok('every reviewer is told READ-ONLY — only the designer writes')
    : err('a reviewer was dispatched without a READ-ONLY instruction')
  r.calls.every(c => /NON-OPTIONAL/.test(c.prompt))
    ? ok('every reviewer carries checks that brevity may not suppress (U53)')
    : err('a reviewer carries no non-optional checks')
}
{
  // U14: absence of findings is not absence of defects. A stalled reviewer must never look clean.
  const r = await run('creative-gate.js', GATE_ARGS, opts => opts.agentType === 'design-analyst' ? null : CLEAN)
  String(r.result.decision).startsWith('PARTIAL')
    ? ok('a stalled reviewer produces PARTIAL, never a clean-looking pass (U14)')
    : err(`a stalled reviewer produced ${r.result.decision}`)
}
{
  const r = await run('creative-gate.js', GATE_ARGS, () => null)
  String(r.result.decision).startsWith('INCOMPLETE')
    ? ok('all reviewers stalling produces INCOMPLETE') : err(`all-stalled produced ${r.result.decision}`)
}
{
  const r = await run('creative-gate.js', GATE_ARGS, (opts, _p, n) =>
    opts.agentType === 'art-director' && opts.phase === 'Gate' && n === 1
      ? { verdict: 'BLOCK', findings: [finding('BLOCKER')], checks: 'x' } : CLEAN)
  // A BLOCKER is fixed and re-gated; if it survives the rounds the set does not ship.
  r.result.decision === 'BLOCK' || r.result.rounds > 0
    ? ok('a BLOCKER drives a fix round and never silently passes')
    : err(`a BLOCKER produced ${r.result.decision} in ${r.result.rounds} rounds`)
}
{
  // The state the quality-officer certified no longer exists after a fix (U55).
  let regated = false
  const r = await run('creative-gate.js', GATE_ARGS, (opts, _p, n) => {
    if (opts.agentType === 'quality-officer' && opts.phase === 'Fix') regated = true
    if (opts.agentType === 'art-director' && opts.phase === 'Gate' && n === 1)
      return { verdict: 'FAIL', findings: [finding('MAJOR')], checks: 'x' }
    return CLEAN
  })
  regated ? ok('the quality-officer re-gates after ANY fix, even having raised nothing itself (U55)')
          : err('the quality-officer certified a state that a later fix round changed (U55)')
  r.result.decision === 'SHIP' && r.result.rounds === 1
    ? ok('a fixed MAJOR clears in one round and ships')
    : err(`fixed MAJOR gave ${r.result.decision} after ${r.result.rounds} rounds`)
}
{
  // A finding that never clears must exhaust the rounds and reach a human, not loop.
  const r = await run('creative-gate.js', GATE_ARGS, opts =>
    opts.agentType === 'art-director'
      ? { verdict: 'FAIL', findings: [finding('MAJOR')], checks: 'x' } : CLEAN)
  r.result.rounds === 2 && String(r.result.decision).startsWith('ESCALATED')
    ? ok('an unfixable MAJOR exhausts exactly 2 rounds and escalates to a human')
    : err(`unfixable MAJOR gave ${r.result.decision} after ${r.result.rounds} rounds`)
}
{
  // Contested = it touches content the client explicitly asked to keep. That is a decision for the
  // human, and it must never reach the designer as a task.
  const r = await run('creative-gate.js', GATE_ARGS, opts =>
    opts.agentType === 'content-creator' && opts.phase === 'Gate'
      ? { verdict: 'FAIL', findings: [finding('BLOCKER', { contested: true })], checks: 'x' } : CLEAN)
  dispatched(r, 'designer').length === 0 && r.result.contested.length === 1
    ? ok('a contested finding goes to the human and is never auto-applied')
    : err('a contested finding was handed to the designer')
}
{
  // U41: a gate that can only ever say "not yet" is one people start waiving.
  const r = await run('creative-gate.js', GATE_ARGS, opts =>
    opts.agentType === 'design-analyst'
      ? { verdict: 'FAIL', findings: [finding('ENVIRONMENT')], checks: 'x' } : CLEAN)
  String(r.result.decision).startsWith('COMP-APPROVED') && r.result.marker.clearBeforeExport.length === 1
    ? ok('environment-only outstanding ⇒ COMP-APPROVED with a clear-before-export checklist (U41)')
    : err(`environment-only gave ${r.result.decision}`)
  dispatched(r, 'designer').length === 0
    ? ok('no fix round is spent on something re-running cannot change')
    : err('a fix round was spent on an ENVIRONMENT finding')
}
{
  const r = await run('creative-gate.js', GATE_ARGS, opts =>
    opts.agentType === 'quality-officer' ? { verdict: 'UNVERIFIED', findings: [], checks: 'no profile' } : CLEAN)
  String(r.result.decision).startsWith('UNVERIFIED')
    ? ok('no compliance layer ⇒ UNVERIFIED, never SHIP')
    : err(`UNVERIFIED from the quality-officer produced ${r.result.decision}`)
}
{
  // Guessing the artboard among many nodes is silent when wrong: four reviewers would gate a 3px
  // rectangle and report it clean. Ambiguity must escalate, not guess.
  const r = await run('create-ad.js', AD_ARGS, (opts, p, n) =>
    opts.phase === 'Build' && opts.agentType === 'designer'
      ? { status: 'DONE', changedIds: ['25:2', '25:3'], notes: 'n' } : production(() => CLEAN)(opts, p, n))
  const gated = r.calls.filter(c => c.phase === 'Gate').length
  String(r.result.outcome).startsWith('ESCALATED') && gated === 0
    ? ok('a build with many nodes and no artboardIds escalates rather than guessing the target')
    : err(`ambiguous artboard gave ${r.result.outcome} after ${gated} gate dispatches`)
}
{
  // One node changed is unambiguous — that IS the creative, no guess involved.
  const r = await run('create-ad.js', AD_ARGS, (opts, p, n) =>
    opts.phase === 'Build' && opts.agentType === 'designer'
      ? { status: 'DONE', changedIds: ['25:2'], notes: 'n' } : production(() => CLEAN)(opts, p, n))
  r.result.outcome === 'SHIP'
    ? ok('a single changed node needs no artboardIds — it is unambiguously the creative')
    : err(`single-node build gave ${r.result.outcome}`)
}
{
  // A build that reports DONE and changed nothing must not reach the gate: four reviewers would find
  // nothing in nothing and the run would return SHIP on an artifact that was never made.
  const r = await run('create-ad.js', AD_ARGS, (opts, p, n) =>
    opts.phase === 'Build' && opts.agentType === 'designer'
      ? { ...BUILT, changedIds: [] } : production(() => CLEAN)(opts, p, n))
  const gated = r.calls.filter(c => c.phase === 'Gate').length
  String(r.result.outcome).startsWith('ESCALATED') && gated === 0
    ? ok('a build that changed no nodes escalates instead of gating an empty target set')
    : err(`empty build gave ${r.result.outcome} after ${gated} gate dispatches`)
}
{
  // A re-gate that returns nothing must not leave the pre-fix verdict standing — that is how a
  // quality-officer PASS from before a fix becomes a SHIP (U14 one round later, U55).
  const r = await run('creative-gate.js', GATE_ARGS, (opts, _p, n) => {
    if (opts.phase === 'Fix' && opts.agentType === 'quality-officer') return null
    if (opts.phase === 'Fix' && opts.agentType === 'designer')
      return { status: 'DONE', changedIds: ['25:2'], applied: 'the fix', skipped: 'nothing' }
    if (opts.agentType === 'art-director' && opts.phase === 'Gate' && n === 1)
      return { verdict: 'FAIL', findings: [finding('MAJOR')], checks: 'x' }
    return CLEAN
  })
  String(r.result.decision).startsWith('PARTIAL')
    ? ok('a stalled re-gate yields PARTIAL — the pre-fix verdict never stands in for it')
    : err(`a stalled re-gate produced ${r.result.decision}`)
}
{
  // A MAJOR another role owns must not become a designer work order (U60).
  const r = await run('creative-gate.js', GATE_ARGS, opts =>
    opts.agentType === 'content-creator' && opts.phase === 'Gate'
      ? { verdict: 'FAIL', findings: [finding('MAJOR', { owner: 'content-creator' })], checks: 'x' } : CLEAN)
  dispatched(r, 'designer').length === 0 && r.result.forHuman.length === 1
    ? ok("a MAJOR owned by another role goes to the human, never to the designer's fix round (U60)")
    : err(`another role's MAJOR produced ${dispatched(r,'designer').length} designer dispatches`)
}
{
  // Work the brief sequences for later is not a defect in the artifact in front of you.
  const r = await run('creative-gate.js', GATE_ARGS, opts =>
    opts.agentType === 'quality-officer'
      ? { verdict: 'FAIL', findings: [finding('MAJOR', { scope: 'flagged-forward' })], checks: 'x' } : CLEAN)
  dispatched(r, 'designer').length === 0 && r.result.forHuman.length === 1
    ? ok('a flagged-forward MAJOR never consumes a fix round on the current artifact (U60)')
    : err(`a flagged-forward MAJOR triggered ${dispatched(r,'designer').length} designer dispatches`)
}
{
  const r = await run('creative-gate.js', { context: 'gate the masters' }, () => { throw new Error('dispatched!') })
  r.calls.length === 0 && String(r.result.decision).startsWith('INVALID CALL')
    ? ok('missing targets is refused before any dispatch') : err('gate ran without targets')
}

console.log(`\n${ERR} errors`)
process.exit(ERR ? 1 : 0)
