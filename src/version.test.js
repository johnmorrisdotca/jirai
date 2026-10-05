import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { VERSION } from "./index.ts";

it("names one version in the package, the library and the changelog", () => {
  const pkg = JSON.parse(readFileSync("package.json", "utf8"));
  expect(VERSION).toBe(pkg.version);
  expect(readFileSync("CHANGELOG.md", "utf8")).toMatch(new RegExp(`^## \\[${pkg.version.replaceAll(".", "\\.")}\\] - \\d{4}-\\d{2}-\\d{2}$`, "m"));
});
