import { test, expect } from "@playwright/test";
for (const delayed of ["initial-entry", "stage-selection"]) {
  test(`first mobile stage opens even when orientation lock is pending: ${delayed}`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:4317",
      viewport: { width: 844, height: 390 },
      hasTouch: true,
      isMobile: true,
    });
    const page = await context.newPage();
    if (delayed === "initial-entry")
      await page.addInitScript(() => {
        screen.orientation.lock = () => new Promise(() => {});
      });
    await page.goto("./?debug");
    await page.waitForFunction(() => window.__game?.ui);
    await page.getByRole("button", { name: "ENTER FULL SCREEN" }).tap();
    await expect(page.locator("#display-gate")).toBeHidden();
    if (delayed === "stage-selection")
      await page.evaluate(() => {
        screen.orientation.lock = () => new Promise(() => {});
      });
    for (let attempt = 0; attempt < 3; attempt++) {
      await page.getByRole("button", { name: "LET’S FLY" }).tap();
      await page.getByRole("button", { name: /01 · Amethyst/ }).tap();
      await expect
        .poll(() => page.evaluate(() => __game.mode), { timeout: 1500 })
        .toBe("play");
      expect(await page.evaluate(() => __game.wave)).toBe(1);
      await page.getByRole("button", { name: "Pause", exact: true }).tap();
      await page.getByRole("button", { name: "RESUME FLIGHT" }).tap();
      await expect
        .poll(() => page.evaluate(() => __game.mode), { timeout: 1500 })
        .toBe("play");
      await page.getByRole("button", { name: "Pause", exact: true }).tap();
      await page.getByRole("button", { name: "QUIT TO MAIN MENU" }).tap();
    }
    await context.close();
  });
}

test("first stage opens when touch reaches the button but compatibility click is suppressed", async ({
  browser,
}) => {
  const context = await browser.newContext({
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:4317",
    viewport: { width: 844, height: 390 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await page.goto("./?debug");
  await page.waitForFunction(() => window.__game?.ui);
  await page.getByRole("button", { name: "ENTER FULL SCREEN" }).tap();
  await expect(page.locator("#display-gate")).toBeHidden();
  await page.getByRole("button", { name: "LET’S FLY" }).tap();
  await page.evaluate(() => {
    window.startCalls = 0;
    const start = __game.startRun.bind(__game);
    __game.startRun = (...args) => {
      window.startCalls++;
      return start(...args);
    };
    document.addEventListener(
      "touchend",
      (event) => {
        if (event.target.closest("#system-0")) event.preventDefault();
      },
      { passive: false },
    );
  });
  await page.getByRole("button", { name: /01 · Amethyst/ }).tap();
  await expect
    .poll(() => page.evaluate(() => __game.mode), { timeout: 1500 })
    .toBe("play");
  expect(await page.evaluate(() => window.startCalls)).toBe(1);
  await context.close();
});

test("a normal mobile stage tap starts once and dragging a stage button does not select it", async ({
  browser,
}) => {
  const context = await browser.newContext({
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:4317",
    viewport: { width: 844, height: 390 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await page.goto("./?debug");
  await page.waitForFunction(() => window.__game?.ui);
  await page.getByRole("button", { name: "ENTER FULL SCREEN" }).tap();
  await expect(page.locator("#display-gate")).toBeHidden();
  await page.getByRole("button", { name: "LET’S FLY" }).tap();
  await page.evaluate(() => {
    window.startCalls = 0;
    const start = __game.startRun.bind(__game);
    __game.startRun = (...args) => {
      window.startCalls++;
      return start(...args);
    };
  });
  const button = page.getByRole("button", { name: /01 · Amethyst/ }),
    rect = await button.boundingBox(),
    cdp = await context.newCDPSession(page);
  const x = rect.x + rect.width / 2,
    y = rect.y + rect.height / 2;
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x, y, id: 1 }],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x: x + 30, y, id: 1 }],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await page.waitForTimeout(250);
  expect(await page.evaluate(() => window.startCalls)).toBe(0);
  await button.tap();
  await expect
    .poll(() => page.evaluate(() => __game.mode), { timeout: 1500 })
    .toBe("play");
  await page.waitForTimeout(250);
  expect(await page.evaluate(() => window.startCalls)).toBe(1);
  await context.close();
});
