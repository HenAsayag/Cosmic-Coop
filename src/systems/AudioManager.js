import { save } from "./SaveManager.js";
export class AudioManager {
  constructor(scene) {
    this.scene = scene;
    this.current = null;
    this.track = "";
    this.last = new Map();
  }
  volume() {
    const s = save.data.settings;
    return s.mute ? 0 : s.master;
  }
  music(name) {
    if (this.track === name) {
      this.apply();
      if (this.current?.isPaused) this.current.resume();
      else if (this.current && !this.current.isPlaying) this.current.play();
      return;
    }
    this.current?.stop();
    this.current?.destroy();
    this.track = name;
    this.current = this.scene.sound.add(name, {
      loop: true,
      volume: save.data.settings.music * this.volume(),
    });
    this.current.play();
  }
  apply() {
    this.current?.setVolume(save.data.settings.music * this.volume());
  }
  sfx(name, rate = 1) {
    const now = performance.now();
    if (now - (this.last.get(name) || 0) < 55) return;
    this.last.set(name, now);
    this.scene.sound.play(name, {
      volume: save.data.settings.sfx * this.volume() * 0.65,
      rate: rate * (0.96 + Math.random() * 0.08),
    });
  }
  haptic(ms) {
    if (save.data.settings.haptics && navigator.vibrate) navigator.vibrate(ms);
  }
}
