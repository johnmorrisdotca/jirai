// Takes the pictures the README shows, from the built demo in `site/`: `pnpm screenshots:readme` (builds the demo, then runs this).
// The family's standard is in johnmorrisdotca/.github (README-STANDARD.md); the shared part is readme-pictures-lib.mjs.
// The page is served to a browser without a port, never fetched from the live site, and the same each run: the field is named by
// the address (rules, outline, level, seed and the cell the first reveal is made on), the board is dealt by the page's own worker,
// and motion is reduced. It waits on the opened cell the address names, never on a clock.
// Output: docs/images/<subject>-<desk|phone>-<light|dark>.webp.
import { takePictures } from "./readme-pictures-lib.mjs";

const GAME = ".play-panel";
const address = (query, lang = "en") => `/?lang=${lang}&help=off&seed=7&noGuess=1&${query}`;
const opened = (cell) => `[data-cell="${cell}"][data-kind="open"]`;
const scrollTo = (selector) => (page) => page.locator(selector).evaluate((element) => window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY - 8));

await takePictures({
  shots: [
    // The page from the top, a hexagonal field opened. On a phone, in Japanese: the four-neighbour field, scrolled to the board.
    {
      subject: "hero",
      views: ["desk", "phone"],
      url: address("grid=hex&first=40"),
      ready: opened(40),
      height: 900,
      async prepare(page, { view }) {
        if (view === "phone") {
          await page.goto(`http://jirai.test${address("grid=orthogonal&first=40", "ja")}`);
          await page.waitForSelector(opened(40));
          await scrollTo(GAME)(page);
        } else await page.evaluate(() => window.scrollTo(0, 0));
      },
    },
    // Square grids count eight neighbours.
    { subject: "square", views: ["desk"], url: address("grid=square&first=40"), ready: opened(40), target: GAME },
    // Orthogonal grids count four.
    { subject: "orthogonal", views: ["desk"], url: address("grid=orthogonal&first=40"), ready: opened(40), target: GAME },
    // Hex grids count six, drawn as hexagons.
    { subject: "hex", views: ["desk"], url: address("grid=hex&first=40"), ready: opened(40), target: GAME },
    // Wraparound grids join opposite edges.
    { subject: "wraparound", views: ["desk"], url: address("grid=wrap&first=40"), ready: opened(40), target: GAME },
    // A heart-shaped field, medium: the cut-out cells are outside it.
    { subject: "heart", views: ["desk"], url: address("grid=square&shape=heart&level=medium&first=136"), ready: opened(136), target: GAME },
    // A star, on the four-neighbour rule.
    { subject: "star", views: ["desk"], url: address("grid=orthogonal&shape=star&level=medium&first=136"), ready: opened(136), target: GAME },
    // The explained hint: the status line says which cell is certain, and why.
    {
      subject: "hint",
      views: ["desk"],
      url: address("grid=square&first=40"),
      ready: opened(40),
      target: GAME,
      async prepare(page) {
        const before = await page.locator(".jr-status").textContent();
        await page.getByRole("button", { name: "Hint", exact: true }).click();
        await page.waitForFunction((was) => document.querySelector(".jr-status")?.textContent !== was, before);
      },
    },
    // Slate and flowers on a phone, a few cells marked.
    {
      subject: "slate-flowers",
      views: ["phone"],
      url: address("grid=square&first=40&material=slate&pieces=flowers"),
      ready: opened(40),
      target: GAME,
      async prepare(page) {
        for (const cell of [0, 8, 72]) await page.locator(`[data-cell="${cell}"]`).click({ button: "right" });
      },
    },
  ],
});
