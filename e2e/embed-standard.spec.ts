import { expect, test } from "@playwright/test";

test("the shared builder writes each format in Japanese without page overflow", async ({ page }) => {
 const errors: string[] = []; page.on("pageerror", e => errors.push(e.message)); await page.goto("/builder.html?lang=ja");
 await expect(page.locator("#bld-stage jirai-board [data-cell]")).toHaveCount(81); await expect(page.locator("#bld-preview-title")).toHaveText("プレビュー"); await expect(page.locator("#bld-copy")).toHaveText("コードをコピー");
 for(const format of["element","iframe","module","react","vue","svelte","angular","html","url"]){await page.locator(`#bld-formats [data-format="${format}"]`).click();await expect(page.locator("#bld-code")).not.toHaveText("");}
 expect(errors).toEqual([]);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test("daily fields repeat after the same first opening and events cross shadow roots", async ({ page }) => {
 await page.goto("/embed/?daily=2026-10-09&controls=off&size=small"); const board=page.locator("jirai-board");
 await board.locator('[data-cell="40"]').click(); await expect(board.locator('[data-cell="40"]')).toHaveAttribute("data-kind","open",{timeout:20000});
 const before=await board.evaluate((element)=> (element as unknown as {game():unknown}).game());
 await page.reload();await board.locator('[data-cell="40"]').click();await expect(board.locator('[data-cell="40"]')).toHaveAttribute("data-kind","open",{timeout:20000});expect(await board.evaluate(element=>(element as unknown as {game():unknown}).game())).toEqual(before);
 const detail=await page.evaluate(async()=>{const {defineBoard}=await import("../dist/element.js");defineBoard("article-minefield");defineBoard("article-minefield");const host=document.createElement("div"),shadow=host.attachShadow({mode:"open"});document.body.append(host);const board=document.createElement("article-minefield");board.setAttribute("controls","no");shadow.append(board);return await new Promise(resolve=>{document.addEventListener("jirai-change",event=>{const custom=event as CustomEvent;resolve({composed:custom.composed,bubbles:custom.bubbles,detail:JSON.parse(JSON.stringify(custom.detail))});},{once:true});(board as unknown as {play(cell:number,mark:boolean):void}).play(0,true);});});
 expect(detail).toMatchObject({composed:true,bubbles:true,detail:{status:"ready"}});
});

test("reflected aliases preserve appearance changes and legacy dimensions",async({page})=>{
 await page.goto("/embed/?width=12&height=10&controls=false&label=%3Cimg%3E&theme=dark");const board=page.locator("jirai-board");await expect(board.locator("[data-cell]")).toHaveCount(120);await expect(board).toHaveAttribute("aria-label","<img>");expect(await board.locator("img").count()).toBe(0);
 const result=await board.evaluate(element=>{const b=element as unknown as {play(cell:number,mark:boolean):void;game():{marks:string[]};options:unknown;noGuess:unknown;progress:()=>string;pieces:unknown};b.play(0,true);b.options={onChange:()=>{}};b.pieces="flowers";return{mark:b.game().marks[0],pieces:element.getAttribute("pieces"),progress:typeof b.progress};});expect(result).toEqual({mark:"flag",pieces:"flowers",progress:"function"});
 await board.evaluate(element=>{const b=element as unknown as {cols:unknown;rows:unknown;noGuess:unknown;width:unknown};b.cols=9;b.rows=9;b.noGuess="off";b.width=320;});await expect(board.locator("[data-cell]")).toHaveCount(81);expect(await board.evaluate(element=>element.style.width)).toBe("320px");
});

test("copied iframe forwards JSON detail and ignores malformed parameters",async({page,baseURL})=>{
 await page.goto("/builder.html?lang=en");await expect(page.locator("#bld-stage [data-cell]")).toHaveCount(81);await page.locator('#bld-formats [data-format="iframe"]').click();const code=(await page.locator("#bld-code").textContent())!.replaceAll("https://johnmorrisdotca.github.io/jirai/",`${baseURL}/`).replace('loading="lazy"','');
 await page.route(`${baseURL}/article.html`,route=>route.fulfill({contentType:"text/html",body:`<style>body{margin:0;width:320px}</style><script>window.messages=[];addEventListener('message',event=>messages.push(event.data));</script>${code}`}));await page.goto("/article.html");const frame=page.frameLocator("iframe");await expect(frame.locator("[data-cell]")).toHaveCount(81);await frame.locator('[data-cell="40"]').click();await expect(frame.locator('[data-cell="40"]')).toHaveAttribute("data-kind","open",{timeout:20000});
 await expect.poll(()=>page.evaluate(()=>(window as unknown as {messages:{type:string}[]}).messages.some(m=>m.type==="jirai-change"))).toBe(true);
 const child=page.frames().find(f=>f.url().includes("/embed/"))!;expect(await child.evaluate(()=>document.documentElement.scrollHeight<=innerHeight&&document.documentElement.scrollWidth<=innerWidth&&localStorage.length===0)).toBe(true);
 await page.goto("/embed/?cols=900&rows=-1&grid=bad&daily=2026-02-30&width=Infinity&progress=bad");await expect(page.locator("[data-cell]")).toHaveCount(81);await expect(page.locator("jirai-board")).not.toHaveAttribute("daily",/.*/);await expect(page.locator("jirai-board")).not.toHaveAttribute("width",/.*/);
});
