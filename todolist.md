# Feedback Alignment Todo

## Golden Goal
Retro chaos that still feels fair: collisions are readable and push cars sideways, skillful ramming matters, difficulty ramps from 1 car to chaos, and runs never end (BUSTED loop).

## Current Status Snapshot
- Main loop in `src/main.ts` uses force-based drive + traction with fixed timestep and energy-based damage.
- Modular game path exists in `src/game/Game.ts` but still uses velocity overrides and hit-count damage.
- Two physics stacks exist (`src/engine/physics` custom vs Matter wrappers in `src/game/physics.ts`).
- Road constants are unified via `src/game/config/constants.ts`.
- Canvas resize uses `setTransform` in `src/engine/render/canvas.ts`.
- Deterministic RNG is wired with `?seed=...`; tests exist for RNG.
- Basic RNG test added in `tests/utils/random.test.ts`; fairness tests still pending.

## Plan (Feedback-Driven)
### Phase 0 - Alignment and Infrastructure
- [x] Decide and document the single physics stack (Matter or custom).
- [x] Fix tooling and constants: `npm run check` script, unify road constants, fix canvas resize transform.
- [x] Introduce deterministic RNG hook for reproducible spawns.

### Phase 1 - Physics Feel (Golden Goal Core)
- [x] Replace velocity overrides with a force-based arcade traction model (main loop).
- [x] Correct mass setup via `Body.setMass` or density; add chamfer to car bodies.
- [x] Implement fixed timestep, solver settings, and angular velocity clamp (main loop).
- [ ] Port traction + fixed timestep into `src/game/Game.ts` if switching to the modular path.

### Phase 2 - Fairness and Progression
- [x] Energy-based damage + ram-bar direction logic (main loop).
- [x] Heat-based spawn ramp + fair spawn rule (keep at least one lane open early).
- [x] BUSTED loop with cash penalty, star reset, and respawn.

### Phase 3 - UX, Tests, and Validation
- [x] HUD telegraphs for police/heists (basic alerts).
- [ ] Add Vitest regression tests for spawn fairness and impact severity.
- [x] MCP test pass: run `npm run dev`, validate ramming feel, ramp, busted flow, and resize behavior.

## MCP Feedback Round 1 (Current Build)
- Stable boot; cars spawn and render; demo/manual toggle works.
- Player stays on-road via hard clamp; needs softer boundary or barrier-based collisions.
- Forward speed still aggressive; tune drive forces for smoother pacing.
- Difficulty ramp and energy-based damage not implemented yet.

## Next Fixes (Round 5)
- [ ] Improve HUD clarity at higher heat (alerts, heat indicator, collision cue).
- [ ] Port traction + fixed timestep into `src/game/Game.ts` if switching to the modular path.
- [ ] Add Vitest regression tests for spawn fairness and impact severity.

## MCP Feedback Round 2 (Post Energy Damage)
- Wrecked vehicles appear; collisions now trigger slow-mo and damage tiers.
- Player forward speed feels slow; tune drive force for readable progression.
- Hard clamp still in use to keep player on-road.

## MCP Feedback Round 3 (Heat Ramp + Soft Bounds)
- Early phase stays calm (1 car); heat rises more gradually and stars ramp later.
- Soft boundary keeps player in-bounds without hard snapping; barrier scrapes are less punishing.
- Demo collisions still raise heat quickly when ramming; further tuning may be needed.

## MCP Feedback Round 4 (Seeded Ramp + Alerts)
- Early phase: 1 car for ~30s with low heat and no stars.
- Heat at ~50s sits around 0.35 with 4–5 cars; stars remain low.
- Police/heist alerts display on spawn; ramp feels more readable.

## MCP Feedback Round 5 (Seeded Repro Pass)
- `?seed=1234` reproduces a calm early phase and predictable ramp.
- At ~60s: heat ~0.46, stars 2, traffic ~6; alerts fire for police spawns.
- Integrity can still drop quickly under repeated collisions; tuning still needed.
