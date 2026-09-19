import { save } from "./SaveManager.js";
export class MobileInput {
  constructor(scene) {
    this.scene = scene;
    this.pointerId = null;
    this.down = false;
    this.hasTarget = false;
    this.x = 0;
    this.y = 0;
    this.keys = scene.input.keyboard.addKeys(
      "W,A,S,D,UP,DOWN,LEFT,RIGHT,SPACE,SHIFT,X,ESC",
    );
    scene.input.addPointer(3);
    scene.input.mouse.disableContextMenu();
    scene.input.on("pointerdown", (p) => {
      if (scene.mode !== "play") return;
      if (p.rightButtonDown()) {
        scene.nova();
        return;
      }
      if (this.pointerId !== null || p.y < scene.h * 0.25) return;
      this.pointerId = p.id;
      this.down = true;
      this.target(p);
    });
    scene.input.on("pointermove", (p) => {
      if (scene.mode !== "play") return;
      if (p.wasTouch) {
        if (p.id === this.pointerId) this.target(p);
      } else this.target(p);
    });
    scene.input.on("pointerup", (p) => {
      if (p.id === this.pointerId) {
        this.pointerId = null;
        this.down = false;
      }
    });
    scene.input.on("pointerupoutside", () => {
      this.pointerId = null;
      this.down = false;
    });
    this.keys.ESC.on("down", () =>
      scene.mode === "play"
        ? scene.pauseGame()
        : scene.mode === "paused" &&
          scene.ui.el.screen.querySelector("#resume")?.click(),
    );
    this.keys.X.on("down", () => scene.nova());
  }
  reset() {
    this.pointerId = null;
    this.down = false;
    this.hasTarget = false;
  }
  target(p) {
    this.x = p.x;
    const offset = p.wasTouch
      ? (save.data.settings.fingerOffset * this.scene.h) /
        this.scene.game.canvas.getBoundingClientRect().height
      : 0;
    this.y = p.y - offset;
    this.hasTarget = true;
  }
  update(dt) {
    const g = this.scene,
      k = this.keys;
    let dx =
        Number(k.D.isDown || k.RIGHT.isDown) -
        Number(k.A.isDown || k.LEFT.isDown),
      dy =
        Number(k.S.isDown || k.DOWN.isDown) - Number(k.W.isDown || k.UP.isDown);
    const old = g.px;
    if (dx || dy) {
      const speed = k.SHIFT.isDown ? 370 : 950;
      const norm = dx && dy ? 0.707 : 1;
      g.px += dx * speed * norm * dt;
      g.py += dy * speed * norm * dt;
      this.hasTarget = false;
    } else if (this.hasTarget) {
      g.px += (this.x - g.px) * Math.min(1, dt * 22);
      g.py += (this.y - g.py) * Math.min(1, dt * 22);
    }
    g.px = Phaser.Math.Clamp(g.px, 60, g.w - 60);
    g.py = Phaser.Math.Clamp(g.py, g.h * 0.22, g.h - 190);
    g.player
      .setPosition(g.px, g.py)
      .setAngle(Phaser.Math.Clamp((g.px - old) * 0.35, -10, 10));
    return save.data.settings.autoFire || k.SPACE.isDown || this.down;
  }
}
