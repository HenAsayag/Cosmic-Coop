import { buildAtlas } from "../art/atlas.js";
import { AudioManager } from "../systems/AudioManager.js";
import { SpritePool, ParticleManager } from "../systems/Pools.js";
import { FormationManager } from "../systems/FormationManager.js";
import { WeaponSystem } from "../systems/WeaponSystem.js";
import { MobileInput } from "../systems/MobileInput.js";
import { UI } from "../systems/UI.js";
import { save } from "../systems/SaveManager.js";
import { waveFor, ENEMIES, BOSSES, SYSTEMS } from "../data/content.js";
export class GameScene extends Phaser.Scene {
  constructor() {
    super("Game");
  }
  preload() {
    this.load.image("painted", "assets/sprites/cosmic-coop-atlas.png");
    this.load.on(
      "progress",
      (p) =>
        (document.getElementById("load-progress").style.width = `${p * 100}%`),
    );
    this.load.on("loaderror", (f) => {
      document.getElementById("load-status").textContent =
        `Unable to load ${f.key}. Reload to retry.`;
    });
    for (let i = 1; i <= 8; i++)
      this.load.image(
        `bg${i - 1}`,
        `assets/backgrounds/system_0${i}_space.webp`,
      );
    for (const s of ["menu", "combat", "boss", "victory"])
      this.load.audio(`${s}_loop`, `assets/audio/music/${s}_loop.ogg`);
    for (const s of [
      "egg_splat",
      "weapon_arc",
      "enemy_death",
      "pickup_power",
      "egg_launch",
      "weapon_pulse",
      "weapon_laser",
      "enemy_hit",
      "menu_click",
      "wave_complete",
      "player_explosion",
      "nova_bomb",
      "overheat",
      "pickup_food",
      "boss_warning",
      "weapon_plasma",
    ])
      this.load.audio(s, `assets/audio/sfx/${s}.wav`);
  }
  create() {
    buildAtlas(this);
    this.w = this.scale.width;
    this.h = this.scale.height;
    this.mode = "menu";
    this.t = 0;
    this.toastLeft = 0;
    this.audio = new AudioManager(this);
    this.bg = this.add.image(this.w / 2, this.h / 2, "bg0").setDepth(-20);
    this.backshade = this.add
      .rectangle(this.w / 2, this.h / 2, this.w, this.h, 0x060d23, 0.36)
      .setDepth(-18);
    this.nebula = this.add
      .image(this.w * 0.65, this.h * 0.3, "bg3")
      .setAlpha(0.09)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(-19);
    this.stars = [];
    for (let i = 0; i < 110; i++) {
      let z = Math.random();
      this.stars.push({
        s: this.add
          .image(
            Math.random() * this.w,
            Math.random() * this.h,
            "atlas",
            "star",
          )
          .setDisplaySize(3 + z * 10, 3 + z * 10)
          .setAlpha(0.2 + z * 0.6)
          .setDepth(-10),
        speed: 8 + z * 50,
      });
    }
    this.planet = this.add
      .circle(this.w * 0.76, this.h * 0.34, 210, 0x294964, 0.16)
      .setStrokeStyle(2, 0x83c2db, 0.15)
      .setDepth(-8);
    this.orbit = this.add
      .ellipse(this.w * 0.76, this.h * 0.34, 720, 720)
      .setStrokeStyle(1, 0xb6e7f7, 0.13)
      .setDepth(-7);
    this.menuArt = this.add.container(0, 0).setDepth(1);
    this.heroBird = this.add.image(0, 0, "atlas", "bird1");
    this.heroScout = this.add.image(0, 0, "atlas", "bird0");
    this.heroArmor = this.add.image(0, 0, "atlas", "bird2");
    this.heroShip = this.add.image(0, 0, "atlas", "ship");
    this.menuArt.add([
      this.heroBird,
      this.heroScout,
      this.heroArmor,
      this.heroShip,
    ]);
    this.enemies = new SpritePool(this, 200, "bird0", 3);
    this.bullets = new SpritePool(this, 300, "shot0", 4);
    this.hostile = new SpritePool(this, 300, "egg", 4);
    this.loot = new SpritePool(this, 100, "food0", 5);
    this.fx = new ParticleManager(this);
    this.player = this.add
      .image(this.w / 2, this.h * 0.8, "atlas", "ship")
      .setDisplaySize(145, 145)
      .setDepth(6)
      .setVisible(false);
    this.shieldArt = this.add
      .image(0, 0, "atlas", "ring")
      .setDisplaySize(175, 175)
      .setTint(0x7eefff)
      .setAlpha(0.6)
      .setDepth(6)
      .setVisible(false);
    this.telegraph = this.add.graphics().setDepth(2);
    this.debugGraphics = this.add.graphics().setDepth(20);
    this.debugMode = new URLSearchParams(location.search).has("debug");
    this.labels = Array.from({ length: 30 }, () => ({
      s: this.add
        .text(0, 0, "", {
          fontFamily: "Arial",
          fontSize: "22px",
          fontStyle: "bold",
          color: "#e6fdb7",
          stroke: "#102038",
          strokeThickness: 3,
        })
        .setOrigin(0.5)
        .setDepth(12)
        .setVisible(false),
      age: 0,
      active: false,
    }));
    this.inputControl = new MobileInput(this);
    this.weaponSystem = new WeaponSystem(this);
    this.ui = new UI(this);
    this.scale.on("resize", (size) => this.resize(size.width, size.height));
    this.resize(this.w, this.h);
    this.setQuality();
    document.getElementById("loading").remove();
    this.ui.menu();
    this.events.once("shutdown", () => {
      window.removeEventListener("blur", this.onBlur);
      document.removeEventListener("visibilitychange", this.onVisibility);
    });
    this.onBlur = () => this.pauseGame();
    this.onVisibility = () => {
      if (document.hidden) this.pauseGame();
    };
    window.addEventListener("blur", this.onBlur);
    document.addEventListener("visibilitychange", this.onVisibility);
    if (this.debugMode) window.__game = this;
  }
  resize(w, h) {
    const oldW = this.w || w,
      oldH = this.h || h;
    this.w = w;
    this.h = h;
    if (this.px) {
      this.px = (this.px / oldW) * w;
      this.py = (this.py / oldH) * h;
    }
    const tex = this.textures.get("bg0").getSourceImage();
    this.bg
      .setPosition(w / 2, h / 2)
      .setDisplaySize(
        Math.max(w, (h * tex.width) / tex.height),
        Math.max(h, (w * tex.height) / tex.width),
      );
    this.backshade.setPosition(w / 2, h / 2).setSize(w, h);
    this.nebula.setPosition(w * 0.65, h * 0.3).setDisplaySize(w * 1.3, h * 1.3);
    this.planet.setPosition(w * 0.76, h * 0.34);
    this.orbit.setPosition(w * 0.76, h * 0.34);
    const portrait = w < h;
    this.heroBird
      .setPosition(w * (portrait ? 0.68 : 0.75), h * (portrait ? 0.2 : 0.34))
      .setDisplaySize(portrait ? 300 : 355, portrait ? 300 : 355)
      .setAngle(-12);
    this.heroScout
      .setPosition(w * (portrait ? 0.36 : 0.6), h * (portrait ? 0.12 : 0.23))
      .setDisplaySize(175, 175)
      .setAngle(15);
    this.heroArmor
      .setPosition(w * 0.91, h * (portrait ? 0.085 : 0.16))
      .setDisplaySize(210, 210)
      .setAngle(-16);
    this.heroShip
      .setPosition(w * (portrait ? 0.82 : 0.72), h * (portrait ? 0.38 : 0.68))
      .setDisplaySize(portrait ? 220 : 330, portrait ? 220 : 330)
      .setAngle(-18);
    this.inputControl?.reset();
  }
  showMenuArt(v) {
    this.menuArt.setVisible(v);
  }
  setQuality() {
    const q = save.data.settings.quality;
    this.fx.cap =
      q === "low" ? 90 : q === "medium" ? 220 : q === "high" ? 500 : 300;
  }
  startRun(wave = 1, endless = false) {
    this.clearRun();
    this.showMenuArt(false);
    this.mode = "play";
    this.startWave = wave;
    this.wave = wave;
    this.endless = endless;
    this.system = Math.floor(((wave - 1) % 80) / 10);
    this.score = 0;
    this.lives = 3;
    this.bombs = 3;
    this.power = 1;
    this.weapon = 0;
    this.food = 0;
    this.totalFood = 0;
    this.kills = 0;
    this.hits = 0;
    this.shots = 0;
    this.cleared = 0;
    this.combo = 1;
    this.bestCombo = 1;
    this.comboKills = 0;
    this.comboTime = 0;
    this.heat = 0;
    this.lock = 0;
    this.invuln = 2;
    this.respawn = 0;
    this.shield = false;
    this.magnet = 0;
    this.cooling = 0;
    this.doubleScore = 0;
    this.px = this.w / 2;
    this.py = this.h * 0.8;
    this.player
      .setPosition(this.px, this.py)
      .setVisible(true)
      .setAlpha(1)
      .setDisplaySize(145, 145);
    this.inputControl.reset();
    this.weaponSystem.timer = 0;
    this.waveDelay = 1.8;
    this.elapsed = 0;
    this.uiTick = 0;
    this.deathSequence = 0;
    this.bg.setTexture(`bg${this.system}`);
    this.ui.toast(
      SYSTEMS[this.system].toUpperCase(),
      "WARP DRIVE ONLINE · GOOD LUCK, PILOT",
      2,
    );
    this.audio.music("combat_loop");
    this.fx.ring(this.px, this.py, 0x7cdfff, 650, 1);
    this.ui.update();
  }
  clearRun() {
    this.sound.stopAll();
    for (const pool of [
      this.enemies,
      this.bullets,
      this.hostile,
      this.loot,
      this.fx.pool,
    ])
      pool.clear();
    for (const l of this.labels) {
      l.active = false;
      l.s.setVisible(false);
    }
    this.boss = null;
    this.player.setVisible(false);
    this.shieldArt.setVisible(false);
    this.telegraph.clear();
    this.debugGraphics.clear();
    this.tweens.killAll();
    this.cameras.main.resetFX();
    this.inputControl.reset();
    this.ui?.el.toast.style.setProperty("opacity", 0);
  }
  beginWave() {
    const d = waveFor(this.wave);
    this.system = d.system;
    this.waveData = d;
    this.waveAge = 0;
    this.waveHits = 0;
    this.waveFood = 0;
    this.overheated = false;
    this.waveShotStart = this.shots;
    this.waveHitStart = this.hits;
    this.bg.setTexture(`bg${d.system}`);
    this.audio.music(d.boss ? "boss_loop" : "combat_loop");
    if (d.boss) {
      const b = BOSSES[d.system];
      const e = this.enemies.get(`boss${d.system}`, this.w / 2, -250);
      Object.assign(e, {
        boss: true,
        name: b.name,
        type: d.system,
        hp: b.hp * (this.endless ? 1 + Math.floor(this.wave / 80) * 0.3 : 1),
        phase: 1,
        shotTimer: 3,
        warning: 0,
        spawn: 0,
        r: 112,
        maxHp: b.hp * (this.endless ? 1 + Math.floor(this.wave / 80) * 0.3 : 1),
        size: 330,
        flash: 0,
        inv: 2.5,
      });
      e.s.setDisplaySize(330, 330);
      this.boss = e;
      this.ui.toast("WARNING", b.name.toUpperCase(), 2.8);
      this.audio.sfx("boss_warning");
      this.shake(0.4, 0.003);
    } else {
      const types = Math.min(9, 3 + Math.floor((this.wave - 1) / 10));
      for (let i = 0; i < d.count; i++) {
        const type = (i + Math.floor(this.wave / 3)) % types,
          e = this.enemies.get(`bird${type}`, 0, -200);
        if (!e) break;
        const p = FormationManager.point(d.formation, i, d.count);
        Object.assign(e, {
          boss: false,
          type,
          hp: ENEMIES[type].hp,
          maxHp: ENEMIES[type].hp,
          index: i,
          nx: p.x,
          ny: p.y,
          spawn: -i * 0.025,
          shotTimer: 2 + Math.random() * 4,
          flash: 0,
          r: type === 0 ? 25 : 32,
          size: Math.min(
            type === 0 ? 94 : 114,
            350 / Math.max(2, Math.ceil(d.count / 6) - 1),
          ),
          dive: 0,
          shieldTimer: type === 5 ? 1 : 0,
        });
        e.r = e.size * 0.28;
        e.s.setDisplaySize(e.size, e.size);
      }
      this.ui.toast(
        `WAVE ${String(this.wave).padStart(2, "0")}`,
        `${SYSTEMS[this.system].toUpperCase()} · ${d.formation.replaceAll("_", " ")}`,
        1.6,
      );
    }
    this.ui.update();
  }
  pauseGame() {
    if (this.mode !== "play") return;
    this.mode = "paused";
    this.inputControl.reset();
    this.tweens.pauseAll();
    this.sound.pauseAll();
    this.ui.pause();
  }
  resumeGame() {
    if (this.mode !== "paused") return;
    this.mode = "play";
    this.inputControl.reset();
    this.tweens.resumeAll();
    this.sound.resumeAll();
  }
  shake(duration, intensity) {
    const s = save.data.settings.shake;
    if (s !== "off")
      this.cameras.main.shake(
        duration * 1000,
        intensity * (s === "reduced" ? 0.35 : 1),
      );
  }
  flash(duration = 130) {
    if (!save.data.settings.reducedFlashes)
      this.cameras.main.flash(duration, 160, 210, 240, false);
  }
  popup(x, y, text, color = "#e6fdb7") {
    const l = this.labels.find((l) => !l.active);
    if (l) {
      l.active = true;
      l.age = 0;
      l.s
        .setPosition(x, y)
        .setText(text)
        .setColor(color)
        .setVisible(true)
        .setAlpha(1);
    }
  }
  nova() {
    if (this.mode !== "play" || this.bombs < 1 || this.respawn > 0) return;
    this.bombs--;
    this.invuln = Math.max(this.invuln, 1.5);
    this.hostile.clear();
    this.audio.sfx("nova_bomb");
    this.audio.haptic(90);
    this.flash(250);
    this.shake(0.5, 0.006);
    this.fx.ring(this.px, this.py, 0xddff91, Math.max(this.w, this.h) * 2, 0.7);
    this.fx.ring(
      this.px,
      this.py,
      0x8ceaff,
      Math.max(this.w, this.h) * 1.5,
      0.8,
    );
    this.fx.burst(this.px, this.py, 0xdfff9b, 50);
    this.bg.setAlpha(0.7);
    this.tweens.add({ targets: this.bg, alpha: 1, duration: 700 });
    for (const e of this.enemies.items)
      if (e.active) this.damageEnemy(e, e.boss ? e.maxHp * 0.18 : 1000, true);
    this.ui.toast("NOVA UNLEASHED", "CLEAR SKIES AHEAD", 0.8);
    this.ui.update();
  }
  emitEnemy(x, y, angle, speed, kind = "egg") {
    const p = this.hostile.get(kind, x, y);
    if (!p) return;
    p.vx = Math.sin(angle) * speed;
    p.vy = Math.cos(angle) * speed;
    p.r = kind === "rocket" ? 17 : 13;
    p.ttl = 12;
    p.acc = kind === "egg" ? 30 : 0;
    p.s.setDisplaySize(
      kind === "rocket" ? 90 : kind === "egg" ? 75 : 60,
      kind === "rocket" ? 90 : kind === "egg" ? 75 : 60,
    );
    if (save.data.settings.contrast) p.s.setTint(0xffff68);
  }
  enemyFire(e) {
    const speed = 190 + this.system * 19,
      aim = Math.atan2(this.px - e.x, this.py - e.y);
    switch (e.type) {
      case 0:
        this.emitEnemy(e.x, e.y, 0, speed);
        break;
      case 1:
      case 2:
        this.emitEnemy(e.x, e.y, 0.1 * Math.sin(this.t), speed);
        break;
      case 3:
        for (let i = -1; i <= 1; i++) this.emitEnemy(e.x, e.y, i * 0.28, speed);
        break;
      case 4:
      case 5:
        this.emitEnemy(e.x, e.y, aim, speed * 1.3, "orb");
        break;
      case 6:
        this.emitEnemy(e.x, e.y, aim, speed * 0.85, "rocket");
        break;
      case 7:
        for (let i = 0; i < 8; i++)
          this.emitEnemy(e.x, e.y, (i * Math.PI) / 4, speed, "orb");
        break;
      case 8:
        for (let i = -1; i <= 1; i++)
          this.emitEnemy(e.x, e.y, aim + i * 0.24, speed * 1.3, "orb");
        break;
    }
    this.audio.sfx("egg_launch");
  }
  updateEnemy(e, dt) {
    e.spawn += dt;
    e.flash = Math.max(0, e.flash - dt);
    const t = this.waveAge;
    let tx = this.w / 2 + e.nx * this.w * 0.4,
      ty = this.h * 0.37 + e.ny * Math.min(300, this.h * 0.23);
    if (this.system >= 1) {
      tx += Math.sin(t * 0.7 + e.index * 0.1) * this.w * 0.045;
      ty += Math.cos(t * 0.5 + e.index * 0.25) * 25;
    }
    if (this.system >= 4) {
      const a = Math.sin(t * 0.32) * 0.18,
        dx = tx - this.w / 2,
        dy = ty - this.h * 0.37;
      tx = this.w / 2 + dx * Math.cos(a) - dy * Math.sin(a);
      ty = this.h * 0.37 + dx * Math.sin(a) + dy * Math.cos(a);
    }
    tx = Phaser.Math.Clamp(tx, 70, this.w - 70);
    ty = Phaser.Math.Clamp(ty, 140, this.h * 0.6);
    if (e.spawn < 2) {
      const pos = FormationManager.entrance(
        this.waveData.entrance,
        Math.max(0, e.spawn / 2),
        e.index,
        tx,
        ty,
        this.w,
        this.h,
      );
      e.x = pos.x;
      e.y = pos.y;
    } else {
      if (e.dive > 0) {
        e.dive += dt;
        e.x += Math.sin(e.dive * 3) * 160 * dt;
        e.y += 450 * dt;
        if (e.y > this.h + 90) {
          e.dive = 0;
          e.y = -100;
          e.spawn = 0;
        }
      } else {
        e.x += (tx - e.x) * Math.min(1, dt * 6);
        e.y += (ty - e.y) * Math.min(1, dt * 6);
        if (e.type === 4 && this.system >= 2 && Math.random() < dt * 0.06)
          e.dive = 0.01;
      }
      e.shotTimer -= dt;
      if (e.shotTimer < 0 && e.y > 100 && e.y < this.h * 0.65) {
        if (e.type === 8 && e.shotTimer > -0.65) {
          this.telegraph.lineStyle(2, 0xffad70, 0.5);
          this.telegraph.lineBetween(e.x, e.y, this.px, this.py);
        } else {
          this.enemyFire(e);
          e.shotTimer =
            Math.max(1.3, 5 - this.system * 0.35) + Math.random() * 4;
        }
      }
    }
    e.s
      .setPosition(e.x, e.y + Math.sin(this.t * 5 + e.index) * 4)
      .setRotation(Math.sin(this.t * 8 + e.index) * 0.045)
      .setDisplaySize(
        e.size * (1 + Math.sin(this.t * 9 + e.index) * 0.045),
        e.size * (1 - Math.sin(this.t * 9 + e.index) * 0.03),
      );
    e.s.setTint(
      e.flash > 0 ? 0xffffff : e.hp < e.maxHp * 0.5 ? 0xe8b1ab : 0xffffff,
    );
    e.s.setAlpha(e.type === 5 && Math.sin(this.t * 2) > 0 ? 0.65 : 1);
    if (e.flash > 0) e.s.setTintFill(0xffffff);
  }
  updateBoss(e, dt) {
    e.spawn += dt;
    e.inv = Math.max(0, e.inv - dt);
    e.flash = Math.max(0, e.flash - dt);
    let tx =
        this.w / 2 +
        Math.sin(this.waveAge * (0.5 + e.type * 0.04)) *
          this.w *
          (e.type === 4 ? 0.3 : 0.22),
      ty = this.h * 0.32 + Math.sin(this.waveAge * 0.85) * 25;
    if (e.spawn < 2.5) {
      e.x = this.w / 2;
      e.y = -250 + (ty + 250) * (1 - Math.pow(1 - e.spawn / 2.5, 3));
    } else {
      e.x += (tx - e.x) * dt * 2;
      e.y += (ty - e.y) * dt * 2;
      e.shotTimer -= dt;
      if (e.shotTimer < 0.85) {
        const n = 4 + e.phase + e.type;
        this.telegraph.lineStyle(
          3,
          0xffa178,
          0.2 + 0.5 * Math.abs(Math.sin(this.t * 10)),
        );
        this.telegraph.strokeCircle(e.x, e.y, 140 + Math.sin(this.t * 10) * 8);
        for (let i = 0; i < n; i++) {
          const a = (i - (n - 1) / 2) * 0.19;
          this.telegraph.lineBetween(
            e.x,
            e.y,
            e.x + Math.sin(a) * 500,
            e.y + Math.cos(a) * 500,
          );
        }
      }
      if (e.shotTimer <= 0) {
        this.bossAttack(e);
        e.shotTimer = Math.max(0.95, 2.3 - e.phase * 0.22 - e.type * 0.04);
      }
    }
    const phase = 1 + Math.min(2, Math.floor((1 - e.hp / e.maxHp) * 3));
    if (phase > e.phase) {
      e.phase = phase;
      e.inv = 0.8;
      this.hostile.clear();
      this.fx.ring(e.x, e.y, 0xffbe86, 550);
      this.fx.burst(e.x, e.y, 0xffc885, 35, "feather");
      this.ui.toast(
        `PHASE ${phase}`,
        `${e.name.toUpperCase()} IS GETTING ANGRY`,
        1.2,
      );
      this.audio.sfx("boss_warning");
      this.shake(0.2, 0.003);
    }
    e.s
      .setPosition(e.x, e.y)
      .setAngle(Math.sin(this.t * 2) * 6)
      .setDisplaySize(
        e.size * (1 + Math.sin(this.t * 4) * 0.025),
        e.size * (1 - Math.sin(this.t * 4) * 0.025),
      );
    e.s.clearTint();
    if (e.flash > 0) e.s.setTintFill(0xffffff);
    else if (phase === 3) e.s.setTint(0xffb9aa);
  }
  bossAttack(e) {
    const speed = 235 + this.system * 17 + e.phase * 25,
      aim = Math.atan2(this.px - e.x, this.py - e.y),
      n = 5 + e.phase * 2;
    switch (e.type) {
      case 0:
        for (let i = 0; i < n; i++)
          this.emitEnemy(e.x, e.y, (i - (n - 1) / 2) * 0.18, speed);
        break;
      case 1:
        for (let i = 0; i < 8; i++)
          this.emitEnemy(
            e.x - 150 + i * 43,
            e.y + 70,
            Math.sin(this.t) * 0.18,
            speed,
            "rocket",
          );
        break;
      case 2:
        for (let i = -e.phase; i <= e.phase; i++)
          this.emitEnemy(e.x, e.y, aim + i * 0.18, speed * 1.25, "orb");
        break;
      case 3:
        for (let i = 0; i < 12 + e.phase * 2; i++)
          this.emitEnemy(
            e.x,
            e.y,
            (i * Math.PI * 2) / (12 + e.phase * 2) + this.t * 0.2,
            speed * 0.8,
          );
        break;
      case 4:
        for (const x of [e.x - 120, e.x + 120])
          for (let i = -2; i <= 2; i++)
            this.emitEnemy(x, e.y, aim + i * 0.24, speed, "orb");
        break;
      case 5:
        for (let i = 0; i < 16; i++)
          this.emitEnemy(e.x, e.y, (i * Math.PI) / 8 + this.t, speed, "orb");
        break;
      case 6:
        for (let i = 0; i < n; i++)
          this.emitEnemy(
            e.x,
            e.y,
            (i - (n - 1) / 2) * 0.22 + Math.sin(this.t) * 0.25,
            speed,
            "rocket",
          );
        break;
      case 7:
        for (let i = 0; i < 18; i++)
          this.emitEnemy(
            e.x,
            e.y,
            (i * Math.PI) / 9 + this.t * 0.3,
            speed * 0.85,
            "orb",
          );
        for (let i = -2; i <= 2; i++)
          this.emitEnemy(e.x, e.y, aim + i * 0.13, speed * 1.35, "rocket");
        break;
    }
    this.audio.sfx("egg_launch");
  }
  damageEnemy(e, amount, nova = false) {
    if (!e.active || (e.boss && e.inv > 0 && !nova)) return;
    if (e.type === 5 && !e.boss && Math.sin(this.t * 2) > 0 && !nova)
      amount *= 0.4;
    e.hp -= amount;
    e.flash = 0.065;
    this.fx.burst(e.x, e.y, 0xffe6b0, 2);
    this.audio.sfx("enemy_hit");
    if (e.hp <= 0) this.killEnemy(e);
  }
  killEnemy(e) {
    const x = e.x,
      y = e.y;
    this.enemies.release(e);
    this.kills++;
    this.comboKills = this.comboTime > 0 ? this.comboKills + 1 : 1;
    this.comboTime = 1.5;
    this.combo = Math.min(5, 1 + Math.floor(this.comboKills / 4));
    this.bestCombo = Math.max(this.bestCombo, this.combo);
    const pts =
      (e.boss ? 5000 * (this.system + 1) : ENEMIES[e.type].score) *
      this.combo *
      (this.doubleScore > 0 ? 2 : 1);
    this.score += pts;
    this.popup(x, y, `+${pts}`);
    this.fx.burst(x, y, 0xffedc0, e.boss ? 45 : 10, "feather");
    this.fx.burst(x, y, 0xa2c4e4, e.boss ? 20 : 4, "smoke");
    this.fx.ring(x, y, 0xffddae, e.boss ? 600 : 130, 0.4);
    this.audio.sfx("enemy_death", 1 + this.combo * 0.04);
    if (e.boss) {
      this.boss = null;
      this.hostile.clear();
      this.deathSequence = this.system === 7 ? 4 : 1.5;
      this.deathX = x;
      this.deathY = y;
      this.deathBurst = 0;
      this.audio.sfx("nova_bomb");
      this.audio.haptic(120);
      this.shake(0.65, 0.009);
      this.flash(200);
      for (let i = 0; i < 10; i++)
        this.dropLoot(x + (Math.random() - 0.5) * 220, y, 0, i % 7);
      this.dropLoot(x, y, 1, 0);
      save.achievement(`Defeated ${e.name}`);
    } else {
      if (Math.random() < 0.3)
        this.dropLoot(x, y, 0, Math.floor(Math.random() * 7));
      if (Math.random() < 0.085)
        this.dropLoot(
          x,
          y,
          1,
          Math.random() < 0.45 ? 0 : Math.floor(1 + Math.random() * 5),
        );
    }
    if (this.kills === 5 || this.kills % 25 === 0) this.dropLoot(x, y, 1, 0);
    if (this.kills === 12 || this.kills % 38 === 0) this.dropLoot(x, y, 1, 1);
  }
  dropLoot(x, y, category, type) {
    const p = this.loot.get(`${category ? "pickup" : "food"}${type}`, x, y);
    if (!p) return;
    Object.assign(p, {
      category,
      type,
      vy: 125,
      vx: (Math.random() - 0.5) * 45,
      ttl: 14,
      r: 27,
    });
    p.s.setDisplaySize(category ? 82 : 74, category ? 82 : 74);
  }
  collect(p) {
    this.loot.release(p);
    if (p.category === 0) {
      this.food++;
      this.totalFood++;
      this.waveFood++;
      const points = 50 + p.type * 30;
      this.score += points * (this.doubleScore > 0 ? 2 : 1);
      this.audio.sfx("pickup_food");
      if (this.food >= 50) {
        this.food -= 50;
        this.bombs++;
        this.ui.toast("+1 NOVA BOMB", "SNACKS WELL SPENT", 1.4);
        this.audio.sfx("wave_complete");
      }
    } else {
      const messages = [
        "POWER UP",
        "WEAPON SWITCHED",
        "SHIELD ONLINE",
        "MAGNET ONLINE",
        "RAPID COOLING",
        "DOUBLE SCORE",
      ];
      switch (p.type) {
        case 0:
          this.power = Math.min(12, this.power + 1);
          break;
        case 1:
          this.weapon = (this.weapon + 1) % 7;
          break;
        case 2:
          this.shield = true;
          break;
        case 3:
          this.magnet = 10;
          break;
        case 4:
          this.cooling = 15;
          break;
        case 5:
          this.doubleScore = 15;
          break;
      }
      this.popup(this.px, this.py - 80, messages[p.type], "#8df1ff");
      this.audio.sfx("pickup_power");
      this.audio.haptic(15);
    }
    this.fx.burst(p.x, p.y, 0xa1ecff, 10);
  }
  damagePlayer() {
    if (this.invuln > 0 || this.respawn > 0 || this.mode !== "play") return;
    if (this.shield) {
      this.shield = false;
      this.invuln = 1;
      this.fx.ring(this.px, this.py, 0x7affff, 280);
      return;
    }
    this.lives--;
    this.waveHits++;
    this.power = Math.max(1, this.power - 2);
    this.respawn = 1.1;
    this.invuln = 3.1;
    this.player.setVisible(false);
    this.fx.burst(this.px, this.py, 0xffcc91, 24);
    this.fx.burst(this.px, this.py, 0xc7ecff, 12, "feather");
    this.fx.ring(this.px, this.py, 0xffbc85, 350);
    this.shake(0.4, 0.006);
    this.flash();
    this.audio.sfx("player_explosion");
    this.audio.haptic(70);
    this.hostile.clear();
    this.inputControl.reset();
    this.audio.current?.setVolume(0.05);
    this.ui.update();
  }
  completeWave() {
    this.cleared++;
    save.record(this.score);
    let bonus = "WAVE CLEAR";
    if (this.waveHits === 0) {
      bonus = "NO HIT";
      this.score += 500;
      save.achievement("Clean flight");
    }
    if (!this.overheated) {
      this.score += 250;
      if (this.waveHits === 0) bonus = "PERFECT WAVE";
    }
    if (this.waveAge < 25) {
      this.score += 500;
      bonus += " · FAST CLEAR";
    }
    if (
      (this.hits - this.waveHitStart) /
        Math.max(1, this.shots - this.waveShotStart) >
      0.65
    ) {
      this.score += 300;
      this.popup(this.w / 2, this.h * 0.48, "SHARPSHOOTER +300");
    }
    if (this.waveFood >= 8) {
      this.score += 300;
      this.popup(this.w / 2, this.h * 0.52, "FOOD MASTER +300");
    }
    this.audio.sfx("wave_complete");
    this.hostile.clear();
    this.wave++;
    if (this.wave > 80 && !this.endless) {
      save.data.endless = true;
      save.data.unlockedSystems = 8;
      save.save();
      this.mode = "over";
      this.audio.music("victory_loop");
      this.ui.finish(true);
      return;
    }
    const newSystem = Math.floor(((this.wave - 1) % 80) / 10);
    if (newSystem !== this.system) {
      save.data.unlockedSystems = Math.max(
        save.data.unlockedSystems,
        newSystem + 1,
      );
      save.save();
      this.bombs++;
      this.power = Math.min(12, this.power + 1);
      this.ui.toast(
        SYSTEMS[newSystem].toUpperCase(),
        "SYSTEM CLEARED · WARPING TO NEXT SECTOR",
        2.4,
      );
      this.waveDelay = 2.5;
      this.fx.ring(this.px, this.py, 0x9cefff, 2000, 1.5);
    } else {
      this.ui.toast(bonus, "SECTOR SECURED", 0.9);
      this.waveDelay = 1.05;
    }
  }
  update(time, delta) {
    const dt = Math.min(delta / 1000, 0.04);
    if (this.mode === "paused") return;
    this.t += dt;
    for (const star of this.stars) {
      star.s.y += star.speed * dt * (this.waveDelay > 1 ? 3 : 1);
      if (star.s.y > this.h + 10) {
        star.s.y = -10;
        star.s.x = Math.random() * this.w;
      }
    }
    this.nebula.rotation = Math.sin(this.t * 0.025) * 0.06;
    this.orbit.rotation = this.t * 0.02;
    if (this.mode === "menu") {
      this.heroBird.rotation = -0.2 + Math.sin(this.t * 1.8) * 0.055;
      this.heroScout.rotation = 0.23 + Math.sin(this.t * 2) * 0.1;
      this.heroShip.rotation = -0.3 + Math.sin(this.t) * 0.04;
      return;
    }
    if (this.mode !== "play") return;
    this.elapsed += dt;
    this.telegraph.clear();
    this.fx.update(dt);
    if (
      save.data.settings.quality === "auto" &&
      this.elapsed > 8 &&
      this.game.loop.actualFps < 45
    )
      this.fx.cap = 110;
    for (const l of this.labels)
      if (l.active) {
        l.age += dt;
        l.s.y -= 40 * dt;
        l.s.setAlpha(1 - l.age / 0.85);
        if (l.age > 0.85) {
          l.active = false;
          l.s.setVisible(false);
        }
      }
    if (this.toastLeft > 0) {
      this.toastLeft -= dt;
      if (this.toastLeft <= 0) this.ui.el.toast.style.opacity = 0;
    }
    this.invuln = Math.max(0, this.invuln - dt);
    this.magnet = Math.max(0, this.magnet - dt);
    this.cooling = Math.max(0, this.cooling - dt);
    this.doubleScore = Math.max(0, this.doubleScore - dt);
    this.comboTime -= dt;
    if (this.comboTime <= 0) {
      this.combo = 1;
      this.comboKills = 0;
    }
    if (this.respawn > 0) {
      this.respawn -= dt;
      if (this.respawn <= 0) {
        if (this.lives <= 0) {
          this.mode = "over";
          this.audio.current?.stop();
          this.ui.finish();
          return;
        }
        this.player.setVisible(true);
        this.px = this.w / 2;
        this.py = this.h * 0.8;
        this.player.setPosition(this.px, this.py);
        this.invuln = 2;
        this.audio.apply();
      }
    } else {
      const firing = this.inputControl.update(dt);
      this.player.setScale(
        Phaser.Math.Linear(this.player.scaleX, 0.566, 0.18),
        Phaser.Math.Linear(this.player.scaleY, 0.566, 0.18),
      );
      this.player.setAlpha(
        this.invuln > 0 ? (Math.sin(this.t * 25) > 0 ? 0.4 : 1) : 1,
      );
      this.weaponSystem.update(dt, firing);
      if (Math.random() < dt * 30)
        this.fx.burst(this.px, this.py + 60, 0x83dfff, 1);
    }
    this.shieldArt
      .setPosition(this.px, this.py)
      .setVisible(this.shield && this.respawn <= 0)
      .setAlpha(0.4 + Math.sin(this.t * 4) * 0.15);
    if (this.waveDelay > 0) {
      this.waveDelay -= dt;
      if (this.waveDelay <= 0) this.beginWave();
    } else if (this.deathSequence > 0) {
      this.deathSequence -= dt;
      this.deathBurst -= dt;
      if (this.deathBurst < 0) {
        this.deathBurst = 0.16;
        this.fx.burst(
          this.deathX + (Math.random() - 0.5) * 240,
          this.deathY + (Math.random() - 0.5) * 200,
          0xffc57b,
          18,
        );
        this.audio.sfx("enemy_death");
      }
      if (this.deathSequence <= 0) this.completeWave();
    } else {
      this.waveAge += dt;
      for (const e of this.enemies.items)
        if (e.active) e.boss ? this.updateBoss(e, dt) : this.updateEnemy(e, dt);
      if (this.enemies.count === 0) this.completeWave();
    }
    this.updateProjectiles(dt);
    this.updateLoot(dt);
    this.uiTick -= dt;
    if (this.uiTick <= 0) {
      this.uiTick = 0.1;
      this.ui.update();
    }
    if (this.debugMode) this.drawDebug();
  }
  updateProjectiles(dt) {
    for (const b of this.bullets.items) {
      if (!b.active) continue;
      b.age += dt;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.s.setPosition(b.x, b.y);
      if (b.y < -150 || b.age > b.ttl) {
        this.bullets.release(b);
        continue;
      }
      for (const e of this.enemies.items) {
        if (!e.active || e.spawn < 0.3) continue;
        const r = e.r + b.r;
        if (Phaser.Math.Distance.Squared(b.x, b.y, e.x, e.y) < r * r) {
          this.hits++;
          this.damageEnemy(e, b.damage);
          if (b.family === 6 || b.family === 3) {
            let count = 0;
            const reach = b.family === 6 ? 125 : 180;
            for (const other of this.enemies.items)
              if (
                other.active &&
                other !== e &&
                Phaser.Math.Distance.Squared(e.x, e.y, other.x, other.y) <
                  reach * reach
              ) {
                this.damageEnemy(other, b.damage * 0.5);
                this.fx.ring(other.x, other.y, 0x91faff, 80, 0.2);
                if (++count > 1 + Math.floor(this.power / 3)) break;
              }
          }
          this.bullets.release(b);
          break;
        }
      }
    }
    for (const p of this.hostile.items) {
      if (!p.active) continue;
      p.age += dt;
      p.vy += p.acc * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.s.setPosition(p.x, p.y).setAngle(p.age * 50);
      if (p.y > this.h + 30) {
        this.fx.burst(p.x, this.h - 15, 0xffd997, 3);
        this.audio.sfx("egg_splat");
        this.hostile.release(p);
        continue;
      }
      if (p.age > p.ttl || p.x < -120 || p.x > this.w + 120 || p.y < -200) {
        this.hostile.release(p);
        continue;
      }
      if (
        this.respawn <= 0 &&
        Phaser.Math.Distance.Squared(p.x, p.y, this.px, this.py) <
          Math.pow(p.r + 23, 2)
      ) {
        this.hostile.release(p);
        this.damagePlayer();
      }
    }
    for (const e of this.enemies.items)
      if (
        e.active &&
        e.spawn > 1 &&
        this.respawn <= 0 &&
        Phaser.Math.Distance.Squared(e.x, e.y, this.px, this.py) <
          Math.pow(e.r + 23, 2)
      )
        this.damagePlayer();
  }
  updateLoot(dt) {
    for (const p of this.loot.items) {
      if (!p.active) continue;
      p.age += dt;
      const dx = this.px - p.x,
        dy = this.py - p.y,
        dist = Math.hypot(dx, dy);
      if ((this.magnet > 0 || dist < 180) && this.respawn <= 0) {
        const speed = this.magnet > 0 ? 650 : 420;
        p.x += (dx / Math.max(1, dist)) * speed * dt;
        p.y += (dy / Math.max(1, dist)) * speed * dt;
      } else {
        p.y += p.vy * dt;
        p.x += p.vx * dt;
      }
      p.s
        .setPosition(p.x + Math.sin(p.age * 4) * 6, p.y)
        .setAngle(Math.sin(p.age * 2) * 12)
        .setAlpha(0.8 + Math.sin(p.age * 5) * 0.2);
      if (dist < 60 && this.respawn <= 0) this.collect(p);
      else if (p.y > this.h + 60 || p.age > p.ttl) this.loot.release(p);
    }
  }
  drawDebug() {
    this.debugGraphics.clear().lineStyle(2, 0x00ff99, 0.8);
    this.debugGraphics.strokeCircle(this.px, this.py, 23);
    for (const e of this.enemies.items)
      if (e.active) this.debugGraphics.strokeCircle(e.x, e.y, e.r);
  }
}
