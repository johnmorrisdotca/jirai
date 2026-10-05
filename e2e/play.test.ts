import { expect, test } from "@playwright/test";
test("a verified field, notes, hints, appearance and just-board mode", async ({ page }) => {
  const errors: string[] = []; page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/?seed=7");
  await page.locator('[data-cell="40"]').click();
  await expect(page.locator('[data-cell="40"]')).toHaveAttribute("data-kind", "open", { timeout: 20_000 });
  await expect(page.locator(".jr-board")).toHaveAttribute("aria-busy", "false");
  await page.locator('[name="material"]').selectOption("slate");
  await expect(page.locator(".jr-root")).toHaveAttribute("data-material", "slate");
  await page.getByRole("button", { name: "Just the board", exact: true }).click();
  await expect(page.locator("dialog")).toBeVisible();
  await page.keyboard.press("Escape"); await expect(page.locator("dialog")).not.toBeVisible();
  await page.getByRole("button", { name: "Start over", exact: true }).click();
  await expect(page.locator('[data-cell="40"]')).toHaveAttribute("data-kind", "covered");
  await page.locator('[data-cell="0"]').focus(); await page.keyboard.press("f");
  await expect(page.locator('[data-cell="0"]')).toHaveAttribute("data-kind", "flag");
  await page.keyboard.press("ArrowRight"); await page.keyboard.press("Enter");
  await expect(page.locator('[data-cell="1"]')).toHaveAttribute("data-kind", "open");
  await page.screenshot({ path: `../jirai-${test.info().project.name}.png`, fullPage: true });
  expect(errors).toEqual([]);
});
for (const grid of ["hex","wrap"]) test(`${grid} boards and saving a run`, async ({ page }) => {
  await page.goto(`/?grid=${grid}&seed=19`);
  await page.locator('[data-cell="40"]').click();
  await expect(page.locator('[data-cell="40"]')).toHaveAttribute("data-kind", "open", { timeout: 20_000 });
  await expect(page.locator(".jr-root")).toHaveAttribute("data-grid", grid);
  await page.goto("/");
  await expect(page.locator(".jr-root")).toHaveAttribute("data-grid", grid);
  await expect(page.locator('[data-cell="40"]')).toHaveAttribute("data-kind", "open");
});
test("orthogonal rules have their own selection and saved-code version", async ({ page }) => {
  await page.goto("/?grid=orthogonal&seed=19&noGuess=0");
  await expect(page.locator(".jr-root")).toHaveAttribute("data-grid", "orthogonal");
  await expect(page.locator('[name="grid"] option[value="orthogonal"]')).toHaveCount(1);
  await page.locator('[data-cell="40"]').click();
  await expect(page.locator('[data-cell="40"]')).toHaveAttribute("data-kind", "open");
  await page.goto("/");
  await expect(page.locator(".jr-root")).toHaveAttribute("data-grid", "orthogonal");
  await expect(page.locator('[data-cell="40"]')).toHaveAttribute("data-kind", "open");
});
test("four levels set the field, and the old names still do", async ({ page }) => {
  await page.goto("/");
  const level = page.locator('[name="preset"]');
  await expect(level.locator("option")).toHaveText(["Easy · 9 × 9 / 10 mines", "Medium · 16 × 16 / 40 mines", "Hard · 30 × 16 / 99 mines", "Extra-hard · 40 × 24 / 240 mines", "Huge easy · 32 × 32 / 126 mines", "Huge medium · 32 × 32 / 160 mines", "Huge hard · 32 × 32 / 211 mines", "Huge extra-hard · 32 × 32 / 256 mines", "Wide · 21 × 9 / 24 mines", "Tall · 9 × 21 / 24 mines", "Choose your own"]);
  const read = async () => [await page.locator('[name="width"]').inputValue(), await page.locator('[name="height"]').inputValue(), await page.locator('[name="mines"]').inputValue()];
  for (const [name, size] of [["easy", ["9", "9", "10"]], ["medium", ["16", "16", "40"]], ["hard", ["30", "16", "99"]], ["extra-hard", ["40", "24", "240"]]] as const) {
    await level.selectOption(name);
    expect(await read()).toEqual(size);
  }
  await page.locator('[name="mines"]').fill("77");
  await expect(level).toHaveValue("custom");
  for (const [old, name, size] of [["beginner", "easy", ["9", "9", "10"]], ["intermediate", "medium", ["16", "16", "40"]], ["expert", "hard", ["30", "16", "99"]], ["extra_hard", "extra-hard", ["40", "24", "240"]]] as const) {
    await page.goto(`/?level=${old}`);
    await expect(level).toHaveValue(name);
    expect(await read()).toEqual(size);
  }
});
test("an extra-hard field is dealt in a browser's time, and is a full 40 by 24 board", async ({ page }) => {
  const errors: string[] = []; page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/?level=extra-hard&seed=7&noGuess=1");
  await expect(page.locator("[data-cell]")).toHaveCount(960);
  const started = Date.now();
  await page.locator('[data-cell="500"]').click();
  await expect(page.locator('[data-cell="500"]')).toHaveAttribute("data-kind", "open", { timeout: 20_000 });
  expect(Date.now() - started).toBeLessThan(8_000);
  await expect(page.locator(".jr-board")).toHaveAttribute("aria-busy", "false");
  await expect(page.locator("#board-subtitle")).toHaveText("40 × 24 · 240 mines");
  expect(errors).toEqual([]);
});
test("a level keeps its size on a shaped board and its share of the mines", async ({ page }) => {
  await page.goto("/?level=hard&shape=star");
  await expect(page.locator('[name="preset"]')).toHaveValue("hard");
  expect([await page.locator('[name="width"]').inputValue(), await page.locator('[name="height"]').inputValue()]).toEqual(["30", "16"]);
  const mines = Number(await page.locator('[name="mines"]').inputValue());
  expect(mines).toBeGreaterThan(20); expect(mines).toBeLessThan(60);
  await page.locator('[name="shape"]').selectOption("heart");
  await expect(page.locator('[name="preset"]')).toHaveValue("hard");
  expect(Number(await page.locator('[name="mines"]').inputValue())).toBeGreaterThan(mines);
  await page.locator('[name="shape"]').selectOption("rectangle");
  expect(await page.locator('[name="mines"]').inputValue()).toBe("99");
});
test("the levels are named in Japanese too", async ({ page }) => {
  await page.goto("/?language=ja");
  await expect(page.locator('[name="preset"] option[value="extra-hard"]')).toHaveText("超上級 · 40 × 24 / 地雷240");
  await expect(page.locator('[name="preset"] option[value="easy"]')).toHaveText("初級 · 9 × 9 / 地雷10");
});

test("a huge field is 1,024 squares, dealt and opened in a browser's time, flagged and revealed at once, with no sideways scroll of the page", async ({ page }) => {
  const errors: string[] = []; page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/?level=huge-hard&seed=7");
  await expect(page.locator('[name="preset"]')).toHaveValue("huge-hard");
  expect([await page.locator('[name="width"]').inputValue(), await page.locator('[name="height"]').inputValue(), await page.locator('[name="mines"]').inputValue()]).toEqual(["32", "32", "211"]);
  await expect(page.locator("[data-cell]")).toHaveCount(1024);
  const started = Date.now();
  await page.locator('[data-cell="528"]').click();
  await expect(page.locator('[data-cell="528"]')).toHaveAttribute("data-kind", "open", { timeout: 20_000 });
  expect(Date.now() - started).toBeLessThan(8_000);
  await expect(page.locator("#board-subtitle")).toHaveText("32 × 32 · 211 mines");
  // A tap is answered in a frame or two: flag a covered square and wait for the board to show it.
  const waited = await page.evaluate(async () => {
    const cell = [...document.querySelectorAll<HTMLElement>("[data-cell]")].find((each) => each.dataset.kind === "covered")!;
    const number = cell.dataset.cell!, at = performance.now();
    cell.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true }));
    await new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)));
    return { ms: performance.now() - at, flagged: document.querySelector<HTMLElement>(`[data-cell="${number}"]`)!.dataset.kind };
  });
  expect(waited.flagged).toBe("flag");
  expect(waited.ms).toBeLessThan(250);
  const [scroll, client] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
  expect(scroll).toBeLessThanOrEqual(client);
  expect(errors).toEqual([]);
});
