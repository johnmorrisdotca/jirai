import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
const packed = JSON.parse(execFileSync("npm", ["pack", "--ignore-scripts", "--json"], { encoding: "utf8" }))[0];
const temp = await mkdtemp(join(tmpdir(), "jirai-package-"));
try {
  await writeFile(join(temp,"package.json"), '{"type":"module","private":true}');
  execFileSync("npm", ["install", "--ignore-scripts", "--no-audit", "--no-fund", resolve(packed.filename)], { cwd: temp, stdio: "pipe" });
  const worker = packed.files.find((file) => file.path === "dist/worker.js");
  if (!worker) throw new Error("The worker must ship in the package.");
  const source = `import { newGame, play, DEFAULT_SETTINGS } from '@johnmorrisdotca/jirai';
import { mountJirai } from '@johnmorrisdotca/jirai/play';
import { boardModel } from '@johnmorrisdotca/jirai/draw';
import { newOrthogonalGame, orthogonalNeighbours, encodeOrthogonalGame, decodeOrthogonalGame } from '@johnmorrisdotca/jirai/orthogonal';
import { JiraiElement } from '@johnmorrisdotca/jirai/element';
const g = play(newGame({...DEFAULT_SETTINGS,noGuess:false}), {kind:'reveal',cell:40});
const orthogonal = newOrthogonalGame({width:9,height:9,mines:10,noGuess:false,opening:'safe',seed:7});
if (!g.board || boardModel(g).cells.length !== 81 || typeof mountJirai !== 'function' || typeof JiraiElement !== 'function'
  || orthogonalNeighbours(orthogonal.settings, 40).length !== 4 || decodeOrthogonalGame(encodeOrthogonalGame(orthogonal))?.settings.grid !== 'orthogonal') throw Error('Package smoke check failed');`;
  await writeFile(join(temp,"check.mjs"), source);
  execFileSync(process.execPath, ["check.mjs"], { cwd: temp, stdio: "inherit" });
  const manifest = JSON.parse(await readFile("package.json", "utf8"));
  if (manifest.dependencies !== undefined) throw new Error("The engine has no runtime dependencies.");
  console.log(`Packed package installs, runs in Node and imports DOM entries safely. ${packed.size} bytes compressed.`);
} finally { await rm(temp, { recursive: true, force: true }); }
