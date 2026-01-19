# JIRA Tickets

## Personas
- P1: Casual mobile player, short sessions, touch-first, wants instant understanding
- P2: Desktop arcade fan, uses keyboard, expects full control clarity
- P3: Challenge seeker/streamer, wants readable feedback and pacing

## Tickets

### TCK-001: Add touch boost gesture or on-screen boost button
- Epic: EPIC-001
- Type: UX
- Severity: S2
- Priority: P1
- Persona: P1
- Scenario: mobile player wants to use boost during a run
- Steps:
  1. Open the game on a touch device.
  2. Swipe to steer and accelerate.
  3. Look for a way to boost.
- Expected: boost is accessible via gesture or on-screen control
- Actual: boost requires Space key; no touch affordance
- IS: touch input supports steer/accel/brake but not boost
- SHOULD: provide a touch boost gesture (double-tap or two-finger tap) or a small on-screen boost button
- Reasoning: a core mechanic is unavailable on touch, lowering fun and fairness
- Code hints: `src/main.ts` input handling; `render` HUD overlay for a boost button
- Acceptance criteria:
  - Touch players can trigger boost without a keyboard
  - A short hint or icon communicates the boost control

### TCK-002: Add pause/resume affordance for touch
- Epic: EPIC-001
- Type: UX
- Severity: S3
- Priority: P2
- Persona: P1
- Scenario: player needs to pause mid-run on mobile
- Steps:
  1. Start a run on mobile.
  2. Try to pause or stop the action.
- Expected: a visible pause control and resume flow
- Actual: no pause UI; run continues
- IS: no pause state or control is exposed
- SHOULD: add a small pause button and a clear resume action
- Reasoning: mobile interruptions are common; lack of pause feels punishing
- Code hints: `src/main.ts` input handling, `update` loop gating, HUD render
- Acceptance criteria:
  - Pause stops gameplay updates and input
  - Resume returns to play without losing state

### TCK-003: Make HUD scale/stack for small screens
- Epic: EPIC-002
- Type: UX
- Severity: S2
- Priority: P2
- Persona: P1
- Scenario: player uses a narrow viewport or phone screen
- Steps:
  1. Open the game on a small viewport.
  2. Observe the HUD elements during play.
- Expected: HUD remains readable without blocking play
- Actual: HUD clusters are fixed-size and may crowd the playfield
- IS: HUD uses fixed positions and sizes
- SHOULD: scale down or stack HUD blocks based on viewport size
- Reasoning: crowded HUD reduces situational awareness at high speed
- Code hints: `src/main.ts` `drawHUD` layout constants
- Acceptance criteria:
  - HUD remains readable at 360px width
  - No overlapping text or bars in the top corners

### TCK-004: Label integrity and wanted indicators more explicitly
- Epic: EPIC-002
- Type: UX
- Severity: S3
- Priority: P3
- Persona: P2
- Scenario: new player tries to interpret the HUD at a glance
- Steps:
  1. Start a run.
  2. Look at the top-left and top-right HUD blocks.
- Expected: clear labels for integrity and wanted level
- Actual: integrity is a % bar; stars lack a "WANTED" label
- IS: labels are implicit and require inference
- SHOULD: add concise labels like "INT" and "WANTED" or icons
- Reasoning: faster comprehension lowers cognitive load during play
- Code hints: `src/main.ts` `drawHUD` labels
- Acceptance criteria:
  - Integrity and wanted are explicitly labeled
  - Labels remain visible across screen sizes

### TCK-005: Add audio cues for collisions and pickups
- Epic: EPIC-003
- Type: UX
- Severity: S3
- Priority: P3
- Persona: P3
- Scenario: player rams traffic and collects power-ups
- Steps:
  1. Collide with traffic at different speeds.
  2. Collect repair/shield/turbo power-ups.
- Expected: distinct audio cues for hits and pickups
- Actual: no audio feedback
- IS: feedback relies only on visuals
- SHOULD: add short SFX for impacts, boost, and pickups with volume control
- Reasoning: audio feedback increases perceived impact and reward
- Code hints: `src/main.ts` collision handling; add audio utility in `src/utils/`
- Acceptance criteria:
  - Distinct SFX play for impact tiers and pickups
  - Audio can be muted

### TCK-006: Add optional haptic feedback on mobile collisions
- Epic: EPIC-003
- Type: UX
- Severity: S4
- Priority: P4
- Persona: P1
- Scenario: mobile player rams traffic
- Steps:
  1. Play on a device that supports vibration.
  2. Collide with traffic at speed.
- Expected: subtle vibration on heavy hits
- Actual: no haptic feedback
- IS: mobile feedback is visual only
- SHOULD: trigger short vibration on slam/crash tiers, with a toggle
- Reasoning: haptics reinforce impact without adding visual clutter
- Code hints: `src/main.ts` collision tier handling; `navigator.vibrate`
- Acceptance criteria:
  - Heavy hits trigger a brief vibration when supported
  - Haptics can be disabled
