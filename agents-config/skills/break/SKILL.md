---
name: break
description: Answers "does this survive?" for one component. Renders it on a page in every state real use can put it in, and hands that page over as a visual report of what broke.
disable-model-invocation: true
---

Render one component on a throwaway page under every scenario that can actually reach it. That page is the deliverable. Isolate on purpose: this is not a contextual review (`variant`) and not a standards review (`better`).

1. Scope one component. If the request spans several, list them and ask which one.
2. Read props, slots, and states. Walk [scenarios.md](scenarios.md) and keep only matching axes. Write the kept scenarios before building; say which axes you dropped.
3. Build one scratch page that imports the real component. Labels, fixture props, and fixed-width containers are all the page adds. Make the page client code when the framework splits server/client.
4. One load, one look. Report only what visibly broke. If no browser is at hand, hand over the URL and skip the look.
5. Mark each break on the page and return a table: Scenario, Observed, Owner (the domain skill that diagnoses it). "Everything survived" is a complete report.

Do not fix unless asked. Leave the page up; delete it only when the user is done.
