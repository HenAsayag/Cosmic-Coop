import { test, expect } from "@playwright/test";
test("stage selection accepts native touch when fullscreen suppresses pointer and compatibility mouse events", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 844, height: 390 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await page.goto((process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:4317/") + "?debug");
  await page.waitForFunction(() => window.__game?.ui);
  await page.getByRole("button", { name: "ENTER FULL SCREEN" }).tap();
  await page.getByRole("button", { name: "LET’S FLY" }).tap();
  await page.evaluate(() => {
    for (const event of ["pointerdown", "pointerup", "click"])
      document.addEventListener(
        event,
        (e) => {
          if (e.target.closest("#system-0")) e.stopImmediatePropagation();
        },
        true,
      );
  });
  const r = await page.locator("#system-0").boundingBox(),
    cdp = await context.newCDPSession(page),
    x = r.x + r.width / 2,
    y = r.y + r.height / 2;
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x, y, id: 1 }],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await expect
    .poll(() => page.evaluate(() => __game.mode), { timeout: 1500 })
    .toBe("play");
  await expect
    .poll(() => page.evaluate(() => __game.shots), { timeout: 2000 })
    .toBeGreaterThan(0);
  await context.close();
});
