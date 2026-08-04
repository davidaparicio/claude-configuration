# Fowler Smell Baseline

Apply this baseline on the Standards axis even when the repository documents no coding standards.

Repository rules override this baseline. Every smell is a judgement call, never a hard violation. Skip findings that existing tooling already enforces. Report only when the diff contains concrete evidence and cite the relevant hunk.

| Smell | Signal | Typical response |
|---|---|---|
| Mysterious Name | A name does not reveal what a value or operation means | Rename it; if no honest name exists, clarify the design |
| Duplicated Code | The same logic shape appears in several changed places | Extract the shared behavior |
| Feature Envy | Code reaches into another module's data more than its own | Move behavior toward the data it uses |
| Data Clumps | The same fields or parameters repeatedly travel together | Introduce one domain type |
| Primitive Obsession | A primitive stands in for a domain concept | Give the concept a focused type |
| Repeated Switches | The same conditional dispatch recurs | Centralize dispatch or use polymorphism |
| Shotgun Surgery | One logical change requires scattered edits | Gather the changing behavior into one module |
| Divergent Change | One module changes for unrelated reasons | Separate the responsibilities |
| Speculative Generality | Abstraction exists for needs absent from the spec | Remove or inline it until a real need exists |
| Message Chains | Callers navigate long object chains | Hide traversal behind a focused method |
| Middle Man | A layer mostly delegates without adding leverage | Remove the pass-through layer |
| Refused Bequest | An implementation ignores most inherited behavior | Prefer composition over the inheritance relationship |
