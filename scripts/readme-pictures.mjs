// Captures the README's real desktop and phone games from the built demo.
import { existsSync, readFileSync, mkdirSync } from "node:fs";
import { dirname, join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const id = JSON.parse(readFileSync(join(root, "package.json"), "utf8")).name.split("/")[1];
const site = join(root, id === "jirai" ? "docs" : "site");
const docs = join(root, "docs");
mkdirSync(docs, { recursive: true });
const host = `http://${id}.test`;
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json" };
const browser = await chromium.launch();
for (const phone of [false, true]) {
  const context = await browser.newContext({ viewport: { width: phone ? 390 : 1280, height: phone ? 844 : 900 }, colorScheme: phone ? "dark" : "light", reducedMotion: "reduce", deviceScaleFactor: 2 });
  const page = await context.newPage();
  await page.route(`${host}/**`, route => {
    const pathname = new URL(route.request().url()).pathname;
    const file = join(site, pathname === "/" ? "index.html" : pathname.slice(1));
    return existsSync(file) ? route.fulfill({ body: readFileSync(file), contentType: types[extname(file)] ?? "application/octet-stream" }) : route.fulfill({ status: 404 });
  });
  await page.goto(`${host}/?lang=en&seed=7&noGuess=0`);
  if (id === "gunjin") {
    const size = phone ? 7 : 9;
    if (phone) { await page.locator("#size").selectOption("7"); await page.getByRole("button", { name: "New game", exact: true }).click(); }
    for (let i = 0; i < size; i++) await page.locator(`.gj-cell[data-cell="${size * (size - 1) + i}"]`).click();
    await page.getByRole("button", { name: "Finish setup", exact: true }).click();
    await page.getByRole("button", { name: "Pass device", exact: true }).click();
    for (let i = 0; i < size; i++) await page.locator(`.gj-cell[data-cell="${i}"]`).click();
    await page.getByRole("button", { name: "Finish setup", exact: true }).click();
    await page.getByRole("button", { name: "Pass device", exact: true }).click();
  } else if (id === "jirai") {
    await page.locator('[data-cell="40"]').click();
    await page.locator('[data-cell="40"][data-kind="open"]').waitFor();
  } else {
    if (phone) await page.getByLabel("Board", { exact: true }).selectOption("heart");
    else {
      const move = await page.evaluate(async () => (await import("/dist/index.js")).classicEnglish().answer[0]);
      await page.locator(`.cell[data-cell="${move.from}"]`).click();
      await page.locator(`.cell[data-cell="${move.to}"]`).click();
    }
  }
  if (phone) {
    await page.getByRole("button", { name: "日本語", exact: true }).click();
    await page.locator(id === "gunjin" ? "#player" : "#game").scrollIntoViewIfNeeded();
  }
  if (!phone) await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ fullPage: !phone, path: join(docs, phone ? "phone.jpg" : "desktop.jpg"), type: "jpeg", quality: 82 });
  await context.close();
}
await browser.close();
console.log("README desktop and phone screenshots saved.");
