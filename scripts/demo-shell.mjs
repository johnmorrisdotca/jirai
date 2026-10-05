import { familyHeader, familyFooter } from "./family-template.mjs";
export function jiraiHeader() {
  return familyHeader({ id: "kazu" })
    .replace('<h1>Kazu<span lang="ja">数</span></h1>', '<h1>Jirai<span lang="ja">地雷</span></h1>')
    .replace(/<a href="[^"]+" data-say="nameLink"><\/a>/, "")
    .replace(/<a href="[^"]+">(?:GitHub|npm)<\/a>/g, "");
}
export function jiraiFooter() {
  return familyFooter({ id: "kazu" }).replace('@johnmorrisdotca/kazu</code>', '@johnmorrisdotca/jirai</code>')
    .replace('https://github.com/johnmorrisdotca/kazu/blob/main/LICENSE', 'LICENSE')
    .replace(' aria-current="page"', '');
}
