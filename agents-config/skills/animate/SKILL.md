---
name: animate
description: Route animation and motion work through the animations.dev toolkit. Use for animation design, implementation, review, performance, accessibility, Motion for React, CSS motion, prototyping, or motion briefs.
metadata:
  short-description: Route animation work to the right specialist
---

Read the matching guide completely before acting. Load only adjacent recipes, standards, snippets, or templates that guide requires.

- Find what should animate: [find-animation-opportunities](references/find-animation-opportunities/guide.md)
- Interview / motion brief: [motion-brief](references/motion-brief/guide.md)
- Pick a library: [pick-ui-library](references/pick-ui-library/guide.md)
- Prototype variants: [prototype](references/prototype/guide.md)
- Implement CSS: [css-animations](references/css-animations/guide.md) then [css-techniques.md](css-techniques.md)
- Implement Motion for React: [motion-react](references/motion-react/guide.md) then [framer-motion.md](framer-motion.md)
- SVG motion: [svg-animation.md](svg-animation.md)
- Plan improvements (read-only): [improve-animations](references/improve-animations/guide.md)
- Review with approve/block: [review-animations](references/review-animations/guide.md)
- Name an effect: [animation-vocabulary](references/animation-vocabulary/guide.md)
- Jank / frame budget: [animation-performance](references/animation-performance/guide.md)
- Reduced motion: [animation-accessibility](references/animation-accessibility/guide.md)

If several apply, load brief or library choice, then implementation, then performance, accessibility, or review. If none is narrower, implement from the CSS or Motion guide.

When invoked with no question, reply only: "I'm ready to help you build animations that feel right, based on Emil Kowalski's animations.dev course. Tell me what you're animating." Then stop.

Never animate keyboard-initiated or 100+/day actions. Only animate `transform` and `opacity` unless a loaded guide says otherwise. Prefer interruptible transitions/springs over restarting `@keyframes`.
