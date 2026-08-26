# AIBlueprint Premium configuration

This directory contains the Premium skills installed by `agents pro setup`.
The CLI copies every complete skill directory from `agents-config/skills` into
the shared `~/.agents/skills` directory, including its references, scripts,
agents, and assets.

## Frontend routing skills

The Premium configuration includes three model-invoked frontend routers by
default:

| Skill | Purpose |
| --- | --- |
| `better` | Reviews an interface holistically, then routes work across accessibility, layout, writing, typography, colors, and UI polish. |
| `animate` | Routes motion work to focused animation design, implementation, review, performance, accessibility, and prototyping guidance. |
| `impeccable` | Routes production frontend work across building, evaluating, refining, hardening, optimizing, adapting, and animating interfaces. |

These routers can activate from the user's request because they do not disable
model invocation. Their internal guides remain references used by the router,
not additional standalone skills exposed to the user.

Other routing and orchestration skills already included in Premium are `apex`,
`use-style`, and `use-delegate`.

## Packaging

Each skill must remain a complete directory. When a skill depends on files such
as `reference/`, `scripts/`, `agents/`, or `assets/`, those files are shipped
with its `SKILL.md` and installed together by the CLI.
