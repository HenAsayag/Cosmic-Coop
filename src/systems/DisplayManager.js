// Fullscreen must be requested from a tap; orientation locks can be refused by browsers.
// A gate prevents mobile combat from starting in portrait or behind browser chrome.
export class DisplayManager {
  constructor() {
    this.required = false;
    this.pending = null;
    this.scene = null;
    this.busy = false;
    this.gate = document.createElement("section");
    this.gate.id = "display-gate";
    this.gate.hidden = true;
    this.gate.innerHTML = `<div class="display-card"><span class="eyebrow">PREPARE FOR TAKEOFF</span><div class="rotate-phone" aria-hidden="true">▱ ↻</div><h2 id="display-title">TURN YOUR PHONE</h2><p id="display-message"></p><button class="primary" id="enter-fullscreen">ENTER FULL SCREEN <span>⛶</span></button><button class="text-button" id="display-back">BACK TO MENU</button></div>`;
    document.body.append(this.gate);
    this.title = this.gate.querySelector("#display-title");
    this.message = this.gate.querySelector("#display-message");
    this.button = this.gate.querySelector("#enter-fullscreen");
    this.button.onclick = () => this.enter();
    this.gate.querySelector("#display-back").onclick = () => {
      this.pending = null;
      this.release();
      this.scene?.clearRun();
      this.scene?.ui.menu();
    };
    for (const event of ["resize", "orientationchange"])
      window.addEventListener(event, () => this.check());
    for (const event of ["fullscreenchange", "webkitfullscreenchange"])
      document.addEventListener(event, () => this.check());
    matchMedia("(display-mode: standalone)").addEventListener("change", () =>
      this.check(),
    );
  }
  get mobile() {
    return (
      navigator.maxTouchPoints > 0 &&
      matchMedia("(any-pointer: coarse)").matches
    );
  }
  get fullscreen() {
    return !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      navigator.standalone ||
      matchMedia("(display-mode: standalone)").matches ||
      matchMedia("(display-mode: fullscreen)").matches
    );
  }
  get supported() {
    return !!(
      (document.fullscreenEnabled &&
        document.documentElement.requestFullscreen) ||
      document.documentElement.webkitRequestFullscreen
    );
  }
  get landscape() {
    return innerWidth > innerHeight;
  }
  prepare(scene, ready) {
    this.scene = scene;
    if (!this.mobile) {
      ready();
      return;
    }
    this.required = true;
    this.pending = ready;
    // Called synchronously from the system-selection button, preserving user activation.
    this.enter();
  }
  async enter() {
    if (this.busy) return;
    this.busy = true;
    try {
      if (!this.fullscreen && this.supported) {
        const root = document.documentElement;
        if (root.requestFullscreen)
          await root.requestFullscreen({ navigationUI: "hide" });
        else await root.webkitRequestFullscreen();
      }
      if (this.fullscreen && screen.orientation?.lock) {
        try {
          await screen.orientation.lock("landscape");
        } catch {
          /* Physical rotation is the fallback. */
        }
      }
    } catch {
      /* User can retry without losing a run. */
    } finally {
      this.busy = false;
      this.check();
    }
  }
  check() {
    if (!this.required || !this.mobile) {
      this.gate.hidden = true;
      return;
    }
    const ready = this.landscape && this.fullscreen;
    this.gate.hidden = ready;
    if (ready) {
      if (this.pending) {
        const start = this.pending;
        this.pending = null;
        // Wait for Phaser's debounced resize before placing the player.
        setTimeout(() => {
          if (!this.required) return;
          if (this.landscape && this.fullscreen) start();
          else {
            this.pending = start;
            this.check();
          }
        }, 180);
      }
      return;
    }
    if (this.scene?.mode === "play") this.scene.pauseGame();
    const unsupported = !this.fullscreen && !this.supported;
    this.title.textContent = unsupported
      ? "ADD TO HOME SCREEN"
      : !this.landscape
        ? "TURN YOUR PHONE"
        : "GO FULL SCREEN";
    this.message.textContent = unsupported
      ? "For full-screen play, open the browser menu (or Share in Safari), choose Add to Home Screen, then launch Cosmic Coop from that icon and turn your phone sideways."
      : !this.landscape
        ? "Cosmic Coop flies in landscape. Turn your phone sideways. If it does not rotate, enable Auto-rotate on your phone."
        : "Tap below to fill your screen and lock the game in landscape. Your flight will wait for you.";
    this.button.hidden = this.fullscreen || unsupported;
  }
  release() {
    this.required = false;
    this.pending = null;
    this.gate.hidden = true;
  }
}
export const display = new DisplayManager();
