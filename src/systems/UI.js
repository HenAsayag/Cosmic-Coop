import { display } from "./DisplayManager.js";
import { save } from "./SaveManager.js";
import { SYSTEMS, WEAPONS } from "../data/content.js";
export class UI {
  constructor(scene) {
    this.scene = scene;
    this.root = document.getElementById("ui");
    this.returnTo = "menu";
    this.installHUD();
  }
  installHUD() {
    this.root.innerHTML = `<div class="hud" id="hud"><div class="hud-top"><div><span class="label">SCORE</span><strong id="score">000000</strong><span class="combo" id="combo"></span></div><div class="wave-hud"><span class="label" id="system-label">AMETHYST EXPANSE</span><strong id="wave">01 / 80</strong></div><div><span class="lives" id="lives">♥ ♥ ♥</span><button class="pause-button" id="pause" aria-label="Pause">Ⅱ</button></div></div><div class="boss-hud" id="boss-hud"><span class="label" id="boss-name"></span><div class="heat-track"><i id="boss-health"></i></div></div><div class="hud-bottom"><div class="weapon-info"><span class="label" id="power">POWER 01 / 12</span><strong id="weapon">Pulse Blaster</strong><div class="heat-track"><i id="heat"></i></div><span class="label" id="heat-label">HEAT</span></div><div class="food-info"><span class="label">FOOD</span><strong id="food">0 / 50</strong></div><button class="nova" id="nova" aria-label="Use Nova Bomb"><b>✳</b><span id="bombs">NOVA · 3</span></button></div></div><div class="toast" id="toast"><span></span><strong></strong></div><div id="screen"></div>`;
    this.el = {};
    for (const id of [
      "hud",
      "score",
      "combo",
      "wave",
      "system-label",
      "lives",
      "boss-hud",
      "boss-name",
      "boss-health",
      "power",
      "weapon",
      "heat",
      "heat-label",
      "food",
      "bombs",
      "nova",
      "screen",
      "toast",
    ])
      this.el[id] = document.getElementById(id);
    document.getElementById("pause").onclick = () => this.scene.pauseGame();
    this.el.nova.onpointerdown = (e) => {
      e.stopPropagation();
      e.preventDefault();
      this.scene.nova();
    };
  }
  bind(id, fn) {
    document.getElementById(id)?.addEventListener("click", () => {
      this.scene.audio.sfx("menu_click");
      fn();
    });
  }
  menu() {
    display.release();
    this.el.hud.style.display = "none";
    this.scene.mode = "menu";
    this.scene.showMenuArt(true);
    this.scene.audio.music("menu_loop");
    this.el.screen.innerHTML = `<section class="menu"><header class="topline"><div class="brand"><span class="brand-icon">✳</span> ORBITAL ARCADE</div><div class="status"><i></i> ALL SYSTEMS GO</div></header><div class="menu-main"><div class="hero-copy"><span class="eyebrow">A LITTLE SHIP. A WHOLE LOT OF TROUBLE.</span><h1>COSMIC<span>COOP</span></h1><div class="subtitle">FEATHERFALL</div><p class="description">The flock has gone cosmic.<br>Gear up, dodge the eggs, and take back the galaxy.</p><button class="primary play-button" id="play">LET’S FLY <span class="arrow">↗</span></button><button class="secondary endless" id="endless" ${save.data.endless ? "" : "disabled"}>ENDLESS MODE <span>${save.data.endless ? "∞" : "LOCKED · FINISH CAMPAIGN"}</span></button><div class="menu-links"><button class="text-button" id="how">HOW TO PLAY ↗</button><button class="text-button" id="settings">SETTINGS</button><button class="text-button" id="credits">CREDITS</button></div></div><div class="hero-label"><strong>SMALL SHIP. BIG ENERGY.</strong><p>FALCON–01 / READY FOR TAKEOFF</p></div></div><div class="menu-bottom"><div><span class="stat-label">YOUR PERSONAL BEST</span><span class="stat-value">${save.data.highScore.toLocaleString("en-US").padStart(6, "0")} <small>PTS</small></span></div><div><span class="stat-label">THE MISSION</span><span class="stat-value">08 <small>STAR SYSTEMS</small> / 80 <small>WAVES</small></span></div><div><span class="stat-label">FLIGHT STATUS</span><span class="stat-value" style="color:var(--lime)">READY <small>TO MAKE FEATHERS FLY</small></span></div></div><footer class="footer"><span>BUILT FOR QUICK REFLEXES & QUESTIONABLE DECISIONS</span><span>V1.0 · ${this.scene.game.renderer.type === Phaser.WEBGL ? "WEBGL" : "CANVAS"}</span></footer></section>`;
    this.bind("play", () => this.modeSelect());
    this.bind("endless", () => this.start(1, true));
    this.bind("how", () => this.how());
    this.bind("settings", () => {
      this.returnTo = "menu";
      this.settings();
    });
    this.bind("credits", () => this.credits());
  }
  panel(kicker, title, body) {
    this.el.screen.innerHTML = `<div class="modal-wrap"><section class="panel"><span class="eyebrow">${kicker}</span><h2>${title}</h2>${body}</section></div>`;
  }
  modeSelect() {
    this.panel(
      "CHOOSE YOUR DEPARTURE",
      "THE GALAXY IS CALLING",
      `<p>Start fresh or return to an unlocked star system. Each departure starts with three lives and three Nova Bombs.</p><div class="systems">${SYSTEMS.map((n, i) => `<button class="secondary" id="system-${i}" ${i >= save.data.unlockedSystems ? "disabled" : ""}>0${i + 1} · ${n}<small>${i < save.data.unlockedSystems ? `WAVES ${i * 10 + 1}–${i * 10 + 10}` : "UNEXPLORED"}</small></button>`).join("")}</div><button class="secondary back" id="back">BACK</button>`,
    );
    SYSTEMS.forEach((_, i) =>
      this.bind(`system-${i}`, () => this.start(i * 10 + 1, false)),
    );
    this.bind("back", () => this.menu());
  }
  start(wave, endless) {
    display.prepare(this.scene, () => {
      this.el.screen.innerHTML = "";
      this.el.hud.style.display = "block";
      this.scene.startRun(wave, endless);
    });
  }
  how() {
    this.panel(
      "FLIGHT SCHOOL",
      "MAKE FEATHERS FLY",
      `<p>Clear formations, collect energy cores, and bring down the boss in every tenth wave. Finish all eight systems to unlock Endless.</p><div class="controls"><div><b>MOVE</b><span>Mouse · WASD · Arrow keys<br>Touch: drag below the top quarter</span></div><div><b>FIRE</b><span>Automatic by default<br>Space or hold to fire manually</span></div><div><b>NOVA BOMB</b><span>X · Right click · ✳ button<br>50 food earns an extra bomb</span></div><div><b>STAY COOL</b><span>Heat at 100% locks fire briefly<br>Shift for precision · Esc to pause</span></div></div><p>↑ Energy increases power. ◆ Crates change weapons. Shields absorb a hit. Magnets pull in loot. Cooling and double score last 15 seconds.</p><button class="primary" id="back">GOT IT <span>↗</span></button>`,
    );
    this.bind("back", () => this.menu());
  }
  credits() {
    this.panel(
      "MADE WITH A LITTLE STARDUST",
      "MISSION CREW",
      `<p>Cosmic Coop: Featherfall<br>An original arcade game built with Phaser 3.</p><p>Original generated 3D character artwork with vector-painted effects, packed into one runtime atlas. Backgrounds and synthesized audio from the supplied Cosmic Coop Mobile Kit. Food symbols use your system’s emoji font.</p><p>Inspired by the joy of classic formation shooters. No assets or code from Chicken Invaders are included.</p><button class="secondary" id="back">BACK TO BASE</button>`,
    );
    this.bind("back", () => this.menu());
  }
  settings() {
    const s = save.data.settings;
    this.panel(
      "TUNE YOUR FLIGHT",
      "SETTINGS",
      `${["master", "music", "sfx"].map((k) => `<label class="setting">${{ master: "Master volume", music: "Music", sfx: "Sound effects" }[k]}<input aria-label="${k} volume" data-setting="${k}" type="range" min="0" max="1" step=".05" value="${s[k]}"></label>`).join("")}${[
        ["mute", "Mute all audio"],
        ["autoFire", "Auto-fire"],
        ["haptics", "Haptics"],
        ["contrast", "High contrast projectiles"],
        ["reducedFlashes", "Reduced flashes"],
      ]
        .map(
          ([k, l]) =>
            `<label class="setting">${l}<input data-setting="${k}" type="checkbox" ${s[k] ? "checked" : ""}></label>`,
        )
        .join(
          "",
        )}<label class="setting">Screen shake<select data-setting="shake">${["full", "reduced", "off"].map((k) => `<option ${s.shake === k ? "selected" : ""}>${k}</option>`).join("")}</select></label><label class="setting">Effects quality<select data-setting="quality">${["auto", "high", "medium", "low"].map((k) => `<option ${s.quality === k ? "selected" : ""}>${k}</option>`).join("")}</select></label><label class="setting">Finger offset<input aria-label="Finger offset" data-setting="fingerOffset" type="range" min="70" max="110" value="${s.fingerOffset}"></label><button class="primary" id="back">SAVE & RETURN <span>↗</span></button>`,
    );
    this.el.screen.querySelectorAll("[data-setting]").forEach((e) =>
      e.addEventListener("input", () => {
        save.set(
          e.dataset.setting,
          e.type === "checkbox"
            ? e.checked
            : e.type === "range"
              ? +e.value
              : e.value,
        );
        this.scene.audio.apply();
        this.scene.setQuality();
      }),
    );
    this.bind("back", () =>
      this.returnTo === "pause" ? this.pause() : this.menu(),
    );
  }
  pause() {
    this.panel(
      "TAKE A BREATHER",
      "FLIGHT PAUSED",
      `<p>The galaxy can wait a moment.</p><button class="primary" id="resume">RESUME FLIGHT <span>↗</span></button><button class="secondary" id="restart">RESTART RUN</button><button class="secondary" id="settings">SETTINGS</button><button class="text-button back" id="quit">QUIT TO MAIN MENU</button>`,
    );
    this.bind("resume", () => {
      display.prepare(this.scene, () => {
        this.el.screen.innerHTML = "";
        this.scene.resumeGame();
      });
    });
    this.bind("restart", () =>
      this.start(this.scene.startWave, this.scene.endless),
    );
    this.bind("settings", () => {
      this.returnTo = "pause";
      this.settings();
    });
    this.bind("quit", () => {
      this.scene.clearRun();
      this.menu();
    });
  }
  finish(win = false) {
    const g = this.scene;
    save.record(g.score);
    this.el.hud.style.display = "none";
    this.panel(
      win ? "ALL EIGHT SYSTEMS LIBERATED" : "EVERY PILOT HAS A LAST EGG",
      win ? "GALAXY, SAVED." : "FLIGHT ENDED",
      `<p>${win ? "You made it. Endless Mode is now unlocked." : "Shake off the feathers. Your next flight is waiting."}</p><div class="controls"><div><b>${Math.floor(g.score).toLocaleString()}</b><span>SCORE · BEST ${save.data.highScore.toLocaleString()}</span></div><div><b>${g.cleared}</b><span>WAVES CLEARED</span></div><div><b>${g.kills}</b><span>ENEMIES DESTROYED</span></div><div><b>${Math.min(100, Math.round((g.hits / Math.max(1, g.shots)) * 100))}%</b><span>ACCURACY</span></div><div><b>${g.totalFood}</b><span>FOOD COLLECTED</span></div><div><b>×${g.bestCombo}</b><span>HIGHEST COMBO</span></div></div><button class="primary" id="retry">${win ? "PLAY ENDLESS" : "TRY AGAIN"} <span>↗</span></button><button class="secondary" id="back">MAIN MENU</button>`,
    );
    this.bind("retry", () =>
      this.start(win ? 1 : g.startWave, win || g.endless),
    );
    this.bind("back", () => {
      g.clearRun();
      this.menu();
    });
  }
  toast(title, sub = "", duration = 2) {
    this.el.toast.querySelector("strong").textContent = title;
    this.el.toast.querySelector("span").textContent = sub;
    this.el.toast.style.opacity = 1;
    this.scene.toastLeft = duration;
  }
  update() {
    const g = this.scene;
    this.el.score.textContent = Math.floor(g.score).toString().padStart(6, "0");
    this.el.wave.textContent = `${String(g.wave).padStart(2, "0")} / ${g.endless ? "∞" : "80"}`;
    this.el["system-label"].textContent = SYSTEMS[g.system];
    this.el.lives.textContent = "♥ ".repeat(Math.max(0, g.lives));
    this.el.combo.textContent = g.combo > 1 ? `×${g.combo} COMBO` : "";
    this.el.power.textContent = `POWER ${String(g.power).padStart(2, "0")} / 12`;
    this.el.weapon.textContent = WEAPONS[g.weapon].name;
    this.el.heat.style.width = `${g.heat}%`;
    this.el.heat.style.background =
      g.heat > 85 ? "#ff7e86" : g.heat > 69 ? "#ffdc87" : "#75e3ff";
    this.el["heat-label"].textContent =
      g.lock > 0 ? "COOLING…" : g.heat > 70 ? "HEAT · CAUTION" : "HEAT";
    this.el.food.textContent = `${g.food} / 50`;
    this.el.bombs.textContent = `NOVA · ${g.bombs}`;
    this.el.nova.disabled = g.bombs === 0;
    this.el["boss-hud"].style.display = g.boss ? "block" : "none";
    if (g.boss) {
      this.el["boss-name"].textContent = g.boss.name;
      this.el["boss-health"].style.width =
        `${Math.max(0, (g.boss.hp / g.boss.maxHp) * 100)}%`;
    }
  }
}
