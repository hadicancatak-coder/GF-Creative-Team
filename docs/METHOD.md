# The method

This is the part that transfers. The role briefs are the domain; the method below is not.

## Why roles, not one agent
A single reviewer averages its attention. Separate roles each own a failure class and can be held to it —
and when something slips, you know whose brief to fix. These roles came from real failures, not from an
org chart. If you cannot name the failure class a role owns, it is not a role.

## The chain
```
content-creator (copy) → creative-director (concept + dispatch plan)
                              ↓
        art-director (select) → designer (build) → art-director (verify)
                              ↓
         design-analyst + quality-officer (gate; QO last, on final state)
                              ↓
                            human
```
The orchestrator dispatches and applies decisions. It does not judge, select, or place pixels.
The separation matters: an orchestrator that also reviews will approve its own work.

## Laws (ranked; the client profile supplies the specifics)
1. **Source-only** — elements trace to a real source; invention is never a fallback. Subtract and crop, don't draw.
2. **Client facts override their published material** — but only for facts the client OWNS. External facts (regulators, third-party awards, partners) need a settling artefact.
3. **Ask the client first** — if they can supply the asset in minutes, asking beats hours of surgery.
4. **One action per creative**; no element repeats another; mandated legal text exactly to spec.
5. **Reference geometry** — measured ratios from the source, never arithmetic placement.
6. **Device and object realism** — natural density, correct geometry, honest endings.
7. **Two strikes** on an asset, then replace or HOLD.
8. **Asset-blocked work goes to HOLD** — a weak proof costs more than waiting.

They are ranked because they collide. When source-only and a deadline collide, source-only wins; that
ranking is the whole point of writing them down.

## Evals from failures, not from imagination
A rule invented in advance is a guess. A rule derived from something that already cost you a client
rejection is evidence. Most cases in `evals/` were a real failure first, and each records its historical
outcome — whether a gate caught it, a human did, or it was codified from a rule rather than a logged failure.

The loop, run the same day the failure happens:
1. the failure becomes a rule in the responsible agent's brief, and
2. it becomes an eval case naming the agent that must catch it unhinted.

Then re-run the cases. A brief edit that makes an old case fail is a regression, not a refinement.

## Economics
Every dispatch gets a ledger row. Judge gates by **cost per confirmed BLOCKER/MAJOR**, not by token count.
Gating is cheap insurance; the expensive failures happen *around* gates — stale-state reviews,
wrong-asset surgery, environment crashes, and ungated work a human rejects.

Prevention beats detection: a brief rule that kills a failure class is cheaper forever than catching that
class one creative at a time.

## Maturity metric
The ratio of findings caught by humans versus by gates.
- **Falling** → the team is learning.
- **Flat** → the briefs are not improving; you are adding rules that do not bind.
- **Rising** → check for a regression; a brief edit probably removed something load-bearing.

## What building this taught us

Nine lessons, each bought by a failure during development, each recorded as an eval case. They are the
part most likely to transfer to a team that has nothing to do with advertising.

**1. Role separation must be enforced by tooling, not asked for in prose.**
Seven briefs said who does what. All seven agents had unrestricted tools. The copywriter rendered the
artwork itself with a script — not maliciously, just helpfully. A boundary that lives only in a prompt
is a suggestion. Give the building role write access and take it from everyone else. *(U44)*

**2. Every escape hatch pointing at "stop" produces a team that never ships.**
`ASK-CLIENT`, `NO-VIABLE-ASSET`, `HOLD`, `BLOCKER` — and nothing meaning *build the best you can and
mark what is compromised.* Three clean runs produced three refusals and no work. Refusal is for output
that would be harmful, illegal or misleading. "Weaker than I'd like" is a reservation that travels with
the delivered work. *(U43)*

**3. A gate that can only ever say "not yet" is a gate people start waiving.**
A missing font was never going to install, so every gate correctly returned a permanent failure. Give
the system a terminal state for *"the work is clean and the only thing outstanding is something nobody
here can fix."* Otherwise the honest verdict and the useless one look identical. *(U41)*

**4. Order the chain so each role has what it needs to do its job well.**
Copy ran before concept, so the copywriter invented an implicit idea and the director reverse-engineered
one from it. The headline came out as a specification. Reordering cost nothing and changed the output.
*(U45)*

**5. "Verified" means nothing unless verified where it matters.**
A font confirmed installed on the build machine was absent from the environment that actually renders.
Check the thing that will do the work, not the thing that resembles it. *(U48)*

**6. Preflight inputs or spend real money on the word "undefined".**
A command sent a bare string to a workflow expecting five fields. Without a guard it would have
dispatched five agents against undefined values — silently, with no error, at real cost. Validate before
you dispatch and name exactly what is missing. *(U34)*

**7. Instrument what changes the artifact, not what touches the tool.**
Creating an empty file counted as a build, so the enforcement hook demanded review of work that did not
exist. A gate that fires on phantom work teaches people to bypass gates. *(U33)*

**8. Speed is a correctness property.**
Five sequential specialists is twenty minutes for one draft. A pipeline nobody runs is worth nothing, so
"it produces better work" is not a defence. Offer a fast path, state what it gives up, and let the
parallelisable half — the review — carry the quality. *(U49)*

**9. Make the fidelity of a thing match its intent.**
A schematic dressed as finished work gets judged as finished work, and rightly. This applied to our own
README diagram before it applied to anything a client saw. *(U42)*

The thread through all nine: **the system will do exactly what it is built to do, not what the
documentation says it should.** Every one of these was a gap between a stated rule and an enforced one.

## Generalizing to another domain
Keep the skeleton — roles derived from failure modes, ground-truth files the agents must re-read, ranked
laws, failure-derived evals, autonomous chains with a legal ESCALATE, and a financial controller on the
meter. Swap the domain facts. The method transfers; the briefs are the domain.
