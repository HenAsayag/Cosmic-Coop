import { bindActivation } from "./ButtonInput.js";
// Mobile menus and gameplay share the same fullscreen / landscape requirement.
// Fullscreen requests always originate from a tap, never from a page-load event.
export class DisplayManager {
  constructor() {
    this.required = true;
    this.pending = null;
    this.scene = null;
    this.busy = false;
    this.generation = 0;
    this.gate = document.createElement("section");
    this.gate.id = "display-gate";
    this.gate.hidden = true;
    this.gate.setAttribute("aria-label", "Full-screen landscape setup");
    this.gate.innerHTML = `<div class="display-card"><span class="eyebrow">PREPARE FOR TAKEOFF</span><div class="rotate-phone" aria-hidden="true">▱ ↻</div><h2 id="display-title">TURN YOUR PHONE</h2><p id="display-message"></p><button class="primary" id="enter-fullscreen">ENTER FULL SCREEN <span>⛶</span></button></div>`;
    document.body.append(this.gate);
    this.title = this.gate.querySelector("#display-title");
    this.message = this.gate.querySelector("#display-message");
    this.button = this.gate.querySelector("#enter-fullscreen");
    bindActivation(this.button, () => this.enter());
    for (const event of ["resize", "orientationchange"])
      window.addEventListener(event, () => this.check());
    for (const event of ["fullscreenchange", "webkitfullscreenchange"])
      document.addEventListener(event, () => this.check());
    matchMedia("(display-mode: standalone)").addEventListener("change", () =>
      this.check(),
    );
    this.check();
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
  menu(scene) {
    this.scene = scene;
    this.required = true;
    this.pending = null;
    this.generation++;
    this.check();
  }
  prepare(scene, ready) {
    this.scene = scene;
    if (!this.mobile || (this.fullscreen && this.landscape)) {
      this.pending = null;
      this.generation++;
      // Refresh Phaser's input bounds after the initial fullscreen layout.
      scene.scale.refresh();
      ready();
      return;
    }
    this.required = true;
    this.pending = ready;
    this.generation++;
    // Actual display state is sufficient. Optional orientation-lock promises
    // must never hold a stage selection or resume behind a browser response.
    this.check();
    if (!this.fullscreen || !this.landscape) this.enter();
  }
  async enter() {
    if (this.busy) {
      this.check();
      return;
    }
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
          Promise.resolve(screen.orientation.lock("landscape")).catch(() => {
            /* Physical rotation remains available if the browser declines. */
          });
        } catch {
          /* Physical rotation remains available. */
        }
      }
    } catch {
      /* The setup screen offers a retry if the browser refuses fullscreen. */
    } finally {
      this.busy = false;
      this.check();
    }
  }
  check() {
    const ready = !this.mobile || (this.landscape && this.fullscreen);
    this.gate.hidden = ready;
    document.documentElement.classList.toggle("display-blocked", !ready);
    const ui = document.getElementById("ui");
    if (ui) ui.inert = !ready;
    if (ready) {
      if (this.pending) {
        const start = this.pending,
          generation = this.generation;
        this.pending = null;
        // Phaser resizes its world before a pending flight is placed on screen.
        setTimeout(() => {
          if (generation !== this.generation) return;
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
      ? "Open the browser menu (or Share in Safari), choose Add to Home Screen, then launch Cosmic Coop from that icon and turn your phone sideways."
      : !this.landscape
        ? "The menu and game both use landscape. Turn your phone sideways and enter full screen to continue. Enable Auto-rotate if needed."
        : "Enter full screen to open the menu. Keep your phone sideways throughout your flight.";
    this.button.hidden = this.fullscreen || unsupported;
  }
}
export const display = new DisplayManager();
