// Builds the standalone game into docs/ for GitHub Pages: the page, written here from the family's shared head,
// header and footer, with the family's stylesheet, Jirai's own, the page's script and the compiled library beside it.
import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { API_CSS, apiPage } from "./api.mjs";
import { FAMILY_SCRIPT, familyFooter, familyHead, familyHeader, familyUnreviewed } from "./family-template.mjs";

const id = "jirai";
const icon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%232f5d4a'/%3E%3Ctext x='50' y='70' font-size='42' text-anchor='middle' fill='%23f3efe4'%3E地雷%3C/text%3E%3C/svg%3E";
await mkdir("docs", { recursive: true });
await cp("demo", "docs", { recursive: true });
await cp("dist", "docs/dist", { recursive: true });
await cp("LICENSE", "docs/LICENSE");
const page = (await readFile("demo/index.html", "utf8"))
  .replace("<!--family-head-->", familyHead({
    id,
    title: "Jirai 地雷 · Minesweeper with no guessing",
    description: "Minesweeper in squares, hexagons, or on a board whose edges join. Seeded, configurable, and playable without guessing. Free and open source, in English and Japanese.",
    ogTitle: "Jirai Minesweeper",
    ogDescription: "Minesweeper on shaped, hexagonal and wraparound boards, with verified no-guess fields.",
  }))
  .replace("<!--family-header-->", familyHeader({ id, links: [{ href: "api.html", say: "pageApi" }] }))
  .replace("<!--family-unreviewed-->", familyUnreviewed({ id }))
  .replace("<!--family-footer-->", familyFooter({ id }))
  .replace("<!--family-script-->", `<script>${FAMILY_SCRIPT}</script>`);
await writeFile("docs/index.html", page);
await writeFile("docs/api.css", API_CSS);
await writeFile("docs/api.html", apiPage({ id, name: "Jirai", icon }));
console.log("The standalone game is in docs/. Serve it over HTTP to play.");
