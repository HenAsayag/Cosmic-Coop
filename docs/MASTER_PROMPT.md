# MASTER PROMPT — COSMIC COOP: FEATHERFALL
## Original WebGL + Mobile arcade shooter inspired by the rhythm of classic chicken-themed space shooters

You are a senior WebGL game engineer, Phaser 3 specialist, gameplay designer, technical artist, UI/UX designer, VFX artist, animator, audio designer, mobile-performance engineer and QA lead.

Build a COMPLETE, POLISHED, PLAYABLE browser arcade shooter called **Cosmic Coop: Featherfall**.

The intended feel is the fast, funny, highly readable top-down arcade rhythm associated with classic chicken-themed space shooters: large enemy formations, constant movement, falling hazards, escalating waves, weapon upgrades, collectible food, bosses, feathers, explosions and instant feedback.

## COPYRIGHT / ORIGINALITY REQUIREMENT
Do NOT reproduce or extract copyrighted Chicken Invaders assets, logos, exact characters, exact UI, exact level layouts, exact sounds, exact music, exact names or exact sprites. The provided art is an original visual-direction pack and must be treated as the project's own style reference. The final result should feel familiar in arcade rhythm while being visually and mechanically distinct.

---

# 1. HARD TECHNICAL REQUIREMENTS

## Engine
- Phaser 3.
- WebGL is the PRIMARY renderer.
- Configure Phaser with `Phaser.WEBGL` where available.
- Gracefully fall back to Canvas only if WebGL is unavailable.
- No Unity, no Unreal, no server-side runtime.
- Static deployment compatible with GitHub Pages, Netlify and Vercel static hosting.
- JavaScript ES modules preferred.
- No build step required unless absolutely necessary.

## Rendering
- Target 60 FPS.
- Delta-time based movement.
- Use sprite batching and texture atlases.
- Use object pools for enemies, bullets, particles, food and pickups.
- Avoid per-frame object allocation.
- Avoid DOM creation during gameplay.
- Cap nonessential particles dynamically on slower devices.
- Prefer additive blend for energy effects only where useful.
- Keep alpha overdraw under control on mobile.

## Resolution / scaling
Use a logical gameplay resolution of approximately **1080 x 1920 portrait** and support responsive scaling to landscape and desktop.

Phaser Scale Manager:
- mode: FIT
- autoCenter: CENTER_BOTH
- parent container fills viewport
- respect safe areas
- keep gameplay readable from 360x640 through 1920x1080

Support at minimum:
- 360x640
- 375x667
- 390x844
- 393x852
- 412x915
- 430x932
- 768x1024
- 1366x768
- 1920x1080

Do NOT assume desktop landscape.

---

# 2. MOBILE IS A FIRST-CLASS PLATFORM

The game must be designed for touch from the beginning.

## Touch movement
Default mobile control:
- touch and drag anywhere in the lower 75% of the gameplay surface
- ship follows the finger with a configurable vertical offset of 70–110 px so the finger never covers the ship
- smooth but responsive interpolation
- no joystick required by default
- pointer can leave and re-enter without breaking controls
- multi-touch must not accidentally move the ship when pressing special weapon / pause buttons

## Firing
- Auto-fire ON by default on mobile.
- Allow Auto-fire OFF in settings.
- Desktop: mouse / Space / pointer fire.

## Mobile buttons
Bottom-right:
- large circular Nova Bomb button
- minimum 64 CSS px touch target
- visual pressed state
- disabled state when count = 0

Top-right:
- Pause

Optional bottom-left:
- precision-mode button if testing proves useful

## Mobile browser behavior
- prevent accidental page scrolling during gameplay
- use `touch-action: none` on game container
- prevent pull-to-refresh interactions inside gameplay when possible
- handle `visibilitychange`
- automatically pause when browser/app loses focus
- resume only after player confirmation
- account for iOS safe-area insets with `env(safe-area-inset-*)`
- use landscape and portrait layouts intelligently
- hide nonessential HUD elements if viewport is extremely small

## Haptics
If supported:
- light vibration on player damage
- tiny vibration on power-up
- stronger short vibration on Nova Bomb / boss defeat
Provide toggle in Settings.
Never require vibration support.

---

# 3. GAME FLOW

Main Menu
→ Start
→ warp transition
→ System intro
→ Wave intro
→ enemy entrance
→ combat
→ wave clear
→ next wave
→ boss every 10th wave
→ system completion
→ next system
→ campaign completion
→ unlock Endless Mode

Campaign:
- 8 star systems
- 10 waves each
- 80 waves total
- Wave 10/20/30/.../80 = boss

Avoid long dead time. Typical time from last enemy death to next formation appearing: 0.7–1.5 sec.

---

# 4. PLAYER SHIP

Ship is mainly positioned in lower screen region but may move through most of the playfield.

Movement feel:
- immediate
- precise
- slightly eased
- never slippery
- never floaty

Visual reactions:
- bank left/right up to about ±10°
- engine glow scales with speed
- subtle squash/stretch on sharp direction change
- weapon recoil
- muzzle flash
- engine particles
- small shadow/glow beneath ship

Desktop controls:
- mouse movement
- WASD / arrows
- Space / left click fire
- Shift precision
- X / right click Nova Bomb
- ESC pause

---

# 5. LIVES / DAMAGE

Player begins with 3 lives.

On hit:
1. lock controls briefly
2. white impact flash
3. ship breaks into 8–15 debris particles
4. radial shockwave
5. camera shake
6. music ducks briefly
7. 1.0–1.2 sec dramatic pause
8. respawn
9. 2 sec invulnerability
10. blinking visual indication

Losing a life reduces current weapon power by a configurable amount, default 2 levels.

No gore.

---

# 6. ENEMIES

Create at least 9 ORIGINAL enemy archetypes:

1. Scout Chick — 1 HP, fast flap, simple movement
2. Trooper Hen — 2 HP, drops egg shots
3. Armored Rooster — 4 HP, armor cracks visually
4. Bomber Bird — 3 HP, cluster egg drops
5. Dive Hen — 2 HP, breaks formation and dives
6. Shield Bird — 5 HP, temporary energy shield
7. Rocket Rooster — 4 HP, slow rockets
8. Spinner Chick — 3 HP, radial projectile pattern
9. Elite Commander — 8 HP, mini-boss behavior

Every archetype must have an unmistakable silhouette.

Hit response:
- 50–80 ms white flash
- small recoil
- 1–3 sparks
- hit SFX

Death:
- feathers
- smoke puff
- score popup
- small scale pop
- optional food/pickup drop

---

# 7. ENEMY ENTRANCES — CRITICAL

Enemies must NEVER simply appear in formation.

Entrance patterns include:
- center spiral
- snake from left
- snake from right
- figure eight
- V formation
- circular orbit
- diagonal sweep
- crossing streams
- corkscrew
- vertical dive
- horizontal parade
- rotating ring
- expanding flower
- collapsing circle
- sine chain
- screen-edge ambush
- multi-corner flock

Typical entrance duration: 0.8–2.5 sec.

Use easing:
- sine
- cubic
- back easing for comic bounce

On arrival:
- slight overshoot
- settle bounce
- synchronized flap emphasis

---

# 8. FORMATION SYSTEM

Build a reusable data-driven FormationManager.

At least 24 templates:
GRID, V, INVERTED_V, RING, DOUBLE_RING, SPIRAL, SNAKE, DOUBLE_SNAKE, HEART, DIAMOND, CROSS, WINGS, WAVE, ZIGZAG, COLUMN_SWEEP, TUNNEL, FLOWER, ARROW, HOURGLASS, ORBIT, CLUSTERS, MOVING_ROWS, PINWHEEL, CHAOS_SWARM.

Each template supports parameters:
- anchor X/Y
- spacing
- global scale
- oscillation
- formation speed
- formation rotation
- descent speed
- individual attack probability
- fire probability
- phase offset
- entrance type

Some formations:
- stay fixed
- oscillate
- rotate
- descend
- deform/rearrange
- split into subgroups

No wave should be unwinnable due to off-screen enemies.

---

# 9. ENEMY PROJECTILES

Types:
- normal egg
- fast energy egg
- clustered egg burst
- aimed energy shot
- slow rocket
- radial orb

Normal egg:
- glossy cartoon object
- slight spin
- subtle acceleration
- small motion streak
- bottom-edge splat when missed

All attacks must be readable against background.

Boss and elite attacks require telegraphing before danger becomes active.

---

# 10. WEAPONS

Create 7 original player weapons, each with **12 visible power levels**.

1. Pulse Blaster — blue, balanced
2. Forked Plasma — green, spread
3. Solar Beam — yellow beam, precise, heat-heavy
4. Arc Spark — cyan electric chain
5. Nova Pellets — orange rapid fire
6. Photon Fan — purple wide fan
7. Comet Cannon — slow heavy cyan projectile, splash

Power levels must change visual behavior, not only damage.
Examples:
- projectile count
- spread
- projectile size
- firing rhythm
- trail intensity
- impact VFX
- secondary bolts
- chain count

Level 12 should feel spectacular but remain readable.

---

# 11. HEAT / OVERHEAT

Continuous firing raises weapon heat.
Not firing cools it.

0–69% normal
70–89% warning
90–99% red/pulsing
100% weapon lock for about 1 sec

At high heat:
- muzzle shifts warmer
- warning tick sound
- heat bar pulses

At 100%:
- smoke / steam burst
- short error sound
- HUD flash

Balance for rhythm, not punishment.

---

# 12. PICKUPS

A. ENERGY CORE — weapon power +1
B. WEAPON CRATE — change weapon family
C. SHIELD — absorbs one hit
D. MAGNET — attracts pickups for 10 sec
E. RAPID COOLING — lower heat generation for 15 sec
F. DOUBLE SCORE — x2 for 15 sec

Pickup presentation:
- slow rotation
- sine float
- glow pulse
- trail particles
- magnet acceleration when close
- burst on collect
- HUD pulse
- unique SFX

---

# 13. FOOD SYSTEM

Food drops:
- drumstick
- fries
- taco
- donut
- burger
- pizza
- cookie

Score: +50 to +250 depending on item.

HUD shows `FOOD 23 / 50`.
At 50:
- counter resets
- +1 Nova Bomb
- celebratory SFX
- HUD burst
- text `+1 NOVA BOMB`

---

# 14. NOVA BOMB

Activation:
- brief invulnerability
- gameplay background darkens ~20%
- radial flash
- large expanding shockwave
- clears normal hostile projectiles
- massive damage to normal enemies
- capped damage to bosses
- strong short shake
- powerful SFX

Duration around 700 ms.
Must feel like a premium arcade special, not a simple circle sprite.

---

# 15. BOSSES

Create 8 ORIGINAL bosses:
1. Mega Rooster
2. Egg Fortress
3. Chef Commander
4. The Hatchery
5. Twin Turbo Hens
6. Feather Reactor
7. Royal Rooster
8. Mother Coop

Every boss:
- unique silhouette
- 2–4 phases
- unique attacks
- clear telegraphs
- animated components
- localized hit effects
- damage states
- health bar

Boss intro:
- combat music fades
- warning siren
- WARNING banner
- camera rumble
- slow entrance
- name card
- health bar animates in

Phase change:
- short invulnerability
- flash
- particles/debris
- animation change
- new music layer or intensity increase
- new attack logic

Final boss death:
3–5 sec staged destruction with escalating explosions, shockwaves, debris, flash and a short slow-motion beat.

---

# 16. DIFFICULTY CURVE

System 1: tutorial feel, simple formations
System 2: moving formations
System 3: dive attacks
System 4: mixed projectile types
System 5: faster formations
System 6: denser patterns
System 7: elite combinations
System 8: high intensity / mastery

Do NOT scale difficulty mainly by HP.
Scale:
- movement complexity
- projectile speed
- firing timing
- multi-pattern combinations
- formation transformations

---

# 17. SCORE / COMBO

Example score:
Scout 100
Trooper 150
Armored 250
Elite 500+

Combo window: around 1.5 sec.
Multipliers: x2, x3, x4, x5.

Combo feedback:
- floating text
- increasing sound pitch
- HUD pulse
- stronger particle accent at high combo

Wave bonuses:
- PERFECT WAVE
- NO HIT
- SHARPSHOOTER
- FAST CLEAR
- FOOD MASTER
- NO OVERHEAT

---

# 18. VISUAL DIRECTION

Use files inside `03_Assets/` as art direction.

Look:
- whimsical 3D-rendered cartoon feel
- premium arcade energy
- glossy highlights
- soft rim light
- exaggerated expressions
- dimensional rather than flat
- strong silhouettes
- high contrast against deep space
- bright weapon color coding

Do NOT use pixel art.
Do NOT use flat placeholder rectangles in final presentation.

If reference sheets are used during production, extract/recreate runtime sprites with transparent backgrounds and atlas them properly before shipping.

---

# 19. ANIMATION — CRITICAL

Birds:
- idle bob ±3 px
- wing flap
- secondary head motion
- occasional blink
- squash/stretch on entry
- hit recoil
- death pop + feathers

Player:
- continuous engine animation
- bank on horizontal movement
- muzzle recoil
- muzzle flash
- respawn blink
- shield shimmer

Pickups:
- rotation
- sine float
- pulsing emissive glow
- trail particles

Bosses:
- multi-part movement
- eye / face animation
- mechanical moving pieces
- phase-specific animation
- damage-state overlays

Animation may use spritesheets, skeletal-style part composition, tweens or shader-assisted effects.

---

# 20. VFX / PARTICLES

Build pooled VFX systems for:
- feathers
- sparks
- smoke
- plasma trails
- laser impacts
- egg splats
- pickup sparkles
- engine exhaust
- explosion debris
- shockwaves
- star streaks
- boss destruction

Mobile optimization:
- quality tiers HIGH / MEDIUM / LOW
- auto-detect approximate performance after initial gameplay
- reduce particles before reducing gameplay objects

---

# 21. HIT FEEDBACK / JUICE

Normal hit:
- brief flash
- 1–2 sparks
- tiny recoil
- SFX

Kill:
- feather burst
- smoke puff
- score popup

Elite:
- stronger recoil
- more particles
- distinct sound

Boss:
- localized flash at hit point
- sparks
- occasional debris
- health bar tick

Shake guidelines:
- normal kill: none/tiny
- elite: 1–2 px
- boss attack: 3–5 px
- Nova Bomb: 6–8 px
- boss death: 8–12 px

Do not constantly shake the camera.

---

# 22. BACKGROUNDS / PARALLAX

Use procedural/parallax space layers rather than one flat image.

Layers:
1. far starfield
2. medium stars
3. bright close stars
4. nebula haze
5. planet / moon
6. optional asteroid silhouettes

All drift downward at different speeds.
Occasional shooting star.

System themes:
1. blue-purple nebula
2. red planet
3. asteroid belt
4. turquoise gas cloud
5. orange sun
6. ice world
7. dark violet void
8. alien megastructure

Use generated background textures from `03_Assets/backgrounds/` as base layers and add real-time WebGL particles/parallax over them.

---

# 23. AUDIO

AudioManager with independent:
- Music
- SFX
- Master
- Mute

Persist to localStorage.

Required SFX:
- each weapon family
- weapon upgrade
- crate pickup
- food pickup
- enemy hit
- enemy death
- egg launch
- egg splat
- player explosion
- overheat
- menu click
- wave complete
- boss warning
- boss explosion
- Nova Bomb

Use only original/royalty-free audio.
Add slight pitch variance to repeated SFX.

The starter audio inside `03_Assets/audio/` may be used or replaced with higher-quality original equivalents.

---

# 24. HUD

Top-left:
- Score
- combo when active

Top-center:
- Wave X / 80
- boss health during boss

Top-right:
- Lives
- pause button on touch devices

Bottom-left:
- weapon icon
- Power Level
- heat bar

Bottom-center:
- Food x / 50

Bottom-right:
- Nova Bomb count / button

Requirements:
- readable on 360 px wide phones
- safe-area aware
- animated value changes
- no giant persistent panels
- no HUD overlap with player ship on portrait phones

---

# 25. MENU / SCREENS

Main Menu:
COSMIC COOP
FEATHERFALL

Buttons:
- PLAY
- ENDLESS
- HOW TO PLAY
- SETTINGS
- CREDITS

Animated backdrop:
- parallax stars
- occasional enemy flyby
- occasional player ship flyby

Screens:
- Main Menu
- Mode Select
- Settings
- How to Play
- Pause
- Game Over
- Campaign Complete
- Credits

All screens require animated transitions.

---

# 26. TRANSITIONS

No ugly hard cuts.

Use:
- fades
- star streak warp
- speed-line acceleration
- zoom
- flash

Wave transition: 0.7–1.3 sec
System transition: around 2–3 sec

---

# 27. LOCAL SAVE

Use localStorage for:
- high score
- unlocked systems
- endless unlocked
- settings
- selected cosmetic skin if present
- achievements
- quality setting
- mobile auto-fire preference

Version save data to allow migration.

---

# 28. PAUSE / FOCUS

Pause must freeze:
- enemy AI
- physics/game timers
- projectiles
- particles
- boss timers

Menu:
- RESUME
- RESTART
- SETTINGS
- QUIT

Browser focus loss / visibility change must auto-pause.

---

# 29. GAME OVER

Sequence:
- short time slow
- explosion
- music fade
- GAME OVER panel

Stats:
- score
- best score
- waves survived
- enemies destroyed
- accuracy
- food collected
- highest combo

Buttons:
- TRY AGAIN
- MAIN MENU

---

# 30. ASSET PIPELINE

Organize runtime content:

assets/
  player/
  enemies/
  bosses/
  weapons/
  pickups/
  vfx/
  ui/
  backgrounds/
  audio/sfx/
  audio/music/

Preferred image formats:
- WebP for backgrounds / large opaque art
- PNG/WebP lossless with alpha for sprites

Atlas small sprites to reduce texture binds.

Do not ship reference sheet backgrounds as collision masks.
Trim transparent bounds while preserving consistent pivots.

Recommended pivots:
- player: center
- birds: center
- projectile: center
- boss parts: documented per part

---

# 31. COLLISION

Use smaller forgiving hitboxes than visible artwork.

Player hitbox:
about 35–55% of visible ship body depending on art.

Enemy hitbox:
roughly body area excluding wings where visually appropriate.

Projectile collision:
avoid inflated transparent padding.

Debug mode:
add optional hitbox overlay accessible by query parameter or dev flag.

---

# 32. PERFORMANCE BUDGET

The game should tolerate approximately:
- 200 enemies
- 300 active projectiles
- 500 visual particles on desktop high quality

On mobile medium/low quality:
- dynamically limit cosmetic particles
- reduce additive effects
- reduce nebula layer resolution
- never lower input responsiveness

Use texture reuse and pools.
Destroy scene-level listeners correctly.
No memory growth across 20+ waves.

---

# 33. ACCESSIBILITY / UX

Include:
- separate music/SFX sliders
- screen shake intensity: full / reduced / off
- haptics toggle
- auto-fire toggle
- high-contrast projectile option
- reduced flashes option
- pause on focus loss

Do not make accessibility toggles affect core score fairness unless explicitly documented.

---

# 34. REQUIRED PROJECT STRUCTURE

Create something close to:

/
  index.html
  styles.css
  assets/
  src/
    main.js
    config.js
    scenes/
      BootScene.js
      PreloadScene.js
      MainMenuScene.js
      GameScene.js
      UIScene.js
      PauseScene.js
      GameOverScene.js
    entities/
      Player.js
      Enemy.js
      Boss.js
    systems/
      FormationManager.js
      WeaponSystem.js
      ProjectilePool.js
      PickupSystem.js
      ParticleManager.js
      AudioManager.js
      SaveManager.js
      MobileInput.js
      DifficultyManager.js
    data/
      waves.js
      formations.js
      weapons.js
      bosses.js
      balance.js

Do not put the entire game in one giant JS file.

---

# 35. REQUIRED QA

Before completion verify:
- zero console errors on launch
- WebGL active on capable browser
- Canvas fallback does not crash
- desktop controls work
- touch drag works
- auto-fire works
- Nova Bomb button works
- pointer multi-touch conflicts are handled
- safe-area layout works
- each formation can finish
- no enemy stays unreachable off-screen
- all bosses can be defeated
- pickups work
- heat works
- death / respawn works
- invulnerability works
- pause works
- focus-loss pause works
- Game Over works
- restart works
- localStorage works
- audio toggles persist
- no control hidden by mobile browser UI
- portrait gameplay works
- landscape gameplay works
- no memory leak after 20+ waves
- smooth play on representative mid-range mobile hardware

---

# 36. FINAL POLISH PASS — MANDATORY

Do not stop after mechanics work.
Perform a full polish pass:
- improve animation timing
- improve enemy entrances
- tune difficulty
- improve weapon feel
- improve boss telegraphs
- add missing particles
- improve explosion layering
- improve UI animation
- remove dead time
- make pickups exciting
- tune hitstop and shake
- optimize mobile particle load
- verify touch target sizes
- verify all portrait safe areas
- verify 60 FPS behavior

The final product must feel like a polished commercial arcade game rather than a technical prototype.

Start by building a complete polished vertical slice with:
- player
- 3 enemy types
- 3 formations
- 2 weapons
- food
- power-up
- one boss
- full mobile input
- WebGL VFX
- menu
- audio

Once the vertical slice is stable, expand the same architecture to all 80 waves and all content above.

Do not leave TODO placeholders in the final delivery.
