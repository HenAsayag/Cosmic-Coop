import { test, expect } from "@playwright/test";
const launch = async (page, url = "/?debug") => {
  await page.goto(url);
  await page.waitForFunction(() => window.__game?.ui);
};
const start = async (page) => {
  await page.getByRole("button", { name: "LET’S FLY" }).click();
  await page.getByRole("button", { name: /01 · Amethyst/ }).click();
};
test("WebGL launches, menu, gameplay, pause, Nova, restart and persistence", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await launch(page);
  expect(await page.evaluate(() => __game.game.renderer.type)).toBe(2);
  await page.screenshot({ path: "tests/menu-desktop.png" });
  await start(page);
  await page.waitForTimeout(4200);
  expect(await page.evaluate(() => __game.enemies.count)).toBeGreaterThan(0);
  expect(await page.evaluate(() => __game.shots)).toBeGreaterThan(0);
  await page.mouse.move(300, 550);
  await page.waitForTimeout(200);
  await page
    .getByRole("button", { name: "Use Nova Bomb" })
    .dispatchEvent("pointerdown");
  expect(await page.evaluate(() => __game.bombs)).toBe(2);
  await page.keyboard.press("Escape");
  expect(await page.evaluate(() => __game.mode)).toBe("paused");
  const t = await page.evaluate(() => __game.t);
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => __game.t)).toBe(t);
  await page.getByRole("button", { name: "SETTINGS", exact: true }).click();
  await page.getByLabel("Auto-fire").uncheck();
  await page.getByRole("button", { name: "SAVE & RETURN" }).click();
  await page.getByRole("button", { name: "RESUME FLIGHT" }).click();
  expect(await page.evaluate(() => __game.mode)).toBe("play");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "RESTART RUN" }).click();
  expect(await page.evaluate(() => __game.lives)).toBe(3);
  await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  expect(await page.evaluate(() => __game.mode)).toBe("paused");
  await page.reload();
  await page.waitForFunction(() => window.__game?.ui);
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("cosmic-coop-v1")).settings.autoFire,
    ),
  ).toBe(false);
  expect(errors).toEqual([]);
});
test("portrait, landscape and all requested viewport sizes fit and retain progress", async ({
  page,
}) => {
  await launch(page);
  for (const [width, height] of [
    [360, 640],
    [375, 667],
    [390, 844],
    [393, 852],
    [412, 915],
    [430, 932],
    [768, 1024],
    [1366, 768],
    [1920, 1080],
  ]) {
    await page.setViewportSize({ width, height });
    await page.waitForTimeout(150);
    const box = await page
      .getByRole("button", { name: "LET’S FLY" })
      .boundingBox();
    expect(box.y + box.height).toBeLessThanOrEqual(height);
    expect(box.x + box.width).toBeLessThanOrEqual(width);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "tests/menu-mobile.png" });
  await start(page);
  await page.waitForTimeout(4000);
  await page.screenshot({ path: "tests/game-mobile.png" });
  for (const size of [
    { width: 390, height: 844 },
    { width: 844, height: 390 },
  ]) {
    await page.setViewportSize(size);
    await page.waitForTimeout(200);
    const b = await page
      .getByRole("button", { name: "Use Nova Bomb" })
      .boundingBox();
    expect(b.width).toBeGreaterThanOrEqual(64);
    expect(b.y + b.height).toBeLessThanOrEqual(size.height);
    expect(await page.evaluate(() => __game.lives)).toBeGreaterThan(0);
  }
});
test("Canvas fallback launches and renders combat", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await launch(page, "/?debug&renderer=canvas");
  expect(await page.evaluate(() => __game.game.renderer.type)).toBe(1);
  await start(page);
  await page.waitForTimeout(3000);
  expect(await page.evaluate(() => __game.enemies.count)).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});
test("every formation stays reachable and every boss can complete", async ({
  page,
}) => {
  await launch(page);
  await start(page);
  const result = await page.evaluate(async () => {
    const { FormationManager } =
      await import("/src/systems/FormationManager.js");
    const { FORMATIONS } = await import("/src/data/content.js");
    let invalid = [];
    for (const f of FORMATIONS)
      for (let i = 0; i < 56; i++) {
        const p = FormationManager.point(f, i, 56);
        if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) invalid.push(f);
      }
    const g = __game;
    let bosses = [];
    for (let n = 10; n <= 80; n += 10) {
      g.enemies.clear();
      g.hostile.clear();
      g.wave = n;
      g.beginWave();
      const b = g.boss;
      b.inv = 0;
      g.damageEnemy(b, b.maxHp * 0.4);
      g.updateBoss(b, 0.01);
      const phase = b.phase;
      g.bossAttack(b);
      const shots = g.hostile.count;
      b.inv = 0;
      g.damageEnemy(b, 10000);
      bosses.push({ phase, shots, dead: !g.boss });
    }
    return { invalid, bosses };
  });
  expect(result.invalid).toEqual([]);
  for (const b of result.bosses) {
    expect(b.phase).toBe(2);
    expect(b.shots).toBeGreaterThan(0);
    expect(b.dead).toBe(true);
  }
});
test("pickups, heat lock, shields, respawn, game over and 24-wave pool stability", async ({
  page,
}) => {
  await launch(page);
  await start(page);
  const result = await page.evaluate(() => {
    const g = __game;
    g.waveDelay = 0;
    g.beginWave();
    for (let i = 0; i < 6; i++) {
      g.dropLoot(g.px, g.py, 1, i);
      g.collect(
        g.loot.items.find((p) => p.active && p.category === 1 && p.type === i),
      );
    }
    const pickups =
      g.power === 2 &&
      g.weapon === 1 &&
      g.shield &&
      g.magnet === 10 &&
      g.cooling === 15 &&
      g.doubleScore === 15;
    g.invuln = 0;
    g.damagePlayer();
    const shield = g.lives === 3 && !g.shield;
    g.invuln = 0;
    g.damagePlayer();
    const life = g.lives === 2 && g.respawn > 0;
    g.respawn = 0;
    g.heat = 99;
    g.weaponSystem.timer = 0;
    g.cooling = 0;
    g.weaponSystem.update(0.001, true);
    const heat = g.lock > 0;
    const before = g.children.length;
    for (let wave = 1; wave <= 24; wave++) {
      g.enemies.clear();
      g.wave = wave;
      g.beginWave();
      for (const e of g.enemies.items)
        if (e.active) {
          e.inv = 0;
          g.damageEnemy(e, 100000, true);
        }
      g.hostile.clear();
      g.loot.clear();
      g.fx.pool.clear();
    }
    const stable = before === g.children.length;
    g.lives = 1;
    g.invuln = 0;
    g.respawn = 0;
    g.damagePlayer();
    g.respawn = 0.001;
    g.update(0, 16);
    return { pickups, shield, life, heat, stable, mode: g.mode };
  });
  expect(result).toEqual({
    pickups: true,
    shield: true,
    life: true,
    heat: true,
    stable: true,
    mode: "over",
  });
  await expect(page.getByRole("button", { name: "TRY AGAIN" })).toBeVisible();
});
