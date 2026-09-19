import { GameScene } from "./scenes/GameScene.js";
const dimensions = () => {
  const a = innerWidth / innerHeight;
  return a < 1
    ? { width: 1080, height: 1080 / a }
    : { width: 1080 * a, height: 1080 };
};
function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl") || c.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}
const forceCanvas =
  new URLSearchParams(location.search).get("renderer") === "canvas";
const game = new Phaser.Game({
  type: !forceCanvas && webglAvailable() ? Phaser.WEBGL : Phaser.CANVAS,
  parent: "game",
  ...dimensions(),
  backgroundColor: "#080d20",
  antialias: true,
  transparent: false,
  powerPreference: "high-performance",
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  input: { activePointers: 4 },
  audio: { disableWebAudio: false },
  scene: [GameScene],
  render: { batchSize: 4096, roundPixels: false },
  fps: { target: 60, forceSetTimeOut: false },
});
let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    const { width, height } = dimensions();
    game.scale.setGameSize(width, height);
  }, 100);
});
