import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { FAMILY_SCRIPT } from "./family-template.mjs";
import { jiraiHeader, jiraiFooter } from "./demo-shell.mjs";
await mkdir("docs", { recursive: true });
await cp("demo", "docs", { recursive: true });
await cp("dist", "docs/dist", { recursive: true });
await cp("LICENSE", "docs/LICENSE");
const page = (await readFile("demo/index.html", "utf8"))
  .replace("<!--family-header-->", jiraiHeader()).replace("<!--family-footer-->", jiraiFooter())
  .replace("<!--family-script-->", `<script>${FAMILY_SCRIPT}</script>`);
await writeFile("docs/index.html", page);
console.log("The standalone game is in docs/. Serve it over HTTP to play.");
