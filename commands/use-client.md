---
description: Switch the active client profile, or show which one is currently live.
---

Switch the active client profile to: $ARGUMENTS

## With an argument
1. Confirm `.creative-team/clients/<name>/` exists in the working project. If it does not, list what
   does exist and stop — do not create it silently; that is `/new-client`'s job.
2. Write `<name>` into `.creative-team/active`.
3. Report what is now live, plus any `TBD` items in its `compliance.md` that block regions from shipping.

## With no argument
Report the current state: the contents of `.creative-team/active`, every profile available under
`.creative-team/clients/`, and — if no profile is active — which checks the team will therefore skip.

## Why this exists
Agents resolve the active profile from `.creative-team/active` on **every run**, never from memory of a
previous session. Switching client mid-session without updating this file is how one client's tokens,
claims or compliance rules end up in another client's creative.
