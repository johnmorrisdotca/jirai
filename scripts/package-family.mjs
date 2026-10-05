// The package's identity around the family's unchanged header and footer.
import { readFileSync } from "node:fs";
import { familyFooter, familyHeader } from "./family-template.mjs";
const id = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")).name.split("/")[1];
const members = { gunjin: ["Gunjin", "軍人"], jirai: ["Jirai", "地雷"], tobiishi: ["Tobiishi", "飛び石"] };
const [name, kana] = members[id];
const ownLinks = html => html.replaceAll("https://github.com/johnmorrisdotca/kazu", `https://github.com/johnmorrisdotca/${id}`)
  .replaceAll("https://www.npmjs.com/package/@johnmorrisdotca/kazu", `https://www.npmjs.com/package/@johnmorrisdotca/${id}`);
/** Shared header layout, with this package's own identity and links. */
export function packageHeader(links = []) {
  return ownLinks(familyHeader({ id: "kazu", links }))
    .replace('<h1>Kazu<span lang="ja">数</span></h1>', `<h1>${name}<span lang="ja">${kana}</span></h1>`);
}
/** Keep all established family links and include the three new libraries. */
export function packageFooter() {
  const extra = Object.entries(members).map(([key, [label]]) => `<a href="https://johnmorrisdotca.github.io/${key}/"${key === id ? ' aria-current="page"' : ''}>${label}</a>`).join("");
  return ownLinks(familyFooter({ id: "kazu" }))
    .replace("npm install @johnmorrisdotca/kazu", `npm install @johnmorrisdotca/${id}`)
    .replace(' aria-current="page"', '')
    .replace('<a href="https://itsutsu.com">', `${extra}<a href="https://itsutsu.com">`);
}
/** Adapt the source-derived API page without changing established family links. */
export function packagePage(html) {
  return ownLinks(html)
    .replace('<h1>Kazu<span lang="ja">数</span></h1>', `<h1>${name}<span lang="ja">${kana}</span></h1>`)
    .replace(ownLinks(familyFooter({ id: "kazu" })), packageFooter())
    .replace('id: "kazu", words:', `id: "${id}", words:`);
}
