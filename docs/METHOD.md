# The method

This is the part that transfers. The role briefs are the domain; the method below is not.

## Why roles, not one agent
A single reviewer averages its attention. Separate roles each own a failure class and can be held to it —
and when something slips, you know whose brief to fix. These roles came from real failures, not from an
org chart. If you cannot name the failure class a role owns, it is not a role.

## The chain
```
brief → ART DIRECTOR ──closes the brief: interrogates it, asks the client, writes the spec
                     ↓
              DESIGNER ──builds it; owns every number
                     ↓
   check-build.mjs ──arithmetic: gaps, tokens, type, proportion, colour. Free.
                     ↓
         ART DIRECTOR ──judges the picture on its own merit
                     ↓
      quality-officer ──ONLY when regulated or about to be trafficked
                     ↓
                    human
```

**Two roles on the default path.** The front door owns the brief and nothing is built until it closes;
the builder executes and does not reinterpret. Everyone else is conditional.

**Split arithmetic from judgement and put arithmetic in a script.** Gaps against a scale, colours against
tokens, shares of a frame — these are comparisons between numbers. A role doing them costs ~88,000 tokens
per run and can disagree with itself between runs; a script costs nothing and cannot. What needs a role
is whether the result is any *good*. Conflating the two makes both too expensive to run, which is how a
review ends up skipped.

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

Eleven lessons, each bought by a failure during development, each recorded as an eval case. They are the
part most likely to transfer to a team that has nothing to do with advertising. Lesson 8 is the one this
project got wrong twice before getting right, and it is written up as the mistake it was. Lesson 11 is
the one the first live run taught, and it is the most important of the set.

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
A command sent a bare string where five fields were expected. Without a guard it would have dispatched
five agents against undefined values — silently, with no error, at real cost. Validate before you
dispatch and name exactly what is missing. The stronger version of this lesson: have the role that owns
the brief **ask the human** for what is missing, once, before anything is built. *(U34)*

**7. Instrument what changes the artifact, not what touches the tool.**
Creating an empty file counted as a build, so the enforcement hook demanded review of work that did not
exist. A gate that fires on phantom work teaches people to bypass gates. *(U33)*

**8. Speed is a correctness property — and a second, weaker pipeline is the wrong way to buy it.**
Five sequential specialists is twenty minutes for one draft, and a pipeline nobody runs is worth
nothing; "it produces better work" is not a defence. That much was right. The answer we reached for was
wrong. We built a fast path beside the real one, and it worked: 60 minutes became 11.

It also became the only source of a whole defect class. Every bug unique to the cheap path came from
merging two roles into one dispatch — a merged call whose schema could not hold its own prompt and burned
its retry cap (U52), speed tuning that silently suppressed the craft self-checks so a frame shipped 64%
empty and unmeasured (U53), and a departure from the directive reported as compliance (U54). And by
construction it was the path that produced **ungated** work, because the gate was the thing it skipped.
The cheap gate had the mirror-image flaw: it was cheap because one reviewer cannot disagree with itself,
which is the entire mechanism a gate exists for.

Two pipelines also means two truths. Which one produced this? Was it gated? The answer became a thing
you had to remember, and the whole discipline of the system is not having to.

So: **make the correct process affordable instead.** The levers that cost nothing are the ones that cut
what an agent *writes* rather than what it *checks* — per-role model and effort tiering, naming the
files instead of letting it explore, fanning the review out in parallel, and deleting every dispatch
that re-measures what another role already measured. What survives every optimisation gets marked
NON-OPTIONAL at the point it is asked for, because once it was not, and the cheapest path quietly became
the least careful one. *(U49, U50, U53, U56)*

**9. Make the fidelity of a thing match its intent.**
A schematic dressed as finished work gets judged as finished work, and rightly. This applied to our own
README diagram before it applied to anything a client saw. *(U42)*

**10. A test that needs a model is a test you will not run.**
Every orchestration bug here was found by a live run that burned real tokens — a preflight that
interpolated `undefined` into five prompts, a schema that could not hold its own prompt (114k tokens to
discover), a gate that could report a clean pass on stalled agents. All of them are control-flow and
schema bugs. **None of them needed a model to find.** Stub the engine, record what gets dispatched, and
assert on the routing: who ran, in what order, with what schema, and what verdict came out. That half of
an agent system is deterministic and belongs in CI. The other half — whether an agent is any *good* —
is what the evals are for, and keeping the two apart is what makes either affordable. *(U57)*

**11. Conformance is not quality. A system made only of conformance checks produces defensible work.**
The first end-to-end run passed a frame that was **50.7% empty vertical space**, with the message at
10.2% of height and the decoration at 25.3%. It was token-clean, deviation-free, source-law-clean and
compliant. Four reviewers and 629,000 tokens returned findings about brand attribution and legal
wrapping. The operator looked at it for five seconds and said the proportions were wrong.

Every mechanism in the system checked that something *matched*: the tokens, the platform spec, the
directive, the mandated wording, the source inventory. Not one asked whether the result was any good. A
pipeline like that has an excellent immune system and no taste.

Three structural causes, all of which generalise:
- **The role that owned the concept was specifying the execution.** Its directive carried eight absolute
  pixel coordinates, so the role that owned craft had nothing to decide. Watch for this wherever a
  "detailed spec" is praised — the detail may be one role eating another's job. *(U59)*
- **The reviewers were handed the producer's defence before they looked.** They were given the declared
  deviations and the director's ruling as context, and the one role positioned to contest the
  composition wrote "per the ruling I am not proposing to shorten it." A reviewer given the defence
  reviews the defence. *(U60)*
- **Judgement had no owner.** Three of four reviewers owned measurable dimensions, and a measurable
  dimension cannot fire on "this is badly proportioned." Someone must own it, and they must own it with
  numbers — a share of frame, a ratio, a named alternative — or the finding is unarguable and gets
  waived. *(U58)*

The fix is not more rules. It is naming who owns judgement, giving them a number to judge with, and
never letting them review against the brief that produced the work. *(U58, U59, U60)*

The thread through all eleven: **the system will do exactly what it is built to do, not what the
documentation says it should.** Every one of these was a gap between a stated rule and an enforced one.

## Generalizing to another domain
Keep the skeleton — roles derived from failure modes, ground-truth files the agents must re-read, ranked
laws, failure-derived evals, autonomous chains with a legal ESCALATE, and a financial controller on the
meter. Swap the domain facts. The method transfers; the briefs are the domain.
