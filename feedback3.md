### 4-person “fix this game or die trying” design jam (retro car-chase edition)

**Ava (Creative Director):** “Our north star is *retro chaos that still feels fair*. Every hit should feel like *I did that*, not *the sim sneezed*.”

**Rex (Systems/Progression):** “The current experience dumps everything on the player immediately. We need a **ramp**: start with **one** slow traffic car, then slowly add density, heavies, cops, heists. Also: **never die**, just **BUSTED → back in**.”

**Mina (Physics/Feel):** “Right now you’re fighting your own code: you’re overwriting velocities and positions every frame, which cancels out what Matter is trying to solve. We need a proper *arcade handling model* (traction + lateral damping) and collision logic that uses **impulse/relative speed** so pushes feel consistent.”

**Jo (Tech Lead/QA):** “We also have *structural bugs*: inconsistent road constants, barrier/world coordinate mismatch, and repeated `ctx.scale()` on resize causing compounded scaling. We need a physics+render coordinate contract, fixed timestep, and a test harness so this never regresses.”

---

## The new game spec (award-winning *and* sane)

### Design pillars (non‑negotiable)

1. **Fair Physics First:** collisions push cars sideways reliably; heavy cars feel heavy; no teleport/velocity overrides.
2. **Skillful Ramming:** front ram-bar = advantage; side/rear = danger; PIT + sideswipe are learnable techniques.
3. **Readable Difficulty Ramp:** start tiny (1–2 cars), build to chaos (10–16), introduce cops/heists gradually.
4. **No Death Spiral:** **BUSTED** resets heat + restores integrity, only costs a % of *run cash*.
5. **Juice with Clarity:** shake/slow‑mo/particles only when the player understands why.

---

## Physics + game-logic rethink (why it’s currently “buggy and not fun”)

### Biggest feel-killers in your current TS/Matter loop

* **You overwrite physics** every frame: `Body.setVelocity()` + `Body.setPosition()` (player y=0) means collisions don’t get to “win”, so pushing feels random/jittery.
* **Mass isn’t truly set**: Matter doesn’t reliably take `mass:` in body options the way you expect; use `Body.setMass()` or set `density`.
* **Barrier & render mismatch**: barriers are not drawn exactly where they exist in physics space (small offsets), so “invisible wall hits” happen.
* **Resize scaling bug**: `ctx.scale(dpr,dpr)` on resize without resetting transform compounds scale and breaks visuals/inputs over time.

### “Arcade Realism” handling model (simple, stable, feels great)

Use Matter for collisions, but **drive the car with forces**, not velocity teleporting.

**Per vehicle each fixed tick (60Hz):**

* Compute car’s **forward** and **right** vectors from `body.angle`
* Decompose velocity into:

  * `vForward = dot(v, forward)`
  * `vLateral = dot(v, right)`
* Apply:

  * **Engine force** along forward: `F = throttle * enginePower`
  * **Brake damping** on forward velocity
  * **Strong lateral damping** (traction): kill sideways sliding at a tuned rate
  * **Steer torque** proportional to speed (turning at 0 speed feels bad)

**Result:** cars feel planted, and when you ram them they still slide—just not like ice pucks.

### Collision feel rules (the “fair push” recipe)

* **Restitution low** (0–0.1): no pinball bounce.
* **Friction moderate** on contacts (Matter has friction + frictionStatic): enough to “grab” and push.
* **Cap angular velocity** (especially for player) so spins happen only on meaningful hits.
* Use **impulse-ish scoring**: compute relative speed along collision normal; use that for:

  * damage
  * screen shake
  * “PIT!” detection (rear corner hit)

### “Ram bar” fairness (player fantasy)

* If player hits with **front 60° cone**, player takes ~0 damage (or heavily reduced).
* If player gets hit on **side/rear**, damage scales with impact.
* This makes your “weapon” consistent and learnable.

---

## Progression: start with 1 car → slow addictive ramp

**Run progression variable:** `HEAT` (0 → 1 over ~3–5 minutes, plus spikes after heists)

At each heat band:

* **0.0–0.2:** 1–3 civilian cars, slow, wide gaps (tutorial without a tutorial)
* **0.2–0.4:** 4–6 cars, add a truck occasionally (heavy lesson)
* **0.4–0.6:** 7–10 cars, introduce wanted ⭐1 (one cop type)
* **0.6–0.8:** 10–14 cars, ⭐2–⭐3 behaviors + spike strips (rare)
* **0.8–1.0:** 14–18 cars, heist convoy + ⭐4–⭐5 chaos

**Fair spawn rule:** never spawn a car such that *all lanes are blocked* inside the player’s reaction window.

---

# ✅ “Ultimate” JIRA plan to get this to launch

## Release Milestones (so you don’t boil the ocean)

* **M0 – Vertical Slice:** driving feels good + pushing works + fair spawns
* **M1 – Alpha:** heist + wanted + busted loop + basic juice
* **M2 – Beta:** balancing, performance, mobile controls, tests, polish
* **M3 – RC/Launch:** bug burn-down, menu/settings, build + docs

---

## EPIC 1 — Physics Feel Overhaul (Matter.js used correctly)

**Goal:** pushing cars sideways is consistent; no jitter; player control feels “arcade-real”.

**FFF-1** (P0) **Stop overwriting physics each frame**

* Replace player `setPosition(y=0)` approach with **camera-follow** (player actually moves in world Y).
* Replace `setVelocity` driving with `applyForce` + traction damping.
* **AC:** Player can ram traffic and both bodies respond naturally (no snapping back next frame).

**FFF-2** (P0) **Implement traction-based top-down car handling**

* Add per-tick velocity decomposition and lateral damping.
* Add steer torque based on speed.
* **AC:** At speed, car corners smoothly; after rams, car recovers without endless spin.

**FFF-3** (P0) **Correct mass/inertia setup**

* Use `Body.setMass()` (or density) per vehicle type.
* Set inertia intentionally (heavies resist spin).
* **AC:** Truck/geldtransporter are meaningfully harder to shove than sedans.

**FFF-4** (P0) **Engine fixed timestep + stable solver settings**

* Use fixed 60Hz physics step; tune engine iterations.
* **AC:** Similar collisions produce similar outcomes across machines.

**FFF-5** (P1) **Clamp extreme angular velocity + add yaw damping**

* **AC:** No “helicopter spins” unless hit extremely hard.

**FFF-6** (P1) **Contact material tuning pass**

* Restitution down; friction tuned.
* **AC:** Hits feel like *push/crunch*, not *bounce*.

---

## EPIC 2 — Collision, Damage, and “Ram Bar” Rules

**Goal:** collisions are readable, skill-based, and fair.

**FFF-20** (P0) **Compute impact severity from relative velocity along collision normal**

* **AC:** damage/shake scale with “real” hit strength, not random frame artifacts.

**FFF-21** (P0) **Ram Bar: player front-hit protection**

* Determine hit direction (front/side/rear) using player forward vector + contact point.
* **AC:** Head-on rams don’t punish the player; side/rear do.

**FFF-22** (P0) **PIT detection + bonus**

* Rear-corner hit on target at sufficient speed → spin assist + score popup.
* **AC:** PIT is repeatable and learnable.

**FFF-23** (P1) **Barrier damage cooldown + impulse threshold**

* Prevent barrier “melting” integrity from continuous contact.
* **AC:** Scraping hurts but doesn’t delete you instantly.

**FFF-24** (P1) **Wrecked cars become stable obstacles**

* Convert wrecked vehicle to higher friction / lower mobility (or set asleep).
* **AC:** wrecks don’t jitter-slide forever.

---

## EPIC 3 — World Coordinates, Camera, and Road Contract

**Goal:** physics space == render space; no phantom collisions.

**FFF-40** (P0) **Single source of truth for road constants**

* Kill duplicates (`ROAD_WIDTH` appears as 300, 320 in different places).
* **AC:** All modules read the same constants.

**FFF-41** (P0) **Align barrier bodies to rendered barrier lines**

* Same x positions, widths, offsets.
* **AC:** what you see is what you collide with.

**FFF-42** (P0) **Fix canvas resize scaling**

* Replace repeated `ctx.scale()` with `ctx.setTransform(dpr,0,0,dpr,0,0)` on resize.
* **AC:** resizing does not distort visuals or collision feel.

**FFF-43** (P1) **Camera follow + world spawn system**

* Spawn ahead in world Y; despawn behind; render via camera transform.
* **AC:** No hacks like “player fixed at y=0”; fewer bugs.

---

## EPIC 4 — Fair Spawning + Difficulty Ramp (“1 car → chaos”)

**Goal:** the game starts chill and ramps without cheap deaths.

**FFF-60** (P0) **Heat-based difficulty controller**

* Heat drives: spawn rate, speed variance, heavy vehicle chance, cop chance.
* **AC:** first 30 seconds are calm; 2–3 minutes becomes intense.

**FFF-61** (P0) **Fair spawn algorithm (keep at least one lane open)**

* Enforce minimum time-to-collision and lane availability.
* **AC:** no unavoidable spawns.

**FFF-62** (P1) **Traffic archetypes**

* Slow sedan, drifty sports, heavy truck with different behavior + mass.
* **AC:** players can “read” car behavior.

**FFF-63** (P1) **Spawn “micro-setpieces”**

* Small clusters and gaps to create rhythm.
* **AC:** gameplay has peaks/valleys, not flat spam.

---

## EPIC 5 — AI that supports fun (traffic + cops)

**Goal:** opponents create setups for rams, not random chaos.

**FFF-80** (P1) **Traffic lane-keeping + avoidance**

* Light steering toward lane center, avoid immediate pileups.
* **AC:** traffic feels alive but predictable enough to plan.

**FFF-81** (P1) **Cop behavior by wanted level**

* ⭐1: slow blocker
* ⭐2: sideswipe attempts
* ⭐3: PIT attempts
* ⭐4: boxing
* ⭐5: roadblocks/SWAT heavies
* **AC:** each star feels distinct.

**FFF-82** (P2) **Police spawn fairness**

* Never spawn a cop “inside” the player’s hitbox window.
* **AC:** cops feel threatening, not cheap.

---

## EPIC 6 — Core Loop: Money, Wanted, Heists, BUSTED (no game over)

**Goal:** addictive loop with clear goals.

**FFF-100** (P0) **BUSTED flow**

* On 0 integrity: pause/flash, lose % of current cash, reset stars, respawn.
* **AC:** no “game over”, no softlock, no death spiral.

**FFF-101** (P1) **Wanted stars gain + decay rules**

* Gain on wrecks/heists; decay after clean time.
* **AC:** heat feels earned and escapable.

**FFF-102** (P1) **Geldtransporter heist event**

* Spawn convoy (front/rear escorts), truck takes 3 cracks, jackpot payout.
* **AC:** reliable “peak moment” every interval; big risk/reward.

**FFF-103** (P2) **Meta progression (free, no monetization)**

* Upgrades purchased with earned money: engine/armor/ram/tires.
* **AC:** long-term “one more run” motivation.

---

## EPIC 7 — Input + UX (mobile-first, still good on keyboard)

**Goal:** controls feel precise and modern.

**FFF-120** (P0) **Unified input abstraction**

* Support: drag steering (analog), swipe up boost, swipe down brake, plus keyboard.
* **AC:** mobile feels as good as desktop.

**FFF-121** (P1) **HUD clarity pass**

* Integrity + cash + stars + boost only if it supports decisions.
* **AC:** player always knows why they got hurt / rewarded.

**FFF-122** (P2) **Accessibility toggles**

* Reduce shake, reduce flashes, left-handed mode.
* **AC:** playable for more people.

---

## EPIC 8 — Juice + Feedback (but never hides fairness)

**Goal:** every hit feels crunchy and readable.

**FFF-140** (P1) **Impact VFX tied to impulse**

* Sparks/smoke/shake scaled by severity.
* **AC:** big hits look big; small taps look small.

**FFF-141** (P1) **Slow‑mo on “signature” moments**

* Big PIT / heist crack / cop takedown.
* **AC:** hype moments feel legendary.

**FFF-142** (P2) **Damage visuals on cars**

* Dents/scratches, then “wrecked” state.
* **AC:** the world tells a story of your rampage.

---

## EPIC 9 — Architecture cleanup + tests (so it stays fixed)

**Goal:** stop regressions and “mystery bugs”.

**FFF-160** (P0) **Decide: Matter.js OR custom physics for 1.0**

* Ship with one physics stack. Archive the other behind a flag if needed.
* **AC:** no duplicated physics logic paths.

**FFF-161** (P0) **Fix resize transform in *all* render contexts**

* `src/engine/render/canvas.ts` and any other canvas setup.
* **AC:** resize never breaks input/render scaling.

**FFF-162** (P1) **Add deterministic seeded RNG option**

* Enables reproducible bug reports.
* **AC:** same seed = same spawns.

**FFF-163** (P1) **Add unit tests for fairness-critical logic**

* Spawn fairness, damage direction, wanted decay, busted cash loss.
* **AC:** CI blocks regressions.

**FFF-164** (P2) **Performance budget + pooling**

* Pool particles/vehicles; avoid GC spikes on mobile.
* **AC:** stable FPS on mid phones.

---

# Launch Definition of Done (clear and brutal)

* **P0 tickets all closed**
* No phantom collisions (render/physics aligned)
* Player can **consistently** sideswipe traffic into barriers
* Difficulty ramps from 1 car → chaos without unavoidable deaths
* BUSTED loop works forever (no softlocks, no negative cash bugs)
* Mobile controls feel intentional (not “ported”)
* Tests cover spawn fairness + damage rules

---

If you want, paste the output of `npm run dev` behavior bugs you’re seeing (3–5 bullet points like “cars jitter after hit”, “barrier hits don’t match visuals”, etc.) and I’ll map each symptom to the exact tickets above (and mark which files/lines are the first strike targets).
