import { test, expect } from "@playwright/test";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";
const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const id = pkg.name.split("/")[1];
const site = join(process.cwd(), "site");
test("the API reference covers every entry and fits a phone", async ({ page }) => {
  const errors = [];
  page.on("pageerror", error => errors.push(String(error)));
  await page.route("http://reference.test/**", route => {
    const pathname = new URL(route.request().url()).pathname;
    const file = join(site, pathname.endsWith("/") ? `${pathname}index.html` : pathname);
    if (!existsSync(file)) return route.fulfill({ status: 404 });
    return route.fulfill({ body: readFileSync(file), contentType: file.endsWith(".html") ? "text/html" : file.endsWith(".js") ? "text/javascript" : "text/css" });
  });
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("http://reference.test/api.html");
    await expect(page.locator("h1")).toContainText(id[0].toUpperCase() + id.slice(1));
    await expect(page.locator(".api-entry")).toHaveCount(Object.keys(pkg.exports).length);
    expect(await page.locator(".api-entry article h3 a").count()).toBeGreaterThan(20);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.locator("#main-newGame h3 a").click();
    await expect(page.locator("h1")).toContainText("newGame");
    await expect(page.locator("main pre").first()).toBeVisible();
    await expect(page.locator(`a[href="https://www.npmjs.com/package/${pkg.name}"]`)).toBeVisible();
    await page.locator('header .lang a[data-lang="ja"]').click();
    await expect(page.locator("html")).toHaveAttribute("lang", "ja");
  }
  expect(errors).toEqual([]);
});
