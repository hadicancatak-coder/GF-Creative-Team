---
description: Onboard a client — scaffold a profile in the working project and seed its eval cases.
---

Onboard a new client profile for: $ARGUMENTS

## Where it goes

**`.creative-team/clients/<name>/` in the WORKING PROJECT — never inside the plugin directory.**
The plugin's `clients/TEMPLATE/` is a read-only source to copy *from*. Anything written into the plugin
directory is destroyed on the next `/plugin update`.

```
.creative-team/
├── active                     # one line: the profile name that is currently live
└── clients/<name>/
    ├── client.md              # brand system, tokens, source law, format matrix, hazards
    ├── compliance.md          # regulator, mandated text, restrictions, overriding client facts
    └── evals.md               # client-specific cases
```

This sits alongside `.gates/`, which the hooks already write to the working project.

## Steps

1. Create the directories above. Copy the three files from the plugin's `clients/TEMPLATE/`.
2. Write `<name>` into `.creative-team/active` so the profile is live.
3. Interview the operator for what the profile needs and the templates cannot infer. Work through
   `client.md` first, then `compliance.md`.
4. **Do not invent token values, claim figures or compliance text.** Mark unknowns `TBD` and list them
   as open verification items. A `TBD` in mandated legal text blocks that region from shipping (U23).
5. Seed `evals.md` from `evals/universal-cases.md`. Add client-specific cases as real failures appear.
6. Read `clients/example-northwind-cycles/` aloud to the operator if they are unsure how specific to be.
   Vague profiles produce vague gates.

## The rule that keeps this working

No client fact belongs in `agents/`. If you are about to edit a role brief with something only true for
this engagement, it goes in the profile instead.
