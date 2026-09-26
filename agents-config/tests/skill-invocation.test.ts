import { describe, expect, it } from "bun:test";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const SKILLS_ROOT = join(import.meta.dir, "..", "skills");

type Skill = {
	name: string;
	directory: string;
	body: string;
	frontmatter: Record<string, string>;
};

const parseSkill = (raw: string) => {
	const text = raw.replace(/\r\n/g, "\n");
	if (!text.startsWith("---\n")) return { frontmatter: {}, body: text };
	const end = text.indexOf("\n---", 4);
	if (end < 0) return { frontmatter: {}, body: text };
	const frontmatter: Record<string, string> = {};
	for (const line of text.slice(4, end).split("\n")) {
		const match = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
		if (!match) continue;
		frontmatter[match[1]] = match[2].trim().replace(/^(["'])(.*)\1$/, "$2");
	}
	return { frontmatter, body: text.slice(end + 4) };
};

const skills: Skill[] = readdirSync(SKILLS_ROOT, { withFileTypes: true })
	.filter((entry) => entry.isDirectory())
	.map((entry) => {
		const directory = join(SKILLS_ROOT, entry.name);
		const path = join(directory, "SKILL.md");
		if (!existsSync(path)) return null;
		const { frontmatter, body } = parseSkill(readFileSync(path, "utf8"));
		return { name: frontmatter.name || entry.name, directory, body, frontmatter };
	})
	.filter((skill): skill is Skill => skill !== null);

const byName = new Map(skills.map((skill) => [skill.name, skill]));

const isUserOnly = (skill: Skill) =>
	skill.frontmatter["disable-model-invocation"] === "true";

// A stage call is a list item whose content opens with a backticked `$skill`
// reference, e.g. "1. `$analyze`". Inline prose such as skill-manager's
// "Write skills the way `$analyze` ... are written" is not a call and stays
// out of the graph.
const STAGE_CALL = /^[ \t]*(?:\d+\.|[-*])[ \t]+`\$([a-z0-9][a-z0-9-]*)`/gm;

const callGraph = skills.flatMap((caller) =>
	[...caller.body.matchAll(STAGE_CALL)]
		.map((match) => ({ caller: caller.name, callee: match[1] as string }))
		.filter((edge) => edge.callee !== edge.caller),
);

describe("skill frontmatter", () => {
	it("parses on every skill and declares name and description", () => {
		const invalid = skills
			.filter((skill) => !skill.frontmatter.name || !skill.frontmatter.description)
			.map((skill) => skill.name);
		expect(invalid).toEqual([]);
	});
});

describe("skill call graph", () => {
	it("finds the orchestrated stages", () => {
		// Guards the detector itself: if this drops to zero the invariant below
		// would pass vacuously.
		expect(callGraph.length).toBeGreaterThan(0);
	});

	it("resolves every called stage to an installed skill", () => {
		const missing = callGraph
			.filter((edge) => !byName.has(edge.callee))
			.map((edge) => `${edge.caller} -> $${edge.callee} (no such skill)`);
		expect(missing).toEqual([]);
	});

	// Regression: `disable-model-invocation: true` lets only the user invoke a
	// skill, so the Skill tool refuses the orchestrator's own call and the
	// workflow dies on its first stage. It is not the equivalent of Codex's
	// `allow_implicit_invocation: false`, which still honours an explicit $skill.
	it("keeps every called stage invocable by the model", () => {
		const blocked = callGraph
			.filter((edge) => byName.get(edge.callee) && isUserOnly(byName.get(edge.callee) as Skill))
			.map((edge) => `${edge.caller} -> $${edge.callee} (disable-model-invocation: true)`);
		expect(blocked).toEqual([]);
	});
});

describe("apex workflow", () => {
	const stagesOf = (name: string) =>
		callGraph.filter((edge) => edge.caller === name).map((edge) => edge.callee);

	it("apex still chains its five stages", () => {
		expect(stagesOf("apex")).toEqual([
			"analyze",
			"plan",
			"implement",
			"code-review",
			"verify",
		]);
	});

	it("oneshot still chains its five stages", () => {
		expect(stagesOf("oneshot")).toEqual([
			"analyze",
			"plan",
			"implement",
			"code-review",
			"verify",
		]);
	});

	// The orchestrators are user entry points: they are never called by another
	// skill, so they stay user-only.
	it("keeps the entry points user-only", () => {
		const leaked = ["apex", "oneshot"]
			.map((name) => byName.get(name) as Skill)
			.filter((skill) => !isUserOnly(skill))
			.map((skill) => skill.name);
		expect(leaked).toEqual([]);
	});
});
