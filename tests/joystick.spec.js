import { test, expect } from "@playwright/test";
async function openPhone(browser) {
  const context = await browser.newContext({
    baseURL: "http://127.0.0.1:4317",
    viewport: { width: 844, height: 390 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await page.goto("/?debug");
  await page.waitForFunction(() => window.__game?.ui);
  await page.getByRole("button", { name: "ENTER FULL SCREEN" }).tap();
  await expect(page.locator("#display-gate")).toBeHidden();
  return { context, page };
}
test("landscape menu text and controls do not overlap across small phones", async ({
  browser,
}) => {
  const { context, page } = await openPhone(browser);
  await page.evaluate(() => document.fonts.ready);
  for (const [width, height] of [
    [568, 320],
    [640, 360],
    [667, 375],
    [740, 360],
    [844, 390],
    [932, 430],
    [1024, 600],
  ]) {
    await page.setViewportSize({ width, height });
    await page.waitForTimeout(250);
    const boxes = await page.evaluate(() =>
      [
        ".topline",
        ".hero-copy h1",
        ".hero-copy .subtitle",
        ".play-button",
        ".endless",
        ".menu-links",
        ".menu-bottom",
      ].flatMap((selector) => {
        const e = document.querySelector(selector),
          r = e.getBoundingClientRect();
        return getComputedStyle(e).display === "none"
          ? []
          : [{ selector, x: r.x, y: r.y, right: r.right, bottom: r.bottom }];
      }),
    );
    for (let i = 0; i < boxes.length; i++) {
      const b = boxes[i];
      expect(b.x, `${width}: ${b.selector}`).toBeGreaterThanOrEqual(0);
      expect(b.right).toBeLessThanOrEqual(width);
      expect(b.bottom).toBeLessThanOrEqual(height);
      if (i > 0)
        expect(
          b.y,
          `${width}: ${b.selector} overlaps ${boxes[i - 1].selector}`,
        ).toBeGreaterThanOrEqual(boxes[i - 1].bottom - 1);
    }
    if (width === 640)
      await page.screenshot({ path: "tests/joystick-menu-landscape.png" });
  }
  await page.evaluate(() => document.exitFullscreen());
  await expect(page.locator("#display-gate")).toBeVisible();
  await expect(page.getByRole("button", { name: "LET’S FLY" })).toBeHidden();
  await context.close();
});
test("joystick moves continuously, Nova uses second finger, release/cancel/pause stop movement", async ({
  browser,
}) => {
  const { context, page } = await openPhone(browser);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.getByRole("button", { name: "LET’S FLY" }).tap();
  await page.getByRole("button", { name: /01 · Amethyst/ }).tap();
  await page.waitForFunction(() => __game.mode === "play");
  await page.evaluate(() => (__game.invuln = 100));
  const cdp = await context.newCDPSession(page),
    box = await page.locator("#joystick").boundingBox(),
    x = box.x + box.width / 2,
    y = box.y + box.height / 2;
  const touch = async (type, points) =>
    cdp.send("Input.dispatchTouchEvent", { type, touchPoints: points });
  const initial = await page.evaluate(() => __game.px);
  await touch("touchStart", [{ x, y, id: 1 }]);
  await touch("touchMove", [{ x: x + box.width * 0.32, y, id: 1 }]);
  await page.waitForTimeout(250);
  expect(await page.evaluate(() => __game.px)).toBeGreaterThan(initial + 100);
  const bomb = await page
    .getByRole("button", { name: "Use Nova Bomb" })
    .boundingBox();
  await touch("touchStart", [
    { x: x + box.width * 0.32, y, id: 1 },
    { x: bomb.x + bomb.width / 2, y: bomb.y + bomb.height / 2, id: 2 },
  ]);
  await page.waitForTimeout(100);
  expect(await page.evaluate(() => __game.bombs)).toBe(2);
  expect(await page.evaluate(() => __game.inputControl.joyX)).toBeGreaterThan(
    0.9,
  );
  await touch("touchEnd", []);
  const stopped = await page.evaluate(() => __game.px);
  await page.waitForTimeout(200);
  expect(await page.evaluate(() => __game.px)).toBeCloseTo(stopped, 2);
  await touch("touchStart", [{ x, y, id: 3 }]);
  await touch("touchMove", [{ x: x - 30, y: y - 30, id: 3 }]);
  await page.waitForTimeout(100);
  expect(
    await page.evaluate(() =>
      Math.hypot(__game.inputControl.joyX, __game.inputControl.joyY),
    ),
  ).toBeCloseTo(1, 2);
  await touch("touchCancel", []);
  expect(await page.evaluate(() => __game.inputControl.joystickPointer)).toBe(
    null,
  );
  expect(await page.evaluate(() => __game.inputControl.joyX)).toBe(0);
  await touch("touchStart", [{ x, y, id: 4 }]);
  await touch("touchMove", [{ x: x + 35, y, id: 4 }]);
  await page.evaluate(() => __game.pauseGame());
  expect(await page.evaluate(() => __game.inputControl.joystickPointer)).toBe(
    null,
  );
  expect(await page.evaluate(() => __game.inputControl.joyX)).toBe(0);
  await touch("touchEnd", []);
  await page.getByRole("button", { name: "RESUME FLIGHT" }).tap();
  await page.waitForFunction(() => __game.mode === "play");
  const resumed = await page.evaluate(() => __game.px);
  await page.waitForTimeout(150);
  expect(await page.evaluate(() => __game.px)).toBeCloseTo(resumed, 2);
  await page.screenshot({ path: "tests/joystick-game-landscape.png" });
  expect(errors).toEqual([]);
  await context.close();
});
