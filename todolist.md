# Feedback Alignment Todo

## Golden Goal
Retro chaos that still feels fair: collisions are readable and push cars sideways, skillful ramming matters, difficulty ramps from 1 car to chaos, and runs never end (BUSTED loop).

## Current Status Snapshot
- Prototype still lives in `src/main.ts` with direct `setVelocity`/`setPosition` and manual impulses.
- Modular game path exists in `src/game/Game.ts` but still uses velocity overrides and hit-count damage.
- Two physics stacks exist (`src/engine/physics` custom vs Matter wrappers in `src/game/physics.ts`).
- Road constants are duplicated (`src/game/road.ts` vs `src/game/config/constants.ts`).
- Canvas resize uses `ctx.scale` in `src/engine/render/canvas.ts`.
- `tests/` is empty; `npm run check` has a script typo.

## Plan (Feedback-Driven)
### Phase 0 - Alignment and Infrastructure
- [x] Decide and document the single physics stack (Matter or custom).
- [x] Fix tooling and constants: `npm run check` script, unify road constants, fix canvas resize transform.
- [ ] Introduce deterministic RNG hook for reproducible spawns.

### Phase 1 - Physics Feel (Golden Goal Core)
- [x] Replace velocity overrides with a force-based arcade traction model (main loop).
- [x] Correct mass setup via `Body.setMass` or density; add chamfer to car bodies.
- [x] Implement fixed timestep, solver settings, and angular velocity clamp (main loop).
- [ ] Port traction + fixed timestep into `src/game/Game.ts` if switching to the modular path.

### Phase 2 - Fairness and Progression
- [x] Energy-based damage + ram-bar direction logic (main loop).
- [ ] Heat-based spawn ramp + fair spawn rule (keep at least one lane open early).
- [ ] BUSTED loop with cash penalty, star reset, and respawn.

### Phase 3 - UX, Tests, and Validation
- [ ] HUD clarity pass and telegraphs for police/heists.
- [ ] Add Vitest regression tests for spawn fairness and impact severity.
- [x] MCP test pass: run `npm run dev`, validate ramming feel, ramp, busted flow, and resize behavior.

## MCP Feedback Round 1 (Current Build)
- Stable boot; cars spawn and render; demo/manual toggle works.
- Player stays on-road via hard clamp; needs softer boundary or barrier-based collisions.
- Forward speed still aggressive; tune drive forces for smoother pacing.
- Difficulty ramp and energy-based damage not implemented yet.

## Next Fixes (Round 3)
- [ ] Replace hard clamp with soft boundary + reliable barrier collisions.
- [ ] Tune drive force + target speed for smoother forward pacing.
- [ ] Add heat-based spawn ramp + fair spawn rule (keep at least one lane open early).

## MCP Feedback Round 2 (Post Energy Damage)
- Wrecked vehicles appear; collisions now trigger slow-mo and damage tiers.
- Player forward speed feels slow; tune drive force for readable progression.
- Hard clamp still in use to keep player on-road.
