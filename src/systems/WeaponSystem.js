import { WEAPONS } from "../data/content.js";
export class WeaponSystem {
  constructor(scene) {
    this.g = scene;
    this.timer = 0;
  }
  update(dt, firing) {
    const g = this.g;
    this.timer -= dt;
    g.lock = Math.max(0, g.lock - dt);
    if (g.lock > 0) {
      g.heat = Math.max(0, g.heat - dt * 95);
      return;
    }
    if (!firing) {
      g.heat = Math.max(0, g.heat - dt * 45);
      return;
    }
    g.heat = Math.max(0, g.heat - dt * 9);
    if (this.timer > 0) return;
    const w = WEAPONS[g.weapon],
      level = g.power;
    this.timer = w.rate * (1 - (level - 1) * 0.018);
    let count = 1 + Math.floor((level - 1) / 3);
    if (g.weapon === 1) count += 2;
    if (g.weapon === 5) count += 3;
    if (g.weapon === 6) count = 1 + Math.floor((level - 1) / 5);
    for (let i = 0; i < count; i++) {
      let spread =
        (i - (count - 1) / 2) *
        (g.weapon === 5 ? 0.17 : g.weapon === 1 ? 0.12 : 0.055);
      const p = g.bullets.get(
        `shot${g.weapon}`,
        g.px + (i - (count - 1) / 2) * 15,
        g.py - 55,
      );
      if (!p) break;
      p.vx = Math.sin(spread) * w.speed;
      p.vy = -Math.cos(spread) * w.speed;
      p.r = g.weapon === 6 ? 25 : 12;
      p.damage = w.damage * (1 + level * 0.1);
      p.family = g.weapon;
      p.ttl = 3;
      p.s
        .setDisplaySize(
          g.weapon === 6 ? 100 + level * 3 : 60 + level * 2,
          g.weapon === 2 ? 230 + level * 5 : 100 + level * 2,
        )
        .setRotation(spread);
      g.shots++;
    }
    g.heat += w.heat * (g.cooling > 0 ? 0.45 : 1);
    g.fx.burst(g.px, g.py - 55, w.color, 2);
    g.player.setScale(0.56, 0.59);
    g.audio.sfx(
      [
        "weapon_pulse",
        "weapon_plasma",
        "weapon_laser",
        "weapon_arc",
        "weapon_pulse",
        "weapon_plasma",
        "weapon_arc",
      ][g.weapon],
    );
    if (g.heat >= 100) {
      g.heat = 100;
      g.lock = 1.1;
      g.overheated = true;
      g.audio.sfx("overheat");
      g.fx.burst(g.px, g.py, 0xc5dbe3, 12, "smoke");
    }
  }
}
