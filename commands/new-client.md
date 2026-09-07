---
description: Onboard a new client — scaffold the profile from TEMPLATE and seed its eval cases.
---

Onboard a new client profile for: $ARGUMENTS

1. Copy `clients/TEMPLATE/` to `clients/<name>/`.
2. Fill in `client.md` (brand system, tokens, source law, format matrix, hazards), `compliance.md`
   (regulator, mandated text, restrictions, client facts that override published material), and
   `evals.md`.
3. Interview the operator for anything the profile needs and the brief cannot infer. Do not invent
   token values, claim numbers, or compliance text — mark unknowns as `TBD` and list them as open
   verification items. A `TBD` in mandated legal text blocks that region from shipping (eval U23).
4. Seed `clients/<name>/evals.md` from `evals/universal-cases.md`, then add client-specific cases as
   real failures appear.
5. Point the working project at the profile and run the chain.

No client fact belongs in `agents/`. If you are about to edit a role brief with something only true for
this client, it goes in the profile instead.
