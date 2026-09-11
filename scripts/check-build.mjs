#!/usr/bin/env node
// Deterministic build check. Replaces the design-analyst's ARITHMETIC — not its judgement.
//
//   node scripts/check-build.mjs build.json tokens.json
//   node scripts/check-build.mjs --selftest
//
// Why this is a script and not an agent. Coordinates, gaps against a spacing scale, colours against
// tokens, type sizes against a type scale, sub-pixel geometry, accent-use counts and proportion shares
// are arithmetic. An agent doing arithmetic costs ~88,000 tokens per run, takes minutes, and can
// disagree with itself between runs. This costs nothing, takes milliseconds, and cannot.
//
// What it deliberately does NOT do: decide whether the design is any good. That needs eyes and it stays
// with the art-director. Keeping the two apart is what makes either affordable.
//
// build.json  : { canvas:{w,h}, nodes:[{id,name,x,y,w,h,fill?,fontSize?,role?}] }
//   role is optional and one of: message | decoration | legal | cta | brand
// tokens.json : { spacing:[...], display:[...], body:[...], margin:n,
//                 colours:{ground,ink,inkMuted,accent,reserved}, accentMaxUses:n }

import { readFileSync } from 'node:fs'

const F = []
const add = (sev, what, measured, expected, where) => F.push({ sev, what, measured, expected, where })
const isInt = n => Number.isInteger(n)
const onScale = (v, scale) => scale.includes(v) || scale.some(s => v > 0 && v % s === 0 && v / s <= 4)

export function check (build, t) {
  F.length = 0
  const { canvas, nodes } = build
  const top = nodes.filter(n => n.y !== undefined).sort((a, b) => a.y - b.y)

  // 1. integer geometry
  for (const n of nodes) {
    for (const k of ['x', 'y', 'w', 'h']) {
      if (n[k] !== undefined && !isInt(n[k]))
        add('MINOR', 'sub-pixel geometry', `${k}=${n[k]}`, 'integer', n.id)
    }
  }

  // 2. vertical gaps against the spacing scale
  let prev = 0, empty = 0
  for (const n of top) {
    const gap = n.y - prev
    if (gap > 0) {
      empty += gap
      if (!onScale(gap, t.spacing))
        add('MINOR', 'gap off the spacing scale', `${gap}px`, t.spacing.join('/'), `above ${n.id}`)
    }
    prev = Math.max(prev, n.y + (n.h || 0))
  }
  const tail = canvas.h - prev
  if (tail > 0) { empty += tail; if (!onScale(tail, t.spacing))
    add('MINOR', 'trailing gap off the spacing scale', `${tail}px`, t.spacing.join('/'), 'canvas bottom') }

  // 3. proportion — the check nobody owned until U58
  const pct = v => +(100 * v / canvas.h).toFixed(1)
  const share = role => pct(nodes.filter(n => n.role === role).reduce((a, n) => a + (n.h || 0), 0))
  const msg = share('message'), dec = share('decoration')
  if (msg && dec && dec > msg)
    add('MAJOR', 'decoration outweighs the message', `${dec}% vs ${msg}%`, 'message > decoration', 'frame')
  if (pct(empty) > 40)
    add('MAJOR', 'frame is under-filled', `${pct(empty)}% empty vertical span`, '<= 40%', 'frame')

  // 4. type sizes on scale, and whether the top display step was spent
  const scale = [...(t.display || []), ...(t.body || [])]
  const disp = nodes.filter(n => n.fontSize && t.display?.includes(n.fontSize))
  for (const n of nodes.filter(n => n.fontSize))
    if (!scale.includes(n.fontSize))
      add('MAJOR', 'type size not in the scale', `${n.fontSize}px`, scale.join('/'), n.id)
  if (t.display?.length && disp.length) {
    const usedTop = disp.some(n => n.fontSize === Math.max(...t.display))
    if (!usedTop)
      add('INFO', 'top display step unspent', `${Math.max(...disp.map(n => n.fontSize))}px`,
        `${Math.max(...t.display)}px available`, 'headline')
  }

  // 5. colour discipline
  const norm = c => String(c || '').toUpperCase().replace('#', '')
  const used = nodes.map(n => norm(n.fill)).filter(Boolean)
  const accent = norm(t.colours?.accent)
  const reserved = norm(t.colours?.reserved)
  const nAccent = used.filter(c => c === accent).length
  if (accent && nAccent > (t.accentMaxUses ?? 1))
    add('MAJOR', 'accent used too often', `${nAccent} uses`, `max ${t.accentMaxUses ?? 1}`, 'frame')
  if (reserved && used.includes(reserved))
    add('BLOCKER', 'reserved colour present', `#${reserved}`, 'never in this context', 'frame')
  const known = new Set(Object.values(t.colours || {}).map(norm).filter(Boolean))
  for (const n of nodes)
    if (n.fill && !known.has(norm(n.fill)))
      add('MAJOR', 'colour not in the token set', `#${norm(n.fill)}`, [...known].map(c => '#' + c).join(' '), n.id)

  // 6. the AI-default tell — calibration lifted from the frontend-design skill
  const hex2rgb = h => [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16))
  const dist = (a, b) => Math.hypot(...hex2rgb(a).map((v, i) => v - hex2rgb(b)[i]))
  if (accent && /^[0-9A-F]{6}$/.test(accent)) {
    const d = dist(accent, 'D97757')
    if (d < 20) add('MAJOR', 'accent is a generated-design tell, not a brand colour',
      `#${accent} is ${d.toFixed(1)} RGB units from #D97757`, '> 20 units', 'token: accent')
  }

  return { findings: [...F], stats: { message: msg, decoration: dec, emptyPct: pct(empty) } }
}

// ── CLI ───────────────────────────────────────────────────────────────────────
const TOKENS = {
  spacing: [16, 24, 32, 48, 64, 96, 128], display: [128, 96, 72], body: [44, 36, 28], margin: 96,
  colours: { ground: '14281E', ink: 'F2EADF', inkMuted: 'A9B8AE', accent: '2E5FA3', reserved: '7A1F2B' },
  accentMaxUses: 1,
}
const frame = nodes => ({ canvas: { w: 1440, h: 1800 }, nodes })
// A composition that passes everything, used as the base for the negative cases.
const CLEAN = () => [
  { id: 'brand', y: 128, h: 52, role: 'brand' },
  { id: 'ledger', y: 308, h: 128, role: 'decoration' },
  { id: 'headline', y: 468, h: 488, role: 'message', fontSize: 128, fill: '#F2EADF' },
  { id: 'proof', y: 1084, h: 332, role: 'legal', fontSize: 28, fill: '#A9B8AE' },
  { id: 'cta', y: 1480, h: 128, role: 'cta', fill: '#2E5FA3' },
]
const mutate = fn => { const n = CLEAN(); fn(n); return n }

const CASES = [
  ['clean build raises nothing', frame(CLEAN()), TOKENS, []],

  // The two failures that a token-comparing reviewer structurally cannot fire on (U58).
  ['decoration outweighing the message is a MAJOR',
    frame(mutate(n => { n[1].h = 700; n[2].h = 120 })), TOKENS, ['decoration outweighs the message']],
  ['an under-filled frame is a MAJOR',
    frame([{ id: 'headline', y: 900, h: 120, role: 'message', fontSize: 128, fill: '#F2EADF' }]),
    TOKENS, ['frame is under-filled']],

  // Arithmetic the design-analyst dispatch did do — reproduced here for free.
  ['a gap off the spacing scale is a MINOR',
    frame(mutate(n => { n[4].y = 1482 })), TOKENS, ['gap off the spacing scale']],
  ['sub-pixel geometry is a MINOR',
    frame(mutate(n => { n[2].h = 488.4 })), TOKENS, ['sub-pixel geometry']],
  ['a type size off the scale is a MAJOR',
    frame(mutate(n => { n[2].fontSize = 110 })), TOKENS, ['type size not in the scale']],

  // Colour discipline.
  ['the reserved colour anywhere is a BLOCKER',
    frame(mutate(n => { n[0].fill = '#7A1F2B' })), TOKENS, ['reserved colour present']],
  ['a second accent use is a MAJOR',
    frame(mutate(n => { n[0].fill = '#2E5FA3' })), TOKENS, ['accent used too often']],
  ['a colour outside the token set is a MAJOR',
    frame(mutate(n => { n[0].fill = '#123456' })), TOKENS, ['colour not in the token set']],

  // The calibration lifted from the frontend-design skill.
  ['a terracotta accent is flagged as a generated-design tell',
    frame(CLEAN()), { ...TOKENS, colours: { ...TOKENS.colours, accent: 'D4714A' } },
    ['generated-design tell']],
  ['a deliberately non-default accent is not flagged',
    frame(CLEAN()), TOKENS, []],

  // Informational, not a failure: the top display step left unspent.
  ['leaving the top display step unspent is reported',
    frame(mutate(n => { n[2].fontSize = 96 })), TOKENS, ['top display step unspent']],
]

if (process.argv.includes('--selftest')) {
  let bad = 0
  for (const [name, build, tokens, expect] of CASES) {
    const got = check(build, tokens).findings
    const missing = expect.filter(e => !got.some(f => f.what.includes(e)))
    const extra = expect.length === 0 && got.length ? got.map(f => f.what) : []
    if (missing.length || extra.length) {
      bad++
      console.log(`  FAIL  ${name}`)
      missing.forEach(m => console.log(`          expected a finding matching "${m}"`))
      extra.forEach(x => console.log(`          unexpected finding: ${x}`))
      got.forEach(f => console.log(`          got: ${f.sev} ${f.what} — ${f.measured}`))
    } else {
      console.log(`  ok    ${name}`)
    }
  }
  // Regression guard against the two real artboards built on 2026-09-10/11.
  const real = [
    ['v1 (the frame the 4-role gate passed)', [
      { id: 'ledger', y: 192, h: 456, role: 'decoration' },
      { id: 'headline', y: 744, h: 183, role: 'message', fontSize: 96 },
      { id: 'proof', y: 1287, h: 153, role: 'legal' },
      { id: 'cta', y: 1542, h: 96, role: 'cta' }], true],
    ['v2 (after the proportion fix)', CLEAN().map(n => ({ ...n, fill: undefined })), false],
  ]
  for (const [name, nodes, shouldFail] of real) {
    const r = check(frame(nodes), TOKENS)
    const major = r.findings.some(f => f.sev === 'MAJOR' || f.sev === 'BLOCKER')
    const line = `${name} — message ${r.stats.message}% · decoration ${r.stats.decoration}% · empty ${r.stats.emptyPct}%`
    if (major === shouldFail) console.log(`  ok    ${line}`)
    else { bad++; console.log(`  FAIL  ${line} — expected major=${shouldFail}, got ${major}`) }
  }
  console.log(`\n${bad} failures across ${CASES.length + real.length} cases`)
  process.exit(bad ? 1 : 0)
} else if (process.argv[2]) {
  const r = check(JSON.parse(readFileSync(process.argv[2], 'utf8')),
                  JSON.parse(readFileSync(process.argv[3], 'utf8')))
  for (const f of r.findings) console.log(`${f.sev.padEnd(8)} ${f.what}: ${f.measured} (expected ${f.expected}) [${f.where}]`)
  console.log(`\nmessage ${r.stats.message}% · decoration ${r.stats.decoration}% · empty ${r.stats.emptyPct}%`)
  process.exit(r.findings.some(f => f.sev === 'BLOCKER' || f.sev === 'MAJOR') ? 1 : 0)
}
