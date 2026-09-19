# Cosmic Coop: Featherfall

[Play on GitHub Pages](https://henasayag.github.io/Cosmic-Coop/)

An original Phaser 3 / WebGL arcade shooter: eight star systems, 80 campaign waves, eight bosses, seven weapons with 12 power levels, food and power-up drops, heat management, and unlockable Endless Mode.

## Play on a phone

1. Open the Pages link. The menu waits behind the full-screen landscape setup screen.
2. Hold the phone **horizontally (landscape)** and tap **ENTER FULL SCREEN**. Then choose **LET’S FLY** and a star system. The game requests an orientation lock when supported.
3. If the browser cannot put web games in full screen, use **Add to Home Screen** (Safari: Share → Add to Home Screen), launch the installed icon, and rotate the phone. Enable phone auto-rotation if necessary.

Both the mobile menu and combat wait until the game is full screen / installed and landscape. Leaving full screen or turning to portrait pauses the run. Returning to landscape never silently resumes combat: tap **RESUME FLIGHT**.

Use the **left joystick** to move; release it to stop immediately. Auto-fire is enabled by default. Dragging the playfield is also supported, with the ship above the finger. Tap the Nova button with a second finger to clear danger. Desktop controls: mouse / WASD / arrows, Space or held click to fire, Shift for precision, X / right click for Nova, Escape to pause.

## Run locally

```sh
npm install
npm start
```

Open http://127.0.0.1:4317. No production build is required. Phaser is bundled in `vendor/`, and all gameplay assets are local. Google Fonts is optional; system font fallbacks are included.

## Deployment

GitHub Pages publishes `main` from the repository root. `.nojekyll` disables Jekyll processing. All runtime URLs are relative, including manifest and icon URLs, so the `/Cosmic-Coop/` project path works. The manifest requests fullscreen landscape when launched from the home screen.

## Testing

```sh
npm test
```

The Playwright configuration uses an installed Microsoft Edge and the local server at port 4317. Tests cover WebGL / Canvas, controls, saving, pause, mobile layout, actual touch events, weapon families, boss phases, all campaign progression, and bounded pool sizes. `?debug` enables hitboxes and a test-only scene handle; `?renderer=canvas` forces the renderer fallback.

Automated accelerated campaign tests validate progression and lifecycle, not human difficulty balance. Physical Android/iOS device performance and an uninterrupted 80-wave human playthrough remain to be verified.

## Source layout

- `src/scenes/GameScene.js`: gameplay orchestration, enemies, boss behaviors and collisions.
- `src/systems/`: input, full-screen/orientation control, saves, audio, UI, pools, formations and weapons.
- `src/data/content.js`: campaign, formations, weapons and boss data.
- `src/art/atlas.js`: creates a shared transparent runtime atlas from original character art and procedural effects.
- `assets/`: original generated characters, supplied kit backgrounds/audio, and app icons.
- `docs/MASTER_PROMPT.md`: original build specification. The later requirement for full-screen landscape mobile play takes precedence over the original portrait default.

## Credits and licenses

Phaser 3 is MIT licensed; see `vendor/PHASER-LICENSE.md`. Character art was generated for this project. Backgrounds and synthesized audio came from the user-supplied Cosmic Coop Mobile Kit. Runtime effects are original canvas artwork. Food glyphs use the device emoji font. No copyrighted Chicken Invaders game art, code, logos or audio is used.
