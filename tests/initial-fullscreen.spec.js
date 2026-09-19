import { test, expect } from "@playwright/test";
for (const entry of ["while-loading", "after-loading"]) {
  test(`first fullscreen from portrait starts a live game: ${entry}`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      hasTouch: true,
      isMobile: true,
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    if (entry === "while-loading")
      await page.route("**/assets/**", async (route) => {
        await new Promise((r) => setTimeout(r, 800));
        await route.continue();
      });
    await page.goto((process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:4317/") + "?debug", {
      waitUntil: "domcontentloaded",
    });
    if (entry === "after-loading")
      await page.waitForFunction(() => window.__game?.ui);
    await page.getByRole("button", { name: "ENTER FULL SCREEN" }).tap();
    await page.setViewportSize({ width: 844, height: 390 });
    await page.waitForFunction(() => window.__game?.ui);
    await expect(page.locator("#display-gate")).toBeHidden();
    await page.getByRole("button", { name: "LET’S FLY" }).tap();
    await page.getByRole("button", { name: /01 · Amethyst/ }).tap();
    await expect
      .poll(() => page.evaluate(() => __game.mode), { timeout: 2000 })
      .toBe("play");
    await expect
      .poll(() => page.evaluate(() => __game.shots), { timeout: 2000 })
      .toBeGreaterThan(2);
    await expect
      .poll(() => page.evaluate(() => __game.enemies.count), { timeout: 4000 })
      .toBeGreaterThan(0);
    expect(errors).toEqual([]);
    await context.close();
  });
}
