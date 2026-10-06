// readme.test.js: the README has the sections every package of the family has, in the family's order, each with something in it.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const readme = readFileSync("README.md", "utf8").replace(/\r\n/g, "\n");
const HOUSE = [
  "In 30 seconds", "Who it is for", "Features", "Use it in your project", "API", "Theming", "Limits", "Browser support",
  "Languages", "Roadmap", "Architecture", "The name", "Where it comes from", "Development", "Contributing", "Changes", "Licence",
];

describe("the README's shape", () => {
  it("has the family's sections, in the family's order, each with something in it", () => {
    const headings = [...readme.matchAll(/^## (.+)$/gm)].map((match) => match[1]);
    let from = 0;
    for (const heading of HOUSE) {
      const at = headings.indexOf(heading, from);
      expect(at, `README.md has no "## ${heading}" after the section before it`).toBeGreaterThanOrEqual(from);
      from = at + 1;
      const start = readme.indexOf(`\n## ${heading}\n`) + 1;
      const next = readme.indexOf("\n## ", start + 4);
      const body = readme.slice(start + heading.length + 4, next < 0 ? undefined : next).trim();
      expect(body.length, `"## ${heading}" is empty`).toBeGreaterThan(20);
    }
  });

  it("puts the family under \"Where it comes from\", one level down", () => {
    const from = readme.indexOf("\n## Where it comes from\n");
    const family = readme.indexOf("\n### The family\n");
    const next = readme.indexOf("\n## Development\n");
    expect(from).toBeGreaterThan(0);
    expect(family).toBeGreaterThan(from);
    expect(family).toBeLessThan(next);
  });
});
