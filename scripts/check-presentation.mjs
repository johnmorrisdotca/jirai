// Release presentation contract, checked alongside the engine tests.
import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { apiOf } from "./api.mjs";
const read = path => readFileSync(new URL(`../${path}`, import.meta.url));
const pkg = JSON.parse(read("package.json"));
const id = pkg.name.split("/")[1];
const text = read("README.md").toString();
assert.equal(pkg.license, "MIT");
assert.ok(read("LICENSE").toString().includes("MIT License"));
assert.ok(!Object.keys(pkg.dependencies ?? {}).length);
assert.ok(pkg.keywords.length >= 15);
assert.ok(pkg.repository.url.includes(`johnmorrisdotca/${id}`));
for (const word of ["badge.svg", "licence-MIT", "dependencies-0", "types-TypeScript", `https://johnmorrisdotca.github.io/${id}/api.html`, "CONTRIBUTING.md", "SECURITY.md", "CODE_OF_CONDUCT.md", "docs/desktop.jpg", "docs/phone.jpg"]) assert.ok(text.includes(word), `README missing ${word}`);
for (const file of ["desktop", "phone"]) assert.ok(statSync(new URL(`../docs/${file}.jpg`, import.meta.url)).size > 10000, `Missing ${file} screenshot`);
for (const file of ["SECURITY.md", "CODE_OF_CONDUCT.md"]) assert.deepEqual(read(file), read(`scripts/community/${file}`), `${file} differs from the shared copy`);
assert.equal(createHash("sha256").update(read("scripts/family-template.mjs")).digest("hex"), "38bd7b252045af5bac9ac40b873fdac3d0981ad29a3afc1dff88d5d0df0645b4", "Shared family template drifted");
const entries = apiOf();
assert.equal(entries.length, Object.keys(pkg.exports).length);
for (const entry of entries) for (const item of entry.exports) {
  assert.ok(item.signature, `${entry.entry}: ${item.name} has no signature`);
  assert.ok(item.doc, `${entry.entry}: ${item.name} has no description`);
}
console.log(`Presentation checked: ${entries.length} API entries, screenshots, metadata and community files.`);
