import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { API_CSS, apiPage } from "./api.mjs";
import { packagePage } from "./package-family.mjs";
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

await writeFile("docs/api.css", API_CSS);
await writeFile("docs/api.html", packagePage(apiPage({ id: "kazu", name: "Jirai", icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3C/svg%3E" })));
