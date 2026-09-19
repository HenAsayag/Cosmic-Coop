import { test, expect } from "@playwright/test";
const enter = async (page) => {
  await page.goto("/?debug");
  await page.waitForFunction(() => window.__game?.ui);
  await page.getByRole("button", { name: "LET’S FLY" }).tap();
  await page.getByRole("button", { name: /01 · Amethyst/ }).tap();
};
test("phone requests actual fullscreen, runs landscape, pauses on portrait and fullscreen exit", async ({
  browser,
}) => {
  const context = await browser.newContext({
    baseURL: "http://127.0.0.1:4317",
    viewport: { width: 844, height: 390 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await enter(page);
  await page.waitForFunction(() => __game.mode === "play");
  expect(await page.evaluate(() => !!document.fullscreenElement)).toBe(true);
  expect(await page.evaluate(() => __game.w > __game.h)).toBe(true);
  await page.waitForTimeout(3800);
  await page.screenshot({ path: "tests/landscape-fullscreen.png" });
  for (const name of ["Pause", "Use Nova Bomb"]) {
    const b = await page
      .getByRole("button", { name, exact: true })
      .boundingBox();
    expect(b.x).toBeGreaterThanOrEqual(0);
    expect(b.x + b.width).toBeLessThanOrEqual(844);
    expect(b.y + b.height).toBeLessThanOrEqual(390);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator("#display-gate")).toBeVisible();
  expect(await page.evaluate(() => __game.mode)).toBe("paused");
  const time = await page.evaluate(() => __game.t);
  await page.waitForTimeout(200);
  expect(await page.evaluate(() => __game.t)).toBe(time);
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(page.locator("#display-gate")).toBeHidden();
  expect(await page.evaluate(() => __game.mode)).toBe("paused");
  await page.getByRole("button", { name: "RESUME FLIGHT" }).tap();
  await page.waitForFunction(() => __game.mode === "play");
  await page.evaluate(() => document.exitFullscreen());
  await expect(page.locator("#display-gate")).toBeVisible();
  expect(await page.evaluate(() => __game.mode)).toBe("paused");
  await page.getByRole("button", { name: "ENTER FULL SCREEN" }).tap();
  await expect(page.locator("#display-gate")).toBeHidden();
  expect(errors).toEqual([]);
  await context.close();
});
test("installed mode waits for landscape; unavailable fullscreen explains home-screen launch", async ({
  browser,
}) => {
  const context = await browser.newContext({
    baseURL: "http://127.0.0.1:4317",
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "standalone", {
      get: () => true,
      configurable: true,
    });
  });
  await enter(page);
  await expect(page.locator("#display-gate")).toBeVisible();
  expect(await page.evaluate(() => __game.mode)).toBe("menu");
  await page.setViewportSize({ width: 844, height: 390 });
  await page.waitForFunction(() => __game.mode === "play");
  await expect(page.locator("#display-gate")).toBeHidden();
  await context.close();
  const fallback = await browser.newContext({
    baseURL: "http://127.0.0.1:4317",
    viewport: { width: 844, height: 390 },
    hasTouch: true,
    isMobile: true,
  });
  const p = await fallback.newPage();
  await p.addInitScript(() => {
    Object.defineProperty(document, "fullscreenEnabled", { get: () => false });
    Object.defineProperty(Element.prototype, "webkitRequestFullscreen", {
      value: undefined,
      configurable: true,
    });
  });
  await enter(p);
  await expect(p.locator("#display-title")).toHaveText("ADD TO HOME SCREEN");
  expect(await p.evaluate(() => __game.mode)).toBe("menu");
  await expect(
    p.getByRole("button", { name: "ENTER FULL SCREEN" }),
  ).toBeHidden();
  await fallback.close();
});
