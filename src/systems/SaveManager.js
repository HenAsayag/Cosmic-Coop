export const DEFAULTS = {
  master: 0.65,
  music: 0.35,
  sfx: 0.6,
  mute: false,
  shake: "reduced",
  haptics: true,
  autoFire: true,
  contrast: false,
  reducedFlashes: false,
  quality: "auto",
  fingerOffset: 90,
};
export class SaveManager {
  constructor() {
    this.data = {
      version: 1,
      highScore: 0,
      unlockedSystems: 1,
      endless: false,
      achievements: [],
      settings: { ...DEFAULTS },
    };
    try {
      const v = JSON.parse(localStorage.getItem("cosmic-coop-v1"));
      if (v && v.version === 1) {
        this.data = {
          ...this.data,
          ...v,
          settings: { ...DEFAULTS, ...v.settings },
        };
      }
    } catch {}
  }
  save() {
    try {
      localStorage.setItem("cosmic-coop-v1", JSON.stringify(this.data));
    } catch {}
  }
  set(key, value) {
    this.data.settings[key] = value;
    this.save();
  }
  record(score) {
    this.data.highScore = Math.max(this.data.highScore, Math.floor(score));
    this.save();
  }
  achievement(name) {
    if (!this.data.achievements.includes(name)) {
      this.data.achievements.push(name);
      this.save();
    }
  }
}
export const save = new SaveManager();
