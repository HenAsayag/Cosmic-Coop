export class SpritePool {
  constructor(scene, size, frame, depth = 5) {
    this.items = Array.from({ length: size }, () => {
      const s = scene.add
        .image(-500, -500, "atlas", frame)
        .setActive(false)
        .setVisible(false)
        .setDepth(depth);
      return {
        s,
        active: false,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        age: 0,
        ttl: 10,
        r: 10,
      };
    });
  }
  get(frame, x, y) {
    for (const p of this.items)
      if (!p.active) {
        p.active = true;
        p.x = x;
        p.y = y;
        p.vx = 0;
        p.vy = 0;
        p.age = 0;
        p.ttl = 10;
        p.endSize = 0;
        p.spin = 0;
        p.s
          .setTexture("atlas", frame)
          .setPosition(x, y)
          .setActive(true)
          .setVisible(true)
          .setAlpha(1)
          .setAngle(0)
          .setTint(0xffffff)
          .setScale(1)
          .setBlendMode(Phaser.BlendModes.NORMAL);
        return p;
      }
    return null;
  }
  release(p) {
    p.active = false;
    p.s.setActive(false).setVisible(false);
  }
  clear() {
    for (const p of this.items) if (p.active) this.release(p);
  }
  get count() {
    let n = 0;
    for (const p of this.items) if (p.active) n++;
    return n;
  }
}
export class ParticleManager {
  constructor(scene) {
    this.pool = new SpritePool(scene, 500, "spark", 9);
    this.cap = 300;
  }
  burst(x, y, color = 0xffe2b0, n = 12, frame = "spark") {
    let active = this.pool.count;
    for (let i = 0; i < n && active < this.cap; i++, active++) {
      const p = this.pool.get(frame, x, y);
      if (!p) break;
      const a = Math.random() * Math.PI * 2,
        v = 40 + Math.random() * 200;
      p.vx = Math.cos(a) * v;
      p.vy = Math.sin(a) * v;
      p.ttl = 0.35 + Math.random() * 0.6;
      p.size =
        frame === "feather" ? 20 + Math.random() * 20 : 8 + Math.random() * 22;
      p.spin = (Math.random() - 0.5) * 200;
      p.s.setDisplaySize(p.size, p.size).setTint(color);
    }
  }
  ring(x, y, color = 0xa9efff, size = 350, ttl = 0.6) {
    const p = this.pool.get("ring", x, y);
    if (!p) return;
    p.ttl = ttl;
    p.size = 30;
    p.endSize = size;
    p.spin = 0;
    p.s.setTint(color);
  }
  update(dt) {
    for (const p of this.pool.items) {
      if (!p.active) continue;
      p.age += dt;
      if (p.age > p.ttl) {
        this.pool.release(p);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      const k = p.age / p.ttl;
      p.s
        .setPosition(p.x, p.y)
        .setAlpha(1 - k)
        .setRotation(p.age * p.spin * 0.01);
      let size = p.endSize
        ? p.size + (p.endSize - p.size) * k
        : p.size * (1 - 0.4 * k);
      p.s.setDisplaySize(size, size);
      if (k > 0.99) p.endSize = 0;
    }
  }
}
