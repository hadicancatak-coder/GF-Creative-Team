# GF Creative Team

**A creative production team for Claude Code that cannot show you its work until it has reviewed it.**

Seven roles, a deterministic gate, 23 eval cases derived from real failures, and a ledger that tells you
whether the gating is paying for itself.

> The team is the product; clients are configuration. Role definitions carry no client facts.

---

## Why this exists

Most agent packs are personas — a prompt that says "you are a senior designer" and hopes. This one is
built the other way round: **every rule in it exists because breaking it cost something real first.**

The eval cases record their own history. `MISSED — client deleted the work` is a row in this repo. So is
`MISSED — client caught it after ~500k tokens`. Those rows are why the rules above them are worded the
way they are.

Three things here are unusual enough to be the reason to look:

- **Evals derived from failures, with outcomes recorded.** 23 domain-agnostic cases, each naming the
  agent that must catch it *unhinted*, each marked with whether a gate caught it or a human did.
- **A cost metric, not a token count.** The Financial Controller computes *cost per confirmed
  BLOCKER/MAJOR*. Baseline from the run this came out of: **~33k tokens per confirmed finding through
  gates, versus ~330k for one ungated set a human rejected.**
- **A maturity metric.** The ratio of findings caught by humans versus by gates. Falling means the briefs
  are learning. Flat means you are adding rules that do not bind.

**[→ See a real gate run and what it returns](examples/worked-gate-run.md)** — the fastest way to judge
whether this is worth installing.

---

## Install

```bash
/plugin marketplace add hadicancatak-coder/GF-Creative-Team
/plugin install gf-creative-team
```

Then: **[Quickstart](docs/QUICKSTART.md)** · **[The method](docs/METHOD.md)**

---

## The roles

| Agent | Owns | Fails if |
|---|---|---|
| **creative-director** | Concept, hierarchy of intent, asset direction, the dispatch plan | The set means nothing, or the wrong reviewers were sent |
| **art-director** | Asset selection, then verification of the render — full size and at squint | A defect survives that a good eye would have caught |
| **designer** | The build. The only agent that writes to the design tool | Craft laws broken, or something was invented rather than escalated |
| **design-analyst** | Measurement: tokens, type, spacing, radii, alignment, element lineage | A deviation that was measurable went unmeasured |
| **quality-officer** | Final gate: regulation, mandated text, claims, regional rules, export readiness | Something shipped that should not have |
| **content-creator** | Copy decks before design; copy audits after | A claim went out that the client's own facts contradict |
| **financial-controller** | The run ledger, cost per confirmed finding, waste sources | Spend happened that nobody can account for |

Each role exists because it owns a *failure class*. If you cannot name the class, it is not a role.

## The chain

```
content-creator → creative-director (concept + dispatch plan)
                        ↓
   art-director (select) → designer (build) → art-director (verify)
                        ↓
     design-analyst + quality-officer (gate; QO last, on final state)
                        ↓
                      human
```

The orchestrator dispatches and applies decisions. It does not judge, select, or place pixels — an
orchestrator that also reviews will approve its own work.

## The laws (ranked)

They are ranked because they collide, and the ranking is the point.

1. **Source-only** — every element traces to a mined source node or a client asset. Subtraction and cropping are legal; drawing is not.
2. **Client facts override mined copy** — for facts the client *owns*. External facts need a settling artefact.
3. **Ask the client first** — if they can supply the asset in minutes, asking beats hours of surgery.
4. **One CTA**; no element repeats another; mandated legal text exactly to spec.
5. **Reference geometry** — heroes placed by the source's measured ratios, never arithmetic.
6. **Device and object realism** — natural density, correct geometry, honest endings.
7. **Two strikes** on an asset, then replace or HOLD.
8. **Asset-blocked work goes to HOLD** — shipping a weak proof is worse than waiting.

## Workflows

| | |
|---|---|
| `creative-gate.js` | CD writes a schema-enforced dispatch plan; role gates run in parallel groups; consolidated SHIP / FIX-THEN-REGATE / BLOCK. **Refuses to report SHIP on missing results.** |
| `build-verify-loop.js` | AD selects → Designer builds → AD verifies → one fix round → PASS or ESCALATE. When blocked, ESCALATE is the only legal move; invention never is. |

## Enforcement

A `PostToolUse` hook logs every design-tool write. A `Stop` hook **blocks ending the session** if builds
ran today with no gate marker in `.gates/` — with an explicit human waiver hatch
(`.gates/<date>-skipped.md`). Build → gate → fix → show, enforced by the harness rather than by good intentions.

## The client layer

`clients/TEMPLATE/` — copy per engagement:

- `client.md` — brand system, tokens, source law, format matrix, known hazards
- `compliance.md` — regulator, mandated text, restrictions, client facts that override published material
- `evals.md` — client-specific cases

`clients/example-northwind-cycles/` is a **fictional** worked example showing the level of specificity
that actually produces useful gates. Agents load the active profile before any work.
**No client fact belongs in `agents/`.**

## Honesty note

Agents do not dispatch themselves. The chain runs when invoked; the two workflows make invoking it one
call. The evals keep the briefs honest, the ledger keeps the costs honest, and the human keeps the taste.

The `designer` role and the build hooks assume a writable design tool — the Figma MCP is what this was
built against. Every review role works on rendered screenshots from any source.

## Generalizing to another domain

Keep the skeleton: roles from failure modes, ground-truth files, ranked laws, failure-derived evals,
autonomous chains with a legal ESCALATE, a financial controller on the meter. Swap the domain facts.
The method transfers; the briefs are the domain.

## Contributing

The most valuable contribution is **a failure this team did not catch.** See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT — see [LICENSE](LICENSE).
