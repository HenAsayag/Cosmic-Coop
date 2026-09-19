import { test, expect } from "@playwright/test";
test("real touch drag uses CSS finger offset and Nova multitouch never steals movement", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 844, height: 390 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4317/?debug");
  await page.waitForFunction(() => window.__game?.ui);
  await page.getByRole("button", { name: "ENTER FULL SCREEN" }).tap();
  await expect(page.locator("#display-gate")).toBeHidden();
  await page.getByRole("button", { name: "LET’S FLY" }).tap();
  await page.getByRole("button", { name: /01 · Amethyst/ }).tap();
  await page.waitForFunction(() => window.__game?.mode === "play");
  const cdp = await context.newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: 350, y: 300, id: 1 }],
  });
  await page.waitForTimeout(250);
  const first = await page.evaluate(() => ({
    x: __game.px,
    y: __game.py,
    scale: __game.h / innerHeight,
  }));
  expect(Math.abs(first.x / first.scale - 350)).toBeLessThan(5);
  expect(Math.abs(first.y / first.scale - 210)).toBeLessThan(8);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x: 390, y: 280, id: 1 }],
  });
  await page.waitForTimeout(250);
  const bomb = await page
    .getByRole("button", { name: "Use Nova Bomb" })
    .boundingBox();
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [
      { x: 190, y: 550, id: 1 },
      { x: bomb.x + bomb.width / 2, y: bomb.y + bomb.height / 2, id: 2 },
    ],
  });
  await page.waitForTimeout(150);
  const state = await page.evaluate(() => ({
    bombs: __game.bombs,
    x: (__game.px / __game.h) * innerHeight,
    y: (__game.py / __game.h) * innerHeight,
  }));
  expect(state.bombs).toBe(2);
  expect(Math.abs(state.x - 390)).toBeLessThan(6);
  expect(Math.abs(state.y - 190)).toBeLessThan(10);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await page.waitForTimeout(2400);
  await page.screenshot({ path: "tests/touch-game.png" });
  await context.close();
});
test("80-wave campaign unlocks endless, all seven weapons differ and pools stay fixed", async ({
  page,
}) => {
  await page.goto("/?debug");
  await page.waitForFunction(() => window.__game?.ui);
  await page.getByRole("button", { name: "LET’S FLY" }).click();
  await page.getByRole("button", { name: /01 · Amethyst/ }).click();
  const r = await page.evaluate(async () => {
    const { save } = await import("/src/systems/SaveManager.js");
    const g = __game;
    const before = g.children.length;
    let weaponShots = [];
    for (let family = 0; family < 7; family++) {
      g.bullets.clear();
      g.power = 12;
      g.heat = 0;
      g.lock = 0;
      g.weapon = family;
      g.weaponSystem.timer = 0;
      g.weaponSystem.update(0.016, true);
      weaponShots.push({
        count: g.bullets.count,
        frame: g.bullets.items.find((b) => b.active).s.frame.name,
      });
    }
    for (let wave = 1; wave <= 80; wave++) {
      g.wave = wave;
      g.enemies.clear();
      g.hostile.clear();
      g.loot.clear();
      g.beginWave();
      for (const e of g.enemies.items)
        if (e.active) {
          e.inv = 0;
          g.damageEnemy(e, 999999, true);
        }
      g.completeWave();
    }
    return {
      endless: save.data.endless,
      systems: save.data.unlockedSystems,
      cleared: g.cleared,
      stable: g.children.length === before,
      weapons: weaponShots,
      mode: g.mode,
    };
  });
  expect(r.endless).toBe(true);
  expect(r.systems).toBe(8);
  expect(r.cleared).toBe(80);
  expect(r.stable).toBe(true);
  expect(r.mode).toBe("over");
  expect(new Set(r.weapons.map((w) => w.frame)).size).toBe(7);
  await expect(
    page.getByRole("button", { name: "PLAY ENDLESS" }),
  ).toBeVisible();
});
