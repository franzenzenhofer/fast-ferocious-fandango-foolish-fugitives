# JIRA Tickets

## Personas
- P1: Casual arcade player, wants instant fun, plays on laptop or mobile, short attention span
- P2: Keyboard-first arcade fan, expects WASD/arrow controls and clear bindings
- P3: Returning player/streamer, wants juicy feedback and readable danger

## Tickets

### TCK-001: Default to player control or provide an explicit "Take Control" overlay
- Epic: EPIC-001
- Type: UX
- Severity: S2
- Priority: P1
- Persona: P1
- Scenario: first launch, expects immediate control to drive/ram
- Steps:
  1. Load the game URL.
  2. Observe the car moving without input (demo mode).
- Expected: clear on-screen callout and immediate control option without hunting
- Actual: demo starts automatically; only a small text line indicates "Press D" while gameplay continues
- IS: demo mode starts on load with limited instruction visibility
- SHOULD: start in manual mode or show a prominent overlay with control hint and "Press D to take control"
- Reasoning: first-run confusion reduces fun before the player even drives
- Code hints: `src/main.ts` demo mode defaults; `render` demo overlay text
- Acceptance criteria:
  - New session shows a clear, visible control prompt within 1s
  - Player can take control without leaving the game state

### TCK-002: Resolve KeyD conflict (demo toggle vs. steer right)
- Epic: EPIC-001
- Type: Bug
- Severity: S2
- Priority: P1
- Persona: P2
- Scenario: WASD player tries to steer right after taking control
- Steps:
  1. Press D to take control.
  2. Press D again to steer right.
- Expected: D steers right in manual mode
- Actual: D toggles demo mode instead of steering
- IS: KeyD is bound to demo toggle and blocks standard right steering
- SHOULD: move demo toggle to a different key (e.g., F1) and allow D to steer right
- Reasoning: standard control mappings are expected and breaking them feels glitchy
- Code hints: `src/main.ts` keydown handler for `KeyD`
- Acceptance criteria:
  - D steers right in manual mode
  - Demo toggle uses a non-conflicting key

### TCK-003: Add on-screen control legend (steer/boost/brake)
- Epic: EPIC-001
- Type: UX
- Severity: S3
- Priority: P2
- Persona: P1
- Scenario: player wants to boost or brake but doesn’t know the keys
- Steps:
  1. Start a run and take control.
  2. Look for boost/brake hints.
- Expected: visible hints for Space (boost) and Down/S (brake)
- Actual: only console text mentions demo toggle; no on-screen control legend
- IS: HUD lacks control hints for core actions
- SHOULD: show a small legend or first-run tooltip for boost/brake and steering
- Reasoning: unclear controls reduce experimentation and perceived fun
- Code hints: `src/main.ts` HUD rendering; `drawHUD`
- Acceptance criteria:
  - Controls are visible on-screen on first run
  - Hints can be dismissed or auto-hide after a few seconds

### TCK-004: Add impact-tier feedback (shake/sparks/audio) tied to energy
- Epic: EPIC-002
- Type: UX
- Severity: S3
- Priority: P2
- Persona: P3
- Scenario: player rams traffic and expects a satisfying response
- Steps:
  1. Ram a sedan and a heavier vehicle.
  2. Observe visual feedback for hit strength.
- Expected: stronger hits feel stronger (shake, sparks, hitstop)
- Actual: screen shake is disabled and impact feedback is subtle
- IS: impact intensity is not clearly communicated to the player
- SHOULD: scale shake/particles/flash with impact tier (tap/hit/slam)
- Reasoning: juicy feedback reinforces skill and makes ramming fun
- Code hints: `src/main.ts` collision handling and `render` shake block
- Acceptance criteria:
  - Slam hits produce noticeably stronger feedback than taps
  - Feedback does not obscure gameplay readability

### TCK-005: Add low-integrity warning and brief recovery cue
- Epic: EPIC-003
- Type: UX
- Severity: S2
- Priority: P2
- Persona: P1
- Scenario: integrity drops quickly during mid-heat collisions
- Steps:
  1. Reach heat 0.5+.
  2. Take multiple collisions in short succession.
- Expected: clear warning when near BUSTED and a hint to recover
- Actual: integrity can drop rapidly without an explicit warning cue
- IS: low-integrity state has no special feedback beyond the bar color
- SHOULD: add flashing HUD, audio cue, or brief slowdown when integrity < 20%
- Reasoning: clearer danger signals make losses feel fair, not sudden
- Code hints: `src/main.ts` HUD drawing; integrity thresholds; BUSTED flow
- Acceptance criteria:
  - Low-integrity state is clearly signaled for at least 2 seconds
  - Players report fewer "surprise" BUSTED moments in testing
