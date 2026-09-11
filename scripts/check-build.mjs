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
const SELFTEST = process.argv.includes('--selftest')
if (SELFTEST) {
  // Real geometry, read from the live Figma file on 2026-09-11. v1 must fail, v2 must be clean-ish.
  const tokens = { spacing: [16, 24, 32, 48, 64, 96, 128], display: [128, 96, 72], body: [44, 36, 28],
    margin: 96, colours: { ground: '14281E', ink: 'F2EADF', inkMuted: 'A9B8AE', accent: 'D4714A',
      reserved: '7A1F2B' }, accentMaxUses: 1 }
  const v1 = { canvas: { w: 1440, h: 1800 }, nodes: [
    { id: 'ledger', y: 192, h: 456, role: 'decoration' },
    { id: 'headline', y: 744, h: 183, role: 'message', fontSize: 96 },
    { id: 'proof', y: 1287, h: 153, role: 'legal' },
    { id: 'cta', y: 1542, h: 96, role: 'cta', fill: '#D4714A' }] }
  const v2 = { canvas: { w: 1440, h: 1800 }, nodes: [
    { id: 'wordmark', y: 128, h: 52, role: 'brand' },
    { id: 'ledger', y: 308, h: 128, role: 'decoration' },
    { id: 'headline', y: 468, h: 488, role: 'message', fontSize: 128 },
    { id: 'proof', y: 1084, h: 332, role: 'legal' },
    { id: 'cta', y: 1480, h: 128, role: 'cta', fill: '#D4714A' }] }
  let bad = 0
  for (const [name, b] of [['v1', v1], ['v2', v2]]) {
    const r = check(b, tokens)
    console.log(`\n=== ${name} — message ${r.stats.message}% · decoration ${r.stats.decoration}% · empty ${r.stats.emptyPct}%`)
    if (!r.findings.length) console.log('  (clean)')
    for (const f of r.findings) console.log(`  ${f.sev.padEnd(8)} ${f.what}: ${f.measured} (expected ${f.expected}) [${f.where}]`)
    if (name === 'v1' && !r.findings.some(f => f.what.includes('under-filled'))) { console.log('  SELFTEST FAIL: v1 should be flagged under-filled'); bad++ }
    if (name === 'v1' && !r.findings.some(f => f.what.includes('outweighs'))) { console.log('  SELFTEST FAIL: v1 should be flagged decoration-heavy'); bad++ }
    if (name === 'v2' && r.findings.some(f => f.what.includes('under-filled') || f.what.includes('outweighs'))) { console.log('  SELFTEST FAIL: v2 should pass proportion'); bad++ }
  }
  console.log(`\n${bad} selftest failures`)
  process.exit(bad ? 1 : 0)
} else if (process.argv[2]) {
  const r = check(JSON.parse(readFileSync(process.argv[2], 'utf8')),
                  JSON.parse(readFileSync(process.argv[3], 'utf8')))
  for (const f of r.findings) console.log(`${f.sev.padEnd(8)} ${f.what}: ${f.measured} (expected ${f.expected}) [${f.where}]`)
  console.log(`\nmessage ${r.stats.message}% · decoration ${r.stats.decoration}% · empty ${r.stats.emptyPct}%`)
  process.exit(r.findings.some(f => f.sev === 'BLOCKER' || f.sev === 'MAJOR') ? 1 : 0)
}
